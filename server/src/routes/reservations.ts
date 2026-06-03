import { Router } from "express";
import { eq, and, like, or, asc } from "drizzle-orm";
import { db } from "../db";
import {
  reservations, users, travelPackages, reservationLogs,
  activityLogs, notifications, employeeSchedules,
} from "../schema";
import { requireAuth, requireEmployee } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";

const router = Router();

function generateCode(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const random = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `TG${year}-${random}`;
}

async function autoAssignEmployee(): Promise<number | null> {
  const activeEmployees = await db
    .select()
    .from(users)
    .where(and(eq(users.role, "EMPLOYEE"), eq(users.isActive, true)));

  if (activeEmployees.length === 0) return null;

  const schedules = await db.select().from(employeeSchedules);
  const onLeaveIds = new Set(schedules.filter(s => s.isOnLeave).map(s => s.employeeId));
  const available = activeEmployees.filter(e => !onLeaveIds.has(e.id));
  if (available.length === 0) return null;

  const pendingRes = await db.select().from(reservations).where(eq(reservations.status, "PENDING"));
  const countMap = new Map<number, number>();
  for (const e of available) countMap.set(e.id, 0);
  for (const r of pendingRes) {
    if (r.assignedToId && countMap.has(r.assignedToId)) {
      countMap.set(r.assignedToId, (countMap.get(r.assignedToId) || 0) + 1);
    }
  }

  let minCount = Infinity;
  let chosenId: number | null = null;
  for (const [empId, count] of countMap) {
    if (count < minCount) { minCount = count; chosenId = empId; }
  }
  return chosenId;
}

async function buildReservationResponse(reservation: typeof reservations.$inferSelect) {
  const [pkg] = await db
    .select({
      id: travelPackages.id, titleEn: travelPackages.titleEn,
      titleAr: travelPackages.titleAr, titleFr: travelPackages.titleFr,
      destination: travelPackages.destination, pricePerPerson: travelPackages.pricePerPerson,
      type: travelPackages.type,
    })
    .from(travelPackages)
    .where(eq(travelPackages.id, reservation.packageId));

  let assignedTo = null;
  if (reservation.assignedToId) {
    const [emp] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, reservation.assignedToId));
    assignedTo = emp || null;
  }

  return { ...reservation, package: pkg || null, assignedTo };
}

// GET /api/reservations
router.get(
  "/",
  requireAuth,
  requireEmployee,
  asyncHandler(async (req, res) => {
    const { status, assignedToId, search, packageId } = req.query as Record<string, string>;

    let allRes = await db.select().from(reservations).orderBy(asc(reservations.createdAt));

    if (req.user!.role === "EMPLOYEE") {
      allRes = allRes.filter(r => r.assignedToId === req.user!.userId);
    } else if (assignedToId) {
      allRes = allRes.filter(r => r.assignedToId === parseInt(assignedToId));
    }

    if (status) allRes = allRes.filter(r => r.status === status);
    if (packageId) allRes = allRes.filter(r => r.packageId === parseInt(packageId));
    if (search) {
      const s = search.toLowerCase();
      allRes = allRes.filter(
        r =>
          r.clientName.toLowerCase().includes(s) ||
          r.code.toLowerCase().includes(s) ||
          r.clientEmail.toLowerCase().includes(s)
      );
    }

    const result = await Promise.all(allRes.map(buildReservationResponse));
    return res.json(result);
  })
);

// GET /api/reservations/code/:code — public
router.get(
  "/code/:code",
  asyncHandler(async (req, res) => {
    const [reservation] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.code, req.params.code.toUpperCase()));

    if (!reservation) return res.status(404).json({ message: "Reservation not found" });
    return res.json(await buildReservationResponse(reservation));
  })
);

// GET /api/reservations/:id
router.get(
  "/:id",
  requireAuth,
  requireEmployee,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    if (req.user!.role === "EMPLOYEE" && reservation.assignedToId !== req.user!.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const logs = await db
      .select()
      .from(reservationLogs)
      .where(eq(reservationLogs.reservationId, id))
      .orderBy(asc(reservationLogs.createdAt));

    return res.json({ ...await buildReservationResponse(reservation), logs });
  })
);

