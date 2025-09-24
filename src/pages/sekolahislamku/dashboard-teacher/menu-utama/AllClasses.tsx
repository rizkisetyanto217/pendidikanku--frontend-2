// src/pages/sekolahislamku/pages/academic/AllClasses.tsx
import { useMemo, useState, useDeferredValue } from "react";
import { useNavigate } from "react-router-dom";
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
  Clock,
  Search,
  LayoutList,
  LayoutGrid,
  MapPin,
  GraduationCap,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

import {
  type StudentSummary,
  type ClassStudentsMap,
  fetchStudentsByClasses,
} from "@/pages/sekolahislamku/dashboard-teacher/class/types/teacherClass";

/* =============== Types =============== */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

type NextSession = {
  dateISO: string;
  time: string;
  title: string;
  room?: string;
};

export type ClassSummary = {
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

type ViewMode = "detailed" | "simple";

const QK = {
  LIST: ["all-classes-list"] as const,
  STUDENTS: (ids: string[]) => ["all-class-students", ids] as const,
};

/* =============== Helpers =============== */
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
const hijriLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

/* =============== Fake Data =============== */
const TODAY_FIXED = atLocalNoon(new Date());
const TODAY_ISO = TODAY_FIXED.toISOString();

const CLASSES_FIXED: ClassSummary[] = [
  {
    id: "1",
    name: "Kelas 1A",
    room: "Aula 1",
    homeroom: "Ustadz Abdullah",
    studentsCount: 25,
    todayAttendance: { hadir: 22, sakit: 1, izin: 1, alpa: 1, online: 0 },
    nextSession: {
      dateISO: TODAY_ISO,
      time: "07:30",
      title: "Tahsin & Tajwid",
      room: "Aula 1",
    },
    materialsCount: 10,
    assignmentsCount: 3,
    academicTerm: "2025/2026 — Ganjil",
    cohortYear: 2025,
  },
  {
    id: "2",
    name: "Kelas 2B",
    room: "Ruang 202",
    homeroom: "Ustadzah Maryam",
    studentsCount: 20,
    todayAttendance: { hadir: 17, sakit: 1, izin: 1, alpa: 1, online: 0 },
    nextSession: {
      dateISO: TODAY_ISO,
      time: "09:30",
      title: "Hafalan Juz 30",
      room: "Ruang 202",
    },
    materialsCount: 8,
    assignmentsCount: 2,
    academicTerm: "2025/2026 — Ganjil",
    cohortYear: 2024,
  },
  {
    id: "3",
    name: "Kelas 3A",
    room: "Ruang 301",
    homeroom: "Ustadz Ahmad",
    studentsCount: 23,
    todayAttendance: { hadir: 20, sakit: 2, izin: 0, alpa: 1, online: 0 },
    nextSession: {
      dateISO: TODAY_ISO,
      time: "10:00",
      title: "Fiqih",
      room: "Ruang 301",
    },
    materialsCount: 12,
    assignmentsCount: 4,
    academicTerm: "2025/2026 — Ganjil",
    cohortYear: 2023,
  },
  {
    id: "4",
    name: "Kelas 4B",
    room: "Ruang 402",
    homeroom: "Ustadzah Fatimah",
    studentsCount: 18,
    todayAttendance: { hadir: 15, sakit: 1, izin: 2, alpa: 0, online: 0 },
    nextSession: {
      dateISO: TODAY_ISO,
      time: "13:30",
      title: "Akhlak",
      room: "Ruang 402",
    },
    materialsCount: 9,
    assignmentsCount: 2,
    academicTerm: "2025/2026 — Ganjil",
    cohortYear: 2022,
  },
];

/* =============== Fake API =============== */
async function fetchAllClasses(): Promise<ClassSummary[]> {
  return Promise.resolve(CLASSES_FIXED.map((x) => ({ ...x })));
}

function useAllClasses() {
  return useQuery({
    queryKey: QK.LIST,
    queryFn: fetchAllClasses,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

function useClassStudents(classIds: string[]) {
  return useQuery({
    queryKey: QK.STUDENTS(classIds),
    queryFn: () => fetchStudentsByClasses(classIds),
    enabled: classIds.length > 0,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/* =============== Main Page =============== */
const AllClasses: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  const { data: classes = [], isFetching } = useAllClasses();
  const [viewMode, setViewMode] = useState<ViewMode>("simple");
  const [searchTerm, setSearchTerm] = useState("");

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const filteredClasses = useMemo(() => {
    if (!deferredSearchTerm) return classes;
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
        c.homeroom.toLowerCase().includes(deferredSearchTerm.toLowerCase())
    );
  }, [classes, deferredSearchTerm]);

  const classIds = useMemo(() => classes.map((c) => c.id), [classes]);
  const { data: studentsMap = {} } = useClassStudents(classIds);

  const handleClassClick = (classId: string) => {
    navigate(`${classId}`);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Semua Kelas"
        gregorianDate={TODAY_ISO}
        hijriDate={hijriLong(TODAY_ISO)}
        dateFmt={dateLong}
        showBack
      />

      <main className="w-full px-4 md:px-6 py-4  md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Header */}
            <SectionCard palette={palette}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="md:flex hidden gap-3 items-center">
                    <Btn
                      palette={palette}
                      variant="ghost"
                      onClick={() => navigate(-1)}
                    >
                      <ArrowLeft size={20} />
                    </Btn>
                    <div>
                      <h1
                        className="font-semibold text-lg"
                        style={{ color: palette.black1 }}
                      >
                        Semua Kelas
                      </h1>
                      <p
                        className="text-sm mt-1"
                        style={{ color: palette.black2 }}
                      >
                        {classes.length} kelas terdaftar
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2"
                        style={{ color: palette.black2 }}
                      />
                      <input
                        type="text"
                        placeholder="Cari kelas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg border text-sm"
                        style={{
                          borderColor: palette.silver1,
                          backgroundColor: palette.white1,
                        }}
                      />
                    </div>

                    {/* View Toggle */}
                    <div
                      className="flex border rounded-lg"
                      style={{ borderColor: palette.silver1 }}
                    >
                      <button
                        onClick={() => setViewMode("simple")}
                        className={`px-3 py-2 rounded-l-lg text-sm ${viewMode === "simple" ? "font-medium" : ""}`}
                        style={{
                          backgroundColor:
                            viewMode === "simple"
                              ? palette.primary
                              : "transparent",
                          color:
                            viewMode === "simple" ? "white" : palette.black2,
                        }}
                      >
                        <LayoutList size={16} />
                      </button>
                      <button
                        onClick={() => setViewMode("detailed")}
                        className={`px-3 py-2 rounded-r-lg text-sm ${viewMode === "detailed" ? "font-medium" : ""}`}
                        style={{
                          backgroundColor:
                            viewMode === "detailed"
                              ? palette.primary
                              : "transparent",
                          color:
                            viewMode === "detailed" ? "white" : palette.black2,
                        }}
                      >
                        <LayoutGrid size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Classes Grid */}
            <div
              className={`grid gap-4 ${
                viewMode === "simple"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 lg:grid-cols-2"
              }`}
            >
              {/* Loading */}
              {isFetching &&
                Array.from({ length: 6 }).map((_, i) => (
                  <SectionCard
                    key={i}
                    palette={palette}
                    className="animate-pulse"
                  >
                    <div className="h-32" />
                  </SectionCard>
                ))}

              {/* Class Cards */}
              {!isFetching &&
                filteredClasses.map((classItem) => (
                  <SectionCard
                    key={classItem.id}
                    palette={palette}
                    className="hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => handleClassClick(classItem.id)}
                  >
                    <div className="p-5 space-y-3">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3
                            className="font-semibold text-lg"
                            style={{ color: palette.black1 }}
                          >
                            {classItem.name}
                          </h3>
                          <div
                            className="flex items-center gap-2 text-sm mt-1"
                            style={{ color: palette.black2 }}
                          >
                            <GraduationCap size={14} />
                            <span>{classItem.homeroom}</span>
                          </div>
                        </div>
                        <Badge palette={palette} variant="outline">
                          {classItem.room}
                        </Badge>
                      </div>

                      {viewMode === "detailed" && (
                        <>
                          {/* Stats */}
                          <div
                            className="flex justify-between text-sm py-2 border-t border-b"
                            style={{ borderColor: palette.silver1 }}
                          >
                            <div
                              className="flex items-center gap-1"
                              style={{ color: palette.black2 }}
                            >
                              <Users size={14} />
                              <span>{classItem.studentsCount} siswa</span>
                            </div>
                            <div style={{ color: palette.black2 }}>
                              Hadir: {classItem.todayAttendance.hadir}
                            </div>
                          </div>

                          {/* Next Session */}
                          {classItem.nextSession && (
                            <div
                              className="text-sm p-2 rounded border"
                              style={{
                                backgroundColor: palette.white1,
                                borderColor: palette.silver1,
                                color: palette.black2,
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Clock size={14} />
                                <span>
                                  {classItem.nextSession.time} •{" "}
                                  {classItem.nextSession.title}
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {viewMode === "simple" && (
                        <div className="flex justify-between items-center text-sm">
                          <div
                            className="flex items-center gap-1"
                            style={{ color: palette.black2 }}
                          >
                            <Users size={14} />
                            <span>{classItem.studentsCount} siswa</span>
                          </div>
                        </div>
                      )}

                      {/* Action */}
                      <div className="flex justify-between">
                        {classItem.nextSession && (
                          <div
                            className="flex items-center gap-1"
                            style={{ color: palette.black2 }}
                          >
                            <Clock size={14} />
                            <span className="text-sm">
                              {classItem.nextSession.time}
                            </span>
                          </div>
                        )}
                        <Btn palette={palette} size="sm" variant="ghost">
                          <ChevronRight size={14} />
                        </Btn>
                      </div>
                    </div>
                  </SectionCard>
                ))}

              {/* Empty State */}
              {!isFetching && filteredClasses.length === 0 && (
                <div className="col-span-full">
                  <SectionCard palette={palette}>
                    <div className="p-8 text-center">
                      <Users
                        size={32}
                        style={{ color: palette.black2 }}
                        className="mx-auto mb-3"
                      />
                      <p className="text-sm" style={{ color: palette.black2 }}>
                        {searchTerm
                          ? "Tidak ada kelas yang ditemukan"
                          : "Belum ada kelas terdaftar"}
                      </p>
                    </div>
                  </SectionCard>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AllClasses;
