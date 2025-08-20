// import { useQuery } from "@tanstack/react-query";
// import axios from "@/lib/axios"; // harus pakai withCredentials: true

// export function useCurrentUser() {
//   const query = useQuery({
//     queryKey: ["currentUser"],
//     queryFn: async () => {
//       try {
//         const res = await axios.get("/api/auth/me");
//         return res.data?.user ?? null;
//       } catch (err: any) {
//         if (err?.response?.status === 401) return null;
//         throw err;
//       }
//     },
//     retry: false,
//     staleTime: 1000 * 60 * 5,
//   });

//   return {
//     user: query.data,
//     isLoggedIn: !!query.data,
//     ...query, // kalau mau akses isLoading, refetch, dll
//   };
// }

// src/hooks/useCurrentUser.ts
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

type CurrentUser = {
  id: string;
  user_name: string;
  email: string;
  role: string; // "dkm" | "teacher" | "student" | dll
  masjid_admin_ids?: string[] | null;
  masjid_teacher_ids?: string[] | null;
  masjid_student_ids?: string[] | null;
};

function normalizeIds(x?: string[] | null): string[] {
  return Array.isArray(x) ? x.filter(Boolean) : [];
}

function getEffectiveMasjidId(
  u: CurrentUser | null | undefined
): string | null {
  if (!u) return null;
  const admin = normalizeIds(u.masjid_admin_ids);
  const teacher = normalizeIds(u.masjid_teacher_ids);
  const student = normalizeIds(u.masjid_student_ids);
  return admin[0] ?? teacher[0] ?? student[0] ?? null;
}

export function useCurrentUser() {
  const query = useQuery<CurrentUser | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/auth/me", {
          withCredentials: true,
        });
        const u = (res.data?.user ?? null) as CurrentUser | null;
        if (!u) return null;

        // pastikan field array tidak undefined/null
        return {
          ...u,
          masjid_admin_ids: normalizeIds(u.masjid_admin_ids),
          masjid_teacher_ids: normalizeIds(u.masjid_teacher_ids),
          masjid_student_ids: normalizeIds(u.masjid_student_ids),
        };
      } catch (err: any) {
        if (err?.response?.status === 401) return null;
        throw err;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const masjidId = getEffectiveMasjidId(query.data);

  return {
    user: query.data,
    masjidId, // <-- pakai ini di payload/update
    role: query.data?.role ?? null,
    isLoggedIn: !!query.data,
    ...query, // isLoading, refetch, dll
  };
}