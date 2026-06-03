import { useState, useMemo } from "react";
import {
    Search, Download, RefreshCw, Eye, Edit2, ChevronLeft,
    ChevronRight, CheckCircle, XCircle, Clock, Pause, Users,
    FileText, UserPlus, X, IdCard, BarChart3, TrendingUp,
    DollarSign, CalendarDays, Mountain, ShieldCheck, Phone, Mail,
    CreditCard, AlertCircle, ZoomIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
    DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useReservations, useUpdateReservationStatus, useUpdateReservation } from "@/hooks/use-reservations";
import { useEmployees } from "@/hooks/use-employees";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, Cell
} from "recharts";

const statusConfig: Record<string, { label: string; badge: string; icon: any; canTransitionTo: string[] }> = {
    PENDING:   { label: "Pending",   badge: "bg-amber-100 text-amber-800 border border-amber-200",    icon: Clock,        canTransitionTo: ["IN_REVIEW", "REJECTED"] },
    IN_REVIEW: { label: "In Review", badge: "bg-blue-100 text-blue-800 border border-blue-200",       icon: Eye,          canTransitionTo: ["CONFIRMED", "REJECTED"] },
    CONFIRMED: { label: "Confirmed", badge: "bg-emerald-100 text-emerald-800 border border-emerald-200", icon: CheckCircle,  canTransitionTo: ["COMPLETED", "CANCELLED"] },
    REJECTED:  { label: "Rejected",  badge: "bg-red-100 text-red-800 border border-red-200",          icon: XCircle,      canTransitionTo: [] },
    CANCELLED: { label: "Cancelled", badge: "bg-gray-100 text-gray-700 border border-gray-200",       icon: Pause,        canTransitionTo: [] },
    COMPLETED: { label: "Completed", badge: "bg-purple-100 text-purple-800 border border-purple-200", icon: CheckCircle,  canTransitionTo: [] },
};

const INITIALS_COLORS = [
    "from-blue-500 to-blue-700",
    "from-violet-500 to-purple-700",
    "from-emerald-500 to-teal-700",
    "from-rose-500 to-red-700",
];

function empColor(id: number) { return INITIALS_COLORS[id % INITIALS_COLORS.length]; }

const ITEMS_PER_PAGE = 6;

