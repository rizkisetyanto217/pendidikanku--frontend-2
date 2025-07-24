import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import FormattedDate from "@/constants/formattedDate";

interface LectureSession {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_teacher_name: string;
  lecture_session_start_time: string;
  lecture_session_place: string;
}

export default function DKMFullTranscriptLectureSessions() {
  const { id: lecture_session_id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  // ✅ Ambil data sesi langsung dari backend
  const {
    data: session,
    isLoading: isLoadingSession,
    isError: isErrorSession,
  } = useQuery<LectureSession>({
    queryKey: ["lecture-session", lecture_session_id],
    queryFn: async () => {
      const res = await axios.get(
        `/api/a/lecture-sessions/by-id/${lecture_session_id}`
      );
      return res.data;
    },
    enabled: !!lecture_session_id,
    staleTime: 1000 * 60 * 5,
  });

  // ✅ Ambil data transkrip
  const {
    data: materialData,
    isLoading: isLoadingTranscript,
    isError: isErrorTranscript,
  } = useQuery({
    queryKey: ["lecture-session-transcript", lecture_session_id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-materials/filter?lecture_session_id=${lecture_session_id}&type=transcript`
      );
      console.log("📘 Data transkrip materi sesi kajian:", res.data.data);
      return res.data.data?.[0] ?? null;
    },
    enabled: !!lecture_session_id,
    staleTime: 1000 * 60 * 5,
  });

  const transcript =
    materialData?.lecture_sessions_material_transcript_full || "";
  const materialId = materialData?.lecture_sessions_material_id;

  const handleEditClick = () => {
    const base = `/dkm/kajian/kajian-detail/${lecture_session_id}/materi-lengkap`;
    const target = materialId
      ? `${base}/tambah-edit/${materialId}`
      : `${base}/tambah-edit`;
    navigate(target, { state: session });
  };

  // ⏳ Loading atau error
  if (isLoadingSession) {
    return <p className="text-sm text-gray-500">Memuat sesi kajian...</p>;
  }

  if (isErrorSession || !session) {
    return (
      <p className="text-sm text-red-500">Gagal memuat data sesi kajian.</p>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Materi Lengkap" onBackClick={() => history.back()} />

      <div
        className="p-6 rounded-2xl shadow-sm"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        {/* Informasi Kajian */}
        <div className="space-y-1 mb-4">
          <h2 className="text-base font-semibold text-sky-600">
            {session.lecture_session_title || "-"}
          </h2>
          <p className="text-sm text-gray-500">
            {session.lecture_session_start_time ? (
              <>
                <FormattedDate
                  value={session.lecture_session_start_time}
                  fullMonth
                  className="inline"
                />{" "}
                / {session.lecture_session_place || "-"}
              </>
            ) : (
              "- / -"
            )}
          </p>
          <p className="text-sm font-semibold" style={{ color: theme.primary }}>
            {session.lecture_session_teacher_name || "-"}
          </p>
        </div>

        {/* Konten Materi */}
        <div
          className="space-y-4 text-sm leading-relaxed text-justify"
          style={{ color: theme.black1 }}
        >
          {isLoadingTranscript ? (
            <p>Memuat data materi...</p>
          ) : isErrorTranscript ? (
            <p className="text-red-500">Gagal memuat data materi lengkap.</p>
          ) : transcript ? (
            <p>{transcript}</p>
          ) : (
            <p className="italic text-gray-500">
              Belum ada materi lengkap tersedia.
            </p>
          )}
        </div>

        {/* Tombol Edit */}
        <div className="mt-6 text-right">
          <button
            className="px-5 py-2 rounded-lg font-semibold"
            style={{ backgroundColor: theme.primary, color: theme.white1 }}
            onClick={handleEditClick}
          >
            {materialId ? "Edit Materi" : "Tambah Materi"}
          </button>
        </div>
      </div>
    </div>
  );
}
