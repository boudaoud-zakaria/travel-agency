import { Router } from "express";
import { eq, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users, reservations, activityLogs, employeeSchedules, notifications } from "../schema";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";

const router = Router();

async function buildEmployeeProfile(user: typeof users.$inferSelect) {
  const allRes = await db.select().from(reservations).where(eq(reservations.assignedToId, user.id));
  const pending = allRes.filter(r => r.status === "PENDING").length;
  const confirmed = allRes.filter(r => r.status === "CONFIRMED").length;
  const rejected = allRes.filter(r => r.status === "REJECTED").length;
  const total = allRes.length;
  const score = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  const [schedule] = await db.select().from(employeeSchedules).where(eq(employeeSchedules.employeeId, user.id));
  const { password: _pwd, ...userWithoutPassword } = user;

  return {
    ...userWithoutPassword,
    initials: user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
    pendingCount: pending,
    confirmedCount: confirmed,
    rejectedCount: rejected,
    totalHandled: total,
    score,
    isOnLeave: schedule?.isOnLeave || false,
  };
}

// GET /api/employees
router.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const employees = await db.select().from(users).where(ne(users.role, "CLIENT"));
    const profiles = await Promise.all(employees.map(buildEmployeeProfile));
    return res.json(profiles);
  })
);

// GET /api/employees/:id
router.get(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return res.status(404).json({ message: "Employee not found" });

    return res.json(await buildEmployeeProfile(user));
  })
);

// POST /api/employees
router.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (existing.length > 0) return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const [created] = await db
      .insert(users)
      .values({ name, email: email.toLowerCase(), password: hashed, phone, role: role || "EMPLOYEE", isActive: true })
      .returning();

    await db.insert(employeeSchedules).values({ employeeId: created.id });

    await db.insert(activityLogs).values({
      userId: req.user!.userId,
      employeeName: req.user!.name,
      action: `Created employee account: ${created.name}`,
      entityType: "user",
      entityId: created.id,
    });

    return res.status(201).json(await buildEmployeeProfile(created));
  })
);

// PUT /api/employees/:id
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const [existing] = await db.select().from(users).where(eq(users.id, id));
    if (!existing) return res.status(404).json({ message: "Employee not found" });

    const { name, email, phone, role, password } = req.body;
    const updates: Record<string, unknown> = {};

    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (phone !== undefined) updates.phone = phone;
    if (role) updates.role = role;
    if (password && password.length >= 6) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();

    await db.insert(activityLogs).values({
      userId: req.user!.userId,
      employeeName: req.user!.name,
      action: `Updated employee: ${updated.name}`,
      entityType: "user",
      entityId: updated.id,
    });

    return res.json(await buildEmployeeProfile(updated));
  })
);

// PATCH /api/employees/:id/status — toggle active/inactive
router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const [existing] = await db.select().from(users).where(eq(users.id, id));
    if (!existing) return res.status(404).json({ message: "Employee not found" });

    const [updated] = await db
      .update(users)
      .set({ isActive: !existing.isActive })
      .where(eq(users.id, id))
      .returning();

    const action = updated.isActive ? "Activated" : "Deactivated";
    await db.insert(activityLogs).values({
      userId: req.user!.userId,
      employeeName: req.user!.name,
      action: `${action} employee: ${updated.name}`,
      entityType: "user",
      entityId: updated.id,
    });

    if (!updated.isActive) {
      await db.insert(notifications).values({
        userId: updated.id,
        type: "system_announcement",
        title: "Account Deactivated",
        message: "Your account has been deactivated by an administrator.",
        linkTo: null,
      });
    }

    return res.json(await buildEmployeeProfile(updated));
  })
);

// DELETE /api/employees/:id — soft delete
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const [existing] = await db.select().from(users).where(eq(users.id, id));
    if (!existing) return res.status(404).json({ message: "Employee not found" });

    if (id === req.user!.userId) return res.status(400).json({ message: "Cannot delete your own account" });

    await db.update(users).set({ isActive: false }).where(eq(users.id, id));

    await db.insert(activityLogs).values({
      userId: req.user!.userId,
      employeeName: req.user!.name,
      action: `Deleted employee: ${existing.name}`,
      entityType: "user",
      entityId: id,
    });

    return res.json({ message: "Employee removed successfully" });
  })
);

export default router;
