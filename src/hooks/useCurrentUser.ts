import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios"; // harus pakai withCredentials: true

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/auth/me");
        return res.data?.user ?? null; // fallback ke null kalau kosong
      } catch (err: any) {
        if (err?.response?.status === 401) return null; // user belum login
        throw err; // selain 401 dilempar
      }
    },
    retry: false, // supaya tidak spam kalau 401
    staleTime: 1000 * 60 * 5, // cache 5 menit
  });
}
