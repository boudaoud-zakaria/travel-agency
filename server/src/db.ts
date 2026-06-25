import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

const dbDir = path.resolve(process.cwd(), ".local");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "database.sqlite");

export const client = createClient({
  url: `file:${dbPath}`,
});

export const db = drizzle(client, { schema });

const TABLES_SQL = [
  `PRAGMA foreign_keys = ON`,

  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'EMPLOYEE',
    avatar TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login_at TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS travel_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_ar TEXT NOT NULL,
    title_fr TEXT NOT NULL,
    title_en TEXT NOT NULL,
    desc_ar TEXT DEFAULT '',
    desc_fr TEXT DEFAULT '',
    desc_en TEXT DEFAULT '',
    destination TEXT NOT NULL,
    type TEXT NOT NULL,
    price_per_person TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    max_capacity INTEGER NOT NULL,
    images TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'DRAFT',
    departure_dates TEXT NOT NULL DEFAULT '[]',
    inclusions TEXT NOT NULL DEFAULT '[]',
    exclusions TEXT NOT NULL DEFAULT '[]',
    requirements TEXT NOT NULL DEFAULT '[]',
    itinerary TEXT NOT NULL DEFAULT '[]',
    rating TEXT DEFAULT '0',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_nin TEXT NOT NULL,
    number_of_travelers INTEGER NOT NULL DEFAULT 1,
    travel_date TEXT NOT NULL,
    total_price_dzd TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    special_requests TEXT,
    rejection_reason TEXT,
    package_id INTEGER NOT NULL REFERENCES travel_packages(id),
    assigned_to_id INTEGER REFERENCES users(id),
    notes TEXT,
    internal_notes TEXT,
    id_card_image TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS reservation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_id INTEGER NOT NULL REFERENCES reservations(id),
    user_id INTEGER REFERENCES users(id),
    from_status TEXT,
    to_status TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    package_id INTEGER REFERENCES travel_packages(id),
    is_approved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS agency_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL DEFAULT 'وكالة سفر جينيوس',
    name_fr TEXT NOT NULL DEFAULT 'Agence de Voyage Genius',
    name_en TEXT NOT NULL DEFAULT 'Genius Travel Agency',
    logo TEXT,
    address TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    social_links TEXT NOT NULL DEFAULT '{}',
    hero_title_ar TEXT,
    hero_title_fr TEXT,
    hero_title_en TEXT,
    hero_subtitle_ar TEXT,
    hero_subtitle_fr TEXT,
    hero_subtitle_en TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS employee_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    package_ids TEXT NOT NULL DEFAULT '[]',
    shift_start TEXT NOT NULL DEFAULT '08:00',
    shift_end TEXT NOT NULL DEFAULT '17:00',
    is_on_leave INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    employee_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    link_to TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS employee_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES users(id),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    handled INTEGER NOT NULL DEFAULT 0,
    confirmed INTEGER NOT NULL DEFAULT 0,
    rejected INTEGER NOT NULL DEFAULT 0,
    avg_handling_time_hours REAL DEFAULT 0,
    confirmation_rate REAL DEFAULT 0,
    performance_score REAL DEFAULT 0,
    UNIQUE(employee_id, month, year)
  )`,

  `CREATE TABLE IF NOT EXISTS custom_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    destination TEXT NOT NULL,
    date_from TEXT NOT NULL,
    date_to TEXT NOT NULL,
    group_size INTEGER NOT NULL DEFAULT 1,
    budget TEXT,
    activity_type TEXT NOT NULL DEFAULT 'custom',
    requirements TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    admin_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
];

export async function initializeDatabase() {
  for (const sql of TABLES_SQL) {
    await client.execute(sql);
  }
  console.log("Database initialized successfully");

  // Bootstrap: create super admin if no users exist (fresh deployment)
  const existing = await client.execute("SELECT COUNT(*) as count FROM users");
  const count = Number((existing.rows[0] as any).count);
  if (count === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@tehwissa213.dz";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
    const hashed = await bcrypt.hash(adminPassword, 10);
    await client.execute({
      sql: `INSERT INTO users (email, password, name, phone, role, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      args: [adminEmail, hashed, "Super Admin", "0550000000", "SUPER_ADMIN"],
    });
    console.log(`\n✅ Super admin created: ${adminEmail} / ${adminPassword}`);
    console.log("   ⚠️  Change the password after first login!\n");
  }
}

// JSON helpers
export function parseJSON<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function toJSON(value: unknown): string {
  return JSON.stringify(value);
}
