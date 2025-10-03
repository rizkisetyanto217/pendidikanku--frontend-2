// src/components/child/ChildSummaryCard.tsx
import { Link } from "react-router-dom";
import {
  User2,
  CheckCircle2,
  Clock,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import {
  Badge,
  Btn,
  ProgressBar,
  SectionCard,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

/* ===== Types ===== */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";
type AttendanceMode = "onsite" | "online";

export interface TodaySummary {
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

type AttendanceAgg = { present: number; total: number };

export interface ChildDetail {
  id: string;
  name: string;
  className: string;
  attendanceToday?: "present" | "online" | "absent" | null;
  memorizationJuz?: number;
  iqraLevel?: string;
  lastScore?: number;
}

type TodayDisplay = "hidden" | "compact" | "expanded";

// ⬅️ Tambahkan tipe payload untuk state ke halaman detail
export type DetailStatePayload = {
  child?: ChildDetail;
  today?: TodaySummary;
  // boleh tambah field lain kalau perlu
};

export default function ChildSummaryCard({
  child,
  today,
  palette,
  detailPath = "/anak",
  // ⬅️ terima state dari parent
  detailState,
  progressPath = "/anak/progress",
  todayDisplay = "compact",
  attendanceAgg,
}: {
  child?: ChildDetail;
  today?: TodaySummary;
  palette: Palette;
  detailPath?: string;
  // ⬅️ definisikan di props
  detailState?: DetailStatePayload;
  progressPath?: string;
  todayDisplay?: TodayDisplay;
  attendanceAgg?: AttendanceAgg;
}) {
  const quickStatus: AttendanceStatus | "unknown" = today
    ? today.attendance.status
    : child?.attendanceToday === "present"
      ? "hadir"
      : child?.attendanceToday === "online"
        ? "online"
        : child?.attendanceToday === "absent"
          ? "alpa"
          : "unknown";

  const renderStatusBadge = (s: AttendanceStatus) => {
    if (s === "hadir")
      return (
        <Badge variant="success" palette={palette}>
          <CheckCircle2 className="mr-1" size={12} /> Hadir
        </Badge>
      );
    if (s === "online")
      return (
        <Badge variant="info" palette={palette}>
          <Clock className="mr-1" size={12} /> Online
        </Badge>
      );
    if (s === "sakit")
      return (
        <Badge variant="warning" palette={palette}>
          Sakit
        </Badge>
      );
    if (s === "izin")
      return (
        <Badge variant="secondary" palette={palette}>
          Izin
        </Badge>
      );
    return (
      <Badge variant="destructive" palette={palette}>
        Alpa
      </Badge>
    );
  };

  const quickPresent = attendanceAgg?.present ?? 0;
  const quickTotal = attendanceAgg?.total ?? 0;
  const quickRate = quickTotal
    ? Math.round((quickPresent / quickTotal) * 100)
    : 0;

  return (
    <SectionCard palette={palette}>
      {/* Header */}
      <div className="p-4 md:p-5 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
            <User2 size={20} color={palette.quaternary} />
            <span>{child?.name ?? "—"}</span>
            <Badge variant="secondary" className="ml-1" palette={palette}>
              {child?.className ?? "Kelas"}
            </Badge>
          </h3>
          <Link
            to={detailPath}
            // ⬅️ pass state ke halaman detail
            state={detailState}
            className="inline-flex items-center"
          >
            <Btn size="sm" variant="ghost" palette={palette}>
              Detail <ChevronRight className="ml-1" size={16} />
            </Btn>
          </Link>
        </div>
      </div>

      {/* Ringkas: Absensi / Hafalan / Nilai terakhir */}
      <div className="p-4 pt-2 sm:p-4 lg:px-3 lg:py-0 lg:mb-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Absensi Cepat */}
          <SectionCard
            palette={palette}
            className="p-3"
            style={{ background: palette.white2 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div style={{ fontSize: 12, color: palette.black2 }}>
                  Kehadiran
                </div>
              </div>
              <div className="text-right">
                <div
                  className="font-semibold"
                  style={{ color: palette.quaternary }}
                >
                  {quickPresent}/{quickTotal}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <ProgressBar value={quickRate} palette={palette} />
              <div
                className="mt-1 text-sm"
                style={{ color: palette.black2 }}
              >
                {quickRate}% hadir
              </div>
            </div>
          </SectionCard>

          {/* Hafalan */}
          <SectionCard
            palette={palette}
            className="p-3"
            style={{ background: palette.white2 }}
          >
            <div style={{ fontSize: 12, color: palette.black2 }}>Hafalan</div>
            <div className="mt-2">
              <ProgressBar
                value={
                  (Math.max(0, Math.min(2, child?.memorizationJuz ?? 0)) / 2) *
                  100
                }
                palette={palette}
              />
              <div
                className="mt-1"
                style={{ fontSize: 12, color: palette.black2 }}
              >
                ~ {child?.memorizationJuz ?? 0} Juz
              </div>
            </div>
          </SectionCard>

          {/* Nilai terakhir */}
          <SectionCard
            palette={palette}
            className="p-3"
            style={{ background: palette.white2 }}
          >
            <div style={{ fontSize: 12, color: palette.black2 }}>
              Nilai Terakhir
            </div>
            <div className="mt-1 text-lg font-semibold">
              {typeof child?.lastScore === "number" ? child.lastScore : "-"}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ===== Ringkasan Hari Ini ===== */}
      {today && todayDisplay !== "hidden" && (
        <div className="px-4 pb-4">
          <SectionCard
            palette={palette}
            className={todayDisplay === "compact" ? "p-3 md:p-4" : "p-4 md:p-5"}
            style={{ background: palette.white2 }}
          >
            <div className="font-medium mb-3 flex items-center justify-between gap-2">
              <span
                className="inline-flex items-center gap-2"
                style={{ fontSize: 12, color: palette.black2 }}
              >
                <CalendarDays size={18} color={palette.quaternary} />
                Ringkasan Hari Ini
              </span>
            </div>

            {todayDisplay === "compact" ? (
              <>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1">
                    {renderStatusBadge(today.attendance.status)}
                    {today.attendance.time && (
                      <span style={{ color: palette.black2 }}>
                        • {today.attendance.time}
                      </span>
                    )}
                  </span>

                  {typeof today.nilai === "number" && (
                    <Badge variant="white1" palette={palette}>
                      Nilai: {today.nilai}
                    </Badge>
                  )}
                  {today.hafalan && (
                    <Badge variant="white1" palette={palette}>
                      Hafalan: {today.hafalan}
                    </Badge>
                  )}
                  {today.pr && (
                    <Badge variant="white1" palette={palette}>
                      PR: {today.pr}
                    </Badge>
                  )}
                </div>

                <p
                
                  className="mt-3 text-sm truncate"
                  style={{ color: palette.black2 }}
                  title={today.informasiUmum}
                >
                  {today.informasiUmum}
                </p>
              </>
            ) : (
              <>{/* ... (bagian expanded tetap sama seperti punyamu) ... */}</>
            )}
          </SectionCard>
        </div>
      )}
    </SectionCard>
  );
}
