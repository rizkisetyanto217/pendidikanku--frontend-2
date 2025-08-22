// src/pages/sekolahislamku/pages/SchoolDashboard.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import axios from "@/lib/axios";
import { useEffectiveMasjidId } from "@/hooks/useEffectiveMasjidId";

import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";
import TodayScheduleCard from "@/pages/sekolahislamku/components/card/TodayScheduleCard";
import AnnouncementsList from "@/pages/sekolahislamku/components/card/AnnouncementsListCard";
import BillsSectionCard from "@/pages/sekolahislamku/components/card/BillsSectionCard";

import { Users, UserCog, BookOpen, CheckSquare, BarChart2 } from "lucide-react";
import SchoolSidebarNav from "../components/home/SchoolSideBarNav";

// ✅ import type + helper + mock jadwal
import {
  TodayScheduleItem,
  mapSessionsToTodaySchedule,
  mockTodaySchedule,
} from "./types/TodaySchedule";

/* ================= Types (API & UI) ================ */
export type AnnouncementUI = {
  id: string;
  title: string;
  date: string; // ISO
  body: string;
  themeId?: string | null;
  type?: "info" | "warning" | "success";
  slug?: string;
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
  // ❌ (tidak dipakai lagi untuk sumber data jadwal UI, tapi tetap ada untuk kompatibilitas)
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

/* ============ Query Keys ============ */
const QK = {
  HOME: ["school-home"] as const,
  STATS: ["lembaga-stats"] as const,
  TODAY_SESSIONS: (d: string) =>
    ["class-attendance-sessions", "today", d] as const,
  ANNOUNCEMENTS: ["announcements", "u"] as const,
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
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${y}-${m}-${day}`;
};

const isoToInputDate = (iso: string) => (iso ? iso.slice(0, 10) : "");
const inputDateToIsoUTC = (ymd: string) =>
  ymd ? new Date(`${ymd}T00:00:00.000Z`).toISOString() : "";

/* ============ Small shared UI ============ */
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

/* ============ Hooks: API Queries ============ */
function useAnnouncements() {
  return useQuery<AnnouncementUI[]>({
    queryKey: QK.ANNOUNCEMENTS,
    queryFn: async () => {
      const res = await axios.get<AnnouncementsAPIResponse>(
        "/api/u/announcements",
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
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
    retry: 1,
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
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
    retry: 1,
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
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
    retry: 1,
  });
}

/* ============ Dummy Home (fallback layout) ============ */
// 👉 now uses mockTodaySchedule for todaySchedule default
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
    todaySchedule: mockTodaySchedule, // ✅ pakai mock dari TodaySchedule.ts
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

/* ============ Small helpers ============ */
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

/* ============ Edit & Add Announcement Modals ============ */
export type EditAnnouncementForm = {
  id: string;
  title: string;
  date: string;
  body: string;
  themeId?: string | null;
};

function EditAnnouncementModal({
  open,
  onClose,
  initial,
  onSubmit,
  saving,
  error,
  palette,
}: {
  open: boolean;
  onClose: () => void;
  initial: EditAnnouncementForm | null;
  onSubmit: (v: EditAnnouncementForm) => void;
  saving?: boolean;
  error?: string | null;
  palette: Palette;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dateYmd, setDateYmd] = useState("");
  const [themeId, setThemeId] = useState("");

  useEffect(() => {
    if (!open || !initial) return;
    setTitle(initial.title ?? "");
    setBody(initial.body ?? "");
    setDateYmd(isoToInputDate(initial.date));
    setThemeId(initial.themeId ?? "");
  }, [open, initial]);

  if (!open) return null;
  const disabled = saving || !title.trim() || !dateYmd;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center"
      style={{ background: "rgba(0,0,0,.35)" }}
    >
      <SectionCard
        palette={palette}
        className="w-[min(720px,94vw)] p-4 md:p-5 rounded-2xl shadow-xl"
        style={{ background: palette.white1, color: palette.black1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Edit Pengumuman</h3>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm opacity-80">Judul</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: palette.silver2,
                background: palette.white2,
              }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul pengumuman"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm opacity-80">Tanggal</label>
            <input
              type="date"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: palette.silver2,
                background: palette.white2,
              }}
              value={dateYmd}
              onChange={(e) => setDateYmd(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm opacity-80">
              Tema (theme_id, opsional)
            </label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: palette.silver2,
                background: palette.white2,
              }}
              value={themeId}
              onChange={(e) => setThemeId(e.target.value)}
              placeholder="UUID tema (opsional)"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm opacity-80">Isi</label>
            <textarea
              rows={5}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: palette.silver2,
                background: palette.white2,
              }}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Konten pengumuman"
            />
          </div>

          {!!error && (
            <div className="text-sm" style={{ color: palette.error1 }}>
              {error}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Btn
            palette={palette}
            variant="ghost"
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </Btn>
          <Btn
            palette={palette}
            onClick={() => {
              if (!initial) return;
              onSubmit({
                id: initial.id,
                title: title.trim(),
                body: body.trim(),
                date: inputDateToIsoUTC(dateYmd),
                themeId: themeId?.trim() || undefined,
              });
            }}
            disabled={disabled}
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </Btn>
        </div>
      </SectionCard>
    </div>
  );
}

function AddAnnouncementModal({
  open,
  onClose,
  onSubmit,
  saving,
  error,
  palette,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (v: {
    title: string;
    date: string;
    body: string;
    themeId?: string | null;
  }) => void;
  saving?: boolean;
  error?: string | null;
  palette: Palette;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dateYmd, setDateYmd] = useState("");
  const [themeId, setThemeId] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setBody("");
      setDateYmd("");
      setThemeId("");
    }
  }, [open]);

  if (!open) return null;
  const disabled = saving || !title.trim() || !dateYmd;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center"
      style={{ background: "rgba(0,0,0,.35)" }}
    >
      <SectionCard
        palette={palette}
        className="w-[min(720px,94vw)] p-4 md:p-5 rounded-2xl shadow-xl"
        style={{ background: palette.white1, color: palette.black1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Tambah Pengumuman</h3>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm opacity-80">Judul</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: palette.silver2,
                background: palette.white2,
              }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul pengumuman"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm opacity-80">Tanggal</label>
            <input
              type="date"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: palette.silver2,
                background: palette.white2,
              }}
              value={dateYmd}
              onChange={(e) => setDateYmd(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm opacity-80">
              Tema (theme_id, opsional)
            </label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: palette.silver2,
                background: palette.white2,
              }}
              value={themeId}
              onChange={(e) => setThemeId(e.target.value)}
              placeholder="UUID tema (opsional)"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm opacity-80">Isi</label>
            <textarea
              rows={5}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: palette.silver2,
                background: palette.white2,
              }}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Konten pengumuman"
            />
          </div>

          {!!error && (
            <div className="text-sm" style={{ color: palette.error1 }}>
              {error}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Btn
            palette={palette}
            variant="ghost"
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </Btn>
          <Btn
            palette={palette}
            onClick={() =>
              onSubmit({
                title: title.trim(),
                body: body.trim(),
                date: new Date(`${dateYmd}T00:00:00.000Z`).toISOString(),
                themeId: themeId?.trim() || undefined,
              })
            }
            disabled={disabled}
          >
            {saving ? "Menyimpan…" : "Tambah"}
          </Btn>
        </div>
      </SectionCard>
    </div>
  );
}

/* ================= Page ================= */
export default function SchoolDashboard() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;
  const qc = useQueryClient();

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

  // Dummy home (layout & finance snapshot)
  const homeQ = useQuery({
    queryKey: QK.HOME,
    queryFn: fetchSchoolHome,
    staleTime: 60_000,
  });

  // Real APIs
  const statsQ = useLembagaStats();
  const todaySessionsQ = useTodaySessions();
  const announcementsQ = useAnnouncements();

  // Edit modal state
  const [editItem, setEditItem] = useState<AnnouncementUI | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Optimistic update helper
  const applyOptimistic = useCallback(
    (form: EditAnnouncementForm) => {
      qc.setQueryData<AnnouncementUI[] | undefined>(QK.ANNOUNCEMENTS, (prev) =>
        (prev ?? [])?.map((a) =>
          a.id === form.id
            ? {
                ...a,
                title: form.title,
                body: form.body,
                date: form.date,
                themeId: form.themeId,
              }
            : a
        )
      );
    },
    [qc]
  );

  type CreateAnnouncementForm = {
    title: string;
    date: string;
    body: string;
    themeId?: string | null;
  };

  const createMutation = useMutation({
    mutationFn: async (form: CreateAnnouncementForm) => {
      const dateOnly = form.date.slice(0, 10);
      const payload: any = {
        announcement_title: form.title,
        announcement_date: dateOnly,
        announcement_content: form.body,
      };
      if (form.themeId) payload.announcement_theme_id = form.themeId;
      await axios.post(`/api/u/announcements`, payload, {
        withCredentials: true,
      });
    },
    onSuccess: async (_, variables) => {
      setFlash({ type: "success", msg: "Pengumuman berhasil ditambah." });
      qc.setQueryData<AnnouncementUI[]>(QK.ANNOUNCEMENTS, (prev = []) => [
        {
          id: `temp-${Date.now()}`,
          title: variables.title,
          date: variables.date,
          body: variables.body,
          themeId: variables.themeId,
          type: "info",
          slug: slugify(variables.title),
        },
        ...(prev || []),
      ]);
      await qc.invalidateQueries({ queryKey: QK.ANNOUNCEMENTS });
      setCreateOpen(false);
    },
    onError: (err: any) =>
      setFlash({
        type: "error",
        msg: err?.response?.data?.message ?? "Gagal menambah pengumuman.",
      }),
  });

  const updateMutation = useMutation({
    mutationFn: async (form: EditAnnouncementForm) => {
      const dateOnly = form.date?.slice(0, 10);
      const payload: any = {
        announcement_title: form.title,
        announcement_date: dateOnly,
        announcement_content: form.body,
      };
      if (form.themeId) payload.announcement_theme_id = form.themeId;
      applyOptimistic({ ...form, date: dateOnly });
      await axios.put(`/api/u/announcements/${form.id}`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: async () => {
      setFlash({ type: "success", msg: "Pengumuman berhasil disimpan." });
      await qc.invalidateQueries({ queryKey: QK.ANNOUNCEMENTS });
      setEditItem(null);
    },
    onError: async (err: any) => {
      setFlash({
        type: "error",
        msg: err?.response?.data?.message ?? "Gagal menyimpan pengumuman.",
      });
      await qc.invalidateQueries({ queryKey: QK.ANNOUNCEMENTS });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/u/announcements/${id}`, {
        withCredentials: true,
      });
    },
    onSuccess: async () => {
      setFlash({ type: "success", msg: "Pengumuman dihapus." });
      await qc.invalidateQueries({ queryKey: QK.ANNOUNCEMENTS });
    },
    onError: (err: any) =>
      setFlash({
        type: "error",
        msg: err?.response?.data?.message ?? "Gagal menghapus.",
      }),
  });

  // KPI dari lembaga_stats
  const kpis = {
    students: statsQ.data?.lembaga_stats_active_students ?? 0,
    teachers: statsQ.data?.lembaga_stats_active_teachers ?? 0,
    program: statsQ.data?.lembaga_stats_active_classes ?? 0,
    class: statsQ.data?.lembaga_stats_active_sections ?? 0,
  };

  // Jadwal hari ini: gunakan API sessions; fallback ke mockTodaySchedule
  const scheduleItems: TodayScheduleItem[] = useMemo(() => {
    const apiItems = todaySessionsQ.data ?? [];
    if (apiItems.length > 0) return mapSessionsToTodaySchedule(apiItems);
    return mockTodaySchedule;
  }, [todaySessionsQ.data]);

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

      <Flash palette={palette} flash={flash} />

      {/* ====== CONTAINER ====== */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <SchoolSidebarNav palette={palette} />
          </aside>

          {/* Main */}
          <section className="lg:col-span-9 space-y-6 min-w-0">
            <Outlet />

            {/* ===== KPI ===== */}
            <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
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

            {/* ===== Jadwal • Keuangan • Pengumuman ===== */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch">
              {/* Jadwal */}
              <div className="md:col-span-1 lg:col-span-6">
                <TodayScheduleCard
                  palette={palette}
                  items={scheduleItems}
                  title="Jadwal Hari Ini"
                  maxItems={3} // tampil hanya 3 item
                  seeAllPath="all-schedule" // arahkan ke route AllSchedule
                  seeAllState={{
                    items: scheduleItems, // lempar semua data
                    heading: "Semua Jadwal Hari Ini",
                  }}
                />

                {(todaySessionsQ.isLoading || todaySessionsQ.isFetching) && (
                  <div className="px-4 pt-2 text-xs opacity-70">
                    Memuat jadwal hari ini…
                  </div>
                )}
              </div>

              {/* Keuangan */}
              <div className="md:col-span-1 lg:col-span-6 space-y-4 min-w-0">
                <SectionCard palette={palette}>
                  <div className="p-4 pb-1 font-medium">Snapshot Keuangan</div>
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
                  getPayHref={(b) => `/finance/bill/${b.id}`}
                  className="w-full"
                />
              </div>

              {/* Pengumuman (full width) */}
              <div className="lg:col-span-12">
                <AnnouncementsList
                  palette={palette}
                  items={announcementsQ.data ?? homeQ.data?.announcements ?? []}
                  dateFmt={dateFmt}
                  seeAllPath="all-announcement"
                  getDetailHref={(a) => `/pengumuman/${a.slug ?? a.id}`}
                  showActions
                  canAdd={true}
                  onAdd={() => setCreateOpen(true)}
                  onEdit={(a) => setEditItem(a)}
                  onDelete={(a) => {
                    if (deleteMutation.isPending) return;
                    const ok = confirm(`Hapus pengumuman "${a.title}"?`);
                    if (!ok) return;
                    deleteMutation.mutate(a.id);
                  }}
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

            {/* ===== Modals & states ===== */}
            <EditAnnouncementModal
              open={!!editItem}
              onClose={() => setEditItem(null)}
              palette={palette}
              initial={
                editItem
                  ? {
                      id: editItem.id,
                      title: editItem.title,
                      date: editItem.date,
                      body: editItem.body,
                      themeId: editItem.themeId,
                    }
                  : null
              }
              onSubmit={(form) => updateMutation.mutate(form)}
              saving={updateMutation.isPending}
              error={
                (updateMutation.error as any)?.response?.data?.message ??
                (updateMutation.error as any)?.message ??
                null
              }
            />

            {(homeQ.isLoading || statsQ.isLoading) && (
              <div className="text-sm opacity-70">Memuat data dashboard…</div>
            )}
            {statsQ.isError && (
              <div className="text-xs opacity-70">
                Gagal memuat statistik lembaga. Menampilkan data sementara.
              </div>
            )}
          </section>

          {/* Add modal ditempatkan di luar flow agar overlay full */}
          <AddAnnouncementModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            palette={palette}
            onSubmit={(form) => createMutation.mutate(form)}
            saving={createMutation.isPending}
            error={
              (createMutation.error as any)?.response?.data?.message ??
              (createMutation.error as any)?.message ??
              null
            }
          />
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
