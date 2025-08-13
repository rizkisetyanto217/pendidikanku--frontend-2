// src/pages/sekolahislamku/teacher/TeacherAttendance.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  CalendarDays,
  CheckSquare,
  Filter as FilterIcon,
  Percent,
  Users,
} from "lucide-react";

import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import TeacherSidebarNav from "@/pages/sekolahislamku/components/home/TeacherSideBarNav";
import MiniBar from "../../components/ui/MiniBar";

/* ================= Types ================= */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";
type AttendanceStatusFilter = AttendanceStatus | "all";
type AttendanceMode = "onsite" | "online";
type AttendanceModeFilter = AttendanceMode | "all";

type ClassItem = { id: string; name: string; time: string; room?: string };

type StudentAttendance = {
  id: string;
  name: string;
  status: AttendanceStatus;
  mode?: AttendanceMode;
  time?: string;
};

type AttendanceStats = {
  total: number;
} & Record<AttendanceStatus, number>;

type AttendancePayload = {
  dateISO: string;
  classes: ClassItem[];
  currentClass?: ClassItem;
  stats: AttendanceStats;
  students: StudentAttendance[];
};

/* ================= Helpers/Constants ================= */
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
    day: "2-digit",
    month: "short",
  });

const percent = (a: number, b: number) =>
  b > 0 ? Math.round((a / b) * 100) : 0;

/* ================= Dummy API ================= */
const CLASSES: ClassItem[] = [
  { id: "tpa-a", name: "TPA A", time: "07:30", room: "Aula 1" },
  { id: "tpa-b", name: "TPA B", time: "09:30", room: "R. Tahfiz" },
];

function statusFor(i: number): AttendanceStatus {
  if (i % 11 === 6) return "alpa";
  if (i % 9 === 2) return "izin";
  if (i % 9 === 4) return "sakit";
  if (i % 5 === 1) return "online";
  return "hadir";
}
function timeFor(s: AttendanceStatus) {
  if (s === "hadir" || s === "online") {
    const hh = 7;
    const mm = 20 + Math.floor(Math.random() * 15);
    return `${String(hh).padStart(2, "0")}:${mm}`;
  }
  return undefined;
}
function modeFor(s: AttendanceStatus): AttendanceMode | undefined {
  if (s === "hadir") return "onsite";
  if (s === "online") return "online";
  return undefined;
}

async function fetchTeacherAttendance({
  dateISO,
  classId,
}: {
  dateISO: string;
  classId?: string;
}): Promise<AttendancePayload> {
  const currentClass = classId
    ? CLASSES.find((c) => c.id === classId)
    : undefined;

  const size = currentClass ? 20 : 0;
  const students: StudentAttendance[] = Array.from({ length: size }).map(
    (_, i) => {
      const st = statusFor(i);
      return {
        id: `${currentClass?.id}-${i + 1}`,
        name: `Siswa ${i + 1}`,
        status: st,
        mode: modeFor(st),
        time: timeFor(st),
      };
    }
  );

  const stats = students.reduce<AttendanceStats>(
    (acc, s) => {
      acc.total += 1;
      acc[s.status] += 1;
      return acc;
    },
    { total: 0, hadir: 0, online: 0, izin: 0, sakit: 0, alpa: 0 }
  );

  return {
    dateISO,
    classes: CLASSES,
    currentClass,
    stats,
    students,
  };
}

