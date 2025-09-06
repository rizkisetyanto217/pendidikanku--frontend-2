// src/pages/sekolahislamku/teacher/TeacherClassesList.tsx
import { useMemo, useState, useDeferredValue } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

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
  Search,
  Filter,
  ChevronRight,
  LayoutList,
  LayoutGrid,
  MapPin,
  GraduationCap,
} from "lucide-react";

import {
  fetchStudentsByClasses,
  type ClassStudentsMap,
  type StudentSummary,
} from "./types/teacherClass";

/* ==============================
   Types & Constants
============================== */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

type NextSession = {
  dateISO: string;
  time: string;
  title: string;
  room?: string;
};

export type TeacherClassSummary = {
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
  academicTerm: string; // contoh: "2025/2026 — Ganjil"
  cohortYear: number; // contoh: 2025 (angkatan masuk)
};

type ViewMode = "detailed" | "simple";

const QK = {
  LIST: ["teacher-classes-list"] as const,
  STUDENTS: (ids: string[]) => ["teacher-class-students", ids] as const,
};

/* ==============================
   Helpers (format & dates)
============================== */
const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
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

/* ==============================
   FIXED DATA - Dibekukan secara statis
============================== */
// Bekukan tanggal hari ini
const TODAY_FIXED = atLocalNoon(new Date("2025-09-02")); // Tanggal statis untuk konsistensi
const TODAY_ISO = TODAY_FIXED.toISOString();

// Bekukan tanggal-tanggal untuk jadwal
const TOMORROW_ISO = (() => {
  const tomorrow = new Date(TODAY_FIXED);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString();
})();

const DAY_AFTER_TOMORROW_ISO = (() => {
  const dayAfter = new Date(TODAY_FIXED);
  dayAfter.setDate(dayAfter.getDate() + 2);
  return dayAfter.toISOString();
})();

const THREE_DAYS_LATER_ISO = (() => {
  const threeDays = new Date(TODAY_FIXED);
  threeDays.setDate(threeDays.getDate() + 3);
  return threeDays.toISOString();
})();

// Data kelas yang dibekukan sepenuhnya
const TEACHER_CLASSES_FIXED: TeacherClassSummary[] = [
  {
    id: "tpa-a",
    name: "TPA A",
    room: "Aula 1",
    homeroom: "Ustadz Abdullah",
    assistants: ["Ustadzah Amina"],
    studentsCount: 22,
    todayAttendance: { hadir: 18, online: 1, sakit: 1, izin: 1, alpa: 1 },
    nextSession: {
      dateISO: TODAY_ISO,
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
      dateISO: TOMORROW_ISO,
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
      dateISO: DAY_AFTER_TOMORROW_ISO,
      time: "08:00",
      title: "Latihan Makhraj",
      room: "Aula 2",
    },
    materialsCount: 7,
    assignmentsCount: 2,
    academicTerm: "2024/2025 — Genap",
    cohortYear: 2024,
  },
  {
    id: "pra-tahfiz",
    name: "Pra-Tahfiz",
    room: "R. 101",
    homeroom: "Ustadzah Khadijah",
    assistants: ["Ustadzah Siti"],
    studentsCount: 25,
    todayAttendance: { hadir: 20, online: 1, sakit: 1, izin: 2, alpa: 1 },
    nextSession: {
      dateISO: TODAY_ISO,
      time: "10:30",
      title: "Pengenalan Hafalan",
      room: "R. 101",
    },
    materialsCount: 5,
    assignmentsCount: 1,
    academicTerm: "2025/2026 — Ganjil",
    cohortYear: 2025,
  },
  {
    id: "tahsin-lanjutan",
    name: "Tahsin Lanjutan",
    room: "Lab Bahasa",
    homeroom: "Ustadz Zaid",
    assistants: [],
    studentsCount: 16,
    todayAttendance: { hadir: 12, online: 1, sakit: 0, izin: 2, alpa: 1 },
    nextSession: {
      dateISO: THREE_DAYS_LATER_ISO,
      time: "13:00",
      title: "Mad Thabi'i (contoh & latihan)",
      room: "Lab Bahasa",
    },
    materialsCount: 14,
    assignmentsCount: 5,
    academicTerm: "2024/2025 — Genap",
    cohortYear: 2023,
  },
  {
    id: "tahfiz-juz-29",
    name: "Tahfiz Juz 29",
    room: "R. Tahfiz",
    homeroom: "Ustadz Umar",
    assistants: ["Ustadz Ali"],
    studentsCount: 19,
    todayAttendance: { hadir: 16, online: 0, sakit: 1, izin: 1, alpa: 1 },
    nextSession: {
      dateISO: TOMORROW_ISO,
      time: "15:30",
      title: "Setoran An-Naba 1–10",
      room: "R. Tahfiz",
    },
    materialsCount: 11,
    assignmentsCount: 3,
    academicTerm: "2025/2026 — Ganjil",
    cohortYear: 2024,
  },
];

