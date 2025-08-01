import PageHeader from "@/components/common/home/PageHeaderUser";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import FormattedDate from "@/constants/formattedDate";

export default function MasjidFullTranscriptLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const theme = isDark ? colors.dark : colors.light;
  const { id: lecture_session_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const backUrl = location.state?.from || `/masjid/${slug}/soal-materi/${id}`;

  // 📥 Fetch detail sesi kajian
  const {
    data: sessionDetail,
    isLoading: isLoadingSession,
    isError: isErrorSession,
  } = useQuery({
    queryKey: ["lecture-session-detail", lecture_session_id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-u/by-id/${lecture_session_id}`
      );
      console.log("📦 Data sesi kajian:", res.data);
      return res.data; // ✅ ini yang benar
    },
    enabled: !!lecture_session_id,
    staleTime: 1000 * 60 * 5,
  });

  // 📥 Fetch transkrip materi
  const {
    data: materialData,
    isLoading: isLoadingTranscript,
    isError: isErrorTranscript,
  } = useQuery({
    queryKey: ["public-lecture-session-transcript", lecture_session_id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-materials/filter?lecture_session_id=${lecture_session_id}&type=transcript`
      );
      console.log("Data transcript didapatkan ", res.data);
      return res?.data?.data?.[0] ?? null;
    },
    enabled: !!lecture_session_id,
    staleTime: 1000 * 60 * 5,
  });

  const transcript =
    materialData?.lecture_sessions_material_transcript_full || "";

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <PageHeader
        title="Materi Lengkap"
        onBackClick={() => navigate(backUrl)}
      />

      <div
        className="p-4 rounded-xl shadow-sm"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        {isLoadingSession || isLoadingTranscript ? (
          <p>Memuat data...</p>
        ) : isErrorSession ? (
          <p className="text-red-500">Gagal memuat detail sesi kajian.</p>
        ) : isErrorTranscript ? (
          <p className="text-red-500">Gagal memuat data materi lengkap.</p>
        ) : (
          <>
            <div className="space-y-1 mb-4">
              <h2 className="text-base font-semibold text-sky-600">
                {sessionDetail?.lecture_session_title || "-"}
              </h2>
              <p className="text-sm text-gray-500">
                {sessionDetail?.lecture_session_start_time && (
                  <FormattedDate
                    value={sessionDetail.lecture_session_start_time}
                    fullMonth
                    className="inline"
                  />
                )}{" "}
                / {sessionDetail?.lecture_session_place || "-"}
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: theme.primary }}
              >
                {sessionDetail?.lecture_session_teacher_name || "-"}
              </p>
            </div>

            <div
              className="space-y-4 text-sm leading-relaxed text-justify"
              style={{ color: theme.black1 }}
            >
              {transcript ? (
                <p>{transcript}</p>
              ) : (
                <p className="italic text-gray-500">
                  Belum ada materi lengkap tersedia.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
