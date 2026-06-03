import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, setToken, clearToken } from "@/lib/api";

export function useUser() {
  return useQuery({
    queryKey: ["/api/user"],
    queryFn: () => authApi.me(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { username: string; password?: string }) => {
      const result = await authApi.login(data.username, data.password || "");
      setToken(result.token);
      return result.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } finally {
        clearToken();
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
    },
  });
}
