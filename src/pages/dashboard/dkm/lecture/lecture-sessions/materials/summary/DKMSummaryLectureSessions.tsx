import PageHeader from "@/components/common/home/PageHeaderDashboard";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import FormattedDate from "@/constants/formattedDate";
import cleanTranscriptHTML from "@/constants/cleanTransciptHTML";
import parse from "html-react-parser";

interface LectureSession {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_teacher_name: string;
  lecture_session_start_time: string;
  lecture_session_place: string;
}

interface SummaryMaterial {
  lecture_sessions_material_id: string;
  lecture_sessions_material_summary: string;
}

export default function DKMSummaryLectureSessions() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const { id: lecture_session_id } = useParams();
  const navigate = useNavigate();
  const { id } = useParams();

  // ✅ Ambil data sesi
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

  // ✅ Ambil data ringkasan
  const {
    data: materialData,
    isLoading: isLoadingSummary,
    isError: isErrorSummary,
  } = useQuery<SummaryMaterial | null>({
    queryKey: ["lecture-session-summary", lecture_session_id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-materials/filter?lecture_session_id=${lecture_session_id}&type=summary`
      );
      return res.data.data?.[0] ?? null;
    },
    enabled: !!lecture_session_id,
    staleTime: 1000 * 60 * 5,
  });

  const summary = materialData?.lecture_sessions_material_summary || "";
  const materialId = materialData?.lecture_sessions_material_id;

  const handleEditClick = () => {
    const base = `/dkm/kajian/kajian-detail/${lecture_session_id}/ringkasan/tambah-edit`;
    const targetUrl = materialId ? `${base}/${materialId}` : base;
    navigate(targetUrl, { state: session });
  };

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
      <PageHeader
        title="Materi"
        onBackClick={() => navigate(`/dkm/kajian/kajian-detail/${id}`)}
        actionButton={{
          label: materialId ? "Edit Ringkasan" : "Tambah Ringkasan",
          onClick: handleEditClick,
        }}
      />

      <div
        className="p-6 rounded-2xl shadow-sm"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        {/* Informasi Sesi */}
        <div className="space-y-1 mb-4">
          <h2 className="text-base font-semibold text-sky-600">
            {session.lecture_session_title}
          </h2>
          <p className="text-sm text-gray-500">
            <FormattedDate
              value={session.lecture_session_start_time}
              fullMonth
              className="inline"
            />{" "}
            / {session.lecture_session_place}
          </p>
          <p className="text-sm font-semibold" style={{ color: theme.primary }}>
            {session.lecture_session_teacher_name}
          </p>
        </div>

        {/* Isi Ringkasan */}
        <div
          className="space-y-4 text-sm leading-relaxed text-justify"
          style={{ color: theme.black1 }}
        >
          {isLoadingSummary ? (
            <p>Memuat data ringkasan...</p>
          ) : isErrorSummary ? (
            <p className="text-red-500">Gagal memuat data ringkasan.</p>
          ) : summary ? (
            <div className="whitespace-pre-wrap text-sm text-justify leading-relaxed">
              {parse(cleanTranscriptHTML(summary))}
            </div>
          ) : (
            <p className="italic text-gray-500">
              Belum ada ringkasan tersedia.
            </p>
          )}
        </div>

        {/* Tombol Tambah/Edit */}
        {/* <div className="mt-6 text-right">
          <button
            className="px-5 py-2 rounded-lg font-semibold"
            style={{ backgroundColor: theme.primary, color: theme.white1 }}
            onClick={handleEditClick}
          >
            {materialId ? "Edit Ringkasan" : "Tambah Ringkasan"}
          </button>
        </div> */}
      </div>
    </div>
  );
}
