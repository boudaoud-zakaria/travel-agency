import { useState } from "react";
import {
    Plus, Search, Edit2, Ban, UserCheck,
    ChevronLeft, ChevronRight, Shield, User, Mail, Phone,
    Activity, Loader2, Package, Clock, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useActivityLog } from "@/hooks/use-activity-log";
import { useAdminSchedule } from "@/hooks/use-admin-schedule";
import { useEmployees, useCreateEmployee, useUpdateEmployee, useToggleEmployeeStatus } from "@/hooks/use-employees";
import { usePackages } from "@/hooks/use-packages";
import ActivityFeed from "@/components/admin/ActivityFeed";

const roleConfig: Record<string, { label: string; class: string }> = {
    EMPLOYEE: { label: "Employee", class: "bg-blue-100 text-blue-800 border-blue-200" },
    SUPER_ADMIN: { label: "Super Admin", class: "bg-amber-100 text-amber-800 border-amber-200" },
};

export default function AdminEmployees() {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [modal, setModal] = useState(false);
    const [editEmp, setEditEmp] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [drawerEmp, setDrawerEmp] = useState<any>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const { data: activityLogs } = useActivityLog(drawerEmp?.id);
    const { employees: scheduleEmployees } = useAdminSchedule();

    const openDrawer = (emp: any) => { setDrawerEmp(emp); setDrawerOpen(true); };
    const scheduleData = drawerEmp
        ? scheduleEmployees.find(e => e.id === drawerEmp.id)
        : null;

    const { data: empData, isLoading: empLoading } = useEmployees();
    const createEmployee = useCreateEmployee();
    const updateEmployee = useUpdateEmployee();
    const toggleStatus = useToggleEmployeeStatus();
    const { data: pkgData } = usePackages();

    const employees: any[] = (empData as any[]) ?? [];
    const packagesMap: Record<number, string> = Object.fromEntries(
        ((pkgData as any[]) ?? []).map((p: any) => [p.id, p.titleEn])
    );

    const [form, setForm] = useState({
        name: "", email: "", phone: "", role: "EMPLOYEE", password: ""
    });

    const ITEMS = 6;

    const filtered = employees.filter(e => {
        const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.includes(search);
        const matchRole = roleFilter === "all" || e.role === roleFilter;
        return matchSearch && matchRole;
    });

    const paginated = filtered.slice((page - 1) * ITEMS, page * ITEMS);
    const totalPages = Math.ceil(filtered.length / ITEMS);

    const openCreate = () => {
        setEditEmp(null);
        setForm({ name: "", email: "", phone: "", role: "EMPLOYEE", password: "" });
        setModal(true);
    };

    const openEdit = (emp: any) => {
        setEditEmp(emp);
        setForm({ name: emp.name, email: emp.email, phone: emp.phone, role: emp.role, password: "" });
        setModal(true);
    };

    const handleSave = async () => {
        if (editEmp) {
            await updateEmployee.mutateAsync({ id: editEmp.id, ...form });
        } else {
            await createEmployee.mutateAsync(form as Record<string, unknown>);
        }
        setModal(false);
    };

    const toggleActive = (id: number) => {
        toggleStatus.mutate(id);
    };

    const saving = createEmployee.isPending || updateEmployee.isPending;

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Employee Management</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {employees.filter(e => e.isActive).length} active · {employees.filter(e => !e.isActive).length} inactive
                    </p>
                </div>
                <Button onClick={openCreate} className="gap-2 bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-md shadow-primary/20 hover:opacity-90">
                    <Plus className="w-4 h-4" /> Add Employee
                </Button>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Employees", value: employees.length, icon: User, color: "bg-blue-100 text-blue-600" },
                    { label: "Active", value: employees.filter(e => e.isActive).length, icon: UserCheck, color: "bg-emerald-100 text-emerald-600" },
                    { label: "Super Admins", value: employees.filter(e => e.role === "SUPER_ADMIN").length, icon: Shield, color: "bg-amber-100 text-amber-600" },
                    { label: "Avg Performance", value: employees.length ? `${(employees.reduce((acc: number, e: any) => acc + (e.score ?? e.performance ?? 0), 0) / employees.length).toFixed(1)}%` : "—", icon: Activity, color: "bg-purple-100 text-purple-600" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-border shadow-sm p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center shrink-0`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-black text-foreground">{stat.value}</div>
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name or email..." className="pl-10 h-10 border-muted" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px] h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="EMPLOYEE">Employee</SelectItem>
                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-muted/40 border-b border-border">
                            {["Employee", "Role", "Contact", "Performance", "Last Login", "Status", "Actions"].map(h => (
                                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {empLoading && (
                            <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">Loading employees...</td></tr>
                        )}
                        <AnimatePresence>
                            {paginated.map((emp, i) => {
                                const rc = roleConfig[emp.role];
                                return (
                                    <motion.tr
                                        key={emp.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.04 }}
                                        onClick={() => openDrawer(emp)}
                                        className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                    {emp.name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-foreground">{emp.name}</div>
                                                    <div className="text-xs text-muted-foreground">{emp.totalHandled ?? emp.reservationsHandled ?? 0} reservations handled</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${rc.class}`}>
                                                {emp.role === "SUPER_ADMIN" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                {rc.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="text-xs">{emp.email}</div>
                                            <div className="text-xs text-muted-foreground">{emp.phone}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-muted rounded-full h-1.5 w-16">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                                                        style={{ width: `${emp.score ?? emp.performance ?? 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-foreground">{emp.score ?? emp.performance ?? 0}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-muted-foreground">{emp.lastLoginAt}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${emp.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${emp.isActive ? "bg-emerald-500" : "bg-gray-400"}`}></span>
                                                {emp.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => openEdit(emp)}
                                                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                    aria-label="Edit employee"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleActive(emp.id)}
                                                    className={`p-1.5 rounded-lg transition-colors ${emp.isActive
                                                            ? "hover:bg-red-50 text-muted-foreground hover:text-red-500"
                                                            : "hover:bg-emerald-50 text-muted-foreground hover:text-emerald-500"
                                                        }`}
                                                    title={emp.isActive ? "Deactivate" : "Activate"}
                                                    aria-label={emp.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {emp.isActive ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-muted/20">
                        <span className="text-xs text-muted-foreground">
                            Showing {(page - 1) * ITEMS + 1}–{Math.min(page * ITEMS, filtered.length)} of {filtered.length}
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Employee Detail Drawer */}
            <Sheet open={drawerOpen} onOpenChange={v => !v && setDrawerOpen(false)}>
                <SheetContent side="right" className="w-full sm:max-w-[440px] p-0 flex flex-col">
                    {drawerEmp && (
                        <>
                            <SheetHeader className="px-6 py-5 border-b border-border shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-lg shrink-0">
                                        {drawerEmp.name[0]}
                                    </div>
                                    <div>
                                        <SheetTitle className="text-base font-bold leading-tight">{drawerEmp.name}</SheetTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">{drawerEmp.email}</p>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${roleConfig[drawerEmp.role]?.class}`}>
                                            {drawerEmp.role === "SUPER_ADMIN" ? <Shield className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                                            {roleConfig[drawerEmp.role]?.label}
                                        </span>
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                                {/* Workload */}
                                <section>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Current Workload</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: "Handled", value: drawerEmp.totalHandled ?? drawerEmp.reservationsHandled ?? 0, icon: Activity, color: "text-blue-600 bg-blue-50" },
                                            { label: "Pending", value: scheduleData?.pendingCount ?? "—", icon: Clock, color: "text-amber-600 bg-amber-50" },
                                            { label: "Confirmed", value: scheduleData?.confirmedCount ?? "—", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
                                        ].map(s => (
                                            <div key={s.label} className={`rounded-xl p-3 ${s.color.split(" ")[1]}`}>
                                                <s.icon className={`w-4 h-4 ${s.color.split(" ")[0]} mb-1`} />
                                                <div className={`text-xl font-black ${s.color.split(" ")[0]}`}>{s.value}</div>
                                                <div className="text-xs text-muted-foreground">{s.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Performance score</span>
                                            <span className="font-bold">{drawerEmp.score ?? drawerEmp.performance ?? 0}%</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${drawerEmp.score ?? drawerEmp.performance ?? 0}%` }} />
                                        </div>
                                    </div>
                                </section>

                                {/* Assigned packages */}
                                <section>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                        <Package className="w-3.5 h-3.5" /> Assigned Packages
                                    </h3>
                                    {scheduleData && scheduleData.assignedPackageIds.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {scheduleData.assignedPackageIds.map(id => (
                                                <span key={id} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                                                    {packagesMap[id] ?? `Package #${id}`}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">No packages assigned yet</p>
                                    )}
                                </section>

                                {/* Mini activity feed */}
                                <section>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Recent Activity</h3>
                                    {activityLogs.length > 0 ? (
                                        <ActivityFeed logs={activityLogs} maxItems={5} />
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">No recent activity</p>
                                    )}
                                </section>
                            </div>

                            <div className="px-6 py-4 border-t border-border shrink-0 flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 gap-2"
                                    onClick={() => { setDrawerOpen(false); openEdit(drawerEmp); }}
                                >
                                    <Edit2 className="w-4 h-4" /> Edit
                                </Button>
                                <Button variant="ghost" onClick={() => setDrawerOpen(false)} className="flex-1">
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* Create/Edit Modal */}
            <Dialog open={modal} onOpenChange={setModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {editEmp ? <Edit2 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                            {editEmp ? "Edit Employee" : "Create Employee Account"}
                        </DialogTitle>
                        <DialogDescription>
                            {editEmp ? "Update employee information" : "Create a new employee account. An email will be sent with login credentials."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Full Name *</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Yasmine Boudiaf" className="pl-10 h-10" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Email *</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="employee@rihla.dz" className="pl-10 h-10" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+213 555 000 000" className="pl-10 h-10" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Role *</Label>
                            <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {!editEmp && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Initial Password *</Label>
                                <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters..." className="h-10" />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={!form.name || !form.email || saving}
                            className="bg-primary text-white gap-2"
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editEmp ? "Save Changes" : "Create Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
