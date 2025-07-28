import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios"; // harus pakai withCredentials: true

export function useCurrentUser() {
  const query = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/auth/me");
        return res.data?.user ?? null;
      } catch (err: any) {
        if (err?.response?.status === 401) return null;
        throw err;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    user: query.data,
    isLoggedIn: !!query.data,
    ...query, // kalau mau akses isLoading, refetch, dll
  };
}
