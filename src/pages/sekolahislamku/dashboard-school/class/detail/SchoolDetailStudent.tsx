// src/pages/sekolahislamku/pages/students/SchoolDetailStudent.tsx
import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";

import {
  ArrowLeft,
  User,
  BookOpen,
  Users,
  CalendarDays,
  FileDown,
  ClipboardList,
} from "lucide-react";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

/* =========================================
   DUMMY SWITCH
   - Set true untuk tampilkan dummy bila API belum siap
========================================= */
const USE_DUMMY = true;

/* ========= Types ========= */
type ApiStudent = {
  id: string;
  nis?: string;
  name: string;
  gender?: "L" | "P";
  phone?: string;
  email?: string;
  class_name?: string;
  join_date?: string; // YYYY-MM-DD
  status?: "aktif" | "nonaktif" | string;
};

type ApiGrade = {
  id?: string;
  subject?: string;
  assessment?: string; // UH/PTS/PAS/Tugas/Praktik...
  score?: number; // 0..100
  weight?: number; // optional
  date?: string; // YYYY-MM-DD
  teacher_name?: string;
  semester?: string; // "2025-Ganjil", dll.
  note?: string;
};

type ApiAttendance = {
  id?: string;
  date?: string; // YYYY-MM-DD
  status?: "H" | "I" | "A"; // Hadir / Izin / Alpa
  lesson_title?: string;
  section_name?: string;
  teacher_name?: string;
  note?: string;
  semester?: string;
};

type ApiStudentNote = {
  id?: string;
  date?: string;
  note_type?: "akademik" | "sikap" | "disiplin" | "prestasi" | string;
  content?: string;
  author_name?: string;
  section_name?: string;
  semester?: string;
};

/* ========= API Resps ========= */
type ApiOneStudent = { data: ApiStudent; message?: string };
type ApiGradesResp =
  | { data: ApiGrade[]; message?: string }
  | { data: { items: ApiGrade[] }; message?: string };
type ApiAttendResp =
  | { data: ApiAttendance[]; message?: string }
  | { data: { items: ApiAttendance[] }; message?: string };
type ApiNotesResp =
  | { data: ApiStudentNote[]; message?: string }
  | { data: { items: ApiStudentNote[] }; message?: string };

/* ========= Helpers ========= */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

const shortDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

/* ========= Semester helpers ========= */
type SemesterKey =
  | "ALL"
  | "2025-Ganjil"
  | "2025-Genap"
  | "2026-Ganjil"
  | "2026-Genap";

const SEMESTER_RANGES: Record<
  Exclude<SemesterKey, "ALL">,
  { start: string; end: string }
> = {
  "2025-Ganjil": { start: "2025-07-01", end: "2025-12-31" },
  "2025-Genap": { start: "2026-01-01", end: "2026-06-30" },
  "2026-Ganjil": { start: "2026-07-01", end: "2026-12-31" },
  "2026-Genap": { start: "2027-01-01", end: "2027-06-30" },
};

const inRange = (iso: string, start: string, end: string) =>
  iso >= start && iso <= end;

/* ========= DUMMY ========= */
const DUMMY_STUDENT: ApiStudent = {
  id: "stu-1",
  nis: "2025-001",
  name: "Ahmad Fikri",
  gender: "L",
  phone: "0812-1111-2222",
  email: "ahmad@example.com",
  class_name: "Kelas A",
  join_date: "2025-07-15",
  status: "aktif",
};

const DUMMY_GRADES: ApiGrade[] = [
  {
    id: "g1",
    subject: "Al-Qur'an",
    assessment: "UH",
    score: 88,
    date: "2025-08-01",
    teacher_name: "Ust. Ridla",
    semester: "2025-Ganjil",
    note: "Makharij cukup baik.",
  },
  {
    id: "g2",
    subject: "Al-Qur'an",
    assessment: "PTS",
    score: 92,
    date: "2025-09-20",
    teacher_name: "Ust. Ridla",
    semester: "2025-Ganjil",
  },
  {
    id: "g3",
    subject: "Aqidah",
    assessment: "UH",
    score: 76,
    date: "2025-08-10",
    teacher_name: "Ust. Fulan",
    semester: "2025-Ganjil",
  },
  {
    id: "g4",
    subject: "Fiqih",
    assessment: "Tugas",
    score: 95,
    date: "2025-08-25",
    teacher_name: "Ust. Fulan",
    semester: "2025-Ganjil",
    note: "Tugas lengkap & rapi.",
  },
];

