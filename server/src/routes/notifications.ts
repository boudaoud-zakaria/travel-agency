import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { notifications } from "../schema";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";

const router = Router();

// GET /api/notifications
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userNotifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, req.user!.userId))
      .orderBy(desc(notifications.createdAt));

    return res.json(userNotifs.slice(0, 50));
  })
);

// PATCH /api/notifications/read-all  (must be before /:id route)
router.patch(
  "/read-all",
  requireAuth,
  asyncHandler(async (req, res) => {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, req.user!.userId));

    return res.json({ message: "All notifications marked as read" });
  })
);

// PATCH /api/notifications/:id/read
router.patch(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const [notif] = await db.select().from(notifications).where(eq(notifications.id, id));
    if (!notif) return res.status(404).json({ message: "Notification not found" });

    if (notif.userId !== req.user!.userId) return res.status(403).json({ message: "Access denied" });

    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));

    return res.json({ message: "Marked as read" });
  })
);

export default router;
