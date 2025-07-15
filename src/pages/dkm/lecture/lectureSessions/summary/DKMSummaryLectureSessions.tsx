import PageHeader from "@/components/common/PageHeader";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useOutletContext } from "react-router-dom";

export default function DKMSummaryLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const session = useOutletContext<any>(); // Pastikan context dikirim dari parent route
  const {
    lecture_session_title,
    lecture_session_teacher_name,
    lecture_session_start_time,
    lecture_session_place,
  } = session || {};

  const formattedTime = new Date(lecture_session_start_time).toLocaleString(
    "id-ID",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Ringkasan" onBackClick={() => history.back()} />

      <div
        className="p-6 rounded-2xl shadow-sm"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        <div className="space-y-1 mb-4">
          <h2 className="text-base font-semibold text-sky-600 hover:underline cursor-pointer">
            {lecture_session_title}
          </h2>
          <p className="text-sm text-gray-500">
            {formattedTime} / {lecture_session_place}
          </p>
          <p className="text-sm font-semibold" style={{ color: theme.primary }}>
            {lecture_session_teacher_name}
          </p>
        </div>

        <div
          className="space-y-4 text-sm leading-relaxed text-justify"
          style={{ color: theme.black1 }}
        >
          <p>
            Ringkasan materi kajian akan ditampilkan di sini. Biasanya berupa
            poin-poin inti dari pembahasan kajian, disusun secara singkat namun
            jelas.
          </p>
          <p>
            Kamu bisa mengisi konten ini dari API `lecture_sessions_summary`
            jika tersedia, atau dari field yang sama dengan materi lengkap tapi
            dipotong (summary-only).
          </p>
        </div>

        <div className="mt-6 text-right">
          <button
            className="px-5 py-2 rounded-lg font-semibold"
            style={{ backgroundColor: theme.primary, color: theme.white1 }}
          >
            Edit Ringkasan
          </button>
        </div>
      </div>
    </div>
  );
}
