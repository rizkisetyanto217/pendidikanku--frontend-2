// src/pages/sekolahislamku/teacher/DetailGrading.tsx
import { useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Users, FileText, Clock } from "lucide-react";

import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import ModalGrading from "./ModalGrading";

type Submission = {
  id: string;
  studentName: string;
  status: "submitted" | "graded" | "missing";
  score?: number;
  submittedAt?: string;
};

type NavState = {
  assignment?: {
    id: string;
    title: string;
    className: string;
    dueDate?: string;
    total?: number;
  };
  className?: string; // fallback nama kelas bila tidak ada di assignment
  submissions?: Submission[]; // daftar siswa untuk ditampilkan & dinilai
};

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

export default function DetailGrading() {
  const { id: classId, assignmentId } = useParams<{
    id: string;
    assignmentId: string;
  }>();
  const { state } = useLocation() as { state?: NavState };
  const navigate = useNavigate();

  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  // Ambil data dari state yang dikirim dari TeacherGrading
  const assignment = state?.assignment;
  const className = assignment?.className ?? state?.className ?? "";
  const submissions = useMemo<Submission[]>(
    () => state?.submissions ?? [],
    [state?.submissions]
  );

  // Modal grading
  const [gradingOpen, setGradingOpen] = useState(false);
  const [gradingStudent, setGradingStudent] = useState<{
    id: string;
    name: string;
    score?: number;
  } | null>(null);

  const handleOpenGrading = (s: Submission) => {
    setGradingStudent({ id: s.id, name: s.studentName, score: s.score });
    setGradingOpen(true);
  };

  const emptyState = !assignment && submissions.length === 0;

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Penilaian"
        gregorianDate={new Date().toISOString()}
        dateFmt={dateLong}
      />

      {/* Modal Grading */}
      <ModalGrading
        open={gradingOpen}
        onClose={() => setGradingOpen(false)}
        palette={palette}
        student={gradingStudent ?? undefined}
        assignmentTitle={
          assignment?.title
            ? `${assignment.title}${className ? ` — (${className})` : ""}`
            : className || undefined
        }
        onSubmit={(payload) => {
          // TODO: panggil API update nilai & refresh data (React Query/invalidations)
          console.log("Simpan nilai:", payload);
          setGradingOpen(false);
        }}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          <ParentSidebar palette={palette} />

          <div className="flex-1 space-y-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 hover:bg-opacity-10 hover:bg-black"
              style={{ color: palette.black1 }}
            >
              <ArrowLeft size={24} className="font-bold" />
              <span className=" font-semibold text-md">Kembali</span>
            </button>

            {/* Info tugas */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-6 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-lg md:text-xl font-bold truncate">
                      {assignment?.title ?? "Tugas"}
                    </h1>
                    <div
                      className="flex flex-wrap items-center gap-2 text-sm"
                      style={{ color: palette.silver2 }}
                    >
                      {className && (
                        <Badge palette={palette} variant="secondary">
                          {className}
                        </Badge>
                      )}
                      {assignment?.dueDate && (
                        <span className="flex items-center gap-1">
                          <CalendarDays size={14} />{" "}
                          {dateLong(assignment.dueDate)}
                        </span>
                      )}
                      {typeof assignment?.total === "number" && (
                        <span className="flex items-center gap-1">
                          <Users size={14} /> {assignment.total} siswa
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs" style={{ color: palette.silver2 }}>
                    Class ID: {classId ?? "-"} • Assignment ID:{" "}
                    {assignmentId ?? assignment?.id ?? "-"}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Jika state kosong */}
            {emptyState && (
              <SectionCard palette={palette}>
                <div
                  className="p-6 text-center"
                  style={{ color: palette.silver2 }}
                >
                  Data tidak tersedia. Buka halaman ini melalui daftar tugas
                  (TeacherGrading) agar data ikut terkirim.
                </div>
              </SectionCard>
            )}

            {/* Tabel submissions */}
            {!emptyState && (
              <SectionCard palette={palette}>
                <div className="p-4 md:p-6">
                  <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <FileText size={18} /> Daftar Pengumpulan
                  </h2>

                  <div
                    className="overflow-x-auto rounded-xl border"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <table className="w-full text-sm">
                      <thead style={{ background: palette.white2 }}>
                        <tr>
                          <th className="text-left py-3 px-4">Nama Siswa</th>
                          <th className="text-center py-3 px-3">Status</th>
                          <th className="text-center py-3 px-3">Nilai</th>
                          <th className="text-right py-3 px-4">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((s, i) => (
                          <tr
                            key={s.id}
                            style={{
                              background:
                                i % 2 === 0 ? palette.white1 : palette.white2,
                              borderTop:
                                i === 0
                                  ? "none"
                                  : `1px solid ${palette.silver1}`,
                            }}
                          >
                            <td className="py-3 px-4">
                              <div className="font-medium">{s.studentName}</div>
                              {s.submittedAt && (
                                <div
                                  className="text-xs mt-0.5 flex items-center gap-1"
                                  style={{ color: palette.silver2 }}
                                >
                                  <Clock size={12} /> Dikumpulkan{" "}
                                  {dateLong(s.submittedAt)}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Badge
                                palette={palette}
                                variant={
                                  s.status === "graded"
                                    ? "success"
                                    : s.status === "submitted"
                                      ? "info"
                                      : "destructive"
                                }
                              >
                                {s.status === "graded"
                                  ? "Sudah Dinilai"
                                  : s.status === "submitted"
                                    ? "Terkumpul"
                                    : "Belum"}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {typeof s.score === "number" ? (
                                <span className="font-semibold text-base">
                                  {s.score}
                                </span>
                              ) : (
                                <span style={{ color: palette.silver2 }}>
                                  -
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex justify-end gap-2">
                                <Btn
                                  palette={palette}
                                  size="sm"
                                  variant={
                                    s.status === "submitted"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => handleOpenGrading(s)}
                                >
                                  {s.status === "graded"
                                    ? "Edit Nilai"
                                    : "Beri Nilai"}
                                </Btn>
                                {/* Tidak ada tombol "Detail" lagi di halaman detail */}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {submissions.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="py-8 text-center"
                              style={{ color: palette.silver2 }}
                            >
                              Belum ada data pengumpulan.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
