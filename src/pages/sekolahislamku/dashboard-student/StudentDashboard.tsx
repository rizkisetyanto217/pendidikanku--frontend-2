// src/pages/sekolahislamku/dashboard-school/StudentDashboard.tsx
import { useQuery } from "@tanstack/react-query";
import { pickTheme, ThemeName, type Palette } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

import ParentTopBar from "../components/home/ParentTopBar";
import ParentSidebar from "../components/home/ParentSideBar";
import ChildSummaryCard from "@/pages/sekolahislamku/components/card/ChildSummaryCard";
import BillsSectionCard from "@/pages/sekolahislamku/components/card/BillsSectionCard";
import TodayScheduleCard from "@/pages/sekolahislamku/components/card/TodayScheduleCard";
import AnnouncementsList from "@/pages/sekolahislamku/components/card/AnnouncementsListCard";

import {
  TodayScheduleItem,
  mapSessionsToTodaySchedule,
  mockTodaySchedule,
} from "@/pages/sekolahislamku/dashboard-school/types/TodaySchedule";

/* ---------- Types ---------- */
interface ChildDetail {
  id: string;
  name: string;
  className: string;
  avatarUrl?: string;
  attendanceToday?: "present" | "online" | "absent" | null;
  memorizationJuz?: number;
  iqraLevel?: string;
  lastScore?: number;
}
interface Announcement {
  id: string;
  title: string;
  date: string;
  body: string;
  type?: "info" | "warning" | "success";
}
interface BillItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: "unpaid" | "paid" | "overdue";
}
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";
type AttendanceMode = "onsite" | "online";
interface TodaySummary {
  attendance: {
    status: AttendanceStatus;
    mode?: AttendanceMode;
    time?: string;
  };
  informasiUmum: string;
  nilai?: number;
  materiPersonal?: string;
  penilaianPersonal?: string;
  hafalan?: string;
  pr?: string;
}

/* ---------- Date helpers (timezone-safe) ---------- */
// jadikan Date ke pukul 12:00 waktu lokal
const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};
const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();
const normalizeISOToLocalNoon = (iso?: string) =>
  iso ? toLocalNoonISO(new Date(iso)) : undefined;

// formatter tampilan (pakai ISO yang sudah “siang lokal”)
const dateFmt = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

// hijriah (Umm al-Qura)
const hijriLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/* ---------- Fake API ---------- */
async function fetchParentHome() {
  const now = new Date();
  const todayISO = toLocalNoonISO(now); // ✅ “siang lokal”
  const inDays = (n: number) => toLocalNoonISO(new Date(now.getTime() + n * 864e5));

  return Promise.resolve({
    parentName: "Bapak/Ibu",
    // hijri dari server opsional — kita tetap hitung sendiri agar konsisten
    hijriDate: hijriLong(todayISO),
    gregorianDate: todayISO,
    child: {
      id: "c1",
      name: "Ahmad",
      className: "TPA A",
      attendanceToday: "present",
      memorizationJuz: 0.6,
      iqraLevel: "Iqra 2",
      lastScore: 88,
    } as ChildDetail,
    today: {
      attendance: { status: "hadir", mode: "onsite", time: "07:28" },
      informasiUmum:
        "Hari ini belajar ngaji & praktik sholat. Evaluasi wudhu dilakukan bergiliran.",
      nilai: 89,
      materiPersonal: "Membaca Al-Baqarah 255–257",
      penilaianPersonal:
        "Fokus meningkat, makhraj lebih baik; perhatikan mad thabi'i.",
      hafalan: "An-Naba 1–10",
      pr: "An-Naba 11–15 tambah hafalan",
    } as TodaySummary,
    announcements: [
      {
        id: "a1",
        title: "Ujian Tahfiz Pekan Depan",
        date: todayISO, // ✅
        body: "Mohon dampingi anak dalam muraja'ah surat Al-Balad s.d. Asy-Syams.",
        type: "info",
      },
    ] as Announcement[],
    bills: [
      {
        id: "b1",
        title: "SPP Agustus 2025",
        amount: 150000,
        dueDate: inDays(5), // ✅
        status: "unpaid",
      },
    ] as BillItem[],
    sessionsToday: [
      {
        class_attendance_sessions_title: "Tahsin Kelas",
        class_attendance_sessions_general_info: "Aula 1",
        class_attendance_sessions_date: todayISO, // ✅
      },
      {
        class_attendance_sessions_title: "Hafalan Juz 30",
        class_attendance_sessions_general_info: "R. Tahfiz",
        class_attendance_sessions_date: todayISO, // ✅
      },
    ],
  });
}

/* ---------- Helpers ---------- */
const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

/* ---------- Page ---------- */
export default function StudentDashboard() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const { data } = useQuery({
    queryKey: ["parent-home-single"],
    queryFn: fetchParentHome,
    staleTime: 60_000,
  });

  // normalisasi dulu (jaga-jaga kalau nanti dari API nyata)
  const gregorianISO =
    normalizeISOToLocalNoon(data?.gregorianDate) ?? toLocalNoonISO(new Date());

  const todayScheduleItems: TodayScheduleItem[] =
    data?.sessionsToday?.length
      ? mapSessionsToTodaySchedule(
          // kalau mapper butuh ISO, pastikan “siang lokal”
          data.sessionsToday.map((s) => ({
            ...s,
            class_attendance_sessions_date:
              normalizeISOToLocalNoon(s.class_attendance_sessions_date)!,
          }))
        )
      : mockTodaySchedule;

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={data?.parentName}
        gregorianDate={gregorianISO}              
        hijriDate={hijriLong(gregorianISO)}        
        dateFmt={dateFmt}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />

          <div className="flex-1 space-y-6">
            <section>
              <ChildSummaryCard
                child={data?.child}
                today={data?.today}
                palette={palette}
                detailPath="detail"
                detailState={{
                  child: data?.child,
                  today: data?.today,
                }}
                todayDisplay="compact"
              />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:items-stretch">
              <div className="lg:col-span-8">
                <BillsSectionCard
                  palette={palette}
                  bills={data?.bills ?? []}
                  dateFmt={(iso) => dateFmt(normalizeISOToLocalNoon(iso))}
                  formatIDR={formatIDR}
                  seeAllPath="finnance-list"
                  getPayHref={(b) => `tagihan/${b.id}`}
                />
              </div>

              <div className="lg:col-span-4">
                <TodayScheduleCard
                  palette={palette}
                  title="Jadwal Hari Ini"
                  items={todayScheduleItems}
                  seeAllPath="all-schedule"
                />
              </div>
            </section>

            <section>
              <AnnouncementsList
                palette={palette}
                items={data?.announcements ?? []}
                dateFmt={(iso) => dateFmt(normalizeISOToLocalNoon(iso))}
                seeAllPath="announcements"
                seeAllState={{
                  items: data?.announcements,
                  heading: "Semua Pengumuman",
                }}
                getDetailHref={(a) => `/murid/pengumuman/detail/${a.id}`}
                showActions={false}
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
