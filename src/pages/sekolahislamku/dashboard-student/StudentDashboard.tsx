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
import { BookOpen, GraduationCap, UserCog, Users } from "lucide-react";
import {
  SectionCard,
 
} from "@/pages/sekolahislamku/components/ui/Primitives";



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
          <div className="text-xs" style={{ color: palette.black2 }}>
            {label}
          </div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
    </SectionCard>
  );
}
    
/* ---------- Fake API ---------- */
async function fetchParentHome() {
  const now = new Date();
  const todayISO = toLocalNoonISO(now); // ✅ “siang lokal”
  const inDays = (n: number) =>
    toLocalNoonISO(new Date(now.getTime() + n * 864e5));

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

  const todayScheduleItems: TodayScheduleItem[] = data?.sessionsToday?.length
    ? mapSessionsToTodaySchedule(
        // kalau mapper butuh ISO, pastikan “siang lokal”
        data.sessionsToday.map((s) => ({
          ...s,
          class_attendance_sessions_date: normalizeISOToLocalNoon(
            s.class_attendance_sessions_date
          )!,
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

      <main className="w-full px-4 md:px-6 py-4   md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
