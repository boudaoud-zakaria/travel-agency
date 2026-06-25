import { Router } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, activityLogs } from "../schema";
import { generateToken, requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";

const router = Router();

// POST /api/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Contact your administrator." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update last login + activity log — non-critical, don't block login on failure
    try {
      await db.update(users)
        .set({ lastLoginAt: new Date().toISOString() })
        .where(eq(users.id, user.id));

      await db.insert(activityLogs).values({
        userId: user.id,
        employeeName: user.name,
        action: `${user.name} logged in`,
        entityType: "user",
        entityId: user.id,
      });
    } catch (logErr) {
      console.warn("[auth] Could not update last_login_at or activity log:", (logErr as Error).message);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const { password: _pwd, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword, token });
  })
);

// POST /api/auth/logout
router.post("/logout", requireAuth, asyncHandler(async (_req, res) => {
  return res.json({ message: "Logged out successfully" });
}));

// GET /api/auth/me
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: _pwd, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  })
);

// PATCH /api/auth/change-password
router.patch(
  "/change-password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId));
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password: hashed }).where(eq(users.id, user.id));

    return res.json({ message: "Password changed successfully" });
  })
);

// PATCH /api/auth/profile
router.patch(
  "/profile",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, phone, avatar } = req.body;

    const updates: Record<string, unknown> = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;

    await db.update(users).set(updates).where(eq(users.id, req.user!.userId));

    const [updated] = await db.select().from(users).where(eq(users.id, req.user!.userId));
    const { password: _pwd, ...userWithoutPassword } = updated;
    return res.json(userWithoutPassword);
  })
);

export default router;
