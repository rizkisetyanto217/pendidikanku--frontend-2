// src/hooks/useCurrentUser.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

/* ================== TYPES (sesuai API) ================== */
type Role = "admin" | "dkm" | "teacher" | "student" | "user";

export type Membership = {
  masjid_id: string;
  masjid_name?: string;
  masjid_slug?: string;
  masjid_icon_url?: string;
  roles: Array<Role | (string & {})>; // API bisa kirim string lain; kita toleransi
};

export type CurrentUser = {
  user_id: string;
  user_name: string;
  email?: string;

  // kompatibilitas lama:
  id?: string; // mirror dari user_id
  role?: Role; // single role utama (turunan dari memberships[0].roles)
  masjid_admin_ids?: string[];
  memberships?: Membership[];
};

/* ================== HELPERS ================== */
function deriveActiveMasjidId(u?: CurrentUser | null): string | null {
  if (!u?.memberships?.length) return null;
  return u.memberships[0]?.masjid_id ?? null;
}

function derivePrimaryRole(u?: CurrentUser | null): Role {
  // cast ke string[] agar .includes menerima literal Role tanpa keluhan
  const roles = (u?.memberships?.[0]?.roles ?? []) as readonly string[];
  const priority: Role[] = ["admin", "dkm", "teacher", "student", "user"];
  for (const p of priority) if (roles.includes(p)) return p;
  return "user";
}

function deriveMasjidAdminIds(u?: CurrentUser | null): string[] {
  if (!u?.memberships?.length) return [];
  const ids = new Set<string>();
  for (const m of u.memberships) {
    const set = new Set<string>(m.roles ?? []);
    if (set.has("admin") || set.has("dkm")) ids.add(m.masjid_id);
  }
  return [...ids];
}

/* ================== MAIN HOOK ================== */
export function useCurrentUser() {
  const query = useQuery<CurrentUser | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        // Sesuai Postman: /api/auth/me/simple-context
        const res = await api.get("/api/auth/me/simple-context");
        // Bentuk: { data: { user_id, user_name, memberships: [...] }, message: "..." }
        const raw = res.data?.data;
        if (!raw) return null;

        const normalized: CurrentUser = {
          ...raw,
          id: raw.user_id,
          memberships: Array.isArray(raw.memberships) ? raw.memberships : [],
        };

        normalized.role = derivePrimaryRole(normalized);
        normalized.masjid_admin_ids = deriveMasjidAdminIds(normalized);

        return normalized;
      } catch (err: any) {
        if (err?.response?.status === 401) return null;
        console.error("[useCurrentUser] gagal ambil user:", err);
        throw err;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const user = query.data;
  const masjidId = deriveActiveMasjidId(user);
  const role = derivePrimaryRole(user);
  const masjidAdminIds = deriveMasjidAdminIds(user);

  return {
    user,
    masjidId,
    role,
    masjidAdminIds,
    isLoggedIn: !!user,
    ...query, // isLoading, refetch, dll
  };
}
