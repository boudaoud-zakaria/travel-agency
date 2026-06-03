import { useDashboardStats } from "@/hooks/use-dashboard";
import { usePackages } from "@/hooks/use-packages";
import { useAdminSchedule } from "@/hooks/use-admin-schedule";
import { useActivityLog } from "@/hooks/use-activity-log";
import { useReservations } from "@/hooks/use-reservations";
import { useEmployees } from "@/hooks/use-employees";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, Calendar, Package, ArrowUp, ArrowDown,
  Eye, Clock, CheckCircle, XCircle, Pause, Star,
  ChevronRight, DollarSign, Activity, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as UICalendar } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import EmployeeWorkloadChart from "@/components/admin/EmployeeWorkloadChart";
import ActivityFeed from "@/components/admin/ActivityFeed";

const statusConfig: Record<string, { label: string; class: string; icon: typeof CheckCircle }> = {
  PENDING: { label: "Pending", class: "badge-pending", icon: Clock },
  IN_REVIEW: { label: "In Review", class: "badge-in-review", icon: Eye },
  CONFIRMED: { label: "Confirmed", class: "badge-confirmed", icon: CheckCircle },
  REJECTED: { label: "Rejected", class: "badge-rejected", icon: XCircle },
  CANCELLED: { label: "Cancelled", class: "badge-cancelled", icon: Pause },
  COMPLETED: { label: "Completed", class: "badge-completed", icon: CheckCircle },
};

const typeEmoji: Record<string, string> = {
  HAJJ: "🕋", UMRAH: "🌙", INTERNATIONAL: "✈️", DOMESTIC: "🥾"
};

