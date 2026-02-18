import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function usePackages(filters?: { type?: string; status?: string; search?: string }) {
  const queryKey = [api.packages.list.path, filters];
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build query string
      const params = new URLSearchParams();
      if (filters?.type) params.append("type", filters.type);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.search) params.append("search", filters.search);
      
      const url = `${api.packages.list.path}?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch packages");
      return await res.json();
    },
  });
}

export function usePackage(id: number) {
  return useQuery({
    queryKey: [api.packages.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.packages.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch package");
      return await res.json();
    },
    enabled: !!id,
  });
}

export function useCreatePackage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.packages.create.path, {
        method: api.packages.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create package");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.packages.list.path] });
      toast({ title: "Success", description: "Package created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & any) => {
      const url = buildUrl(api.packages.update.path, { id });
      const res = await fetch(url, {
        method: api.packages.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update package");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.packages.list.path] });
      toast({ title: "Success", description: "Package updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useDeletePackage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.packages.delete.path, { id });
      const res = await fetch(url, { method: api.packages.delete.method });
      if (!res.ok) throw new Error("Failed to delete package");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.packages.list.path] });
      toast({ title: "Success", description: "Package deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
