import { useEffect, useMemo, useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Outlet, useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import axios from "@/lib/axios";
import { useEffectiveMasjidId } from "@/hooks/useEffectiveMasjidId";
import { openSidebarEvt, closeSidebarEvt } from "@/hooks/sidebarBus";


import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import TodayScheduleCard from "@/pages/sekolahislamku/components/card/TodayScheduleCard";
import AnnouncementsList from "@/pages/sekolahislamku/components/card/AnnouncementsListCard";
import BillsSectionCard from "@/pages/sekolahislamku/components/card/BillsSectionCard";

import {
  Users,
  UserCog,
  BookOpen,
  ArrowLeft,
  Wallet,
  GraduationCap,
  CalendarDays,
} from "lucide-react";

import {
  TodayScheduleItem,
  mapSessionsToTodaySchedule,
  mockTodaySchedule,
} from "./types/TodaySchedule";

/* ================= Types (API & UI) ================ */
export type AnnouncementUI = {
  id: string;
  title: string;
  date: string;
  body: string;
  themeId?: string | null;
  type?: "info" | "warning" | "success";
  slug?: string;
};

type AnnouncementAPI = {
  announcement_id: string;
  announcement_masjid_id: string;
  announcement_theme_id?: string | null;
  announcement_class_section_id?: string | null;
  announcement_created_by_user_id?: string | null;
  announcement_title: string;
  announcement_date: string;
  announcement_content: string;
  announcement_attachment_url?: string | null;
  announcement_is_active: boolean;
  announcement_created_at: string;
  theme?: { id: string; name: string; color?: string | null } | null;
};
type AnnouncementsAPIResponse = {
  data: AnnouncementAPI[];
  pagination: { limit: number; offset: number; total: number };
};

type AnnouncementThemeAPI = {
  announcement_themes_id: string;
  announcement_themes_masjid_id: string;
  announcement_themes_name: string;
  announcement_themes_slug: string;
  announcement_themes_color?: string | null;
  announcement_themes_description?: string | null;
  announcement_themes_is_active: boolean;
  announcement_themes_created_at: string;
};
type AnnouncementThemesListResponse = {
  data: AnnouncementThemeAPI[];
  pagination: { limit: number; offset: number; total: number };
};
type AnnouncementTheme = {
  id: string;
  name: string;
  color?: string | null;
  description?: string | null;
  slug?: string | null;
  isActive?: boolean;
  createdAt?: string;
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
  todaySchedule: TodayScheduleItem[];
  announcements: AnnouncementUI[];
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

type SessionsItem = {
  class_attendance_sessions_id: string;
  class_attendance_sessions_date: string;
  class_attendance_sessions_title: string;
  class_attendance_sessions_general_info?: string;
  class_attendance_sessions_note?: string;
};
type SessionsResponse = {
  message: string;
  data: { limit: number; offset: number; count: number; items: SessionsItem[] };
};

type SchoolDashboardProps = {
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
};
export type UpsertAnnouncementForm = {
  id?: string;
  title: string;
  date: string;
  body: string;
  themeId?: string | null;
};

/* ============ Query Keys ============ */
const QK = {
  HOME: ["school-home"] as const,
  STATS: ["lembaga-stats"] as const,
  TODAY_SESSIONS: (d: string) =>
    ["class-attendance-sessions", "today", d] as const,
  ANNOUNCEMENTS: ["announcements", "u"] as const,
  THEMES: ["announcement-themes"] as const,
};

/* ================= Utils ================ */
const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[_—–]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const themeToType = (a: AnnouncementAPI): AnnouncementUI["type"] => {
  const n = a.theme?.name?.toLowerCase() ?? "";
  if (n.includes("warning") || n.includes("perhatian")) return "warning";
  if (n.includes("success") || n.includes("berhasil")) return "success";
  return "info";
};

const yyyyMmDdLocal = (d = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};
const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();
const dateFmt = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";
const hijriLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

/* ============ Dummy Home ============ */
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
          title: "SPP Agustus - Kelas 3A",
          amount: 150_000,
          dueDate: new Date(now.getTime() + 5 * 864e5).toISOString(),
          status: "unpaid",
        },
        {
          id: "b102",
          title: "SPP Agustus - Kelas 4B",
          amount: 300_000,
          dueDate: new Date(now.getTime() + 3 * 864e5).toISOString(),
          status: "unpaid",
        },
        {
          id: "b103",
          title: "Seragam Baru",
          amount: 250_000,
          dueDate: new Date(now.getTime() + 9 * 864e5).toISOString(),
          status: "unpaid",
        },
      ],
    },
    todaySchedule: mockTodaySchedule,
    announcements: [],
    attendanceTodayByStatus: {
      hadir: 286,
      online: 8,
      sakit: 10,
      izin: 9,
      alpa: 7,
    },
  };
}

