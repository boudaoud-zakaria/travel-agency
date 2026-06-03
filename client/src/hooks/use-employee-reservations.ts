import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationsApi } from "@/lib/api";
import { useUser } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type ReservationStatus = "PENDING" | "IN_REVIEW" | "CONFIRMED" | "REJECTED";

export function useEmployeeReservations() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const userId = (user as Record<string, unknown> | null | undefined)?.id as number | undefined;

  const query = useQuery({
    queryKey: ["/api/reservations", { assignedToId: userId }],
    queryFn: () => reservationsApi.list({ assignedToId: userId }),
    enabled: !!userId,
  });

  const reservations = (query.data as Record<string, unknown>[] | undefined) ?? [];

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      note,
      rejectionReason,
    }: {
      id: number;
      status: string;
      note?: string;
      rejectionReason?: string;
    }) => reservationsApi.updateStatus(id, status, note, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      toast({ title: "Updated", description: "Reservation status updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: ({
      id,
      notes,
      internalNotes,
    }: {
      id: number;
      notes: string;
      internalNotes: string;
    }) => reservationsApi.update(id, { notes, internalNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
    },
  });

  const updateStatus = (id: number, status: ReservationStatus, note?: string, rejectionReason?: string) => {
    updateStatusMutation.mutate({ id, status, note, rejectionReason });
  };

  const updateNotes = (id: number, notes: string, internalNotes: string) => {
    updateNotesMutation.mutate({ id, notes, internalNotes });
  };

  const filterByStatus = (status: ReservationStatus | "ALL") => {
    if (status === "ALL") return reservations;
    return reservations.filter(r => r.status === status);
  };

  const countsByStatus = useMemo(
    () => ({
      ALL: reservations.length,
      PENDING: reservations.filter(r => r.status === "PENDING").length,
      IN_REVIEW: reservations.filter(r => r.status === "IN_REVIEW").length,
      CONFIRMED: reservations.filter(r => r.status === "CONFIRMED").length,
      REJECTED: reservations.filter(r => r.status === "REJECTED").length,
    }),
    [reservations]
  );

  return {
    data: reservations,
    isLoading: query.isLoading,
    refetch: query.refetch,
    updateStatus,
    updateNotes,
    filterByStatus,
    countsByStatus,
  };
}
