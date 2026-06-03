import { useQuery } from "@tanstack/react-query";
import { activityLogsApi } from "@/lib/api";
import type { ActivityLog } from "@/types/admin";

export const ACTION_LABELS: Record<string, string> = {
  CONFIRMED_RESERVATION: "confirmed reservation",
  REJECTED_RESERVATION: "rejected reservation",
  CREATED_PACKAGE: "created a package",
  LOGIN: "logged in",
  ASSIGNED_RESERVATION: "was assigned reservation",
};

export const ACTION_COLORS: Record<string, string> = {
  CONFIRMED_RESERVATION: "text-emerald-600",
  REJECTED_RESERVATION: "text-red-500",
  CREATED_PACKAGE: "text-blue-600",
  LOGIN: "text-purple-600",
  ASSIGNED_RESERVATION: "text-amber-600",
};

export const ACTION_ICONS: Record<string, string> = {
  CONFIRMED_RESERVATION: "✅",
  REJECTED_RESERVATION: "❌",
  CREATED_PACKAGE: "📦",
  LOGIN: "🔐",
  ASSIGNED_RESERVATION: "📋",
};

function mapToActivityLog(raw: Record<string, unknown>): ActivityLog {
  return {
    id: raw.id as number,
    employeeId: (raw.userId ?? raw.employeeId ?? 0) as number,
    employeeName: (raw.employeeName ?? "System") as string,
    action: (raw.action ?? "") as ActivityLog["action"],
    entityId: raw.entityId != null ? String(raw.entityId) : "",
    timestamp: (raw.createdAt ?? raw.timestamp ?? new Date().toISOString()) as string,
  };
}

export function useActivityLog(employeeId?: number) {
  const query = useQuery({
    queryKey: ["/api/activity-logs", employeeId],
    queryFn: () => activityLogsApi.list(employeeId, 100),
  });

  const data: ActivityLog[] = (
    (query.data as Record<string, unknown>[] | undefined) ?? []
  ).map(mapToActivityLog);

  return {
    data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