/* ============ Hooks ============ */
function useAnnouncements() {
  return useQuery<AnnouncementUI[]>({
    queryKey: QK.ANNOUNCEMENTS,
    queryFn: async () => {
      const res = await axios.get<AnnouncementsAPIResponse>(
        "/api/a/announcements",
        { params: { limit: 20, offset: 0 }, withCredentials: true }
      );
      const items = res.data?.data ?? [];
      return items.map<AnnouncementUI>((a) => ({
        id: a.announcement_id,
        title: a.announcement_title,
        date: a.announcement_date,
        body: a.announcement_content,
        themeId: a.announcement_theme_id ?? undefined,
        type: themeToType(a),
        slug: slugify(a.announcement_title),
      }));
    },
  });
}
function useAnnouncementThemes() {
  return useQuery<AnnouncementTheme[]>({
    queryKey: QK.THEMES,
    queryFn: async () => {
      const res = await axios.get<AnnouncementThemesListResponse>(
        "/api/a/announcement-themes",
        { params: { limit: 50, offset: 0 }, withCredentials: true }
      );
      return (
        res.data?.data.map<AnnouncementTheme>((t) => ({
          id: t.announcement_themes_id,
          name: t.announcement_themes_name,
          color: t.announcement_themes_color ?? undefined,
          description: t.announcement_themes_description ?? undefined,
          slug: t.announcement_themes_slug,
          isActive: t.announcement_themes_is_active,
          createdAt: t.announcement_themes_created_at,
        })) ?? []
      );
    },
  });
}
function useLembagaStats() {
  return useQuery<LembagaStats | null>({
    queryKey: QK.STATS,
    queryFn: async () => {
      const res = await axios.get<LembagaStatsResponse>(
        "/api/a/lembaga-stats",
        { withCredentials: true }
      );
      return res.data?.found ? res.data.data : null;
    },
  });
}
function useTodaySessions() {
  const today = yyyyMmDdLocal();
  return useQuery<SessionsItem[]>({
    queryKey: QK.TODAY_SESSIONS(today),
    queryFn: async () => {
      const res = await axios.get<SessionsResponse>(
        "/api/u/class-attendance-sessions",
        {
          params: { date_from: today, date_to: today, limit: 50, offset: 0 },
          withCredentials: true,
        }
      );
      return res.data?.data?.items ?? [];
    },
  });
}

