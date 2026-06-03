import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, CheckCircle, Clock, Eye, XCircle, Pause,
    AlertTriangle, Phone, FileText, Users, Banknote,
    Calendar, Package, Loader2, Ban
} from "lucide-react";

import { reservationsApi } from "@/lib/api";

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    PENDING:   { label: "Pending",   icon: Clock,        color: "text-amber-700",  bg: "bg-amber-50 border-amber-200"   },
    IN_REVIEW: { label: "In Review", icon: Eye,          color: "text-blue-700",   bg: "bg-blue-50 border-blue-200"     },
    CONFIRMED: { label: "Confirmed", icon: CheckCircle,  color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200"},
    REJECTED:  { label: "Rejected",  icon: XCircle,      color: "text-red-700",    bg: "bg-red-50 border-red-200"       },
    CANCELLED: { label: "Cancelled", icon: Pause,        color: "text-gray-600",   bg: "bg-gray-50 border-gray-200"     },
};

const CANCELLABLE = ["PENDING", "IN_REVIEW"];

type ReservationView = {
    id: number; code: string; clientName: string; clientPhone: string;
    packageName: string; travelDate: string; travelers: number;
    totalPrice: number; status: string; createdAt: string;
};

export default function MyReservation() {
    const [code, setCode] = useState("");
    const [phone, setPhone] = useState("");
    const [searching, setSearching] = useState(false);
    const [reservation, setReservation] = useState<ReservationView | null>(null);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);

    const handleLookup = async () => {
        setError("");
        setReservation(null);
        setCancelled(false);
        setConfirmCancel(false);
        if (!code.trim() || !phone.trim()) {
            setError("Please enter both your reservation code and phone number.");
            return;
        }
        setSearching(true);
        try {
            const found = await reservationsApi.getByCode(code.trim().toUpperCase()) as Record<string, unknown>;
            // Verify phone matches (last 8 digits)
            const normalise = (p: string) => p.replace(/\D/g, "").slice(-8);
            if (normalise(found.clientPhone as string) !== normalise(phone)) {
                setError("The phone number does not match our records for this reservation.");
                return;
            }
            const pkg = found.package as Record<string, unknown> | null;
            const travelDate = found.travelDate as string;
            const createdAt = found.createdAt as string;
            setReservation({
                id: found.id as number,
                code: found.code as string,
                clientName: found.clientName as string,
                clientPhone: found.clientPhone as string,
                packageName: pkg?.titleEn as string ?? "—",
                travelDate: travelDate ? travelDate.slice(0, 10) : "—",
                travelers: found.numberOfTravelers as number,
                totalPrice: Number(found.totalPriceDZD),
                status: found.status as string,
                createdAt: createdAt ? createdAt.slice(0, 10) : "—",
            });
        } catch {
            setError("No reservation found with that code. Please check and try again.");
        } finally {
            setSearching(false);
        }
    };

    const handleCancel = async () => {
        if (!reservation) return;
        setCancelling(true);
        try {
            await reservationsApi.cancel(reservation.id);
            setReservation({ ...reservation, status: "CANCELLED" });
            setCancelled(true);
            setConfirmCancel(false);
        } catch {
            setError("Could not cancel the reservation. Please try again.");
        } finally {
            setCancelling(false);
        }
    };

    const sc = reservation ? STATUS_CONFIG[reservation.status] : null;
    const canCancel = reservation && CANCELLABLE.includes(reservation.status);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow bg-gradient-to-br from-muted/30 to-primary/5 py-16">
                <div className="container mx-auto px-4 max-w-xl">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-7 h-7 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold">My Reservation</h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Enter your reservation code and phone number to view or cancel your booking.
                        </p>
                    </motion.div>

                    {/* Lookup form */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                        className="bg-white rounded-3xl shadow-xl border border-border p-8 space-y-5">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Reservation Code</Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="e.g. RHL-2025-00142"
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    className="pl-10 h-12 font-mono tracking-wider"
                                    onKeyDown={e => e.key === "Enter" && handleLookup()}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="e.g. 0550001001"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="pl-10 h-12"
                                    onKeyDown={e => e.key === "Enter" && handleLookup()}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Must match the phone used when booking.</p>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                            </motion.div>
                        )}

                        <Button onClick={handleLookup} disabled={searching} className="w-full h-12 gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl border-0">
                            {searching ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</> : <><Search className="w-4 h-4" /> Find My Reservation</>}
                        </Button>
                    </motion.div>

                    {/* Result card */}
                    <AnimatePresence>
                        {reservation && sc && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="mt-6 bg-white rounded-3xl shadow-xl border border-border p-8 space-y-6"
                            >
                                {/* Status banner */}
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${sc.bg}`}>
                                    <sc.icon className={`w-5 h-5 ${sc.color} shrink-0`} />
                                    <div>
                                        <p className={`font-bold text-sm ${sc.color}`}>Status: {sc.label}</p>
                                        {reservation.status === "PENDING" && (
                                            <p className="text-xs text-amber-600 mt-0.5">Awaiting review by our team — typically within 24 hours.</p>
                                        )}
                                        {reservation.status === "IN_REVIEW" && (
                                            <p className="text-xs text-blue-600 mt-0.5">Our team is currently reviewing your booking.</p>
                                        )}
                                        {reservation.status === "CONFIRMED" && (
                                            <p className="text-xs text-emerald-600 mt-0.5">Your booking is confirmed! We will contact you soon.</p>
                                        )}
                                        {reservation.status === "REJECTED" && (
                                            <p className="text-xs text-red-600 mt-0.5">Your booking was not approved. Please contact us for details.</p>
                                        )}
                                        {reservation.status === "CANCELLED" && (
                                            <p className="text-xs text-gray-500 mt-0.5">This reservation has been cancelled.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Details grid */}
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Booking Details</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { icon: FileText,  label: "Code",         value: reservation.code },
                                            { icon: Users,     label: "Client",        value: reservation.clientName },
                                            { icon: Package,   label: "Package",       value: reservation.packageName },
                                            { icon: Calendar,  label: "Travel Date",   value: reservation.travelDate },
                                            { icon: Users,     label: "Travelers",     value: `${reservation.travelers} person${reservation.travelers > 1 ? "s" : ""}` },
                                            { icon: Banknote,  label: "Total",         value: `${reservation.totalPrice.toLocaleString("fr-DZ")} DZD` },
                                        ].map(({ icon: Icon, label, value }) => (
                                            <div key={label} className="bg-muted/30 rounded-xl p-3">
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                                                    <Icon className="w-3 h-3" /> {label}
                                                </div>
                                                <div className="font-semibold text-sm">{value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Cancellation section */}
                                {canCancel && !cancelled && (
                                    <div className="border-t border-border pt-5 space-y-3">
                                        {!confirmCancel ? (
                                            <Button
                                                variant="outline"
                                                className="w-full h-11 gap-2 border-red-200 text-red-600 hover:bg-red-50"
                                                onClick={() => setConfirmCancel(true)}
                                            >
                                                <Ban className="w-4 h-4" /> Cancel This Reservation
                                            </Button>
                                        ) : (
                                            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                                className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
                                                <div className="flex items-start gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-bold text-red-700">Are you sure you want to cancel?</p>
                                                        <p className="text-xs text-red-600 mt-0.5">This action cannot be undone. You will need to make a new booking if you change your mind.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirmCancel(false)}>
                                                        Keep Booking
                                                    </Button>
                                                    <Button size="sm" disabled={cancelling}
                                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
                                                        onClick={handleCancel}>
                                                        {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                                                        Yes, Cancel
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                )}

                                {cancelled && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center text-sm text-gray-600">
                                        ✅ Your reservation has been cancelled successfully.
                                    </motion.div>
                                )}

                                {!canCancel && reservation.status !== "CANCELLED" && (
                                    <p className="text-xs text-muted-foreground text-center border-t border-border pt-4">
                                        {reservation.status === "CONFIRMED"
                                            ? "This reservation is already confirmed. Please call us to discuss changes."
                                            : "This reservation can no longer be modified."}
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <Footer />
        </div>
    );
}