/* ==============================
   Fake API (pure & deterministic)
============================== */
async function fetchTeacherClasses(): Promise<TeacherClassSummary[]> {
  // Kembalikan salinan yang sama setiap kali
  return Promise.resolve(TEACHER_CLASSES_FIXED.map((x) => ({ ...x })));
}

/* ==============================
   Hooks
============================== */
function useTeacherClasses() {
  return useQuery({
    queryKey: QK.LIST,
    queryFn: fetchTeacherClasses,
    // Bekukan data di cache (tidak pernah refetch otomatis)
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

function useClassStudents(classIds: string[]) {
  return useQuery({
    queryKey: QK.STUDENTS(classIds),
    queryFn: () => fetchStudentsByClasses(classIds),
    enabled: classIds.length > 0,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

function useClassFilters(classes: TeacherClassSummary[]) {
  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q);
  const [room, setRoom] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "students" | "time">("name");
  const [term, setTerm] = useState<string>("all");
  const [cohort, setCohort] = useState<string>("all");

  const rooms = useMemo(() => {
    const r = Array.from(new Set(classes.map((c) => c.room).filter(Boolean)));
    return ["all", ...r] as string[];
  }, [classes]);

  const terms = useMemo(() => {
    const t = Array.from(new Set(classes.map((c) => c.academicTerm)));
    return ["all", ...t];
  }, [classes]);

  const cohorts = useMemo(() => {
    const ys = Array.from(new Set(classes.map((c) => c.cohortYear))).sort(
      (a, b) => b - a
    );
    return ["all", ...ys.map(String)];
  }, [classes]);

  const filtered = useMemo(() => {
    let list = classes;

    if (room !== "all") {
      list = list.filter((c) => (c.room ?? "") === room);
    }
    if (term !== "all") {
      list = list.filter((c) => c.academicTerm === term);
    }
    if (cohort !== "all") {
      const y = Number(cohort);
      list = list.filter((c) => c.cohortYear === y);
    }

    const qq = deferredQ.trim().toLowerCase();
    if (qq) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(qq) ||
          c.homeroom.toLowerCase().includes(qq) ||
          c.academicTerm.toLowerCase().includes(qq) ||
          String(c.cohortYear).includes(qq)
      );
    }

    list = [...list].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "students") return b.studentsCount - a.studentsCount;

      const at =
        a.nextSession?.dateISO && a.nextSession?.time
          ? new Date(`${a.nextSession.dateISO}`).getTime() +
            Number(a.nextSession.time.replace(":", ""))
          : Number.MAX_SAFE_INTEGER;
      const bt =
        b.nextSession?.dateISO && b.nextSession?.time
          ? new Date(`${b.nextSession.dateISO}`).getTime() +
            Number(b.nextSession.time.replace(":", ""))
          : Number.MAX_SAFE_INTEGER;
      return at - bt;
    });

    return list;
  }, [classes, deferredQ, room, sortBy, term, cohort]);

  return {
    q,
    setQ,
    room,
    setRoom,
    sortBy,
    setSortBy,
    term,
    setTerm,
    cohort,
    setCohort,
    rooms,
    terms,
    cohorts,
    filtered,
  };
}

