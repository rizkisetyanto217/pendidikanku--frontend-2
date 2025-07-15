import PageHeader from "@/components/common/PageHeader";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useEffect } from "react";

export default function DKMSummaryLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const { id: lecture_session_id } = useParams();
  const { state: session } = useLocation();

  useEffect(() => {
    console.log("📦 Params: lecture_session_id =", lecture_session_id);
    console.log("📦 Session state:", session);
  }, [lecture_session_id, session]);

  const {
    data: materialData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["lecture-session-summary", lecture_session_id],
    queryFn: async () => {
      console.log("📡 Fetching summary with ID:", lecture_session_id);
      try {
        const res = await axios.get(
          `/public/lecture-sessions-materials/filter?lecture_session_id=${lecture_session_id}&type=summary`
        );
        const result = res?.data?.data?.[0];
        console.log("✅ Fetched Summary Data:", result);
        return result ?? null;
      } catch (error) {
        console.error("❌ Error fetching summary:", error);
        return null;
      }
    },
    enabled: !!lecture_session_id,
  });

  useEffect(() => {
    if (materialData) {
      console.log("📥 Summary data loaded:", materialData);
    }
  }, [materialData]);

  const summary = materialData?.lecture_sessions_material_summary || "";

  // ambil data sesi dari state
  const {
    lecture_session_title,
    lecture_session_teacher_name,
    lecture_session_start_time,
    lecture_session_place,
  } = session || {};

  const formattedTime = lecture_session_start_time
    ? new Date(lecture_session_start_time).toLocaleString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  return (
    <div className="space-y-4">
      <PageHeader title="Ringkasan" onBackClick={() => history.back()} />
      <div
        className="p-6 rounded-2xl shadow-sm"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        {isLoading ? (
          <p>Memuat data...</p>
        ) : isError ? (
          <p className="text-red-500">Gagal memuat data ringkasan.</p>
        ) : (
          <>
            {/* Info sesi dari state */}
            <div className="space-y-1 mb-4">
              <h2 className="text-base font-semibold text-sky-600 hover:underline cursor-pointer">
                {lecture_session_title || "-"}
              </h2>
              <p className="text-sm text-gray-500">
                {formattedTime} / {lecture_session_place || "-"}
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: theme.primary }}
              >
                {lecture_session_teacher_name || "-"}
              </p>
            </div>

            {/* Summary dari API */}
            <div
              className="space-y-4 text-sm leading-relaxed text-justify"
              style={{ color: theme.black1 }}
            >
              {summary ? (
                <p>{summary}</p>
              ) : (
                <p className="italic text-gray-500">
                  Belum ada ringkasan tersedia.
                </p>
              )}
            </div>

            {/* Tombol */}
            <div className="mt-6 text-right">
              <button
                className="px-5 py-2 rounded-lg font-semibold"
                style={{ backgroundColor: theme.primary, color: theme.white1 }}
              >
                Edit Ringkasan
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
