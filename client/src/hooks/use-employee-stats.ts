import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/lib/api";
import { useUser } from "@/hooks/use-auth";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function useEmployeeStats(year: number = new Date().getFullYear()) {
  const { data: user } = useUser();
  const userId = (user as Record<string, unknown> | null | undefined)?.id as number | undefined;

  const query = useQuery({
    queryKey: ["/api/stats/employee", userId, year],
    queryFn: () => statsApi.employee(userId!, year),
    enabled: !!userId,
  });

  const responseData = query.data as Record<string, unknown> | undefined;
  const monthlyStats = (responseData?.monthlyStats as Record<string, unknown>[] | undefined) ?? [];
  const apiSummary = responseData?.summary as Record<string, unknown> | undefined;

  const summary = useMemo(() => {
    if (!monthlyStats.length) {
      return {
        totalHandled: 0,
        totalConfirmed: 0,
        overallConfirmationRate: 0,
        bestMonth: null,
        worstMonth: null,
        avgPerformanceScore: 0,
        teamAvgScore: 75,
      };
    }

    const totalHandled = apiSummary?.totalHandled as number ?? 0;
    const totalConfirmed = apiSummary?.totalConfirmed as number ?? 0;
    const confirmationRate = apiSummary?.confirmationRate as number ?? 0;
    const avgScore = apiSummary?.avgPerformanceScore as number ?? 0;
    const bestMonthIndex = (apiSummary?.bestMonth as number ?? 1) - 1;

    const bestMonthData = monthlyStats[bestMonthIndex] as Record<string, unknown> | undefined;
    const worstMonthData = [...monthlyStats].sort(
      (a, b) => (a.handled as number) - (b.handled as number)
    )[0] as Record<string, unknown> | undefined;

    return {
      totalHandled,
      totalConfirmed,
      overallConfirmationRate: Math.round(confirmationRate * 10) / 10,
      bestMonth: bestMonthData
        ? { name: MONTH_NAMES[(bestMonthData.month as number) - 1], value: bestMonthData.handled as number }
        : null,
      worstMonth: worstMonthData
        ? { name: MONTH_NAMES[(worstMonthData.month as number) - 1], value: worstMonthData.handled as number }
        : null,
      avgPerformanceScore: Math.round(avgScore),
      teamAvgScore: 75,
    };
  }, [monthlyStats, apiSummary]);

  const chartData = useMemo(
    () =>
      monthlyStats.map(s => ({
        ...s,
        monthName: MONTH_NAMES[(s.month as number) - 1],
      })),
    [monthlyStats]
  );

  return {
    data: monthlyStats,
    chartData,
    summary,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