// POST /api/reservations — public
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const {
      clientName, clientEmail, clientPhone, clientNIN,
      numberOfTravelers, travelDate, totalPriceDZD,
      packageId, specialRequests, idCardImage,
    } = req.body;

    if (!clientName || !clientEmail || !clientPhone || !clientNIN || !packageId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [pkg] = await db.select().from(travelPackages).where(eq(travelPackages.id, parseInt(packageId)));
    if (!pkg) return res.status(404).json({ message: "Package not found" });
    if (pkg.status !== "ACTIVE") return res.status(400).json({ message: "Package is not available for booking" });

    let code = generateCode();
    let codeExists = await db.select().from(reservations).where(eq(reservations.code, code));
    while (codeExists.length > 0) {
      code = generateCode();
      codeExists = await db.select().from(reservations).where(eq(reservations.code, code));
    }

    const assignedToId = await autoAssignEmployee();

    const [created] = await db
      .insert(reservations)
      .values({
        code,
        clientName,
        clientEmail,
        clientPhone,
        clientNIN,
        numberOfTravelers: parseInt(numberOfTravelers) || 1,
        travelDate: typeof travelDate === "string" ? travelDate : new Date(travelDate).toISOString(),
        totalPriceDZD: String(totalPriceDZD),
        packageId: parseInt(packageId),
        assignedToId,
        specialRequests,
        idCardImage,
        status: "PENDING",
      })
      .returning();

    await db.insert(reservationLogs).values({
      reservationId: created.id,
      toStatus: "PENDING",
      note: "Reservation created",
    });

    if (assignedToId) {
      await db.insert(notifications).values({
        userId: assignedToId,
        type: "reservation_assigned",
        title: "New Reservation Assigned",
        message: `Reservation ${code} from ${clientName} has been assigned to you.`,
        linkTo: `/employee/reservations`,
      });
    }

    return res.status(201).json(await buildReservationResponse(created));
  })
);

// PATCH /api/reservations/:id/status
router.patch(
  "/:id/status",
  requireAuth,
  requireEmployee,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const { status, note, rejectionReason } = req.body;
    const validStatuses = ["PENDING", "IN_REVIEW", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    if (req.user!.role === "EMPLOYEE" && reservation.assignedToId !== req.user!.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updates: Record<string, unknown> = { status, updatedAt: new Date().toISOString() };
    if (rejectionReason) updates.rejectionReason = rejectionReason;

    const [updated] = await db
      .update(reservations)
      .set(updates)
      .where(eq(reservations.id, id))
      .returning();

    await db.insert(reservationLogs).values({
      reservationId: id,
      userId: req.user!.userId,
      fromStatus: reservation.status,
      toStatus: status,
      note: note || rejectionReason,
    });

    await db.insert(activityLogs).values({
      userId: req.user!.userId,
      employeeName: req.user!.name,
      action: `Changed reservation ${reservation.code} from ${reservation.status} to ${status}`,
      entityType: "reservation",
      entityId: id,
    });

    const admins = await db.select().from(users).where(eq(users.role, "SUPER_ADMIN"));
    for (const admin of admins) {
      await db.insert(notifications).values({
        userId: admin.id,
        type: "reservation_status_changed",
        title: "Reservation Status Updated",
        message: `Reservation ${reservation.code} changed to ${status} by ${req.user!.name}`,
        linkTo: `/admin/reservations`,
      });
    }

    return res.json(await buildReservationResponse(updated));
  })
);

// PUT /api/reservations/:id — update notes / reassign
router.put(
  "/:id",
  requireAuth,
  requireEmployee,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    if (req.user!.role === "EMPLOYEE" && reservation.assignedToId !== req.user!.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { notes, internalNotes, assignedToId } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

    if (notes !== undefined) updates.notes = notes;
    if (internalNotes !== undefined) updates.internalNotes = internalNotes;
    if (assignedToId !== undefined && req.user!.role === "SUPER_ADMIN") {
      updates.assignedToId = assignedToId;
      if (assignedToId) {
        await db.insert(notifications).values({
          userId: assignedToId,
          type: "reservation_assigned",
          title: "Reservation Assigned",
          message: `Reservation ${reservation.code} has been assigned to you.`,
          linkTo: `/employee/reservations`,
        });
      }
    }

    const [updated] = await db
      .update(reservations)
      .set(updates)
      .where(eq(reservations.id, id))
      .returning();

    return res.json(await buildReservationResponse(updated));
  })
);

// DELETE /api/reservations/:id — cancel
router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    if (req.user!.role === "EMPLOYEE" && reservation.assignedToId !== req.user!.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await db.update(reservations)
      .set({ status: "CANCELLED", updatedAt: new Date().toISOString() })
      .where(eq(reservations.id, id));

    await db.insert(reservationLogs).values({
      reservationId: id,
      userId: req.user!.userId,
      fromStatus: reservation.status,
      toStatus: "CANCELLED",
      note: "Cancelled by " + req.user!.name,
    });

    return res.json({ message: "Reservation cancelled" });
  })
);

export default router;
