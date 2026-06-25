import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { customRequests } from "../schema";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";

const router = Router();

// POST /api/custom-requests — public, client submits a personalized outing request
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const {
      name, email, phone, destination,
      dateFrom, dateTo, groupSize, budget,
      activityType, requirements, message,
    } = req.body;

    if (!name || !email || !phone || !destination || !dateFrom || !dateTo || !message) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const [created] = await db.insert(customRequests).values({
      name,
      email,
      phone,
      destination,
      dateFrom,
      dateTo,
      groupSize: Number(groupSize) || 1,
      budget: budget || null,
      activityType: activityType || "custom",
      requirements: requirements || null,
      message,
      status: "PENDING",
    }).returning();

    return res.status(201).json(created);
  })
);

// GET /api/custom-requests — admin only
router.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const requests = await db
      .select()
      .from(customRequests)
      .orderBy(desc(customRequests.createdAt));
    return res.json(requests);
  })
);

// GET /api/custom-requests/:id — admin only
router.get(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const [item] = await db.select().from(customRequests).where(eq(customRequests.id, id));
    if (!item) return res.status(404).json({ message: "Request not found" });

    return res.json(item);
  })
);

// PATCH /api/custom-requests/:id — admin updates status / notes
router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const { status, adminNotes } = req.body;
    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const [updated] = await db
      .update(customRequests)
      .set(updates)
      .where(eq(customRequests.id, id))
      .returning();

    if (!updated) return res.status(404).json({ message: "Request not found" });
    return res.json(updated);
  })
);

// DELETE /api/custom-requests/:id — admin hard delete
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    await db.delete(customRequests).where(eq(customRequests.id, id));
    return res.json({ message: "Request deleted" });
  })
);

export default router;
