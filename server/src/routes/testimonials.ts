import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { testimonials } from "../schema";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";

const router = Router();

// GET /api/testimonials
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const isAdmin = req.query.admin === "true";
    const all = await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
    return res.json(isAdmin ? all : all.filter(t => t.isApproved));
  })
);

// POST /api/testimonials — public
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { clientName, content, rating, packageId } = req.body;

    if (!clientName || !content || !rating) {
      return res.status(400).json({ message: "Client name, content, and rating are required" });
    }

    const [created] = await db
      .insert(testimonials)
      .values({
        clientName,
        content,
        rating: parseInt(rating),
        packageId: packageId ? parseInt(packageId) : null,
        isApproved: false,
      })
      .returning();

    return res.status(201).json(created);
  })
);

// PATCH /api/testimonials/:id/approve — admin only
router.patch(
  "/:id/approve",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const [existing] = await db.select().from(testimonials).where(eq(testimonials.id, id));
    if (!existing) return res.status(404).json({ message: "Testimonial not found" });

    const [updated] = await db
      .update(testimonials)
      .set({ isApproved: req.body.approved !== false })
      .where(eq(testimonials.id, id))
      .returning();

    return res.json(updated);
  })
);

// DELETE /api/testimonials/:id — admin only
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    await db.delete(testimonials).where(eq(testimonials.id, id));
    return res.json({ message: "Testimonial deleted" });
  })
);

export default router;
