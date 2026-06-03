
import { z } from "zod";

// Enums
export const userRoles = ["EMPLOYEE", "SUPER_ADMIN", "CLIENT"] as const;
export const packageTypes = ["HAJJ", "UMRAH", "DOMESTIC", "INTERNATIONAL"] as const;
export const reservationStatus = ["PENDING", "IN_REVIEW", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"] as const;
export const packageStatus = ["ACTIVE", "DRAFT", "ARCHIVED"] as const;

// Types based on the structure
export type User = {
  id: number;
  email: string;
  password?: string;
  name: string;
  phone?: string;
  role: typeof userRoles[number];
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
};

export type TravelPackage = {
  id: number;
  titleAr: string;
  titleFr: string;
  titleEn: string;
  descAr: string;
  descFr: string;
  descEn: string;
  destination: string;
  type: typeof packageTypes[number];
  pricePerPerson: string;
  durationDays: number;
  maxCapacity: number;
  images: string[];
  status: typeof packageStatus[number];
  departureDates: string[];
  inclusions: string[];
  exclusions: string[];
  requirements: string[];
  itinerary: { day: number; title: string; description: string }[];
  rating: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Reservation = {
  id: number;
  code: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientNIN: string;
  numberOfTravelers: number;
  travelDate: Date;
  totalPriceDZD: string;
  status: typeof reservationStatus[number];
  specialRequests?: string;
  rejectionReason?: string;
  packageId: number;
  assignedToId?: number;
  userId?: number;
  notes?: string;
  internalNotes?: string;
  idCardImage?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ReservationLog = {
  id: number;
  reservationId: number;
  userId?: number;
  fromStatus?: string;
  toStatus: string;
  note?: string;
  createdAt: Date;
};

export type Testimonial = {
  id: number;
  clientName: string;
  content: string;
  rating: number;
  packageId?: number;
  isApproved: boolean;
  createdAt: Date;
};

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

export type AgencySettings = {
  id: number;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  socialLinks?: { facebook?: string; instagram?: string; twitter?: string };
  heroTitleAr?: string;
  heroTitleFr?: string;
  heroTitleEn?: string;
  heroSubtitleAr?: string;
  heroSubtitleFr?: string;
  heroSubtitleEn?: string;
};

// Zod Schemas for validation in forms
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(userRoles).default("CLIENT"),
});

export const insertPackageSchema = z.object({
  titleAr: z.string().min(2),
  titleFr: z.string().min(2),
  titleEn: z.string().min(2),
  descAr: z.string().min(10),
  descFr: z.string().min(10),
  descEn: z.string().min(10),
  destination: z.string().min(2),
  type: z.enum(packageTypes),
  pricePerPerson: z.string(),
  durationDays: z.number().positive(),
  maxCapacity: z.number().positive(),
  images: z.array(z.string()),
  status: z.enum(packageStatus).default("DRAFT"),
  departureDates: z.array(z.string()),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  requirements: z.array(z.string()).optional(),
  itinerary: z.array(z.object({
    day: z.number(),
    title: z.string(),
    description: z.string()
  })),
});

export const insertReservationSchema = z.object({
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  clientPhone: z.string().min(10),
  clientNIN: z.string().min(18),
  numberOfTravelers: z.number().positive(),
  travelDate: z.date(),
  totalPriceDZD: z.string(),
  packageId: z.number(),
  specialRequests: z.string().optional(),
});

export const insertTestimonialSchema = z.object({
  clientName: z.string().min(2),
  content: z.string().min(10),
  rating: z.number().min(1).max(5),
  packageId: z.number().optional(),
});

export const insertContactMessageSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().min(10),
});

