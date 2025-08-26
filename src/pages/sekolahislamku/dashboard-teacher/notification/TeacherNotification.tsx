// src/pages/sekolahislamku/TeacherDashboard.tsx
import { useMemo, useState } from "react";
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
  Bell,
  BellRing,
  CalendarClock,
  AlertCircle,
  CreditCard,
  X,
} from "lucide-react";

import MiniBar from "@/pages/sekolahislamku/components/ui/MiniBar";
import ParentSidebar from "../../components/home/ParentSideBar";

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
  time: string; // "HH:mm"
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
        title: "Tryout Ujian Tahfiz Sekarang ini deh`",
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
        <div className="text-sm truncate" style={{ color: palette.silver2 }}>
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

// Relatif time kecil untuk list notifikasi
function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
}

/* ================= Page ================= */
export default function TeacherNotification() {
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

  // ============ Notifikasi ============
  type NotifType = "announce" | "grading" | "schedule" | "payment" | "system";
  type Notif = {
    id: string;
    title: string;
    body?: string;
    date: string; // ISO
    type: NotifType;
    actionHref?: string;
  };

  const notifications = useMemo<Notif[]>(() => {
    const list: Notif[] = [];

    // Announcements -> announce
    (data?.announcements ?? []).forEach((a) => {
      list.push({
        id: `ann-${a.id}`,
        title: a.title,
        body: a.body,
        date: a.date,
        type: "announce",
        actionHref: `/guru/pengumuman/detail/${a.id}`,
      });
    });

    // Pending grading -> grading (pakai due date)
    (data?.pendingGradings ?? []).forEach((g) => {
      list.push({
        id: `grad-${g.id}`,
        title: `Penilaian: ${g.taskTitle} • ${g.className}`,
        body: `${g.submitted}/${g.total} terkumpul • batas ${dateFmtShort(g.dueDate)}`,
        date: g.dueDate ?? new Date().toISOString(),
        type: "grading",
        actionHref: `/guru/penilaian/${g.id}`,
      });
    });

    // Jadwal berikutnya dalam 2 jam → schedule
    const now = new Date();
    (data?.todayClasses ?? []).forEach((c) => {
      const [hh, mm] = c.time.split(":").map(Number);
      const slot = new Date(now);
      slot.setHours(hh, mm, 0, 0);
      const diff = slot.getTime() - now.getTime();
      if (diff >= -15 * 60 * 1000 && diff <= 2 * 60 * 60 * 1000) {
        list.push({
          id: `sched-${c.id}`,
          title: `Kelas ${c.className} • ${c.subject}`,
          body: `${c.time} • ${c.room ?? "—"}`,
          date: slot.toISOString(),
          type: "schedule",
          actionHref: "/guru/kelas/jadwal",
        });
      }
    });

    // (contoh) tagihan/payment bisa di-push di sini jika ada API-nya
    // list.push({ id: 'pay-1', title:'Tagihan SPP jatuh tempo', body:'SPP Agustus', date: new Date().toISOString(), type:'payment', actionHref:'/guru/pembayaran' })

    // sort terbaru dulu
    return list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [data?.announcements, data?.pendingGradings, data?.todayClasses]);

  const [notifOpen, setNotifOpen] = useState(false);
  const [read, setRead] = useState<Record<string, boolean>>({});
  const unreadCount = notifications.reduce(
    (n, x) => n + (read[x.id] ? 0 : 1),
    0
  );
  const markAllRead = () =>
    setRead((prev) => {
      const nx: Record<string, boolean> = { ...prev };
      notifications.forEach((n) => (nx[n.id] = true));
      return nx;
    });

  // ============ My classes (kiri tengah) ============
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

      {/* Tombol Bell mengambang (pojok kanan) */}
      <button
        aria-label="Notifikasi"
        onClick={() => setNotifOpen(true)}
        className="fixed right-4 top-20 md:right-6 md:top-24 z-50 rounded-full border shadow px-3 py-2 flex items-center gap-2"
        style={{ background: palette.white1, borderColor: palette.silver1 }}
      >
        {unreadCount > 0 ? (
          <BellRing size={18} color={palette.quaternary} />
        ) : (
          <Bell size={18} />
        )}
        <span className="text-sm">Notifikasi</span>
        {unreadCount > 0 && (
          <span
            className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-sm font-semibold"
            style={{ background: palette.secondary, color: palette.white1 }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Drawer Notifikasi (kanan) */}
      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        items={notifications}
        readMap={read}
        setReadMap={setRead}
        onMarkAllRead={markAllRead}
        palette={palette}
      />

      {/* Content + Sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />

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
                        key={k}
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

/* =================== Notif Drawer + Item =================== */
function NotificationsPanel({
  open,
  onClose,
  items,
  readMap,
  setReadMap,
  onMarkAllRead,
  palette,
}: {
  open: boolean;
  onClose: () => void;
  items: Array<{
    id: string;
    title: string;
    body?: string;
    date: string;
    type: "announce" | "grading" | "schedule" | "payment" | "system";
    actionHref?: string;
  }>;
  readMap: Record<string, boolean>;
  setReadMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onMarkAllRead: () => void;
  palette: Palette;
}) {
  return (
    <>
      {/* overlay */}
      <div
        className={`fixed inset-0 z-40 transition ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ background: "rgba(0,0,0,0.35)" }}
        onClick={onClose}
      />
      {/* drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full sm:w-[420px] max-w-full transform transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: palette.white2,
          borderLeft: `1px solid ${palette.silver1}`,
        }}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-medium">
            <Bell size={18} />
            Notifikasi
          </div>
          <div className="flex items-center gap-2">
            <Btn
              palette={palette}
              size="sm"
              variant="ghost"
              onClick={onMarkAllRead}
            >
              Tandai semua terbaca
            </Btn>
            <button
              aria-label="Tutup"
              onClick={onClose}
              className="rounded-lg p-2"
              style={{
                border: `1px solid ${palette.silver1}`,
                background: palette.white1,
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-3 pb-3">
          <input
            type="text"
            placeholder="Cari notifikasi…"
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{
              border: `1px solid ${palette.silver1}`,
              background: palette.white1,
            }}
            onChange={() => {}}
          />
        </div>

        <div className="h-[calc(100%-112px)] overflow-auto px-3 pb-6 space-y-2">
          {items.length === 0 && (
            <div className="text-sm px-2" style={{ color: palette.silver2 }}>
              Tidak ada notifikasi.
            </div>
          )}
          {items.map((n) => (
            <NotificationItem
              key={n.id}
              n={n}
              read={!!readMap[n.id]}
              onRead={() =>
                setReadMap((prev) => ({
                  ...prev,
                  [n.id]: true,
                }))
              }
              palette={palette}
            />
          ))}
        </div>
      </aside>
    </>
  );
}

function NotificationItem({
  n,
  read,
  onRead,
  palette,
}: {
  n: {
    id: string;
    title: string;
    body?: string;
    date: string;
    type: "announce" | "grading" | "schedule" | "payment" | "system";
    actionHref?: string;
  };
  read: boolean;
  onRead: () => void;
  palette: Palette;
}) {
  const icon = (() => {
    switch (n.type) {
      case "announce":
        return <Megaphone size={16} color={palette.quaternary} />;
      case "grading":
        return <ClipboardList size={16} color={palette.quaternary} />;
      case "schedule":
        return <CalendarClock size={16} color={palette.quaternary} />;
      case "payment":
        return <CreditCard size={16} color={palette.quaternary} />;
      default:
        return <AlertCircle size={16} color={palette.quaternary} />;
    }
  })();

  return (
    <div
      className="rounded-xl border p-3"
      style={{
        borderColor: palette.silver1,
        background: read ? palette.white1 : palette.white1,
        // bosmhadow: read ? "none" : "0 0 0 2px rgba(0,0,0,0.03) inset",
      }}
      onMouseEnter={() => !read && onRead()}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium truncate">{n.title}</div>
            <div
              className="text-sm shrink-0"
              style={{ color: palette.silver2 }}
            >
              {timeAgo(n.date)}
            </div>
          </div>
          {n.body && (
            <div
              className="text-sm mt-0.5 line-clamp-2"
              style={{ color: palette.silver2 }}
            >
              {n.body}
            </div>
          )}
          <div className="mt-2 flex items-center gap-2">
            {n.actionHref ? (
              <NavLink to={n.actionHref}>
                <Btn palette={palette} size="sm">
                  Lihat
                </Btn>
              </NavLink>
            ) : (
              <Btn palette={palette} size="sm" variant="ghost" onClick={onRead}>
                Tandai terbaca
              </Btn>
            )}
            {!read && (
              <span
                className="ml-auto h-2 w-2 rounded-full"
                style={{ background: palette.secondary }}
                title="Belum dibaca"
              />
            )}
          </div>
        </div>
      </div>
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
      <div className="text-sm" style={{ color: palette.silver2 }}>
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
          <div className="text-sm mt-0.5" style={{ color: palette.silver2 }}>
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
