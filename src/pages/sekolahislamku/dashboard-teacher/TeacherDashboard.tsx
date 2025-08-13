// src/pages/sekolahislamku/TeacherDashboard.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import TodayScheduleCard from "@/pages/sekolahislamku/components/card/TodayScheduleCard";
import AnnouncementsList from "@/pages/sekolahislamku/components/card/AnnouncementsListCard";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import { NavLink } from "react-router-dom";

import {
  CalendarDays,
  ClipboardList,
  CheckSquare,
  Users,
  Megaphone,
  Plus,
  CheckCircle2,
  LayoutDashboard,
  NotebookPen,
} from "lucide-react";
import TeacherSidebarNav from "../components/home/TeacherSideBarNav";
import MiniBar from "../components/ui/MiniBar";

/* ================= Types ================ */
interface Announcement {
  id: string;
  title: string;
  date: string;
  body: string;
  type?: "info" | "warning" | "success";
}

interface TodayClass {
  id: string;
  time: string;
  className: string;
  subject: string;
  room?: string;
  studentCount?: number;
  status?: "upcoming" | "ongoing" | "done";
}

interface PendingGrading {
  id: string;
  className: string;
  taskTitle: string;
  submitted: number;
  total: number;
  dueDate?: string;
}

type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

interface AttendanceSummary {
  date: string;
  totalClasses: number;
  totalStudents: number;
  byStatus: Record<AttendanceStatus, number>;
}

