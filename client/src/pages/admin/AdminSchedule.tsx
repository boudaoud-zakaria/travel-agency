import { useState } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminSchedule } from "@/hooks/use-admin-schedule";
import { usePackages } from "@/hooks/use-packages";
import { CalendarDays, Users, Package, CheckCircle2, BedDouble } from "lucide-react";

const INITIALS_COLORS = [
    "from-blue-500 to-blue-700",
    "from-violet-500 to-purple-700",
    "from-emerald-500 to-teal-700",
    "from-rose-500 to-red-700",
];

function empColor(id: number) { return INITIALS_COLORS[id % INITIALS_COLORS.length]; }

export default function AdminSchedule() {
    const { employees, assignPackageToEmployee, toggleLeave } = useAdminSchedule();
    const { data: pkgData } = usePackages({ status: "ACTIVE" });

    const PACKAGES = ((pkgData as any[]) ?? []).map((p: any) => ({
        id: p.id as number,
        name: (p.titleEn ?? "") as string,
        emoji: "🥾",
        type: (p.type ?? "DOMESTIC") as string,
    }));

    const totalAssignments = employees.reduce((acc, e) => acc + e.assignedPackageIds.length, 0);
    const onLeaveCount = employees.filter(e => e.isOnLeave).length;
    const unassignedPackages = PACKAGES.filter(
        p => !employees.some(e => e.assignedPackageIds.includes(p.id) && !e.isOnLeave)
    );

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Employee Schedule & Roster</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Assign employees to packages and manage availability
                </p>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Active Employees", value: employees.filter(e => !e.isOnLeave).length, icon: Users, color: "bg-emerald-100 text-emerald-600" },
                    { label: "On Leave", value: onLeaveCount, icon: BedDouble, color: "bg-amber-100 text-amber-600" },
                    { label: "Total Packages", value: PACKAGES.length, icon: Package, color: "bg-blue-100 text-blue-600" },
                    { label: "Total Assignments", value: totalAssignments, icon: CheckCircle2, color: "bg-purple-100 text-purple-600" },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="bg-white rounded-2xl border border-border shadow-sm p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-black text-foreground">{s.value}</div>
                            <div className="text-xs text-muted-foreground">{s.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Roster Grid */}
            <Card className="shadow-md border-border/50">
                <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-primary" /> Assignment Roster
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Click a cell to toggle assignment. Toggle the switch to mark employee as On Leave.</p>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/40 border-b border-border">
                                    <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-[200px]">
                                        Employee
                                    </th>
                                    <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                                        Leave
                                    </th>
                                    {PACKAGES.map(p => (
                                        <th key={p.id} className="px-3 py-4 text-center min-w-[100px]">
                                            <div className="text-lg">{p.emoji}</div>
                                            <div className="text-[10px] font-semibold text-muted-foreground leading-tight mt-0.5 max-w-[90px] mx-auto truncate">
                                                {p.name}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp, i) => (
                                    <motion.tr
                                        key={emp.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`border-b border-border/50 transition-colors ${emp.isOnLeave ? "bg-amber-50/50" : "hover:bg-muted/10"}`}
                                    >
                                        {/* Employee info */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${empColor(emp.id)} flex items-center justify-center text-white font-bold text-sm shrink-0 ${emp.isOnLeave ? "opacity-50" : ""}`}>
                                                    {emp.initials}
                                                </div>
                                                <div>
                                                    <div className={`font-semibold text-sm ${emp.isOnLeave ? "text-muted-foreground" : "text-foreground"}`}>
                                                        {emp.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                        <span className="text-amber-600 font-medium">{emp.pendingCount} pending</span>
                                                        {emp.isOnLeave && (
                                                            <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600 py-0 px-1.5">
                                                                On Leave
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Leave toggle */}
                                        <td className="px-4 py-4 text-center">
                                            <Switch
                                                checked={emp.isOnLeave}
                                                onCheckedChange={() => toggleLeave(emp.id)}
                                                aria-label={`Toggle leave for ${emp.name}`}
                                            />
                                        </td>

                                        {/* Package assignment cells */}
                                        {PACKAGES.map(pkg => {
                                            const isAssigned = emp.assignedPackageIds.includes(pkg.id);
                                            return (
                                                <td key={pkg.id} className="px-3 py-4 text-center">
                                                    <button
                                                        onClick={() => !emp.isOnLeave && assignPackageToEmployee(emp.id, pkg.id)}
                                                        disabled={emp.isOnLeave}
                                                        aria-label={`${isAssigned ? "Unassign" : "Assign"} ${pkg.name} to ${emp.name}`}
                                                        className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center transition-all ${
                                                            emp.isOnLeave
                                                                ? "bg-muted/30 cursor-not-allowed"
                                                                : isAssigned
                                                                    ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-600"
                                                                    : "bg-muted/40 hover:bg-muted text-muted-foreground/40 hover:text-muted-foreground"
                                                        }`}
                                                    >
                                                        {isAssigned ? (
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        ) : (
                                                            <span className="text-lg leading-none opacity-30">+</span>
                                                        )}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Unassigned packages alert */}
            {unassignedPackages.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3"
                >
                    <span className="text-2xl shrink-0">⚠️</span>
                    <div>
                        <p className="text-sm font-semibold text-amber-800">Unassigned Packages</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                            The following packages have no active employee assigned:{" "}
                            <strong>{unassignedPackages.map(p => p.name).join(", ")}</strong>
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Employee workload summary */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {employees.map((emp, i) => (
                    <motion.div key={emp.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className={`bg-white rounded-2xl border shadow-sm p-4 ${emp.isOnLeave ? "border-amber-200 opacity-70" : "border-border/50"}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${empColor(emp.id)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                {emp.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold truncate">{emp.name.split(" ")[0]}</div>
                                <div className="text-xs text-muted-foreground">{emp.assignedPackageIds.length} package{emp.assignedPackageIds.length !== 1 ? "s" : ""}</div>
                            </div>
                        </div>
                        <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Pending</span>
                                <span className={`font-bold ${emp.pendingCount > 5 ? "text-red-500" : "text-amber-600"}`}>{emp.pendingCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Confirmed</span>
                                <span className="font-bold text-emerald-600">{emp.confirmedCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Score</span>
                                <span className="font-bold">{emp.score}%</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
