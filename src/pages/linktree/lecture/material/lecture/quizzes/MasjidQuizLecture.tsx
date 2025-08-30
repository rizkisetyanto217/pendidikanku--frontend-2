import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import axios from "@/lib/axios";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import FormattedDate from "@/constants/formattedDate";
import { Award, Clock, Repeat2, Play } from "lucide-react";

type Row = {
  lecture_session_id: string;
  lecture_session_slug: string;
  lecture_session_title: string;
  lecture_session_start_time: string | null;

  lecture_sessions_quiz_id?: string | null;
  lecture_sessions_quiz_title?: string | null;
  lecture_sessions_quiz_description?: string | null;

  user_quiz_grade_result?: number | null;
  user_quiz_attempt_count?: number | null;
  user_quiz_duration_seconds?: number | null;
};

export default function MasjidQuizLecture() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const { slug = "", lecture_slug = "" } = useParams();
  const { data: currentUser } = useCurrentUser();

  const { data, isLoading, isError } = useQuery<{ data: Row[] }>({
    queryKey: ["lecture-quiz-by-lecture-slug", lecture_slug, currentUser?.id],
    queryFn: async () => {
      const headers = currentUser?.id ? { "X-User-Id": currentUser.id } : {};
      const res = await axios.get(
        `/public/lecture-sessions-quiz/by-lecture-slug/${lecture_slug}`,
        { headers, params: { only_with_quiz: true } }
      );
      return res.data;
    },
    enabled: !!lecture_slug,
    staleTime: 5 * 60 * 1000,
  });

  const rows = data?.data ?? [];

  // Bagi dua: belum dikerjakan vs sudah dikerjakan (berdasar user_quiz_grade_result)
  const { todo, done } = useMemo(() => {
    const todoList: Row[] = [];
    const doneList: Row[] = [];
    for (const r of rows) {
      (r.user_quiz_grade_result == null ? todoList : doneList).push(r);
    }
    return { todo: todoList, done: doneList };
  }, [rows]);

  const goBack = () => navigate(`/masjid/${slug}/tema/${lecture_slug}`);

  // jadi begini (pakai halaman yang sama + type + backTo):
  const handleOpenQuiz = (r: Row, type: "quiz" | "exam" = "quiz") => {
    // contoh di Card tombol "Mulai Quiz" dari tema
    navigate(
      `/masjid/${slug}/soal-materi/${r.lecture_session_slug}/latihan-soal`,
      {
        state: {
          backTo: `/masjid/${slug}/tema/${lecture_slug}`, // <- balik ke tema
        },
      }
    );
  };

  // helper kecil
  const formatDuration = (sec?: number | null) => {
    if (!sec || sec <= 0) return "-";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  // ==== Card baru, drop-in replacement ====
  const Card = ({ r }: { r: Row }) => {
    const grade = r.user_quiz_grade_result;
    const attempts = r.user_quiz_attempt_count ?? 0;
    const durText = formatDuration(r.user_quiz_duration_seconds);
    const hasQuiz = !!r.lecture_sessions_quiz_id;

    const isDone = grade != null;
    const ctaLabel = isDone ? "Lihat / Ulangi" : "Mulai Quiz";
    const ctaIcon = isDone ? <Repeat2 size={16} /> : <Play size={16} />;

    const progressPct = Math.max(0, Math.min(100, Number(grade ?? 0)));

    return (
      <div
        className="group p-4 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-default"
        style={{
          background: theme.white1,
          borderColor: theme.silver2,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="font-semibold truncate"
                style={{ color: theme.black1 }}
                title={r.lecture_session_title}
              >
                {r.lecture_session_title}
              </h3>

              {/* Status pill */}
              <span
                className="text-[10px] px-2 py-0.5 rounded-full border"
                style={{
                  background: isDone ? theme.success1 : theme.warning1,
                  color: theme.white1,
                  borderColor: isDone ? theme.success1 : theme.warning1,
                }}
              >
                {isDone ? "Selesai" : "Belum"}
              </span>
            </div>

            <p
              className="text-xs mt-1 flex items-center gap-1"
              style={{ color: theme.silver2 }}
            >
              <Clock size={14} />
              {r.lecture_session_start_time ? (
                <FormattedDate value={r.lecture_session_start_time} />
              ) : (
                "-"
              )}
            </p>
          </div>

          {/* Nilai badge besar */}
          {/* <div className="flex flex-col items-end">
            <div
              className="px-2 py-1 rounded-lg text-xs font-semibold border"
              style={{
                color: isDone ? theme.success2 : theme.silver2,
                borderColor: isDone ? theme.success2 : theme.silver2,
                background: isDone ? theme.white2 : theme.white3,
              }}
              title={isDone ? "Nilai Anda" : "Belum ada nilai"}
            >
              <span className="inline-flex items-center gap-1">
                <Award size={14} />
                {isDone ? `${progressPct}` : "-"}
              </span>
            </div>
          </div> */}
        </div>

        {/* Quiz title + desc */}
        <div className="mt-3">
          <p className="text-sm font-medium" style={{ color: theme.black2 }}>
            {r.lecture_sessions_quiz_title || "Latihan Soal"}
          </p>
          {!!r.lecture_sessions_quiz_description && (
            <p
              className="text-xs mt-0.5 line-clamp-2"
              style={{ color: theme.silver2 }}
            >
              {r.lecture_sessions_quiz_description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div
          className="mt-3 grid grid-cols-3 gap-2 text-xs"
          style={{ color: theme.black2 }}
        >
          <div
            className="rounded-lg px-2 py-1 border"
            style={{ borderColor: theme.silver2 }}
          >
            <div className="opacity-70">Nilai</div>
            <div className="font-semibold">{isDone ? grade : "-"}</div>
          </div>
          <div
            className="rounded-lg px-2 py-1 border"
            style={{ borderColor: theme.silver2 }}
          >
            <div className="opacity-70">Kali Coba</div>
            <div className="font-semibold">{attempts}</div>
          </div>
          <div
            className="rounded-lg px-2 py-1 border"
            style={{ borderColor: theme.silver2 }}
          >
            <div className="opacity-70">Durasi</div>
            <div className="font-semibold">{durText}</div>
          </div>
        </div>

        {/* Progress bar (muncul saat ada nilai) */}
        {isDone && (
          <div className="mt-3">
            <div
              className="h-2 w-full rounded-full"
              style={{ background: theme.white3 }}
            >
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${progressPct}%`,
                  background: theme.success1,
                }}
              />
            </div>
            <div className="mt-1 text-[10px]" style={{ color: theme.silver2 }}>
              Progres nilai {progressPct}%
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-4 flex justify-end">
          <button
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border font-medium
                     hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              borderColor: theme.silver2,
              color: theme.black1,
              background: theme.white2,
            }}
            onClick={() => handleOpenQuiz(r)}
            disabled={!hasQuiz}
            title={!hasQuiz ? "Quiz belum tersedia" : ""}
          >
            {ctaIcon}
            {ctaLabel}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <PageHeaderUser title="Latihan Soal Kajian" onBackClick={goBack} />

      {isLoading ? (
        <p style={{ color: theme.silver2 }}>Memuat daftar quiz…</p>
      ) : isError ? (
        <p className="text-red-500">Gagal memuat data.</p>
      ) : !rows.length ? (
        <p style={{ color: theme.silver2 }}>Belum ada quiz untuk tema ini.</p>
      ) : (
        <div className="space-y-8">
          {/* Belum dikerjakan */}
          {!!todo.length && (
            <section>
              <h4
                className="text-sm font-semibold mb-2"
                style={{ color: theme.black1 }}
              >
                Belum dikerjakan
              </h4>
              <div className="space-y-3">
                {todo.map((r) => (
                  <Card key={r.lecture_session_id} r={r} />
                ))}
              </div>
            </section>
          )}

          {/* Selesai */}
          {!!done.length && (
            <section>
              <h4
                className="text-sm font-semibold mb-2"
                style={{ color: theme.black1 }}
              >
                Sudah dikerjakan
              </h4>
              <div className="space-y-3">
                {done.map((r) => (
                  <Card key={r.lecture_session_id} r={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
