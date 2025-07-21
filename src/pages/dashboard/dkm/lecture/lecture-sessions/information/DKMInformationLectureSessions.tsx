import { useLocation, useNavigate } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import FormattedDate from "@/constants/formattedDate"; // ✅ Import komponen

export default function DKMInformationLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const { state: session } = useLocation();

  if (!session) {
    return (
      <p className="text-sm text-red-500">Data sesi kajian tidak tersedia.</p>
    );
  }

  const {
    lecture_session_title,
    lecture_session_description,
    lecture_session_teacher_name,
    lecture_session_start_time,
    lecture_session_place,
    lecture_session_approved_by_dkm_at,
  } = session;

  const navigate = useNavigate();

  return (
    <div
      className="p-5 rounded-2xl shadow-sm space-y-3"
      style={{ backgroundColor: theme.white1, color: theme.black1 }}
    >
      <PageHeader
        title="Informasi Sesi Kajian"
        onBackClick={() => navigate(-1)}
      />

      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium text-gray-500 dark:text-gray-300">
            Judul:
          </span>{" "}
          {lecture_session_title}
        </p>
        <p>
          <span className="font-medium text-gray-500 dark:text-gray-300">
            Ustadz:
          </span>{" "}
          {lecture_session_teacher_name}
        </p>
        <p>
          <span className="font-medium text-gray-500 dark:text-gray-300">
            Jadwal:
          </span>{" "}
          <FormattedDate
            value={lecture_session_start_time}
            fullMonth // ✅ Pakai nama bulan lengkap
          />
        </p>
        <p>
          <span className="font-medium text-gray-500 dark:text-gray-300">
            Lokasi:
          </span>{" "}
          {lecture_session_place}
        </p>
        <p>
          <span className="font-medium text-gray-500 dark:text-gray-300">
            Status Materi:
          </span>{" "}
          {lecture_session_approved_by_dkm_at
            ? "Soal & Materi tersedia"
            : "Dalam proses"}
        </p>
        <div>
          <span className="font-medium text-gray-500 dark:text-gray-300 block mb-1">
            Deskripsi:
          </span>
          <p style={{ color: theme.silver2 }}>
            {lecture_session_description || "Tidak ada deskripsi."}
          </p>
        </div>
      </div>
    </div>
  );
}
