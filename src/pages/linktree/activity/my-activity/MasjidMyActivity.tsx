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

export default function MasjidMyActivity() {
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { slug } = useParams();
  const { data: currentUser } = useCurrentUser();

  // Tetap panggil hook, meskipun tidak fetch data kalau belum login
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
    enabled: !!slug && !!currentUser?.id,
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

      {!currentUser ? (
        <GuestView
          themeColors={themeColors}
          onLogin={() => navigate("/login")}
        />
      ) : (
        <UserActivityView
          user={currentUser}
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
  user: { name: string; created_at: string };
  themeColors: typeof colors.light;
  isDark: boolean;
  slug: string;
  sessions: any[];
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <div className="min-h-screen pb-28 bg-cover bg-no-repeat bg-center pt-16">
      {/* Header Profil */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: themeColors.tertiary }}
      >
        <h1
          className="text-base font-semibold"
          style={{ color: themeColors.black1 }}
        >
          {user.name}
        </h1>
        <p className="text-sm mt-1" style={{ color: themeColors.black1 }}>
          Bergabung pada{" "}
          {new Date(user.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
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
