// src/pages/linktree/activity/my-activity/MasjidMyActivity.tsx
import React, { useMemo } from "react";
import BottomNavbar from "@/components/common/public/ButtonNavbar";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import LectureMaterialList from "@/components/pages/lecture/LectureMaterialList";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import CommonButton from "@/components/common/main/CommonButton";
import CommonActionButton from "@/components/common/main/CommonActionButton";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import axios from "@/lib/axios";
import type { LectureMaterialItem } from "@/pages/linktree/lecture/material/lecture-sessions/main/types/lectureSessions";

/* ===================== Types ===================== */
type AnyUser = Partial<{
  id: string;
  user_name: string;
  name: string;
  role: string;
  created_at: string;
  createdAt: string;
  created_at_unix: number; // seconds
  first_seen_at: string;
}>;

type NormalizedUser = {
  displayName: string;
  role?: string;
  joinedAt?: Date; // optional
};

type LectureSessionApi = {
  lecture_session_id: string;
  lecture_session_slug?: string | null;
  lecture_id?: string | null; // kemungkinan snake_case
  lectureId?: string | null; // kemungkinan camelCase
  lecture_session_image_url?: string | null;
  lecture_session_title?: string | null;
  lecture_session_teacher_name?: string | null;
  lecture_session_place?: string | null;
  lecture_session_start_time: string;
  user_attendance_status?: number | null; // ⬅️ gunakan number agar cocok dengan komponen
  user_grade_result?: number | null;
};

/* ===================== Utils ===================== */
function pickJoinDate(u?: AnyUser): Date | undefined {
  if (!u) return undefined;
  const iso =
    u.created_at ??
    u.createdAt ??
    u.first_seen_at ??
    (typeof u.created_at_unix === "number"
      ? new Date(u.created_at_unix * 1000).toISOString()
      : undefined);

  if (!iso) return undefined;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? undefined : d;
}

function normalizeUser(u?: AnyUser): NormalizedUser | undefined {
  if (!u) return undefined;
  return {
    displayName: u.user_name || u.name || "Pengguna",
    role: u.role || undefined,
    joinedAt: pickJoinDate(u),
  };
}

/* ===================== Page ===================== */
export default function MasjidMyActivity() {
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { data: currentUserRaw } = useCurrentUser();

  // Normalisasi user agar aman dipakai komponen anak
  const user = useMemo(
    () => normalizeUser(currentUserRaw as AnyUser | undefined),
    [currentUserRaw]
  );

  const {
    data: lectureSessions = [],
    isLoading,
    isError,
  } = useQuery<LectureSessionApi[]>({
    queryKey: [
      "kajianListBySlug",
      slug,
      (currentUserRaw as AnyUser | undefined)?.id,
    ],
    queryFn: async () => {
      const u = currentUserRaw as AnyUser | undefined;
      const headers = u?.id ? { "X-User-Id": u.id } : {};
      const res = await axios.get(
        `/public/lecture-sessions-u/soal-materi/${slug}?attendance_only=true`,
        { headers }
      );
      return (res.data?.data as LectureSessionApi[] | undefined) ?? [];
    },
    enabled:
      Boolean(slug) && Boolean((currentUserRaw as AnyUser | undefined)?.id),
  });

  // ⬇️ Map KE tipe yang diminta komponen (LectureMaterialItem)
  const mappedSessions: LectureMaterialItem[] = useMemo(
    () =>
      lectureSessions.map((sesi) => {
        const slug = sesi.lecture_session_slug ?? sesi.lecture_session_id;
        const lectureId =
          sesi.lecture_id ?? sesi.lectureId ?? sesi.lecture_session_id;

        // Normalisasi -> undefined (bukan null)
        const attendance =
          typeof sesi.user_attendance_status === "number"
            ? sesi.user_attendance_status
            : undefined;

        const grade =
          typeof sesi.user_grade_result === "number"
            ? sesi.user_grade_result
            : undefined;

        // Susun objek dasar (field wajib)
        const base = {
          id: sesi.lecture_session_id,
          lecture_session_slug: slug,
          lectureId,
          title: sesi.lecture_session_title?.trim() || "-",
          teacher: sesi.lecture_session_teacher_name?.trim() || "-",
          masjidName: "-",
          location: sesi.lecture_session_place || "-",
          time: new Date(sesi.lecture_session_start_time).toLocaleString(
            "id-ID",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }
          ),
          status: grade !== undefined ? "tersedia" : "proses",
        } as const;

        // Tambahkan field optional hanya jika ada nilainya
        const item: LectureMaterialItem = {
          ...base,
          ...(sesi.lecture_session_image_url
            ? { imageUrl: sesi.lecture_session_image_url }
            : {}),
          ...(attendance !== undefined ? { attendanceStatus: attendance } : {}),
          ...(grade !== undefined ? { gradeResult: grade } : {}),
        };

        return item;
      }),
    [lectureSessions]
  );

  const displayedSessions = mappedSessions.slice(0, 5);

  return (
    <>
      <PublicNavbar masjidName="Aktivitas Saya" />

      {!currentUserRaw ? (
        <GuestView
          themeColors={themeColors}
          onLogin={() => navigate("/login")}
        />
      ) : (
        <UserActivityView
          user={user}
          themeColors={themeColors}
          isDark={isDark}
          slug={slug || ""}
          sessions={displayedSessions}
          isLoading={isLoading}
          isError={isError}
        />
      )}

      <BottomNavbar />
    </>
  );
}