/* ==============================
   Small UI Components (UI tetap sama)
============================== */
function ViewModeToggle({
  palette,
  value,
  onChange,
}: {
  palette: Palette;
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div
      className="rounded-xl border p-1 flex shadow-sm"
      style={{
        borderColor: palette.silver1,
        background: palette.white1,
      }}
      aria-label="Mode tampilan"
    >
      <button
        onClick={() => onChange("detailed")}
        className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:scale-105"
        style={{
          background: value === "detailed" ? palette.primary : "transparent",
          color: value === "detailed" ? palette.white1 : palette.black1,
          boxShadow:
            value === "detailed" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
        }}
        title="Tampilan Detail"
      >
        <LayoutGrid size={16} />
        Detail
      </button>
      <button
        onClick={() => onChange("simple")}
        className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:scale-105"
        style={{
          background: value === "simple" ? palette.primary : "transparent",
          color: value === "simple" ? palette.white1 : palette.black1,
          boxShadow: value === "simple" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
        }}
        title="Tampilan Simple"
      >
        <LayoutList size={16} />
        Simple
      </button>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
  palette,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  palette: Palette;
}) {
  return (
    <div
      className="rounded-xl border p-3 flex items-center justify-between transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
      style={{
        borderColor: palette.silver1,
        background: palette.white1,
      }}
    >
      <div className="text-xs font-medium" style={{ color: palette.silver2 }}>
        {label}
      </div>
      <div className="flex items-center gap-2">
        <div style={{ color: palette.primary }}>{icon}</div>
        <span
          className="text-sm font-semibold"
          style={{ color: palette.black1 }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function AttendanceBar({
  pct,
  total,
  hadir,
  palette,
}: {
  pct: number;
  total: number;
  hadir: number;
  palette: Palette;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium" style={{ color: palette.black1 }}>
          Kehadiran Hari Ini
        </div>
        <div
          className="text-sm font-semibold"
          style={{ color: palette.primary }}
        >
          {pct}%
        </div>
      </div>
      <div
        className="h-3 w-full rounded-full overflow-hidden shadow-inner"
        style={{ background: palette.white2 }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${palette.secondary}, ${palette.primary})`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        />
      </div>
      <div className="text-xs" style={{ color: palette.black2 }}>
        <span className="font-medium">{hadir}</span> dari {total} siswa hadir
      </div>
    </div>
  );
}

/* ==============================
   Class Card Component (UI tetap)
============================== */
function ClassCard({
  c,
  students,
  palette,
  viewMode,
}: {
  c: TeacherClassSummary;
  students: StudentSummary[];
  palette: Palette;
  viewMode: ViewMode;
}) {
  const totalFromStudents = students.length;
  const total = totalFromStudents || c.studentsCount || 0;
  const hadir = c.todayAttendance.hadir ?? 0;
  const pct = total ? Math.round((hadir / total) * 100) : 0;

  const isUpcomingToday =
    c.nextSession &&
    new Date(c.nextSession.dateISO).toDateString() ===
      TODAY_FIXED.toDateString();

  return (
    <SectionCard
      palette={palette}
      className={`transition-all duration-300 ${
        viewMode === "simple"
          ? "hover:shadow-lg hover:-translate-y-1"
          : "hover:shadow-xl hover:-translate-y-2"
      } ${isUpcomingToday ? "ring-2 ring-opacity-90" : ""}`}
    >
      <div
        className={`p-5 md:p-6 flex flex-col gap-4 h-full ${
          viewMode === "simple" ? "gap-3" : "gap-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div
              className="font-bold text-lg md:text-xl mb-2"
              style={{ color: palette.black2 }}
            >
              {c.name}
            </div>
            <div className="space-y-1">
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: palette.black2 }}
              >
                <GraduationCap size={14} />
                <span className="truncate">Wali Kelas: {c.homeroom}</span>
              </div>
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: palette.black2 }}
              >
                <CalendarDays size={14} />
                <span className="truncate">{c.academicTerm}</span>
              </div>
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: palette.black2 }}
              >
                <Users size={14} />
                <span>Angkatan {c.cohortYear}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <Badge
              palette={palette}
              variant="outline"
              className="flex items-center gap-1.5"
            >
              <MapPin size={12} style={{ color: palette.black2 }} />

              <h1 style={{ color: palette.black2 }}>
                {c.room ?? "Belum ditentukan"}
              </h1>
            </Badge>
          </div>
        </div>

        {/* Content */}
        {viewMode === "simple" ? (
          <div className="space-y-3">
            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                background: isUpcomingToday ? palette.primary2 : palette.white2,
                border: `1px solid ${palette.silver1}`,
              }}
            >
              <div style={{ color: palette.primary }}>
                <Clock size={18} />
              </div>
              <div className="flex-1 min-w-0">
                {c.nextSession ? (
                  <div>
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: palette.black2 }}
                    >
                      {c.nextSession.title}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: palette.black2 }}
                    >
                      {dateShort(c.nextSession.dateISO)} • {c.nextSession.time}
                      {c.nextSession.room && ` • ${c.nextSession.room}`}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Belum ada jadwal
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AttendanceBar
              pct={pct}
              total={total}
              hadir={hadir}
              palette={palette}
            />
            <div
              className="rounded-xl border p-4 space-y-3"
              style={{
                borderColor: isUpcomingToday ? palette.white1 : palette.silver1,
                background: isUpcomingToday ? palette.primary2 : palette.white1,
              }}
            >
              <div
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: palette.black1 }}
              >
                <CalendarDays size={16} style={{ color: palette.primary }} />
                Jadwal Terdekat
                {isUpcomingToday && (
                  <Badge
                    palette={palette}
                    variant="secondary"
                    className="text-xs"
                  >
                    Hari ini
                  </Badge>
                )}
              </div>
              {c.nextSession ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} style={{ color: palette.primary }} />
                    <span className="font-medium">
                      {dateLong(c.nextSession.dateISO)} • {c.nextSession.time}
                    </span>
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: palette.black2 }}
                  >
                    {c.nextSession.title}
                  </div>
                  {c.nextSession.room && (
                    <div
                      className="flex items-center gap-2 text-sm"
                      style={{ color: palette.black2 }}
                    >
                      <MapPin size={14} />
                      <span>{c.nextSession.room}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm" style={{ color: palette.silver2 }}>
                  Belum ada jadwal yang terjadwal.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-end gap-3">
            <Link
              to={`${c.id}`}
              state={{
                academicTerm: c.academicTerm,
                cohortYear: c.cohortYear,
              }}
              className="flex-shrink-0"
            >
              <Btn
                palette={palette}
                size="sm"
                className="flex items-center gap-2 hover:gap-3 transition-all duration-200"
              >
                Buka Kelas
                <ChevronRight size={16} />
              </Btn>
            </Link>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/* ==============================
   Filter Component (UI tetap)
============================== */
function FilterControls({
  palette,
  q,
  setQ,
  room,
  setRoom,
  term,
  setTerm,
  cohort,
  setCohort,
  sortBy,
  setSortBy,
  rooms,
  terms,
  cohorts,
}: {
  palette: Palette;
  q: string;
  setQ: (q: string) => void;
  room: string;
  setRoom: (room: string) => void;
  term: string;
  setTerm: (term: string) => void;
  cohort: string;
  setCohort: (cohort: string) => void;
  sortBy: "name" | "students" | "time";
  setSortBy: (sort: "name" | "students" | "time") => void;
  rooms: string[];
  terms: string[];
  cohorts: string[];
}) {
  return (
    <div className="space-y-4">
      <div
        className="flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm"
        style={{
          borderColor: palette.silver1,
          background: palette.white1,
        }}
      >
        <Search size={20} style={{ color: palette.primary }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari berdasarkan nama kelas, wali kelas, tahun ajaran, atau angkatan..."
          className="bg-transparent outline-none text-sm w-full placeholder:text-opacity-60"
          style={{
            color: palette.black2,
            fontSize: "14px",
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 ">
        <div className="space-y-2">
          <label
            className="text-xs font-medium"
            style={{ color: palette.black2 }}
          >
            Ruang Kelas
          </label>
          <div
            className="flex items-center gap-2 rounded-xl border px-3 py-2.5  "
            style={{ borderColor: palette.silver1, background: palette.white1 }}
          >
            <MapPin size={16} style={{ color: palette.primary }} />
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: palette.black2 }}
            >
              {rooms.map((r) => (
                <option key={r} value={r}>
                  {r === "all" ? "Semua" : r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label
            className="text-xs font-medium"
            style={{ color: palette.black2 }}
          >
            Tahun Ajaran
          </label>
          <div
            className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
            style={{ borderColor: palette.silver1, background: palette.white1 }}
          >
            <CalendarDays size={16} style={{ color: palette.primary }} />
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: palette.black1 }}
            >
              {terms.map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "Semua" : t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label
            className="text-xs font-medium"
            style={{ color: palette.black2 }}
          >
            Angkatan
          </label>
          <div
            className="flex items-center gap-2 rounded-xl border px-3 py-2"
            style={{ borderColor: palette.silver1, background: palette.white1 }}
          >
            <GraduationCap size={16} style={{ color: palette.primary }} />
            <select
              value={cohort}
              onChange={(e) => setCohort(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: palette.black1 }}
            >
              {cohorts.map((y) => (
                <option className="capitalize" key={y} value={y}>
                  {y === "all" ? "Semua" : `Angkatan ${y}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label
            className="text-xs font-medium"
            style={{ color: palette.black2 }}
          >
            Urutkan
          </label>
          <div
            className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
            style={{ borderColor: palette.silver1, background: palette.white1 }}
          >
            <Filter size={16} style={{ color: palette.primary }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: palette.black1 }}
            >
              <option value="name">Nama Kelas</option>
              <option value="students">Jumlah Siswa</option>
              <option value="time">Jadwal Terdekat</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==============================
   Loading State Component (UI tetap)
============================== */
function LoadingCard({
  palette,
  viewMode,
}: {
  palette: Palette;
  viewMode: ViewMode;
}) {
  return (
    <SectionCard palette={palette} className="animate-pulse">
      <div
        className={`p-5 md:p-6 space-y-4 ${viewMode === "simple" ? "space-y-3" : "space-y-4"}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div
              className="h-6 rounded-lg w-32"
              style={{ background: palette.silver1 }}
            />
            <div
              className="h-4 rounded w-48"
              style={{ background: palette.silver1 }}
            />
          </div>
          <div className="space-y-2">
            <div
              className="h-6 rounded-lg w-20"
              style={{ background: palette.silver1 }}
            />
            <div
              className="h-6 rounded-lg w-16"
              style={{ background: palette.silver1 }}
            />
          </div>
        </div>

        {viewMode === "detailed" && (
          <>
            <div
              className="h-16 rounded-xl"
              style={{ background: palette.silver1 }}
            />
            <div className="grid grid-cols-2 gap-3">
              <div
                className="h-12 rounded-xl"
                style={{ background: palette.silver1 }}
              />
              <div
                className="h-12 rounded-xl"
                style={{ background: palette.silver1 }}
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-4">
          <div
            className="h-4 rounded w-24"
            style={{ background: palette.silver1 }}
          />
          <div
            className="h-8 rounded-lg w-20"
            style={{ background: palette.silver1 }}
          />
        </div>
      </div>
    </SectionCard>
  );
}

/* ==============================
   Summary Stats (UI tetap)
============================== */
function SummaryStats({
  classes,
  palette,
}: {
  classes: TeacherClassSummary[];
  palette: Palette;
}) {
  const totalClasses = classes.length;
  const totalStudents = classes.reduce((sum, c) => sum + c.studentsCount, 0);
  const totalTodayAttendance = classes.reduce(
    (sum, c) => sum + c.todayAttendance.hadir,
    0
  );
  const avgAttendanceRate =
    totalStudents > 0
      ? Math.round((totalTodayAttendance / totalStudents) * 100)
      : 0;

  return (
    <SectionCard palette={palette} className="mb-6">
      <div className="p-5 md:p-6">
        <div
          className="font-semibold text-lg mb-4"
          style={{ color: palette.black1 }}
        >
          Ringkasan Kelas Hari Ini
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className="text-center p-4 rounded-xl"
            style={{ background: palette.white2 }}
          >
            <div
              className="text-2xl font-bold mb-1"
              style={{ color: palette.primary }}
            >
              {totalClasses}
            </div>
            <div className="text-sm" style={{ color: palette.black2 }}>
              Total Kelas
            </div>
          </div>
          <div
            className="text-center p-4 rounded-xl"
            style={{ background: palette.white2 }}
          >
            <div
              className="text-2xl font-bold mb-1"
              style={{ color: palette.primary }}
            >
              {totalStudents}
            </div>
            <div className="text-sm" style={{ color: palette.black2 }}>
              Total Siswa
            </div>
          </div>
          <div
            className="text-center p-4 rounded-xl"
            style={{ background: palette.white2 }}
          >
            <div
              className="text-2xl font-bold mb-1"
              style={{ color: palette.primary }}
            >
              {totalTodayAttendance}
            </div>
            <div className="text-sm" style={{ color: palette.black2 }}>
              Hadir Hari Ini
            </div>
          </div>
          <div
            className="text-center p-4 rounded-xl"
            style={{ background: palette.white2 }}
          >
            <div
              className="text-2xl font-bold mb-1"
              style={{ color: palette.primary }}
            >
              {avgAttendanceRate}%
            </div>
            <div className="text-sm" style={{ color: palette.black2 }}>
              Rata-rata Kehadiran
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/* ==============================
   Main Page Component
============================== */
export default function TeacherClassesList() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const { data: classes = [], isFetching: isFetchingClasses } =
    useTeacherClasses();

  const [viewMode, setViewMode] = useState<ViewMode>("detailed");

  const {
    q,
    setQ,
    room,
    setRoom,
    sortBy,
    setSortBy,
    term,
    setTerm,
    cohort,
    setCohort,
    rooms,
    terms,
    cohorts,
    filtered,
  } = useClassFilters(classes);

  // siswa per kelas — juga dibekukan (no auto-refetch)
  const classIds = useMemo(() => filtered.map((c) => c.id), [filtered]);
  const { data: studentsMap = {}, isFetching: isFetchingStudents } =
    useClassStudents(classIds);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Daftar Kelas Saya"
        gregorianDate={TODAY_ISO}
        hijriDate={hijriLong(TODAY_ISO)}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          <ParentSidebar palette={palette} />

          {/* Main Content */}
          <div
            className="flex-1 min-w-0 space-y-6"
            style={{ color: palette.black2 }}
          >
            {!isFetchingClasses && classes.length > 0 && (
              <SummaryStats classes={classes} palette={palette} />
            )}

            <SectionCard palette={palette}>
              <div className="p-5 md:p-6 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2
                      className="font-bold text-xl md:text-2xl mb-1"
                      style={{ color: palette.black1 }}
                    >
                      Kelas yang Saya Ajar
                    </h2>
                    <p className="text-sm" style={{ color: palette.black2 }}>
                      Kelola dan pantau semua kelas yang Anda ampu
                    </p>
                  </div>
                  <ViewModeToggle
                    palette={palette}
                    value={viewMode}
                    onChange={setViewMode}
                  />
                </div>

                <FilterControls
                  palette={palette}
                  q={q}
                  setQ={setQ}
                  room={room}
                  setRoom={setRoom}
                  term={term}
                  setTerm={setTerm}
                  cohort={cohort}
                  setCohort={setCohort}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  rooms={rooms}
                  terms={terms}
                  cohorts={cohorts}
                />
              </div>
            </SectionCard>

            <div>
              {!isFetchingClasses && (
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm" style={{ color: palette.black2 }}>
                    Menampilkan {filtered.length} dari {classes.length} kelas
                  </div>
                  {filtered.length > 0 && (
                    <div className="text-xs" style={{ color: palette.black2 }}>
                      Diurutkan berdasarkan:{" "}
                      {sortBy === "name"
                        ? "Nama Kelas"
                        : sortBy === "students"
                          ? "Jumlah Siswa"
                          : "Jadwal Terdekat"}
                    </div>
                  )}
                </div>
              )}

              <div
                className={`grid gap-6 ${
                  viewMode === "simple"
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1 lg:grid-cols-2"
                }`}
              >
                {isFetchingClasses && filtered.length === 0 && (
                  <>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <LoadingCard
                        key={i}
                        palette={palette}
                        viewMode={viewMode}
                      />
                    ))}
                  </>
                )}

                {filtered.map((c) => (
                  <ClassCard
                    key={c.id}
                    c={c}
                    students={(studentsMap as ClassStudentsMap)[c.id] ?? []}
                    palette={palette}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {filtered.length === 0 && !isFetchingClasses && (
                <SectionCard palette={palette}>
                  <div className="p-8 md:p-12 text-center space-y-4">
                    <div
                      className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: palette.white2 }}
                    >
                      <Search size={24} style={{ color: palette.black2 }} />
                    </div>
                    <div>
                      <div
                        className="font-medium text-lg mb-2"
                        style={{ color: palette.black1 }}
                      >
                        Tidak ada kelas ditemukan
                      </div>
                      <div
                        className="text-sm max-w-md mx-auto"
                        style={{ color: palette.black2 }}
                      >
                        Tidak ada kelas yang cocok dengan filter yang dipilih.
                        Coba ubah kriteria pencarian atau filter untuk melihat
                        lebih banyak kelas.
                      </div>
                    </div>
                    <Btn
                      palette={palette}
                      variant="outline"
                      onClick={() => {
                        setQ("");
                        setRoom("all");
                        setTerm("all");
                        setCohort("all");
                      }}
                    >
                      Reset Filter
                    </Btn>
                  </div>
                </SectionCard>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
