// src/pages/sekolahislamku/assignment/TaskScore.tsx
import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
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
};

type StudentScore = {
  id: string;
  name: string;
  score?: number;
  submitted?: boolean;
};

export default function TaskScore() {
  const { id: assignmentId } = useParams<{ id: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();

  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  const assignment = (state as any)?.assignment as AssignmentState | undefined;

  // dummy list siswa
  const [students, setStudents] = useState<StudentScore[]>([
    { id: "s1", name: "Ahmad", submitted: true, score: 80 },
    { id: "s2", name: "Aisyah", submitted: true, score: 95 },
    { id: "s3", name: "Rizky", submitted: false },
  ]);

  const handleChangeScore = (sid: string, score: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === sid ? { ...s, score } : s))
    );
  };

  const handleSave = () => {
    console.log("Simpan nilai:", students);
    alert("Nilai tersimpan (cek console)");
  };

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

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          <aside className="lg:w-64 mb-6 lg:mb-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 font-semibold text-lg">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center rounded-full p-1 hover:opacity-80"
              >
                <ArrowLeft size={20} />
              </button>
              <span>
                Nilai Tugas: {assignment?.title ?? `Tugas ${assignmentId}`}
              </span>
            </div>

            {/* Card daftar siswa */}
            <SectionCard palette={palette} className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{ borderBottom: `1px solid ${palette.silver1}` }}
                    className="text-left"
                  >
                    <th className="py-2">Nama Siswa</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr
                      key={s.id}
                      style={{ borderBottom: `1px solid ${palette.silver1}` }}
                    >
                      <td className="py-2">{s.name}</td>
                      <td className="py-2">
                        {s.submitted ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Terkumpul
                          </span>
                        ) : (
                          <span className="text-red-500">Belum</span>
                        )}
                      </td>
                      <td className="py-2">
                        {s.submitted ? (
                          <input
                            type="number"
                            value={s.score ?? ""}
                            onChange={(e) =>
                              handleChangeScore(s.id, Number(e.target.value))
                            }
                            className="w-20 px-2 py-1 border rounded"
                            style={{
                              borderColor: palette.silver1,
                              background: palette.white1,
                              color: palette.black1,
                            }}
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex justify-end">
                <Btn palette={palette} onClick={handleSave}>
                  Simpan Nilai
                </Btn>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
