import { useRef, useState } from "react";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export default function DKMQuizLectureSessions() {
  const navigate = useNavigate();
  const { id } = useParams(); // ini akan ambil dari /kajian-detail/:id
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      question: "Percaya kepada nabi muhammad termasuk ?",
      options: [
        "Iman kepada Allah ta'ala",
        "Iman kepada malaikat",
        "Iman kepada rasul",
        "Iman kepada kitab",
      ],
      correctAnswerIndex: 2,
    },
    {
      id: "q2",
      question: "Percaya kepada nabi Allah ta'ala termasuk rukun iman ?",
      options: [
        "Iman kepada Allah ta'ala",
        "Iman kepada malaikat",
        "Iman kepada rasul",
        "Iman kepada kitab",
      ],
      correctAnswerIndex: 0,
    },
  ]);

  const [isEditingIndex, setIsEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Question>({
    id: "",
    question: "",
    options: ["", ""],
    correctAnswerIndex: 0,
  });

  const formRef = useRef<HTMLDivElement>(null);

  const handleDelete = (index: number) => {
    if (confirm("Yakin ingin menghapus soal ini?")) {
      const updated = [...questions];
      updated.splice(index, 1);
      setQuestions(updated);
    }
  };

  const handleEdit = (index: number) => {
    setNewQuestion({ ...questions[index] });
    setIsEditingIndex(index);
    setShowForm(true);
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const handleSave = () => {
    if (!newQuestion.question.trim()) return;
    if (newQuestion.options.filter((opt) => opt.trim()).length < 2) {
      alert("Minimal 2 pilihan jawaban diperlukan.");
      return;
    }

    const updatedQuestions = [...questions];
    if (isEditingIndex !== null) {
      updatedQuestions[isEditingIndex] = { ...newQuestion };
      setIsEditingIndex(null);
    } else {
      updatedQuestions.push({
        ...newQuestion,
        id: `q${Date.now()}`,
      });
    }

    setQuestions(updatedQuestions);
    setNewQuestion({
      id: "",
      question: "",
      options: ["", ""],
      correctAnswerIndex: 0,
    });
    setShowForm(false);
  };

  const handleAddClick = () => {
    setIsEditingIndex(null);
    setNewQuestion({
      id: "",
      question: "",
      options: ["", ""],
      correctAnswerIndex: 0,
    });
    setShowForm(true);
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Latihan Soal"
        onBackClick={() => history.back()}
        actionButton={{
          label: "Statistik Soal",
          onClick: () =>
            navigate(`/dkm/kajian/kajian-detail/${id}/statistik-soal`),
        }}
      />
      <div className="space-y-6">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className="rounded-2xl border p-4 space-y-3 shadow-sm"
            style={{
              backgroundColor: theme.white1,
              borderColor: theme.silver1,
            }}
          >
            <p
              className="font-semibold text-base"
              style={{ color: theme.black1 }}
            >
              {index + 1}. {q.question}
            </p>

            <div className="space-y-2">
              {q.options.map((option, i) => (
                <div
                  key={i}
                  className="text-sm px-4 py-2 rounded-lg font-semibold"
                  style={{
                    backgroundColor:
                      i === q.correctAnswerIndex
                        ? theme.success1
                        : theme.white2,
                    color:
                      i === q.correctAnswerIndex ? theme.white1 : theme.black1,
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  {option}
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-end">
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
          </div>
        ))}
      </div>

      {showForm && (
        <div
          ref={formRef}
          className="p-4 rounded-xl border space-y-3"
          style={{
            backgroundColor: theme.white1,
            borderColor: theme.silver1,
            color: theme.black1,
          }}
        >
          <p className="font-medium text-lg" style={{ color: theme.primary }}>
            {isEditingIndex !== null ? "Edit Soal" : "Tambah Soal"}
          </p>

          <input
            type="text"
            placeholder="Tulis pertanyaan..."
            value={newQuestion.question}
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
                name="correctAnswer"
                checked={newQuestion.correctAnswerIndex === i}
                onChange={() =>
                  setNewQuestion({ ...newQuestion, correctAnswerIndex: i })
                }
              />
              <input
                type="text"
                placeholder={`Pilihan ${i + 1}`}
                value={opt}
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
                    let correctIndex = newQuestion.correctAnswerIndex;
                    if (i < correctIndex) correctIndex--;
                    if (i === correctIndex) correctIndex = 0;
                    setNewQuestion({
                      ...newQuestion,
                      options: updated,
                      correctAnswerIndex: correctIndex,
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

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded font-semibold"
            style={{
              backgroundColor: theme.success1,
              color: theme.white1,
            }}
          >
            {isEditingIndex !== null ? "Simpan Perubahan" : "+ Tambah Soal"}
          </button>
        </div>
      )}

      {questions.length > 0 && (
        <div className="flex justify-end gap-2 pt-6 border-t mt-10">
          {showForm ? (
            <>
              <button
                onClick={() => {
                  setShowForm(false);
                  setNewQuestion({
                    id: "",
                    question: "",
                    options: ["", ""],
                    correctAnswerIndex: 0,
                  });
                  setIsEditingIndex(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold border"
                style={{
                  backgroundColor: theme.white1,
                  borderColor: theme.silver1,
                  color: theme.black1,
                }}
              >
                Batal
              </button>

              <button
                disabled
                className="px-5 py-2 rounded-lg text-sm font-semibold opacity-60 cursor-not-allowed"
                style={{
                  backgroundColor: theme.success1,
                  color: theme.white1,
                }}
              >
                Simpan Perubahan
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleAddClick}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.white1,
                }}
              >
                + Tambah Soal
              </button>

              <button
                onClick={() => alert("Perubahan disimpan!")}
                className="px-5 py-2 rounded-lg text-sm font-semibold"
                style={{
                  backgroundColor: theme.success1,
                  color: theme.white1,
                }}
              >
                Simpan Perubahan
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
