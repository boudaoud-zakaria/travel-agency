// Central API client — all requests go through here.
// JWT token is stored in localStorage and sent as Bearer token.

const BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("tg_token");
}

export function setToken(token: string) {
  localStorage.setItem("tg_token", token);
}

export function clearToken() {
  localStorage.removeItem("tg_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || message;
    } catch {}
    throw new Error(message);
  }

  // 204 No Content
  if (response.status === 204) return undefined as unknown as T;

  return response.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: Record<string, unknown>; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<void>("/auth/logout", { method: "POST" }),

  me: () => request<Record<string, unknown>>("/auth/me"),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>("/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
    request<Record<string, unknown>>("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ── Packages ──────────────────────────────────────────────────────────────────
export const packagesApi = {
  list: (filters?: { type?: string; status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    const qs = params.toString();
    return request<Record<string, unknown>[]>(`/packages${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => request<Record<string, unknown>>(`/packages/${id}`),

  create: (data: Record<string, unknown>) =>
    request<Record<string, unknown>>("/packages", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/packages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/packages/${id}`, { method: "DELETE" }),
};

// ── Reservations ──────────────────────────────────────────────────────────────
export const reservationsApi = {
  list: (filters?: {
    status?: string;
    assignedToId?: number;
    search?: string;
    packageId?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.assignedToId) params.append("assignedToId", String(filters.assignedToId));
    if (filters?.search) params.append("search", filters.search);
    if (filters?.packageId) params.append("packageId", String(filters.packageId));
    const qs = params.toString();
    return request<Record<string, unknown>[]>(`/reservations${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => request<Record<string, unknown>>(`/reservations/${id}`),

  getByCode: (code: string) =>
    request<Record<string, unknown>>(`/reservations/code/${code}`),

  create: (data: Record<string, unknown>) =>
    request<Record<string, unknown>>("/reservations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateStatus: (id: number, status: string, note?: string, rejectionReason?: string) =>
    request<Record<string, unknown>>(`/reservations/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, note, rejectionReason }),
    }),

  update: (id: number, data: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/reservations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  cancel: (id: number) =>
    request<{ message: string }>(`/reservations/${id}`, { method: "DELETE" }),
};

// ── Dashboard & Stats ─────────────────────────────────────────────────────────
export const statsApi = {
  dashboard: () => request<Record<string, unknown>>("/stats/dashboard"),

  employee: (employeeId: number, year?: number) => {
    const params = year ? `?year=${year}` : "";
    return request<Record<string, unknown>>(`/stats/employee/${employeeId}${params}`);
  },
};

// ── Employees ─────────────────────────────────────────────────────────────────
export const employeesApi = {
  list: () => request<Record<string, unknown>[]>("/employees"),

  get: (id: number) => request<Record<string, unknown>>(`/employees/${id}`),

  create: (data: Record<string, unknown>) =>
    request<Record<string, unknown>>("/employees", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  toggleStatus: (id: number) =>
    request<Record<string, unknown>>(`/employees/${id}/status`, { method: "PATCH" }),

  delete: (id: number) =>
    request<{ message: string }>(`/employees/${id}`, { method: "DELETE" }),
};

// ── Schedules ─────────────────────────────────────────────────────────────────
export const schedulesApi = {
  list: () => request<Record<string, unknown>[]>("/schedules"),

  update: (
    employeeId: number,
    data: { packageIds?: number[]; shiftStart?: string; shiftEnd?: string; isOnLeave?: boolean }
  ) =>
    request<Record<string, unknown>>(`/schedules/${employeeId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  toggleLeave: (employeeId: number) =>
    request<Record<string, unknown>>(`/schedules/${employeeId}/leave`, { method: "PATCH" }),
};

// ── Activity Logs ─────────────────────────────────────────────────────────────
export const activityLogsApi = {
  list: (employeeId?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (employeeId) params.append("employeeId", String(employeeId));
    if (limit) params.append("limit", String(limit));
    const qs = params.toString();
    return request<Record<string, unknown>[]>(`/activity-logs${qs ? `?${qs}` : ""}`);
  },
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: () => request<Record<string, unknown>[]>("/notifications"),

  markRead: (id: number) =>
    request<{ message: string }>(`/notifications/${id}/read`, { method: "PATCH" }),

  markAllRead: () =>
    request<{ message: string }>("/notifications/read-all", { method: "PATCH" }),
};

// ── Contact ───────────────────────────────────────────────────────────────────
export const contactApi = {
  submit: (data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) =>
    request<Record<string, unknown>>("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: () => request<Record<string, unknown>[]>("/contact"),

  markRead: (id: number) =>
    request<{ message: string }>(`/contact/${id}/read`, { method: "PATCH" }),
};

// ── Testimonials ──────────────────────────────────────────────────────────────
export const testimonialsApi = {
  list: (adminView = false) =>
    request<Record<string, unknown>[]>(`/testimonials${adminView ? "?admin=true" : ""}`),

  submit: (data: {
    clientName: string;
    content: string;
    rating: number;
    packageId?: number;
  }) =>
    request<Record<string, unknown>>("/testimonials", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  approve: (id: number, approved: boolean) =>
    request<Record<string, unknown>>(`/testimonials/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ approved }),
    }),
};

// ── Settings ──────────────────────────────────────────────────────────────────
export const settingsApi = {
  get: () => request<Record<string, unknown>>("/settings"),

  update: (data: Record<string, unknown>) =>
    request<Record<string, unknown>>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ── Custom Requests ───────────────────────────────────────────────────────────
export interface CustomRequestPayload {
  name: string;
  email: string;
  phone: string;
  destination: string;
  dateFrom: string;
  dateTo: string;
  groupSize: number;
  budget?: string;
  activityType: string;
  requirements?: string;
  message: string;
}

export const customRequestsApi = {
  submit: (data: CustomRequestPayload) =>
    request<Record<string, unknown>>("/custom-requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: () => request<Record<string, unknown>[]>("/custom-requests"),

  update: (id: number, data: { status?: string; adminNotes?: string }) =>
    request<Record<string, unknown>>(`/custom-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/custom-requests/${id}`, { method: "DELETE" }),
};

// ── Package hard delete ────────────────────────────────────────────────────────
export const packagesHardDelete = (id: number) =>
  request<{ message: string }>(`/packages/${id}/hard`, { method: "DELETE" });

