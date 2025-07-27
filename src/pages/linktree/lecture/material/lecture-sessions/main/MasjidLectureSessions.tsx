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

// =====================
// ✅ Interface
// =====================
interface LectureSession {
  lecture_session_title: string;
  lecture_session_teacher_name: string;
  lecture_session_start_time: string;
  lecture_session_place: string;
  user_grade_result?: number;
  user_attendance_status?: number; // 1 = Hadir, 0 = Tidak Hadir, undefined/null = Belum
}

export default function MasjidLectureSessions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const { id = "", slug = "" } = useParams<{ id: string; slug: string }>();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "navigasi";
  const fromTab = location.state?.fromTab;
  const lectureId = location.state?.lectureId;

  const { data: currentUser } = useCurrentUser();

  const { data, isLoading } = useQuery<LectureSession>({
    queryKey: ["lectureSessionDetail", id, currentUser?.id],
    queryFn: async () => {
      const headers = currentUser?.id ? { "X-User-Id": currentUser.id } : {};

      const res = await axios.get(`/public/lecture-sessions-u/by-id/${id}`, {
        headers,
      });
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

  const info = {
    materi: data?.lecture_session_title || "-",
    ustadz: data?.lecture_session_teacher_name || "-",
    jadwal: data?.lecture_session_start_time
      ? new Date(data.lecture_session_start_time).toLocaleString("id-ID", {
          dateStyle: "full",
          timeStyle: "short",
        })
      : "-",
    tempat: data?.lecture_session_place || "-",
  };

  const menuItems = [
    { label: "Informasi", icon: "🏠", path: "informasi" },
    { label: "Video-Audio", icon: "🎥", path: "video-audio" },
    { label: "Latihan Soal", icon: "📘", path: "latihan-soal" },
    { label: "Materi Lengkap", icon: "📖", path: "materi-lengkap" },
    { label: "Ringkasan", icon: "📝", path: "ringkasan" },
    { label: "Dokumen", icon: "📂", path: "dokumen" },
  ];

  return (
    <div className="lg:p-4 pb-20 space-y-4 max-w-2xl mx-auto">
      <PageHeaderUser
        title="Kajian Detail"
        onBackClick={() => {
          if (fromTab && lectureId) {
            navigate(`/masjid/${slug}/tema/${lectureId}?tab=${fromTab}`);
          } else {
            navigate(-1); // fallback
          }
        }}
      />

      {/* 📘 Informasi Kajian */}
      <div
        className="p-4 rounded-lg space-y-2 text-sm"
        style={{
          backgroundColor: theme.white1,
          color: theme.black1,
          border: `1px solid ${theme.silver1}`,
        }}
      >
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
              {info.jadwal}
            </div>
            <div>
              📍 <strong style={{ color: theme.black1 }}>Tempat:</strong>{" "}
              {info.tempat}
            </div>

            {/* 🧮 Nilai Akhir */}
            {data?.user_grade_result !== undefined && (
              <div>
                🧮 <strong style={{ color: theme.black1 }}>Nilai Akhir:</strong>{" "}
                {data.user_grade_result}
              </div>
            )}

            {/* ✅ Kehadiran */}
            {data?.user_attendance_status !== undefined && (
              <div>
                ✅ <strong style={{ color: theme.black1 }}>Kehadiran:</strong>{" "}
                {data.user_attendance_status === 1
                  ? "Hadir"
                  : data.user_attendance_status === 0
                    ? "Tidak Hadir"
                    : "Belum Tercatat"}
              </div>
            )}
          </>
        )}
      </div>

      {/* 🧭 Navigasi Utama */}
      <div>
        <h2
          className="text-base font-semibold mb-2"
          style={{ color: theme.quaternary }}
        >
          Navigasi Utama disini
        </h2>
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <div
              key={item.label}
              onClick={() =>
                navigate(
                  `/masjid/${slug}/soal-materi/${id}/${item.path}?tab=${tab}`,
                  { state: { fromTab: tab } }
                )
              }
              className="flex flex-col items-center text-center text-sm p-3 rounded-md cursor-pointer hover:opacity-90 transition"
              style={{
                backgroundColor: theme.white3,
                color: theme.black1,
              }}
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
