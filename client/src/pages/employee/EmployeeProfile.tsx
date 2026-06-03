import { useUser } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    User, Mail, Phone, Lock, Shield, Save, Loader2, CheckCircle,
    Camera, AlertCircle, ShieldCheck, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useEmployeeStats } from "@/hooks/use-employee-stats";

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type PasswordErrors = Partial<Record<"currentPassword" | "newPassword" | "confirmPassword", string>>;

export default function EmployeeProfile() {
    const { data: user } = useUser();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { summary } = useEmployeeStats();

    const [saved, setSaved] = useState(false);
    const [pwSaved, setPwSaved] = useState(false);
    const [pwErrors, setPwErrors] = useState<PasswordErrors>({});

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
    });

    // Populate form from real user data when it loads
    useEffect(() => {
        if (!user) return;
        setForm({
            name: (user as any).name ?? "",
            email: (user as any).email ?? "",
            phone: (user as any).phone ?? "",
        });
    }, [user]);

    const [pwForm, setPwForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [notifPrefs, setNotifPrefs] = useState({
        emailAlerts: true,
        browserNotifications: false,
        reservationUpdates: true,
        systemAnnouncements: true,
    });

    const updateProfile = useMutation({
        mutationFn: () => authApi.updateProfile({ name: form.name, phone: form.phone }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
    });

    const changePassword = useMutation({
        mutationFn: () => authApi.changePassword(pwForm.currentPassword, pwForm.newPassword),
        onSuccess: () => {
            setPwSaved(true);
            setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setTimeout(() => setPwSaved(false), 3000);
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
    });

    const handleSave = () => updateProfile.mutate();

    const handlePasswordSave = () => {
        const result = passwordSchema.safeParse(pwForm);
        if (!result.success) {
            const errs: PasswordErrors = {};
            result.error.errors.forEach(e => {
                const key = e.path[0] as keyof PasswordErrors;
                errs[key] = e.message;
            });
            setPwErrors(errs);
            return;
        }
        setPwErrors({});
        changePassword.mutate();
    };

    const saving = updateProfile.isPending;
    const pwSaving = changePassword.isPending;

    const initials = form.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">My Profile</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage your account information and preferences</p>
                </div>

                {/* Avatar section */}
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6 flex items-center gap-5">
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-black">
                            {initials}
                        </div>
                        <button
                            className="absolute -bottom-2 -right-2 w-7 h-7 bg-white border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted/50 transition-colors"
                            aria-label="Change photo"
                        >
                            <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-xl text-foreground">{form.name}</div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                <Shield className="w-3 h-3" />
                                Employee
                            </span>
                            <span className="text-xs text-muted-foreground">Member since Jan 2024</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                            <span>📋 {summary.totalHandled} reservations handled</span>
                            <span>⭐ {summary.overallConfirmationRate}% performance</span>
                        </div>
                    </div>
                </div>

                {/* Personal Info */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-border shadow-sm p-6"
                >
                    <h2 className="font-bold text-base mb-5 flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" /> Personal Information
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="pl-10 h-11" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="pl-10 h-11" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Phone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="pl-10 h-11" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-5">
                        {saved && (
                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                <CheckCircle className="w-4 h-4" /> Saved!
                            </motion.div>
                        )}
                        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-white px-6 h-10">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </Button>
                    </div>
                </motion.div>

                {/* Change Password */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-border shadow-sm p-6"
                >
                    <h2 className="font-bold text-base mb-5 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" /> Change Password
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Current Password</Label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={pwForm.currentPassword}
                                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                                className={`h-11 ${pwErrors.currentPassword ? "border-red-400" : ""}`}
                            />
                            {pwErrors.currentPassword && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3" /> {pwErrors.currentPassword}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">New Password</Label>
                                <Input
                                    type="password"
                                    placeholder="Min 8 characters"
                                    value={pwForm.newPassword}
                                    onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                                    className={`h-11 ${pwErrors.newPassword ? "border-red-400" : ""}`}
                                />
                                {pwErrors.newPassword && (
                                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-3 h-3" /> {pwErrors.newPassword}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Confirm Password</Label>
                                <Input
                                    type="password"
                                    placeholder="Repeat password"
                                    value={pwForm.confirmPassword}
                                    onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                    className={`h-11 ${pwErrors.confirmPassword ? "border-red-400" : ""}`}
                                />
                                {pwErrors.confirmPassword && (
                                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-3 h-3" /> {pwErrors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-5">
                        {pwSaved && (
                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                <CheckCircle className="w-4 h-4" /> Password updated!
                            </motion.div>
                        )}
                        <Button onClick={handlePasswordSave} disabled={pwSaving} className="gap-2 bg-primary text-white px-6 h-10">
                            {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            Update Password
                        </Button>
                    </div>
                </motion.div>

                {/* Notification Preferences */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white rounded-2xl border border-border shadow-sm p-6"
                >
                    <h2 className="font-bold text-base mb-5 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" /> Notification Preferences
                    </h2>
                    <div className="space-y-4">
                        {[
                            { key: "emailAlerts" as const,          label: "Email Alerts",           desc: "Receive important alerts via email" },
                            { key: "browserNotifications" as const,  label: "Browser Notifications",  desc: "Push notifications in the browser" },
                            { key: "reservationUpdates" as const,    label: "Reservation Updates",    desc: "Notify when a reservation status changes" },
                            { key: "systemAnnouncements" as const,   label: "System Announcements",   desc: "Platform updates and maintenance notices" },
                        ].map(({ key, label, desc }) => (
                            <div key={key} className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-sm font-semibold">{label}</div>
                                    <div className="text-xs text-muted-foreground">{desc}</div>
                                </div>
                                <Switch
                                    checked={notifPrefs[key]}
                                    onCheckedChange={v => setNotifPrefs(p => ({ ...p, [key]: v }))}
                                    aria-label={label}
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Account Security */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-border shadow-sm p-6"
                >
                    <h2 className="font-bold text-base mb-5 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" /> Account Security
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <Clock className="w-3.5 h-3.5" /> Last Login
                            </div>
                            <div className="font-semibold text-sm">
                                {(user as any)?.lastLoginAt
                                    ? new Date((user as any).lastLoginAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                                    : "—"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">This device</div>
                        </div>
                        <div className="bg-muted/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <ShieldCheck className="w-3.5 h-3.5" /> Active Sessions
                            </div>
                            <div className="font-semibold text-sm">1 session</div>
                            <div className="text-xs text-muted-foreground mt-0.5">This device</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