/* ================= Page ================= */
export default function TeacherAttendance() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();

  const qDate = sp.get("date") ?? new Date().toISOString();
  const classId = sp.get("class") ?? undefined;

  const toStatusFilter = (v: string | null): AttendanceStatusFilter =>
    v === "all" ||
    v === "hadir" ||
    v === "online" ||
    v === "izin" ||
    v === "sakit" ||
    v === "alpa"
      ? v
      : "all";
  const toModeFilter = (v: string | null): AttendanceModeFilter =>
    v === "all" || v === "onsite" || v === "online" ? v : "all";

  const status: AttendanceStatusFilter = toStatusFilter(sp.get("status"));
  const mode: AttendanceModeFilter = toModeFilter(sp.get("mode"));

  const { data } = useQuery({
    queryKey: ["teacher-attendance", qDate, classId],
    queryFn: () => fetchTeacherAttendance({ dateISO: qDate, classId }),
    staleTime: 60_000,
  });

  const s = data;

  const filtered = useMemo(() => {
    if (!s) return [];
    return s.students.filter((st) => {
      const mStatus = status === "all" ? true : st.status === status;
      const mMode = mode === "all" ? true : st.mode === mode;
      return mStatus && mMode;
    });
  }, [s, status, mode]);

  const handleChange = (
    key: "date" | "class" | "status" | "mode",
    value: string
  ) => {
    const next = new URLSearchParams(sp);
    next.set(key, value);
    setSp(next, { replace: true });
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Kehadiran"
        gregorianDate={qDate}
        hijriDate={undefined}
        dateFmt={(iso) => dateLong(iso)}
      />

      {/* ⬇️ Tambahan: layout 2 kolom dengan sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <TeacherSidebarNav palette={palette} />

          {/* Konten utama (semua bagian lama tetap) */}
          <div className="flex-1 space-y-6">
            {/* Row 1: Kelas Hari Ini + Ringkasan */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Kelas Hari Ini */}
              <SectionCard palette={palette} className="lg:col-span-6">
                <div className="p-4 md:p-5 pb-2 flex items-center justify-between">
                  <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
                    <CalendarDays size={18} color={palette.quaternary} /> Kelas
                    Hari Ini
                  </h3>
                  <Badge palette={palette} variant="outline">
                    {dateShort(qDate)}
                  </Badge>
                </div>
                <div className="px-4 md:px-5 pb-4 space-y-2">
                  {CLASSES.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-xl border px-3 py-2"
                      style={{
                        borderColor: palette.silver1,
                        background: palette.white1,
                      }}
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{c.name}</div>
                        <div
                          className="text-xs"
                          style={{ color: palette.silver2 }}
                        >
                          {c.room ?? "-"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge palette={palette} variant="outline">
                          {c.time}
                        </Badge>
                        <Btn
                          palette={palette}
                          size="sm"
                          onClick={() => handleChange("class", c.id)}
                        >
                          Kelola
                        </Btn>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Ringkasan Kehadiran */}
              <SectionCard palette={palette} className="lg:col-span-6">
                <div className="p-4 md:p-5 pb-2 font-medium flex items-center gap-2">
                  <CheckSquare size={18} /> Ringkasan Kehadiran{" "}
                  {s?.currentClass ? `• ${s.currentClass.name}` : ""}
                </div>

                {s?.stats ? (
                  <div className="px-4 md:px-5 grid grid-cols-2 gap-3 text-sm">
                    <StatPill
                      label="Total Siswa"
                      value={s.stats.total}
                      palette={palette}
                    />
                    <StatPill
                      label="Persentase Hadir"
                      value={`${percent(
                        s.stats.hadir + s.stats.online,
                        s.stats.total
                      )}%`}
                      palette={palette}
                    />
                  </div>
                ) : (
                  <div
                    className="px-4 md:px-5 text-sm"
                    style={{ color: palette.silver2 }}
                  >
                    Pilih kelas untuk melihat ringkasan.
                  </div>
                )}

                {s?.stats && (
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
                        label={k.toUpperCase()}
                        value={s.stats[k]}
                        total={s.stats.total}
                        palette={palette}
                      />
                    ))}
                  </div>
                )}

                <div className="px-4 md:px-5 py-4">
                  <Btn
                    palette={palette}
                    size="sm"
                    disabled={!s?.currentClass}
                    onClick={() =>
                      alert("Aksi kelola absen (implement ke API)")
                    }
                  >
                    <CheckSquare className="mr-2" size={16} />
                    Mulai/Perbarui Absen
                  </Btn>
                </div>
              </SectionCard>
            </section>

            {/* Filter */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 font-medium flex items-center gap-2">
                <FilterIcon size={18} color={palette.quaternary} /> Filter
              </div>
              <div className="px-4 md:px-5 pb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: palette.silver2 }}>
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={new Date(qDate).toISOString().slice(0, 10)}
                    onChange={(e) => {
                      const d = new Date(e.target.value);
                      handleChange("date", d.toISOString());
                    }}
                    className="rounded-lg border px-3 py-2 bg-transparent"
                    style={{ borderColor: palette.silver1 }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: palette.silver2 }}>
                    Kelas
                  </label>
                  <select
                    value={classId ?? ""}
                    onChange={(e) => handleChange("class", e.target.value)}
                    className="rounded-lg border px-3 py-2 bg-transparent"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <option value="">— Pilih kelas —</option>
                    {CLASSES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
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

            {/* Daftar Kehadiran */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 font-medium flex items-center gap-2">
                <Users size={18} color={palette.quaternary} /> Daftar Kehadiran
              </div>

              <div className="px-4 md:px-5 pb-4 grid grid-cols-1 gap-2">
                {!s?.currentClass && (
                  <div
                    className="rounded-xl border px-3 py-3 text-sm"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white1,
                      color: palette.silver2,
                    }}
                  >
                    Pilih kelas terlebih dahulu untuk melihat daftar siswa.
                  </div>
                )}

                {s?.currentClass && filtered.length === 0 && (
                  <div
                    className="rounded-xl border px-3 py-3 text-sm"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white1,
                      color: palette.silver2,
                    }}
                  >
                    Tidak ada data untuk filter saat ini.
                  </div>
                )}

                {s?.currentClass &&
                  filtered.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between rounded-xl border px-3 py-2"
                      style={{
                        borderColor: palette.silver1,
                        background: palette.white1,
                      }}
                    >
                      <div className="text-sm">
                        <div className="font-medium">{st.name}</div>
                        <div
                          className="text-xs"
                          style={{ color: palette.silver2 }}
                        >
                          {st.mode
                            ? st.mode === "onsite"
                              ? "Tatap muka"
                              : "Online"
                            : ""}{" "}
                          {st.time ? `• ${st.time}` : ""}
                        </div>
                      </div>
                      <Badge
                        variant={STATUS_BADGE[st.status]}
                        palette={palette}
                      >
                        {STATUS_LABEL[st.status]}
                      </Badge>
                    </div>
                  ))}
              </div>

              {s?.currentClass && (
                <div className="px-4 md:px-5 pb-4 flex gap-2">
                  <Btn
                    palette={palette}
                    variant="quaternary"
                    onClick={() => alert("Tandai semua hadir")}
                  >
                    Tandai semua hadir
                  </Btn>
                  <Btn
                    palette={palette}
                    variant="outline"
                    onClick={() => alert("Unduh rekap (CSV)")}
                  >
                    Unduh rekap
                  </Btn>
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </main>
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
      <div className="text-xs" style={{ color: palette.silver2 }}>
        {label}
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
