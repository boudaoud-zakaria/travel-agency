import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { schedulesApi, employeesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type RoutingMode = "ROUND_ROBIN" | "MANUAL";

export function useAdminSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["/api/schedules"],
    queryFn: () => schedulesApi.list(),
  });

  const schedules = (query.data as Record<string, unknown>[] | undefined) ?? [];

  // Fetch full employee profiles (includes pendingCount, confirmedCount, score)
  const empQuery = useQuery({
    queryKey: ["/api/employees"],
    queryFn: () => employeesApi.list(),
  });
  const empProfiles = (empQuery.data as Record<string, unknown>[] | undefined) ?? [];
  const empProfileMap = useMemo(() => {
    const m: Record<number, Record<string, unknown>> = {};
    for (const e of empProfiles) m[e.id as number] = e;
    return m;
  }, [empProfiles]);

  const toggleLeaveMutation = useMutation({
    mutationFn: (employeeId: number) => schedulesApi.toggleLeave(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({ title: "Updated", description: "Leave status updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: ({
      employeeId,
      ...data
    }: {
      employeeId: number;
      packageIds?: number[];
      shiftStart?: string;
      shiftEnd?: string;
      isOnLeave?: boolean;
    }) => schedulesApi.update(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({ title: "Updated", description: "Schedule updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Map: employeeId → packageIds[]
  const employeePackageMap = useMemo(() => {
    const map: Record<number, number[]> = {};
    for (const s of schedules) {
      map[s.employeeId as number] = (s.packageIds as number[]) ?? [];
    }
    return map;
  }, [schedules]);

  // Map: packageId → employeeIds[]
  const packageEmployeeMap = useMemo(() => {
    const map: Record<number, number[]> = {};
    for (const s of schedules) {
      for (const pkgId of (s.packageIds as number[]) ?? []) {
        if (!map[pkgId]) map[pkgId] = [];
        map[pkgId].push(s.employeeId as number);
      }
    }
    return map;
  }, [schedules]);

  const toggleLeave = (employeeId: number) => {
    toggleLeaveMutation.mutate(employeeId);
  };

  const assignPackageToEmployee = (employeeId: number, packageId: number) => {
    const current = employeePackageMap[employeeId] ?? [];
    const already = current.includes(packageId);
    const newPackageIds = already
      ? current.filter(id => id !== packageId)
      : [...current, packageId];

    updateScheduleMutation.mutate({ employeeId, packageIds: newPackageIds });
  };

  // Round-robin: pick active non-leave employee with fewest reservations for a package
  const autoAssign = (packageId: number): number | null => {
    const assignedIds = packageEmployeeMap[packageId] ?? [];
    const eligible = schedules.filter(
      s => assignedIds.includes(s.employeeId as number) && !s.isOnLeave
    );
    if (eligible.length === 0) return null;
    return (eligible.reduce((best: Record<string, unknown>, s: Record<string, unknown>) => {
      const bEmp = (best.employee as Record<string, unknown>) ?? {};
      const sEmp = (s.employee as Record<string, unknown>) ?? {};
      return ((sEmp.pendingCount as number) ?? 0) < ((bEmp.pendingCount as number) ?? 0) ? s : best;
    }).employeeId as number) ?? null;
  };

  const employees = schedules
    .filter((s) => s.employee)
    .map((s: Record<string, unknown>) => {
      const emp = (s.employee as Record<string, unknown>) ?? {};
      const profile = empProfileMap[(emp.id as number)] ?? {};
      const name = (emp.name as string) ?? "";
      return {
        ...emp,
        ...profile,
        isOnLeave: (s.isOnLeave as boolean) ?? false,
        assignedPackageIds: (s.packageIds as number[]) ?? [],
        initials: name
          .split(" ")
          .map((n: string) => n[0] ?? "")
          .join("")
          .toUpperCase()
          .slice(0, 2) || "?",
        pendingCount: (profile.pendingCount as number) ?? 0,
        confirmedCount: (profile.confirmedCount as number) ?? 0,
        score: (profile.score as number) ?? 0,
      };
    });

  return {
    schedules,
    employees,
    routingMode: "MANUAL" as RoutingMode,
    setRoutingMode: (_mode: RoutingMode) => {},
    employeePackageMap,
    packageEmployeeMap,
    toggleLeave,
    assignPackageToEmployee,
    autoAssign,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
