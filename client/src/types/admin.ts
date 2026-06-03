export interface EmployeeSchedule {
  id: number;
  employeeId: number;
  packageIds: number[];
  shiftStart: string;
  shiftEnd: string;
  isOnLeave: boolean;
}

export interface ActivityLog {
  id: number;
  employeeId: number;
  employeeName: string;
  action: 'CONFIRMED_RESERVATION' | 'REJECTED_RESERVATION' | 'CREATED_PACKAGE' | 'LOGIN' | 'ASSIGNED_RESERVATION';
  entityId: string;
  timestamp: string;
}

export type RoutingMode = 'ROUND_ROBIN' | 'MANUAL';

export interface AdminEmployee {
  id: number;
  name: string;
  email: string;
  initials: string;
  pendingCount: number;
  confirmedCount: number;
  rejectedCount: number;
  totalHandled: number;
  score: number;
  isOnLeave: boolean;
  assignedPackageIds: number[];
}
