import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("EMPLOYEE"), // EMPLOYEE | SUPER_ADMIN | CLIENT
  avatar: text("avatar"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  lastLoginAt: text("last_login_at"),
});

export const travelPackages = sqliteTable("travel_packages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  titleAr: text("title_ar").notNull(),
  titleFr: text("title_fr").notNull(),
  titleEn: text("title_en").notNull(),
  descAr: text("desc_ar").default(""),
  descFr: text("desc_fr").default(""),
  descEn: text("desc_en").default(""),
  destination: text("destination").notNull(),
  type: text("type").notNull(), // HAJJ | UMRAH | DOMESTIC | INTERNATIONAL
  pricePerPerson: text("price_per_person").notNull(),
  durationDays: integer("duration_days").notNull(),
  maxCapacity: integer("max_capacity").notNull(),
  images: text("images").notNull().default("[]"),        // JSON string[]
  status: text("status").notNull().default("DRAFT"),     // ACTIVE | DRAFT | ARCHIVED
  departureDates: text("departure_dates").notNull().default("[]"), // JSON string[]
  inclusions: text("inclusions").notNull().default("[]"),          // JSON string[]
  exclusions: text("exclusions").notNull().default("[]"),          // JSON string[]
  requirements: text("requirements").notNull().default("[]"),      // JSON string[]
  itinerary: text("itinerary").notNull().default("[]"),            // JSON {day,title,description}[]
  rating: text("rating").default("0"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const reservations = sqliteTable("reservations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").notNull(),
  clientNIN: text("client_nin").notNull(),
  numberOfTravelers: integer("number_of_travelers").notNull().default(1),
  travelDate: text("travel_date").notNull(),
  totalPriceDZD: text("total_price_dzd").notNull(),
  status: text("status").notNull().default("PENDING"),
  specialRequests: text("special_requests"),
  rejectionReason: text("rejection_reason"),
  packageId: integer("package_id").notNull().references(() => travelPackages.id),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  idCardImage: text("id_card_image"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const reservationLogs = sqliteTable("reservation_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reservationId: integer("reservation_id").notNull().references(() => reservations.id),
  userId: integer("user_id").references(() => users.id),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  note: text("note"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientName: text("client_name").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull().default(5),
  packageId: integer("package_id").references(() => travelPackages.id),
  isApproved: integer("is_approved", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const contactMessages = sqliteTable("contact_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const agencySettings = sqliteTable("agency_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameAr: text("name_ar").notNull().default("وكالة سفر جينيوس"),
  nameFr: text("name_fr").notNull().default("Agence de Voyage Genius"),
  nameEn: text("name_en").notNull().default("Genius Travel Agency"),
  logo: text("logo"),
  address: text("address").default(""),
  phone: text("phone").default(""),
  email: text("email").default(""),
  socialLinks: text("social_links").notNull().default("{}"), // JSON
  heroTitleAr: text("hero_title_ar"),
  heroTitleFr: text("hero_title_fr"),
  heroTitleEn: text("hero_title_en"),
  heroSubtitleAr: text("hero_subtitle_ar"),
  heroSubtitleFr: text("hero_subtitle_fr"),
  heroSubtitleEn: text("hero_subtitle_en"),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const employeeSchedules = sqliteTable("employee_schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  employeeId: integer("employee_id").notNull().unique().references(() => users.id),
  packageIds: text("package_ids").notNull().default("[]"), // JSON number[]
  shiftStart: text("shift_start").notNull().default("08:00"),
  shiftEnd: text("shift_end").notNull().default("17:00"),
  isOnLeave: integer("is_on_leave", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const activityLogs = sqliteTable("activity_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  employeeName: text("employee_name"),
  action: text("action").notNull(),
  entityType: text("entity_type"), // reservation | package | user | settings
  entityId: integer("entity_id"),
  details: text("details"), // JSON extra info
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // reservation_assigned | reservation_status_changed | system_announcement
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  linkTo: text("link_to"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const employeeStats = sqliteTable("employee_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  employeeId: integer("employee_id").notNull().references(() => users.id),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  handled: integer("handled").notNull().default(0),
  confirmed: integer("confirmed").notNull().default(0),
  rejected: integer("rejected").notNull().default(0),
  avgHandlingTimeHours: real("avg_handling_time_hours").default(0),
  confirmationRate: real("confirmation_rate").default(0),
  performanceScore: real("performance_score").default(0),
});

// PENDING | REVIEWING | QUOTED | ACCEPTED | REJECTED
export const customRequests = sqliteTable("custom_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  destination: text("destination").notNull(),
  dateFrom: text("date_from").notNull(),
  dateTo: text("date_to").notNull(),
  groupSize: integer("group_size").notNull().default(1),
  budget: text("budget"),
  activityType: text("activity_type").notNull().default("custom"),
  requirements: text("requirements"),
  message: text("message").notNull(),
  status: text("status").notNull().default("PENDING"),
  adminNotes: text("admin_notes"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});
