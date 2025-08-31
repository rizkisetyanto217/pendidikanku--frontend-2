// src/pages/StudentAbsenceDetail.tsx
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Filter, Percent } from "lucide-react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Badge,
  Btn,
  ProgressBar,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import { useMemo } from "react";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

/* ================= Types ================= */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";
type AttendanceStatusFilter = AttendanceStatus | "all";
type AttendanceMode = "onsite" | "online";
type AttendanceModeFilter = AttendanceMode | "all";

interface AttendanceLog {
  date: string; // ISO
  status: AttendanceStatus;
  mode?: AttendanceMode;
  time?: string;
}

type Stats = { total: number } & Record<AttendanceStatus, number>;

interface AbsenceFetch {
  student: { id: string; name: string; className: string };
  stats: Stats;
  logs: AttendanceLog[];
}

/* =============== Constants/Helpers =============== */
const STATUS_LABEL: Record<AttendanceStatus, string> = {
  hadir: "Hadir",
  online: "Online",
  izin: "Izin",
  sakit: "Sakit",
  alpa: "Alpa",
};
const STATUS_BADGE: Record<
  AttendanceStatus,
  "success" | "info" | "secondary" | "warning" | "destructive"
> = {
  hadir: "success",
  online: "info",
  izin: "secondary",
  sakit: "warning",
  alpa: "destructive",
};

const dateLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
const dateShort = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
const topbarDateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/* ================= Dummy API ================= */
const toIso = (d: Date) => d.toISOString();
const makeDay = (dOffset: number) => new Date(Date.now() - dOffset * 864e5);

function statusFor(i: number): AttendanceStatus {
  if (i % 9 === 2) return "izin";
  if (i % 9 === 4) return "sakit";
  if (i % 11 === 6) return "alpa";
  if (i % 5 === 1) return "online";
  return "hadir";
}
function timeFor(status: AttendanceStatus): string | undefined {
  if (status === "hadir" || status === "online") {
    const hh = 7;
    const mm = 25 + Math.floor(Math.random() * 10);
    return `${hh.toString().padStart(2, "0")}:${mm}`;
  }
  return undefined;
}
function modeFor(status: AttendanceStatus): AttendanceMode | undefined {
  if (status === "hadir") return "onsite";
  if (status === "online") return "online";
  return undefined;
}

async function fetchAbsence(
  childId?: string,
  days = 30
): Promise<AbsenceFetch> {
  const logs: AttendanceLog[] = Array.from({ length: days }).map((_, idx) => {
    const st = statusFor(idx);
    return {
      date: toIso(makeDay(idx)),
      status: st,
      mode: modeFor(st),
      time: timeFor(st),
    };
  });

  const stats = logs.reduce<Stats>(
    (acc, l) => {
      acc.total += 1;
      acc[l.status] += 1;
      return acc;
    },
    { total: 0, hadir: 0, online: 0, izin: 0, sakit: 0, alpa: 0 }
  );

  return {
    student: { id: childId ?? "c1", name: "Ahmad", className: "TPA A" },
    stats,
    logs,
  };
}