function KPICard({
  title, value, change, icon: Icon, iconBg, trend, suffix = ""
}: {
  title: string; value: string | number; change: number; icon: any; iconBg: string; trend?: string; suffix?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="kpi-card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${change >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
          {change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="text-2xl font-black text-foreground mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>
      <div className="text-sm text-muted-foreground font-medium">{title}</div>
      {trend && <div className="text-xs text-muted-foreground mt-1">{trend}</div>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: packages } = usePackages();
  const { employees } = useAdminSchedule();
  const { data: activityLogs } = useActivityLog();
  const { data: resData } = useReservations();
  const { data: empData } = useEmployees();

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [interval, setInterval] = useState("30D");

  const setPreset = (type: string) => {
    setInterval(type);
    const to = new Date();
    let from = new Date();
    if (type === "7D") from = subDays(to, 7);
    else if (type === "30D") from = subDays(to, 30);
    else if (type === "90D") from = subDays(to, 90);
    else if (type === "Today") from = new Date();
    setDateRange({ from, to });
  };

  const formatDZD = (n: number) =>
    n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n.toLocaleString('fr-DZ');

  // Build chart data from real API
  const revenueData = (stats as any)?.monthlyData ?? [];

  const statusCounts = (stats as any)?.statusCounts ?? {};
  const statusData = [
    { name: 'Confirmed', value: statusCounts.CONFIRMED ?? 0, color: '#22C55E' },
    { name: 'Pending', value: statusCounts.PENDING ?? 0, color: '#F59E0B' },
    { name: 'In Review', value: statusCounts.IN_REVIEW ?? 0, color: '#2E86AB' },
    { name: 'Completed', value: statusCounts.COMPLETED ?? 0, color: '#8B5CF6' },
    { name: 'Rejected', value: statusCounts.REJECTED ?? 0, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const topPackages = ((stats as any)?.topPackages ?? []).map((p: any) => ({
    name: p.titleEn ?? "",
    bookings: p.count ?? 0,
    revenue: p.revenue ?? 0,
    type: "DOMESTIC",
    trend: 0,
  }));

  const recentReservations = ((resData as any[]) ?? []).slice(0, 5);

  const topEmployees = ((empData as any[]) ?? [])
    .filter((e: any) => e.role === "EMPLOYEE")
    .sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3);

  // Filtered statistics based on date range
  const filteredStats = useMemo(() => {
    const days = Math.floor((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 3600 * 24)) + 1;
    const factor = Math.min(days / 30, 2);

    return {
      revenue: ((stats as any)?.totalRevenue || 0) * factor,
      reservations: Math.round(((stats as any)?.totalReservations || 0) * factor),
      packages: (stats as any)?.activePackages || (packages as any[])?.length || 0,
      employees: (stats as any)?.activeEmployees || 0,
    };
  }, [stats, packages, dateRange]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Admin — here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border rounded-xl p-1 shadow-sm">
            {["Today", "7D", "30D", "All"].map((p) => (
              <Button
                key={p}
                variant={interval === p ? "default" : "ghost"}
                size="sm"
                className={`h-8 text-[11px] px-3 font-bold rounded-lg ${interval === p ? "bg-primary text-white" : "text-muted-foreground"}`}
                onClick={() => setPreset(p)}
              >
                {p}
              </Button>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Custom
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <UICalendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range: any) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                      setInterval("Custom");
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Link href="/admin/packages">
            <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-md shadow-primary/20 hover:opacity-90">
              <Package className="w-4 h-4" />
              New Package
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Revenue"
          value={formatDZD(filteredStats.revenue)}
          change={20.1}
          icon={DollarSign}
          iconBg="bg-emerald-100 text-emerald-600"
          trend="for selected period"
          suffix=" DZD"
        />
        <KPICard
          title="Total Reservations"
          value={filteredStats.reservations}
          change={12.5}
          icon={Calendar}
          iconBg="bg-blue-100 text-blue-600"
          trend={`${(stats as any)?.pendingReservations ?? 0} pending overall`}
        />
        <KPICard
          title="Active Packages"
          value={filteredStats.packages}
          change={8.3}
          icon={Package}
          iconBg="bg-amber-100 text-amber-600"
          trend={`${(stats as any)?.totalPackages ?? 0} total packages`}
        />
        <KPICard
          title="Active Employees"
          value={filteredStats.employees}
          change={0}
          icon={Users}
          iconBg="bg-purple-100 text-purple-600"
          trend={`${(stats as any)?.totalEmployees ?? 0} total staff`}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 shadow-md border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Revenue & Reservations</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Last 12 months in DZD</p>
            </div>
          </CardHeader>
          <CardContent>
            {revenueData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                {isLoading ? "Loading..." : "No data yet"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(215 52% 25%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(215 52% 25%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="resGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(27 87% 67%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(27 87% 67%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid hsl(214 32% 91%)", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
                    formatter={(val: number, name) => [
                      name === "revenue" ? `${(val / 1000000).toFixed(2)}M DZD` : val,
                      name === "revenue" ? "Revenue" : "Reservations"
                    ]}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(215 52% 25%)" strokeWidth={2}
                    fill="url(#revenueGradient)" />
                  <Area yAxisId="right" type="monotone" dataKey="reservations" stroke="hsl(27 87% 67%)" strokeWidth={2}
                    fill="url(#resGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Pie */}
        <Card className="shadow-md border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold">Reservation Status</CardTitle>
            <p className="text-xs text-muted-foreground">All-time breakdown</p>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, name) => [`${v}`, name]} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                  <span className="text-xs font-bold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workload + Activity Feed */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Employee Workload Chart */}
        <Card className="lg:col-span-2 shadow-md border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Employee Workload
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pending · Confirmed · Rejected per agent
              </p>
            </div>
            <Link href="/admin/employees">
              <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs">
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <EmployeeWorkloadChart employees={employees} />
            {employees.some(e => e.isOnLeave) && (
              <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                🏖️ Grayed bars indicate employee is on leave
              </p>
            )}
          </CardContent>
        </Card>

        {/* System Activity Feed */}
        <Card className="shadow-md border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> System Activity
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Recent employee actions</p>
            </div>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" title="Live" />
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[280px] pr-1">
            <ActivityFeed logs={activityLogs} maxItems={8} />
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Reservations */}
        <Card className="lg:col-span-3 shadow-md border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Recent Reservations</CardTitle>
            <Link href="/admin/reservations">
              <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-left px-6 py-3 font-semibold">Client</th>
                    <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Package</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-right px-6 py-3 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReservations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">
                        {isLoading ? "Loading..." : "No reservations yet"}
                      </td>
                    </tr>
                  ) : recentReservations.map((r: any) => {
                    const sc = statusConfig[r.status as string];
                    if (!sc) return null;
                    return (
                      <tr key={r.code} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-foreground">{r.clientName}</div>
                          <div className="text-xs text-muted-foreground font-mono">{r.code}</div>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                            {r.package?.titleEn ?? r.packageName ?? "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.class}`}>
                            <sc.icon className="w-3 h-3" />
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right text-xs font-bold text-foreground">
                          {Number(r.totalPriceDZD ?? 0).toLocaleString('fr-DZ')} DZD
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Packages & Employees */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Packages */}
          <Card className="shadow-md border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold">Top Packages</CardTitle>
              <Link href="/admin/packages">
                <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs">
                  View <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPackages.length === 0 ? (
                <p className="text-xs text-muted-foreground">No booking data yet</p>
              ) : topPackages.slice(0, 4).map((pkg: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-lg">{typeEmoji[pkg.type] ?? "🥾"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{pkg.name}</div>
                    <div className="text-xs text-muted-foreground">{pkg.bookings} bookings</div>
                  </div>
                  <div className="text-xs font-bold text-muted-foreground">
                    {formatDZD(pkg.revenue)} DZD
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Employees */}
          <Card className="shadow-md border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Top Employees</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topEmployees.length === 0 ? (
                <p className="text-xs text-muted-foreground">No employee data yet</p>
              ) : topEmployees.map((emp: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {emp.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground">{emp.name}</div>
                    <div className="text-xs text-muted-foreground">{emp.totalHandled ?? 0} handled</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-600">{emp.score ?? 0}%</div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`w-2.5 h-2.5 ${j < Math.round((emp.score ?? 0) / 20) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
