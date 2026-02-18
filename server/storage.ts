
import { 
  User, InsertUser, TravelPackage, Reservation, ReservationLog, 
  Testimonial, ContactMessage, users, travelPackages, reservations,
  reservationLogs, testimonials, contactMessages
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, like, and, or, sql, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Packages
  getPackages(filters?: { type?: string; status?: string; search?: string }): Promise<TravelPackage[]>;
  getPackage(id: number): Promise<TravelPackage | undefined>;
  createPackage(pkg: any): Promise<TravelPackage>;
  updatePackage(id: number, pkg: any): Promise<TravelPackage>;
  deletePackage(id: number): Promise<void>;
  
  // Reservations
  getReservations(filters?: { status?: string; code?: string; packageId?: number }): Promise<(Reservation & { package: TravelPackage })[]>;
  getReservation(id: number): Promise<(Reservation & { package: TravelPackage, logs: ReservationLog[] }) | undefined>;
  createReservation(res: any): Promise<Reservation>;
  updateReservationStatus(id: number, status: string, note?: string, rejectionReason?: string, userId?: number): Promise<Reservation>;
  
  // Stats
  getDashboardStats(): Promise<{
    totalReservations: number;
    pendingReservations: number;
    confirmedReservations: number;
    totalRevenue: number;
    activePackages: number;
  }>;
  
  // Contact
  createContactMessage(msg: any): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  
  // Session Store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor(sessionStore: any) {
    this.sessionStore = sessionStore;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Packages
  async getPackages(filters?: { type?: string; status?: string; search?: string }): Promise<TravelPackage[]> {
    const conditions = [];
    if (filters?.type) conditions.push(eq(travelPackages.type, filters.type as any));
    if (filters?.status) conditions.push(eq(travelPackages.status, filters.status as any));
    if (filters?.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(or(
        like(travelPackages.titleEn, searchPattern),
        like(travelPackages.titleFr, searchPattern),
        like(travelPackages.titleAr, searchPattern)
      ));
    }
    
    return await db.select()
      .from(travelPackages)
      .where(and(...conditions))
      .orderBy(desc(travelPackages.createdAt));
  }

  async getPackage(id: number): Promise<TravelPackage | undefined> {
    const [pkg] = await db.select().from(travelPackages).where(eq(travelPackages.id, id));
    return pkg;
  }

  async createPackage(pkg: any): Promise<TravelPackage> {
    const [newPkg] = await db.insert(travelPackages).values(pkg).returning();
    return newPkg;
  }

  async updatePackage(id: number, pkg: any): Promise<TravelPackage> {
    const [updatedPkg] = await db.update(travelPackages)
      .set({ ...pkg, updatedAt: new Date() })
      .where(eq(travelPackages.id, id))
      .returning();
    return updatedPkg;
  }

  async deletePackage(id: number): Promise<void> {
    await db.delete(travelPackages).where(eq(travelPackages.id, id));
  }

  // Reservations
  async getReservations(filters?: { status?: string; code?: string; packageId?: number }): Promise<(Reservation & { package: TravelPackage })[]> {
    const conditions = [];
    if (filters?.status) conditions.push(eq(reservations.status, filters.status as any));
    if (filters?.code) conditions.push(eq(reservations.code, filters.code));
    if (filters?.packageId) conditions.push(eq(reservations.packageId, filters.packageId));

    const result = await db.select({
      reservation: reservations,
      package: travelPackages
    })
    .from(reservations)
    .innerJoin(travelPackages, eq(reservations.packageId, travelPackages.id))
    .where(and(...conditions))
    .orderBy(desc(reservations.createdAt));

    return result.map(r => ({ ...r.reservation, package: r.package }));
  }

  async getReservation(id: number): Promise<(Reservation & { package: TravelPackage, logs: ReservationLog[] }) | undefined> {
    const result = await db.select({
      reservation: reservations,
      package: travelPackages
    })
    .from(reservations)
    .innerJoin(travelPackages, eq(reservations.packageId, travelPackages.id))
    .where(eq(reservations.id, id));

    if (result.length === 0) return undefined;

    const logs = await db.select().from(reservationLogs).where(eq(reservationLogs.reservationId, id)).orderBy(desc(reservationLogs.createdAt));

    return { ...result[0].reservation, package: result[0].package, logs };
  }

  async createReservation(res: any): Promise<Reservation> {
    // Generate Code RHL-YYYY-NNNNN
    const year = new Date().getFullYear();
    const count = (await db.select({ count: sql<number>`count(*)` }).from(reservations))[0].count;
    const code = `RHL-${year}-${String(Number(count) + 1).padStart(5, '0')}`;
    
    const [newRes] = await db.insert(reservations).values({ ...res, code }).returning();
    return newRes;
  }

  async updateReservationStatus(id: number, status: string, note?: string, rejectionReason?: string, userId?: number): Promise<Reservation> {
    const [existingRes] = await db.select().from(reservations).where(eq(reservations.id, id));
    if (!existingRes) throw new Error("Reservation not found");

    const [updatedRes] = await db.update(reservations)
      .set({ 
        status: status as any, 
        rejectionReason,
        notes: note, // update main note
        updatedAt: new Date()
      })
      .where(eq(reservations.id, id))
      .returning();

    // Log the change
    await db.insert(reservationLogs).values({
      reservationId: id,
      userId,
      fromStatus: existingRes.status,
      toStatus: status,
      note
    });

    return updatedRes;
  }

  // Stats
  async getDashboardStats() {
    const [resStats] = await db.select({
      total: sql<number>`count(*)`,
      pending: sql<number>`sum(case when status = 'PENDING' then 1 else 0 end)`,
      confirmed: sql<number>`sum(case when status = 'CONFIRMED' then 1 else 0 end)`,
      revenue: sql<number>`sum(case when status = 'CONFIRMED' then "total_price_dzd" else 0 end)`
    }).from(reservations);

    const [pkgStats] = await db.select({
      active: sql<number>`count(*)`
    }).from(travelPackages).where(eq(travelPackages.status, 'ACTIVE'));

    return {
      totalReservations: Number(resStats.total || 0),
      pendingReservations: Number(resStats.pending || 0),
      confirmedReservations: Number(resStats.confirmed || 0),
      totalRevenue: Number(resStats.revenue || 0),
      activePackages: Number(pkgStats.active || 0)
    };
  }

  // Contact
  async createContactMessage(msg: any): Promise<ContactMessage> {
    const [newMsg] = await db.insert(contactMessages).values(msg).returning();
    return newMsg;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }
}

export const storage = new DatabaseStorage(new PostgresSessionStore({
  pool,
  createTableIfMissing: true,
}));
