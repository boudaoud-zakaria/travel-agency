import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, parseJSON, toJSON } from "../db";
import { employeeSchedules, users, activityLogs } from "../schema";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";

const router = Router();

async function buildScheduleResponse(schedule: typeof employeeSchedules.$inferSelect) {
  const [employee] = await db
    .select({ id: users.id, name: users.name, email: users.email, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, schedule.employeeId));

  return {
    ...schedule,
    packageIds: parseJSON<number[]>(schedule.packageIds, []),
    employee: employee || null,
  };
}

// GET /api/schedules
router.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const employees = await db.select().from(users).where(eq(users.role, "EMPLOYEE"));
    const existingSchedules = await db.select().from(employeeSchedules);
    const scheduledIds = new Set(existingSchedules.map(s => s.employeeId));

    for (const emp of employees) {
      if (!scheduledIds.has(emp.id)) {
        await db.insert(employeeSchedules).values({ employeeId: emp.id });
      }
    }

    const allSchedules = await db.select().from(employeeSchedules);
    const result = await Promise.all(allSchedules.map(buildScheduleResponse));
    return res.json(result);
  })
);

// PUT /api/schedules/:employeeId
router.put(
  "/:employeeId",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const employeeId = parseInt(req.params.employeeId);
    if (isNaN(employeeId)) return res.status(400).json({ message: "Invalid employee ID" });

    const { packageIds, shiftStart, shiftEnd, isOnLeave } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (packageIds !== undefined) updates.packageIds = toJSON(packageIds);
    if (shiftStart !== undefined) updates.shiftStart = shiftStart;
    if (shiftEnd !== undefined) updates.shiftEnd = shiftEnd;
    if (isOnLeave !== undefined) updates.isOnLeave = isOnLeave;

    const existing = await db.select().from(employeeSchedules).where(eq(employeeSchedules.employeeId, employeeId));

    if (existing.length > 0) {
      await db.update(employeeSchedules).set(updates).where(eq(employeeSchedules.employeeId, employeeId));
    } else {
      await db.insert(employeeSchedules).values({
        employeeId,
        packageIds: toJSON(packageIds || []),
        shiftStart: shiftStart || "08:00",
        shiftEnd: shiftEnd || "17:00",
        isOnLeave: isOnLeave || false,
      });
    }

    await db.insert(activityLogs).values({
      userId: req.user!.userId,
      employeeName: req.user!.name,
      action: `Updated schedule for employee ID ${employeeId}`,
      entityType: "user",
      entityId: employeeId,
    });

    const [updated] = await db.select().from(employeeSchedules).where(eq(employeeSchedules.employeeId, employeeId));
    return res.json(await buildScheduleResponse(updated));
  })
);

// PATCH /api/schedules/:employeeId/leave
router.patch(
  "/:employeeId/leave",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const employeeId = parseInt(req.params.employeeId);
    if (isNaN(employeeId)) return res.status(400).json({ message: "Invalid employee ID" });

    const existing = await db.select().from(employeeSchedules).where(eq(employeeSchedules.employeeId, employeeId));
    const currentLeave = existing[0]?.isOnLeave || false;

    if (existing.length > 0) {
      await db.update(employeeSchedules)
        .set({ isOnLeave: !currentLeave, updatedAt: new Date().toISOString() })
        .where(eq(employeeSchedules.employeeId, employeeId));
    } else {
      await db.insert(employeeSchedules).values({ employeeId, isOnLeave: true });
    }

    const [updated] = await db.select().from(employeeSchedules).where(eq(employeeSchedules.employeeId, employeeId));
    return res.json(await buildScheduleResponse(updated));
  })
);

export default router;
