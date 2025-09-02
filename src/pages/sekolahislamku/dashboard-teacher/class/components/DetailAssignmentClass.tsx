// src/pages/sekolahislamku/teacher/DetailAssignmentClass.tsx
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { pickTheme, ThemeName } from "@/constants/thema";

import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

import { ArrowLeft, CalendarDays, ClipboardList, Users } from "lucide-react";

/* ========= Types ========= */
type Assignment = {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO
  createdAt: string; // ISO
  author: string;
  totalSubmissions: number;
  gradedSubmissions: number;
};

/* ========= Dummy DB yang selaras dengan AssignmentClass =========
   - Kunci utama per KELAS (classId), lalu daftar tugasnya
   - Pastikan ID-nya sama dengan yang dipakai di AssignmentClass (a-001, a-002, dst)
=============================================================== */
const now = new Date();
const iso = (d: Date) => d.toISOString();
const addDays = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return iso(d);
};

const ASSIGNMENTS_BY_CLASS: Record<string, Assignment[]> = {
  "tpa-a": [
    {
      id: "a-001",
      title: "Latihan Tajwid: Idgham",
      description:
        "Kerjakan soal idgham bighunnah & bilaghunnah. Kumpulkan sebelum batas waktu.",
      createdAt: iso(now),
      dueDate: addDays(3),
      author: "Ustadz Abdullah",
      totalSubmissions: 22,
      gradedSubmissions: 10,
    },
    {
      id: "a-002",
      title: "Hafalan Surat An-Naba 1–10",
      description:
        "Setorkan hafalan ayat 1–10. Perhatikan makhraj dan panjang mad.",
      createdAt: iso(now),
      dueDate: addDays(5),
      author: "Ustadzah Amina",
      totalSubmissions: 20,
      gradedSubmissions: 8,
    },
  ],
  "tpa-b": [
    {
      id: "a-101",
      title: "Tilawah Juz 30 (Mingguan)",
      description: "Rekam tilawah pilihan dari Juz 30 selama 3–5 menit.",
      createdAt: iso(now),
      dueDate: addDays(4),
      author: "Ustadz Salman",
      totalSubmissions: 18,
      gradedSubmissions: 6,
    },
    {
      id: "a-102",
      title: "Pemahaman Tajwid Dasar",
      description: "Kuis singkat tentang mad thabi'i dan ikhfa'.",
      createdAt: iso(now),
      dueDate: addDays(2),
      author: "Ustadzah Maryam",
      totalSubmissions: 19,
      gradedSubmissions: 12,
    },
  ],
};

/* ========= Fetcher yang konsisten (pakai classId + assignmentId) ========= */
async function fetchAssignmentById(
  classId: string,
  assignmentId: string
): Promise<Assignment | undefined> {
  const list = ASSIGNMENTS_BY_CLASS[classId] ?? [];
  const found = list.find((a) => a.id === assignmentId);
  // simulasi async
  return Promise.resolve(found);
}

/* ========= Helpers tanggal ========= */
const dateLong = (isoStr?: string) =>
  isoStr
    ? new Date(isoStr).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

/* ========= Page ========= */
export default function DetailAssignmentClass() {
  const { id: classId = "", assignmentId = "" } = useParams<{
    id: string;
    assignmentId: string;
  }>();
  const navigate = useNavigate();

  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const { data: assignment, isLoading } = useQuery({
    queryKey: ["class-assignment", classId, assignmentId],
    queryFn: () =>
      classId && assignmentId
        ? fetchAssignmentById(classId, assignmentId)
        : Promise.resolve(undefined),
    enabled: !!classId && !!assignmentId,
    staleTime: 2 * 60_000,
  });

  // Hijriah untuk topbar
  const hijriToday = useMemo(
    () =>
      new Date().toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    []
  );

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Tugas"
        gregorianDate={new Date().toISOString()}
        hijriDate={hijriToday}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />

          <div className="flex-1 space-y-6">
            {/* Back */}
            <Btn
              palette={palette}
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} className="mr-1" />
              Kembali
            </Btn>

            <SectionCard palette={palette} className="p-5 space-y-4">
              {isLoading && (
                <div className="text-sm" style={{ color: palette.silver2 }}>
                  Memuat detail tugas…
                </div>
              )}

              {!isLoading && assignment && (
                <>
                  <div>
                    <h2 className="text-xl font-semibold mb-1">
                      {assignment.title}
                    </h2>
                    <p className="text-sm" style={{ color: palette.silver2 }}>
                      Oleh {assignment.author} • Dibuat{" "}
                      {dateLong(assignment.createdAt)}
                    </p>
                  </div>

                  {assignment.description && (
                    <p className="text-sm" style={{ color: palette.black2 }}>
                      {assignment.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3 text-sm">
                    <Badge palette={palette} variant="secondary">
                      <CalendarDays size={14} className="mr-1" />
                      Batas: {dateLong(assignment.dueDate)}
                    </Badge>
                    <Badge palette={palette} variant="outline">
                      <Users size={14} className="mr-1" />
                      {assignment.totalSubmissions} Pengumpulan
                    </Badge>
                    <Badge palette={palette} variant="success">
                      <ClipboardList size={14} className="mr-1" />
                      {assignment.gradedSubmissions} Dinilai
                    </Badge>
                  </div>
                </>
              )}

              {!isLoading && !assignment && (
                <p className="text-sm" style={{ color: palette.silver2 }}>
                  Tugas tidak ditemukan untuk kelas ini.
                </p>
              )}
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
