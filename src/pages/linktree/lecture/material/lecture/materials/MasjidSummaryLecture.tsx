import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import parse from "html-react-parser";
import cleanTranscriptHTML from "@/constants/cleanTransciptHTML";

// =====================
// Types
// =====================
interface Material {
  lecture_sessions_material_id: string;
  lecture_sessions_material_summary: string;
  lecture_sessions_material_transcript_full: string;
  lecture_sessions_material_created_at: string;
}

interface LectureSession {
  lecture_session_id: string;
  lecture_session_slug: string;
  lecture_session_title: string;
  materials: Material[];
}

// =====================
// Utils
// =====================
const fetchSummariesBySlug = async (lecture_slug: string) => {
  const res = await axios.get(
    `/public/lecture-sessions-materials/filter-by-lecture-slug`,
    { params: { lecture_slug, type: "summary" } }
  );
  return res.data as { data: LectureSession[]; message: string };
};

// Ambil 1–N kalimat sebagai preview (tanpa hooks)
const previewSentences = (html: string, maxSentences = 2) => {
  if (!html) return "";
  const cleaned = cleanTranscriptHTML(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  if (!sentences.length) return "";
  const preview = sentences.slice(0, maxSentences).join(" ").trim();
  return sentences.length > maxSentences ? `${preview} …` : preview;
};

// =====================
// Child: Card
// =====================
function SummaryCard({
  session,
  theme,
  onOpen,
}: {
  session: LectureSession;
  theme: { [k: string]: string };
  onOpen: (s: LectureSession) => void;
}) {
  const summary =
    session.materials?.[0]?.lecture_sessions_material_summary || "";
  const preview = previewSentences(summary, 2);

  return (
    <article
      className="rounded-xl p-4 border shadow-sm transition"
      style={{ borderColor: theme.silver2, backgroundColor: theme.white2 }}
    >
      <h3 className="text-md font-bold mb-2" style={{ color: theme.primary }}>
        {session.lecture_session_title?.trim() || "Tanpa Judul"}
      </h3>

      <div
        className="space-y-3 text-sm leading-relaxed text-justify"
        style={{ color: theme.black1 }}
      >
        {summary ? (
          <>
            <div className="whitespace-pre-wrap">{preview}</div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 rounded-lg text-sm border hover:opacity-90"
                style={{ borderColor: theme.silver2 }}
                onClick={() => onOpen(session)}
              >
                Baca selengkapnya
              </button>
            </div>
          </>
        ) : (
          <p className="italic text-gray-500">
            Belum ada materi ringkasan tersedia.
          </p>
        )}
      </div>
    </article>
  );
}

// =====================
// Child: Modal
// =====================
function SummaryModal({
  open,
  onClose,
  theme,
  session,
}: {
  open: boolean;
  onClose: () => void;
  theme: { [k: string]: string };
  session: LectureSession | null;
}) {
  if (!open || !session) return null;
  const summaryHTML =
    session.materials?.[0]?.lecture_sessions_material_summary || "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* panel */}
      <div
        className="relative w-full sm:max-w-3xl max-h-[85vh] overflow-auto rounded-t-2xl sm:rounded-2xl p-4 m-0 sm:m-4 shadow-lg"
        style={{
          backgroundColor: theme.white2,
          color: theme.black1,
          border: `1px solid ${theme.silver2}`,
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base sm:text-lg font-semibold">
            {session.lecture_session_title || "Ringkasan Kajian"}
          </h2>
          <button
            className="px-3 py-1.5 rounded-lg text-sm border hover:opacity-90"
            style={{ borderColor: theme.silver2 }}
            onClick={onClose}
          >
            Tutup
          </button>
        </div>

        <div className="mt-3 text-sm leading-relaxed text-justify">
          {parse(cleanTranscriptHTML(summaryHTML))}
        </div>
      </div>
    </div>
  );
}

// =====================
// Page
// =====================
export default function MasjidSummaryLecture() {
  const { slug = "", lecture_slug = "" } = useParams();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const location = useLocation();

  // Data utama
  const { data, isLoading } = useQuery<{
    data: LectureSession[];
    message: string;
  }>({
    queryKey: ["lectureSummariesBySlug", lecture_slug],
    queryFn: () => fetchSummariesBySlug(lecture_slug),
    enabled: !!lecture_slug,
    staleTime: 5 * 60 * 1000,
  });

  // Modal state + sinkronisasi dengan ?detail=slug
  const [selected, setSelected] = useState<LectureSession | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const detailSlug = sp.get("detail");
    if (!detailSlug || !data?.data?.length) return;
    const found = data.data.find((s) => s.lecture_session_slug === detailSlug);
    if (found) setSelected(found);
  }, [location.search, data?.data]);

  const openDetail = (session: LectureSession) => {
    setSelected(session);
    const sp = new URLSearchParams(location.search);
    sp.set("detail", session.lecture_session_slug);
    navigate(`${location.pathname}?${sp.toString()}`, { replace: true });
  };

  const closeDetail = () => {
    setSelected(null);
    const sp = new URLSearchParams(location.search);
    sp.delete("detail");
    navigate(`${location.pathname}?${sp.toString()}`, { replace: true });
  };

  return (
    <>
      <PageHeaderUser
        title="Tema Kajian Ringkasan"
        onBackClick={() => navigate(`/masjid/${slug}/tema/${lecture_slug}`)}
      />

      <div className="space-y-4 max-w-3xl mx-auto">
        {isLoading ? (
          <p style={{ color: theme.silver2 }}>Memuat ringkasan kajian...</p>
        ) : data?.data?.length ? (
          data.data.map((s) => (
            <SummaryCard
              key={`${s.lecture_session_slug || "no-slug"}-${s.lecture_session_id || "no-id"}`}
              session={s}
              theme={theme}
              onOpen={openDetail}
            />
          ))
        ) : (
          <p style={{ color: theme.silver2 }}>
            Belum ada sesi kajian yang memiliki ringkasan.
          </p>
        )}
      </div>

      <SummaryModal
        open={!!selected}
        onClose={closeDetail}
        theme={theme}
        session={selected}
      />
    </>
  );
}
