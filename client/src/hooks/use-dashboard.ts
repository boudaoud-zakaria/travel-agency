import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/lib/api";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["/api/stats/dashboard"],
    queryFn: () => statsApi.dashboard(),
  });
}

export function useEmployeeStats(employeeId: number, year?: number) {
  return useQuery({
    queryKey: ["/api/stats/employee", employeeId, year],
    queryFn: () => statsApi.employee(employeeId, year),
    enabled: !!employeeId,
  });
}
