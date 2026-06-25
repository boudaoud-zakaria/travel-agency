import { useState } from "react";
import {
  useCustomRequests, useUpdateCustomRequest, useDeleteCustomRequest,
} from "@/hooks/use-custom-requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Compass, Search, Eye, Trash2, Mail, Phone, MapPin, Users,
  Calendar, DollarSign, MessageSquare, CheckCircle, Clock,
  XCircle, FileText, RefreshCw, SlidersHorizontal,
} from "lucide-react";
import { format } from "date-fns";

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  PENDING:   { label: "Pending",   class: "bg-amber-100 text-amber-800 border-amber-200" },
  REVIEWING: { label: "Reviewing", class: "bg-blue-100 text-blue-800 border-blue-200" },
  QUOTED:    { label: "Quoted",    class: "bg-purple-100 text-purple-800 border-purple-200" },
  ACCEPTED:  { label: "Accepted",  class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  REJECTED:  { label: "Rejected",  class: "bg-red-100 text-red-800 border-red-200" },
};

const ACTIVITY_LABELS: Record<string, string> = {
  alpine: "🏔️ Alpine",
  desert: "🏜️ Desert",
  cultural: "🏛️ Cultural",
  coastal: "🌊 Coastal",
  religious: "🕌 Religious",
  custom: "✨ Custom",
};

const BUDGET_LABELS: Record<string, string> = {
  under_50k: "< 50K DZD",
  "50k_150k": "50K–150K DZD",
  "150k_350k": "150K–350K DZD",
  "350k_plus": "> 350K DZD",
  flexible: "Flexible",
};

export default function AdminCustomRequests() {
  const { data: requests = [], isLoading } = useCustomRequests();
  const { mutate: updateRequest, isPending: updating } = useUpdateCustomRequest();
  const { mutate: deleteRequest } = useDeleteCustomRequest();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const filtered = (requests as any[]).filter((r: any) => {
    const matchSearch = !search ||
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.destination?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openDetail = (r: any) => {
    setSelectedRequest(r);
    setAdminNotes(r.adminNotes || "");
    setNewStatus(r.status || "PENDING");
    setDetailOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedRequest) return;
    updateRequest(
      { id: selectedRequest.id, data: { status: newStatus, adminNotes } },
      {
        onSuccess: () => {
          toast({ title: "Request updated" });
          setDetailOpen(false);
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteRequest(id, {
      onSuccess: () => {
        toast({ title: "Request deleted" });
        setDeleteTarget(null);
        if (selectedRequest?.id === id) setDetailOpen(false);
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const counts = {
    total: (requests as any[]).length,
    pending: (requests as any[]).filter((r: any) => r.status === "PENDING").length,
    reviewing: (requests as any[]).filter((r: any) => r.status === "REVIEWING").length,
    accepted: (requests as any[]).filter((r: any) => r.status === "ACCEPTED").length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" /> Custom Expedition Requests
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Client requests for personalised outings — review, quote, and follow up.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: counts.total, color: "text-primary", bg: "bg-primary/5 border-primary/10" },
          { label: "Pending Review", value: counts.pending, color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
          { label: "In Progress", value: counts.reviewing, color: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
          { label: "Accepted", value: counts.accepted, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-4 ${bg}`}>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground font-semibold mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, destination…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 rounded-xl">
            <SlidersHorizontal className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left px-5 py-3 font-semibold">Client</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Destination</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Activity</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Dates</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Received</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading requests…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <Compass className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    No requests found
                  </td>
                </tr>
              ) : filtered.map((r: any) => {
                const sc = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING;
                return (
                  <tr key={r.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-foreground">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="text-sm text-foreground font-medium truncate max-w-[160px]">{r.destination}</div>
                      <div className="text-xs text-muted-foreground">{r.groupSize} person{r.groupSize > 1 ? "s" : ""}</div>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-sm">
                      {ACTIVITY_LABELS[r.activityType] ?? r.activityType}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-muted-foreground">
                      <div>{r.dateFrom}</div>
                      <div>→ {r.dateTo}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${sc.class}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-xs text-muted-foreground">
                      {r.createdAt ? format(new Date(r.createdAt), "dd MMM yyyy") : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                          onClick={() => openDetail(r)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(r.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              Request from {selectedRequest?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-5">
              {/* Client info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Mail, label: "Email", value: selectedRequest.email },
                  { icon: Phone, label: "Phone", value: selectedRequest.phone },
                  { icon: Users, label: "Group", value: `${selectedRequest.groupSize} person(s)` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-muted/30 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </div>
                    <div className="text-sm font-semibold text-foreground">{value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: MapPin, label: "Destination", value: selectedRequest.destination },
                  { icon: Compass, label: "Activity Type", value: ACTIVITY_LABELS[selectedRequest.activityType] ?? selectedRequest.activityType },
                  { icon: Calendar, label: "Dates", value: `${selectedRequest.dateFrom} → ${selectedRequest.dateTo}` },
                  { icon: DollarSign, label: "Budget", value: BUDGET_LABELS[selectedRequest.budget] ?? selectedRequest.budget ?? "Not specified" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-muted/30 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </div>
                    <div className="text-sm font-semibold text-foreground">{value}</div>
                  </div>
                ))}
              </div>

              {selectedRequest.requirements && (
                <div className="bg-muted/30 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <FileText className="w-3.5 h-3.5" /> Special Requirements
                  </div>
                  <p className="text-sm text-foreground">{selectedRequest.requirements}</p>
                </div>
              )}

              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Client Message
                </div>
                <p className="text-sm text-foreground leading-relaxed">{selectedRequest.message}</p>
              </div>

              {/* Admin controls */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Admin Response</h4>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Update Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Admin Notes (visible internally only)</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Quote details, follow-up notes, internal comments…"
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(selectedRequest?.id)}
              className="text-destructive border-destructive/30 hover:bg-destructive/5 rounded-xl"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
            <Button onClick={handleUpdate} disabled={updating} className="bg-primary text-white rounded-xl">
              {updating ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this request?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget !== null && handleDelete(deleteTarget)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
