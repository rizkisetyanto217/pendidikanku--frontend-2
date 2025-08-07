import { useLocation, useNavigate } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useEffect } from "react";

export default function MasjidResultQuizDetailLectureSessions() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const {
    correct = 0,
    total = 0,
    duration = 0,
    slug = "",
    id = "",
    lecture_session_slug = "", // ✅ gunakan ini
  } = state || {};

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  useEffect(() => {
    console.log("📊 Hasil Quiz Diterima:");
    console.log("✅ Benar:", correct);
    console.log("❓ Total Soal:", total);
    console.log("⏱️ Durasi:", `${minutes} menit ${seconds} detik`);
    console.log("🧭 Slug:", slug);
    console.log("🆔 Session ID:", id);
  }, [correct, total, duration, slug, id]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: theme.white1, color: theme.black1 }}
    >
      <div
        className="max-w-md w-full rounded-xl shadow-lg p-6 text-center space-y-6"
        style={{ backgroundColor: theme.white2 }}
      >
        <div className="space-y-1">
          <h1 className="text-xl font-bold">
            Alhamdulillah Pembelajaran Selesai
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-white/70">
            “ Bersyukurlah atas apa yang kita telah dapatkan “
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <div
            className="rounded-lg px-4 py-3 border text-center flex flex-col items-center w-[100px]"
            style={{ borderColor: theme.silver1 }}
          >
            <span className="text-lg font-bold">{score} %</span>
            <span className="text-xs mt-1 text-gray-500 dark:text-white/70">
              Penilaian
            </span>
          </div>
          <div
            className="rounded-lg px-4 py-3 border text-center flex flex-col items-center w-[100px]"
            style={{ borderColor: theme.silver1 }}
          >
            <span className="text-lg font-bold">{minutes}</span>
            <span className="text-xs mt-1 text-gray-500 dark:text-white/70">
              Waktu
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {/* <button
            onClick={() => alert("Ulasan belum tersedia.")}
            className="w-full py-3 rounded-lg font-semibold"
            style={{
              backgroundColor: theme.white3,
              color: theme.primary,
              border: `1px solid ${theme.primary}`,
            }}
          >
            Ulasan
          </button> */}

          <button
            onClick={() => {
              const targetUrl = `/masjid/${slug}/soal-materi/${lecture_session_slug}`;
              window.location.href = targetUrl;
            }}
            className="w-full py-3 rounded-lg text-white font-semibold"
            style={{ backgroundColor: theme.primary }}
          >
            Lanjut
          </button>
        </div>
      </div>
    </div>
  );
}
