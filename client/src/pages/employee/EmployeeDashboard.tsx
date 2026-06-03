import { useUser } from "@/hooks/use-auth";
import { useEffect, useState, useMemo } from "react";
import {
    Calendar, CheckCircle, Clock, TrendingUp,
    ArrowUp, ArrowDown, Eye, XCircle, ChevronRight, Plus, ListFilter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";
import { motion } from "framer-motion";
import { useEmployeeReservations } from "@/hooks/use-employee-reservations";

const statusConfig: Record<string, { class: string; icon: any }> = {
    PENDING:    { class: "badge-pending",    icon: Clock },
    IN_REVIEW:  { class: "badge-in-review",  icon: Eye },
    CONFIRMED:  { class: "badge-confirmed",  icon: CheckCircle },
    REJECTED:   { class: "badge-rejected",   icon: XCircle },
};

const STATUS_COLORS: Record<string, string> = {
    CONFIRMED: "#22C55E",
    REJECTED:  "#EF4444",
    IN_REVIEW: "#2E86AB",
    PENDING:   "#F59E0B",
};

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

export default function EmployeeDashboard() {
    const { data: user } = useUser();
    const { data: allReservations, isLoading: resLoading } = useEmployeeReservations();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 600);
        return () => clearTimeout(t);
    }, []);

    const reservations = allReservations ?? [];
    const recentReservations = reservations.slice(0, 5);

    // Derive real stats from reservation data
    const { stats, weeklyData, statusBreakdown } = useMemo(() => {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const monthRes = reservations.filter((r: any) => {
            const d = new Date(r.createdAt ?? r.travelDate ?? "");
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });

        const confirmed = reservations.filter((r: any) => r.status === "CONFIRMED").length;
        const pending = reservations.filter((r: any) => r.status === "PENDING" || r.status === "IN_REVIEW").length;
        const rejected = reservations.filter((r: any) => r.status === "REJECTED").length;
        const total = reservations.length;
        const performance = total > 0 ? ((confirmed / total) * 100).toFixed(1) : "0.0";

        // Weekly data: last 7 days
        const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        const weekly = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dayStr = d.toISOString().slice(0, 10);
            const dayRes = reservations.filter((r: any) => {
                const rd = (r.createdAt ?? "").slice(0, 10);
                return rd === dayStr;
            });
            const dayConfirmed = dayRes.filter((r: any) => r.status === "CONFIRMED").length;
            return {
                day: days[d.getDay()],
                handled: dayRes.length,
                confirmed: dayConfirmed,
            };
        });

        // Status breakdown for pie
        const breakdown = [
            { name: "Confirmed", value: confirmed, color: STATUS_COLORS.CONFIRMED },
            { name: "Rejected",  value: rejected,  color: STATUS_COLORS.REJECTED },
            { name: "In Review", value: pending,   color: STATUS_COLORS.IN_REVIEW },
        ].filter(s => s.value > 0);

        return {
            stats: [
                { title: "Handled This Month", value: monthRes.length, change: 0, icon: Calendar, color: "bg-blue-100 text-blue-600" },
                { title: "Confirmed",          value: confirmed,       change: 0, icon: CheckCircle, color: "bg-emerald-100 text-emerald-600" },
                { title: "Pending Review",     value: pending,         change: 0, icon: Clock,       color: "bg-amber-100 text-amber-600" },
                { title: "Performance Score",  value: `${performance}%`, change: 0, icon: TrendingUp, color: "bg-purple-100 text-purple-600" },
            ],
            weeklyData: weekly,
            statusBreakdown: breakdown,
        };
    }, [reservations]);

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        {getGreeting()}, {(user as any)?.name?.split(" ")[0] || "Employee"} 👋
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Here's your activity summary for today.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Link href="/employee/reservations">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                            <ListFilter className="w-4 h-4" /> View Pending
                        </Button>
                    </Link>
                    <Link href="/employee/reservations">
                        <Button className="gap-2 bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-md hover:opacity-90" size="sm">
                            <Plus className="w-4 h-4" /> Process Reservation
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="kpi-card p-5 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="w-10 h-10 rounded-xl animate-pulse bg-muted" />
                                <div className="w-12 h-5 rounded-full animate-pulse bg-muted" />
                            </div>
                            <div className="w-16 h-7 rounded animate-pulse bg-muted" />
                            <div className="w-24 h-3 rounded animate-pulse bg-muted" />
                        </div>
                    ))
                    : stats.map((s, i) => (
                        <motion.div
                            key={s.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="kpi-card p-5"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-2xl font-black">{s.value}</div>
                            <div className="text-xs text-muted-foreground mt-1">{s.title}</div>
                        </motion.div>
                    ))
                }
            </div>

            {/* Charts row */}
            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-md border-border/50">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Weekly Activity</CardTitle>
                        <p className="text-xs text-muted-foreground">Reservations handled vs confirmed (last 7 days)</p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(214 32% 91%)" }} />
                                <Bar dataKey="handled" fill="hsl(215 52% 25%)" radius={[4, 4, 0, 0]} name="Handled" />
                                <Bar dataKey="confirmed" fill="hsl(27 87% 67%)" radius={[4, 4, 0, 0]} name="Confirmed" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-md border-border/50">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Status Breakdown</CardTitle>
                        <p className="text-xs text-muted-foreground">All-time performance</p>
                    </CardHeader>
                    <CardContent>
                        {statusBreakdown.length === 0 ? (
                            <div className="h-[150px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                                        {statusBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        <div className="space-y-2 mt-2">
                            {statusBreakdown.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                                    <span className="text-xs text-muted-foreground flex-1">{item.name}</span>
                                    <span className="text-xs font-bold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Reservations */}
            <Card className="shadow-md border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-bold">My Recent Reservations</CardTitle>
                    </div>
                    <Link href="/employee/reservations">
                        <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs">
                            View All <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="p-0">
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
                            {resLoading ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
                            ) : recentReservations.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">No reservations yet</td></tr>
                            ) : recentReservations.map((r: any) => {
                                const sc = statusConfig[r.status as string];
                                if (!sc) return null;
                                return (
                                    <tr key={r.code} className="border-b border-border/40 hover:bg-muted/30">
                                        <td className="px-6 py-3.5">
                                            <div className="font-semibold">{r.clientName}</div>
                                            <div className="text-xs font-mono text-muted-foreground">{r.code}</div>
                                        </td>
                                        <td className="px-4 py-3.5 hidden md:table-cell text-xs text-muted-foreground">
                                            {r.package?.titleEn ?? r.packageName ?? "—"}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.class}`}>
                                                <sc.icon className="w-3 h-3" />
                                                {(r.status as string).replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-right text-xs font-bold">
                                            {Number(r.totalPriceDZD ?? r.amount ?? 0).toLocaleString('fr-DZ')} DZD
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
