import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useReservations(filters?: { status?: string; code?: string; packageId?: number }) {
  return useQuery({
    queryKey: [api.reservations.list.path, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.code) params.append("code", filters.code);
      if (filters?.packageId) params.append("packageId", filters.packageId.toString());

      const url = `${api.reservations.list.path}?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch reservations");
      return await res.json();
    },
  });
}

export function useReservation(id: number) {
  return useQuery({
    queryKey: [api.reservations.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.reservations.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch reservation");
      return await res.json();
    },
    enabled: !!id,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.reservations.create.path, {
        method: api.reservations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create reservation");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reservations.list.path] });
      toast({ title: "Success", description: "Reservation created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; status: string; note?: string; rejectionReason?: string }) => {
      const url = buildUrl(api.reservations.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.reservations.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update reservation status");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reservations.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.reservations.get.path] });
      toast({ title: "Success", description: "Reservation status updated" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
