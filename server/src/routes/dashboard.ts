import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { reservations, users, travelPackages } from "../schema";
import { requireAuth, requireAdmin, requireEmployee } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";

const router = Router();

// GET /api/stats/dashboard
router.get(
  "/dashboard",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [allReservations, allPackages, allEmployees] = await Promise.all([
      db.select().from(reservations),
      db.select().from(travelPackages),
      db.select().from(users).where(eq(users.role, "EMPLOYEE")),
    ]);

    const totalRevenue = allReservations
      .filter(r => r.status === "CONFIRMED" || r.status === "COMPLETED")
      .reduce((sum, r) => sum + parseFloat(r.totalPriceDZD || "0"), 0);

    const statusCounts: Record<string, number> = {
      PENDING: 0, IN_REVIEW: 0, CONFIRMED: 0,
      REJECTED: 0, CANCELLED: 0, COMPLETED: 0,
    };
    for (const r of allReservations) {
      if (r.status in statusCounts) statusCounts[r.status]++;
    }

    // Monthly revenue — last 12 months
    const now = new Date();
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toISOString().slice(0, 7);
      const monthRes = allReservations.filter(
        r =>
          (r.status === "CONFIRMED" || r.status === "COMPLETED") &&
          r.createdAt.startsWith(monthStr)
      );
      monthlyData.push({
        month: d.toLocaleString("en-US", { month: "short" }),
        year: d.getFullYear(),
        revenue: monthRes.reduce((s, r) => s + parseFloat(r.totalPriceDZD || "0"), 0),
        reservations: monthRes.length,
      });
    }

    // Employee workload
    const employeeWorkload = allEmployees.map(e => ({
      id: e.id,
      name: e.name,
      pending: allReservations.filter(r => r.assignedToId === e.id && r.status === "PENDING").length,
      confirmed: allReservations.filter(r => r.assignedToId === e.id && r.status === "CONFIRMED").length,
      total: allReservations.filter(r => r.assignedToId === e.id).length,
    }));

    // Top packages
    const topPackages = allPackages
      .map(p => {
        const pkgRes = allReservations.filter(r => r.packageId === p.id);
        return {
          id: p.id,
          titleEn: p.titleEn,
          count: pkgRes.length,
          revenue: pkgRes
            .filter(r => r.status === "CONFIRMED" || r.status === "COMPLETED")
            .reduce((s, r) => s + parseFloat(r.totalPriceDZD || "0"), 0),
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.json({
      totalReservations: allReservations.length,
      pendingReservations: statusCounts.PENDING,
      confirmedReservations: statusCounts.CONFIRMED,
      totalRevenue,
      activePackages: allPackages.filter(p => p.status === "ACTIVE").length,
      totalPackages: allPackages.length,
      activeEmployees: allEmployees.filter(e => e.isActive).length,
      totalEmployees: allEmployees.length,
      statusCounts,
      monthlyData,
      employeeWorkload,
      topPackages,
    });
  })
);

// GET /api/stats/employee/:id
router.get(
  "/employee/:id",
  requireAuth,
  requireEmployee,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    if (req.user!.role === "EMPLOYEE" && req.user!.userId !== id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const year = parseInt((req.query.year as string) || String(new Date().getFullYear()));
    const allRes = await db.select().from(reservations).where(eq(reservations.assignedToId, id));

    const monthlyStats = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthRes = allRes.filter(r => {
        const d = new Date(r.createdAt);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });
      const confirmed = monthRes.filter(r => r.status === "CONFIRMED" || r.status === "COMPLETED").length;
      const rejected = monthRes.filter(r => r.status === "REJECTED").length;
      const handled = monthRes.length;
      const confirmationRate = handled > 0 ? Math.round((confirmed / handled) * 100) : 0;

      return {
        month, year, handled, confirmed, rejected,
        avgHandlingTimeHours: 0,
        confirmationRate,
        performanceScore: Math.min(100, confirmationRate + (handled > 10 ? 10 : handled)),
      };
    });

    const yearRes = allRes.filter(r => new Date(r.createdAt).getFullYear() === year);
    const totalHandled = yearRes.length;
    const totalConfirmed = yearRes.filter(r => r.status === "CONFIRMED" || r.status === "COMPLETED").length;
    const confirmationRate = totalHandled > 0 ? Math.round((totalConfirmed / totalHandled) * 100) : 0;
    const bestMonth = monthlyStats.reduce((b, m) => (m.performanceScore > b.performanceScore ? m : b), monthlyStats[0]);

    return res.json({
      employeeId: id, year, monthlyStats,
      summary: { totalHandled, totalConfirmed, confirmationRate, avgPerformanceScore: confirmationRate, bestMonth: bestMonth.month },
    });
  })
);

export default router;
