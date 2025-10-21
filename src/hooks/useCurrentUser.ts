import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

/* ===================================================
   TYPES
=================================================== */
export type CurrentUser = {
  // Properti dasar user
  user_id: string;
  user_name: string;
  email?: string;

  // Alias agar kompatibel dengan kode lama
  id?: string;
  role?: "dkm" | "teacher" | "student" | "admin" | "user";
  masjid_admin_ids?: string[];

  // Relasi ke masjid & role
  memberships?: Array<{
    masjid_id: string;
    role: "dkm" | "teacher" | "student" | "admin" | "user";
  }>;
};

/* ===================================================
   HELPERS
=================================================== */

/**
 * Ambil ID masjid dari localStorage (context aktif).
 */
function getCtxMasjidId(): string | null {
  try {
    return localStorage.getItem("ctx_masjid_id");
  } catch {
    return null;
  }
}

/**
 * Ambil masjid_id aktif dari memberships.
 */
function deriveActiveMasjidId(u?: CurrentUser | null): string | null {
  if (!u?.memberships?.length) return null;
  return u.memberships[0].masjid_id || null;
}

/**
 * Ambil role aktif user.
 */
function deriveRole(u?: CurrentUser | null): CurrentUser["role"] {
  if (!u?.memberships?.length) return "user";
  return u.memberships[0].role || "user";
}

/**
 * Ambil semua masjid yang di-manage user.
 */
function deriveMasjidAdminIds(u?: CurrentUser | null): string[] {
  if (!u?.memberships?.length) return [];
  return u.memberships
    .filter((m) => m.role === "dkm" || m.role === "admin")
    .map((m) => m.masjid_id);
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

        // Endpoint dengan konteks masjid
        const url = ctxMasjidId
          ? `/api/auth/me/context?masjid_id=${ctxMasjidId}`
          : `/api/auth/me/context`;

        const res = await api.get(url);
        const data = res.data?.data || res.data?.user || null;
        if (!data) return null;

        // Normalisasi struktur agar kompatibel di seluruh app
        const normalized: CurrentUser = {
          ...data,
          id: data.user_id,
          role: deriveRole(data),
          masjid_admin_ids: deriveMasjidAdminIds(data),
          memberships: Array.isArray(data.memberships) ? data.memberships : [],
        };

        return normalized;
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
  const masjidAdminIds = deriveMasjidAdminIds(user);

  return {
    user,
    masjidId,
    role,
    masjidAdminIds,
    isLoggedIn: !!user,
    ...query, // expose isLoading, refetch, dll
  };
}
