// src/pages/sekolahislamku/pages/quiz/QuizPage.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Btn } from "@/pages/sekolahislamku/components/ui/Primitives";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import { ArrowLeft, Plus, Pencil, Trash } from "lucide-react";

/* Dummy quiz data */
const DUMMY_QUIZZES = [
  {
    id: "qz-1",
    subjectId: "sbj-1",
    title: "Quiz Aljabar Dasar",
    status: "open",
    questions: [
      {
        id: "q1",
        text: "Hasil dari 2x + 3 = 7 adalah?",
        options: ["x = 1", "x = 2", "x = 3", "x = 4"],
        answer: 1,
      },
    ],
  },
];

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette = pickTheme(themeName as ThemeName, isDark);

  const [quizzes, setQuizzes] = useState(DUMMY_QUIZZES);
  const quiz = quizzes.find((q) => q.id === id);

  // Form state untuk add/edit
  const [editingQid, setEditingQid] = useState<string | null>(null);
  const [formQuestion, setFormQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    answer: 0,
  });

  const resetForm = () =>
    setFormQuestion({ text: "", options: ["", "", "", ""], answer: 0 });

  // Tambah soal
  const handleAddQuestion = () => {
    if (!quiz) return;
    const newQuestion = {
      id: "q" + (quiz.questions.length + 1),
      text: formQuestion.text || "Soal baru...",
      options: formQuestion.options.map(
        (opt, i) => opt || `Pilihan ${String.fromCharCode(65 + i)}`
      ),
      answer: formQuestion.answer,
    };
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quiz.id
          ? { ...q, questions: [...q.questions, newQuestion] }
          : q
      )
    );
    resetForm();
  };

  // Edit soal
  const handleEditQuestion = (qid: string) => {
    if (!quiz) return;
    const q = quiz.questions.find((x) => x.id === qid);
    if (q) {
      setFormQuestion({
        text: q.text,
        options: [...q.options],
        answer: q.answer,
      });
      setEditingQid(qid);
    }
  };

  const handleSaveEdit = () => {
    if (!quiz || !editingQid) return;
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quiz.id
          ? {
              ...q,
              questions: q.questions.map((ques) =>
                ques.id === editingQid
                  ? {
                      ...ques,
                      text: formQuestion.text,
                      options: formQuestion.options,
                      answer: formQuestion.answer,
                    }
                  : ques
              ),
            }
          : q
      )
    );
    setEditingQid(null);
    resetForm();
  };

  // Hapus soal
  const handleDeleteQuestion = (qid: string) => {
    if (!quiz) return;
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quiz.id
          ? { ...q, questions: q.questions.filter((ques) => ques.id !== qid) }
          : q
      )
    );
  };

  if (!quiz) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Quiz tidak ditemukan</h1>
        <Btn palette={palette} className="mt-4" onClick={() => navigate(-1)}>
          Kembali
        </Btn>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={`Kelola Quiz`}
        gregorianDate={new Date().toISOString()}
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
            <div className="flex items-center gap-3">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={20} />
              </Btn>
              <h1 className="font-semibold text-lg">{quiz.title}</h1>
            </div>

            {/* Form tambah/edit soal */}
            <div
              className="p-4 border rounded-lg"
              style={{ borderColor: palette.silver1 }}
            >
              <h2 className="font-medium mb-3">
                {editingQid ? "Edit Soal" : "Tambah Soal"}
              </h2>
              <input
                type="text"
                placeholder="Teks soal"
                className="w-full border rounded p-2 mb-3"
                value={formQuestion.text}
                onChange={(e) =>
                  setFormQuestion({ ...formQuestion, text: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-3 mb-3">
                {formQuestion.options.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Opsi ${String.fromCharCode(65 + i)}`}
                    className="w-full border rounded p-2"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...formQuestion.options];
                      newOpts[i] = e.target.value;
                      setFormQuestion({ ...formQuestion, options: newOpts });
                    }}
                  />
                ))}
              </div>
              <div className="mb-3">
                <label className="font-medium mr-2">Jawaban benar:</label>
                <select
                  value={formQuestion.answer}
                  onChange={(e) =>
                    setFormQuestion({
                      ...formQuestion,
                      answer: Number(e.target.value),
                    })
                  }
                  className="border rounded px-2 py-1"
                >
                  <option value={0}>A</option>
                  <option value={1}>B</option>
                  <option value={2}>C</option>
                  <option value={3}>D</option>
                </select>
              </div>
              <div className="flex gap-3">
                {editingQid ? (
                  <Btn palette={palette} onClick={handleSaveEdit}>
                    Simpan Perubahan
                  </Btn>
                ) : (
                  <Btn palette={palette} onClick={handleAddQuestion}>
                    <Plus size={16} className="mr-1" /> Tambah
                  </Btn>
                )}
                <Btn palette={palette} variant="secondary" onClick={resetForm}>
                  Reset
                </Btn>
              </div>
            </div>

            {/* Daftar soal */}
            {quiz.questions.length === 0 ? (
              <div
                className="p-6 border rounded-lg"
                style={{ borderColor: palette.silver1 }}
              >
                <p>Belum ada soal.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {quiz.questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="p-4 border rounded-lg"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-medium">
                        {i + 1}. {q.text}
                      </div>
                      <div className="flex gap-2">
                        <Btn
                          palette={palette}
                     
                          variant="secondary"
                          onClick={() => handleEditQuestion(q.id)}
                        >
                          <Pencil size={14} />
                        </Btn>
                        <Btn
                          palette={palette}
                        
                          variant="destructive"
                          onClick={() => handleDeleteQuestion(q.id)}
                        >
                          <Trash size={14} />
                        </Btn>
                      </div>
                    </div>
                    <div className="space-y-1 ml-4">
                      {q.options.map((opt, idx) => (
                        <div key={idx} className="text-sm">
                          {String.fromCharCode(65 + idx)}.{" "}
                          {idx === q.answer ? (
                            <span className="font-bold text-green-600">
                              {opt} (benar)
                            </span>
                          ) : (
                            opt
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizPage;
