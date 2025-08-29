// src/pages/sekolahislamku/assignment/TaskScore.tsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Upload,
  RefreshCw,
  Save,
  AlertCircle,
  Eye,
} from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

type AssignmentState = {
  id?: string;
  title?: string;
  dueDate?: string;
  submitted?: number;
  total?: number;
  description?: string;
};

type StudentScore = {
  id: string;
  name: string;
  score?: number;
  submitted?: boolean;
  submissionDate?: string;
  submissionFile?: string;
  feedback?: string;
};

type ValidationError = {
  studentId: string;
  message: string;
};

export default function TaskScore() {
  const { id: assignmentId } = useParams<{ id: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();

  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  const assignment = (state as any)?.assignment as AssignmentState | undefined;

  // State management
  const [students, setStudents] = useState<StudentScore[]>([
    {
      id: "s1",
      name: "Ahmad Fadhil",
      submitted: true,
      score: 85,
      submissionDate: "2024-01-15",
      submissionFile: "ahmad_tugas.pdf",
      feedback: "",
    },
    {
      id: "s2",
      name: "Aisyah Putri",
      submitted: true,
      score: 92,
      submissionDate: "2024-01-14",
      submissionFile: "aisyah_tugas.docx",
      feedback: "Kerja yang sangat baik!",
    },
    {
      id: "s3",
      name: "Rizky Abdullah",
      submitted: false,
      submissionDate: undefined,
      submissionFile: undefined,
      feedback: "",
    },
    {
      id: "s4",
      name: "Siti Nurhaliza",
      submitted: true,
      score: undefined,
      submissionDate: "2024-01-16",
      submissionFile: "siti_tugas.pdf",
      feedback: "",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [showFeedback, setShowFeedback] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "submitted" | "pending"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "score" | "date">("name");

  // Load data on component mount
  useEffect(() => {
    loadStudentData();
  }, [assignmentId]);

  const loadStudentData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`Loading data for assignment: ${assignmentId}`);
    } catch (error) {
      console.error("Error loading student data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeScore = (studentId: string, score: number) => {
    // Validate score (0-100)
    if (score < 0 || score > 100) {
      setValidationErrors((prev) => [
        ...prev.filter((e) => e.studentId !== studentId),
        { studentId, message: "Nilai harus antara 0-100" },
      ]);
      return;
    }

    // Clear validation error for this student
    setValidationErrors((prev) =>
      prev.filter((e) => e.studentId !== studentId)
    );

    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, score } : s))
    );
  };

  const handleChangeFeedback = (studentId: string, feedback: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, feedback } : s))
    );
  };

  const toggleFeedback = (studentId: string) => {
    setShowFeedback((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSave = async () => {
    // Validate all scores
    const errors: ValidationError[] = [];
    students.forEach((student) => {
      if (
        student.submitted &&
        (student.score === undefined ||
          student.score < 0 ||
          student.score > 100)
      ) {
        errors.push({
          studentId: student.id,
          message:
            student.score === undefined
              ? "Nilai belum diisi"
              : "Nilai tidak valid",
        });
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      alert("Mohon perbaiki kesalahan pada form sebelum menyimpan");
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const dataToSave = {
        assignmentId,
        scores: students.map((s) => ({
          studentId: s.id,
          score: s.score,
          feedback: s.feedback,
        })),
      };

      console.log("Data tersimpan:", dataToSave);
      alert("Nilai berhasil disimpan!");

      // Clear validation errors
      setValidationErrors([]);
    } catch (error) {
      console.error("Error saving scores:", error);
      alert("Gagal menyimpan nilai. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportScores = () => {
    const csvContent = [
      ["Nama Siswa", "Status", "Nilai", "Tanggal Submit", "Feedback"],
      ...students.map((s) => [
        s.name,
        s.submitted ? "Terkumpul" : "Belum",
        s.score ?? "-",
        s.submissionDate ?? "-",
        s.feedback ?? "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nilai_${assignment?.title ?? assignmentId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewSubmission = (student: StudentScore) => {
    if (student.submissionFile) {
      // In real app, this would open the file or navigate to submission view
      alert(`Membuka file: ${student.submissionFile}`);
      console.log("View submission for:", student);
    }
  };

  const handleRefresh = () => {
    loadStudentData();
  };

  // Filter and sort students
  const filteredAndSortedStudents = students
    .filter((student) => {
      if (filterStatus === "submitted") return student.submitted;
      if (filterStatus === "pending") return !student.submitted;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "score":
          return (b.score ?? 0) - (a.score ?? 0);
        case "date":
          if (!a.submissionDate) return 1;
          if (!b.submissionDate) return -1;
          return (
            new Date(b.submissionDate).getTime() -
            new Date(a.submissionDate).getTime()
          );
        default:
          return 0;
      }
    });

  const submittedCount = students.filter((s) => s.submitted).length;
  const totalStudents = students.length;
  const averageScore =
    students
      .filter((s) => s.score !== undefined)
      .reduce((sum, s) => sum + (s.score ?? 0), 0) /
    students.filter((s) => s.score !== undefined).length;

  if (isLoading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: palette.white2 }}
      >
        <div className="flex items-center gap-2">
          <RefreshCw className="animate-spin" size={20} />
          <span>Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Penilaian Tugas"
        gregorianDate={new Date().toISOString()}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          <aside className="lg:w-64 mb-6 lg:mb-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center rounded-full p-1 hover:opacity-80"
                  style={{ background: palette.silver1 }}
                >
                  <ArrowLeft size={20} />
                </button>
                <span>
                  Nilai Tugas: {assignment?.title ?? `Tugas ${assignmentId}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  className="p-2 rounded hover:opacity-80"
                  style={{ background: palette.silver1 }}
                  title="Refresh Data"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={handleExportScores}
                  className="p-2 rounded hover:opacity-80"
                  style={{ background: palette.silver1 }}
                  title="Export ke CSV"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            {/* Statistics Card */}
            <SectionCard palette={palette} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: palette.primary }}
                  >
                    {submittedCount}/{totalStudents}
                  </div>
                  <div className="text-sm opacity-70">Terkumpul</div>
                </div>
                <div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: palette.primary }}
                  >
                    {totalStudents - submittedCount}
                  </div>
                  <div className="text-sm opacity-70">Belum Submit</div>
                </div>
                <div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: palette.primary }}
                  >
                    {isNaN(averageScore) ? "-" : Math.round(averageScore)}
                  </div>
                  <div className="text-sm opacity-70">Rata-rata Nilai</div>
                </div>
                <div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: palette.primary }}
                  >
                    {Math.round((submittedCount / totalStudents) * 100)}%
                  </div>
                  <div className="text-sm opacity-70">Tingkat Submit</div>
                </div>
              </div>
            </SectionCard>

            {/* Filter and Sort Controls */}
            <SectionCard palette={palette} className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="text-sm font-medium mr-2">Filter:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-1 border rounded text-sm"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white1,
                      color: palette.black1,
                    }}
                  >
                    <option value="all">Semua</option>
                    <option value="submitted">Sudah Submit</option>
                    <option value="pending">Belum Submit</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mr-2">Urutkan:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1 border rounded text-sm"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white1,
                      color: palette.black1,
                    }}
                  >
                    <option value="name">Nama</option>
                    <option value="score">Nilai</option>
                    <option value="date">Tanggal Submit</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <SectionCard
                palette={palette}
                className="p-4 border-red-200 bg-red-50"
              >
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle size={16} />
                  <span className="font-medium">Terdapat kesalahan:</span>
                </div>
                <ul className="text-sm text-red-600 space-y-1">
                  {validationErrors.map((error, index) => {
                    const student = students.find(
                      (s) => s.id === error.studentId
                    );
                    return (
                      <li key={index}>
                        {student?.name}: {error.message}
                      </li>
                    );
                  })}
                </ul>
              </SectionCard>
            )}

            {/* Student Scores Table */}
            <SectionCard palette={palette} className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{ borderBottom: `2px solid ${palette.silver1}` }}
                      className="text-left"
                    >
                      <th className="py-3 font-semibold">Nama Siswa</th>
                      <th className="py-3 font-semibold">Status</th>
                      <th className="py-3 font-semibold">Tanggal Submit</th>
                      <th className="py-3 font-semibold">Nilai</th>
                      <th className="py-3 font-semibold">Feedback</th>
                      <th className="py-3 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedStudents.map((student, index) => (
                      <React.Fragment key={student.id}>
                        <tr
                          style={{
                            borderBottom: `1px solid ${palette.silver1}`,
                            backgroundColor:
                              index % 2 === 0 ? palette.white1 : palette.white2,
                          }}
                        >
                          <td className="py-3 font-medium">{student.name}</td>
                          <td className="py-3">
                            {student.submitted ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle2 size={14} /> Terkumpul
                              </span>
                            ) : (
                              <span className="text-red-500 flex items-center gap-1">
                                <AlertCircle size={14} /> Belum Submit
                              </span>
                            )}
                          </td>
                          <td className="py-3">
                            {student.submissionDate
                              ? new Date(
                                  student.submissionDate
                                ).toLocaleDateString("id-ID")
                              : "-"}
                          </td>
                          <td className="py-3">
                            {student.submitted ? (
                              <div>
                                <input
                                  type="number"
                                  value={student.score ?? ""}
                                  onChange={(e) =>
                                    handleChangeScore(
                                      student.id,
                                      Number(e.target.value)
                                    )
                                  }
                                  placeholder="0-100"
                                  min="0"
                                  max="100"
                                  className="w-20 px-2 py-1 border rounded text-center"
                                  style={{
                                    borderColor: validationErrors.some(
                                      (e) => e.studentId === student.id
                                    )
                                      ? "#ef4444"
                                      : palette.silver1,
                                    background: palette.white1,
                                    color: palette.black1,
                                  }}
                                />
                                {validationErrors.some(
                                  (e) => e.studentId === student.id
                                ) && (
                                  <div className="text-xs text-red-500 mt-1">
                                    {
                                      validationErrors.find(
                                        (e) => e.studentId === student.id
                                      )?.message
                                    }
                                  </div>
                                )}
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-3">
                            {student.submitted ? (
                              <div>
                                <button
                                  onClick={() => toggleFeedback(student.id)}
                                  className="text-xs px-2 py-1 rounded border"
                                  style={{
                                    borderColor: palette.silver1,
                                    background: showFeedback[student.id]
                                      ? palette.primary
                                      : palette.white1,
                                    color: showFeedback[student.id]
                                      ? "white"
                                      : palette.black1,
                                  }}
                                >
                                  {showFeedback[student.id]
                                    ? "Tutup"
                                    : "Tambah"}{" "}
                                  Feedback
                                </button>
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              {student.submitted && student.submissionFile && (
                                <button
                                  onClick={() => handleViewSubmission(student)}
                                  className="p-1 rounded hover:opacity-80"
                                  style={{ background: palette.silver1 }}
                                  title="Lihat Submission"
                                >
                                  <Eye size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Feedback Row */}
                        {showFeedback[student.id] && student.submitted && (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-2"
                              style={{ background: palette.white2 }}
                            >
                              <div className="px-4">
                                <label className="text-xs font-medium block mb-1">
                                  Feedback untuk {student.name}:
                                </label>
                                <textarea
                                  value={student.feedback ?? ""}
                                  onChange={(e) =>
                                    handleChangeFeedback(
                                      student.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Tulis feedback untuk siswa..."
                                  className="w-full px-3 py-2 border rounded text-sm resize-none"
                                  rows={2}
                                  style={{
                                    borderColor: palette.silver1,
                                    background: palette.white1,
                                    color: palette.black1,
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAndSortedStudents.length === 0 && (
                <div className="text-center py-8 opacity-60">
                  Tidak ada data siswa yang sesuai dengan filter
                </div>
              )}

              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm opacity-70">
                  Menampilkan {filteredAndSortedStudents.length} dari{" "}
                  {totalStudents} siswa
                </div>
                <div className="flex gap-2">
                  <Btn
                    palette={palette}
                    onClick={handleSave}
                    disabled={isSaving || validationErrors.length > 0}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Simpan Semua Nilai
                      </>
                    )}
                  </Btn>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
