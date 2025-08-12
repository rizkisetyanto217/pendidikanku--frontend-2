import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Bell,
  BookOpen,
  GraduationCap,
  User2,
  FileSpreadsheet,
  Wallet,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  NotebookPen,
  MessageSquare,
  Download,
  Plus,
} from "lucide-react";
import { colors } from "@/constants/colorsThema";
import PublicUserDropdown from "@/components/common/public/UserDropDown";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import ParentTopBar from "../components/home/ParentTopBar";

// + imports baru
import {
  SectionCard,
  Badge,
  Btn,
  ProgressBar,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ChildSummaryCard from "@/pages/sekolahislamku/components/card/ChildSummaryCard";
import BillsSectionCard from "@/pages/sekolahislamku/components/card/BillsSectionCard";
import TodayScheduleCard from "@/pages/sekolahislamku/components/card/TodayScheduleCard";
import AnnouncementsList from "@/pages/sekolahislamku/components/card/AnnouncementsListCard";

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
      {/* Top Bar */}
      <ParentTopBar
        palette={palette}
        parentName={data?.parentName}
        hijriDate={data?.hijriDate}
        gregorianDate={data?.gregorianDate}
        dateFmt={dateFmt}
      />

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/absensi">
            <Btn
              variant="secondary"
              className="w-full justify-start"
              palette={palette}
            >
              <ClipboardCheck className="mr-2" size={16} /> Lihat Absensi
            </Btn>
          </Link>
          <Link to="/tagihan">
            <Btn
              variant="secondary"
              className="w-full justify-start"
              palette={palette}
            >
              <Wallet className="mr-2" size={16} /> Tagihan & Pembayaran
            </Btn>
          </Link>
          <Link to="/rapor">
            <Btn
              variant="secondary"
              className="w-full justify-start"
              palette={palette}
            >
              <FileSpreadsheet className="mr-2" size={16} /> Rapor Nilai
            </Btn>
          </Link>
          <Link to="/komunikasi">
            <Btn
              variant="secondary"
              className="w-full justify-start"
              palette={palette}
            >
              <MessageSquare className="mr-2" size={16} /> Komunikasi Guru
            </Btn>
          </Link>
        </div>

        {/* Child Summary */}
        <section>
          <ChildSummaryCard
            child={child}
            palette={palette}
            detailPath="/student/student-progress"
            notePath="/student/student-progress"
            progressPath="/student/student-progress"
          />
        </section>

        {/* Bills & Payments + Today schedule */}
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
            seeAllPath="/student/schedule"
          />
        </section>

        {/* Announcements */}
        <section>
          <AnnouncementsList
            palette={palette}
            items={data?.announcements ?? []}
            dateFmt={dateFmt}
            seeAllPath="/student/announcement"
          />
        </section>
      </main>
    </div>
  );
}
