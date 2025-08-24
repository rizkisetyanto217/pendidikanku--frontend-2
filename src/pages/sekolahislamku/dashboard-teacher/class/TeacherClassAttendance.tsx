// src/pages/sekolahislamku/teacher/TeacherAttendancePage.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Users,
  CheckCircle2,
  Thermometer,
  FileCheck2,
  XCircle,
  Search,
  Save,
  Check,
  GraduationCap,
} from "lucide-react";

import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Badge,
  Btn,
  ProgressBar,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import TeacherSidebarNav from "@/pages/sekolahislamku/components/home/TeacherSideBarNav";
import TeacherTopBar from "../../components/home/TeacherTopBar";

/* ========================================
   Types & constants
======================================== */
type AttendanceCore = "hadir" | "sakit" | "izin" | "alpa";
type AttendanceStatus = AttendanceCore | null;

type Student = { id: string; name: string };

type Entry = {
  studentId: string;
  status: AttendanceStatus; // WAJIB
  infoUmum?: string;

  // OPSIONAL
  time?: string; // jam hadir
  score?: number; // 0..100
  materiPersonal?: string;
  penilaianPersonal?: string;
  hafalan?: string;
  pr?: string;
};

type AttendanceDoc = {
  classId: string;
  dateISO: string; // yyyy-mm-dd
  entries: Entry[];
  finalized?: boolean;
};

type ClassInfo = {
  id: string;
  name: string;
  room?: string;
  studentsCount: number;
};

const STATUS_OPTIONS: { key: AttendanceCore; label: string }[] = [
  { key: "hadir", label: "Hadir" },
  { key: "sakit", label: "Sakit" },
  { key: "izin", label: "Izin" },
  { key: "alpa", label: "Alpa" },
];

/* ========================================
   Helpers
======================================== */
const toISODate = (d: Date) => d.toISOString().slice(0, 10);
const idDateLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const nowHHMM = () => {
  const t = new Date();
  return `${String(t.getHours()).padStart(2, "0")}:${String(
    t.getMinutes()
  ).padStart(2, "0")}`;
};

/* ========================================
   Fake APIs (gampang diganti backend)
======================================== */
async function fetchTeacherClasses(): Promise<ClassInfo[]> {
  return Promise.resolve([
    { id: "tpa-a", name: "TPA A", room: "Aula 1", studentsCount: 22 },
    { id: "tpa-b", name: "TPA B", room: "Aula 2", studentsCount: 20 },
    { id: "tpa-c", name: "TPA C", room: "Aula 3", studentsCount: 18 },
  ]);
}
async function fetchRoster(classId: string): Promise<Student[]> {
  // bisa dihubungkan dengan classId
  return Promise.resolve([
    { id: "s1", name: "Ahmad" },
    { id: "s2", name: "Fatimah" },
    { id: "s3", name: "Hasan" },
    { id: "s4", name: "Aisyah" },
    { id: "s5", name: "Umar" },
    { id: "s6", name: "Zainab" },
    { id: "s7", name: "Bilal" },
  ]);
}

/* ========================================
   LocalStorage store (keyed by class+date)
======================================== */
const LS_KEY = "tpa_attend_progress_v1";
type Store = Record<string, AttendanceDoc>; // key: `${classId}__${dateISO}`

const makeKey = (classId: string, dateISO: string) => `${classId}__${dateISO}`;

function readStore(): Store {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}
function writeStore(s: Store) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}
function loadOrCreateDoc(
  classId: string,
  dateISO: string,
  roster: Student[]
): AttendanceDoc {
  const s = readStore();
  const key = makeKey(classId, dateISO);
  const exist = s[key];
  if (exist) return exist;

  const doc: AttendanceDoc = {
    classId,
    dateISO,
    entries: roster.map((st) => ({
      studentId: st.id,
      status: null, // wajib tapi belum diisi
    })),
  };
  s[key] = doc;
  writeStore(s);
  return doc;
}
function saveDoc(doc: AttendanceDoc) {
  const s = readStore();
  s[makeKey(doc.classId, doc.dateISO)] = doc;
  writeStore(s);
}

