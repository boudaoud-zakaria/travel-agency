import { Router } from "express";
import { eq, like, and, or } from "drizzle-orm";
import { db, parseJSON, toJSON } from "../db";
import { travelPackages, activityLogs } from "../schema";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";

const router = Router();

function parsePackage(pkg: typeof travelPackages.$inferSelect) {
  return {
    ...pkg,
    images: parseJSON<string[]>(pkg.images, []),
    departureDates: parseJSON<string[]>(pkg.departureDates, []),
    inclusions: parseJSON<string[]>(pkg.inclusions, []),
    exclusions: parseJSON<string[]>(pkg.exclusions, []),
    requirements: parseJSON<string[]>(pkg.requirements, []),
    itinerary: parseJSON<{ day: number; title: string; description: string }[]>(pkg.itinerary, []),
  };
}

// GET /api/packages
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { type, status, search } = req.query as Record<string, string>;

    const conditions = [];
    if (type) conditions.push(eq(travelPackages.type, type));
    if (status) conditions.push(eq(travelPackages.status, status));
    if (search) {
      conditions.push(
        or(
          like(travelPackages.titleEn, `%${search}%`),
          like(travelPackages.titleFr, `%${search}%`),
          like(travelPackages.titleAr, `%${search}%`),
          like(travelPackages.destination, `%${search}%`)
        )
      );
    }

    const pkgs =
      conditions.length > 0
        ? await db.select().from(travelPackages).where(and(...conditions))
        : await db.select().from(travelPackages);

    return res.json(pkgs.map(parsePackage));
  })
);

// GET /api/packages/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid package ID" });

    const [pkg] = await db.select().from(travelPackages).where(eq(travelPackages.id, id));
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    return res.json(parsePackage(pkg));
  })
);

// POST /api/packages
router.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = req.body;

    const [created] = await db
      .insert(travelPackages)
      .values({
        titleAr: data.titleAr,
        titleFr: data.titleFr,
        titleEn: data.titleEn,
        descAr: data.descAr || "",
        descFr: data.descFr || "",
        descEn: data.descEn || "",
        destination: data.destination,
        type: data.type,
        pricePerPerson: String(data.pricePerPerson),
        durationDays: data.durationDays,
        maxCapacity: data.maxCapacity,
        images: toJSON(data.images || []),
        status: data.status || "DRAFT",
        departureDates: toJSON(data.departureDates || []),
        inclusions: toJSON(data.inclusions || []),
        exclusions: toJSON(data.exclusions || []),
        requirements: toJSON(data.requirements || []),
        itinerary: toJSON(data.itinerary || []),
        rating: "0",
      })
      .returning();

    await db.insert(activityLogs).values({
      userId: req.user!.userId,
      employeeName: req.user!.name,
      action: `Created package: ${created.titleEn}`,
      entityType: "package",
      entityId: created.id,
    });

    return res.status(201).json(parsePackage(created));
  })
);

// PUT /api/packages/:id
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid package ID" });

    const [existing] = await db.select().from(travelPackages).where(eq(travelPackages.id, id));
    if (!existing) return res.status(404).json({ message: "Package not found" });

    const data = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

    if (data.titleAr !== undefined) updates.titleAr = data.titleAr;
    if (data.titleFr !== undefined) updates.titleFr = data.titleFr;
    if (data.titleEn !== undefined) updates.titleEn = data.titleEn;
    if (data.descAr !== undefined) updates.descAr = data.descAr;
    if (data.descFr !== undefined) updates.descFr = data.descFr;
    if (data.descEn !== undefined) updates.descEn = data.descEn;
    if (data.destination !== undefined) updates.destination = data.destination;
    if (data.type !== undefined) updates.type = data.type;
    if (data.pricePerPerson !== undefined) updates.pricePerPerson = String(data.pricePerPerson);
    if (data.durationDays !== undefined) updates.durationDays = data.durationDays;
    if (data.maxCapacity !== undefined) updates.maxCapacity = data.maxCapacity;
    if (data.status !== undefined) updates.status = data.status;
    if (data.images !== undefined) updates.images = toJSON(data.images);
    if (data.departureDates !== undefined) updates.departureDates = toJSON(data.departureDates);
    if (data.inclusions !== undefined) updates.inclusions = toJSON(data.inclusions);
    if (data.exclusions !== undefined) updates.exclusions = toJSON(data.exclusions);
    if (data.requirements !== undefined) updates.requirements = toJSON(data.requirements);
    if (data.itinerary !== undefined) updates.itinerary = toJSON(data.itinerary);

    const [updated] = await db
      .update(travelPackages)
      .set(updates)
      .where(eq(travelPackages.id, id))
      .returning();

    await db.insert(activityLogs).values({
      userId: req.user!.userId,
      employeeName: req.user!.name,
      action: `Updated package: ${updated.titleEn}`,
      entityType: "package",
      entityId: updated.id,
    });

    return res.json(parsePackage(updated));
  })
);

// DELETE /api/packages/:id — soft delete (archive)
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid package ID" });

    const [existing] = await db.select().from(travelPackages).where(eq(travelPackages.id, id));
    if (!existing) return res.status(404).json({ message: "Package not found" });

    await db.update(travelPackages)
      .set({ status: "ARCHIVED", updatedAt: new Date().toISOString() })
      .where(eq(travelPackages.id, id));

    await db.insert(activityLogs).values({
      userId: req.user!.userId,
      employeeName: req.user!.name,
      action: `Archived package: ${existing.titleEn}`,
      entityType: "package",
      entityId: id,
    });

    return res.json({ message: "Package archived successfully" });
  })
);

export default router;
