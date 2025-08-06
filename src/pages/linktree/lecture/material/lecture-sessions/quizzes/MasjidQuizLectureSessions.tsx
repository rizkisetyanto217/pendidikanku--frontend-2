import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

interface LectureQuizQuestion {
  lecture_sessions_question_id: string;
  lecture_sessions_question: string;
  lecture_sessions_question_answers: string[];
  lecture_sessions_question_correct: string;
  lecture_sessions_question_explanation: string;
}

export default function MasjidQuizLectureSessions() {
  // const { id, slug } = useParams();
  const { lecture_session_slug, slug } = useParams();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const startTimeRef = useRef<number>(Date.now());

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [progressCount, setProgressCount] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<LectureQuizQuestion[]>(
    []
  );
  const [isFinishing, setIsFinishing] = useState(false);

  // ✅ Ambil quiz berdasarkan slug sesi kajian
  const { data, isLoading } = useQuery({
    queryKey: ["quiz", lecture_session_slug],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-quiz/${lecture_session_slug}/with-questions-by-slug`
      );
      console.log("📦 Quiz Fetched:", res.data.data);
      return res.data.data;
    },
    enabled: !!lecture_session_slug,
    staleTime: 5 * 60 * 1000,
  });

  const questions = isRetrying ? wrongQuestions : data?.questions || [];
  const question = questions[index] || null;

  const submitQuizResult = async (grade: number, duration: number) => {
    if (!data?.quiz) return;
    const payload = {
      user_lecture_sessions_quiz_grade_result: grade,
      user_lecture_sessions_quiz_duration_seconds: duration,
      user_lecture_sessions_quiz_quiz_id: data.quiz.lecture_sessions_quiz_id,
      user_lecture_sessions_quiz_lecture_session_id:
        data.quiz.lecture_sessions_quiz_lecture_session_id,
    };
    console.log("📤 Submit Quiz Result", payload);
    try {
      const res = await axios.post(
        `/public/user-lecture-sessions-quiz/${lecture_session_slug}`,
        payload
      );
      console.log("✅ Quiz result submitted:", res.data);
    } catch (error: any) {
      console.error("❌ Failed to submit quiz result:", error);
    }
  };

  // ✅ Saat semua soal salah selesai dijawab ulang
  useEffect(() => {
    if (isRetrying && wrongQuestions.length === 0) {
      const endTime = Date.now();
      const durationSec = Math.floor((endTime - startTimeRef.current) / 1000);
      navigate(
        `/masjid/${slug}/soal-materi/${lecture_session_slug}/latihan-soal/hasil`,
        {
          state: {
            correct: progressCount,
            total: data?.questions?.length || 1,
            duration: durationSec,
            slug,
            lecture_session_slug,
          },
        }
      );
    }
  }, [isRetrying, wrongQuestions.length]);

  const handleCheck = () => {
    if (!selected || !question) return;
    const correct = question.lecture_sessions_question_correct.toUpperCase();
    const selectedLetter = selected.trim().charAt(0).toUpperCase();
    const isRight = selectedLetter === correct;
    setIsCorrect(isRight);
    setShowAnswer(true);

    if (!isRight) {
      setWrongQuestions((prev) => {
        if (
          prev.some(
            (q) =>
              q.lecture_sessions_question_id ===
              question.lecture_sessions_question_id
          )
        )
          return prev;
        return [...prev, question];
      });
    } else {
      if (!isRetrying) {
        setProgressCount((prev) => prev + 1);
      } else {
        setWrongQuestions((prev) =>
          prev.filter(
            (q) =>
              q.lecture_sessions_question_id !==
              question.lecture_sessions_question_id
          )
        );
      }
    }
  };

  const handleNext = async () => {
    setShowAnswer(false);
    setSelected(null);

    const isLast = index + 1 === questions.length;
    const hasWrong = wrongQuestions.length > 0;

    if (!isLast) return setIndex(index + 1);
    if (!isRetrying && hasWrong) return (setIndex(0), setIsRetrying(true));
    if (isRetrying && hasWrong) return setIndex(0);

    const endTime = Date.now();
    const durationSec = Math.floor((endTime - startTimeRef.current) / 1000);
    const finalScore = progressCount;
    setIsFinishing(true);

    await submitQuizResult(finalScore, durationSec);

    setTimeout(() => {
      navigate(
        `/masjid/${slug}/soal-materi/${lecture_session_slug}/latihan-soal/hasil`,
        {
          state: {
            correct: finalScore,
            total: data?.questions?.length || 1,
            duration: durationSec,
            slug,
            lecture_session_slug,
          },
        }
      );
    }, 1000);
  };

  if (isLoading) return <div className="p-4">Memuat soal...</div>;
  if (!data || !question)
    return (
      <div className="pb-28">
        <PageHeaderUser title="Latihan Soal" onBackClick={() => navigate(-1)} />
        <div className="mt-4 text-sm text-center text-gray-500 dark:text-white/70">
          Belum ada soal tersedia untuk sesi ini. sekarang
        </div>
      </div>
    );
  if (isFinishing)
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-sm text-gray-500 dark:text-white/70">
        <div className="animate-spin w-8 h-8 border-4 border-t-transparent border-gray-400 rounded-full mb-4" />
        Menyiapkan hasil...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeaderUser
        title={data.quiz?.lecture_sessions_quiz_title || "Latihan Soal disini"}
        onBackClick={() => navigate(-1)}
      />

      <div
        className="p-4 rounded-lg shadow-sm"
        style={{ backgroundColor: theme.white1, borderColor: theme.silver1 }}
      >
        <div className="relative h-2 rounded-full bg-gray-200 dark:bg-white/10 mb-6 mt-2">
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
            style={{
              width: `${(progressCount / (data?.questions?.length || 1)) * 100}%`,
              backgroundColor: theme.primary,
            }}
          />
        </div>

        <p className="text-sm font-medium mb-4" style={{ color: theme.black1 }}>
          {question.lecture_sessions_question}
        </p>

        <div className="space-y-3 mb-6">
          {question.lecture_sessions_question_answers.map((opt: string) => {
            const isSel = selected === opt;
            const isUserAnswerCorrect = selected?.startsWith(
              question.lecture_sessions_question_correct
            );
            const isRight = showAnswer && isUserAnswerCorrect && isSel;
            const isWrong = showAnswer && !isUserAnswerCorrect && isSel;

            return (
              <button
                key={opt}
                onClick={() => setSelected(opt)}
                disabled={showAnswer}
                className={clsx(
                  "w-full px-4 py-3 rounded-lg text-sm text-left border transition-all font-medium",
                  isSel && !showAnswer ? "text-white" : ""
                )}
                style={{
                  backgroundColor: showAnswer
                    ? isRight
                      ? theme.success2
                      : isWrong
                        ? theme.error2
                        : theme.white3
                    : isSel
                      ? theme.primary
                      : theme.white3,
                  color: showAnswer
                    ? theme.black1
                    : isSel
                      ? theme.white1
                      : theme.black1,
                  borderColor: showAnswer
                    ? isRight
                      ? theme.success1
                      : isWrong
                        ? theme.error1
                        : theme.silver1
                    : isSel
                      ? theme.primary
                      : theme.silver1,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {showAnswer && isCorrect && (
          <div
            className="text-sm mb-4 p-3 rounded"
            style={{ backgroundColor: theme.success2, color: theme.success1 }}
          >
            <strong>✅ Jawaban Benar</strong>
            <br />
            {question.lecture_sessions_question_explanation}
          </div>
        )}

        <button
          className="w-full py-3 mt-3 rounded-lg text-sm font-semibold transition-all"
          style={{
            backgroundColor:
              selected || showAnswer ? theme.primary : theme.silver2,
            color: theme.white1,
          }}
          onClick={showAnswer ? handleNext : handleCheck}
          disabled={!selected && !showAnswer}
        >
          {showAnswer ? "Lanjut" : "Cek"}
        </button>
      </div>
    </div>
  );
}
