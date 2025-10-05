// src/pages/sekolahislamku/pages/student/StudentQuizPage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { pickTheme } from "@/constants/thema";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import {
  ArrowLeft,
  ClipboardList,
  Clock,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/* ===== Utils ===== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/* ===== Meta kelas (untuk judul) ===== */
const CLASS_META: Record<
  string,
  { name: string; room?: string; homeroom?: string }
> = {
  "tpa-a": { name: "TPA A", room: "Aula 1", homeroom: "Ustadz Abdullah" },
  "tpa-b": { name: "TPA B", room: "R. Tahfiz", homeroom: "Ustadz Salman" },
};

/* ===== Bank kuis per kelas (sesuaikan konten materi) ===== */
type Q = { id: string; text: string; options: string[]; answer: number };
type QuizDef = {
  id: string;
  title: string;
  description?: string;
  durationMin: number;
  questions: Q[];
  dueAt?: string;
};

const mkDue = (d: number) => new Date(Date.now() + d * 864e5).toISOString();

const QUIZ_BANK: Record<string, QuizDef[]> = {
  "tpa-a": [
    {
      id: "q-001",
      title: "Kuis Tajwid Dasar",
      description: "Mad thabi'i, panjang bacaan, dan contoh.",
      durationMin: 10,
      dueAt: mkDue(1),
      questions: [
        {
          id: "q1",
          text: "Apa itu mad thabi'i?",
          options: [
            "Panjaran suara karena sukun asli",
            "Mad asli yang terjadi karena huruf mad tanpa hamzah/sukun setelahnya",
            "Mad karena bertemu hamzah pada kata yang sama",
            "Mad karena waqaf pada akhir kalimat",
          ],
          answer: 1,
        },
        {
          id: "q2",
          text: "Berapa harakat umum bacaan mad thabi'i?",
          options: ["1–2 harakat", "2 harakat", "4–5 harakat", "6 harakat"],
          answer: 1,
        },
        {
          id: "q3",
          text: "Contoh mad thabi'i yang benar adalah…",
          options: ["قِيلَ", "قَالَ", "جَاءَ", "ضَالِّينَ"],
          answer: 1,
        },
      ],
    },
    {
      id: "q-002",
      title: "Makharijul Huruf",
      description: "Tempat keluarnya beberapa huruf hijaiyah.",
      durationMin: 12,
      dueAt: mkDue(3),
      questions: [
        {
          id: "q1",
          text: "Makharij huruf ق (qaf) berasal dari…",
          options: ["Ujung lidah", "Tengah lidah", "Pangkal lidah", "Bibir"],
          answer: 2,
        },
        {
          id: "q2",
          text: "Huruf ب (ba) keluar dari…",
          options: [
            "Hidung",
            "Pertemuan dua bibir",
            "Ujung lidah dan gusi atas",
            "Tenggorokan bagian atas",
          ],
          answer: 1,
        },
        {
          id: "q3",
          text: "Huruf ض (dhad) keluar dari…",
          options: [
            "Sisi lidah dan gigi geraham atas",
            "Ujung lidah dan gusi atas",
            "Pangkal lidah",
            "Pertemuan dua bibir",
          ],
          answer: 0,
        },
      ],
    },
  ],
  "tpa-b": [
    {
      id: "q-101",
      title: "Hafalan Juz 30 — Pekan Ini",
      description: "Surah An-Naba' (ayat 1–10).",
      durationMin: 8,
      dueAt: mkDue(2),
      questions: [
        {
          id: "q1",
          text: "Kata pertama Surah An-Naba' adalah…",
          options: ["عَن", "مَا", "يَتَسَاءَلُونَ", "النَّبَإِ"],
          answer: 0,
        },
        {
          id: "q2",
          text: "Arti umum dari 'النَّبَإِ الْعَظِيمِ' adalah…",
          options: [
            "Berita yang agung",
            "Azab yang pedih",
            "Nikmat yang besar",
            "Hari yang berat",
          ],
          answer: 0,
        },
        {
          id: "q3",
          text: "Ayat 9 menyebutkan tidur sebagai…",
          options: ["Perhiasan", "Penutup", "Istirahat", "Peringatan"],
          answer: 2,
        },
      ],
    },
  ],
};

