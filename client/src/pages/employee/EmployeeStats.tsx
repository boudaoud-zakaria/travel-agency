import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Trophy, Calendar, CheckCircle, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEmployeeStats } from "@/hooks/use-employee-stats";
import { useEmployeeReservations } from "@/hooks/use-employee-reservations";
import PerformanceGauge from "@/components/employee/PerformanceGauge";
import StatsMonthlyChart from "@/components/employee/StatsMonthlyChart";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function EmployeeStats() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, chartData, summary, isLoading } = useEmployeeStats(year);
  const { data: reservations } = useEmployeeReservations();

  const packageData = useMemo(() => {
    const countMap: Record<string, number> = {};
    ((reservations ?? []) as any[]).forEach((r: any) => {
      const name = r.package?.titleEn ?? r.packageName ?? `Package #${r.packageId}`;
      countMap[name] = (countMap[name] ?? 0) + 1;
    });
    return Object.entries(countMap)
      .map(([name, count]) => ({
        name: name.length > 14 ? name.slice(0, 14) + "…" : name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [reservations]);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="h-8 w-64 animate-pulse bg-muted rounded" />
        <div className="grid grid-cols-3 gap-5">
          {[0,1,2].map(i => <div key={i} className="h-28 animate-pulse bg-muted rounded-2xl" />)}
        </div>
        <div className="h-72 animate-pulse bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Performance Statistics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Detailed breakdown of your activity and performance metrics
          </p>
        </div>
        <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2025, 2024, 2023].map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Top KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            title: "Total Reservations",
            value: summary.totalHandled,
            sub: `${summary.totalConfirmed} confirmed`,
            icon: Calendar,
            color: "bg-blue-100 text-blue-600",
            delay: 0,
          },
          {
            title: "Confirmation Rate",
            value: `${summary.overallConfirmationRate}%`,
            sub: summary.overallConfirmationRate >= 80 ? "Above target" : "Below target",
            icon: summary.overallConfirmationRate >= 80 ? TrendingUp : TrendingDown,
            color: summary.overallConfirmationRate >= 80 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600",
            delay: 0.07,
          },
          {
            title: "Best Month",
            value: summary.bestMonth?.name ?? "—",
            sub: summary.bestMonth ? `${summary.bestMonth.value} reservations` : "No data",
            icon: Trophy,
            color: "bg-amber-100 text-amber-600",
            delay: 0.14,
          },
        ].map((kpi) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: kpi.delay }}
            className="kpi-card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black">{kpi.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{kpi.title}</div>
            <div className="text-[11px] text-muted-foreground/60 mt-1">{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Monthly Activity Chart */}
      <Card className="shadow-md border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-bold">Monthly Activity — {year}</CardTitle>
          <p className="text-xs text-muted-foreground">Handled vs Confirmed vs Rejected per month</p>
        </CardHeader>
        <CardContent>
          <StatsMonthlyChart data={data} />
        </CardContent>
      </Card>

      {/* Gauge + Package bar chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Confirmation Rate Gauge */}
        <Card className="shadow-md border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold">Confirmation Rate</CardTitle>
            <p className="text-xs text-muted-foreground">Overall rate for {year}</p>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-6">
            <PerformanceGauge
              value={summary.overallConfirmationRate}
              label="Confirmation Rate"
              color={summary.overallConfirmationRate >= 80 ? "#22C55E" : "#F59E0B"}
            />
          </CardContent>
        </Card>

        {/* Reservations by Package */}
        <Card className="shadow-md border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold">Top Packages</CardTitle>
            <p className="text-xs text-muted-foreground">Reservations by package (top 5)</p>
          </CardHeader>
          <CardContent>
            {packageData.length === 0 ? (
              <p className="text-xs text-muted-foreground">No reservation data yet</p>
            ) : null}
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={packageData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(214 32% 91%)" }} />
                <Bar dataKey="count" name="Reservations" fill="hsl(215 52% 35%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Comparison */}
      <Card className="shadow-md border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Team Comparison
          </CardTitle>
          <p className="text-xs text-muted-foreground">Your average performance score vs team average</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-primary">Your Score</span>
              <span className="font-black text-primary">{summary.avgPerformanceScore}</span>
            </div>
            <Progress value={summary.avgPerformanceScore} className="h-3" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-muted-foreground">Team Average</span>
              <span className="font-black text-muted-foreground">{summary.teamAvgScore}</span>
            </div>
            <Progress value={summary.teamAvgScore} className="h-3 [&>div]:bg-muted-foreground/40" />
          </div>
          {summary.avgPerformanceScore > summary.teamAvgScore ? (
            <p className="text-xs text-emerald-600 flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              You're {summary.avgPerformanceScore - summary.teamAvgScore} points above the team average!
            </p>
          ) : (
            <p className="text-xs text-amber-600 flex items-center gap-1.5 font-medium">
              <TrendingDown className="w-3.5 h-3.5" />
              {summary.teamAvgScore - summary.avgPerformanceScore} points below team average — keep it up!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Monthly Breakdown Table */}
      <Card className="shadow-md border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-bold">Monthly Breakdown — {year}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  {[
                    { label: "Month",     cls: "" },
                    { label: "Handled",   cls: "" },
                    { label: "Confirmed", cls: "" },
                    { label: "Rejected",  cls: "hidden sm:table-cell" },
                    { label: "Rate %",    cls: "hidden sm:table-cell" },
                    { label: "Score",     cls: "hidden md:table-cell" },
                  ].map(({ label, cls }) => (
                    <th key={label} className={`text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide ${cls}`}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">
                      No data available for {year}
                    </td>
                  </tr>
                ) : (
                  data.map((s, i) => (
                    <motion.tr
                      key={s.month}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-3 font-semibold">{MONTH_NAMES[s.month - 1]}</td>
                      <td className="px-5 py-3">{s.handled}</td>
                      <td className="px-5 py-3 text-emerald-600 font-semibold">{s.confirmed}</td>
                      <td className="px-5 py-3 text-red-500 hidden sm:table-cell">{s.rejected}</td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <span className={`font-bold ${s.confirmationRate >= 80 ? "text-emerald-600" : "text-amber-500"}`}>
                          {s.confirmationRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${s.performanceScore}%` }}
                            />
                          </div>
                          <span className="font-semibold text-xs">{s.performanceScore}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
              {data.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/20">
                    <td className="px-5 py-3 font-bold text-xs uppercase tracking-wide text-muted-foreground">Total / Avg</td>
                    <td className="px-5 py-3 font-bold">{summary.totalHandled}</td>
                    <td className="px-5 py-3 font-bold text-emerald-600">{summary.totalConfirmed}</td>
                    <td className="px-5 py-3 font-bold text-red-500 hidden sm:table-cell">
                      {data.reduce((a, s) => a + s.rejected, 0)}
                    </td>
                    <td className="px-5 py-3 font-bold hidden sm:table-cell">{summary.overallConfirmationRate}%</td>
                    <td className="px-5 py-3 font-bold hidden md:table-cell">{summary.avgPerformanceScore}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Best / Worst callout */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Best Month</div>
            <div className="font-black text-lg text-emerald-700">{summary.bestMonth?.name ?? "—"}</div>
            <div className="text-xs text-emerald-600">{summary.bestMonth?.value} reservations handled</div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Lowest Month</div>
            <div className="font-black text-lg text-amber-700">{summary.worstMonth?.name ?? "—"}</div>
            <div className="text-xs text-amber-600">{summary.worstMonth?.value} reservations handled</div>
          </div>
        </div>
      </div>

    </div>
  );
}
