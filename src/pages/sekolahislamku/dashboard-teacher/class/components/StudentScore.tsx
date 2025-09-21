// src/pages/sekolahislamku/student/StudentScore.tsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

import InputField from "@/components/common/main/InputField"; // pastikan path benar

type StudentLite = {
  id: string;
  name: string;
  className?: string;
};

type AssignmentMini = {
  id: string;
  title: string;
  dueDate?: string; // ISO
};

type LocationState = {
  student?: StudentLite;
  assignments?: AssignmentMini[];
};

export default function StudentScore() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  const { id: classId, studentId } = useParams<{
    id: string;
    studentId: string;
  }>();

  const { state } = useLocation() as { state?: LocationState };
  const student = state?.student;
  const incomingAssignments = state?.assignments ?? [];

  // dummy fallback kalau assignment tidak dikirim
  const defaultAssignments: AssignmentMini[] = useMemo(
    () =>
      incomingAssignments.length
        ? incomingAssignments
        : [
            { id: "t1", title: "Evaluasi Wudhu" },
            { id: "t2", title: "Hafalan Juz 30 (1–10)" },
            { id: "t3", title: "Tajwid: Mad Thabi'i" },
          ],
    [incomingAssignments]
  );

  const [scores, setScores] = useState<Record<string, string>>({});

  const handleChange = (aid: string, val: string) => {
    // validasi biar 0–100
    if (val === "") {
      setScores((p) => ({ ...p, [aid]: "" }));
    } else {
      const num = Math.max(0, Math.min(100, Number(val)));
      setScores((p) => ({ ...p, [aid]: String(num) }));
    }
  };

  const handleSave = () => {
    const payload = defaultAssignments.map((a) => ({
      assignmentId: a.id,
      score:
        scores[a.id] === "" || scores[a.id] == null
          ? null
          : Number(scores[a.id]),
    }));
    console.log("Simpan nilai siswa", {
      classId,
      studentId,
      studentName: student?.name,
      payload,
    });
    alert("Nilai siswa disimpan (lihat console).");
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Penilaian Siswa"
        gregorianDate={new Date().toISOString()}
      />

      <main className="mx-auto Replace px-4 py-6">
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
                title="Kembali"
              >
                <ArrowLeft size={20} />
              </button>
              <span>
                Nilai • {student?.name ?? `Siswa ${studentId ?? ""}`}{" "}
                {student?.className ? (
                  <Badge palette={palette} variant="outline" className="ml-2">
                    Kelas {student.className}
                  </Badge>
                ) : null}
              </span>
            </div>

            {/* Card Penilaian */}
            <SectionCard palette={palette} className="p-4">
              <div className="text-sm mb-4" style={{ color: palette.silver2 }}>
                Isi nilai 0–100 untuk setiap tugas.
              </div>

              <div className="grid gap-4">
                {defaultAssignments.map((a) => (
                  <div key={a.id} className="space-y-1">
                    <InputField
                      label={a.title}
                      name={`score-${a.id}`}
                      type="number"
                      value={scores[a.id] ?? ""}
                      placeholder="0-100"
                      onChange={(e) => handleChange(a.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Btn palette={palette} onClick={handleSave}>
                  Simpan Nilai
                </Btn>
              </div>

              {!student && (
                <div
                  className="mt-3 text-sm"
                  style={{ color: palette.silver2 }}
                >
                  Tip: buka halaman ini lewat tombol <em>Nilai</em> di “Daftar
                  Siswa” agar data siswa & daftar tugas terisi otomatis.
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
