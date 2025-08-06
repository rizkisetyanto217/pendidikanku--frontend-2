import React, { useEffect, useState } from "react";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import AttendanceModal from "./components/AttendanceModal";
import {
  Home,
  Video,
  BookOpen,
  Book,
  FileText,
  FolderOpen,
} from "lucide-react";
import FormattedDate from "@/constants/formattedDate";
import ShimmerImage from "@/components/common/main/ShimmerImage";
import BottomNavbar from "@/components/common/public/ButtonNavbar";
import LoginPromptModal from "./components/LoginModal";

// =====================
// ✅ Interface
// =====================
interface LectureSession {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_teacher_name: string;
  lecture_session_start_time: string;
  lecture_session_place: string;
  lecture_session_image_url?: string;
  lecture_session_slug: string;
  user_grade_result?: number;
}

interface UserAttendance {
  user_lecture_sessions_attendance_status: number;
  user_lecture_sessions_attendance_notes: string;
  user_lecture_sessions_attendance_personal_notes: string;
}

export default function MasjidLectureSessions() {
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const { lecture_session_slug = "", slug = "" } = useParams<{
    slug: string;
    lecture_session_slug: string;
  }>();

  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "navigasi";

  const { data: currentUser } = useCurrentUser();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  // ✅ Ambil data sesi berdasarkan slug
  const { data, isLoading } = useQuery<LectureSession>({
    queryKey: ["lectureSessionDetail", lecture_session_slug, currentUser?.id],
    queryFn: async () => {
      const headers = currentUser?.id ? { "X-User-Id": currentUser.id } : {};
      const res = await axios.get(
        `/public/lecture-sessions-u/by-slug/${lecture_session_slug}`,
        { headers }
      );
      return res.data;
    },
    enabled: !!lecture_session_slug,
    staleTime: 5 * 60 * 1000,
  });

  // ✅ Ambil data kehadiran berdasarkan session_id dari data
  const { data: attendanceData } = useQuery<UserAttendance>({
    queryKey: ["userAttendance", data?.lecture_session_id, currentUser?.id],
    queryFn: async () => {
      const headers = currentUser?.id ? { "X-User-Id": currentUser.id } : {};
      const res = await axios.get(
        `/public/user-lecture-sessions-attendance/${data?.lecture_session_id}`,
        { headers }
      );
      return res.data;
    },
    enabled: !!data?.lecture_session_id && !!currentUser?.id,
    staleTime: 5 * 60 * 1000,
  });

  const info = {
    materi: data?.lecture_session_title || "-",
    ustadz: data?.lecture_session_teacher_name || "-",
    jadwal: data?.lecture_session_start_time || "-",
    tempat: data?.lecture_session_place || "-",
  };

  const menuItems = [
    { label: "Informasi", icon: Home, path: "informasi" },
    { label: "Video-Audio", icon: Video, path: "video-audio" },
    { label: "Latihan Soal", icon: BookOpen, path: "latihan-soal" },
    // { label: "Materi Lengkap", icon: Book, path: "materi-lengkap" },
    { label: "Materi", icon: FileText, path: "ringkasan" },
    { label: "Dokumen", icon: FolderOpen, path: "dokumen" },
    { label: "Catatanku", icon: FolderOpen, path: "catatanku" },
  ];

  return (
    <div className="pb-20 space-y-0 max-w-2xl mx-auto">
      <PageHeaderUser
        title="Kajian Detail"
        onBackClick={() => {
          navigate(`/masjid/${slug}/soal-materi?tab=terbaru`);
        }}
      />

      {/* 📷 Gambar + Info */}
      <div
        className="rounded-xl overflow-hidden border flex flex-col md:flex-row"
        style={{
          borderColor: theme.silver1,
          backgroundColor: theme.white1,
          color: theme.black1,
        }}
      >
        <div
          className="w-full md:w-1/3 aspect-[4/5] md:aspect-auto md:h-auto overflow-hidden"
          style={{
            maxHeight: "500px",
            borderRight: `1px solid ${theme.silver1}`,
          }}
        >
          <ShimmerImage
            src={
              data?.lecture_session_image_url
                ? decodeURIComponent(data.lecture_session_image_url)
                : undefined
            }
            alt={data?.lecture_session_title || "Gambar Kajian"}
            className="w-full h-full object-cover"
            shimmerClassName="rounded"
          />
        </div>

        <div className="flex-1 p-4 space-y-2 text-sm">
          {isLoading ? (
            <p style={{ color: theme.silver2 }}>Memuat data...</p>
          ) : (
            <>
              <div>
                📘 <strong>Materi:</strong> {info.materi}
              </div>
              <div>
                👤 <strong>Pengajar:</strong> {info.ustadz}
              </div>
              <div>
                📅 <strong>Jadwal:</strong>{" "}
                {info.jadwal !== "-" ? (
                  <FormattedDate value={info.jadwal} fullMonth />
                ) : (
                  "-"
                )}
              </div>
              <div>
                📍 <strong>Tempat:</strong> {info.tempat}
              </div>

              {/* Hasil */}
              <div className="flex flex-col gap-3 mt-4">
                <div
                  className="rounded-md px-3 py-2 text-sm"
                  style={{
                    backgroundColor:
                      typeof data?.user_grade_result === "number"
                        ? "#D1FAE5"
                        : "#FDE68A",
                    color:
                      typeof data?.user_grade_result === "number"
                        ? "#065F46"
                        : "#92400E",
                    border: "1px solid #D1D5DB",
                  }}
                >
                  <strong>Materi & Soal:</strong>{" "}
                  {typeof data?.user_grade_result === "number"
                    ? `Sudah dikerjakan ✓ | Nilai: ${data.user_grade_result}`
                    : "Tanpa Keterangan ✕"}
                </div>

                {/* Kehadiran */}
                <div
                  className="rounded-md px-3 py-2 text-sm cursor-pointer hover:opacity-80"
                  style={{
                    backgroundColor:
                      attendanceData?.user_lecture_sessions_attendance_status ===
                      1
                        ? "#D1FAE5"
                        : "#FDE68A",
                    color:
                      attendanceData?.user_lecture_sessions_attendance_status ===
                      1
                        ? "#065F46"
                        : "#92400E",
                    border: "1px solid #D1D5DB",
                  }}
                  onClick={() => setShowModal(true)}
                >
                  <strong>Status Kehadiran:</strong>{" "}
                  {attendanceData?.user_lecture_sessions_attendance_status === 1
                    ? "Hadir ✓"
                    : "✕ Catat Kehadiran"}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 🧭 Navigasi Utama */}
      <div>
        <h2
          className="text-base font-semibold mb-2 mt-4"
          style={{ color: theme.primary }}
        >
          Navigasi Utama
        </h2>
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <div
              key={item.label}
              onClick={() => {
                if (item.path === "latihan-soal" && !currentUser) {
                  setShowLoginPrompt(true); // ❗️ Tampilkan modal dulu
                } else {
                  navigate(
                    `/masjid/${slug}/soal-materi/${lecture_session_slug}/${item.path}`,
                    { state: { fromTab: tab } }
                  );
                }
              }}
              className="flex flex-col items-center text-center text-sm p-3 rounded-md cursor-pointer hover:opacity-90 transition"
              style={{
                backgroundColor: theme.white3,
                color: theme.black1,
              }}
            >
              <div className="text-2xl mb-1">
                <item.icon size={24} />
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* ⬇ Bottom bar */}
        <BottomNavbar />

        {/* 📋 Modal Kehadiran */}
        {showModal &&
          (currentUser ? (
            <AttendanceModal
              show={showModal}
              onClose={() => setShowModal(false)}
              sessionId={data?.lecture_session_id || ""}
              onSuccess={() => {
                setShowModal(false);
                queryClient.invalidateQueries({
                  queryKey: [
                    "userAttendance",
                    data?.lecture_session_id,
                    currentUser?.id,
                  ],
                });
                queryClient.invalidateQueries({
                  queryKey: [
                    "lectureSessionDetail",
                    lecture_session_slug,
                    currentUser?.id,
                  ],
                });
                console.log("🔄 Kehadiran & nilai direfresh ulang");
              }}
            />
          ) : (
            <LoginPromptModal
              show={true}
              onClose={() => setShowModal(false)}
              onLogin={() => (window.location.href = "/login")}
              showContinueButton={false} // tidak ada lanjut tanpa login saat mencatat kehadiran
              title="Login untuk Mencatat Kehadiran"
              message="Silakan login terlebih dahulu agar dapat mencatat kehadiran pada kajian ini."
            />
          ))}

        <LoginPromptModal
          show={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          onLogin={() => (window.location.href = "/login")}
          showContinueButton={true}
          continueLabel="Lanjutkan Tanpa Login"
          onContinue={() => {
            setShowLoginPrompt(false);
            navigate(
              `/masjid/${slug}/soal-materi/${lecture_session_slug}/latihan-soal`,
              { state: { fromTab: tab } }
            );
          }}
          title="Login untuk Menyimpan Progres"
          message="Silakan login terlebih dahulu jika ingin progres latihan soal Anda tersimpan."
        />
      </div>
    </div>
  );
}
