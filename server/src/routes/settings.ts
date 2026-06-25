import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, parseJSON, toJSON } from "../db";
import { agencySettings, activityLogs } from "../schema";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";

const router = Router();

function parseSettings(s: typeof agencySettings.$inferSelect) {
  return {
    ...s,
    socialLinks: parseJSON<Record<string, string>>(s.socialLinks, {}),
  };
}

// GET /api/settings — public
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const all = await db.select().from(agencySettings);

    if (all.length === 0) {
      const [created] = await db.insert(agencySettings).values({}).returning();
      return res.json(parseSettings(created));
    }

    return res.json(parseSettings(all[0]));
  })
);

// PUT /api/settings — admin only
router.put(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const {
      nameAr, nameFr, nameEn, logo, address, phone, email, socialLinks,
      heroTitleAr, heroTitleFr, heroTitleEn,
      heroSubtitleAr, heroSubtitleFr, heroSubtitleEn,
    } = req.body;

    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

    if (nameAr !== undefined) updates.nameAr = nameAr;
    if (nameFr !== undefined) updates.nameFr = nameFr;
    if (nameEn !== undefined) updates.nameEn = nameEn;
    if (logo !== undefined) updates.logo = logo;
    if (address !== undefined) updates.address = address;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (socialLinks !== undefined) updates.socialLinks = toJSON(socialLinks);
    if (heroTitleAr !== undefined) updates.heroTitleAr = heroTitleAr;
    if (heroTitleFr !== undefined) updates.heroTitleFr = heroTitleFr;
    if (heroTitleEn !== undefined) updates.heroTitleEn = heroTitleEn;
    if (heroSubtitleAr !== undefined) updates.heroSubtitleAr = heroSubtitleAr;
    if (heroSubtitleFr !== undefined) updates.heroSubtitleFr = heroSubtitleFr;
    if (heroSubtitleEn !== undefined) updates.heroSubtitleEn = heroSubtitleEn;

    const existing = await db.select().from(agencySettings);

    let updated;
    if (existing.length > 0) {
      [updated] = await db.update(agencySettings).set(updates).where(eq(agencySettings.id, existing[0].id)).returning();
    } else {
      [updated] = await db.insert(agencySettings).values(updates as any).returning();
    }

    await db.insert(activityLogs).values({
      userId: req.user!.userId,
      employeeName: req.user!.name,
      action: "Updated agency settings",
      entityType: "settings",
    });

    return res.json(parseSettings(updated));
  })
);

export default router;