const DUMMY_ATTENDS: ApiAttendance[] = [
  {
    id: "a1",
    date: "2025-08-01",
    status: "H",
    lesson_title: "Tahsin",
    section_name: "Kelas A",
    teacher_name: "Ust. Ridla",
    semester: "2025-Ganjil",
  },
  {
    id: "a2",
    date: "2025-08-03",
    status: "I",
    lesson_title: "Tahfizh",
    section_name: "Kelas A",
    teacher_name: "Ust. Ridla",
    semester: "2025-Ganjil",
    note: "Sakit",
  },
  {
    id: "a3",
    date: "2025-08-07",
    status: "H",
    lesson_title: "Adab",
    section_name: "Kelas A",
    teacher_name: "Ust. Ridla",
    semester: "2025-Ganjil",
  },
  {
    id: "a4",
    date: "2025-08-10",
    status: "A",
    lesson_title: "Fiqih",
    section_name: "Kelas A",
    teacher_name: "Ust. Fulan",
    semester: "2025-Ganjil",
  },
];

const DUMMY_NOTES: ApiStudentNote[] = [
  {
    id: "n1",
    date: "2025-08-05",
    note_type: "akademik",
    content: "Perlu memperbanyak latihan bacaan huruf qalqalah.",
    author_name: "Ust. Ridla",
    section_name: "Kelas A",
    semester: "2025-Ganjil",
  },
  {
    id: "n2",
    date: "2025-08-12",
    note_type: "sikap",
    content: "Sangat membantu teman, aktif bertanya.",
    author_name: "Ust. Fulan",
    section_name: "Kelas A",
    semester: "2025-Ganjil",
  },
];

/* ========= Fetchers (fallback ke dummy) ========= */
async function fetchStudent(studentId: string): Promise<ApiStudent | null> {
  if (USE_DUMMY) return DUMMY_STUDENT;
  const tries = [
    `/api/a/students/${studentId}`,
    `/api/a/student/${studentId}`,
    `/api/a/students?id=${studentId}`,
  ];
  for (const url of tries) {
    try {
      const r = await axios.get<ApiOneStudent>(url);
      if (r.data?.data) return r.data.data;
    } catch {}
  }
  return null;
}

async function fetchStudentGrades(studentId: string): Promise<ApiGrade[]> {
  if (USE_DUMMY) return DUMMY_GRADES;
  const tries: Array<{ url: string; params?: any }> = [
    { url: "/api/a/student-grades", params: { student_id: studentId } },
    { url: "/api/a/grades", params: { student_id: studentId } },
  ];
  for (const t of tries) {
    try {
      const r = await axios.get<ApiGradesResp>(t.url, { params: t.params });
      const d: any = r.data?.data;
      if (Array.isArray(d)) return d;
      if (d?.items && Array.isArray(d.items)) return d.items;
    } catch {}
  }
  return [];
}

async function fetchStudentAttendance(
  studentId: string
): Promise<ApiAttendance[]> {
  if (USE_DUMMY) return DUMMY_ATTENDS;
  const tries: Array<{ url: string; params?: any }> = [
    { url: "/api/a/student-attendances", params: { student_id: studentId } },
    { url: "/api/a/attendances", params: { student_id: studentId } },
  ];
  for (const t of tries) {
    try {
      const r = await axios.get<ApiAttendResp>(t.url, { params: t.params });
      const d: any = r.data?.data;
      if (Array.isArray(d)) return d;
      if (d?.items && Array.isArray(d.items)) return d.items;
    } catch {}
  }
  return [];
}

