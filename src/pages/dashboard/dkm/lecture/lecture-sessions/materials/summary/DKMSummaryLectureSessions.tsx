import PageHeader from "@/components/common/home/PageHeaderDashboard";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import FormattedDate from "@/constants/formattedDate";

export default function DKMSummaryLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const { id: lecture_session_id } = useParams();
  const { state: session } = useLocation();
  const navigate = useNavigate();

  const {
    data: materialData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["lecture-session-summary", lecture_session_id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-materials/filter?lecture_session_id=${lecture_session_id}&type=summary`
      );
      return res?.data?.data?.[0] ?? null;
    },
    enabled: !!lecture_session_id,
    staleTime: 1000 * 60 * 5,
  });

  const summary = materialData?.lecture_sessions_material_summary || "";
  const materialId = materialData?.lecture_sessions_material_id;

  const {
    lecture_session_title,
    lecture_session_teacher_name,
    lecture_session_start_time,
    lecture_session_place,
  } = session || {};

  const handleEditClick = () => {
    const base = `/dkm/kajian/kajian-detail/${lecture_session_id}/ringkasan/tambah-edit`;
    const targetUrl = materialId ? `${base}/${materialId}` : base;

    navigate(targetUrl, { state: session });
  };

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
            {/* Informasi Sesi Kajian */}
            <div className="space-y-1 mb-4">
              <h2 className="text-base font-semibold text-sky-600 hover:underline cursor-pointer">
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

            {/* Isi Ringkasan */}
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

            {/* Tombol Tambah/Edit */}
            <div className="mt-6 text-right">
              <button
                onClick={handleEditClick}
                className="px-5 py-2 rounded-lg font-semibold"
                style={{ backgroundColor: theme.primary, color: theme.white1 }}
              >
                {materialId ? "Edit Ringkasan" : "Tambah Ringkasan"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
