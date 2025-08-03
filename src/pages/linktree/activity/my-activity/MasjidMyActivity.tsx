import BottomNavbar from "@/components/common/public/ButtonNavbar";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import LectureMaterialList from "@/components/pages/lecture/LectureMaterialList";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import CommonButton from "@/components/common/main/CommonButton";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useNavigate, useParams } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function MasjidMyActivity() {
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { slug } = useParams();
  const { data: currentUser } = useCurrentUser();
  const {
    data: lectureSessions = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["kajianListBySlug", slug, currentUser?.id],
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
    time: new Date(sesi.lecture_session_start_time).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    attendanceStatus: sesi.user_attendance_status,
    gradeResult: sesi.user_grade_result,
    status: sesi.user_grade_result !== undefined ? "tersedia" : "proses",
  }));

  const displayedSessions = mappedSessions.slice(0, 5);

  return (
    <>
      <PublicNavbar masjidName="Aktivitas Saya" />

      <div className="min-h-screen pb-28 bg-cover bg-no-repeat bg-center pt-16">
        {/* Header User */}
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: themeColors.tertiary }}
        >
          <h1
            className="text-base font-semibold"
            style={{ color: themeColors.black1 }}
          >
            Budi Renaldi
          </h1>
          <p className="text-sm mt-1" style={{ color: themeColors.black1 }}>
            Bergabung pada 3 November 2025
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

        {/* Kartu 2 kolom */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <CardInfo
            label="Donasi"
            desc="Riwayat donasi yang telah diberikan"
            color={themeColors.success1}
            bg={themeColors.success2}
            onClick={() => navigate(`/masjid/${slug}/aktivitas/donasi-saya`)}
          />
          <CardInfo
            label="Statistik"
            desc="Data perkembangan belajar"
            color={themeColors.success1}
            bg={themeColors.white3}
            onClick={() => navigate(`/masjid/${slug}/aktivitas/statistik-saya`)}
          />
        </div>

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
          ) : displayedSessions.length === 0 ? (
            <p className="text-sm italic text-gray-500">
              Belum ada kajian yang dihadiri.
            </p>
          ) : (
            <LectureMaterialList data={displayedSessions} />
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

      <BottomNavbar />
    </>
  );
}

function CardInfo({
  label,
  desc,
  color,
  bg,
  onClick,
}: {
  label: string;
  desc: string;
  color: string;
  bg: string;
  onClick?: () => void;
}) {
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const overrideColors: Record<string, { bg: string; color: string }> = {
    Donasi: {
      bg: themeColors.success2,
      color: themeColors.success1,
    },
    Statistik: {
      bg: themeColors.white3,
      color: themeColors.primary,
    },
  };

  const current = overrideColors[label] ?? { bg, color };

  return (
    <div
      className="p-4 rounded-lg transition-colors duration-300 cursor-pointer"
      style={{
        backgroundColor: current.bg,
        border: `1px solid ${isDark ? themeColors.silver1 : "transparent"}`,
      }}
      onClick={onClick}
    >
      <h4
        className="text-sm font-semibold mb-1"
        style={{ color: current.color }}
      >
        {label}
      </h4>
      <p className="text-xs leading-snug" style={{ color: themeColors.black1 }}>
        {desc}
      </p>
    </div>
  );
}
