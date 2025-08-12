import { useQuery } from "@tanstack/react-query";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import ParentTopBar from "../components/home/ParentTopBar";

import ChildSummaryCard from "@/pages/sekolahislamku/components/card/ChildSummaryCard";
import BillsSectionCard from "@/pages/sekolahislamku/components/card/BillsSectionCard";
import TodayScheduleCard from "@/pages/sekolahislamku/components/card/TodayScheduleCard";
import AnnouncementsList from "@/pages/sekolahislamku/components/card/AnnouncementsListCard";
import ParentSidebarNav from "../components/home/ParentSideBarNav";

// --- Types ---
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

// --- Types tambahan (taruh dekat blok Types kamu)
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";
type AttendanceMode = "onsite" | "online";
interface TodaySummary {
  attendance: {
    status: AttendanceStatus; // Wajib
    mode?: AttendanceMode;
    time?: string;
  };
  informasiUmum: string; // Wajib
  nilai?: number; // Opsional
  materiPersonal?: string; // Opsional
  penilaianPersonal?: string; // Opsional
  hafalan?: string; // Opsional
  pr?: string; // Opsional
}

// --- Fake API layer (replace with axios) ---
async function fetchParentHome() {
  return Promise.resolve({
    parentName: "Bapak/Ibu",
    hijriDate: "16 Muharram 1447 H",
    gregorianDate: new Date().toISOString(),
    child: {
      id: "c1",
      name: "Ahmad",
      className: "TPA A",
      attendanceToday: "present",
      memorizationJuz: 0.6,
      iqraLevel: "Iqra 2",
      lastScore: 88,
    } as ChildDetail,

    // ⬇️ DATA DUMMY HARI INI
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
        date: new Date().toISOString(),
        body: "Mohon dampingi anak dalam muraja'ah surat Al-Balad s.d. Asy-Syams.",
        type: "info",
      },
    ] as Announcement[],

    bills: [
      {
        id: "b1",
        title: "SPP Agustus 2025",
        amount: 150000,
        dueDate: new Date(
          new Date().setDate(new Date().getDate() + 5)
        ).toISOString(),
        status: "unpaid",
      },
    ] as BillItem[],

    todaySchedule: [
      { time: "07:30", title: "Tahsin Kelas", room: "Aula 1" },
      { time: "09:30", title: "Hafalan Juz 30", room: "R. Tahfiz" },
    ] as { time: string; title: string; room?: string }[],
  });
}

// --- Helpers ---
const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// --- Page ---
export default function StudentDashboard() {
  const { isDark } = useHtmlDarkMode();
  const palette = isDark ? colors.dark : colors.light;

  const { data } = useQuery({
    queryKey: ["parent-home-single"],
    queryFn: fetchParentHome,
    staleTime: 60_000,
  });

  const child = data?.child;
  const unpaidBills = (data?.bills ?? []).filter((b) => b.status !== "paid");

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        parentName={data?.parentName}
        hijriDate={data?.hijriDate}
        gregorianDate={data?.gregorianDate}
        dateFmt={dateFmt}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          {/* Sidebar kiri hanya tampil di PC */}
          <ParentSidebarNav palette={palette} />

          {/* Konten utama */}
          <div className="flex-1 space-y-6">
            <section>
              <ChildSummaryCard
                child={data?.child}
                today={data?.today}
                palette={palette}
                detailPath="/student/progress"
                todayDisplay="compact"
              />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <BillsSectionCard
                palette={palette}
                bills={data?.bills ?? []}
                dateFmt={dateFmt}
                formatIDR={formatIDR}
                seeAllPath="/student/finance"
                getPayHref={(b) => `/tagihan/${b.id}`}
              />
              <TodayScheduleCard
                palette={palette}
                items={data?.todaySchedule ?? []}
                seeAllPath="/student/jadwal"
              />
            </section>

            <section>
              <AnnouncementsList
                palette={palette}
                items={data?.announcements ?? []}
                dateFmt={dateFmt}
                seeAllPath="/student/pengumuman"
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
