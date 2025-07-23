import PageHeader from "@/components/common/home/PageHeaderUser";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import FormattedDate from "@/constants/formattedDate";

export default function MasjidFullTranscriptDetailLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const { id: lecture_session_id } = useParams();
  const { state: session } = useLocation();

  if (!session) {
    return (
      <p className="text-sm text-red-500">Data sesi kajian tidak tersedia.</p>
    );
  }

  const {
    lecture_session_title,
    lecture_session_teacher_name,
    lecture_session_start_time,
    lecture_session_place,
  } = session;

  const {
    data: materialData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-lecture-session-transcript", lecture_session_id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-materials/filter?lecture_session_id=${lecture_session_id}&type=transcript`
      );
      console.log("📦 Data materi lengkap dari endpoint:", res.data);
      return res?.data?.data?.[0] ?? null;
    },
    enabled: !!lecture_session_id,
    staleTime: 1000 * 60 * 5,
  });

  const transcript =
    materialData?.lecture_sessions_material_transcript_full || "";

  return (
    <div className="space-y-4">
      <PageHeader title="Materi Lengkap" onBackClick={() => history.back()} />

      <div
        className="p-4 rounded-xl shadow-sm"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        {isLoading ? (
          <p>Memuat data...</p>
        ) : isError ? (
          <p className="text-red-500">Gagal memuat data materi lengkap.</p>
        ) : (
          <>
            <div className="space-y-1 mb-4">
              <h2 className="text-base font-semibold text-sky-600">
                {lecture_session_title || "-"}
              </h2>
              <p className="text-sm text-gray-500">
                {lecture_session_start_time && (
                  <FormattedDate
                    value={lecture_session_start_time}
                    fullMonth
                    className="inline"
                  />
                )}{" "}
                / {lecture_session_place || "-"}
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: theme.primary }}
              >
                {lecture_session_teacher_name || "-"}
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
