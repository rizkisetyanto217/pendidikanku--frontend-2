import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import CommonActionButton from "@/components/common/main/CommonActionButton";

interface APIQuestion {
  lecture_sessions_question_id: string;
  lecture_sessions_question: string;
  lecture_sessions_question_answers: string[];
  lecture_sessions_question_correct: string;
  lecture_sessions_question_explanation: string;
}

interface TransformedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export default function DKMQuizLectureSessions() {
  const location = useLocation();
  const from = location.state?.from || -1;
  const { id: lecture_session_id } = useParams();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [bulkInput, setBulkInput] = useState<string>("");
  const [showBulkUpload, setShowBulkUpload] = useState<boolean>(false);

  const [questions, setQuestions] = useState<TransformedQuestion[]>([]);
  const [isEditingIndex, setIsEditingIndex] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState<TransformedQuestion>({
    id: "",
    question: "",
    options: ["", ""],
    correctAnswerIndex: 0,
    explanation: "",
  });

  const [pendingDelete, setPendingDelete] = useState<{
    index: number;
    timeoutId: NodeJS.Timeout;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["quiz-questions", lecture_session_id],
    queryFn: async () => {
      try {
        console.log("📥 Mengambil data quiz dan soal dari backend...");
        const res = await axios.get(
          `/public/lecture-sessions-quiz/${lecture_session_id}/with-questions`
        );
        console.log("✅ Data quiz berhasil diambil:", res.data);
        return res.data.data;
      } catch (err: any) {
        console.error("❌ Gagal mengambil data quiz:", err);
        if (err.response?.status === 404) {
          console.warn("⚠️ Quiz belum tersedia (404)");
          return null;
        }
        throw err;
      }
    },

    enabled: !!lecture_session_id,
  });

  useEffect(() => {
    if (lecture_session_id && data === null) {
      axios
        .post("/api/a/lecture-sessions-quiz", {
          lecture_sessions_quiz_title: "Latihan Soal Kajian",
          lecture_sessions_quiz_description: "-",
          lecture_sessions_quiz_lecture_session_id: lecture_session_id,
        })
        .then((res) => {
          const msg = res.data?.message;
          if (msg === "Quiz sudah ada") {
            toast("Quiz sudah tersedia.");
          } else {
            toast.success("Quiz berhasil dibuat.");
          }
          queryClient.invalidateQueries({
            queryKey: ["quiz-questions", lecture_session_id],
          });
        })
        .catch((err) => {
          console.error("❌ Gagal membuat quiz otomatis:", err);
          toast.error("Gagal membuat quiz otomatis.");
        });
    }
  }, [data, lecture_session_id]);

  useEffect(() => {
    if (data?.questions) {
      const transformed = data.questions.map(
        (q: APIQuestion): TransformedQuestion => {
          const correctIndex = q.lecture_sessions_question_answers.findIndex(
            (ans) => ans.startsWith(q.lecture_sessions_question_correct + ".")
          );
          return {
            id: q.lecture_sessions_question_id,
            question: q.lecture_sessions_question,
            options: q.lecture_sessions_question_answers,
            correctAnswerIndex: correctIndex !== -1 ? correctIndex : 0,
            explanation: q.lecture_sessions_question_explanation || "",
          };
        }
      );
      setQuestions(transformed);
    }
  }, [data]);

  const handleBulkUpload = async () => {
    try {
      const quizId = data?.quiz?.lecture_sessions_quiz_id;
      if (!quizId || !lecture_session_id) {
        toast.error("Quiz atau sesi tidak tersedia.");
        return;
      }

      const parsed = JSON.parse(bulkInput);
      if (!Array.isArray(parsed)) {
        toast.error("Format JSON harus berupa array.");
        return;
      }

      const payloads = parsed.map((item: any, index: number) => {
        // validasi minimal field penting
        if (
          typeof item.lecture_sessions_question !== "string" ||
          !Array.isArray(item.lecture_sessions_question_answers) ||
          typeof item.lecture_sessions_question_correct !== "string"
        ) {
          throw new Error(`Format soal ke-${index + 1} tidak valid`);
        }

        return {
          lecture_sessions_question: item.lecture_sessions_question,
          lecture_sessions_question_answers:
            item.lecture_sessions_question_answers.map(
              (opt: string, i: number) => {
                const clean = opt.replace(/^[a-zA-Z]\.\s*/, "").trim();
                return `${String.fromCharCode(65 + i)}. ${clean}`;
              }
            ),
          lecture_sessions_question_correct:
            item.lecture_sessions_question_correct.trim().toUpperCase(),
          lecture_sessions_question_explanation:
            item.lecture_sessions_question_explanation || "-",
          lecture_sessions_question_lecture_session_id: lecture_session_id,
          lecture_sessions_question_quiz_id: quizId,
        };
      });

      const results = await Promise.all(
        payloads.map((p) =>
          axios.post("/api/a/lecture-sessions-questions", p).catch((err) => err)
        )
      );

      const successCount = results.filter(
        (res) => !(res instanceof Error)
      ).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`✅ ${successCount} soal berhasil ditambahkan.`);
      }
      if (failCount > 0) {
        toast.error(`❌ ${failCount} soal gagal ditambahkan.`);
      }

      queryClient.invalidateQueries({
        queryKey: ["quiz-questions", lecture_session_id],
      });

      setBulkInput("");
      setShowBulkUpload(false);
    } catch (err: any) {
      console.error("❌ Gagal parsing JSON:", err);
      toast.error("Format JSON tidak valid.");
    }
  };

  const handleDelete = async (index: number) => {
    const target = questions[index];
    if (!target?.id) return;

    // Soft-delete: sembunyikan dari tampilan
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);

    // Tampilkan toast dengan Undo
    const toastId = toast(
      (t) => (
        <div className="flex items-center justify-between gap-4">
          <span>🗑 Soal dihapus.</span>
          <button
            className="underline text-sm"
            onClick={() => {
              // Batalkan penghapusan
              setQuestions((prev) => {
                const restored = [...prev];
                restored.splice(index, 0, target); // kembalikan ke posisi semula
                return restored;
              });
              clearTimeout(timeoutId);
              setPendingDelete(null);
              toast.dismiss(t.id);
              toast.success("Soal dipulihkan.");
            }}
          >
            Undo
          </button>
        </div>
      ),
      {
        duration: 4000,
      }
    );

    // Set timer untuk delete permanen
    const timeoutId = setTimeout(async () => {
      try {
        await axios.delete(`/api/a/lecture-sessions-questions/${target.id}`);
        toast.success("Soal dihapus permanen.");
      } catch (err) {
        console.error("❌ Gagal hapus permanen:", err);
        toast.error("Gagal menghapus soal.");
        // Jika gagal, restore soal ke list
        setQuestions((prev) => {
          const restored = [...prev];
          restored.splice(index, 0, target);
          return restored;
        });
      }
      setPendingDelete(null);
    }, 4000);

    setPendingDelete({ index, timeoutId });
  };

  const handleSave = async () => {
    if (!newQuestion.question.trim()) return;
    if (newQuestion.options.filter((opt) => opt.trim()).length < 2) {
      alert("Minimal 2 pilihan jawaban diperlukan.");
      return;
    }

    const quizId = data?.quiz?.lecture_sessions_quiz_id;
    if (!quizId) {
      console.log(
        "⚠️ Quiz belum tersedia untuk sesi kajian ini (lecture_session_id):",
        lecture_session_id
      );
      return toast.error("Quiz belum tersedia untuk sesi kajian ini.");
    }

    const correctLetter = String.fromCharCode(
      65 + newQuestion.correctAnswerIndex
    );
    const payload = {
      lecture_sessions_question_id: newQuestion.id, // ⬅️ PENTING BANGET
      lecture_sessions_question: newQuestion.question,
      lecture_sessions_question_answers: newQuestion.options.map((opt, i) => {
        // hapus label huruf ganda dari input seperti "A. A. A. tes 1"
        const cleanText = opt.replace(/^[a-zA-Z]\.\s*/, "").trim();
        return `${String.fromCharCode(65 + i)}. ${cleanText}`;
      }),

      lecture_sessions_question_correct: correctLetter,
      lecture_sessions_question_explanation:
        newQuestion.explanation?.trim() || "-",
      lecture_sessions_question_lecture_session_id: lecture_session_id,
      lecture_sessions_question_quiz_id: quizId,
    };

    try {
      if (isEditingIndex !== null && isEditingIndex < questions.length) {
        console.log("✏️ Edit mode aktif");
        console.log("🔧 Target soal yang akan diedit:", newQuestion.id);
        console.log("📦 Payload untuk PUT:", payload);
        const old = questions[isEditingIndex];
        const changedFields = getChangedFields(old, newQuestion);

        if (Object.keys(changedFields).length === 0) {
          toast("Tidak ada perubahan.");
          return;
        }

        console.log("📦 Field yang diubah:", changedFields);

        await axios.put(
          `/api/a/lecture-sessions-questions/${newQuestion.id}`,
          changedFields,
          { headers: { "Content-Type": "application/json" } }
        );

        toast.success("Soal berhasil diperbarui!");
      } else {
        console.log("🆕 Mode tambah soal");
        console.log("📦 Payload untuk POST:", payload);

        console.log("📤 Mengirim soal baru ke backend...");
        await axios
          .post("/api/a/lecture-sessions-questions", payload)
          .then((res) => {
            console.log("✅ Soal berhasil dikirim:", res.data);
            toast.success("Soal berhasil ditambahkan!");
          })
          .catch((err) => {
            console.error("❌ Gagal menambahkan soal:", err);
            console.log("📦 Detail error dari backend:", err.response?.data);
            toast.error(err.response?.data?.error || "Gagal menambahkan soal.");
          });
      }

      setNewQuestion({
        id: "",
        question: "",
        options: ["", ""],
        correctAnswerIndex: 0,
        explanation: "",
      });
      setIsEditingIndex(null);

      console.log("🔄 Refresh data soal...");
      queryClient.invalidateQueries({
        queryKey: ["quiz-questions", lecture_session_id],
      });
    } catch (err: any) {
      console.error("❌ Gagal menyimpan soal:", err);
      console.log("📦 Detail error dari backend:", err.response?.data);
      toast.error(err.response?.data?.error || "Gagal menyimpan soal.");
    }
  };

  const handleEdit = (index: number) => {
    setNewQuestion({ ...questions[index] });
    setIsEditingIndex(index);
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const handleAddClick = () => {
    setNewQuestion({
      id: "",
      question: "",
      options: ["", ""],
      correctAnswerIndex: 0,
      explanation: "",
    });
    setIsEditingIndex(questions.length);
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const renderForm = () => (
    <div
      ref={formRef}
      className="rounded-2xl border p-4 space-y-3 shadow-sm"
      style={{ backgroundColor: theme.white1, borderColor: theme.silver1 }}
    >
      <input
        type="text"
        value={newQuestion.question}
        placeholder="Tulis pertanyaan..."
        onChange={(e) =>
          setNewQuestion({ ...newQuestion, question: e.target.value })
        }
        className="w-full px-3 py-2 rounded border"
        style={{
          borderColor: theme.silver1,
          backgroundColor: theme.white2,
          color: theme.black1,
        }}
      />
      {newQuestion.options.map((opt, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="radio"
            name="correct"
            checked={newQuestion.correctAnswerIndex === i}
            onChange={() =>
              setNewQuestion({ ...newQuestion, correctAnswerIndex: i })
            }
          />
          <input
            type="text"
            value={opt}
            placeholder={`Pilihan ${i + 1}`}
            onChange={(e) => {
              const updated = [...newQuestion.options];
              updated[i] = e.target.value;
              setNewQuestion({ ...newQuestion, options: updated });
            }}
            className="flex-1 px-3 py-2 rounded border"
            style={{
              borderColor: theme.silver1,
              backgroundColor: theme.white2,
              color: theme.black1,
            }}
          />
          {newQuestion.options.length > 2 && (
            <button
              type="button"
              onClick={() => {
                const updated = [...newQuestion.options];
                updated.splice(i, 1);
                const newCorrect =
                  newQuestion.correctAnswerIndex === i
                    ? 0
                    : newQuestion.correctAnswerIndex;
                setNewQuestion({
                  ...newQuestion,
                  options: updated,
                  correctAnswerIndex: newCorrect,
                });
              }}
              className="text-sm"
              style={{ color: theme.error1 }}
            >
              🗑
            </button>
          )}
        </div>
      ))}
      <textarea
        value={newQuestion.explanation}
        placeholder="Tulis penjelasan soal..."
        onChange={(e) =>
          setNewQuestion({ ...newQuestion, explanation: e.target.value })
        }
        className="w-full px-3 py-2 rounded border"
        style={{
          borderColor: theme.silver1,
          backgroundColor: theme.white2,
          color: theme.black1,
        }}
      />
      <button
        type="button"
        onClick={() =>
          setNewQuestion({
            ...newQuestion,
            options: [...newQuestion.options, ""],
          })
        }
        className="text-sm font-medium underline pr-2"
        style={{ color: theme.quaternary }}
      >
        + Tambah Pilihan Jawaban
      </button>
      <div className="flex justify-end gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded font-medium"
          style={{ backgroundColor: theme.success1, color: theme.white1 }}
        >
          Simpan
        </button>
        <button
          onClick={() => {
            setIsEditingIndex(null);
            setNewQuestion({
              id: "",
              question: "",
              options: ["", ""],
              correctAnswerIndex: 0,
              explanation: "",
            });
          }}
          className="px-4 py-2 rounded font-medium"
          style={{ backgroundColor: theme.error1, color: theme.white1 }}
        >
          Batal
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Latihan Soal disini"
        onBackClick={() => navigate(`/dkm/kajian/kajian-detail/${id}`)}
        actionButton={{
          label: "Statistik Soal",
          onClick: () =>
            navigate(
              `/dkm/kajian/kajian-detail/${lecture_session_id}/statistik-soal`
            ),
        }}
      />
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="space-y-6">
            {/* Jika belum ada soal sama sekali */}
            {questions.length === 0
              ? renderForm()
              : questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="rounded-2xl border p-4 space-y-3 shadow-sm"
                    style={{
                      backgroundColor: theme.white1,
                      borderColor: theme.silver1,
                    }}
                  >
                    {isEditingIndex === index ? (
                      renderForm()
                    ) : (
                      <>
                        <p
                          className="font-medium text-base"
                          style={{ color: theme.black1 }}
                        >
                          {index + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt, i) => (
                            <div
                              key={i}
                              className="text-sm px-4 py-2 rounded-lg font-normal"
                              style={{
                                backgroundColor:
                                  i === q.correctAnswerIndex
                                    ? theme.success1
                                    : theme.white2,
                                color:
                                  i === q.correctAnswerIndex
                                    ? theme.white1
                                    : theme.black1,
                              }}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEdit(index)}
                            className="flex items-center gap-1 text-sm font-medium"
                            style={{ color: theme.quaternary }}
                          >
                            <Pencil size={16} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            className="flex items-center gap-1 text-sm font-medium"
                            style={{ color: theme.error1 }}
                          >
                            <Trash2 size={16} /> Hapus
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

            {/* Form tambah soal hanya muncul jika user klik "Tambah Soal" */}
            {isEditingIndex === questions.length &&
              questions.length > 0 &&
              renderForm()}
          </div>

          {/* Tombol tambah soal */}
          <div className="flex justify-end items-center gap-2 pt-6 mt-10">
            <CommonActionButton
              text={
                showBulkUpload
                  ? "Tutup Upload JSON"
                  : "📦 Upload JSON Banyak Soal"
              }
              onClick={() => setShowBulkUpload(!showBulkUpload)}
              variant="outline"
              className="text-sm"
            />

            <CommonActionButton
              text="+ Tambah Soal"
              onClick={handleAddClick}
              className="text-sm font-medium"
            />
          </div>

          {showBulkUpload && (
            <div className="mt-4 space-y-2">
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                rows={10}
                placeholder={`Contoh format:\n[\n  {\n    "question": "Apa hukum wudhu?",\n    "options": ["A. Wajib", "B. Sunnah", "C. Haram", "D. Makruh"],\n    "correct": "A",\n    "explanation": "Wudhu adalah wajib sebelum sholat."\n  },\n  ...\n]`}
                className="w-full p-3 border rounded-md font-mono text-sm"
                style={{
                  backgroundColor: theme.white2,
                  color: theme.black1,
                  borderColor: theme.silver1,
                }}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleBulkUpload}
                  className="px-4 py-2 rounded font-medium"
                  style={{
                    backgroundColor: theme.success1,
                    color: theme.white1,
                  }}
                >
                  🚀 Upload Soal JSON
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getChangedFields(
  oldQ: TransformedQuestion,
  newQ: TransformedQuestion
) {
  const changes: Record<string, any> = {};

  if (oldQ.question !== newQ.question) {
    changes.lecture_sessions_question = newQ.question;
  }

  const cleanedNewOptions = newQ.options.map(
    (opt, i) =>
      `${String.fromCharCode(65 + i)}. ${opt.replace(/^[a-zA-Z]\.\s*/, "").trim()}`
  );

  const cleanedOldOptions = oldQ.options.map((opt) =>
    opt.replace(/^[a-zA-Z]\.\s*/, "").trim()
  );

  const cleanedNewOptionsWithoutLabel = newQ.options.map((opt) =>
    opt.replace(/^[a-zA-Z]\.\s*/, "").trim()
  );

  const cleanedOldOptionsWithLabel = oldQ.options.map(
    (opt, i) =>
      `${String.fromCharCode(65 + i)}. ${opt.replace(/^[a-zA-Z]\.\s*/, "").trim()}`
  );

  if (
    JSON.stringify(cleanedOldOptionsWithLabel) !==
    JSON.stringify(cleanedNewOptions)
  ) {
    changes.lecture_sessions_question_answers = cleanedNewOptions;
  }

  const newCorrect = String.fromCharCode(65 + newQ.correctAnswerIndex);
  const oldCorrect = String.fromCharCode(65 + oldQ.correctAnswerIndex);

  if (newCorrect !== oldCorrect) {
    changes.lecture_sessions_question_correct = newCorrect;
  }

  if ((oldQ.explanation || "-") !== (newQ.explanation || "-")) {
    changes.lecture_sessions_question_explanation = newQ.explanation || "-";
  }

  return changes;
}