export default function AdminReservations() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [selectedRes, setSelectedRes] = useState<any>(null);
    const [viewModal, setViewModal] = useState(false);
    const [statusModal, setStatusModal] = useState(false);
    const [statsModal, setStatsModal] = useState(false);
    const [idPreviewModal, setIdPreviewModal] = useState(false);
    const [showGlobalStats, setShowGlobalStats] = useState(false);
    const [statsRes, setStatsRes] = useState<any>(null);
    const [newStatus, setNewStatus] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkAssignModal, setBulkAssignModal] = useState(false);
    const [bulkEmployeeId, setBulkEmployeeId] = useState<string>("");

    const { data: resData, isLoading: resLoading } = useReservations();
    const reservations: any[] = (resData as any[]) ?? [];

    const { data: empData } = useEmployees();
    const EMPLOYEES: any[] = ((empData as any[]) ?? []).filter((e: any) => e.role === "EMPLOYEE" && e.isActive);

    const updateStatus = useUpdateReservationStatus();
    const updateRes = useUpdateReservation();

    const filtered = useMemo(() => reservations.filter((r: any) => {
        const matchSearch =
            (r.clientName ?? "").toLowerCase().includes(search.toLowerCase()) ||
            (r.code ?? "").toLowerCase().includes(search.toLowerCase()) ||
            (r.package?.titleEn ?? "").toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || r.status === statusFilter;
        return matchSearch && matchStatus;
    }), [reservations, search, statusFilter]);

    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

    const openView = (r: any) => { setSelectedRes(r); setViewModal(true); };
    const openStatus = (r: any) => { setSelectedRes(r); setNewStatus(""); setRejectionReason(""); setStatusModal(true); };
    const openStats = (r: any) => { setStatsRes(r); setStatsModal(true); };

    const applyStatus = () => {
        if (!newStatus || !selectedRes) return;
        updateStatus.mutate({ id: selectedRes.id, status: newStatus, rejectionReason });
        setStatusModal(false);
        setSelectedRes(null);
    };

    const assignEmployee = (reservationId: number, employeeId: number | null) => {
        updateRes.mutate({ id: reservationId, assignedToId: employeeId });
    };

    const applyBulkAssign = () => {
        if (!bulkEmployeeId) return;
        const empId = bulkEmployeeId === "unassign" ? null : Number(bulkEmployeeId);
        selectedIds.forEach(reservationId => {
            updateRes.mutate({ id: reservationId, assignedToId: empId });
        });
        setSelectedIds(new Set());
        setBulkAssignModal(false);
        setBulkEmployeeId("");
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === paginated.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(paginated.map((r: any) => r.id)));
    };

    const getEmployee = (id: number | null) => EMPLOYEES.find((e: any) => e.id === id) ?? null;

    const statsChartData = [
        { label: "Pending", count: reservations.filter((r: any) => r.status === "PENDING").length, fill: "#f59e0b" },
        { label: "In Review", count: reservations.filter((r: any) => r.status === "IN_REVIEW").length, fill: "#3b82f6" },
        { label: "Confirmed", count: reservations.filter((r: any) => r.status === "CONFIRMED").length, fill: "#10b981" },
        { label: "Rejected", count: reservations.filter((r: any) => r.status === "REJECTED").length, fill: "#ef4444" },
    ];

    const employeeStats = useMemo(() => {
        return EMPLOYEES.map((emp: any) => {
            const handled = reservations.filter((r: any) => r.assignedToId === emp.id);
            const validated = handled.filter((r: any) => ["CONFIRMED", "COMPLETED"].includes(r.status)).length;
            return {
                ...emp,
                handledCount: handled.length,
                validatedCount: validated,
                rate: handled.length > 0 ? Math.round((validated / handled.length) * 100) : 0
            };
        }).sort((a: any, b: any) => b.validatedCount - a.validatedCount);
    }, [reservations, EMPLOYEES]);

    const packageStats = useMemo(() => {
        const counts: Record<string, number> = {};
        reservations.forEach((r: any) => {
            const name = r.package?.titleEn ?? "Unknown";
            counts[name] = (counts[name] || 0) + 1;
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    }, [reservations]);

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Hiking Reservations</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {filtered.length} total · {reservations.filter((r: any) => r.status === "PENDING").length} pending · {reservations.filter((r: any) => !r.assignedToId).length} unassigned
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {selectedIds.size > 0 && (
                        <Button
                            size="sm"
                            className="gap-2 bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-md hover:opacity-90"
                            onClick={() => setBulkAssignModal(true)}
                        >
                            <UserPlus className="w-4 h-4" />
                            Bulk Assign ({selectedIds.size})
                        </Button>
                    )}
                    <Button variant="outline" size="sm" className={`gap-2 ${showGlobalStats ? "bg-primary text-white border-primary" : ""}`} onClick={() => setShowGlobalStats(!showGlobalStats)}>
                        <BarChart3 className="w-4 h-4" /> {showGlobalStats ? "Hide Stats" : "Show Analytics"}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </Button>
                </div>
            </div>

            {/* KPI Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Revenue", value: `${reservations.reduce((a: number, r: any) => a + Number(r.totalPriceDZD ?? 0), 0).toLocaleString("fr-DZ")} DZD`, icon: DollarSign, color: "border-primary/20 bg-primary/5 text-primary" },
                    { label: "ID Verified", value: `${reservations.filter((r: any) => !!r.idCardImage).length} / ${reservations.length}`, icon: IdCard, color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
                    { label: "Pending Review", value: `${reservations.filter((r: any) => r.status === "PENDING").length}`, icon: Clock, color: "border-amber-200 bg-amber-50 text-amber-700" },
                    { label: "Total Travelers", value: `${reservations.reduce((a: number, r: any) => a + (r.numberOfTravelers ?? 0), 0)}`, icon: Users, color: "border-blue-200 bg-blue-50 text-blue-700" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={`rounded-2xl border p-4 ${color} transition-all hover:shadow-md`}>
                        <div className="flex items-center gap-2 mb-1.5 opacity-70">
                            <Icon className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
                        </div>
                        <div className="text-xl font-black">{value}</div>
                    </div>
                ))}
            </div>

            {/* Global Analytics Section */}
            <AnimatePresence>
                {showGlobalStats && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-4"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Status Breakdown */}
                            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" /> Status Overview
                                </h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={statsChartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
                                            <YAxis fontSize={10} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                                {statsChartData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Top Packages */}
                            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Mountain className="w-4 h-4" /> Popular Packages
                                </h3>
                                <div className="space-y-3">
                                    {packageStats.slice(0, 4).map((p, i) => (
                                        <div key={i} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                                                    {i + 1}
                                                </div>
                                                <span className="text-xs font-medium text-foreground truncate">{p.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all"
                                                        style={{ width: `${(p.count / reservations.length) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold w-4 text-right">{p.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Employee Performance Tracking */}
                            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm overflow-hidden flex flex-col">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Agent Validation Stats
                                </h3>
                                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                                    {employeeStats.map((emp: any) => (
                                        <div key={emp.id} className="flex items-center gap-3 p-2 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${empColor(emp.id)} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                                                {emp.initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-semibold truncate">{emp.name}</div>
                                                <div className="text-[10px] text-muted-foreground">{emp.handledCount} reservations assigned</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-emerald-600">✓ {emp.validatedCount} validated</div>
                                                <div className="text-[9px] text-muted-foreground">{emp.rate}% rate</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by client, code, package..."
                            className="pl-10 h-10 border-muted"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                            <SelectTrigger className="w-[150px] h-10"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {Object.entries(statusConfig).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/40 border-b border-border">
                                <th className="px-4 py-3.5 w-10">
                                    <Checkbox
                                        checked={paginated.length > 0 && selectedIds.size === paginated.length}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all"
                                    />
                                </th>
                                {["Reservation", "Client", "Package & Date", "ID Status", "Assigned To", "Amount", "Status", "Actions"].map(h => (
                                    <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {resLoading ? (
                                    <tr>
                                        <td colSpan={9} className="py-14 text-center text-muted-foreground">
                                            <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-30 animate-spin" />
                                            <p className="text-sm">Loading reservations…</p>
                                        </td>
                                    </tr>
                                ) : paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-14 text-center text-muted-foreground">
                                            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">No reservations found</p>
                                        </td>
                                    </tr>
                                ) : paginated.map((r: any, i: number) => {
                                    const sc = statusConfig[r.status];
                                    const emp = getEmployee(r.assignedToId ?? null);
                                    const isSelected = selectedIds.has(r.id);
                                    return (
                                        <motion.tr
                                            key={r.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                                        >
                                            <td className="px-4 py-4">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleSelect(r.id)}
                                                    aria-label={`Select ${r.code}`}
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-mono text-xs font-semibold text-primary">{r.code}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">{r.createdAt}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-semibold text-foreground">{r.clientName}</div>
                                                <div className="text-xs text-muted-foreground">{r.numberOfTravelers} traveler{r.numberOfTravelers > 1 ? "s" : ""}</div>
                                            </td>
                                            <td className="px-4 py-4 hidden md:table-cell">
                                                <div className="flex items-center gap-1.5 text-xs mb-0.5">
                                                    <Mountain className="w-3 h-3 text-primary shrink-0" />
                                                    <span className="truncate max-w-[100px] font-medium">{r.package?.titleEn ?? "—"}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <CalendarDays className="w-3 h-3 shrink-0" />
                                                    <span>{r.travelDate}</span>
                                                </div>
                                            </td>
                                            {/* ID Status */}
                                            <td className="px-4 py-4">
                                                {r.idCardImage ? (
                                                    <button
                                                        onClick={() => { setSelectedRes(r); setIdPreviewModal(true); }}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:opacity-80 ${!!r.idCardImage ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                                                    >
                                                        <IdCard className="w-3 h-3" />
                                                        Uploaded
                                                    </button>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                                                        <AlertCircle className="w-3 h-3" /> Missing
                                                    </span>
                                                )}
                                            </td>
                                            {/* Assigned To cell */}
                                            <td className="px-4 py-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="flex items-center gap-2 hover:bg-muted/50 rounded-lg px-2 py-1 transition-colors group">
                                                            {emp ? (
                                                                <>
                                                                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${empColor(emp.id)} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>
                                                                        {emp.initials}
                                                                    </div>
                                                                    <span className="text-xs font-medium text-foreground">{emp.name.split(" ")[0]}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                                                                        <Users className="w-3 h-3 text-muted-foreground/40" />
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground/60 italic">Unassigned</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start" className="w-52">
                                                        <DropdownMenuLabel className="text-xs text-muted-foreground">Assign to employee</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        {EMPLOYEES.map((e: any) => (
                                                            <DropdownMenuItem
                                                                key={e.id}
                                                                onClick={() => assignEmployee(r.id, e.id)}
                                                                className="gap-2 cursor-pointer"
                                                            >
                                                                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${empColor(e.id)} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>
                                                                    {e.initials}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="text-xs font-semibold">{e.name}</div>
                                                                    <div className="text-[10px] text-muted-foreground">{e.pendingCount} pending</div>
                                                                </div>
                                                                {r.assignedToId === e.id && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                                                            </DropdownMenuItem>
                                                        ))}
                                                        {r.assignedToId && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => assignEmployee(r.id, null)}
                                                                    className="gap-2 text-muted-foreground cursor-pointer"
                                                                >
                                                                    <X className="w-3.5 h-3.5" /> Unassign
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-bold text-sm text-foreground">{Number(r.totalPriceDZD ?? 0).toLocaleString("fr-DZ")}</div>
                                                <div className="text-xs text-muted-foreground">DZD</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.badge}`}>
                                                    <sc.icon className="w-3 h-3" />
                                                    {sc.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => openView(r)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="View Full Details">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openStats(r)} className="p-1.5 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors" title="Statistics">
                                                        <BarChart3 className="w-4 h-4" />
                                                    </button>
                                                    {sc.canTransitionTo.length > 0 && (
                                                        <button onClick={() => openStatus(r)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Change Status">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-muted/20">
                    <span className="text-xs text-muted-foreground">
                        {filtered.length > 0
                            ? `Showing ${(page - 1) * ITEMS_PER_PAGE + 1}–${Math.min(page * ITEMS_PER_PAGE, filtered.length)} of ${filtered.length}`
                            : "No results"}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)} aria-label="Previous page">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button key={i} onClick={() => setPage(i + 1)}
                                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${page === i + 1 ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}>
                                {i + 1}
                            </button>
                        ))}
                        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} aria-label="Next page">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* ==== Full Detail View Modal ==== */}
            <Dialog open={viewModal} onOpenChange={setViewModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" /> Reservation Full Details
                        </DialogTitle>
                        <DialogDescription className="font-mono text-xs">{selectedRes?.code}</DialogDescription>
                    </DialogHeader>
                    {selectedRes && (
                        <div className="space-y-5">
                            {/* Status badge */}
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${statusConfig[selectedRes.status]?.badge}`}>
                                    {selectedRes.status}
                                </span>
                                {!!selectedRes.idCardImage && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <ShieldCheck className="w-4 h-4" /> ID Uploaded
                                    </span>
                                )}
                            </div>

                            {/* Personal Info */}
                            <div className="rounded-2xl border border-border p-5 space-y-3">
                                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Client Information
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <div className="text-xs text-muted-foreground">Full Name</div>
                                        <div className="font-semibold mt-0.5">{selectedRes.clientName}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email</div>
                                        <div className="font-semibold mt-0.5 text-xs">{selectedRes.clientEmail}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</div>
                                        <div className="font-semibold mt-0.5">{selectedRes.clientPhone}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="w-3 h-3" /> NIN</div>
                                        <div className="font-semibold mt-0.5 font-mono text-xs">{selectedRes.clientNIN ? `${selectedRes.clientNIN.slice(0, 4)}••••••••••${selectedRes.clientNIN.slice(-4)}` : "—"}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Hiking Details */}
                            <div className="rounded-2xl border border-border p-5 space-y-3">
                                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                    <Mountain className="w-4 h-4" /> Hiking & Booking Details
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="col-span-2">
                                        <div className="text-xs text-muted-foreground">Package</div>
                                        <div className="font-semibold mt-0.5">{selectedRes.package?.titleEn ?? "—"}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Hiking Date</div>
                                        <div className="font-semibold mt-0.5">{selectedRes.travelDate}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Duration</div>
                                        <div className="font-semibold mt-0.5">{selectedRes.package?.durationDays ?? "—"} days</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Travelers</div>
                                        <div className="font-semibold mt-0.5">{selectedRes.numberOfTravelers} person(s)</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="w-3 h-3" /> Total Amount</div>
                                        <div className="font-black text-primary mt-0.5">{Number(selectedRes.totalPriceDZD ?? 0).toLocaleString("fr-DZ")} DZD</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Assigned To</div>
                                        <div className="font-semibold mt-0.5">{getEmployee(selectedRes.assignedToId)?.name ?? "Unassigned"}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Created</div>
                                        <div className="font-semibold mt-0.5">{selectedRes.createdAt}</div>
                                    </div>
                                </div>
                                {selectedRes.specialRequests && (
                                    <div className="pt-3 border-t border-border">
                                        <div className="text-xs text-muted-foreground mb-1">Special Requests</div>
                                        <div className="text-sm p-3 bg-muted/30 rounded-lg">{selectedRes.specialRequests}</div>
                                    </div>
                                )}
                                {selectedRes.rejectionReason && (
                                    <div className="pt-3 border-t border-border">
                                        <div className="text-xs text-destructive mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Rejection Reason</div>
                                        <div className="text-sm p-3 bg-red-50 rounded-lg text-red-800 border border-red-100">{selectedRes.rejectionReason}</div>
                                    </div>
                                )}
                            </div>

                            {/* Requirements checklist */}
                            {selectedRes.package?.requirements?.length > 0 && (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-2">
                                    <h3 className="font-bold text-sm text-amber-800 uppercase tracking-wide flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> Package Requirements
                                    </h3>
                                    {(selectedRes.package.requirements as string[]).map((req: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-amber-800">
                                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                            {req}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ID Card */}
                            <div className="rounded-2xl border border-border p-5">
                                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-4">
                                    <IdCard className="w-4 h-4" /> Identity Document (ID Card)
                                </h3>
                                {selectedRes.idCardImage ? (
                                    <div className="space-y-3">
                                        <div className="relative rounded-xl overflow-hidden border-2 border-border">
                                            <img
                                                src={selectedRes.idCardImage}
                                                alt="Client ID Card"
                                                className="w-full object-cover max-h-52"
                                            />
                                            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">
                                                ✓ Uploaded
                                            </div>
                                            <button
                                                onClick={() => setIdPreviewModal(true)}
                                                className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-colors"
                                            >
                                                <ZoomIn className="w-3.5 h-3.5" /> Full View
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                            🔒 ID photo is encrypted and used only for age & identity verification.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-red-200 bg-red-50 rounded-xl">
                                        <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                                        <div className="font-semibold text-red-700 text-sm">No ID Card Uploaded</div>
                                        <div className="text-xs text-red-500 mt-1">Client has not submitted an ID card photo.</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewModal(false)}>Close</Button>
                        {selectedRes && statusConfig[selectedRes.status]?.canTransitionTo.length > 0 && (
                            <Button onClick={() => { setViewModal(false); openStatus(selectedRes); }} className="bg-primary text-white">
                                Change Status
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ==== ID Card Full Preview Modal ==== */}
            <Dialog open={idPreviewModal} onOpenChange={setIdPreviewModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <IdCard className="w-5 h-5 text-primary" /> ID Card — {selectedRes?.clientName}
                        </DialogTitle>
                        <DialogDescription>Full view of uploaded identity document</DialogDescription>
                    </DialogHeader>
                    {selectedRes?.idCardImage && (
                        <div className="space-y-4">
                            <img
                                src={selectedRes.idCardImage}
                                alt="ID Card Full"
                                className="w-full rounded-xl border-2 border-border object-contain max-h-96"
                            />
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-muted/30 rounded-xl p-3">
                                    <div className="text-xs text-muted-foreground">Client Name</div>
                                    <div className="font-semibold mt-0.5">{selectedRes.clientName}</div>
                                </div>
                                <div className="bg-muted/30 rounded-xl p-3">
                                    <div className="text-xs text-muted-foreground">NIN Provided</div>
                                    <div className="font-semibold mt-0.5 font-mono text-xs">{selectedRes.clientNIN}</div>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl flex items-center gap-2 text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <ShieldCheck className="w-4 h-4 shrink-0" />
                                ID document uploaded and pending verification by admin
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIdPreviewModal(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ==== Reservation Statistics Modal ==== */}
            <Dialog open={statsModal} onOpenChange={setStatsModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" /> Reservation Statistics
                        </DialogTitle>
                        <DialogDescription>{statsRes?.code} — {statsRes?.clientName}</DialogDescription>
                    </DialogHeader>
                    {statsRes && (
                        <div className="space-y-6">
                            {/* KPIs */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Amount</div>
                                    <div className="text-xl font-black text-primary">{Number(statsRes.totalPriceDZD ?? 0).toLocaleString("fr-DZ")} <span className="text-xs">DZD</span></div>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                    <div className="text-xs text-emerald-700 uppercase font-semibold mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Travelers</div>
                                    <div className="text-xl font-black text-emerald-700">{statsRes.numberOfTravelers} person(s)</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="text-xs text-blue-700 uppercase font-semibold mb-1 flex items-center gap-1"><IdCard className="w-3 h-3" /> ID Status</div>
                                    <div className={`text-xl font-black ${!!statsRes.idCardImage ? "text-emerald-600" : "text-amber-600"}`}>{!!statsRes.idCardImage ? "Uploaded" : "Pending"}</div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Booking Timeline</h3>
                                <div className="space-y-2">
                                    {[
                                        { step: "Reservation Created", date: statsRes.createdAt, done: true },
                                        { step: "ID Card Uploaded", date: statsRes.idCardImage ? statsRes.createdAt : null, done: !!statsRes.idCardImage },
                                        { step: "ID Card Verified", date: null, done: false },
                                        { step: "Status: " + statusConfig[statsRes.status]?.label, date: statsRes.updatedAt ?? statsRes.createdAt, done: ["CONFIRMED", "COMPLETED"].includes(statsRes.status) },
                                    ].map(({ step, date, done }) => (
                                        <div key={step} className={`flex items-center gap-3 p-3 rounded-xl border ${done ? "border-emerald-200 bg-emerald-50" : "border-border bg-muted/20"}`}>
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-emerald-500" : "bg-muted border-2 border-muted-foreground/20"}`}>
                                                {done && <CheckCircle className="w-3 h-3 text-white" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`text-sm font-semibold ${done ? "text-emerald-800" : "text-muted-foreground"}`}>{step}</div>
                                            </div>
                                            {date && <div className="text-xs text-muted-foreground">{date}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Overall Reservations chart */}
                            <div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">All Reservations by Status</h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={statsChartData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis type="category" dataKey="label" fontSize={11} tickLine={false} axisLine={false} width={70} />
                                            <Tooltip />
                                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                                {statsChartData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatsModal(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Status Modal */}
            <Dialog open={statusModal} onOpenChange={setStatusModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Reservation Status</DialogTitle>
                        <DialogDescription>Changing status for <strong>{selectedRes?.code}</strong></DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            {selectedRes && statusConfig[selectedRes.status]?.canTransitionTo.map((s) => {
                                const sc = statusConfig[s];
                                return (
                                    <button key={s} onClick={() => setNewStatus(s)}
                                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${newStatus === s ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"}`}>
                                        <sc.icon className="w-4 h-4" />{sc.label}
                                    </button>
                                );
                            })}
                        </div>
                        {newStatus === "REJECTED" && (
                            <div>
                                <Label className="text-sm font-semibold mb-2 block">Rejection Reason <span className="text-destructive">*</span></Label>
                                <Textarea placeholder="Reason for rejection..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="resize-none" rows={3} />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusModal(false)}>Cancel</Button>
                        <Button onClick={applyStatus} disabled={!newStatus || (newStatus === "REJECTED" && !rejectionReason)} className="bg-primary text-white">Apply Status</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Assign Modal */}
            <Dialog open={bulkAssignModal} onOpenChange={setBulkAssignModal}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" /> Bulk Assign</DialogTitle>
                        <DialogDescription>Assign {selectedIds.size} selected reservation{selectedIds.size > 1 ? "s" : ""} to an employee.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        {EMPLOYEES.map((e: any) => (
                            <button key={e.id} onClick={() => setBulkEmployeeId(String(e.id))}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${bulkEmployeeId === String(e.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${empColor(e.id)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                    {e.initials}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-semibold">{e.name}</div>
                                    <div className="text-xs text-muted-foreground">{e.pendingCount} pending · {e.score}% score</div>
                                </div>
                                {bulkEmployeeId === String(e.id) && <CheckCircle className="w-4 h-4 text-primary" />}
                            </button>
                        ))}
                        <button onClick={() => setBulkEmployeeId("unassign")}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${bulkEmployeeId === "unassign" ? "border-red-300 bg-red-50" : "border-border hover:border-red-200"}`}>
                            <X className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Unassign all selected</span>
                        </button>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkAssignModal(false)}>Cancel</Button>
                        <Button onClick={applyBulkAssign} disabled={!bulkEmployeeId} className="bg-primary text-white gap-2">
                            <UserPlus className="w-4 h-4" /> Confirm Assignment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
