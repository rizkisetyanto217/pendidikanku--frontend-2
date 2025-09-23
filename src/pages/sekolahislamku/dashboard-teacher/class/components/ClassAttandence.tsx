// src/pages/sekolahislamku/teacher/ClassAttandence.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import {
  CheckSquare,
  Users,
  ArrowLeft,
  Save,
  Search,
  CalendarDays,
} from "lucide-react";

import {
  fetchStudentsByClasses,
  type StudentSummary,
  type ClassStudentsMap,
} from "../types/teacherClass";

/* ========== Types & helpers ========== */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};
const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();
const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

const hijriLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

/* ========== Local storage for attendance ========== */
const LS_KEY = "teacher_attendance_v1";
type Stored = Record<
  string, // key: `${classId}_${yyyy-mm-dd}`
  Record<string, AttendanceStatus> // studentId -> status
>;

const readStore = (): Stored => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Stored) : {};
  } catch {
    return {};
  }
};
const writeStore = (v: Stored) =>
  localStorage.setItem(LS_KEY, JSON.stringify(v));

/* ========== Row component ========== */
function StatusPill({
  value,
  onChange,
  palette,
}: {
  value: AttendanceStatus;
  onChange: (v: AttendanceStatus) => void;
  palette: Palette;
}) {
  const opts: AttendanceStatus[] = ["hadir", "online", "sakit", "izin", "alpa"];
  const variant: Record<
    AttendanceStatus,
    "success" | "info" | "warning" | "secondary" | "destructive"
  > = {
    hadir: "success",
    online: "info",
    sakit: "warning",
    izin: "secondary",
    alpa: "destructive",
  };
  return (
    <div className="flex flex-wrap gap-1">
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className="h-7 px-2 rounded-lg text-xs font-medium"
          style={{
            background: value === o ? palette.primary2 : palette.white2,
            color: value === o ? palette.primary : palette.black1,
            border: `1px solid ${palette.silver1}`,
          }}
          title={o}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function StudentRow({
  s,
  status,
  onChange,
  palette,
}: {
  s: StudentSummary;
  status: AttendanceStatus;
  onChange: (v: AttendanceStatus) => void;
  palette: Palette;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-xl border px-3 py-2"
      style={{ borderColor: palette.silver1, background: palette.white1 }}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{s.name}</div>
        {s.nis && (
          <div className="text-xs" style={{ color: palette.silver2 }}>
            NIS: {s.nis}
          </div>
        )}
      </div>
      <StatusPill value={status} onChange={onChange} palette={palette} />
    </div>
  );
}

/* ========== Page ========== */
export default function ClassAttandence() {
  const { id: classId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const todayISO = toLocalNoonISO(new Date());
  const todayYMD = toYmd(new Date());
  const storageKey = `${classId ?? "unknown"}_${todayYMD}`;

  // fetch siswa per kelas
  const { data: map = {}, isFetching } = useQuery({
    queryKey: ["teacher-class-students", classId],
    queryFn: () => fetchStudentsByClasses(classId ? [classId] : []),
    enabled: !!classId,
    staleTime: 5 * 60_000,
  });

  const students: StudentSummary[] = useMemo(
    () => (map as ClassStudentsMap)[classId ?? ""] ?? [],
    [map, classId]
  );

  // state absensi (muat dari localStorage bila ada)
  const initialStatuses: Record<string, AttendanceStatus> = useMemo(() => {
    const store = readStore();
    return store[storageKey] ?? {};
  }, [storageKey]);

  const [statuses, setStatuses] =
    useState<Record<string, AttendanceStatus>>(initialStatuses);
  const [q, setQ] = useState("");

  useEffect(() => {
    // jika data di storage berubah (tanggal/ganti kelas), sinkron
    setStatuses(initialStatuses);
  }, [initialStatuses]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return qq
      ? students.filter((s) => s.name.toLowerCase().includes(qq))
      : students;
  }, [students, q]);

  const counts = useMemo(() => {
    const c = { hadir: 0, online: 0, sakit: 0, izin: 0, alpa: 0 } as Record<
      AttendanceStatus,
      number
    >;
    for (const s of students) {
      const v: AttendanceStatus = statuses[s.id] ?? "hadir";
      c[v] = (c[v] ?? 0) + 1;
    }
    return c;
  }, [statuses, students]);

  const handleChange = (sid: string, st: AttendanceStatus) =>
    setStatuses((prev) => ({ ...prev, [sid]: st }));

  const handleSave = () => {
    const store = readStore();
    const payload: Record<string, AttendanceStatus> = {};
    for (const s of students) {
      payload[s.id] = statuses[s.id] ?? "hadir";
    }
    store[storageKey] = payload;
    writeStore(store);

    // Buat CSV sederhana
    let csv = "Nama,Status\n";
    for (const s of students) {
      const st = payload[s.id];
      csv += `${s.name},${st}\n`;
    }
    downloadFile(`absensi_${classId ?? "unknown"}.csv`, csv);

    alert("Absensi disimpan & diunduh ✅");
  };

  // setelah states: const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(initialStatuses);

  useEffect(() => {
    if (!students?.length) return;

    // Jika belum ada di storage, set default semua "hadir"
    const hasStored = Object.keys(initialStatuses).length > 0;
    if (!hasStored) {
      const next: Record<string, AttendanceStatus> = {};
      for (const s of students) next[s.id] = "hadir";
      setStatuses(next);
    } else {
      // Pastikan siswa baru juga default "hadir"
      setStatuses((prev) => {
        const next = { ...prev };
        for (const s of students) {
          if (!next[s.id]) next[s.id] = "hadir";
        }
        return next;
      });
    }
  }, [students, initialStatuses]);

  function downloadFile(
    filename: string,
    content: string,
    mime = "text/plain"
  ) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Absensi Kelas"
        gregorianDate={todayISO}
        hijriDate={hijriLong(todayISO)}
        dateFmt={dateLong}
        showBack
      />

      <main className="w-full px-4 md:px-6  md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Back */}
            <div className="md:flex hidden gap-3 items-center">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
                className="gap-1"
              >
                <ArrowLeft size={20} />
              </Btn>
              <h1 className="textlg font-semibold">Absensi Kelas</h1>
            </div>

            {/* Header & Ringkasan */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare size={18} color={palette.quaternary} />
                  <div>
                    <div className="font-semibold">Absensi Hari Ini</div>
                    <div className="text-xs" style={{ color: palette.black2 }}>
                      <CalendarDays size={12} className="inline mr-1" />
                      {dateLong(todayISO)} — {hijriLong(todayISO)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Btn
                    palette={palette}
                    variant="secondary"
                    onClick={handleSave}
                  >
                    <Save size={16} className="mr-1" />
                    Simpan
                  </Btn>
                </div>
              </div>

              {/* Summary */}
              <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
                <Badge
                  palette={palette}
                  variant="success"
                  className="justify-center"
                >
                  Hadir: {counts.hadir}
                </Badge>
                <Badge
                  palette={palette}
                  variant="info"
                  className="justify-center"
                >
                  Online: {counts.online}
                </Badge>
                <Badge
                  palette={palette}
                  variant="warning"
                  className="justify-center"
                >
                  Sakit: {counts.sakit}
                </Badge>
                <Badge
                  palette={palette}
                  variant="secondary"
                  className="justify-center"
                >
                  Izin: {counts.izin}
                </Badge>
                <Badge
                  palette={palette}
                  variant="destructive"
                  className="justify-center"
                >
                  Alpa: {counts.alpa}
                </Badge>
              </div>
            </SectionCard>

            {/* Pencarian */}
            <SectionCard palette={palette} className="p-3">
              <div
                className="flex items-center gap-2 rounded-xl border px-3 h-10 w-full md:w-1/2"
                style={{
                  borderColor: palette.silver1,
                  background: palette.white2,
                }}
              >
                <Search size={16} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama siswa…"
                  className="bg-transparent outline-none text-sm w-full"
                  style={{ color: palette.black1 }}
                />
              </div>
            </SectionCard>

            {/* List siswa */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm" style={{ color: palette.black2 }}>
                    <Users size={14} className="inline mr-1" />
                    {filtered.length} siswa
                    {isFetching ? " • memuat…" : ""}
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    {/* cepat set semua hadir */}
                    <Btn
                      size="sm"
                      variant="outline"
                      palette={palette}
                      onClick={() => {
                        const next: Record<string, AttendanceStatus> = {};
                        for (const s of filtered) next[s.id] = "hadir";
                        setStatuses((prev) => ({ ...prev, ...next }));
                      }}
                    >
                      Tandai Hadir Semua
                    </Btn>
                  </div>
                </div>

                {filtered.length === 0 && (
                  <div
                    className="rounded-xl border p-4 text-sm"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white2,
                      color: palette.silver2,
                    }}
                  >
                    Tidak ada siswa yang cocok.
                  </div>
                )}

                {filtered.map((s) => (
                  <StudentRow
                    key={s.id}
                    s={s}
                    status={statuses[s.id] ?? "hadir"}
                    onChange={(v) => handleChange(s.id, v)}
                    palette={palette}
                  />
                ))}
              </div>
            </SectionCard>

            {/* Footer tindakan */}
            <div className="flex items-center justify-end gap-2">
              <Btn palette={palette} variant="secondary" onClick={handleSave}>
                <Save size={16} className="mr-1" />
                Simpan Absensi
              </Btn>
              <Link to=".." relative="path">
                <Btn palette={palette} variant="outline">
                  Selesai
                </Btn>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
