import React, { useEffect, useState } from "react";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import AttendanceModal from "./components/AttendanceModal";
import { useQueryClient } from "@tanstack/react-query";
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

// =====================
// ✅ Interface
// =====================
interface LectureSession {
  lecture_session_title: string;
  lecture_session_teacher_name: string;
  lecture_session_start_time: string;
  lecture_session_place: string;
  lecture_session_image_url?: string;
  user_grade_result?: number;
}

interface UserAttendance {
  user_lecture_sessions_attendance_status: number;
  user_lecture_sessions_attendance_notes: string;
  user_lecture_sessions_attendance_personal_notes: string;
}

interface AttendanceForm {
  user_lecture_sessions_attendance_lecture_session_id: string;
  user_lecture_sessions_attendance_status?: number;
  user_lecture_sessions_attendance_notes?: string;
  user_lecture_sessions_attendance_personal_notes?: string;
}

export default function MasjidLectureSessions() {
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const { id = "", slug = "" } = useParams<{ id: string; slug: string }>();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "navigasi";

  const { data: currentUser } = useCurrentUser();

  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<LectureSession>({
    queryKey: ["lectureSessionDetail", id, currentUser?.id],
    queryFn: async () => {
      const headers = currentUser?.id ? { "X-User-Id": currentUser.id } : {};

      const res = await axios.get(`/public/lecture-sessions-u/by-id/${id}`, {
        headers,
      });
      console.log("📦 Data kajian:", res.data);
      return res.data;
    },
    enabled: !!id, // ✅ tetap dijalankan meskipun user belum login
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const cookies = document.cookie;
    console.log("🍪 Semua cookie:", cookies);

    const hasUserId = cookies.includes("user_id=");
    if (hasUserId) {
      console.log("✅ Cookie 'user_id' ditemukan");
    } else {
      console.log("❌ Cookie 'user_id' tidak ditemukan");
    }
  }, []);

  const { data: attendanceData, isLoading: loadingAttendance } =
    useQuery<UserAttendance>({
      queryKey: ["userAttendance", id, currentUser?.id],
      queryFn: async () => {
        const headers = currentUser?.id ? { "X-User-Id": currentUser.id } : {};
        const res = await axios.get(
          `/public/user-lecture-sessions-attendance/${id}`,
          { headers }
        );
        return res.data;
      },
      enabled: !!id && !!currentUser?.id, // hanya jalan jika sudah login
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
    { label: "Materi Lengkap", icon: Book, path: "materi-lengkap" },
    { label: "Ringkasan", icon: FileText, path: "ringkasan" },
    { label: "Dokumen", icon: FolderOpen, path: "dokumen" },
  ];

  return (
    <div className="pb-20 space-y-0 max-w-2xl mx-auto">
      <PageHeaderUser
        title="Kajian Detail"
        onBackClick={() => {
          navigate(`/masjid/${slug}/soal-materi?tab=terbaru`);
        }}
      />

      {/* 📷 Gambar + 📘 Info Kajian dalam 1 card horizontal */}
      <div
        className="rounded-xl overflow-hidden border flex flex-col md:flex-row"
        style={{
          borderColor: theme.silver1,
          backgroundColor: theme.white1,
          color: theme.black1,
        }}
      >
        {/* Gambar Kajian */}
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

        {/* Informasi Kajian */}
        <div className="flex-1 p-4 space-y-2 text-sm">
          {isLoading ? (
            <p style={{ color: theme.silver2 }}>Memuat data...</p>
          ) : (
            <>
              <div>
                📘 <strong style={{ color: theme.black1 }}>Materi:</strong>{" "}
                {info.materi}
              </div>
              <div>
                👤 <strong style={{ color: theme.black1 }}>Pengajar:</strong>{" "}
                {info.ustadz}
              </div>
              <div>
                📅 <strong style={{ color: theme.black1 }}>Jadwal:</strong>{" "}
                {info.jadwal !== "-" ? (
                  <FormattedDate value={info.jadwal} fullMonth />
                ) : (
                  "-"
                )}
              </div>

              <div>
                📍 <strong style={{ color: theme.black1 }}>Tempat:</strong>{" "}
                {info.tempat}
              </div>

              {/* 🧾 Ringkasan Hasil Belajar */}
              <div className="flex flex-col gap-3 mt-4">
                {/* Nilai & Soal */}
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(
                  `/masjid/${slug}/soal-materi/${id}/${item.path}?tab=${tab}`,
                  { state: { fromTab: tab } }
                );
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
        {/* Bottom Navigation */}
        <BottomNavbar />

        {/* 📋 Modal Kehadiran */}
        <AttendanceModal
          show={showModal}
          onClose={() => setShowModal(false)}
          sessionId={id}
          onSuccess={() => {
            setShowModal(false);

            // 🔁 Refetch data kehadiran & nilai
            queryClient.invalidateQueries({
              queryKey: ["userAttendance", id, currentUser?.id],
            });
            queryClient.invalidateQueries({
              queryKey: ["lectureSessionDetail", id, currentUser?.id],
            });

            console.log("🔄 Kehadiran & nilai direfresh ulang");
          }}
        />
      </div>
    </div>
  );
}
