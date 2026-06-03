import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useReservations(filters?: {
  status?: string;
  code?: string;
  packageId?: number;
  assignedToId?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ["/api/reservations", filters],
    queryFn: () => reservationsApi.list(filters),
  });
}

export function useReservation(id: number) {
  return useQuery({
    queryKey: ["/api/reservations", id],
    queryFn: () => reservationsApi.get(id),
    enabled: !!id,
  });
}

export function useReservationByCode(code: string) {
  return useQuery({
    queryKey: ["/api/reservations/code", code],
    queryFn: () => reservationsApi.getByCode(code),
    enabled: !!code,
    retry: false,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => reservationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      toast({ title: "Success", description: "Reservation created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
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
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Success", description: "Reservation status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      reservationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      toast({ title: "Success", description: "Reservation updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => reservationsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      toast({ title: "Success", description: "Reservation cancelled" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