/* ============ Fake API layer (replace with axios) ============ */
async function fetchTeacherHome() {
  const now = new Date();
  const iso = now.toISOString();

  return Promise.resolve({
    teacherName: "Ustadz/Ustadzah",
    hijriDate: "16 Muharram 1447 H",
    gregorianDate: iso,

    todayClasses: [
      {
        id: "tc1",
        time: "07:30",
        className: "TPA A",
        subject: "Tahsin",
        room: "Aula 1",
        studentCount: 22,
        status: "ongoing",
      },
      {
        id: "tc2",
        time: "09:30",
        className: "TPA B",
        subject: "Hafalan Juz 30",
        room: "R. Tahfiz",
        studentCount: 20,
        status: "upcoming",
      },
    ] as TodayClass[],

    attendanceSummary: {
      date: iso,
      totalClasses: 2,
      totalStudents: 42,
      byStatus: { hadir: 36, online: 3, sakit: 1, izin: 1, alpa: 1 },
    } as AttendanceSummary,

    pendingGradings: [
      {
        id: "pg1",
        className: "TPA A",
        taskTitle: "Evaluasi Wudhu",
        submitted: 18,
        total: 22,
        dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "pg2",
        className: "TPA B",
        taskTitle: "Setoran Hafalan An-Naba 1–10",
        submitted: 12,
        total: 20,
        dueDate: new Date(
          now.getTime() + 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ] as PendingGrading[],

    announcements: [
      {
        id: "a1",
        title: "Tryout Ujian Tahfiz",
        date: iso,
        body: "Tryout internal hari Kamis. Mohon siapkan rubrik penilaian makhraj & tajwid.",
        type: "info",
      },
      {
        id: "a2",
        title: "Rapat Kurikulum",
        date: iso,
        body: "Rapat kurikulum pekan depan. Draft silabus sudah di folder bersama.",
        type: "success",
      },
    ] as Announcement[],
  });
}

/* === item kecil untuk list kelas === */
function MyClassItem({
  name,
  students,
  lastSubject,
  palette,
}: {
  name: string;
  students?: number;
  lastSubject?: string;
  palette: Palette;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-xl border px-3 py-2"
      style={{ borderColor: palette.silver1, background: palette.white2 }}
    >
      <div className="min-w-0">
        <div className="font-medium truncate">{name}</div>
        <div className="text-xs truncate" style={{ color: palette.silver2 }}>
          {typeof students === "number" ? `${students} siswa` : "—"}{" "}
          {lastSubject ? `• ${lastSubject}` : ""}
        </div>
      </div>
      <Btn
        palette={palette}
        size="sm"
        variant="ghost"
        onClick={() => alert(`Kelola ${name}`)}
      >
        Kelola
      </Btn>
    </div>
  );
}

/* ================= Helpers ================ */
const dateFmtLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const dateFmtShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    : "-";

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const percent = (a: number, b: number) =>
  b > 0 ? Math.round((a / b) * 100) : 0;

/* ================= Page ================= */
export default function TeacherDashboard() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  const { data, isLoading } = useQuery({
    queryKey: ["teacher-home"],
    queryFn: fetchTeacherHome,
    staleTime: 60_000,
  });

  const scheduleItems = useMemo(
    () =>
      (data?.todayClasses ?? []).map((c) => ({
        time: c.time,
        title: `${c.className} — ${c.subject}`,
        room: c.room,
      })),
    [data?.todayClasses]
  );

  // ⬇️ PINDAHKAN KE SINI
  type ManagedClass = {
    id: string;
    name: string;
    students?: number;
    lastSubject?: string;
  };

  const managedClasses = useMemo<ManagedClass[]>(() => {
    const map = new Map<string, ManagedClass>();
    (data?.todayClasses ?? []).forEach((c) => {
      const key = c.className;
      if (!map.has(key)) {
        map.set(key, {
          id: key.toLowerCase().replace(/\s+/g, "-"),
          name: key,
          students: c.studentCount,
          lastSubject: c.subject,
        });
      }
    });
    return Array.from(map.values());
  }, [data?.todayClasses]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Dashboard Pengajar"
        gregorianDate={data?.gregorianDate}
        hijriDate={data?.hijriDate}
        dateFmt={(iso) => dateFmtLong(iso)}
      />

      {/* Content + Sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <TeacherSidebarNav palette={palette} />

          {/* Main */}
          <div className="flex-1 space-y-6">
            {/* ================= Row 1 ================= */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Jadwal Hari Ini (tanpa SectionCard) */}
              <div className="lg:col-span-6 xl:col-span-6">
                <TodayScheduleCard
                  palette={palette}
                  items={scheduleItems}
                  seeAllPath="/guru/kelas/jadwal"
                  addHref="/guru/kelas/jadwal"
                  addLabel="Tambah Jadwal"
                />
              </div>
              {/* Kelas yang Saya Kelola */}
              <div className="lg:col-span-6 xl:col-span-6">
                <SectionCard palette={palette}>
                  <div className="p-4 md:p-5 pb-2 font-medium flex items-center gap-2">
                    <Users size={16} color={palette.quaternary} />
                    Kelas yang Saya Kelola
                  </div>
                  <div className="px-4 md:px-5 pb-4 grid gap-2">
                    {managedClasses.length > 0 ? (
                      managedClasses.map((c) => (
                        <MyClassItem
                          key={c.id}
                          name={c.name}
                          students={c.students}
                          lastSubject={c.lastSubject}
                          palette={palette}
                        />
                      ))
                    ) : (
                      <div
                        className="text-sm"
                        style={{ color: palette.silver2 }}
                      >
                        Belum ada kelas terdaftar.
                      </div>
                    )}
                  </div>
                </SectionCard>
              </div>
            </section>

            {/* ================= Row 2 ================= */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Ringkasan Kehadiran */}
              <div className="lg:col-span-6 xl:col-span-6">
                <SectionCard palette={palette} className="h-full flex flex-col">
                  <div className="p-4 md:p-5 pb-2 font-medium flex items-center gap-2">
                    <CheckSquare size={16} color={palette.quaternary} />
                    Ringkasan Kehadiran
                  </div>

                  <div className="px-4 md:px-5 grid grid-cols-2 gap-3 text-sm">
                    <StatPill
                      label="Total Siswa"
                      value={data?.attendanceSummary.totalStudents ?? 0}
                      palette={palette}
                    />
                    <StatPill
                      label="Kelas Hari Ini"
                      value={data?.attendanceSummary.totalClasses ?? 0}
                      palette={palette}
                    />
                  </div>

                  <div className="px-4 md:px-5 mt-3 grid grid-cols-2 gap-2">
                    {(
                      [
                        "hadir",
                        "online",
                        "sakit",
                        "izin",
                        "alpa",
                      ] as AttendanceStatus[]
                    ).map((k) => (
                      <MiniBar
                        palette={palette}
                        label={k.toUpperCase()}
                        value={data?.attendanceSummary.byStatus[k] ?? 0}
                        total={data?.attendanceSummary.totalStudents ?? 0}
                      />
                    ))}
                  </div>

                  <div className="px-4 md:px-5 py-4 mt-auto">
                    <Btn
                      palette={palette}
                      size="sm"
                      onClick={() => alert("Detail Kehadiran")}
                    >
                      <CheckSquare className="mr-2" size={16} />
                      Kelola Absen
                    </Btn>
                  </div>
                </SectionCard>
              </div>
              {/* Penilaian Menunggu */}
              <div className="lg:col-span-6 xl:col-span-6">
                <SectionCard palette={palette} className="h-full flex flex-col">
                  <div className="p-4 md:p-5 pb-2 flex items-center justify-between">
                    <div className="font-medium flex items-center gap-2">
                      <ClipboardList size={16} color={palette.quaternary} />
                      Penilaian Menunggu
                    </div>
                    <Btn
                      palette={palette}
                      size="sm"
                      variant="ghost"
                      onClick={() => alert("Lihat semua penilaian")}
                    >
                      Lihat semua
                    </Btn>
                  </div>

                  <div className="px-4 md:px-5 pb-4 flex-1 min-h-0 overflow-auto space-y-3">
                    {(data?.pendingGradings ?? []).map((pg) => (
                      <PendingItem key={pg.id} pg={pg} palette={palette} />
                    ))}

                    {(!data?.pendingGradings ||
                      data.pendingGradings.length === 0) && (
                      <div
                        className="text-sm"
                        style={{ color: palette.silver2 }}
                      >
                        Tidak ada penilaian menunggu.
                      </div>
                    )}
                  </div>
                </SectionCard>
              </div>
            </section>

            {/* ================= Row 3 ================= */}
            <section>
              <AnnouncementsList
                palette={palette}
                items={data?.announcements ?? []}
                dateFmt={dateFmt}
                seeAllPath="/guru/pengumuman" // halaman list
                getDetailHref={(a) => `/guru/pengumuman/detail/${a.id}`} // detail per item
              />
            </section>

            {isLoading && (
              <div className="text-sm" style={{ color: palette.silver2 }}>
                Memuat data dashboard…
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= Small UI helpers ================= */
function StatPill({
  label,
  value,
  palette,
}: {
  label: string;
  value: number | string;
  palette: Palette;
}) {
  return (
    <div
      className="p-3 rounded-xl border"
      style={{ borderColor: palette.silver1, background: palette.white1 }}
    >
      <div className="text-xs" style={{ color: palette.silver2 }}>
        {label}
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function PendingItem({
  pg,
  palette,
}: {
  pg: {
    id: string;
    className: string;
    taskTitle: string;
    submitted: number;
    total: number;
    dueDate?: string;
  };
  palette: Palette;
}) {
  const pct = pg.total > 0 ? Math.round((pg.submitted / pg.total) * 100) : 0;

  return (
    <div
      className="p-3 rounded-xl border flex flex-col gap-2"
      style={{ borderColor: palette.silver1, background: palette.white1 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium truncate">{pg.taskTitle}</div>
          <div className="text-xs mt-0.5" style={{ color: palette.silver2 }}>
            {pg.className} • {pg.submitted}/{pg.total} terkumpul • batas{" "}
            {dateFmtShort(pg.dueDate)}
          </div>
        </div>
        <Badge palette={palette} variant="outline" className="shrink-0">
          {pct}%
        </Badge>
      </div>

      <div
        className="h-2 w-full rounded-full overflow-hidden"
        style={{ background: palette.white2 }}
      >
        <div
          className="h-full transition-[width] duration-300"
          style={{ width: `${pct}%`, background: palette.secondary }}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Btn
          palette={palette}
          size="sm"
          variant="quaternary"
          className="flex-1"
          onClick={() => alert("Nilai sekarang")}
        >
          Nilai
        </Btn>
        <Btn
          palette={palette}
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => alert("Lihat detail")}
        >
          Detail
        </Btn>
      </div>
    </div>
  );
}
