import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: () => notificationsApi.list(),
    refetchInterval: 30_000, // poll every 30s for new notifications
  });

  const notifications = (query.data as Record<string, unknown>[] | undefined) ?? [];

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.isRead).length,
    [notifications]
  );

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAsRead = (id: number) => markReadMutation.mutate(id);
  const markAllRead = () => markAllReadMutation.mutate();

  return {
    data: notifications,
    isLoading: query.isLoading,
    refetch: query.refetch,
    unreadCount,
    markAsRead,
    markAllRead,
  };
}
