// src/pages/sekolahislamku/TeacherDashboard.tsx
import { useEffect, useMemo, useState } from "react";
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
import TeacherSidebarNav from "../components/home/TeacherSideBarNav";
import TeacherTopBar from "../components/home/TeacherTopBar";

import { Users } from "lucide-react";
import ListJadwal from "./schedule/modal/ListJadwal";
import TambahJadwal from "./components/dashboard/TambahJadwal";

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

/* ================= Page ================= */
export default function TeacherDashboard() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  // state tambah jadwal
  const [showTambahJadwal, setShowTambahJadwal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["teacher-home"],
    queryFn: fetchTeacherHome,
    staleTime: 60_000,
  });

  // Jadwal: pakai state (UI-only) supaya bisa ditambah/ubah tanpa API
  type ScheduleItem = {
    time: string;
    title: string;
    room?: string;
    slug?: string;
  };
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);

  // Inisialisasi dari "API" dummy
  useEffect(() => {
    const mapped =
      (data?.todayClasses ?? []).map((c) => ({
        time: c.time,
        title: `${c.className} — ${c.subject}`,
        room: c.room,
      })) ?? [];
    setScheduleItems(mapped);
  }, [data?.todayClasses]);

  // Kelas dikelola (dari data todayClasses)
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
      <TeacherTopBar
        palette={palette}
        title="Dashboard Pengajar"
        gregorianDate={data?.gregorianDate}
        hijriDate={data?.hijriDate}
        dateFmt={(iso) => dateFmtLong(iso)}
      />

      <TambahJadwal
        open={showTambahJadwal}
        onClose={() => setShowTambahJadwal(false)}
        palette={palette}
        onSubmit={(item) => {
          setScheduleItems((prev) =>
            [...prev, item].sort((a, b) => a.time.localeCompare(b.time))
          );
        }}
      />

      {/* Content + Sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <TeacherSidebarNav palette={palette} />

          {/* Main */}
          <div className="flex-1 space-y-6">
            {/* ================= Row 1 ================= */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Jadwal Hari Ini */}
              <div className="lg:col-span-6 xl:col-span-6">
                {" "}
                <TodayScheduleCard
                  palette={palette}
                  items={scheduleItems}
                  seeAllPath="/guru/kelas/jadwal"
                  addLabel="Tambah Jadwal"
                  onAdd={() => setShowTambahJadwal(true)}
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

            {/* ================= Row 2: List Jadwal (semua) ================= */}
            <section>
              {" "}
              <ListJadwal
                palette={palette}
                items={scheduleItems}
                title="Daftar Jadwal"
                onAdd={() => setShowTambahJadwal(true)}
              />
            </section>

            {/* ================= Row 3: Pengumuman ================= */}
            <section>
              <AnnouncementsList
                palette={palette}
                items={data?.announcements ?? []}
                dateFmt={dateFmt}
                seeAllPath="/guru/pengumuman"
                getDetailHref={(a) => `/guru/pengumuman/detail/${a.id}`}
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
