import { useState, useMemo } from "react";
import { Search, CheckCircle, Clock, XCircle, Eye, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { useEmployeeReservations } from "@/hooks/use-employee-reservations";
import ReservationDrawer from "@/components/employee/ReservationDrawer";
import type { Reservation, ReservationStatus } from "@/types/employee";

type TabValue = "ALL" | ReservationStatus;

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; icon: any }> = {
    PENDING:   { label: "Pending",   badgeClass: "badge-pending",   icon: Clock },
    IN_REVIEW: { label: "In Review", badgeClass: "badge-in-review", icon: Eye },
    CONFIRMED: { label: "Confirmed", badgeClass: "badge-confirmed", icon: CheckCircle },
    REJECTED:  { label: "Rejected",  badgeClass: "badge-rejected",  icon: XCircle },
};

const TABS: { value: TabValue; label: string }[] = [
    { value: "ALL",       label: "All" },
    { value: "PENDING",   label: "Pending" },
    { value: "IN_REVIEW", label: "In Review" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "REJECTED",  label: "Rejected" },
];

const ITEMS_PER_PAGE = 8;

function exportCSV(reservations: Reservation[]) {
    const headers = ["Code", "Client", "Phone", "Package", "Status", "Amount (DZD)", "Travelers", "Assigned At"];
    const rows = reservations.map(r => [
        r.code,
        r.clientName,
        r.clientPhone,
        r.packageName,
        r.status,
        r.amount,
        r.travelersCount,
        new Date(r.assignedAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function EmployeeReservations() {
    const { data: reservations, updateStatus, updateNotes, countsByStatus } = useEmployeeReservations();

    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<TabValue>("ALL");
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerReservation, setDrawerReservation] = useState<Reservation | null>(null);

    const filtered = useMemo(() => {
        return reservations.filter(r => {
            const matchSearch =
                r.clientName.toLowerCase().includes(search.toLowerCase()) ||
                r.code.toLowerCase().includes(search.toLowerCase());
            const matchTab = activeTab === "ALL" || r.status === activeTab;
            return matchSearch && matchTab;
        });
    }, [reservations, search, activeTab]);

    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

    const openDrawer = (r: Reservation) => {
        setDrawerReservation(r);
        setDrawerOpen(true);
    };

    const toggleSelect = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === paginated.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginated.map(r => r.id)));
        }
    };

    const handleTabChange = (v: string) => {
        setActiveTab(v as TabValue);
        setPage(1);
        setSelectedIds(new Set());
    };

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">My Reservations</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {filtered.length} reservations · {countsByStatus.PENDING} pending your review
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 self-start md:self-auto"
                    onClick={() => exportCSV(filtered)}
                >
                    <Download className="w-4 h-4" /> Export CSV
                </Button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by client name or reservation code..."
                        className="pl-10 h-10 border-muted"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="h-auto p-1 flex-wrap gap-1 bg-muted/50">
                    {TABS.map(tab => {
                        const count = countsByStatus[tab.value as keyof typeof countsByStatus] ?? 0;
                        return (
                            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs">
                                {tab.label}
                                <span className="bg-background/60 text-foreground px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[18px] text-center">
                                    {count}
                                </span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </Tabs>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
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
                            {["Code", "Client", "Package", "Amount", "Status"].map(h => (
                                <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="wait">
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 opacity-30" />
                                            <span className="text-sm">No reservations found</span>
                                            <span className="text-xs opacity-60">Try adjusting your search or filter</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((r, i) => {
                                    const sc = STATUS_CONFIG[r.status];
                                    const isSelected = selectedIds.has(r.id);
                                    return (
                                        <motion.tr
                                            key={r.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.04 }}
                                            onClick={() => openDrawer(r)}
                                            className={`border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer ${isSelected ? "bg-primary/5" : ""}`}
                                        >
                                            <td className="px-4 py-4" onClick={e => toggleSelect(r.id, e)}>
                                                <Checkbox checked={isSelected} aria-label={`Select ${r.code}`} />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-mono text-xs font-semibold text-primary">{r.code}</div>
                                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                                    {new Date(r.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-semibold">{r.clientName}</div>
                                                <div className="text-xs text-muted-foreground">{r.travelersCount} traveler{r.travelersCount > 1 ? "s" : ""}</div>
                                            </td>
                                            <td className="px-4 py-4 hidden md:table-cell">
                                                <span className="text-xs text-muted-foreground truncate max-w-[140px] block">{r.packageName}</span>
                                            </td>
                                            <td className="px-4 py-4 font-bold text-sm whitespace-nowrap">
                                                {r.amount.toLocaleString("fr-DZ")}
                                                <span className="text-muted-foreground font-normal text-xs ml-1">DZD</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.badgeClass}`}>
                                                    <sc.icon className="w-3 h-3" />
                                                    {sc.label}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-muted/20">
                        <span className="text-xs text-muted-foreground">
                            Page {page} of {totalPages} · {filtered.length} total
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)} aria-label="Previous page">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} aria-label="Next page">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Drawer */}
            <ReservationDrawer
                reservation={drawerReservation}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onStatusChange={updateStatus}
                onNotesChange={updateNotes}
            />
        </div>
    );
}
