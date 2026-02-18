import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDashboardStats() {
  return useQuery({
    queryKey: [api.stats.dashboard.path],
    queryFn: async () => {
      const res = await fetch(api.stats.dashboard.path);
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return await res.json();
    },
  });
}
