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
    status: AttendanceStatus; // wajib
    mode?: AttendanceMode;
    time?: string;
  };
  informasiUmum: string; // wajib
  nilai?: number; // opsional
  materiPersonal?: string; // opsional
  penilaianPersonal?: string; // opsional
  hafalan?: string; // opsional
  pr?: string; // opsional
}

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

export default function ChildSummaryCard({
  child,
  today,
  palette,
  detailPath = "/anak",
  progressPath = "/anak/progress",
  todayDisplay = "compact", // ⬅️ default ringkas
}: {
  child?: ChildDetail;
  today?: TodaySummary;
  palette: Palette;
  detailPath?: string;
  progressPath?: string;
  todayDisplay?: TodayDisplay;
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

  return (
    <SectionCard palette={palette}>
      {/* Header */}
      <div className="p-4 md:p-5 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
            <User2 size={20} color={palette.quaternary} />
            <span>{child?.name ?? "—"}</span>
            <Badge variant="outline" className="ml-1" palette={palette}>
              {child?.className ?? "Kelas"}
            </Badge>
          </h3>
          <Link to={detailPath} className="inline-flex items-center">
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
            <div style={{ fontSize: 12, color: palette.silver2 }}>
              Absensi Hari Ini
            </div>
            <div className="mt-1 flex items-center gap-2">
              {quickStatus === "unknown" ? (
                <Badge variant="outline" palette={palette}>
                  Belum tercatat
                </Badge>
              ) : (
                renderStatusBadge(quickStatus as AttendanceStatus)
              )}
            </div>
          </SectionCard>

          {/* Hafalan */}
          <SectionCard
            palette={palette}
            className="p-3"
            style={{ background: palette.white2 }}
          >
            <div style={{ fontSize: 12, color: palette.silver2 }}>Hafalan</div>
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
                style={{ fontSize: 12, color: palette.silver2 }}
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
            <div style={{ fontSize: 12, color: palette.silver2 }}>
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
            style={{ background: palette.white2 }} // ⬅️ samain dengan kartu lainnya
          >
            <div className="font-medium mb-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={18} color={palette.quaternary} />
                Ringkasan Hari Ini
              </span>
            </div>

            {todayDisplay === "compact" ? (
              <>
                {/* CHIP ringkas */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1">
                    {renderStatusBadge(today.attendance.status)}
                    {today.attendance.time && (
                      <span style={{ color: palette.silver2 }}>
                        • {today.attendance.time}
                      </span>
                    )}
                    {today.attendance.mode && (
                      <span style={{ color: palette.silver2 }}>
                        •{" "}
                        {today.attendance.mode === "onsite"
                          ? "Tatap muka"
                          : "Online"}
                      </span>
                    )}
                  </span>

                  {typeof today.nilai === "number" && (
                    <Badge variant="outline" palette={palette}>
                      Nilai: {today.nilai}
                    </Badge>
                  )}

                  {today.hafalan && (
                    <Badge variant="outline" palette={palette}>
                      Hafalan: {today.hafalan}
                    </Badge>
                  )}

                  {today.pr && (
                    <Badge variant="outline" palette={palette}>
                      PR: {today.pr}
                    </Badge>
                  )}
                </div>

                {/* Info umum (dipotong 2 baris / 1 baris jika tidak ada plugin line-clamp) */}
                <p
                  className="mt-3 text-sm truncate"
                  style={{ color: palette.black2 }}
                  title={today.informasiUmum}
                >
                  {today.informasiUmum}
                </p>
              </>
            ) : (
              // ===== Expanded: layout lama (4 kartu + info) =====
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Absensi */}
                  <SectionCard
                    palette={palette}
                    className="p-3"
                    style={{ background: palette.white2 }}
                  >
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      Absensi
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {renderStatusBadge(today.attendance.status)}
                      {today.attendance.time && (
                        <span
                          className="text-xs"
                          style={{ color: palette.silver2 }}
                        >
                          • {today.attendance.time}
                        </span>
                      )}
                    </div>
                    {today.attendance.mode && (
                      <div
                        className="mt-1 text-xs"
                        style={{ color: palette.silver2 }}
                      >
                        {today.attendance.mode === "onsite"
                          ? "Tatap muka"
                          : "Online"}
                      </div>
                    )}
                  </SectionCard>

                  {/* Nilai */}
                  <SectionCard
                    palette={palette}
                    className="p-3"
                    style={{ background: palette.white2 }}
                  >
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      Nilai
                    </div>
                    <div className="mt-2 text-lg font-semibold">
                      {typeof today.nilai === "number" ? today.nilai : "-"}
                    </div>
                  </SectionCard>

                  {/* Hafalan */}
                  <SectionCard
                    palette={palette}
                    className="p-3"
                    style={{ background: palette.white2 }}
                  >
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      Hafalan
                    </div>
                    <div className="mt-2 text-sm">{today.hafalan ?? "-"}</div>
                  </SectionCard>

                  {/* PR */}
                  <SectionCard
                    palette={palette}
                    className="p-3"
                    style={{ background: palette.white2 }}
                  >
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      PR
                    </div>
                    <div className="mt-2 text-sm">{today.pr ?? "-"}</div>
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
                    <p className="mt-1 text-sm">{today.informasiUmum}</p>
                  </SectionCard>

                  {(today.materiPersonal || today.penilaianPersonal) && (
                    <SectionCard
                      palette={palette}
                      className="p-3"
                      style={{ background: palette.white2 }}
                    >
                      <div
                        className="text-xs"
                        style={{ color: palette.silver2 }}
                      >
                        Catatan Personal
                      </div>
                      {today.materiPersonal && (
                        <p className="mt-1 text-sm">
                          <span className="font-medium">Materi:</span>{" "}
                          {today.materiPersonal}
                        </p>
                      )}
                      {today.penilaianPersonal && (
                        <p className="mt-1 text-sm">
                          <span className="font-medium">Penilaian:</span>{" "}
                          {today.penilaianPersonal}
                        </p>
                      )}
                    </SectionCard>
                  )}
                </div>
              </>
            )}
          </SectionCard>
        </div>
      )}
    </SectionCard>
  );
}