/* ================= Page ================= */
export default function StudentAbsence() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const childId = sp.get("child") ?? undefined;

  // Parse query params safely
  const rawPeriod = sp.get("period");
  const period: "7" | "30" | "all" =
    rawPeriod === "7" || rawPeriod === "all" ? rawPeriod : "30";

  const asStatusFilter = (v: string | null): AttendanceStatusFilter =>
    v === "all" ||
    v === "hadir" ||
    v === "online" ||
    v === "izin" ||
    v === "sakit" ||
    v === "alpa"
      ? v
      : "all";
  const asModeFilter = (v: string | null): AttendanceModeFilter =>
    v === "all" || v === "onsite" || v === "online" ? v : "all";

  const status: AttendanceStatusFilter = asStatusFilter(sp.get("status"));
  const mode: AttendanceModeFilter = asModeFilter(sp.get("mode"));

  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const { data: s } = useQuery({
    queryKey: ["student-absence", childId, period],
    queryFn: () =>
      fetchAbsence(childId, period === "all" ? 60 : Number(period)),
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    if (!s) return [];
    return s.logs.filter((l) => {
      const matchStatus = status === "all" ? true : l.status === status;
      const matchMode = mode === "all" ? true : l.mode === mode;
      return matchStatus && matchMode;
    });
  }, [s, status, mode]);

  const handleChange = (key: "period" | "status" | "mode", value: string) => {
    const next = new URLSearchParams(sp);
    next.set(key, value);
    setSp(next, { replace: true });
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top Bar pakai parent */}
      <ParentTopBar
        palette={palette}
        title="Riwayat Absensi"
        gregorianDate={new Date().toISOString()}
        dateFmt={topbarDateFmt}
      />

      {/* Content + Sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          {/* Sidebar kiri (PC) */}
          <ParentSidebar palette={palette} />

          {/* Konten utama */}
          <div className="flex-1 space-y-6">
            <Btn
              palette={palette}
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} className="mr-1" />
              Kembali
            </Btn>
            {/* Ringkasan */}
            <SectionCard palette={palette} className="p-4 md:p-5">
              <div className="font-medium mb-3 flex items-center gap-2">
                <CalendarDays size={18} color={palette.quaternary} /> Ringkasan
              </div>
              {s && (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  {(
                    [
                      { key: "hadir" as const, label: "Hadir" },
                      { key: "online" as const, label: "Online" },
                      { key: "izin" as const, label: "Izin" },
                      { key: "sakit" as const, label: "Sakit" },
                      { key: "alpa" as const, label: "Alpa" },
                    ] as const
                  ).map(({ key, label }) => {
                    const value = s.stats[key];
                    const pct =
                      s.stats.total === 0
                        ? 0
                        : Math.round((value / s.stats.total) * 100);
                    return (
                      <SectionCard
                        key={key}
                        palette={palette}
                        className="p-3"
                        style={{ background: palette.white2 }}
                      >
                        <div
                          className="text-xs"
                          style={{ color: palette.silver2 }}
                        >
                          {label}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant={STATUS_BADGE[key]} palette={palette}>
                            {value}
                          </Badge>
                          <span
                            className="text-xs inline-flex items-center gap-1"
                            style={{ color: palette.silver2 }}
                          >
                            <Percent size={12} /> {pct}%
                          </span>
                        </div>
                        <div className="mt-2">
                          <ProgressBar value={pct} palette={palette} />
                        </div>
                      </SectionCard>
                    );
                  })}

                  <SectionCard
                    palette={palette}
                    className="p-3"
                    style={{ background: palette.white2 }}
                  >
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      Total Sesi
                    </div>
                    <div className="mt-1">
                      <Badge variant="outline" palette={palette}>
                        {s.stats.total}
                      </Badge>
                    </div>
                  </SectionCard>
                </div>
              )}
            </SectionCard>

            {/* Filter */}
            <SectionCard palette={palette} className="p-4 md:p-5">
              <div className="font-medium mb-3 flex items-center gap-2">
                <Filter size={18} color={palette.quaternary} /> Filter
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: palette.silver2 }}>
                    Periode
                  </label>
                  <select
                    value={period}
                    onChange={(e) => handleChange("period", e.target.value)}
                    className="rounded-lg border px-3 py-2 bg-transparent"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <option value="7">7 hari terakhir</option>
                    <option value="30">30 hari terakhir</option>
                    <option value="all">Semua (60 hari)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: palette.silver2 }}>
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="rounded-lg border px-3 py-2 bg-transparent"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <option value="all">Semua</option>
                    <option value="hadir">Hadir</option>
                    <option value="online">Online</option>
                    <option value="izin">Izin</option>
                    <option value="sakit">Sakit</option>
                    <option value="alpa">Alpa</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: palette.silver2 }}>
                    Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => handleChange("mode", e.target.value)}
                    className="rounded-lg border px-3 py-2 bg-transparent"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <option value="all">Semua</option>
                    <option value="onsite">Tatap muka</option>
                    <option value="online">Online</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* List Absensi */}
            <SectionCard palette={palette} className="p-4 md:p-5">
              <div className="font-medium mb-3 flex items-center gap-2">
                <CalendarDays size={18} color={palette.quaternary} /> Daftar
                Absensi
              </div>

              <div className="grid grid-cols-1 gap-2">
                {filtered.length === 0 && (
                  <div
                    className="rounded-xl border px-3 py-3 text-sm"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white2,
                      color: palette.silver2,
                    }}
                  >
                    Tidak ada data untuk filter saat ini.
                  </div>
                )}

                {filtered.map((a) => (
                  <div
                    key={a.date}
                    className="flex items-center justify-between rounded-xl border px-3 py-2"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white2,
                    }}
                  >
                    <div className="text-sm">
                      <div className="font-medium">{dateShort(a.date)}</div>
                      <div
                        className="text-xs"
                        style={{ color: palette.silver2 }}
                      >
                        {a.mode
                          ? a.mode === "onsite"
                            ? "Tatap muka"
                            : "Online"
                          : ""}{" "}
                        {a.time ? `• ${a.time}` : ""}
                      </div>
                      <div
                        className="text-xs mt-1"
                        style={{ color: palette.silver2 }}
                      >
                        {dateLong(a.date)}
                      </div>
                    </div>
                    <Badge variant={STATUS_BADGE[a.status]} palette={palette}>
                      {STATUS_LABEL[a.status]}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Footer: kembali */}
              <div className="pt-6">
                
                  <Btn
                  onClick={() => navigate(-1)}
                    variant="outline"
                    size="sm"
                    palette={palette}
                    className="w-full justify-center"
                  >
                    <ArrowLeft className="mr-1" size={16} /> Kembali ke Detail
                  </Btn>
              
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
