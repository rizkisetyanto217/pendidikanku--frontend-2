import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const LS_KEY = "active_masjid_id";

type Role = "dkm" | "teacher" | "student" | "school" | string;

type MeUser = {
  role?: Role;
  masjid_ids?: string[];
  masjid_admin_ids?: string[];
  masjid_teacher_ids?: string[];
  masjid_student_ids?: string[];
  // ...field lain dari /api/auth/me kalau perlu
};

function isNonEmpty(str?: string | null) {
  return typeof str === "string" && str.trim().length > 0;
}
function normalizeIds(x?: string[] | null): string[] {
  return Array.isArray(x) ? x.filter(Boolean) : [];
}

/** PILIH MASJID BERDASARKAN ROLE (STRICT) + fallback ke masjid_ids */
function pickFromUserByRole(user?: MeUser | null): string | null {
  if (!user) return null;
  const role = (user.role ?? "").toLowerCase() as Role;

  let primary: string[] = [];
  if (role === "dkm" || role === "school") {
    // dkm/school = admin entity → pakai admin list
    primary = normalizeIds(user.masjid_admin_ids);
  } else if (role === "teacher") {
    primary = normalizeIds(user.masjid_teacher_ids);
  } else if (role === "student") {
    primary = normalizeIds(user.masjid_student_ids);
  } else {
    // unknown role → aman: coba admin dulu
    primary = normalizeIds(user.masjid_admin_ids);
  }

  // STRICT: tidak ambil list role lain
  const fromRole = primary[0];
  if (fromRole) return fromRole;

  // Fallback terakhir: daftar masjid umum (jika backend kasih)
  const fromGeneric = normalizeIds(user.masjid_ids)[0];
  return fromGeneric ?? null;
}

/**
 * Prioritas masjidId:
 * 1) ?masjid_id= di URL
 * 2) localStorage.active_masjid_id
 * 3) Hasil pickFromUserByRole(user)
 */
export function useEffectiveMasjidId() {
  const { user, isLoading: isLoadingUser } = useCurrentUser();
  const { search } = useLocation();
  const navigate = useNavigate();

  const [lsMasjidId, setLsMasjidId] = useState<string | null>(() => {
    try {
      const v = localStorage.getItem(LS_KEY);
      return isNonEmpty(v) ? (v as string) : null;
    } catch {
      return null;
    }
  });

  // Sync perubahan localStorage (tab lain)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY) {
        setLsMasjidId(isNonEmpty(e.newValue) ? (e.newValue as string) : null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Ambil dari query string
  const queryMasjidId = useMemo(() => {
    const sp = new URLSearchParams(search);
    const val = sp.get("masjid_id");
    return isNonEmpty(val) ? (val as string) : null;
  }, [search]);

  // Ambil dari user berdasar role (STRICT)
  const userMasjidId = useMemo(
    () => pickFromUserByRole(user as MeUser),
    [user]
  );

  enum MasjidSourceEnum {
    Query = "query",
    LocalStorage = "localStorage",
    User = "user",
  }

  const { masjidId, source } = useMemo<{
    masjidId: string | null;
    source: MasjidSourceEnum | null;
  }>(() => {
    if (queryMasjidId)
      return { masjidId: queryMasjidId, source: MasjidSourceEnum.Query };
    if (lsMasjidId)
      return { masjidId: lsMasjidId, source: MasjidSourceEnum.LocalStorage };
    if (userMasjidId)
      return { masjidId: userMasjidId, source: MasjidSourceEnum.User };
    return { masjidId: null, source: null };
  }, [queryMasjidId, lsMasjidId, userMasjidId]);

  // Persist kalau datang dari query/user
  useEffect(() => {
    if (!masjidId) return;
    try {
      localStorage.setItem(LS_KEY, masjidId);
      setLsMasjidId(masjidId);
    } catch {}
  }, [masjidId]);

  // Setter dari UI
  const setMasjidId = useCallback(
    (id: string, { updateUrl = false }: { updateUrl?: boolean } = {}) => {
      try {
        localStorage.setItem(LS_KEY, id);
        setLsMasjidId(id);
        if (updateUrl) {
          const sp = new URLSearchParams(window.location.search);
          sp.set("masjid_id", id);
          navigate({ search: `?${sp.toString()}` }, { replace: true });
        }
      } catch {}
    },
    [navigate]
  );

  const clearMasjidId = useCallback(
    ({ removeFromUrl = false }: { removeFromUrl?: boolean } = {}) => {
      try {
        localStorage.removeItem(LS_KEY);
        setLsMasjidId(null);
        if (removeFromUrl) {
          const sp = new URLSearchParams(window.location.search);
          sp.delete("masjid_id");
          navigate(
            { search: sp.toString() ? `?${sp.toString()}` : "" },
            { replace: true }
          );
        }
      } catch {}
    },
    [navigate]
  );

  return {
    masjidId,
    source, // "query" | "localStorage" | "user" | null
    isLoadingUser,
    user: user as MeUser,
    setMasjidId,
    clearMasjidId,
  };
}
