// src/pages/public/aktivitas/MyActivityAllLectures.tsx

import BottomNavbar from "@/components/common/public/ButtonNavbar";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import LectureMaterialList from "@/components/pages/lecture/LectureMaterialList";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import FormattedDate from "@/constants/formattedDate";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

export default function MasjidAllMyLecture() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const { data: currentUser } = useCurrentUser();
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    data: lectureSessions = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["allKajianBySlug", slug, currentUser?.id],

    queryFn: async () => {
      const headers = currentUser?.id ? { "X-User-Id": currentUser.id } : {};
      const res = await axios.get(
        `/public/lecture-sessions-u/soal-materi/${slug}?attendance_only=true`,
        { headers }
      );
      return res.data?.data ?? [];
    },
    enabled: !!slug,
  });

  const mappedSessions = lectureSessions.map((sesi: any) => ({
    id: sesi.lecture_session_id,
    imageUrl: sesi.lecture_session_image_url,
    title: sesi.lecture_session_title?.trim() || "-",
    teacher: sesi.lecture_session_teacher_name?.trim() || "-",
    masjidName: "-",
    location: sesi.lecture_session_place || "-",
    // Ganti toLocaleString dengan FormattedDate
    time: (
      <FormattedDate
        value={sesi.lecture_session_start_time}
        fullMonth
        className="text-xs text-gray-500"
      />
    ),
    attendanceStatus: sesi.user_attendance_status,
    gradeResult: sesi.user_grade_result,
    status: sesi.user_grade_result !== undefined ? "tersedia" : "proses",
  }));

  return (
    <>
      <PageHeaderUser
        title="Riwayat Kajian Saya"
        onBackClick={() => navigate(`/masjid/${slug}/aktivitas`)}
      />

      <div className="min-h-screen pb-28 px-4 space-y-4">
        {/* <h1
          className="text-base font-semibold mt-2"
          style={{ color: themeColors.primary }}
        >
          Semua Kajian yang Anda Hadiri
        </h1> */}

        {isLoading ? (
          <p className="text-sm text-gray-500">Memuat data...</p>
        ) : isError ? (
          <p className="text-red-500 text-sm">Gagal memuat data kajian.</p>
        ) : mappedSessions.length === 0 ? (
          <p className="text-sm italic text-gray-500">
            Belum ada kajian yang dihadiri.
          </p>
        ) : (
          <LectureMaterialList data={mappedSessions} />
        )}
      </div>

      <BottomNavbar />
    </>
  );
}
