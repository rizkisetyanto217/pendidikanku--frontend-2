// src/pages/sekolahislamku/pages/SchoolDashboard.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import axios from "@/lib/axios";

import {
  SectionCard,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";
import TodayScheduleCard from "@/pages/sekolahislamku/components/card/TodayScheduleCard";
import AnnouncementsList from "@/pages/sekolahislamku/components/card/AnnouncementsListCard";
import BillsSectionCard from "@/pages/sekolahislamku/components/card/BillsSectionCard";

import { Users, UserCog, BookOpen, CheckSquare, BarChart2 } from "lucide-react";
import SchoolSidebarNav from "../components/home/SchoolSideBarNav";

/* ================= Types ================ */
type Announcement = {
  id: string;
  title: string;
  date: string;
  body: string;
  type?: "info" | "warning" | "success";
};
type BillItem = {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: "unpaid" | "paid" | "overdue";
};
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";
type SchoolHome = {
  schoolName: string;
  hijriDate: string;
  gregorianDate: string;
  finance: {
    unpaidCount: number;
    unpaidTotal: number;
    paidThisMonth: number;
    outstandingBills: BillItem[];
  };
  todaySchedule: { time: string; title: string; room?: string }[];
  announcements: Announcement[];
  attendanceTodayByStatus: Record<AttendanceStatus, number>;
};

type LembagaStats = {
  lembaga_stats_lembaga_id: string;
  lembaga_stats_active_classes: number;
  lembaga_stats_active_sections: number;
  lembaga_stats_active_students: number;
  lembaga_stats_active_teachers: number;
  lembaga_stats_created_at: string;
  lembaga_stats_updated_at: string;
};
type LembagaStatsResponse = { data: LembagaStats; found: boolean };

/* ============ Fake API (school home dummy) ============ */
async function fetchSchoolHome(): Promise<SchoolHome> {
  const now = new Date();
  const iso = now.toISOString();
  return {
    schoolName: "Sekolah Islamku",
    hijriDate: "16 Muharram 1447 H",
    gregorianDate: iso,
    finance: {
      unpaidCount: 18,
      unpaidTotal: 7_500_000,
      paidThisMonth: 42_250_000,
      outstandingBills: [
        {
          id: "b101",
          title: "SPP Agustus - Kelas 3A (subset)",
          amount: 150_000,
          dueDate: new Date(now.getTime() + 5 * 864e5).toISOString(),
          status: "unpaid",
        },
        {
          id: "b102",
          title: "SPP Agustus - Kelas 4B (subset)",
          amount: 300_000,
          dueDate: new Date(now.getTime() + 3 * 864e5).toISOString(),
          status: "unpaid",
        },
        {
          id: "b103",
          title: "Seragam Baru (gelombang 2)",
          amount: 250_000,
          dueDate: new Date(now.getTime() + 9 * 864e5).toISOString(),
          status: "unpaid",
        },
      ],
    },
    todaySchedule: [
      { time: "07:15", title: "Upacara & Doa Pagi", room: "Lapangan" },
      { time: "08:00", title: "Observasi Tahsin Kelas 3", room: "Aula 1" },
      { time: "13:00", title: "Rapat Kurikulum", room: "R. Meeting" },
    ],
    announcements: [
      {
        id: "a1",
        title: "Tryout Ujian Tahfiz",
        date: iso,
        body: "Tryout internal Kamis depan. Mohon guru menyiapkan rubrik penilaian.",
        type: "info",
      },
      {
        id: "a2",
        title: "Pemeliharaan Sistem",
        date: iso,
        body: "Aplikasi keuangan maintenance Minggu 00:00–02:00.",
        type: "warning",
      },
    ],
    attendanceTodayByStatus: {
      hadir: 286,
      online: 8,
      sakit: 10,
      izin: 9,
      alpa: 7,
    },
  };
}

/* ============ Query: Lembaga Stats ============ */
function useLembagaStats() {
  return useQuery({
    queryKey: ["lembaga-stats"],
    queryFn: async () => {
      const res = await axios.get<LembagaStatsResponse>("/api/a/lembaga-stats");
      if (!res.data?.found) return null;
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
    retry: 1,
  });
}

/* ============ Query: Today Sessions (API) ============ */
type SessionsItem = {
  class_attendance_sessions_id: string;
  class_attendance_sessions_date: string; // YYYY-MM-DDT00:00:00Z
  class_attendance_sessions_title: string;
  class_attendance_sessions_general_info?: string;
  class_attendance_sessions_note?: string;
};
type SessionsResponse = {
  message: string;
  data: {
    limit: number;
    offset: number;
    count: number;
    items: SessionsItem[];
  };
};

const yyyyMmDdLocal = (d = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${y}-${m}-${day}`;
};

function useTodaySessions() {
  return useQuery({
    queryKey: ["class-attendance-sessions", "today"],
    queryFn: async () => {
      const today = yyyyMmDdLocal();
      const res = await axios.get<SessionsResponse>(
        "/api/u/class-attendance-sessions",
        {
          params: {
            date_from: today,
            date_to: today, // hanya hari ini
            limit: 50,
            offset: 0,
          },
        }
      );
      return res.data?.data?.items ?? [];
    },
    staleTime: 60_000,
  });
}

/* ================= Helpers ================ */
const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
const dateFmt = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

/* ================= Page ================= */
export default function SchoolDashboard() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  // Dummy home (UI layout)
  const homeQ = useQuery({
    queryKey: ["school-home"],
    queryFn: fetchSchoolHome,
    staleTime: 60_000,
  });

  // Real APIs
  const statsQ = useLembagaStats();
  const todaySessionsQ = useTodaySessions();

  // KPI dari lembaga_stats
  const kpis = {
    students: statsQ.data?.lembaga_stats_active_students ?? 0,
    teachers: statsQ.data?.lembaga_stats_active_teachers ?? 0,
    program: statsQ.data?.lembaga_stats_active_classes ?? 0,
    class: statsQ.data?.lembaga_stats_active_sections ?? 0, // dipakai sebagai "Kehadiran Hari Ini" (sesuai request sebelumnya)
  };

  // Jadwal hari ini: ambil dari API; fallback ke dummy
  const scheduleItems = useMemo(() => {
    const apiItems = todaySessionsQ.data ?? [];
    if (apiItems.length > 0) {
      return apiItems.map((it) => ({
        time: "Hari ini", // API hanya punya tanggal; tampilkan sebagai all-day
        title: it.class_attendance_sessions_title || "Sesi Kehadiran",
        // room: undefined,
      }));
    }
    return homeQ.data?.todaySchedule ?? [];
  }, [todaySessionsQ.data, homeQ.data?.todaySchedule]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Dashboard Sekolah"
        gregorianDate={homeQ.data?.gregorianDate}
        hijriDate={homeQ.data?.hijriDate}
        dateFmt={(iso) => dateFmt(iso)}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <SchoolSidebarNav palette={palette} />

          {/* Main */}
          <div className="flex-1 space-y-6 min-w-0">
            <Outlet />

            {/* KPI */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiTile
                palette={palette}
                label="Total Siswa"
                value={kpis.students}
                icon={<Users size={18} />}
              />
              <KpiTile
                palette={palette}
                label="Total Guru"
                value={kpis.teachers}
                icon={<UserCog size={18} />}
              />
              <KpiTile
                palette={palette}
                label="Kelas Aktif"
                value={kpis.program}
                icon={<BookOpen size={18} />}
              />
              <KpiTile
                palette={palette}
                label="Kehadiran Hari Ini"
                value={kpis.class}
                icon={<CheckSquare size={18} />}
                tone="success"
              />
            </section>

            {/* Jadwal • Keuangan • Pengumuman */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Jadwal (kiri) */}
              <div className="lg:col-span-6">
                <TodayScheduleCard
                  palette={palette}
                  items={scheduleItems}
                  seeAllPath="semua-jadwal"
                />
                {(todaySessionsQ.isLoading || todaySessionsQ.isFetching) && (
                  <div className="px-4 pt-2 text-xs opacity-70">
                    Memuat jadwal hari ini…
                  </div>
                )}
              </div>

              {/* Keuangan (kanan) */}
              <div className="lg:col-span-6 space-y-4 min-w-0">
                <SectionCard palette={palette}>
                  <div className="p-4 pb-1 font-medium">Snapshot Keuangan</div>
                  <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                    <MiniStat
                      palette={palette}
                      label="Tertagih Bulan Ini"
                      value={formatIDR(homeQ.data?.finance.paidThisMonth ?? 0)}
                    />
                    <MiniStat
                      palette={palette}
                      label="Tunggakan"
                      value={`${homeQ.data?.finance.unpaidCount ?? 0} tagihan`}
                      sub={formatIDR(homeQ.data?.finance.unpaidTotal ?? 0)}
                      tone="warning"
                    />
                  </div>
                </SectionCard>

                <BillsSectionCard
                  palette={palette}
                  bills={homeQ.data?.finance.outstandingBills ?? []}
                  dateFmt={dateFmt}
                  formatIDR={formatIDR}
                  seeAllPath="semua-tagihan"
                  getPayHref={(b) => `/finance/bill/${b.id}`}
                  className="w-full"
                />
              </div>

              {/* Pengumuman (full width) */}
              <div className="lg:col-span-12">
                <div className="px-4 pb-4">
                  <AnnouncementsList
                    palette={palette}
                    items={homeQ.data?.announcements ?? []}
                    dateFmt={dateFmt}
                    seeAllPath="semua-pengumuman"
                    getDetailHref={(a) => `tryout-ujian-tahfizh`}
                  />
                </div>
              </div>
            </section>

            {(homeQ.isLoading || statsQ.isLoading) && (
              <div className="text-sm opacity-70">Memuat data dashboard…</div>
            )}
            {statsQ.isError && (
              <div className="text-xs opacity-70">
                Gagal memuat statistik lembaga. Menampilkan data sementara.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= Small UI helpers ================= */
function KpiTile({
  palette,
  label,
  value,
  icon,
  tone,
}: {
  palette: Palette;
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  tone?: "success" | "warning" | "danger";
}) {
  const toneBg =
    tone === "success"
      ? palette.success2
      : tone === "warning"
        ? palette.warning1
        : tone === "danger"
          ? palette.error2
          : palette.primary2;
  const toneTxt =
    tone === "success"
      ? palette.success1
      : tone === "warning"
        ? palette.warning1
        : tone === "danger"
          ? palette.error1
          : palette.primary;
  return (
    <SectionCard palette={palette}>
      <div className="p-4 md:p-5 flex items-center gap-3">
        <span
          className="h-10 w-10 grid place-items-center rounded-xl"
          style={{ background: toneBg, color: toneTxt }}
        >
          {icon ?? <BarChart2 size={18} />}
        </span>
        <div>
          <div className="text-xs" style={{ color: palette.silver2 }}>
            {label}
          </div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
    </SectionCard>
  );
}

function MiniStat({
  palette,
  label,
  value,
  sub,
  tone,
}: {
  palette: Palette;
  label: string;
  value: string;
  sub?: string;
  tone?: "warning" | "normal";
}) {
  const badgeVariant = tone === "warning" ? "warning" : "outline";
  return (
    <div
      className="p-3 rounded-xl border w-full"
      style={{ borderColor: palette.silver1, background: palette.white1 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <div
          className="text-xs font-medium leading-tight md:flex-1 truncate"
          style={{ color: palette.silver2 }}
        >
          {label}
        </div>
        <Badge
          palette={palette}
          variant={badgeVariant}
          className="flex-shrink-0 w-fit"
        >
          {label.includes("Tunggakan") ? "Perlu perhatian" : "OK"}
        </Badge>
      </div>
      <div className="text-lg md:text-xl font-semibold leading-tight mb-1">
        {value}
      </div>
      {sub && (
        <div
          className="text-xs leading-relaxed"
          style={{ color: palette.silver2 }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
