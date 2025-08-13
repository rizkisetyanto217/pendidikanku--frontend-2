import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";

import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import TodayScheduleCard from "@/pages/sekolahislamku/components/card/TodayScheduleCard";
import AnnouncementsList from "@/pages/sekolahislamku/components/card/AnnouncementsListCard";
import BillsSectionCard from "@/pages/sekolahislamku/components/card/BillsSectionCard";

import {
  LayoutDashboard,
  Users,
  UserCog,
  BookOpen,
  CheckSquare,
  Wallet,
  Megaphone,
  BarChart2,
  Settings,
  CalendarDays,
  Plus,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import StudentSideBarNav from "../components/home/StudentSideBarNav";
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
  kpis: {
    students: number;
    teachers: number;
    classes: number;
    attendanceRateToday: number;
  };
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

/* ============ Fake API layer (replace with axios) ============ */
async function fetchSchoolHome(): Promise<SchoolHome> {
  const now = new Date();
  const iso = now.toISOString();
  return Promise.resolve({
    schoolName: "Sekolah Islamku",
    hijriDate: "16 Muharram 1447 H",
    gregorianDate: iso,
    kpis: { students: 320, teachers: 24, classes: 12, attendanceRateToday: 92 },
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

  const { data, isLoading } = useQuery({
    queryKey: ["school-home"],
    queryFn: fetchSchoolHome,
    staleTime: 60_000,
  });
  const scheduleItems = useMemo(
    () => data?.todaySchedule ?? [],
    [data?.todaySchedule]
  );

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Dashboard Sekolah"
        gregorianDate={data?.gregorianDate}
        hijriDate={data?.hijriDate}
        dateFmt={(iso) => dateFmt(iso)}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <SchoolSidebarNav palette={palette} />

          {/* Main */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* KPI */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiTile
                palette={palette}
                label="Total Siswa"
                value={data?.kpis.students ?? 0}
                icon={<Users size={18} />}
              />
              <KpiTile
                palette={palette}
                label="Total Guru"
                value={data?.kpis.teachers ?? 0}
                icon={<UserCog size={18} />}
              />
              <KpiTile
                palette={palette}
                label="Kelas Aktif"
                value={data?.kpis.classes ?? 0}
                icon={<BookOpen size={18} />}
              />
              <KpiTile
                palette={palette}
                label="Kehadiran Hari Ini"
                value={`${data?.kpis.attendanceRateToday ?? 0}%`}
                icon={<CheckSquare size={18} />}
                tone="success"
              />
            </section>

            {/* Jadwal • Keuangan • Pengumuman */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Jadwal (row 1, kiri) */}
              <div className="lg:col-span-6">
                <TodayScheduleCard
                  palette={palette}
                  items={scheduleItems}
                  seeAllPath="/school/schedule"
                />
              </div>

              {/* Keuangan (row 1, kanan) */}
              <div className="lg:col-span-6 space-y-4 min-w-0">
                <SectionCard palette={palette}>
                  <div className="p-4 pb-1 font-medium">Snapshot Keuangan</div>
                  <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                    <MiniStat
                      palette={palette}
                      label="Tertagih Bulan Ini"
                      value={formatIDR(data?.finance.paidThisMonth ?? 0)}
                    />
                    <MiniStat
                      palette={palette}
                      label="Tunggakan"
                      value={`${data?.finance.unpaidCount ?? 0} tagihan`}
                      sub={formatIDR(data?.finance.unpaidTotal ?? 0)}
                      tone="warning"
                    />
                  </div>
                </SectionCard>

                <BillsSectionCard
                  palette={palette}
                  bills={data?.finance.outstandingBills ?? []}
                  dateFmt={dateFmt}
                  formatIDR={formatIDR}
                  seeAllPath="/school/finance"
                  getPayHref={(b) => `/finance/bill/${b.id}`}
                  className="w-full"
                />
              </div>

              {/* Pengumuman (row 2, full width) */}
              <div className="lg:col-span-12">
                <div className="px-4 pb-4">
                  <AnnouncementsList
                    palette={palette}
                    items={data?.announcements ?? []}
                    dateFmt={dateFmt}
                    seeAllPath="/student/pengumuman" // halaman list
                    getDetailHref={(a) => `/student/pengumuman/detail/${a.id}`} // detail per item
                  />
                </div>
              </div>
            </section>

            {isLoading && (
              <div className="text-sm opacity-70">Memuat data dashboard…</div>
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
      className="p-3 rounded-xl border"
      style={{ borderColor: palette.silver1, background: palette.white1 }}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs" style={{ color: palette.silver2 }}>
          {label}
        </div>
        <Badge palette={palette} variant={badgeVariant}>
          {label.includes("Tunggakan") ? "Perlu perhatian" : "OK"}
        </Badge>
      </div>
      <div className="text-lg font-semibold mt-1">{value}</div>
      {sub && (
        <div className="text-xs mt-0.5" style={{ color: palette.silver2 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
