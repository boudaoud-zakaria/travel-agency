import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, Eye, Users, Calendar, Banknote, Phone, FileText, Lock, IdCard, ZoomIn } from "lucide-react";
import { useState, useEffect } from "react";
import type { Reservation, ReservationStatus } from "@/types/employee";

interface Props {
  reservation: Reservation | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: number, status: ReservationStatus) => void;
  onNotesChange?: (id: number, notes: string, internalNotes: string) => void;
}

const STATUS_CONFIG: Record<ReservationStatus, { label: string; badgeClass: string; icon: any }> = {
  PENDING:    { label: "Pending",    badgeClass: "badge-pending",    icon: Clock },
  IN_REVIEW:  { label: "In Review",  badgeClass: "badge-in-review",  icon: Eye },
  CONFIRMED:  { label: "Confirmed",  badgeClass: "badge-confirmed",  icon: CheckCircle },
  REJECTED:   { label: "Rejected",   badgeClass: "badge-rejected",   icon: XCircle },
};

export default function ReservationDrawer({ reservation, open, onClose, onStatusChange, onNotesChange }: Props) {
  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  useEffect(() => {
    if (reservation) {
      setNotes(reservation.notes ?? "");
      setInternalNotes(reservation.internalNotes ?? "");
    }
  }, [reservation]);

  if (!reservation) return null;

  const sc = STATUS_CONFIG[reservation.status];
  const StatusIcon = sc.icon;
  const canConfirm = reservation.status === "PENDING" || reservation.status === "IN_REVIEW";
  const canReject = reservation.status === "PENDING" || reservation.status === "IN_REVIEW";

  const handleSaveNotes = () => {
    onNotesChange?.(reservation.id, notes, internalNotes);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[420px] p-0 flex flex-col"
        aria-label="Reservation details"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <SheetTitle className="text-base font-bold">Reservation Details</SheetTitle>
              <code className="text-xs text-muted-foreground font-mono">{reservation.code}</code>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${sc.badgeClass}`}>
              <StatusIcon className="w-3 h-3" />
              {sc.label}
            </span>
          </div>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Client info */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Client</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                  <Users className="w-3 h-3" /> Client Name
                </div>
                <div className="font-semibold text-sm">{reservation.clientName}</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                  <Phone className="w-3 h-3" /> Phone
                </div>
                <div className="font-semibold text-sm">{reservation.clientPhone}</div>
              </div>
            </div>
          </section>

          {/* Package & travel info */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Trip Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-xl p-3 col-span-2">
                <div className="text-[10px] text-muted-foreground mb-1">Package</div>
                <div className="font-semibold text-sm">{reservation.packageName}</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                  <Users className="w-3 h-3" /> Travelers
                </div>
                <div className="font-semibold text-sm">{reservation.travelersCount}</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                  <Banknote className="w-3 h-3" /> Amount
                </div>
                <div className="font-semibold text-sm">{reservation.amount.toLocaleString("fr-DZ")} DZD</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                  <Calendar className="w-3 h-3" /> Assigned
                </div>
                <div className="font-semibold text-sm">{new Date(reservation.assignedAt).toLocaleDateString()}</div>
              </div>
              {reservation.confirmedAt && (
                <div className="bg-emerald-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 mb-1">
                    <CheckCircle className="w-3 h-3" /> Confirmed
                  </div>
                  <div className="font-semibold text-sm text-emerald-700">
                    {new Date(reservation.confirmedAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Identity Verification */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <IdCard className="w-3.5 h-3.5" /> Identity Verification
            </h3>
            {reservation.idCardImage ? (
              <div className="space-y-3">
                <div className="relative group rounded-2xl overflow-hidden border border-border shadow-sm">
                  <img 
                    src={reservation.idCardImage} 
                    alt="Client ID Card" 
                    className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                    onClick={() => window.open(reservation.idCardImage, '_blank')}
                  />
                  <div className="absolute top-2 right-2 flex gap-1 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <Button 
                      size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg"
                      onClick={() => window.open(reservation.idCardImage, '_blank')}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-[10px] text-white font-medium flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-emerald-400" /> Secure ID Document
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                  Verify that the name and NIN on the card match the client details above.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-muted p-6 text-center">
                <div className="bg-muted/50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <IdCard className="w-5 h-5 text-muted-foreground opacity-30" />
                </div>
                <p className="text-xs text-muted-foreground">No ID card uploaded yet</p>
              </div>
            )}
          </section>

          {/* Notes */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</h3>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Client Notes
              </Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes visible to client..."
                rows={2}
                className="resize-none text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> Internal Notes
              </Label>
              <Textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Internal notes (not visible to client)..."
                rows={2}
                className="resize-none text-sm"
              />
            </div>
            {onNotesChange && (
              <Button size="sm" variant="outline" onClick={handleSaveNotes} className="w-full text-xs">
                Save Notes
              </Button>
            )}
          </section>
        </div>

        {/* Action footer */}
        <div className="px-6 py-4 border-t border-border shrink-0 space-y-2">
          {canConfirm && (
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              onClick={() => { onStatusChange(reservation.id, "CONFIRMED"); onClose(); }}
            >
              <CheckCircle className="w-4 h-4" /> Mark as Confirmed
            </Button>
          )}
          {canReject && (
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 gap-2"
              onClick={() => { onStatusChange(reservation.id, "REJECTED"); onClose(); }}
            >
              <XCircle className="w-4 h-4" /> Mark as Rejected
            </Button>
          )}
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
