import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customRequestsApi, CustomRequestPayload } from "@/lib/api";

const QK = "/api/custom-requests";

export function useCustomRequests() {
  return useQuery({
    queryKey: [QK],
    queryFn: () => customRequestsApi.list(),
  });
}

export function useSubmitCustomRequest() {
  return useMutation({
    mutationFn: (data: CustomRequestPayload) => customRequestsApi.submit(data),
  });
}

export function useUpdateCustomRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status?: string; adminNotes?: string } }) =>
      customRequestsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useDeleteCustomRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customRequestsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}
