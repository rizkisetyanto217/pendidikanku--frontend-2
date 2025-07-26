import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios"; // yang sudah pakai withCredentials: true

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await axios.get("/api/auth/me");
      console.log("🔥 me response", res.data);
      return res.data.user ?? {};
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true, // ⬅️ WAJIB agar update saat navigate antar halaman
    refetchOnWindowFocus: true, // ⬅️ Disarankan juga agar auto-refresh saat kembali ke tab
  });
};
