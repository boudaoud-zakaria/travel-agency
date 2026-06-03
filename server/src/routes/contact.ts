import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { contactMessages } from "../schema";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";

const router = Router();

// POST /api/contact — public
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Name, email, subject, and message are required" });
    }

    const [created] = await db
      .insert(contactMessages)
      .values({ name, email, phone, subject, message })
      .returning();

    return res.status(201).json(created);
  })
);

// GET /api/contact — admin only
router.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const messages = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));

    return res.json(messages);
  })
);

// PATCH /api/contact/:id/read — admin only
router.patch(
  "/:id/read",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const [msg] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    if (!msg) return res.status(404).json({ message: "Message not found" });

    await db.update(contactMessages).set({ isRead: true }).where(eq(contactMessages.id, id));
    return res.json({ message: "Marked as read" });
  })
);

// DELETE /api/contact/:id — admin only
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return res.json({ message: "Message deleted" });
  })
);

export default router;