/* ===== Komponen ===== */
const StudentQuizPage: React.FC = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName, isDark);

  const classMeta = CLASS_META[id ?? ""] ?? { name: id ?? "-" };

  // daftar kuis utk kelas
  const quizzes = QUIZ_BANK[id ?? ""] ?? [];

  // state pengerjaan
  const [activeQid, setActiveQid] = useState<string | null>(null);
  const activeQuiz = useMemo(
    () => quizzes.find((q) => q.id === activeQid) || null,
    [activeQid, quizzes]
  );
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [results, setResults] = useState<
    Record<
      string,
      { score: number; correct: number; total: number; submittedAt: string }
    >
  >({});

  const startQuiz = (qid: string) => {
    const q = quizzes.find((x) => x.id === qid);
    if (!q) return;
    setActiveQid(qid);
    setIdx(0);
    setAnswers(Array(q.questions.length).fill(-1));
  };

  const pick = (i: number) => {
    if (!activeQuiz) return;
    const copy = [...answers];
    copy[idx] = i;
    setAnswers(copy);
  };

  const prev = () => setIdx((v) => Math.max(0, v - 1));
  const next = () =>
    setIdx((v) => Math.min((activeQuiz?.questions.length ?? 1) - 1, v + 1));

  const submit = async () => {
    if (!activeQuiz) return;
    const empty = answers.findIndex((a) => a < 0);
    if (empty !== -1) {
      const ok = await Swal.fire({
        title: "Masih ada yang kosong",
        text: "Yakin kirim sekarang?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, kirim",
        cancelButtonText: "Cek lagi",
        background: palette.white1,
        color: palette.black1,
        confirmButtonColor: palette.primary,
      });
      if (!ok.isConfirmed) return;
    }

    const total = activeQuiz.questions.length;
    let correct = 0;
    activeQuiz.questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    const score = Math.round((correct / total) * 100);

    setResults((prev) => ({
      ...prev,
      [activeQuiz.id]: {
        score,
        correct,
        total,
        submittedAt: new Date().toISOString(),
      },
    }));
    setActiveQid(null);

    await Swal.fire({
      title: "Terkirim!",
      html: `<p>Skor: <b>${score}</b> (${correct}/${total} benar)</p>`,
      icon: "success",
      background: palette.white1,
      color: palette.black1,
      confirmButtonColor: palette.primary,
    });
  };

  const resetAttempt = async (qid: string) => {
    const ok = await Swal.fire({
      title: "Ulangi kuis ini?",
      text: "Jawaban sebelumnya akan dihapus.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ulangi",
      cancelButtonText: "Batal",
      background: palette.white1,
      color: palette.black1,
      confirmButtonColor: palette.primary,
    });
    if (!ok.isConfirmed) return;
    setResults((prev) => {
      const cp = { ...prev };
      delete cp[qid];
      return cp;
    });
    startQuiz(qid);
  };

  const goBackToMyClass = () =>
    navigate(`/${slug}/murid/menu-utama/my-class`, { replace: false });

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={`Kuis — ${classMeta.name}`}
        gregorianDate={new Date().toISOString()}
        dateFmt={dateLong}
        showBack
      />

      <main className="w-full px-4 md:px-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Content */}
          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Back inline */}
            <div className="md:flex hidden gap-3 items-center">
              <Btn palette={palette} variant="ghost" onClick={goBackToMyClass}>
                <ArrowLeft size={20} />
              </Btn>
              <h1 className="textlg font-semibold">Daftar Kuis</h1>
            </div>

            {/* List kuis */}
            <div className="grid gap-3">
              {quizzes.length === 0 ? (
                <SectionCard palette={palette}>
                  <div
                    className="p-6 text-sm text-center"
                    style={{ color: palette.silver2 }}
                  >
                    Belum ada kuis untuk kelas ini.
                  </div>
                </SectionCard>
              ) : (
                quizzes.map((qz) => {
                  const res = results[qz.id];
                  return (
                    <SectionCard key={qz.id} palette={palette} className="p-0">
                      <div className="p-4 md:p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div
                                className="text-base md:text-lg font-semibold"
                                style={{ color: palette.black2 }}
                              >
                                {qz.title}
                              </div>
                              <Badge
                                palette={palette}
                                variant={res ? "success" : "outline"}
                                className="h-6"
                              >
                                {res ? "Selesai" : "Belum dikerjakan"}
                              </Badge>
                            </div>

                            {qz.description && (
                              <p
                                className="text-sm mt-1"
                                style={{ color: palette.black2 }}
                              >
                                {qz.description}
                              </p>
                            )}

                            <div
                              className="mt-2 flex flex-wrap items-center gap-3 text-sm"
                              style={{ color: palette.black2 }}
                            >
                              <ClipboardList size={14} />
                              <span>{qz.questions.length} soal</span>
                              <span>•</span>
                              <Clock size={14} />
                              <span>{qz.durationMin} menit</span>
                              {qz.dueAt && (
                                <>
                                  <span>•</span>
                                  <span>Deadline: {dateLong(qz.dueAt)}</span>
                                </>
                              )}
                              {res && (
                                <>
                                  <span>•</span>
                                  <CheckCircle2 size={14} />
                                  <span>
                                    Skor: <b>{res.score}</b> ({res.correct}/
                                    {res.total})
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="px-4 md:px-5 pb-4 md:pb-5 pt-3 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        style={{ borderColor: palette.silver1 }}
                      >
                        <div
                          className="text-sm"
                          style={{ color: palette.black2 }}
                        >
                          Aksi
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {!res && (
                            <Btn
                              palette={palette}
                              size="sm"
                              onClick={() => startQuiz(qz.id)}
                            >
                              <Play size={16} className="mr-1" />
                              Mulai
                            </Btn>
                          )}

                          {res && (
                            <Btn
                              palette={palette}
                              size="sm"
                              variant="secondary"
                              onClick={() => resetAttempt(qz.id)}
                            >
                              <RotateCcw size={16} className="mr-1" />
                              Ulangi
                            </Btn>
                          )}
                        </div>
                      </div>
                    </SectionCard>
                  );
                })
              )}
            </div>

            {/* Runner kuis */}
            {activeQuiz && (
              <SectionCard palette={palette}>
                <div className="p-4 md:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{activeQuiz.title}</div>
                    <div
                      className="text-sm flex items-center gap-2"
                      style={{ color: palette.black2 }}
                    >
                      <Clock size={14} />
                      <span>Estimasi {activeQuiz.durationMin} menit</span>
                    </div>
                  </div>

                  <div className="text-sm" style={{ color: palette.black2 }}>
                    Soal {idx + 1} / {activeQuiz.questions.length}
                  </div>

                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white1,
                    }}
                  >
                    <div
                      className="font-medium mb-3"
                      style={{ color: palette.black2 }}
                    >
                      {activeQuiz.questions[idx].text}
                    </div>

                    <div className="grid gap-2">
                      {activeQuiz.questions[idx].options.map((opt, i) => {
                        const selected = answers[idx] === i;
                        return (
                          <button
                            key={i}
                            onClick={() => pick(i)}
                            className={`text-left px-3 py-2 rounded-lg border ${selected ? "ring-1" : ""}`}
                            style={{
                              borderColor: palette.silver1,
                              background: selected
                                ? palette.white2
                                : palette.white1,
                              color: palette.black1,
                            }}
                          >
                            <span className="mr-2 font-mono">
                              {String.fromCharCode(65 + i)}.
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm" style={{ color: palette.black2 }}>
                      {answers[idx] >= 0
                        ? "Jawaban dipilih."
                        : "Belum memilih jawaban."}
                    </div>
                    <div className="flex gap-2">
                      <Btn
                        palette={palette}
                        variant="secondary"
                        onClick={prev}
                        disabled={idx === 0}
                      >
                        <ChevronLeft size={16} className="mr-1" />
                        Sebelumnya
                      </Btn>
                      {idx < activeQuiz.questions.length - 1 ? (
                        <Btn palette={palette} onClick={next}>
                          Selanjutnya{" "}
                          <ChevronRight size={16} className="ml-1" />
                        </Btn>
                      ) : (
                        <Btn palette={palette} onClick={submit}>
                          <Pause size={16} className="mr-1" />
                          Kirim Jawaban
                        </Btn>
                      )}
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Back (mobile) */}
            <div className="md:hidden">
              <Btn
                palette={palette}
                variant="outline"
                onClick={goBackToMyClass}
              >
                <ArrowLeft size={16} className="mr-1" /> Kembali ke Kelas
              </Btn>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentQuizPage;