async function fetchStudentNotes(studentId: string): Promise<ApiStudentNote[]> {
  if (USE_DUMMY) return DUMMY_NOTES;
  const tries: Array<{ url: string; params?: any }> = [
    { url: "/api/a/student-notes", params: { student_id: studentId } },
    { url: "/api/a/notes", params: { student_id: studentId, type: "student" } },
  ];
  for (const t of tries) {
    try {
      const r = await axios.get<ApiNotesResp>(t.url, { params: t.params });
      const d: any = r.data?.data;
      if (Array.isArray(d)) return d;
      if (d?.items && Array.isArray(d.items)) return d.items;
    } catch {}
  }
  return [];
}

/* ========= CSV helper ========= */
function toCsv(rows: any[], headers: Record<string, string>) {
  const cols = Object.keys(headers);
  const head = cols.map((c) => JSON.stringify(headers[c] ?? c)).join(",");
  const body = rows
    .map((r) =>
      cols
        .map((c) => {
          const v = r?.[c] ?? "";
          return JSON.stringify(String(v ?? ""));
        })
        .join(",")
    )
    .join("\n");
  return head + "\n" + body;
}
function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ========= Page ========= */
export default function SchoolDetailStudent() {
  const { id: studentId = "" } = useParams<{ id: string }>();
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;
  const nav = useNavigate();

  const [semester, setSemester] = useState<SemesterKey>("ALL");
  const [subjectFilter, setSubjectFilter] = useState("");

  const studentQ = useQuery({
    queryKey: ["student", studentId, USE_DUMMY],
    enabled: !!studentId,
    queryFn: () => fetchStudent(studentId),
    staleTime: 60_000,
  });

  const gradesQ = useQuery({
    queryKey: ["student-grades", studentId, USE_DUMMY],
    enabled: !!studentId,
    queryFn: () => fetchStudentGrades(studentId),
    staleTime: 30_000,
  });

  const attendsQ = useQuery({
    queryKey: ["student-attendance", studentId, USE_DUMMY],
    enabled: !!studentId,
    queryFn: () => fetchStudentAttendance(studentId),
    staleTime: 30_000,
  });

  const notesQ = useQuery({
    queryKey: ["student-notes", studentId, USE_DUMMY],
    enabled: !!studentId,
    queryFn: () => fetchStudentNotes(studentId),
    staleTime: 30_000,
  });

  const student = studentQ.data ?? undefined;
  const rawGrades = useMemo(() => gradesQ.data ?? [], [gradesQ.data]);
  const rawAttends = useMemo(() => attendsQ.data ?? [], [attendsQ.data]);
  const rawNotes = useMemo(() => notesQ.data ?? [], [notesQ.data]);

  // Filter by semester (and subject for grades)
  const grades = useMemo(() => {
    let rows = rawGrades;
    if (semester !== "ALL") {
      const range = SEMESTER_RANGES[semester];
      rows = rows.filter((g) => {
        if (g.date) return inRange(g.date, range.start, range.end);
        if (g.semester) return g.semester === semester;
        return true;
      });
    }
    if (subjectFilter.trim()) {
      const q = subjectFilter.trim().toLowerCase();
      rows = rows.filter((g) => (g.subject ?? "").toLowerCase().includes(q));
    }
    return rows.sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? -1 : 1));
  }, [rawGrades, semester, subjectFilter]);

  const attends = useMemo(() => {
    if (semester === "ALL") {
      return [...rawAttends].sort((a, b) =>
        (a.date ?? "") < (b.date ?? "") ? -1 : 1
      );
    }
    const range = SEMESTER_RANGES[semester];
    const rows = rawAttends.filter((a) => {
      if (a.date) return inRange(a.date, range.start, range.end);
      if (a.semester) return a.semester === semester;
      return true;
    });
    return rows.sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? -1 : 1));
  }, [rawAttends, semester]);

  const notes = useMemo(() => {
    if (semester === "ALL") {
      return [...rawNotes].sort((a, b) =>
        (a.date ?? "") < (b.date ?? "") ? -1 : 1
      );
    }
    const range = SEMESTER_RANGES[semester];
    const rows = rawNotes.filter((n) => {
      if (n.date) return inRange(n.date, range.start, range.end);
      if (n.semester) return n.semester === semester;
      return true;
    });
    return rows.sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? -1 : 1));
  }, [rawNotes, semester]);

  // Stats
  const stats = useMemo(() => {
    const countGrades = grades.length;
    const avg =
      countGrades > 0
        ? Math.round(
            (grades.reduce((s, g) => s + (g.score ?? 0), 0) / countGrades) * 10
          ) / 10
        : 0;
    const totalAttend = attends.length;
    let h = 0,
      i = 0,
      a = 0;
    attends.forEach((x) => {
      if (x.status === "H") h++;
      else if (x.status === "I") i++;
      else if (x.status === "A") a++;
    });
    const presentPct =
      totalAttend > 0 ? Math.round((h / totalAttend) * 1000) / 10 : 0;
    return { countGrades, avg, totalAttend, h, i, a, presentPct };
  }, [grades, attends]);

  const exportGradesCsv = () => {
    const csv = toCsv(
      grades.map((g) => ({
        date: g.date ?? "",
        subject: g.subject ?? "",
        assessment: g.assessment ?? "",
        score: g.score ?? "",
        weight: g.weight ?? "",
        teacher: g.teacher_name ?? "",
        semester: g.semester ?? "",
        note: g.note ?? "",
      })),
      {
        date: "Tanggal",
        subject: "Mata Pelajaran",
        assessment: "Jenis",
        score: "Nilai",
        weight: "Bobot",
        teacher: "Pengajar",
        semester: "Semester",
        note: "Catatan",
      }
    );
    downloadCsv(`nilai_${student?.name ?? "siswa"}_${semester}.csv`, csv);
  };

  const exportAttendCsv = () => {
    const csv = toCsv(
      attends.map((a) => ({
        date: a.date ?? "",
        status: a.status ?? "",
        lesson: a.lesson_title ?? "",
        section: a.section_name ?? "",
        teacher: a.teacher_name ?? "",
        semester: a.semester ?? "",
        note: a.note ?? "",
      })),
      {
        date: "Tanggal",
        status: "Status",
        lesson: "Materi/Pertemuan",
        section: "Kelas",
        teacher: "Pengajar",
        semester: "Semester",
        note: "Catatan",
      }
    );
    downloadCsv(`absensi_${student?.name ?? "siswa"}_${semester}.csv`, csv);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Topbar */}
      <ParentTopBar
        palette={palette}
        title="Detail Siswa"
        gregorianDate={new Date().toISOString()}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />

          <div className="flex-1 space-y-6 min-w-0 lg:p-4">
            {/* Header */}
            <section className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Btn
                  palette={palette}
                  variant="outline"
                  onClick={() => nav(-1)}
                >
                  <ArrowLeft className="mr-2" size={16} />
                  Kembali
                </Btn>
                <div className="ml-2">
                  <div className="text-lg font-semibold">
                    {student?.name ?? "Siswa"}
                  </div>
                  <div className="text-xs" style={{ color: palette.silver2 }}>
                    NIS: {student?.nis ?? "-"} • {student?.class_name ?? "-"} •{" "}
                    {student?.status ?? "-"}
                  </div>
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: palette.silver2 }}>
                  Semester
                </span>
                <select
                  className="text-sm rounded-md border px-2 py-1"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                    color: palette.black1,
                  }}
                  value={semester}
                  onChange={(e) => setSemester(e.target.value as SemesterKey)}
                >
                  <option value="ALL">Semua Semester</option>
                  <option value="2025-Ganjil">2025 • Ganjil</option>
                  <option value="2025-Genap">2025 • Genap</option>
                  <option value="2026-Ganjil">2026 • Ganjil</option>
                  <option value="2026-Genap">2026 • Genap</option>
                </select>
              </div>
            </section>

            {/* Ringkasan Profil & Statistik */}
            <SectionCard palette={palette}>
              <div className="p-4 grid gap-3 md:grid-cols-3">
                {/* Profil */}
                <div className="flex items-center gap-3">
                  <span
                    className="h-10 w-10 grid place-items-center rounded-xl"
                    style={{
                      background: palette.primary2,
                      color: palette.primary,
                    }}
                  >
                    <User size={18} />
                  </span>
                  <div>
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      Biodata
                    </div>
                    <div className="font-medium">{student?.name ?? "-"}</div>
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      {student?.gender ?? "-"} • {student?.phone ?? "-"}{" "}
                      {student?.email ? (
                        <>
                          •{" "}
                          <a
                            href={`mailto:${student.email}`}
                            className="underline"
                            style={{ color: palette.primary }}
                          >
                            Email
                          </a>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Kelas & Tanggal Gabung */}
                <div className="flex items-center gap-3">
                  <span
                    className="h-10 w-10 grid place-items-center rounded-xl"
                    style={{
                      background: palette.primary2,
                      color: palette.primary,
                    }}
                  >
                    <CalendarDays size={18} />
                  </span>
                  <div>
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      Kelas & Mulai Belajar
                    </div>
                    <div className="font-medium">
                      {student?.class_name ?? "-"}
                    </div>
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      {student?.join_date ? shortDate(student.join_date) : "-"}
                    </div>
                  </div>
                </div>

                {/* Statistik */}
                <div className="flex items-center gap-3">
                  <span
                    className="h-10 w-10 grid place-items-center rounded-xl"
                    style={{
                      background: palette.primary2,
                      color: palette.primary,
                    }}
                  >
                    <ClipboardList size={18} />
                  </span>
                  <div>
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      Ringkasan ({semester === "ALL" ? "Semua" : semester})
                    </div>
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      Nilai:{" "}
                      <span
                        className="font-medium"
                        style={{ color: palette.black1 }}
                      >
                        {stats.avg}
                      </span>{" "}
                      ({stats.countGrades} penilaian)
                    </div>
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      Absensi:{" "}
                      <span
                        className="font-medium"
                        style={{ color: palette.black1 }}
                      >
                        {stats.h} H • {stats.i} I • {stats.a} A
                      </span>{" "}
                      ({stats.presentPct}% hadir dari {stats.totalAttend}{" "}
                      pertemuan)
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Nilai */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 flex items-center justify-between">
                <div className="font-medium flex items-center gap-2">
                  <BookOpen size={18} /> Nilai Siswa
                </div>
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Filter mata pelajaran…"
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="text-sm rounded-md border px-2 py-1"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white1,
                      color: palette.black1,
                    }}
                  />
                  <Btn
                    palette={palette}
                    variant="outline"
                    onClick={exportGradesCsv}
                  >
                    <FileDown className="mr-2" size={16} /> Unduh CSV
                  </Btn>
                </div>
              </div>

              <div className="px-4 md:px-5 pb-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead
                    className="text-left border-b"
                    style={{
                      color: palette.silver2,
                      borderColor: palette.silver1,
                    }}
                  >
                    <tr>
                      <th className="py-2 pr-4">Tanggal</th>
                      <th className="py-2 pr-4">Mata Pelajaran</th>
                      <th className="py-2 pr-4">Jenis</th>
                      <th className="py-2 pr-4">Nilai</th>
                      <th className="py-2 pr-4">Pengajar</th>
                      <th className="py-2 pr-4">Semester</th>
                      <th className="py-2 pr-4">Catatan</th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: palette.silver1 }}
                  >
                    {grades.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-6 text-center"
                          style={{ color: palette.silver2 }}
                        >
                          Belum ada data nilai.
                        </td>
                      </tr>
                    ) : (
                      grades.map((g) => (
                        <tr
                          key={g.id ?? crypto.randomUUID()}
                          className="align-middle"
                        >
                          <td className="py-3 pr-4">
                            {g.date ? shortDate(g.date) : "-"}
                          </td>
                          <td className="py-3 pr-4 font-medium">
                            {g.subject ?? "-"}
                          </td>
                          <td className="py-3 pr-4">{g.assessment ?? "-"}</td>
                          <td className="py-3 pr-4">
                            <Badge
                              palette={palette}
                              variant={
                                g.score !== undefined && g.score >= 90
                                  ? "success"
                                  : "outline"
                              }
                            >
                              {g.score ?? "-"}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">{g.teacher_name ?? "-"}</td>
                          <td className="py-3 pr-4">{g.semester ?? "-"}</td>
                          <td className="py-3 pr-4">{g.note ?? "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div
                  className="pt-3 text-xs"
                  style={{ color: palette.silver2 }}
                >
                  Menampilkan {grades.length} baris nilai
                </div>
              </div>
            </SectionCard>

            {/* Absensi */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 flex items-center justify-between">
                <div className="font-medium flex items-center gap-2">
                  <Users size={18} /> Absensi Siswa
                </div>
                <Btn
                  palette={palette}
                  variant="outline"
                  onClick={exportAttendCsv}
                >
                  <FileDown className="mr-2" size={16} /> Unduh CSV
                </Btn>
              </div>

              <div className="px-4 md:px-5 pb-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead
                    className="text-left border-b"
                    style={{
                      color: palette.silver2,
                      borderColor: palette.silver1,
                    }}
                  >
                    <tr>
                      <th className="py-2 pr-4">Tanggal</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Materi/Pertemuan</th>
                      <th className="py-2 pr-4">Kelas</th>
                      <th className="py-2 pr-4">Pengajar</th>
                      <th className="py-2 pr-4">Semester</th>
                      <th className="py-2 pr-4">Catatan</th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: palette.silver1 }}
                  >
                    {attends.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-6 text-center"
                          style={{ color: palette.silver2 }}
                        >
                          Belum ada data absensi.
                        </td>
                      </tr>
                    ) : (
                      attends.map((a) => (
                        <tr
                          key={a.id ?? crypto.randomUUID()}
                          className="align-middle"
                        >
                          <td className="py-3 pr-4">
                            {a.date ? dateLong(a.date) : "-"}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              palette={palette}
                              variant={
                                a.status === "H"
                                  ? "success"
                                  : a.status === "I"
                                    ? "outline"
                                    : "outline"
                              }
                            >
                              {a.status ?? "-"}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">{a.lesson_title ?? "-"}</td>
                          <td className="py-3 pr-4">{a.section_name ?? "-"}</td>
                          <td className="py-3 pr-4">{a.teacher_name ?? "-"}</td>
                          <td className="py-3 pr-4">{a.semester ?? "-"}</td>
                          <td className="py-3 pr-4">{a.note ?? "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div
                  className="pt-3 text-xs"
                  style={{ color: palette.silver2 }}
                >
                  Menampilkan {attends.length} baris absensi
                </div>
              </div>
            </SectionCard>

            {/* Catatan */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 font-medium flex items-center gap-2">
                <ClipboardList size={18} /> Catatan Pembelajaran
              </div>

              <div className="px-4 md:px-5 pb-4">
                {notes.length === 0 ? (
                  <div
                    className="py-6 text-center text-sm"
                    style={{ color: palette.silver2 }}
                  >
                    Belum ada catatan.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {notes.map((n) => (
                      <li
                        key={n.id ?? crypto.randomUUID()}
                        className="rounded-xl border p-3"
                        style={{
                          borderColor: palette.silver1,
                          background: palette.white1,
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Badge palette={palette} variant="outline">
                              {n.note_type ?? "catatan"}
                            </Badge>
                            <span
                              className="text-xs"
                              style={{ color: palette.silver2 }}
                            >
                              {n.date ? shortDate(n.date) : "-"} •{" "}
                              {n.section_name ?? "-"}
                            </span>
                          </div>
                          <span
                            className="text-xs"
                            style={{ color: palette.silver2 }}
                          >
                            {n.author_name ?? "-"}
                          </span>
                        </div>
                        <div className="mt-2 text-sm">{n.content ?? "-"}</div>
                      </li>
                    ))}
                  </ul>
                )}

                <div
                  className="pt-3 text-xs"
                  style={{ color: palette.silver2 }}
                >
                  Menampilkan {notes.length} catatan
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
