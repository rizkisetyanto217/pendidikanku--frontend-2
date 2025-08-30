import { useLocation, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import axiosInstance from "@/lib/axios";
import axios from "axios";

export default function MasjidResultExamLecture() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const {
    correct = 0,
    total = 0,
    duration = 0,
    slug = "",
    id = "",
    exam_id = "",
  } = state || {};

  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const score = Math.round((correct / total) * 100);
  const shouldAskName =
    score >= 70 && !localStorage.getItem("user_id") && !hasSubmitted;

  const submitExamResult = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const payload = {
      user_lecture_exam_grade_result: score,
      user_lecture_exam_exam_id: exam_id,
      user_lecture_exam_masjid_id: slug,
      user_lecture_exam_user_name: trimmedName,
    };

    console.log("📤 Submitting exam result to backend...");
    console.log("📦 Payload:", payload);

    try {
      setIsSubmitting(true);

      const res = await axiosInstance.post(
        "/public/user-lecture-exams",
        payload
      );
      console.log("✅ Submission success:", res.data);

      const userExamId = res.data.user_lecture_exam_id;
      setHasSubmitted(true);

      console.log("🎯 Navigating to certificate page...");
      navigate(
        `/masjid/${slug}/tema/${id}/certificate/${res.data.user_lecture_exam_id}`
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Axios submission error");
        console.error("🔺 Status:", error.response?.status);
        console.error("🔺 Response:", error.response?.data);
      } else {
        console.error("❌ Unknown submission error", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [name, score, id, slug, exam_id, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: theme.white1, color: theme.black1 }}
    >
      <div
        className="max-w-md w-full rounded-xl shadow-lg p-6 text-center"
        style={{ backgroundColor: theme.white2 }}
      >
        <h1 className="text-2xl font-bold mb-4">🎉 Ujian Selesai!</h1>

        <p className="text-lg mb-2">
          ✅ <strong>{correct}</strong> dari <strong>{total}</strong> soal benar
        </p>

        <p className="text-base mb-6">
          ⏱️ Waktu pengerjaan: <strong>{minutes}</strong> menit{" "}
          <strong>{seconds}</strong> detik
        </p>

        {shouldAskName ? (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan Nama Anda"
              className="w-full px-4 py-2 mb-3 rounded border text-sm"
              style={{
                backgroundColor: theme.white1,
                borderColor: theme.silver1,
                color: theme.black1,
              }}
            />
            <button
              onClick={submitExamResult}
              disabled={!name.trim() || isSubmitting}
              className="w-full py-2 rounded font-semibold text-white"
              style={{
                backgroundColor: name.trim() ? theme.primary : theme.silver2,
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "Menyimpan..." : "Lihat Sertifikat"}
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate(`/masjid/${slug}/soal-materi/${id}`)}
            className="w-full py-3 mt-4 rounded-lg text-white font-semibold transition-all"
            style={{ backgroundColor: theme.primary }}
          >
            Kembali ke Halaman Soal
          </button>
        )}
      </div>
    </div>
  );
}
