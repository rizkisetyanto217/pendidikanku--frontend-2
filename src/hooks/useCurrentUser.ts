import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

/* ===================================================
   TYPES
=================================================== */
export type CurrentUser = {
  user_id: string;
  user_name: string;
  email?: string;
  memberships?: Array<{
    masjid_id: string;
    role: "dkm" | "teacher" | "student" | "admin" | "user";
  }>;
};

/* ===================================================
   HELPERS
=================================================== */
function getCtxMasjidId(): string | null {
  try {
    return localStorage.getItem("ctx_masjid_id");
  } catch {
    return null;
  }
}

/**
 * Menentukan masjid_id aktif dari user.
 * Jika tidak ada memberships, akan null.
 */
function deriveActiveMasjidId(u?: CurrentUser | null): string | null {
  if (!u?.memberships?.length) return null;
  return u.memberships[0].masjid_id || null;
}

/**
 * Menentukan role aktif dari user.
 * Jika tidak ada memberships, fallback ke "user".
 */
function deriveRole(u?: CurrentUser | null): string {
  if (!u?.memberships?.length) return "user";
  return u.memberships[0].role || "user";
}

/* ===================================================
   MAIN HOOK
=================================================== */
export function useCurrentUser() {
  const query = useQuery<CurrentUser | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        // Ambil context masjid dari localStorage
        const ctxMasjidId = getCtxMasjidId();

        // Gunakan endpoint context-aware (lebih aman)
        const url = ctxMasjidId
          ? `/api/auth/me/context?masjid_id=${ctxMasjidId}`
          : `/api/auth/me/context`;

        const res = await api.get(url);

        // Normalisasi data user
        const data = res.data?.data || res.data?.user || null;
        if (!data) return null;

        return {
          ...data,
          memberships: Array.isArray(data.memberships) ? data.memberships : [],
        } as CurrentUser;
      } catch (err: any) {
        if (err?.response?.status === 401) return null;
        console.error("[useCurrentUser] gagal ambil user:", err);
        throw err;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // cache 5 menit
  });

  const user = query.data;
  const masjidId = deriveActiveMasjidId(user);
  const role = deriveRole(user);

  return {
    user,
    masjidId,
    role,
    isLoggedIn: !!user,
    ...query, // expose isLoading, refetch, dll
  };
}
