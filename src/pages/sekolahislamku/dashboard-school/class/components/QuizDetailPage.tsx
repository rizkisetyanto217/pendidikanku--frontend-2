// src/pages/sekolahislamku/pages/quiz/QuizDetailPage.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Btn } from "@/pages/sekolahislamku/components/ui/Primitives";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import { ArrowLeft } from "lucide-react";

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
      {
        id: "q2",
        text: "Rumus luas lingkaran adalah?",
        options: ["πr²", "2πr", "πd", "r²"],
        answer: 0,
      },
    ],
  },
  {
    id: "qz-2",
    subjectId: "sbj-1",
    title: "Quiz Geometri",
    status: "closed",
    questions: [],
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

const QuizDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette = pickTheme(themeName as ThemeName, isDark);

  const quiz = DUMMY_QUIZZES.find((q) => q.id === id);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});

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

  const handleAnswer = (qid: string, idx: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
  };

  return (
    <div
      className="h-full w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={`Kerjakan: ${quiz.title}`}
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
            <div className=" md:flex hidden items-center gap-3">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="cursor-pointer" size={20} />
              </Btn>

              <h1 className="font-semibold text-lg">Mulai Quizz</h1>
            </div>
            {quiz.questions.length === 0 ? (
              <div
                className="p-6 border rounded-lg"
                style={{ borderColor: palette.silver1 }}
              >
                <p>Quiz ini belum memiliki soal.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {quiz.questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="p-4 border rounded-lg"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <div className="font-medium mb-3">
                      {i + 1}. {q.text}
                    </div>
                    <div className="space-y-2">
                      {q.options.map((opt, idx) => (
                        <label
                          key={idx}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={q.id}
                            checked={answers[q.id] === idx}
                            onChange={() => handleAnswer(q.id, idx)}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mt-6 flex gap-3">
                  <Btn palette={palette} onClick={() => navigate(-1)}>
                    Batal
                  </Btn>
                  <Btn
                    palette={palette}
                    onClick={() => alert("Jawaban tersimpan!")}
                  >
                    Kumpulkan Jawaban
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizDetailPage;
