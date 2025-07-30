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
  } = state || {};

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

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
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: theme.white1, color: theme.black1 }}
    >
      <div
        className="max-w-md w-full rounded-xl shadow-lg p-6 text-center"
        style={{ backgroundColor: theme.white2 }}
      >
        <h1 className="text-2xl font-bold mb-4">🎉 Kuis Selesai!</h1>

        <p className="text-lg mb-2">
          ✅ <strong>{correct}</strong> dari <strong>{total}</strong> soal benar
        </p>

        <p className="text-base mb-6">
          ⏱️ Waktu pengerjaan: <strong>{minutes}</strong> menit{" "}
          <strong>{seconds}</strong> detik
        </p>

        <button
          onClick={() => {
            console.log(
              "🔙 Navigasi ke halaman soal:",
              `/masjid/${slug}/soal-materi/${id}`
            );
            navigate(`/masjid/${slug}/soal-materi/${id}`);
          }}
          className="w-full py-3 rounded-lg text-white font-semibold transition-all"
          style={{ backgroundColor: theme.primary }}
        >
          Kembali ke Halaman Soal
        </button>
      </div>
    </div>
  );
}
