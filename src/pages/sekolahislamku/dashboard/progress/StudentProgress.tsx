// src/pages/ParentChildDetail.tsx
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  BookOpen,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  MessageSquare,
  NotebookPen,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";

// pakai primitives yang SUDAH ada
import {
  SectionCard,
  Badge,
  Btn,
  ProgressBar,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import PublicUserDropdown from "@/components/common/public/UserDropDown";

/* ===== Types ===== */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

interface ChildDetail {
  id: string;
  name: string;
  className: string;
  iqraLevel?: string;
  memorizationJuz?: number;
  lastScore?: number;
}

interface TodaySummary {
  attendance: {
    status: AttendanceStatus;
    mode?: "onsite" | "online";
    time?: string;
  };
  nilai?: number;
  informasiUmum: string; // wajib
  materiPersonal?: string;
  penilaianPersonal?: string;
  hafalan?: string;
}

interface AttendanceLog {
  date: string; // ISO
  status: AttendanceStatus;
  mode?: "onsite" | "online";
  time?: string;
}

interface NoteLog {
  date: string; // ISO
  informasiUmum: string;
  materiPersonal?: string;
  penilaianPersonal?: string;
  nilai?: number;
  hafalan?: string;
}

interface FetchResult {
  child: ChildDetail;
  stats: {
    hadirCount: number;
    totalSessions: number;
    avgScore?: number;
    memorizationJuz?: number;
    iqraLevel?: string;
  };
  today: TodaySummary | null;
  attendanceHistory: AttendanceLog[];
  notesHistory: NoteLog[];
  contacts: { teacherName: string; phone?: string; email?: string };
}

/* ===== Fake API ===== */
async function fetchChildDetail(): Promise<FetchResult> {
  const todayIso = new Date().toISOString();
  const addDays = (n: number) => new Date(Date.now() - n * 864e5).toISOString();

  return {
    child: {
      id: "c1",
      name: "Ahmad",
      className: "TPA A",
      iqraLevel: "Iqra 2",
      memorizationJuz: 0.6,
      lastScore: 88,
    },
    stats: {
      hadirCount: 18,
      totalSessions: 20,
      avgScore: 86,
      memorizationJuz: 0.6,
      iqraLevel: "Iqra 2",
    },
    today: {
      attendance: { status: "hadir", mode: "onsite", time: "07:28" },
      nilai: 92,
      informasiUmum: "Hari ini praktik sholat dan evaluasi wudhu.",
      materiPersonal: "Membaca Al-Baqarah 255–257",
      penilaianPersonal: "Fokus meningkat, makhraj semakin baik.",
      hafalan: "An-Naba 1–10",
    },
    attendanceHistory: [
      { date: todayIso, status: "hadir", mode: "onsite", time: "07:28" },
      { date: addDays(1), status: "hadir", mode: "online", time: "07:35" },
      { date: addDays(2), status: "izin" },
      { date: addDays(3), status: "hadir", mode: "onsite", time: "07:31" },
      { date: addDays(4), status: "sakit" },
      { date: addDays(5), status: "hadir", mode: "onsite", time: "07:29" },
      { date: addDays(6), status: "hadir", mode: "onsite", time: "07:33" },
    ],
    notesHistory: [
      {
        date: addDays(1),
        informasiUmum: "Latihan tajwid: mad thabi'i.",
        materiPersonal: "Muroja'ah Iqra 2 halaman 10–12",
        nilai: 90,
      },
      {
        date: addDays(3),
        informasiUmum: "Praktik adab di kelas.",
        penilaianPersonal:
          "Perlu diingatkan tidak bercanda saat teman membaca.",
      },
    ],
    contacts: {
      teacherName: "Ustadz Ali",
      phone: "+62 812-1111-2222",
      email: "ust.ali@sekolahislamku.id",
    },
  };
}

/* ===== Helpers ===== */
const dateLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
const dateShort = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

/* ===== Page ===== */
export default function StudentProgress() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  const { data } = useQuery({
    queryKey: ["parent-child-detail"],
    queryFn: fetchChildDetail,
    staleTime: 60_000,
  });

  const child = data?.child;

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top Bar (pakai primitives Btn untuk back) */}
      <div
        className="sticky top-0 z-40 border-b"
        style={{
          background: `${palette.white1}E6`,
          borderColor: palette.silver1,
        }}
      >
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link to="/student">
              <Btn variant="outline" size="sm" palette={palette}>
                <ArrowLeft size={16} />
              </Btn>
            </Link>

            {/* sejajarkan label + nama */}
            <div className="pl-1 flex items-center gap-2 min-w-0">
              <span className="text-sm" style={{ color: palette.silver2 }}>
                Detail Anak
              </span>
              <span
                className="hidden sm:inline-block w-1 h-1 rounded-full"
                style={{ background: palette.silver2 }}
              />
              <span className="font-semibold truncate max-w-[50vw]">
                {child?.name ?? "—"}
              </span>
            </div>
          </div>

          <PublicUserDropdown variant="icon" />
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Header + quick actions + stats */}
        <SectionCard palette={palette} className="p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ background: palette.primary2 }}
              >
                <BookOpen size={18} color={palette.primary} />
              </div>
              <div>
                <div className="font-semibold flex items-center gap-2">
                  {child?.name ?? "—"}
                  <Badge variant="outline" palette={palette}>
                    {child?.className ?? "Kelas"}
                  </Badge>
                </div>
                <div className="text-sm" style={{ color: palette.silver2 }}>
                  {dateLong(new Date().toISOString())}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:flex-row">
              <Link to="/anak/progress" className="w-full md:w-auto">
                <Btn
                  size="sm"
                  variant="secondary"
                  palette={palette}
                  className="w-full md:w-auto"
                >
                  <FileSpreadsheet size={16} /> Lihat Rapor
                </Btn>
              </Link>
              <Link to="/komunikasi" className="w-full md:w-auto">
                <Btn
                  size="sm"
                  variant="outline"
                  palette={palette}
                  className="w-full md:w-auto"
                >
                  <MessageSquare size={16} /> Chat Guru
                </Btn>
              </Link>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <SectionCard
              palette={palette}
              className="p-3"
              style={{ background: palette.white2 }}
            >
              <div className="text-xs" style={{ color: palette.silver2 }}>
                Kehadiran
              </div>
              <div className="mt-1 text-sm">
                {data?.stats.hadirCount}/{data?.stats.totalSessions} sesi
              </div>
            </SectionCard>

            <SectionCard
              palette={palette}
              className="p-3"
              style={{ background: palette.white2 }}
            >
              <div className="text-xs" style={{ color: palette.silver2 }}>
                Hafalan
              </div>
              <div className="mt-2">
                <ProgressBar
                  value={
                    (Math.min(2, data?.stats.memorizationJuz ?? 0) / 2) * 100
                  }
                  palette={palette}
                />
                <div
                  className="mt-1 text-xs"
                  style={{ color: palette.silver2 }}
                >
                  ~ {data?.stats.memorizationJuz ?? 0} Juz
                </div>
              </div>
            </SectionCard>

            <SectionCard
              palette={palette}
              className="p-3"
              style={{ background: palette.white2 }}
            >
              <div className="text-xs" style={{ color: palette.silver2 }}>
                Nilai Rata-rata
              </div>
              <div className="mt-1 text-lg font-semibold">
                {data?.stats.avgScore ?? "-"}
              </div>
            </SectionCard>
          </div>
        </SectionCard>

        {/* Ringkasan Hari Ini */}
        {data?.today && (
          <SectionCard palette={palette} className="p-4 md:p-5">
            <div className="font-medium mb-3 flex items-center gap-2">
              <CalendarDays size={18} color={palette.quaternary} /> Ringkasan
              Hari Ini
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SectionCard
                palette={palette}
                className="p-3"
                style={{ background: palette.white2 }}
              >
                <div className="text-xs" style={{ color: palette.silver2 }}>
                  Absensi
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {data.today.attendance.status === "hadir" && (
                    <Badge variant="success" palette={palette}>
                      <CheckCircle2 size={12} className="mr-1" /> Hadir
                    </Badge>
                  )}
                  {data.today.attendance.status === "online" && (
                    <Badge variant="info" palette={palette}>
                      <Clock size={12} className="mr-1" /> Online
                    </Badge>
                  )}
                  {data.today.attendance.status === "sakit" && (
                    <Badge variant="warning" palette={palette}>
                      Sakit
                    </Badge>
                  )}
                  {data.today.attendance.status === "izin" && (
                    <Badge variant="secondary" palette={palette}>
                      Izin
                    </Badge>
                  )}
                  {data.today.attendance.status === "alpa" && (
                    <Badge variant="destructive" palette={palette}>
                      Alpa
                    </Badge>
                  )}
                  {data.today.attendance.time ? (
                    <span
                      className="text-xs"
                      style={{ color: palette.silver2 }}
                    >
                      • {data.today.attendance.time}
                    </span>
                  ) : null}
                </div>
              </SectionCard>

              <SectionCard
                palette={palette}
                className="p-3"
                style={{ background: palette.white2 }}
              >
                <div className="text-xs" style={{ color: palette.silver2 }}>
                  Nilai
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {data.today.nilai ?? "-"}
                </div>
              </SectionCard>

              <SectionCard
                palette={palette}
                className="p-3"
                style={{ background: palette.white2 }}
              >
                <div className="text-xs" style={{ color: palette.silver2 }}>
                  Hafalan
                </div>
                <div className="mt-2 text-sm">{data.today.hafalan ?? "-"}</div>
              </SectionCard>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <SectionCard
                palette={palette}
                className="p-3"
                style={{ background: palette.white2 }}
              >
                <div className="text-xs" style={{ color: palette.silver2 }}>
                  Informasi Umum
                </div>
                <p className="mt-1 text-sm">{data.today.informasiUmum}</p>
              </SectionCard>

              {(data.today.materiPersonal || data.today.penilaianPersonal) && (
                <SectionCard
                  palette={palette}
                  className="p-3"
                  style={{ background: palette.white2 }}
                >
                  <div className="text-xs" style={{ color: palette.silver2 }}>
                    Catatan Personal
                  </div>
                  {data.today.materiPersonal && (
                    <p className="mt-1 text-sm">
                      <span className="font-medium">Materi:</span>{" "}
                      {data.today.materiPersonal}
                    </p>
                  )}
                  {data.today.penilaianPersonal && (
                    <p className="mt-1 text-sm">
                      <span className="font-medium">Penilaian:</span>{" "}
                      {data.today.penilaianPersonal}
                    </p>
                  )}
                </SectionCard>
              )}
            </div>
          </SectionCard>
        )}

        {/* Riwayat Absensi */}
        <SectionCard palette={palette} className="p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-medium flex items-center gap-2">
              <CalendarDays size={18} color={palette.quaternary} />
              Riwayat Absensi (7 Hari)
            </div>

            <Link to={`/absensi${child?.id ? `?child=${child.id}` : ""}`}>
              <Btn variant="secondary" size="sm" palette={palette}>
                Lihat selengkapnya  <ChevronRight className="ml-1" size={16} />
              </Btn>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {(data?.attendanceHistory ?? []).map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border px-3 py-2"
                style={{
                  borderColor: palette.silver1,
                  background: palette.white2,
                }}
              >
                <div className="text-sm">
                  <div className="font-medium">{dateShort(a.date)}</div>
                  <div className="text-xs" style={{ color: palette.silver2 }}>
                    {a.mode
                      ? a.mode === "onsite"
                        ? "Tatap muka"
                        : "Online"
                      : ""}{" "}
                    {a.time ? `• ${a.time}` : ""}
                  </div>
                </div>
                <div>
                  {a.status === "hadir" && (
                    <Badge variant="success" palette={palette}>
                      Hadir
                    </Badge>
                  )}
                  {a.status === "online" && (
                    <Badge variant="info" palette={palette}>
                      Online
                    </Badge>
                  )}
                  {a.status === "izin" && (
                    <Badge variant="secondary" palette={palette}>
                      Izin
                    </Badge>
                  )}
                  {a.status === "sakit" && (
                    <Badge variant="warning" palette={palette}>
                      Sakit
                    </Badge>
                  )}
                  {a.status === "alpa" && (
                    <Badge variant="destructive" palette={palette}>
                      Alpa
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Riwayat Catatan & Hafalan */}
        <SectionCard palette={palette} className="p-4 md:p-5">
          <div className="font-medium mb-3 flex items-center gap-2">
            <NotebookPen size={18} color={palette.quaternary} /> Riwayat Catatan
            & Hafalan
          </div>
          <div className="grid grid-cols-1 gap-3">
            {(data?.notesHistory ?? []).map((n, i) => (
              <div
                key={i}
                className="rounded-xl border p-3"
                style={{
                  borderColor: palette.silver1,
                  background: palette.white2,
                }}
              >
                <div
                  className="text-xs mb-1"
                  style={{ color: palette.silver2 }}
                >
                  {dateLong(n.date)}
                </div>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Info Umum:</span>{" "}
                    {n.informasiUmum}
                  </div>
                  {n.materiPersonal && (
                    <div>
                      <span className="font-medium">Materi:</span>{" "}
                      {n.materiPersonal}
                    </div>
                  )}
                  {n.hafalan && (
                    <div>
                      <span className="font-medium">Hafalan:</span> {n.hafalan}
                    </div>
                  )}
                  {n.penilaianPersonal && (
                    <div>
                      <span className="font-medium">Penilaian:</span>{" "}
                      {n.penilaianPersonal}
                    </div>
                  )}
                  {typeof n.nilai === "number" && (
                    <div>
                      <span className="font-medium">Nilai:</span> {n.nilai}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Kontak Guru */}
        <SectionCard palette={palette} className="p-4 md:p-5">
          <div className="font-medium mb-3 flex items-center gap-2">
            <MessageSquare size={18} color={palette.quaternary} /> Kontak Guru
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="font-medium">{data?.contacts.teacherName}</div>
              <div
                className="flex items-center gap-3 text-sm"
                style={{ color: palette.silver2 }}
              >
                {data?.contacts.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone size={14} /> {data.contacts.phone}
                  </span>
                )}
                {data?.contacts.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail size={14} /> {data.contacts.email}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 md:flex-row">
              <Link to="/komunikasi" className="w-full md:w-auto">
                <Btn
                  variant="outline"
                  palette={palette}
                  className="w-full md:w-auto"
                >
                  <MessageSquare size={16} /> Kirim Pesan
                </Btn>
              </Link>
              <Link to="/rapor" className="w-full md:w-auto">
                <Btn
                  variant="secondary"
                  palette={palette}
                  className="w-full md:w-auto"
                >
                  <FileSpreadsheet size={16} /> Lihat Rapor
                </Btn>
              </Link>
            </div>
          </div>
        </SectionCard>
      </main>
    </div>
  );
}