/* ===================== Subcomponents ===================== */
function GuestView({
  themeColors,
  onLogin,
}: {
  themeColors: typeof colors.light;
  onLogin: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <p className="text-sm mb-4" style={{ color: themeColors.black1 }}>
          Silakan login terlebih dahulu untuk mulai melihat aktivitas belajar
          Anda.
        </p>
        <CommonActionButton
          text="Login"
          onClick={onLogin}
          className="px-4 py-2 text-sm rounded-md"
          style={{
            backgroundColor: themeColors.primary,
            color: themeColors.white1,
          }}
        />
      </div>
    </div>
  );
}

function UserActivityView({
  user,
  themeColors,
  isDark,
  slug,
  sessions,
  isLoading,
  isError,
}: {
  user?: NormalizedUser;
  themeColors: typeof colors.light;
  isDark: boolean;
  slug: string;
  sessions: LectureMaterialItem[]; // ⬅️ pakai tipe yang benar
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <div className="min-h-screen pb-28 bg-cover bg-no-repeat bg-center pt-16">
      <UserProfileCard user={user} themeColors={themeColors} isDark={isDark} />

      {/* Riwayat Kajian */}
      <div className="mt-6">
        <h2
          className="text-sm font-semibold mb-3"
          style={{ color: themeColors.primary }}
        >
          Riwayat Kajian Saya
        </h2>

        {isLoading ? (
          <p>Memuat data...</p>
        ) : isError ? (
          <p className="text-red-500 text-sm">Gagal memuat data kajian.</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm italic text-gray-500">
            Belum ada kajian yang dihadiri.
          </p>
        ) : (
          <LectureMaterialList data={sessions} />
        )}

        <br />

        <CommonButton
          to={`/masjid/${slug}/aktivitas/kajian-saya`}
          text="Selengkapnya"
          className="w-full py-3 rounded-lg text-sm"
          style={{
            backgroundColor: themeColors.primary,
            color: themeColors.white1,
          }}
        />
      </div>
    </div>
  );
}

function UserProfileCard({
  user,
  themeColors,
  isDark,
}: {
  user?: NormalizedUser;
  themeColors: typeof colors.light;
  isDark: boolean;
}) {
  const joinDate = user?.joinedAt;
  const isValidDate = !!joinDate && !isNaN(joinDate.getTime());

  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: themeColors.primary2 }}
    >
      <h1
        className="text-base font-semibold"
        style={{ color: themeColors.black1 }}
      >
        {user?.displayName || "Nama tidak tersedia"}
      </h1>

      {user?.role && (
        <p className="text-sm mt-1" style={{ color: themeColors.black1 }}>
          Role: {user.role}
        </p>
      )}

      <p className="text-sm mt-1" style={{ color: themeColors.black1 }}>
        Bergabung pada{" "}
        {isValidDate
          ? joinDate!.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "-"}
      </p>

      <button
        className="mt-4 px-4 py-2 text-sm font-medium rounded-full"
        style={{
          backgroundColor: themeColors.primary,
          color: isDark ? themeColors.black1 : themeColors.white1,
        }}
      >
        Profil Saya
      </button>
    </div>
  );
}
