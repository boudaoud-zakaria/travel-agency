
import { z } from "zod";
import { 
  insertUserSchema, 
  insertPackageSchema, 
  insertReservationSchema, 
  insertTestimonialSchema, 
  insertContactMessageSchema,
  travelPackages,
  reservations,
  users,
  testimonials,
  contactMessages,
  reservationLogs
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// API Contract
export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  packages: {
    list: {
      method: 'GET' as const,
      path: '/api/packages' as const,
      input: z.object({
        type: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof travelPackages.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/packages/:id' as const,
      responses: {
        200: z.custom<typeof travelPackages.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/packages' as const,
      input: insertPackageSchema,
      responses: {
        201: z.custom<typeof travelPackages.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/packages/:id' as const,
      input: insertPackageSchema.partial(),
      responses: {
        200: z.custom<typeof travelPackages.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/packages/:id' as const,
      responses: {
        200: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  reservations: {
    list: {
      method: 'GET' as const,
      path: '/api/reservations' as const,
      input: z.object({
        status: z.string().optional(),
        code: z.string().optional(),
        packageId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof reservations.$inferSelect & { package: typeof travelPackages.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/reservations/:id' as const,
      responses: {
        200: z.custom<typeof reservations.$inferSelect & { package: typeof travelPackages.$inferSelect, logs: typeof reservationLogs.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/reservations' as const,
      input: insertReservationSchema,
      responses: {
        201: z.object({
          code: z.string(),
          reservation: z.custom<typeof reservations.$inferSelect>(),
        }),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/reservations/:id/status' as const,
      input: z.object({
        status: z.enum(["PENDING", "IN_REVIEW", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"]),
        note: z.string().optional(),
        rejectionReason: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof reservations.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  stats: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/stats/dashboard' as const,
      responses: {
        200: z.object({
          totalReservations: z.number(),
          pendingReservations: z.number(),
          confirmedReservations: z.number(),
          totalRevenue: z.number(),
          activePackages: z.number(),
        }),
      },
    },
  },
  contact: {
    create: {
      method: 'POST' as const,
      path: '/api/contact' as const,
      input: insertContactMessageSchema,
      responses: {
        201: z.custom<typeof contactMessages.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/contact' as const,
      responses: {
        200: z.array(z.custom<typeof contactMessages.$inferSelect>()),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
