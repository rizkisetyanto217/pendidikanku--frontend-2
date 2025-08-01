import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import AttendanceModal from "./components/AttendanceModal";

// =====================
interface LectureSession {
  lecture_session_title: string;
  lecture_session_description: string;
  lecture_session_teacher_name: string;
  lecture_session_start_time: string;
  lecture_session_place: string;
  lecture_session_image_url?: string;
  user_grade_result?: number;
  user_attendance_status?: number;
}

export default function MasjidInformationLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const [showModal, setShowModal] = useState(false);
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<LectureSession>({
    queryKey: ["lectureSessionDetail", id, currentUser?.id],
    queryFn: async () => {
      const headers = currentUser?.id ? { "X-User-Id": currentUser.id } : {};
      const res = await axios.get(`/public/lecture-sessions-u/by-id/${id}`, {
        headers,
      });
      return res.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

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
    deskripsi: data?.lecture_session_description || "-",
    gambar: data?.lecture_session_image_url,
  };

  return (
    <div className="pb-24 space-y-4 max-w-2xl mx-auto">
      <PageHeaderUser
        title="Informasi Kajian"
        onBackClick={() => {
          navigate(`/masjid/${slug}/soal-materi/${id}`);
        }}
      />

      {isLoading ? (
        <p style={{ color: theme.silver2 }}>Memuat informasi kajian...</p>
      ) : (
        <div className="rounded-lg space-y-4 text-sm">
          {info.gambar && (
            <img
              src={info.gambar}
              alt="Gambar Kajian"
              className="w-full h-48 object-cover rounded-md"
            />
          )}

          <div>
            <strong style={{ color: theme.black1 }}>Materi:</strong>{" "}
            {info.materi}
          </div>
          <div>
            <strong style={{ color: theme.black1 }}>Pengajar:</strong>{" "}
            {info.ustadz}
          </div>
          <div>
            <strong style={{ color: theme.black1 }}>Jadwal:</strong>{" "}
            {info.jadwal}
          </div>
          <div>
            <strong style={{ color: theme.black1 }}>Tempat:</strong>{" "}
            {info.tempat}
          </div>

          <div>
            <strong style={{ color: theme.black1 }}>Deskripsi:</strong>
            <div
              className="text-sm mt-1 leading-relaxed prose prose-sm prose-slate max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: info.deskripsi }}
            />
          </div>

          {/* 🧾 Ringkasan */}
          <div className="flex flex-col gap-3">
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

            <div
              className="rounded-md px-3 py-2 text-sm cursor-pointer hover:opacity-80"
              style={{
                backgroundColor:
                  data?.user_attendance_status === 1 ? "#D1FAE5" : "#FDE68A",
                color:
                  data?.user_attendance_status === 1 ? "#065F46" : "#92400E",
                border: "1px solid #D1D5DB",
              }}
              onClick={() => setShowModal(true)}
            >
              <strong>Status Kehadiran:</strong>{" "}
              {data?.user_attendance_status === 1
                ? "Hadir Tatap Muka ✓"
                : "✎ Catat Kehadiran"}
            </div>
          </div>

          <AttendanceModal
            show={showModal}
            onClose={() => setShowModal(false)}
            sessionId={id || ""} // ← dijamin string, walau kosong
            onSuccess={() => {
              setShowModal(false);
              queryClient.invalidateQueries({
                queryKey: ["lectureSessionDetail", id, currentUser?.id],
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
