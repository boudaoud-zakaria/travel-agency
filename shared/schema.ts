
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoles = ["EMPLOYEE", "SUPER_ADMIN", "CLIENT"] as const;
export const packageTypes = ["HAJJ", "UMRAH", "DOMESTIC", "INTERNATIONAL"] as const;
export const reservationStatus = ["PENDING", "IN_REVIEW", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"] as const;
export const packageStatus = ["ACTIVE", "DRAFT", "ARCHIVED"] as const;

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role", { enum: userRoles }).default("CLIENT").notNull(),
  avatar: text("avatar"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Travel Packages Table
export const travelPackages = pgTable("travel_packages", {
  id: serial("id").primaryKey(),
  titleAr: text("title_ar").notNull(),
  titleFr: text("title_fr").notNull(),
  titleEn: text("title_en").notNull(),
  descAr: text("desc_ar").notNull(),
  descFr: text("desc_fr").notNull(),
  descEn: text("desc_en").notNull(),
  destination: text("destination").notNull(),
  type: text("type", { enum: packageTypes }).notNull(),
  pricePerPerson: decimal("price_per_person").notNull(), // stored as string in JS, numeric in DB
  durationDays: integer("duration_days").notNull(),
  maxCapacity: integer("max_capacity").notNull(),
  images: jsonb("images").$type<string[]>().notNull(), // Array of image URLs
  status: text("status", { enum: packageStatus }).default("DRAFT").notNull(),
  departureDates: jsonb("departure_dates").$type<string[]>().notNull(), // Array of ISO date strings
  inclusions: jsonb("inclusions").$type<string[]>().notNull(),
  exclusions: jsonb("exclusions").$type<string[]>().notNull(),
  itinerary: jsonb("itinerary").$type<{day: number, title: string, description: string}[]>().notNull(),
  rating: decimal("rating").default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reservations Table
export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  code: text("code").unique().notNull(), // RHL-YYYY-NNNNN
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").notNull(),
  clientNIN: text("client_nin").notNull(), // Algerian 18-digit ID
  numberOfTravelers: integer("number_of_travelers").notNull(),
  travelDate: timestamp("travel_date").notNull(),
  totalPriceDZD: decimal("total_price_dzd").notNull(),
  status: text("status", { enum: reservationStatus }).default("PENDING").notNull(),
  specialRequests: text("special_requests"),
  rejectionReason: text("rejection_reason"),
  packageId: integer("package_id").notNull(),
  assignedToId: integer("assigned_to_id"), // Employee ID
  userId: integer("user_id"), // Optional: link to registered user if they have an account
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reservation Logs Table
export const reservationLogs = pgTable("reservation_logs", {
  id: serial("id").primaryKey(),
  reservationId: integer("reservation_id").notNull(),
  userId: integer("user_id"), // Who made the change (Employee/Admin)
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Testimonials Table
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  packageId: integer("package_id"),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contact Messages Table
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Agency Settings Table
export const agencySettings = pgTable("agency_settings", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en").notNull(),
  logo: text("logo"),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  socialLinks: jsonb("social_links").$type<{facebook?: string, instagram?: string, twitter?: string}>(),
  heroTitleAr: text("hero_title_ar"),
  heroTitleFr: text("hero_title_fr"),
  heroTitleEn: text("hero_title_en"),
  heroSubtitleAr: text("hero_subtitle_ar"),
  heroSubtitleFr: text("hero_subtitle_fr"),
  heroSubtitleEn: text("hero_subtitle_en"),
});

// Relations
export const reservationsRelations = relations(reservations, ({ one, many }) => ({
  package: one(travelPackages, {
    fields: [reservations.packageId],
    references: [travelPackages.id],
  }),
  assignedTo: one(users, {
    fields: [reservations.assignedToId],
    references: [users.id],
  }),
  logs: many(reservationLogs),
}));

export const reservationLogsRelations = relations(reservationLogs, ({ one }) => ({
  reservation: one(reservations, {
    fields: [reservationLogs.reservationId],
    references: [reservations.id],
  }),
  user: one(users, {
    fields: [reservationLogs.userId],
    references: [users.id],
  }),
}));

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  package: one(travelPackages, {
    fields: [testimonials.packageId],
    references: [travelPackages.id],
  }),
}));

// Zod Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPackageSchema = createInsertSchema(travelPackages).omit({ id: true, createdAt: true, updatedAt: true, rating: true });
export const insertReservationSchema = createInsertSchema(reservations).omit({ id: true, createdAt: true, updatedAt: true, code: true, status: true, assignedToId: true, rejectionReason: true, notes: true });
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true, createdAt: true, isApproved: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true, isRead: true });

// Types
export type User = typeof users.$inferSelect;
export type TravelPackage = typeof travelPackages.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
export type ReservationLog = typeof reservationLogs.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
