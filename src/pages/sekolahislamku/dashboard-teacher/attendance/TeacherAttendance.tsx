// src/pages/sekolahislamku/teacher/TeacherAttendance.tsx
import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  CheckSquare,
  Filter as FilterIcon,
  Users,
  Download,
  Check,
} from "lucide-react";

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "../../components/home/ParentSideBar";
import MiniBar from "../../components/ui/MiniBar";
import StatPill from "../../components/ui/StatPill";

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

/* ================= Date/Time Utils (timezone-safe) ================= */
/** Jadikan Date pada pukul 12:00 waktu lokal (hindari crossing hari) */
const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};
/** ISO string yang aman (siang lokal) dari Date */
const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();
/** Normalisasi ISO string apapun menjadi ISO siang lokal (tetap tanggal yang sama secara lokal) */
const normalizeISOToLocalNoon = (iso: string) => toLocalNoonISO(new Date(iso));
/** Parse nilai input[type="date"] -> ISO siang lokal ("YYYY-MM-DD" -> "YYYY-MM-DDT12:00:00.xxxZ") */
const parseDateInputToISO = (value: string) =>
  new Date(`${value}T12:00:00`).toISOString();
/** Untuk value input[type="date"] dari ISO: selalu tampilkan YYYY-MM-DD sesuai waktu lokal */
const toDateInputValue = (iso: string) => {
  const d = new Date(iso);
  // geser ke "waktu lokal" agar slice(0,10) tidak kena offset
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
/** Format tanggal panjang (Gregorian, lokal) */
const dateLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
/** Format tanggal pendek (Gregorian, lokal) */
const dateShort = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
/** YYYY-MM-DD untuk nama file (aman lokal) */
/* tambahkan helper di blok Date/Time Utils (tepat di bawah dateShort) */
const hijriLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const dateForFilename = (iso: string) => toDateInputValue(iso);

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

const percent = (a: number, b: number) =>
  b > 0 ? Math.round((a / b) * 100) : 0;

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

/* ================= Dummy Data & API ================= */
const CLASSES: ClassItem[] = [
  { id: "tpa-a", name: "TPA A", time: "07:30", room: "Aula 1" },
  { id: "tpa-b", name: "TPA B", time: "09:30", room: "R. Tahfiz" },
];

const NAMA_DUMMY = [
  "Ahmad",
  "Fatimah",
  "Hasan",
  "Aisyah",
  "Umar",
  "Zainab",
  "Bilal",
  "Abdullah",
  "Amina",
  "Khalid",
  "Maryam",
  "Hafsa",
  "Yusuf",
  "Ali",
  "Hassan",
  "Husein",
  "Salim",
  "Rahma",
  "Saad",
  "Imran",
  "Farah",
  "Sofia",
  "Nadia",
  "Omar",
  "Layla",
  "Khadijah",
  "Usman",
  "Sumayyah",
  "Amir",
  "Lubna",
  "Ridwan",
  "Siti",
  "Abdurrahman",
  "Juwairiyah",
  "Talha",
  "Ammar",
  "Musa",
  "Ismail",
  "Hamzah",
  "Sahl",
];

function statusFor(i: number): AttendanceStatus {
  const m = i % 10;
  if (m === 0) return "izin";
  if (m === 1) return "sakit";
  if (m === 2) return "alpa";
  if (m === 3) return "online";
  return "hadir";
}
function timeFor(s: AttendanceStatus) {
  if (s === "hadir" || s === "online") {
    const hh = 7 + Math.floor(Math.random() * 2); // 07–08
    const mm = 10 + Math.floor(Math.random() * 40);
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
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

  let size = 0;
  if (currentClass?.id === "tpa-a") size = 25;
  if (currentClass?.id === "tpa-b") size = 20;

  const students: StudentAttendance[] = Array.from({ length: size }).map(
    (_, i) => {
      const st = statusFor(i);
      return {
        id: `${currentClass?.id}-${i + 1}`,
        name: NAMA_DUMMY[i % NAMA_DUMMY.length],
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

  return { dateISO, classes: CLASSES, currentClass, stats, students };
}

/* ================= Reusable row (mobile) ================= */
function AttendanceRow({
  st,
  palette,
}: {
  st: StudentAttendance;
  palette: Palette;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-xl border px-3 py-2"
      style={{ borderColor: palette.silver1, background: palette.white1 }}
    >
      <div className="text-sm">
        <div className="font-medium">{st.name}</div>
        <div className="text-xs" style={{ color: palette.silver2 }}>
          {st.mode ? (st.mode === "onsite" ? "Tatap muka" : "Online") : ""}{" "}
          {st.time ? `• ${st.time}` : ""}
        </div>
      </div>
      <Badge variant={STATUS_BADGE[st.status]} palette={palette}>
        {STATUS_LABEL[st.status]}
      </Badge>
    </div>
  );
}

/* ================= CSV Export helper ================= */
function toCSV(rows: StudentAttendance[]) {
  const header = ["id", "nama", "status", "mode", "jam"];
  const body = rows.map((r) =>
    [
      r.id,
      `"${r.name.replace(/"/g, '""')}"`,
      r.status,
      r.mode ?? "",
      r.time ?? "",
    ].join(",")
  );
  return [header.join(","), ...body].join("\n");
}
function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ================= Page ================= */
export default function TeacherAttendance() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const { slug } = useParams();

  // Normalisasi qDate agar konsisten di siang lokal
  const rawSpDate = sp.get("date");
  const qDate = rawSpDate
    ? normalizeISOToLocalNoon(rawSpDate)
    : toLocalNoonISO(new Date());

  const classId = sp.get("class") ?? undefined;
  const status: AttendanceStatusFilter = toStatusFilter(sp.get("status"));
  const mode: AttendanceModeFilter = toModeFilter(sp.get("mode"));

  const { data: s } = useQuery({
    queryKey: ["teacher-attendance", qDate, classId],
    queryFn: () => fetchTeacherAttendance({ dateISO: qDate, classId }),
    staleTime: 60_000,
  });

  // === Ringkasan dari students (single source of truth) ===
  const attendanceFromStudents = useMemo(() => {
    const list = s?.students ?? [];
    const byStatus: Record<AttendanceStatus, number> = {
      hadir: 0,
      online: 0,
      sakit: 0,
      izin: 0,
      alpa: 0,
    };
    for (const st of list) byStatus[st.status] += 1;
    const total = list.length;
    const present = byStatus.hadir + byStatus.online;
    const presentPct = percent(present, total);
    return { total, present, presentPct, byStatus };
  }, [s?.students]);

  const filtered = useMemo(() => {
    if (!s) return [];
    return s.students.filter((st) => {
      const mStatus = status === "all" ? true : st.status === status;
      const mMode = mode === "all" ? true : st.mode === mode;
      return mStatus && mMode;
    });
  }, [s, status, mode]);

  const handleChange = useCallback(
    (key: "date" | "class" | "status" | "mode", value: string) => {
      const next = new URLSearchParams(sp);
      next.set(key, value);
      setSp(next, { replace: true });
    },
    [sp, setSp]
  );

  const handleGoDetail = useCallback(
    (c: ClassItem) => {
      navigate(`/${slug}/guru/kehadiran/${c.id}`, {
        state: { classInfo: c, dateISO: qDate },
      });
    },
    [navigate, slug, qDate]
  );

  const markAllPresent = useCallback(() => {
    if (!s?.currentClass || filtered.length === 0) return;
    const newRows = filtered.map((r) => ({
      ...r,
      status: "hadir" as AttendanceStatus,
      mode: "onsite" as AttendanceMode,
      time: r.time ?? "07:30",
    }));
    const filename = `rekap-${s.currentClass.id}-${dateForFilename(qDate)}-all-hadir.csv`;
    download(filename, toCSV(newRows));
    alert("Contoh aksi: semua ditandai hadir dan file CSV diunduh.");
  }, [s?.currentClass, filtered, qDate]);

  const exportCSV = useCallback(() => {
    if (!s?.currentClass) return;
    const name = `rekap-${s.currentClass.id}-${dateForFilename(qDate)}.csv`;
    download(name, toCSV(filtered));
  }, [filtered, s?.currentClass, qDate]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Kehadiran"
        gregorianDate={qDate} // sudah local-noon safe
        hijriDate={hijriLong(qDate)} // ⬅️ paksa pakai Umm al-Qura, anti-geser
        dateFmt={(iso) => dateLong(iso)}
      />

      <main className="mx-auto Replace px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />

          {/* Konten utama */}
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
                          onClick={() => handleGoDetail(c)}
                        >
                          Kelola
                        </Btn>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Ringkasan Kehadiran — sama seperti TeacherClassDetail */}
              <SectionCard palette={palette} className="lg:col-span-6">
                <div className="p-4 md:p-5">
                  <div className="font-medium mb-2 flex items-center gap-2">
                    <CheckSquare size={16} /> Ringkasan Kehadiran Hari Ini
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <StatPill
                      palette={palette}
                      label="Total Siswa"
                      value={attendanceFromStudents.total}
                    />
                    <StatPill
                      palette={palette}
                      label="Hadir"
                      value={attendanceFromStudents.byStatus.hadir}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
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
                        value={attendanceFromStudents.byStatus[k]}
                        total={attendanceFromStudents.total}
                      />
                    ))}
                  </div>

                  <div className="mt-4">
                    <Btn
                      palette={palette}
                      size="sm"
                      onClick={() =>
                        navigate(`/${slug}/guru/attendance-management`, {
                          state: {
                            className: s?.currentClass?.name,
                            students: (s?.students ?? []).map((row) => ({
                              id: row.id,
                              name: row.name,
                              status: row.status as
                                | "hadir"
                                | "online"
                                | "sakit"
                                | "izin"
                                | "alpa",
                            })),
                          },
                        })
                      }
                      disabled={!s?.currentClass}
                    >
                      Kelola Absen
                    </Btn>
                  </div>
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
                    value={toDateInputValue(qDate)}
                    onChange={(e) => {
                      const iso = parseDateInputToISO(e.target.value);
                      handleChange("date", iso);
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

            {/* ===== Daftar Kehadiran — TABEL (desktop) ===== */}
            <SectionCard palette={palette} className="p-0 hidden md:block">
              <div className="p-4 md:p-5 pb-3 font-medium flex items-center gap-2">
                <Users size={18} color={palette.quaternary} /> Daftar Kehadiran
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr
                      className="text-left"
                      style={{ borderBottom: `1px solid ${palette.silver1}` }}
                    >
                      <th className="py-3 px-4 w-[45%]">Nama Siswa</th>
                      <th className="py-3 px-4 w-[20%]">Mode</th>
                      <th className="py-3 px-4 w-[20%]">Jam</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!s?.currentClass && (
                      <tr>
                        <td colSpan={4} className="py-6 px-4">
                          <div
                            className="text-sm text-center"
                            style={{ color: palette.silver2 }}
                          >
                            Pilih kelas untuk melihat daftar siswa.
                          </div>
                        </td>
                      </tr>
                    )}

                    {s?.currentClass && filtered.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 px-4">
                          <div
                            className="text-sm text-center"
                            style={{ color: palette.silver2 }}
                          >
                            Tidak ada data untuk filter saat ini.
                          </div>
                        </td>
                      </tr>
                    )}

                    {s?.currentClass &&
                      filtered.map((st) => (
                        <tr
                          key={st.id}
                          style={{
                            borderBottom: `1px solid ${palette.silver1}`,
                          }}
                        >
                          <td className="py-3 px-4">{st.name}</td>
                          <td className="py-3 px-4">
                            {st.mode
                              ? st.mode === "onsite"
                                ? "Tatap muka"
                                : "Online"
                              : "-"}
                          </td>
                          <td className="py-3 px-4">{st.time ?? "-"}</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={STATUS_BADGE[st.status]}
                              palette={palette}
                            >
                              {STATUS_LABEL[st.status]}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {s?.currentClass && (
                <div className="px-4 md:px-5 py-3 flex gap-2 justify-end">
                  <Btn
                    palette={palette}
                    variant="white1"
                    onClick={markAllPresent}
                  >
                    <Check className="mr-1" size={14} />
                    Tandai semua hadir
                  </Btn>
                  <Btn palette={palette} onClick={exportCSV}>
                    <Download className="mr-1" size={14} />
                    Unduh rekap
                  </Btn>
                </div>
              )}
            </SectionCard>

            {/* ===== Daftar Kehadiran — KARTU (mobile) ===== */}
            <SectionCard palette={palette} className="p-3 space-y-2 md:hidden">
              <div className="font-medium flex items-center gap-2 mb-1">
                <Users size={18} color={palette.quaternary} /> Daftar Kehadiran
              </div>

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
                  <AttendanceRow key={st.id} st={st} palette={palette} />
                ))}

              {s?.currentClass && (
                <div className="pt-2 flex gap-2">
                  <Btn
                    palette={palette}
                    variant="white1"
                    onClick={markAllPresent}
                    className="w-1/2"
                  >
                    Tandai semua
                  </Btn>
                  <Btn palette={palette} onClick={exportCSV} className="w-1/2">
                    Unduh
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
