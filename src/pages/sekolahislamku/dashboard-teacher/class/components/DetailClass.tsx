// src/pages/sekolahislamku/teacher/DetailClass.tsx
import { useMemo } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { pickTheme, ThemeName } from "@/constants/thema";

import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

import {
  Users,
  CalendarDays,
  Clock,
  ClipboardList,
  BookOpen,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

/* ========= Shared helpers ========= */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};
const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    : "-";

const hijriLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

/* ========= Types ========= */
type NextSession = {
  dateISO: string;
  time: string;
  title: string;
  room?: string;
};

type TeacherClassSummary = {
  id: string;
  name: string;
  room?: string;
  homeroom: string;
  assistants?: string[];
  studentsCount: number;
  todayAttendance: Record<AttendanceStatus, number>;
  nextSession?: NextSession;
  materialsCount: number;
  assignmentsCount: number;
  academicTerm: string;
  cohortYear: number;
};

/* ========= Ambil data siswa per kelas dari shared types ========= */
import {
  fetchStudentsByClasses,
  type ClassStudentsMap,
  type StudentSummary,
} from "../types/teacherClass";

/* ========= Dummy fetch kelas (tetap sama; ganti dengan API nyata jika ada) ========= */
async function fetchTeacherClasses(): Promise<TeacherClassSummary[]> {
  const now = new Date();
  const mk = (d: Date, addDay = 0) => {
    const x = new Date(d);
    x.setDate(x.getDate() + addDay);
    return x.toISOString();
  };

  return Promise.resolve([
    {
      id: "tpa-a",
      name: "TPA A",
      room: "Aula 1",
      homeroom: "Ustadz Abdullah",
      assistants: ["Ustadzah Amina"],
      studentsCount: 22,
      todayAttendance: { hadir: 18, online: 1, sakit: 1, izin: 1, alpa: 1 },
      nextSession: {
        dateISO: mk(now, 0),
        time: "07:30",
        title: "Tahsin — Tajwid & Makhraj",
        room: "Aula 1",
      },
      materialsCount: 12,
      assignmentsCount: 4,
      academicTerm: "2025/2026 — Ganjil",
      cohortYear: 2025,
    },
    {
      id: "tpa-b",
      name: "TPA B",
      room: "R. Tahfiz",
      homeroom: "Ustadz Salman",
      assistants: ["Ustadzah Maryam"],
      studentsCount: 20,
      todayAttendance: { hadir: 15, online: 2, sakit: 1, izin: 1, alpa: 1 },
      nextSession: {
        dateISO: mk(now, 1),
        time: "09:30",
        title: "Hafalan Juz 30",
        room: "R. Tahfiz",
      },
      materialsCount: 9,
      assignmentsCount: 3,
      academicTerm: "2025/2026 — Ganjil",
      cohortYear: 2025,
    },
    {
      id: "tpa-c",
      name: "TPA C",
      room: "Aula 2",
      homeroom: "Ustadz Abu Bakar",
      assistants: [],
      studentsCount: 18,
      todayAttendance: { hadir: 14, online: 0, sakit: 2, izin: 1, alpa: 1 },
      nextSession: {
        dateISO: mk(now, 2),
        time: "08:00",
        title: "Latihan Makhraj",
        room: "Aula 2",
      },
      materialsCount: 7,
      assignmentsCount: 2,
      academicTerm: "2024/2025 — Genap",
      cohortYear: 2024,
    },
    // ...dst (tetap)
  ]);
}

/* ========= Query Keys ========= */
const QK = {
  CLASSES: ["teacher-classes-list"] as const,
  CLASS_STUDENTS: (id: string) => ["teacher-class-students", id] as const,
};

