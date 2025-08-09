import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import parse from "html-react-parser";
import cleanTranscriptHTML from "@/constants/cleanTransciptHTML";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

type LocationState = {
  from?: string;
  slug?: string;
  lecture_slug?: string;
  sessionSlug?: string;
  sessionTitle?: string;
  summaryHTML?: string;
};

export default function MasjidDetailSummaryLecture() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark
    ? { white1: "#141414", black1: "#e6e6e6" }
    : { white1: "#fff", black1: "#111" };

  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const title = (state.sessionTitle || "Ringkasan Kajian").trim();
  const fullSummaryHTML = state.summaryHTML || "";

  const goBackToList = () => {
    if (state.slug && state.lecture_slug) {
      navigate(`/masjid/${state.slug}/tema/${state.lecture_slug}/ringkasan`);
    } else {
      navigate(-1);
    }
  };

  // ⬇️ Redirect otomatis kalau dibuka tanpa state
  useEffect(() => {
    if (!fullSummaryHTML) {
      // biar UX mulus, bisa ditunda 0ms/next tick kalau mau
      // setTimeout(() => goBackToList(), 0);
    }
  }, [fullSummaryHTML]);

  const handleBack = () => {
    if (state.from) return navigate(-1);
    goBackToList();
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <PageHeaderUser title={title} onBackClick={handleBack} />

      {!fullSummaryHTML ? (
        <div
          className="mt-4 rounded-2xl p-4 shadow-sm"
          style={{ backgroundColor: theme.white1, color: theme.black1 }}
        >
          <p className="text-sm italic text-gray-500">
            Data ringkasan tidak tersedia. Silakan kembali ke daftar ringkasan
            dan pilih card lagi.
          </p>
          <button
            className="mt-3 px-4 py-2 rounded-lg text-sm"
            style={{ backgroundColor: theme.black1, color: theme.white1 }}
            onClick={goBackToList}
          >
            Ke daftar ringkasan
          </button>
        </div>
      ) : (
        <div
          className="mt-4 rounded-2xl p-4 shadow-sm"
          style={{ backgroundColor: theme.white1, color: theme.black1 }}
        >
          <div className="space-y-4 text-sm leading-relaxed text-justify">
            <div className="whitespace-pre-wrap text-sm text-justify leading-relaxed">
              {parse(cleanTranscriptHTML(fullSummaryHTML))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
