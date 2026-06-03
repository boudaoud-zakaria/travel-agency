import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { activityLogs } from "../schema";
import { requireAuth, requireEmployee } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";

const router = Router();

// GET /api/activity-logs
router.get(
  "/",
  requireAuth,
  requireEmployee,
  asyncHandler(async (req, res) => {
    const { employeeId, limit } = req.query as Record<string, string>;

    let logs = await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt));

    if (employeeId) {
      const empId = parseInt(employeeId);
      logs = logs.filter(l => l.userId === empId);
    }

    const maxItems = limit ? parseInt(limit) : 100;
    return res.json(logs.slice(0, maxItems));
  })
);

export default router;