/* =================== Page =================== */
export default function DetailClass() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { academicTerm?: string; cohortYear?: number };
  };

  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  // 1) Kelas (pakai cache sama dgn list)
  const {
    data: classes = [],
    isLoading: isLoadingClasses,
    isFetching: isFetchingClasses,
  } = useQuery({
    queryKey: QK.CLASSES,
    queryFn: fetchTeacherClasses,
    staleTime: 5 * 60_000,
  });

  const cls = useMemo(() => classes.find((c) => c.id === id), [classes, id]);

  // 2) Siswa per kelas (id aktif)
  const {
    data: studentsMap = {},
    isFetching: isFetchingStudents,
    isLoading: isLoadingStudents,
  } = useQuery({
    queryKey: QK.CLASS_STUDENTS(id),
    queryFn: () => fetchStudentsByClasses(id ? [id] : []),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });

  const students: StudentSummary[] =
    (studentsMap as ClassStudentsMap)[id] ?? [];

  // 3) Hitung angka
  const todayISO = toLocalNoonISO(new Date());
  const fallbackTotal = cls?.studentsCount ?? 0;
  const total = students.length || fallbackTotal;
  const hadir = cls?.todayAttendance.hadir ?? 0;
  const pct = total > 0 ? Math.round((hadir / total) * 100) : 0;

  const loadingAny = isLoadingClasses || isLoadingStudents;
  const fetchingAny = isFetchingClasses || isFetchingStudents;

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={cls ? `Kelas: ${cls.name}` : "Kelas"}
        gregorianDate={todayISO}
        hijriDate={hijriLong(todayISO)}
        dateFmt={dateLong}
        showBack
      />

      <main className="w-full px-4 md:px-6  md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            <div className="md:flex hidden gap-3 items-center">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
                className="gap-1"
              >
                <ArrowLeft size={20} />
              </Btn>
              <h1 className="textlg font-semibold">Detai Kelas</h1>
            </div>

            {/* Header */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div
                    className="text-lg md:text-xl font-semibold"
                    style={{ color: palette.black2 }}
                  >
                    {cls?.name ?? (loadingAny ? "Memuat…" : "—")}
                  </div>
                  <div
                    className="mt-1 flex flex-wrap items-center gap-2 text-sm"
                    style={{ color: palette.black2 }}
                  >
                    <Badge variant="outline" palette={palette}>
                      {cls?.room ?? "-"}
                    </Badge>
                    <span>Wali Kelas: {cls?.homeroom ?? "-"}</span>
                    {cls?.assistants?.length ? (
                      <span title={cls.assistants.join(", ")}>
                        • Asisten: {cls.assistants.join(", ")}
                      </span>
                    ) : null}
                    <span>
                      •{" "}
                      {cls?.academicTerm ?? location.state?.academicTerm ?? "-"}
                    </span>
                    <span>
                      • Angkatan{" "}
                      {cls?.cohortYear ?? location.state?.cohortYear ?? "-"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Link to="absensi">
                    <Btn palette={palette} size="sm" variant="secondary">
                      Absensi <ChevronRight size={16} className="ml-1" />
                    </Btn>
                  </Link>
                  <Link to="materi">
                    <Btn palette={palette} size="sm" variant="outline">
                      <BookOpen size={16} className="mr-1" />
                      Materi
                    </Btn>
                  </Link>

                  <Link to="tugas">
                    <Btn palette={palette} size="sm" variant="outline">
                      <ClipboardList size={16} className="mr-1" />
                      Tugas
                    </Btn>
                  </Link>
                </div>
              </div>
            </SectionCard>

            {/* Stat ringkas */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Jumlah Siswa — pakai total aktual */}
              <SectionCard palette={palette} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm" style={{ color: palette.black2 }}>
                      Jumlah Siswa
                    </div>
                    <div className="text-xl font-semibold">
                      {fetchingAny ? "…" : total || "—"}
                    </div>
                    {/* Info kecil jika masih pakai fallback */}
                    {students.length === 0 && fallbackTotal > 0 && (
                      <div
                        className="text-sm mt-0.5"
                        style={{ color: palette.black2 }}
                      >
                        (fallback: {fallbackTotal})
                      </div>
                    )}
                  </div>
                  <Users size={18} />
                </div>
              </SectionCard>

              {/* Kehadiran */}
              <SectionCard palette={palette} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm" style={{ color: palette.black2 }}>
                      Kehadiran Hari Ini
                    </div>
                    <div className="text-xl font-semibold">
                      {hadir}/{total || 0} ({pct}%)
                    </div>
                  </div>
                  <ClipboardList size={18} />
                </div>
              </SectionCard>

              {/* Materi/Tugas */}
              <SectionCard palette={palette} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm" style={{ color: palette.black2 }}>
                      Materi • Tugas
                    </div>
                    <div className="text-xl font-semibold">
                      {cls?.materialsCount ?? 0} • {cls?.assignmentsCount ?? 0}
                    </div>
                  </div>
                  <BookOpen size={18} />
                </div>
              </SectionCard>
            </section>

            {/* Kehadiran breakdown */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5">
                <div className="text-sm mb-2" style={{ color: palette.black2 }}>
                  Ringkasan Kehadiran Hari Ini
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <Badge
                    palette={palette}
                    variant="success"
                    className="justify-center"
                  >
                    Hadir: {cls?.todayAttendance.hadir ?? 0}
                  </Badge>
                  <Badge
                    palette={palette}
                    variant="info"
                    className="justify-center"
                  >
                    Online: {cls?.todayAttendance.online ?? 0}
                  </Badge>
                  <Badge
                    palette={palette}
                    variant="warning"
                    className="justify-center"
                  >
                    Sakit: {cls?.todayAttendance.sakit ?? 0}
                  </Badge>
                  <Badge
                    palette={palette}
                    variant="secondary"
                    className="justify-center"
                  >
                    Izin: {cls?.todayAttendance.izin ?? 0}
                  </Badge>
                  <Badge
                    palette={palette}
                    variant="destructive"
                    className="justify-center"
                  >
                    Alpa: {cls?.todayAttendance.alpa ?? 0}
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div
                    className="h-2 w-full rounded-full overflow-hidden"
                    style={{ background: palette.white2 }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${pct}%`,
                        background: palette.secondary,
                      }}
                    />
                  </div>
                  <div
                    className="mt-1 text-sm"
                    style={{ color: palette.black2 }}
                  >
                    {hadir}/{total || 0} hadir • {pct}%
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Jadwal terdekat */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5">
                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                  <CalendarDays size={16} /> Jadwal Terdekat
                </div>
                {cls?.nextSession ? (
                  <div
                    className="rounded-xl border p-3"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white1,
                    }}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} />
                      <span>
                        {dateShort(cls.nextSession.dateISO)} •{" "}
                        {cls.nextSession.time}
                      </span>
                    </div>
                    <div className="mt-1 text-sm">
                      {cls.nextSession.title}
                      {cls.nextSession.room ? ` • ${cls.nextSession.room}` : ""}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Belum ada jadwal.
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Loading / Error state ringan */}
            {loadingAny && (
              <div className="text-sm" style={{ color: palette.silver2 }}>
                Memuat detail kelas…
              </div>
            )}
            {!loadingAny && !cls && (
              <SectionCard palette={palette}>
                <div className="p-6 text-sm" style={{ color: palette.silver2 }}>
                  Kelas tidak ditemukan.
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