/* ========================================
   UI bits (kecil & reusable)
======================================== */
function StatusBadge({ s, palette }: { s: AttendanceCore; palette: Palette }) {
  const map: Record<
    AttendanceCore,
    {
      v: "success" | "info" | "warning" | "secondary" | "destructive";
      label: string;
      icon?: React.ReactNode;
    }
  > = {
    hadir: {
      v: "success",
      label: "Hadir",
      icon: <CheckCircle2 size={12} className="mr-1" />,
    },
    sakit: {
      v: "warning",
      label: "Sakit",
      icon: <Thermometer size={12} className="mr-1" />,
    },
    izin: {
      v: "secondary",
      label: "Izin",
      icon: <FileCheck2 size={12} className="mr-1" />,
    },
    alpa: {
      v: "destructive",
      label: "Alpa",
      icon: <XCircle size={12} className="mr-1" />,
    },
  };
  const m = map[s];
  return (
    <Badge palette={palette} variant={m.v}>
      <span className="inline-flex items-center">
        {m.icon}
        {m.label}
      </span>
    </Badge>
  );
}

function StatusSelector({
  value,
  onChange,
  palette,
}: {
  value: AttendanceStatus;
  onChange: (s: AttendanceCore) => void;
  palette: Palette;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto" aria-label="Pilih status">
      {STATUS_OPTIONS.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className="px-3 h-8 rounded-full border text-xs whitespace-nowrap"
            style={{
              background: active ? palette.primary2 : palette.white2,
              color: active ? palette.primary : palette.black1,
              borderColor: active ? palette.primary : palette.silver1,
            }}
            aria-pressed={active}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function StatChip({
  icon,
  label,
  value,
  palette,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  palette: Palette;
}) {
  return (
    <div
      className="px-3 py-2 rounded-xl border text-sm flex items-center gap-2"
      style={{ borderColor: palette.silver1, background: palette.white2 }}
      role="status"
      aria-label={`${label}: ${value}`}
    >
      {icon}
      <span className="text-xs" style={{ color: palette.silver2 }}>
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

/* ====== Modal editor siswa ====== */
function StudentDetailEditor({
  open,
  onClose,
  palette,
  name,
  value,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  name: string;
  value: Pick<
    Entry,
    | "status"
    | "time"
    | "score"
    | "materiPersonal"
    | "penilaianPersonal"
    | "hafalan"
    | "pr"
  >;
  onSave: (
    v: Pick<
      Entry,
      | "status"
      | "time"
      | "score"
      | "materiPersonal"
      | "penilaianPersonal"
      | "hafalan"
      | "pr"
    >
  ) => void;
}) {
  const [data, setData] = useState(value);

  useEffect(() => {
    if (!open) return;
    setData(value);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, value, onClose]);

  if (!open) return null;

  const mustTime = data.status === "hadir";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 md:p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.35)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl shadow-lg flex flex-col overflow-hidden"
        style={{
          background: palette.white1,
          color: palette.black1,
          border: `1px solid ${palette.silver1}`,
          maxHeight: "86vh",
        }}
      >
        {/* Header (sticky) */}
        <div
          className="p-4 md:p-5 border-b sticky top-0 bg-inherit"
          style={{ borderColor: palette.silver1 }}
        >
          <div className="font-semibold">Absensi & Detail — {name}</div>
          <div className="text-xs mt-1" style={{ color: palette.silver2 }}>
            Status & Informasi Umum wajib. Yang lain opsional.
          </div>
        </div>

        {/* Content (scrollable) */}
        <div
          className="p-4 md:p-5 space-y-4 overflow-y-auto min-h-0"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Status */}
          <div>
            <div className="text-xs mb-1" style={{ color: palette.silver2 }}>
              Status (WAJIB)
            </div>
            <StatusSelector
              value={data.status ?? null}
              onChange={(s) => setData((v) => ({ ...v, status: s }))}
              palette={palette}
            />
          </div>

          {/* Jam + Nilai */}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs" style={{ color: palette.silver2 }}>
                Jam (opsional, aktif saat Hadir)
              </label>
              <input
                type="time"
                disabled={!mustTime}
                value={data.time ?? ""}
                onChange={(e) =>
                  setData((s) => ({ ...s, time: e.target.value || undefined }))
                }
                className="h-9 w-full rounded-xl px-3 text-sm disabled:opacity-60"
                style={{
                  background: palette.white2,
                  color: palette.black1,
                  border: `1px solid ${palette.silver1}`,
                }}
              />
            </div>
            <div>
              <label className="text-xs" style={{ color: palette.silver2 }}>
                Nilai (0–100) — OPSIONAL
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={typeof data.score === "number" ? data.score : ""}
                onChange={(e) =>
                  setData((s) => ({
                    ...s,
                    score:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  }))
                }
                className="h-9 w-full rounded-xl px-3 text-sm"
                style={{
                  background: palette.white2,
                  color: palette.black1,
                  border: `1px solid ${palette.silver1}`,
                }}
                placeholder="contoh: 89"
              />
            </div>
          </div>

          {/* Opsional lainnya */}
          <div>
            <label className="text-xs" style={{ color: palette.silver2 }}>
              Materi Personal (OPSIONAL)
            </label>
            <input
              value={data.materiPersonal ?? ""}
              onChange={(e) =>
                setData((s) => ({ ...s, materiPersonal: e.target.value }))
              }
              className="h-9 w-full rounded-xl px-3 text-sm"
              style={{
                background: palette.white2,
                color: palette.black1,
                border: `1px solid ${palette.silver1}`,
              }}
              placeholder="Membaca Al-Baqarah 255–257"
            />
          </div>

          <div>
            <label className="text-xs" style={{ color: palette.silver2 }}>
              Penilaian Personal (OPSIONAL)
            </label>
            <textarea
              value={data.penilaianPersonal ?? ""}
              onChange={(e) =>
                setData((s) => ({ ...s, penilaianPersonal: e.target.value }))
              }
              className="min-h-[70px] w-full rounded-xl px-3 py-2 text-sm"
              style={{
                background: palette.white2,
                color: palette.black1,
                border: `1px solid ${palette.silver1}`,
              }}
              placeholder="Budi bercanda di kelas…"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs" style={{ color: palette.silver2 }}>
                Hafalan (OPSIONAL)
              </label>
              <input
                value={data.hafalan ?? ""}
                onChange={(e) =>
                  setData((s) => ({ ...s, hafalan: e.target.value }))
                }
                className="h-9 w-full rounded-xl px-3 text-sm"
                style={{
                  background: palette.white2,
                  color: palette.black1,
                  border: `1px solid ${palette.silver1}`,
                }}
                placeholder="An-Naba 1–10"
              />
            </div>
            <div>
              <label className="text-xs" style={{ color: palette.silver2 }}>
                PR (OPSIONAL)
              </label>
              <input
                value={data.pr ?? ""}
                onChange={(e) => setData((s) => ({ ...s, pr: e.target.value }))}
                className="h-9 w-full rounded-xl px-3 text-sm"
                style={{
                  background: palette.white2,
                  color: palette.black1,
                  border: `1px solid ${palette.silver1}`,
                }}
                placeholder="An-Naba 11–15 tambah hafalan"
              />
            </div>
          </div>
        </div>

        {/* Footer (sticky) */}
        <div
          className="p-4 md:p-5 pt-0 flex items-center justify-end gap-2 border-t bg-inherit sticky bottom-0"
          style={{ borderColor: palette.silver1 }}
        >
          <Btn variant="white1" size="sm" palette={palette} onClick={onClose}>
            Batal
          </Btn>
          <Btn
            variant="default"
            size="sm"
            palette={palette}
            onClick={() => {
              if (!data.status) return alert("Status wajib diisi.");
              onSave(data);
              onClose();
            }}
          >
            Simpan
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ========================================
   Main Page
======================================== */
export default function TeacherAttendancePage({
  classId: initialClassId = "tpa-a",
}: {
  classId?: string;
}) {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  // ----- state utama
  const [classId, setClassId] = useState<string>(initialClassId);
  const [dateISO, setDateISO] = useState<string>(() => toISODate(new Date()));
  const [doc, setDoc] = useState<AttendanceDoc | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<AttendanceStatus | "all">("all");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(
    null
  );

  // ----- data kelas & roster
  const { data: classList } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: fetchTeacherClasses,
    staleTime: 5 * 60_000,
  });
  const currentClass = useMemo(
    () => classList?.find((c) => c.id === classId),
    [classList, classId]
  );

  const { data: roster } = useQuery({
    queryKey: ["teacher-roster", classId],
    queryFn: () => fetchRoster(classId),
    staleTime: 60_000,
  });

  // ----- load/create dokumen saat class/date/roster berubah
  useEffect(() => {
    if (!roster) return;
    const d = loadOrCreateDoc(classId, dateISO, roster);
    setDoc(d);
  }, [classId, dateISO, roster]);

  // ----- autosave draft (debounce ringan)
  useEffect(() => {
    if (!doc) return;
    const t = setTimeout(() => saveDoc(doc), 300);
    return () => clearTimeout(t);
  }, [doc]);

  // ----- helper map id->student
  const mapStudent = useMemo(() => {
    const m = new Map<string, Student>();
    (roster ?? []).forEach((s) => m.set(s.id, s));
    return m;
  }, [roster]);

  // ----- update helpers
  const setEntry = useCallback(
    (studentId: string, patch: Partial<Entry>) => {
      if (!doc) return;
      setDoc({
        ...doc,
        entries: doc.entries.map((e) =>
          e.studentId === studentId ? { ...e, ...patch } : e
        ),
      });
    },
    [doc]
  );

  // (optional util) tandai semua hadir — *tidak dipakai UI*, tapi rapi
  const markAll = useCallback(() => {
    if (!doc) return;
    const t = nowHHMM();
    setDoc({
      ...doc,
      entries: doc.entries.map((e) => ({
        ...e,
        status: "hadir",
        time: e.time ?? t,
      })),
    });
  }, [doc]);

  const clearAll = useCallback(() => {
    if (!doc) return;
    setDoc({
      ...doc,
      entries: doc.entries.map((e) => ({
        ...e,
        status: null,
        time: undefined,
      })),
      finalized: false,
    });
  }, [doc]);

  // ----- ringkasan
  const counts = useMemo(() => {
    const base = {
      hadir: 0,
      online: 0, // disimpan utk kompatibilitas UI lama
      sakit: 0,
      izin: 0,
      alpa: 0,
      total: doc?.entries.length ?? 0,
      recorded: 0,
    };
    if (!doc) return base;
    for (const e of doc.entries) {
      if (e.status) {
        base.recorded += 1;
        (base as any)[e.status] += 1;
      }
    }
    return base;
  }, [doc]);

  const infoFilledPct = useMemo(() => {
    const total = doc?.entries.length ?? 0;
    if (!doc || total === 0) return 0;
    const n = doc.entries.filter((e) => e.infoUmum && e.infoUmum.trim()).length;
    return Math.round((n / total) * 100);
  }, [doc]);

  // ----- filter + search
  const filtered = useMemo(() => {
    if (!doc) return [];
    const withName = doc.entries
      .map((e) => ({ ...e, name: mapStudent.get(e.studentId)?.name ?? "-" }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const byStatus =
      filter === "all" ? withName : withName.filter((e) => e.status === filter);
    const qtrim = q.trim().toLowerCase();
    return qtrim
      ? byStatus.filter((e) => e.name.toLowerCase().includes(qtrim))
      : byStatus;
  }, [doc, mapStudent, filter, q]);

  // ----- finalisasi (validasi wajib)
  const finalize = useCallback(() => {
    if (!doc) return;
    const missingStatus = doc.entries
      .filter((e) => !e.status)
      .map((e) => mapStudent.get(e.studentId)?.name ?? "-");
    const missingInfo = doc.entries
      .filter((e) => !e.infoUmum || !e.infoUmum.trim())
      .map((e) => mapStudent.get(e.studentId)?.name ?? "-");

    if (missingStatus.length || missingInfo.length) {
      const head = "Data wajib belum lengkap:";
      const a = missingStatus.length
        ? `\n- Absensi: ${missingStatus
            .slice(0, 5)
            .join(", ")}${missingStatus.length > 5 ? "…" : ""}`
        : "";
      const b = missingInfo.length
        ? `\n- Informasi umum: ${missingInfo
            .slice(0, 5)
            .join(", ")}${missingInfo.length > 5 ? "…" : ""}`
        : "";
      alert(head + a + b);
      return;
    }
    const newDoc = { ...doc, finalized: true };
    saveDoc(newDoc);
    setDoc(newDoc);
    alert("Absensi & progress harian dikirim. Barakallahu fiikum!");
  }, [doc, mapStudent]);

  /* ===== UI ===== */
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <TeacherTopBar
        palette={palette}
        title="Absensi & Progress Harian (Guru)"
        gregorianDate={new Date().toISOString()}
        dateFmt={(iso) => idDateLong(iso)}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <TeacherSidebarNav palette={palette} />

          <div className="flex-1 space-y-6">
            {/* ===== Filter bar (kelas + tanggal + search + status) ===== */}
            <SectionCard palette={palette} className="p-3 md:p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3">
                {/* Kelas */}
                <div className="md:col-span-5 flex items-center gap-2">
                  <GraduationCap size={18} color={palette.quaternary} />
                  <select
                    aria-label="Pilih kelas"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="h-9 min-w-[11rem] rounded-xl px-3 text-sm"
                    style={{
                      background: palette.white1,
                      color: palette.black1,
                      border: `1px solid ${palette.silver1}`,
                    }}
                  >
                    {(classList ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Info kelas (sembunyikan di layar kecil jika sempit) */}
                  <div className="hidden md:flex items-center gap-2">
                    <Badge variant="outline" palette={palette}>
                      {currentClass?.room ?? "-"}
                    </Badge>
                    <Badge variant="outline" palette={palette}>
                      <Users size={14} className="mr-1" />
                      {currentClass?.studentsCount ?? roster?.length ?? 0} siswa
                    </Badge>
                  </div>
                </div>

                {/* Tanggal */}
                <div className="md:col-span-3 flex items-center gap-2">
                  <CalendarDays size={18} color={palette.quaternary} />
                  <input
                    aria-label="Pilih tanggal"
                    type="date"
                    value={dateISO}
                    onChange={(e) => setDateISO(e.target.value)}
                    className="h-9 w-44 sm:w-48 rounded-xl px-3 text-sm"
                    style={{
                      background: palette.white1,
                      color: palette.black1,
                      border: `1px solid ${palette.silver1}`,
                    }}
                  />
                </div>

                {/* Search */}
                <div className="md:col-span-4">
                  <div
                    className="flex items-center gap-2 rounded-xl border px-3 h-9 w-full"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white1,
                    }}
                  >
                    <Search size={16} />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Cari siswa…"
                      className="bg-transparent outline-none text-sm w-full"
                      aria-label="Cari siswa"
                      style={{ color: palette.black1 }}
                    />
                  </div>
                </div>

                {/* Info mini (mobile) */}
                <div
                  className="md:hidden text-xs flex flex-wrap items-center gap-2 pl-7"
                  style={{ color: palette.silver2 }}
                >
                  <span>
                    Kelas:{" "}
                    <span
                      className="font-medium"
                      style={{ color: palette.black1 }}
                    >
                      {currentClass?.name ?? "-"}
                    </span>
                  </span>
                  {currentClass?.room && <span>• {currentClass.room}</span>}
                  <span>
                    • {currentClass?.studentsCount ?? roster?.length ?? 0} siswa
                  </span>
                </div>

                {/* Filter status */}
                <div className="md:col-span-12">
                  <div
                    className="flex items-center gap-1 overflow-x-auto pt-1"
                    role="tablist"
                    aria-label="Filter status"
                  >
                    {(
                      ["all", ...STATUS_OPTIONS.map((s) => s.key)] as const
                    ).map((s) => (
                      <button
                        key={s as string}
                        onClick={() => setFilter(s as any)}
                        className="px-3 h-8 rounded-full border text-xs"
                        style={{
                          background:
                            filter === s ? palette.primary2 : palette.white1,
                          color:
                            filter === s ? palette.primary : palette.black1,
                          borderColor:
                            filter === s ? palette.primary : palette.silver1,
                        }}
                        aria-pressed={filter === s}
                      >
                        {(s as string).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ===== Ringkasan ===== */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="font-medium flex items-center gap-2">
                    <Users size={16} /> Ringkasan — {idDateLong(dateISO)}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  <StatChip
                    icon={<Users size={14} />}
                    label="Total"
                    value={counts.total}
                    palette={palette}
                  />
                  <StatChip
                    icon={<CheckCircle2 size={14} />}
                    label="Hadir"
                    value={counts.hadir}
                    palette={palette}
                  />
                  <StatChip
                    icon={<Thermometer size={14} />}
                    label="Sakit"
                    value={counts.sakit}
                    palette={palette}
                  />
                  <StatChip
                    icon={<FileCheck2 size={14} />}
                    label="Izin"
                    value={counts.izin}
                    palette={palette}
                  />
                  <StatChip
                    icon={<XCircle size={14} />}
                    label="Alpa"
                    value={counts.alpa}
                    palette={palette}
                  />
                </div>

                <div className="mt-3 grid gap-2">
                  <div>
                    <ProgressBar
                      value={Math.round(
                        (counts.hadir / (counts.total || 1)) * 100
                      )}
                      palette={palette}
                    />
                    <div
                      className="mt-1 text-xs"
                      style={{ color: palette.silver2 }}
                    >
                      Progress absensi (hadir)
                    </div>
                  </div>
                  <div>
                    <ProgressBar value={infoFilledPct} palette={palette} />
                    <div
                      className="mt-1 text-xs"
                      style={{ color: palette.silver2 }}
                    >
                      Kelengkapan “Informasi Umum” ({infoFilledPct}%)
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ===== Daftar Siswa (desktop table + mobile cards) ===== */}
            {/* ===== Filter & Aksi (rapi mobile & desktop) ===== */}
            <SectionCard palette={palette} className="p-4">
              <div className="text-sm font-medium mb-3 flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: palette.quaternary }}
                />
                Filter & Aksi
              </div>

              {/* GRID 12 kolom di md+, stack di mobile */}
              <div className="grid gap-2 sm:gap-3 md:grid-cols-12 items-center">
                {/* Search – paling lebar */}
                <div className="md:col-span-5">
                  <div
                    className="flex items-center gap-2 rounded-xl border px-3 h-10"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white1,
                    }}
                  >
                    <Search size={16} />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Cari penilaian / siswa…"
                      className="bg-transparent outline-none text-sm w-full"
                      style={{ color: palette.black1 }}
                    />
                  </div>
                </div>

                {/* Label 'Kelas' + Select */}
                <div className="md:col-span-3 flex items-center gap-2">
                  <span
                    className="text-xs sm:text-sm"
                    style={{ color: palette.silver2 }}
                  >
                    Kelas
                  </span>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="h-10 rounded-xl px-3 text-sm w-full"
                    style={{
                      background: palette.white1,
                      color: palette.black1,
                      border: `1px solid ${palette.silver1}`,
                    }}
                  >
                    {(classList ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tabs status ringkas */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 overflow-x-auto md:overflow-visible">
                    {["Semua", "Belum dinilai", "Progress"].map((t, i) => (
                      <button
                        key={t}
                        className="px-4 h-10 rounded-xl border text-sm whitespace-nowrap"
                        style={{
                          background:
                            i === 0 ? palette.primary2 : palette.white1,
                          color: i === 0 ? palette.primary : palette.black1,
                          borderColor:
                            i === 0 ? palette.primary : palette.silver1,
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aksi (kanan di desktop, bawah di mobile) */}
                <div className="md:col-span-2 md:justify-self-end flex gap-2">
                  <Btn palette={palette} size="sm">
                    <span className="mr-1">＋</span> Buat Penilaian
                  </Btn>
                  <Btn palette={palette} size="sm" variant="white1">
                    ⤓ Export
                  </Btn>
                </div>
              </div>

              {/* baris info kecil (khusus mobile) */}
              <div
                className="mt-3 md:hidden text-xs flex flex-wrap gap-2"
                style={{ color: palette.silver2 }}
              >
                <span>
                  Kelas:{" "}
                  <span
                    className="font-medium"
                    style={{ color: palette.black1 }}
                  >
                    {currentClass?.name ?? "-"}
                  </span>
                </span>
                {currentClass?.room && <span>• {currentClass.room}</span>}
                <span>
                  • {currentClass?.studentsCount ?? roster?.length ?? 0} siswa
                </span>
              </div>
            </SectionCard>

            {/* ===== Footer actions (sticky) ===== */}
            <div className="sticky bottom-0 z-30">
              <div className="-mx-4 md:mx-0">
                <div
                  className="px-3 md:px-4 py-2 md:py-2.5 border-t md:border md:rounded-xl md:shadow-sm backdrop-blur"
                  style={{
                    borderColor: palette.silver1,
                    background: `${palette.white1}D9`, // transparan halus
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <div
                      className="text-[11px] md:text-xs md:flex-1"
                      style={{ color: palette.silver2 }}
                    >
                      Disimpan otomatis ke perangkat.{" "}
                      {doc?.finalized ? "Status: Terkirim" : "Status: Draft"}
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <Btn
                        palette={palette}
                        variant="white1"
                        size="sm"
                        onClick={() => {
                          if (doc) {
                            saveDoc(doc);
                            alert("Draft disimpan.");
                          }
                        }}
                        className="h-9 md:w-auto w-1/3"
                      >
                        <Save className="mr-1" size={14} /> Simpan Draft
                      </Btn>

                      <Btn
                        palette={palette}
                        variant="default"
                        size="sm"
                        onClick={finalize}
                        className="h-10 w-full md:w-[220px] justify-center"
                      >
                        Kirim <Check className="ml-1" size={14} />
                      </Btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Modal editor ===== */}
            {editing && doc && (
              <StudentDetailEditor
                open={!!editing}
                onClose={() => setEditing(null)}
                palette={palette}
                name={editing.name}
                value={
                  doc.entries.find((x) => x.studentId === editing.id) ?? {
                    status: null,
                    time: undefined,
                    score: undefined,
                    materiPersonal: "",
                    penilaianPersonal: "",
                    hafalan: "",
                    pr: "",
                  }
                }
                onSave={(v) => setEntry(editing.id, v)}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
