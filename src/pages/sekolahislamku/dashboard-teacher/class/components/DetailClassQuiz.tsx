import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { pickTheme, ThemeName } from "@/constants/thema";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import {
  Btn,
  SectionCard,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash,
  CheckCircle,
  XCircle,
} from "lucide-react";

/* ===== Helpers ===== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

/* ===== Dummy types & data ===== */
type Question = { id: string; text: string; options: string[]; answer: number };
type Quiz = {
  id: string;
  title: string;
  published: boolean;
  createdAt: string;
  questions: Question[];
};

const DUMMY: Record<string, Quiz> = {
  "qz-1": {
    id: "qz-1",
    title: "Quiz Aljabar Dasar",
    published: true,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: "q1",
        text: "Hasil dari 2x + 3 = 7 adalah?",
        options: ["x = 1", "x = 2", "x = 3", "x = 4"],
        answer: 1,
      },
    ],
  },
  "qz-2": {
    id: "qz-2",
    title: "Kuis Tajwid Dasar",
    published: false,
    createdAt: new Date().toISOString(),
    questions: [],
  },
};

/* ===== Page ===== */
const DetailClassQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // :id dari route /:slug/guru/quizClass/:id
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const [quiz, setQuiz] = useState<Quiz>(
    () => DUMMY[id ?? "qz-1"] ?? DUMMY["qz-1"]
  );
  const [editingQid, setEditingQid] = useState<string | null>(null);
  const [form, setForm] = useState<{
    text: string;
    options: string[];
    answer: number;
  }>({
    text: "",
    options: ["", "", "", ""],
    answer: 0,
  });

  const resetForm = () =>
    setForm({ text: "", options: ["", "", "", ""], answer: 0 });

  const headerDateISO = useMemo(() => new Date().toISOString(), []);

  /* ===== Actions ===== */
  const togglePublish = () =>
    setQuiz((q) => ({ ...q, published: !q.published }));

  const addQuestion = () => {
    setQuiz((q) => ({
      ...q,
      questions: [
        ...q.questions,
        {
          id: "q" + (q.questions.length + 1),
          text: form.text || "Soal baru...",
          options: form.options.map(
            (o, i) => o || `Pilihan ${String.fromCharCode(65 + i)}`
          ),
          answer: Number.isInteger(form.answer) ? form.answer : 0,
        },
      ],
    }));
    resetForm();
  };

  const startEdit = (qid: string) => {
    const target = quiz.questions.find((x) => x.id === qid);
    if (!target) return;
    setEditingQid(qid);
    setForm({
      text: target.text,
      options: [...target.options],
      answer: target.answer,
    });
  };

  const saveEdit = () => {
    if (!editingQid) return;
    setQuiz((q) => ({
      ...q,
      questions: q.questions.map((it) =>
        it.id === editingQid
          ? {
              ...it,
              text: form.text || "Soal (tanpa judul)",
              options: form.options.map(
                (o, i) => o || `Pilihan ${String.fromCharCode(65 + i)}`
              ),
              answer: form.answer,
            }
          : it
      ),
    }));
    setEditingQid(null);
    resetForm();
  };

  const deleteQuestion = (qid: string) =>
    setQuiz((q) => ({
      ...q,
      questions: q.questions.filter((x) => x.id !== qid),
    }));

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Quiz"
        gregorianDate={headerDateISO}
        dateFmt={dateLong}
        showBack
      />

      <main className="px-4 md:px-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Header */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 flex items-center gap-3">
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft size={20} />
                </Btn>
                <h1 className="font-semibold text-lg">{quiz.title}</h1>

                <div className="ml-auto flex items-center gap-2">
                  {quiz.published ? (
                    <>
                      <CheckCircle size={18} style={{ color: "#16a34a" }} />
                      <span className="text-sm">Terpublikasi</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={18} style={{ color: "#ef4444" }} />
                      <span className="text-sm">Draft</span>
                    </>
                  )}
                  <Btn
                    palette={palette}
                    size="sm"
                    variant="outline"
                    onClick={togglePublish}
                  >
                    {quiz.published ? "Tarik Publikasi" : "Publikasikan"}
                  </Btn>
                </div>
              </div>
            </SectionCard>

            {/* Form tambah / edit */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5">
                <h2 className="font-medium mb-3">
                  {editingQid ? "Edit Soal" : "Tambah Soal"}
                </h2>

                <input
                  type="text"
                  placeholder="Teks soal"
                  className="w-full border rounded p-2 mb-3"
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {form.options.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Opsi ${String.fromCharCode(65 + i)}`}
                      className="w-full border rounded p-2"
                      value={opt}
                      onChange={(e) => {
                        const copy = [...form.options];
                        copy[i] = e.target.value;
                        setForm({ ...form, options: copy });
                      }}
                    />
                  ))}
                </div>

                <div className="mb-4">
                  <label className="mr-2 font-medium">Jawaban benar:</label>
                  <select
                    className="border rounded px-2 py-1"
                    value={form.answer}
                    onChange={(e) =>
                      setForm({ ...form, answer: Number(e.target.value) })
                    }
                  >
                    <option value={0}>A</option>
                    <option value={1}>B</option>
                    <option value={2}>C</option>
                    <option value={3}>D</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  {editingQid ? (
                    <Btn palette={palette} onClick={saveEdit}>
                      Simpan Perubahan
                    </Btn>
                  ) : (
                    <Btn palette={palette} onClick={addQuestion}>
                      <Plus size={16} className="mr-1" /> Tambah
                    </Btn>
                  )}
                  <Btn
                    palette={palette}
                    variant="secondary"
                    onClick={resetForm}
                  >
                    Reset
                  </Btn>
                </div>
              </div>
            </SectionCard>

            {/* Daftar soal */}
            <div className="space-y-4">
              {quiz.questions.length === 0 ? (
                <SectionCard palette={palette}>
                  <div className="p-6 text-sm opacity-70">Belum ada soal.</div>
                </SectionCard>
              ) : (
                quiz.questions.map((q, idx) => (
                  <SectionCard key={q.id} palette={palette}>
                    <div className="p-4 md:p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="font-medium">
                          {idx + 1}. {q.text}
                        </div>
                        <div className="flex gap-2">
                          <Btn
                            palette={palette}
                            variant="secondary"
                            size="sm"
                            onClick={() => startEdit(q.id)}
                          >
                            <Pencil size={14} />
                          </Btn>
                          <Btn
                            palette={palette}
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteQuestion(q.id)}
                          >
                            <Trash size={14} />
                          </Btn>
                        </div>
                      </div>
                      <div className="ml-4 space-y-1 text-sm">
                        {q.options.map((opt, i) => (
                          <div key={i}>
                            {String.fromCharCode(65 + i)}.{" "}
                            {i === q.answer ? (
                              <strong style={{ color: "#16a34a" }}>
                                {opt} (benar)
                              </strong>
                            ) : (
                              opt
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </SectionCard>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailClassQuiz;