/* ============ Shared UI ============ */
function Flash({
  palette,
  flash,
}: {
  palette: Palette;
  flash: { type: "success" | "error"; msg: string } | null;
}) {
  if (!flash) return null;
  const isOk = flash.type === "success";
  return (
    <div className="mx-auto max-w-6xl px-4">
      <div
        className="mb-3 rounded-lg px-3 py-2 text-sm"
        style={{
          background: isOk ? palette.success2 : palette.error2,
          color: isOk ? palette.success1 : palette.error1,
        }}
      >
        {flash.msg}
      </div>
    </div>
  );
}
function KpiTile({
  palette,
  label,
  value,
  icon,
}: {
  palette: Palette;
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}) {
  return (
    <SectionCard palette={palette}>
      <div className="p-4 md:p-5 flex items-center gap-3">
        <span
          className="h-10 w-10 grid place-items-center rounded-xl"
          style={{ background: palette.primary2, color: palette.primary }}
        >
          {icon}
        </span>
        <div>
          <div className="text-sm" style={{ color: palette.black2 }}>
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
          className="text-sm font-medium leading-tight md:flex-1 truncate"
          style={{ color: palette.black2 }}
        >
          {label}
        </div>
        <Badge
          palette={palette}
          variant={badgeVariant}
          className="flex-shrink-0 w-fit text-sm"
        >
          {label.includes("Tunggakan") ? "Perlu perhatian" : "OK"}
        </Badge>
      </div>
      <div className="text-lg md:text-xl font-semibold leading-tight mb-1">
        {value}
      </div>
      {sub && (
        <div
          className="text-sm leading-relaxed"
          style={{ color: palette.black2 }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}


/* ================= Page ================= */
const SchoolDashboard: React.FC<SchoolDashboardProps> = ({
  showBack = false,
  backTo,
  backLabel = "Kembali",
}) => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [flash, setFlash] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  useEffect(() => {
    if (flash) {
      const t = setTimeout(() => setFlash(null), 3000);
      return () => clearTimeout(t);
    }
  }, [flash]);

  useEffectiveMasjidId();

  const homeQ = useQuery({ queryKey: QK.HOME, queryFn: fetchSchoolHome });
  const statsQ = useLembagaStats();
  const todaySessionsQ = useTodaySessions();
  const announcementsQ = useAnnouncements();

  // Jadwal
  const scheduleItems: TodayScheduleItem[] = useMemo(() => {
    const apiItems = todaySessionsQ.data ?? [];
    return apiItems.length > 0
      ? mapSessionsToTodaySchedule(apiItems)
      : mockTodaySchedule;
  }, [todaySessionsQ.data]);



  const topbarGregorianISO = toLocalNoonISO(new Date());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);


  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Dashboard Sekolah"
        gregorianDate={topbarGregorianISO}
        hijriDate={hijriLong(topbarGregorianISO)}
        dateFmt={(iso) => dateFmt(iso)}
        
      />

      <Flash palette={palette} flash={flash} />

      {/* Main */}
      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar
              palette={palette}
              mode="auto"
              openMobile={mobileOpen}
              onCloseMobile={() => setMobileOpen(false)}
            />
          </aside>

          <section className="flex-1 flex flex-col space-y-6 min-w-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ">
              {[
                { label: "Guru", value: 26, icon: <UserCog size={18} /> },
                { label: "Siswa", value: 342, icon: <Users size={18} /> },
                {
                  label: "Program",
                  value: 12,
                  icon: <GraduationCap size={18} />,
                },
                { label: "Kelas", value: 18, icon: <BookOpen size={18} /> },
              ].map((k) => (
                <KpiTile
                  key={k.label}
                  palette={palette}
                  label={k.label}
                  value={k.value}
                  icon={k.icon}
                />
              ))}
            </div>
            {showBack && (
              <div className="flex py-2">
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                  className="inline-flex items-center gap-2"
                >
                  <ArrowLeft size={20} /> {backLabel}
                </Btn>
              </div>
            )}

            <Outlet />

            {/* Jadwal • Keuangan • Pengumuman */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
              {/* Jadwal */}
              <div className="col-span-1 md:col-span-6">
                <TodayScheduleCard
                  palette={palette}
                  items={scheduleItems}
                  seeAllPath="all-schedule"
                  title="Jadwal Hari Ini"
                  maxItems={3}
                />
                {(todaySessionsQ.isLoading || todaySessionsQ.isFetching) && (
                  <div className="px-4 pt-2 text-xs opacity-70">
                    Memuat jadwal hari ini…
                  </div>
                )}
              </div>

              {/* Keuangan */}
              <div className="md:col-span-1 lg:col-span-6 space-y-6 min-w-0">
                <SectionCard palette={palette}>
                  <div className="p-4 pb-1 font-medium flex items-center gap-2 mb-4">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center "
                      style={{
                        background: palette.white3,
                        color: palette.quaternary,
                      }}
                    >
                      <Wallet size={18} />
                    </div>
                    <h1 className="text-base font-semibold">
                      Snapshot Keuangan
                    </h1>
                  </div>
                  <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  seeAllPath="all-invoices"
                  seeAllState={{
                    bills: homeQ.data?.finance.outstandingBills ?? [],
                    heading: "Semua Tagihan",
                  }}
                />
              </div>

              {/* Pengumuman */}
              <div className="lg:col-span-12">
                <AnnouncementsList
                  palette={palette}
                  items={announcementsQ.data ?? homeQ.data?.announcements ?? []}
                  dateFmt={dateFmt}
                  seeAllPath="all-announcement"
                  getDetailHref={(a) => `/pengumuman/${a.slug ?? a.id}`}
                  showActions
                  canAdd
                />
                {(announcementsQ.isLoading || announcementsQ.isFetching) && (
                  <div className="px-4 pt-2 text-xs opacity-70">
                    Memuat pengumuman…
                  </div>
                )}
                {announcementsQ.isError && (
                  <div className="px-4 pt-2 text-xs opacity-70">
                    Gagal memuat pengumuman. Menampilkan data sementara.
                  </div>
                )}
              </div>
            </section>
          </section>
        </div>
      </main>
    </div>
  );
};
export default SchoolDashboard;
