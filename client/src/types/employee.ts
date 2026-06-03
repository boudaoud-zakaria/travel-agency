export interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'EMPLOYEE' | 'SUPER_ADMIN';
  isActive: boolean;
  lastLoginAt: string;
  reservationsHandled: number;
  performance: number;
  createdAt: string;
  avatarUrl?: string;
}

export interface Reservation {
  id: number;
  code: string;
  clientName: string;
  clientPhone: string;
  packageId: number;
  packageName: string;
  status: ReservationStatus;
  amount: number;
  travelersCount: number;
  handledByEmployeeId: number;
  assignedAt: string;
  confirmedAt?: string;
  notes?: string;
  internalNotes?: string;
  idCardImage?: string;
  createdAt: string;
}

export type ReservationStatus = 'PENDING' | 'IN_REVIEW' | 'CONFIRMED' | 'REJECTED';

export interface EmployeeStats {
  employeeId: number;
  month: number;
  year: number;
  handled: number;
  confirmed: number;
  rejected: number;
  avgHandlingTimeHours: number;
  confirmationRate: number;
  performanceScore: number;
}

export interface Notification {
  id: number;
  type: 'reservation_assigned' | 'reservation_status_changed' | 'system_announcement';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  linkTo?: string;
}
