// ==============================================
// Single File: src/pages/sekolahislamku/dashboard-teacher/schedule/TeacherSchedule.tsx
// Purpose: SATU FILE mencakup:
// - Tab Jadwal Harian (CRUD jadwal per tanggal)
// - Tab Jadwal Rutin (template mingguan, apply ke tanggal)
// - Tab Laporan Harian Guru (materi, kehadiran, PR, catatan)
// ==============================================

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CalendarRange,
  Plus,
  Pencil,
  Copy,
  Repeat,
  FileText,
  UploadCloud,
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
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import { DeleteConfirmButton } from "../../components/common/DeleteConfirmModal";
import ScheduleEditorModal from "./components/ScheduleEditorModal";
import InputField from "@/components/common/main/InputField";

/* ================= Shared Types & Utils ================= */
type ScheduleItem = {
  id: string;
  time: string;
  title: string;
  room?: string;
  teacher?: string;
  type?: "class" | "exam" | "event";
  note?: string;
  description?: string;
};

type DaySchedule = { date: string; items: ScheduleItem[] };
type WeekSchedule = { selected: DaySchedule; nextDays: DaySchedule[] };

type RoutineItem = {
  id: string;
  dow: number; // 0..6 Minggu..Sabtu
  time: string;
  title: string;
  room?: string;
  teacher?: string;
  type?: "class" | "exam" | "event";
  note?: string;
  description?: string;
};

export type DailyReport = {
  id: string;
  dateISO: string; // yyyy-mm-dd
  time?: string;
  className: string;
  teacher?: string;
  attendancePercent?: number; // 0..100
  topic?: string;
  homework?: string;
  notes?: string;
};

const idDate = (d: Date) =>
  d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const toISODate = (d: Date) => d.toISOString().slice(0, 10);
const addDaysISO = (iso: string, n: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
};
const parseMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};
const uid = () => Math.random().toString(36).slice(2, 9);

/* ================= localStorage Stores ================= */
// Jadwal Harian
const SCHEDULE_LS_KEY = "teacher_schedule_store_v1";
type ScheduleStore = Record<string, ScheduleItem[]>; // key: yyyy-mm-dd
const readScheduleStore = (): ScheduleStore => {
  try {
    const raw = localStorage.getItem(SCHEDULE_LS_KEY);
    return raw ? (JSON.parse(raw) as ScheduleStore) : {};
  } catch {
    return {};
  }
};
const writeScheduleStore = (s: ScheduleStore) =>
  localStorage.setItem(SCHEDULE_LS_KEY, JSON.stringify(s));

async function listSchedule(selectedISO: string): Promise<WeekSchedule> {
  const seed: ScheduleItem[] = [
    {
      id: uid(),
      time: "07:30",
      title: "Tahsin Kelas",
      room: "Aula 1",
      teacher: "Ust. Rahmat",
      type: "class",
      description:
        "Fokus pada makhraj huruf dan panjang pendek bacaan. Sesi baca bergilir 5 menit per siswa.",
    },
  ];

  const store = readScheduleStore();
  if (!store[selectedISO]) store[selectedISO] = seed;

  const selected = new Date(selectedISO);
  const add = (n: number) => {
    const d = new Date(selected);
    d.setDate(d.getDate() + n);
    return d;
  };

  const make = (date: Date): DaySchedule => ({
    date: date.toISOString(),
    items: (store[toISODate(date)] ?? [])
      .slice()
      .sort((a, b) => parseMinutes(a.time) - parseMinutes(b.time)),
  });

  return {
    selected: make(selected),
    nextDays: [make(add(1)), make(add(2)), make(add(3))],
  };
}

async function createSchedule(dateISO: string, item: Omit<ScheduleItem, "id">) {
  const store = readScheduleStore();
  const key = dateISO;
  const list = store[key] ?? [];
  const newItem: ScheduleItem = { ...item, id: uid() };
  store[key] = [...list, newItem];
  writeScheduleStore(store);
  return newItem;
}
async function bulkCreateSchedule(
  dateISO: string,
  items: Omit<ScheduleItem, "id">[]
) {
  const store = readScheduleStore();
  const key = dateISO;
  const list = store[key] ?? [];
  const newItems = items.map((it) => ({ ...it, id: uid() }));
  store[key] = [...list, ...newItems];
  writeScheduleStore(store);
  return newItems.length;
}
async function updateSchedule(
  dateISO: string,
  id: string,
  patch: Partial<ScheduleItem>
) {
  const store = readScheduleStore();
  const key = dateISO;
  store[key] = (store[key] ?? []).map((it) =>
    it.id === id ? { ...it, ...patch } : it
  );
  writeScheduleStore(store);
}
async function deleteSchedule(dateISO: string, id: string) {
  const store = readScheduleStore();
  const key = dateISO;
  store[key] = (store[key] ?? []).filter((it) => it.id !== id);
  writeScheduleStore(store);
}

// Jadwal Rutin
const ROUTINE_LS_KEY = "teacher_routine_store_v1";
type RoutineStore = RoutineItem[];
const readRoutineStore = (): RoutineStore => {
  try {
    const raw = localStorage.getItem(ROUTINE_LS_KEY);
    return raw ? (JSON.parse(raw) as RoutineStore) : [];
  } catch {
    return [];
  }
};
const writeRoutineStore = (s: RoutineStore) =>
  localStorage.setItem(ROUTINE_LS_KEY, JSON.stringify(s));

// Laporan Harian
const DR_LS_KEY = "teacher_daily_report_store_v1";
const readReports = (): DailyReport[] => {
  try {
    const raw = localStorage.getItem(DR_LS_KEY);
    return raw ? (JSON.parse(raw) as DailyReport[]) : [];
  } catch {
    return [];
  }
};
const writeReports = (list: DailyReport[]) =>
  localStorage.setItem(DR_LS_KEY, JSON.stringify(list));

/* ================= Small Bits ================= */
function TypeBadge({
  t,
  palette,
}: {
  t?: ScheduleItem["type"];
  palette: Palette;
}) {
  if (t === "exam")
    return (
      <Badge variant="warning" palette={palette} className="h-6">
        Ujian
      </Badge>
    );
  if (t === "event")
    return (
      <Badge variant="info" palette={palette} className="h-6">
        Kegiatan
      </Badge>
    );
  return (
    <Badge variant="secondary" palette={palette} className="h-6">
      Kelas
    </Badge>
  );
}

const DOW = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

/* ================= MAIN: Single-file TeacherSchedule ================= */
export default function TeacherSchedule() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const qc = useQueryClient();

  // Tabs: harian / rutin / laporan
  const [tab, setTab] = useState<"harian" | "rutin" | "laporan">("harian");

  // ===== State & Query: Jadwal Harian =====
  const [dateStr, setDateStr] = useState<string>(() => toISODate(new Date()));
  const todayISO = toISODate(new Date());
  const maxISO = addDaysISO(todayISO, 7);
  const [createForDate, setCreateForDate] = useState<string>(dateStr);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["teacher-schedule", dateStr],
    queryFn: () => listSchedule(dateStr),
    staleTime: 60_000,
  });

  const createMut = useMutation({
    mutationFn: (vars: {
      dateISO: string;
      payload: Omit<ScheduleItem, "id">;
    }) => createSchedule(vars.dateISO, vars.payload),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["teacher-schedule", dateStr] });
      if (vars.dateISO !== dateStr) {
        qc.invalidateQueries({
          queryKey: ["teacher-schedule", vars.dateISO],
        });
      }
    },
  });

  const bulkCreateMut = useMutation({
    mutationFn: (vars: {
      dateISO: string;
      items: Omit<ScheduleItem, "id">[];
    }) => bulkCreateSchedule(vars.dateISO, vars.items),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["teacher-schedule", dateStr] });
      if (vars.dateISO !== dateStr) {
        qc.invalidateQueries({
          queryKey: ["teacher-schedule", vars.dateISO],
        });
      }
    },
  });

  const updateMut = useMutation({
    mutationFn: (vars: { id: string; patch: Partial<ScheduleItem> }) =>
      updateSchedule(dateStr, vars.id, vars.patch),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["teacher-schedule", dateStr] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteSchedule(dateStr, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["teacher-schedule", dateStr] }),
  });

  const selectedPretty = useMemo(
    () => (data ? idDate(new Date(data.selected.date)) : "—"),
    [data]
  );
  const onToday = () => setDateStr(toISODate(new Date()));

  const handleEditorSubmit = async (payload: Omit<ScheduleItem, "id">) => {
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, patch: payload });
    } else {
      await createMut.mutateAsync({ dateISO: createForDate, payload });
    }
    setEditorOpen(false);
    setEditing(null);
  };

  // Callback untuk apply dari tab Rutin
  const handleApplyRoutine = (
    targetDateISO: string,
    items: Omit<ScheduleItem, "id">[]
  ) => {
    bulkCreateMut.mutate({ dateISO: targetDateISO, items });
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        gregorianDate={new Date().toISOString()}
        title="Jadwal & Laporan Guru"
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />

          <div className="flex-1 space-y-6">
            {/* ===== Tab Header ===== */}
            <SectionCard palette={palette} className="p-2">
              <div className="flex gap-2 flex-wrap">
                <Btn
                  size="sm"
                  variant={tab === "harian" ? "default" : "secondary"}
                  palette={palette}
                  onClick={() => setTab("harian")}
                >
                  <CalendarDays size={16} className="mr-2" /> Jadwal Harian
                </Btn>
                <Btn
                  size="sm"
                  variant={tab === "rutin" ? "default" : "secondary"}
                  palette={palette}
                  onClick={() => setTab("rutin")}
                >
                  <Repeat size={16} className="mr-2" /> Jadwal Rutin
                </Btn>
                <Btn
                  size="sm"
                  variant={tab === "laporan" ? "default" : "secondary"}
                  palette={palette}
                  onClick={() => setTab("laporan")}
                >
                  <FileText size={16} className="mr-2" /> Laporan Harian
                </Btn>
              </div>
            </SectionCard>

            {/* ===== TAB: HARIAN ===== */}
            {tab === "harian" && (
              <>
                {/* Toolbar */}
                <SectionCard palette={palette} className="p-3">
                  <div className="grid gap-3 md:grid-cols-3 md:items-end">
                    <InputField
                      label="Tanggal"
                      name="viewDate"
                      type="date"
                      value={dateStr}
                      onChange={(e) => {
                        const v = (e.target as HTMLInputElement).value;
                        setDateStr(v);
                        const clamped =
                          v < todayISO ? todayISO : v > maxISO ? maxISO : v;
                        setCreateForDate(clamped);
                      }}
                    />
                    <InputField
                      label="Tambah untuk"
                      name="createForDate"
                      type="date"
                      value={createForDate}
                      onChange={(e) =>
                        setCreateForDate((e.target as HTMLInputElement).value)
                      }
                    />
                    <div className="flex gap-2 md:justify-end">
                      <Btn
                        size="sm"
                        variant="secondary"
                        palette={palette}
                        onClick={onToday}
                      >
                        Hari ini
                      </Btn>
                      <Btn
                        size="sm"
                        variant="default"
                        palette={palette}
                        onClick={() => {
                          setEditing(null);
                          setEditorOpen(true);
                        }}
                      >
                        <Plus className="mr-1" size={16} /> Tambah Jadwal
                      </Btn>
                    </div>
                  </div>
                </SectionCard>

                {/* List Hari ini */}
                <SectionCard palette={palette}>
                  <div className="p-4 md:p-5 pb-2">
                    <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
                      <CalendarDays size={20} color={palette.quaternary} />
                      Jadwal {selectedPretty}
                    </h3>
                    {(isLoading || isFetching) && (
                      <div
                        className="mt-2 text-sm"
                        style={{ color: palette.silver2 }}
                      >
                        Memuat…
                      </div>
                    )}
                  </div>

                  <div className="p-4 md:p-0 md:px-5 md:pb-5 pt-2 space-y-3">
                    {data && data.selected.items.length === 0 && (
                      <div
                        className="rounded-xl border p-4 text-sm"
                        style={{
                          borderColor: palette.silver1,
                          background: palette.white2,
                          color: palette.silver2,
                        }}
                      >
                        Belum ada jadwal. Klik "Tambah Jadwal" atau gunakan tab
                        "Jadwal Rutin" untuk menerapkan template.
                      </div>
                    )}

                    {(data?.selected.items ?? []).map((s) => (
                      <SectionCard
                        key={s.id}
                        palette={palette}
                        className="p-0 transition-all"
                        style={{ background: palette.white2 }}
                      >
                        <div className="p-3 md:p-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                            {/* Kiri */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="text-sm font-semibold truncate">
                                  {s.title}
                                </div>
                                <Badge
                                  variant="outline"
                                  palette={palette}
                                  className="hidden md:inline-flex"
                                >
                                  {s.time}
                                </Badge>
                                <span className="hidden md:inline-flex">
                                  <TypeBadge t={s.type} palette={palette} />
                                </span>
                              </div>
                              <div
                                className="mt-1 text-xs flex flex-wrap items-center gap-2"
                                style={{ color: palette.silver2 }}
                              >
                                <span>{s.room ?? "-"}</span>
                                {s.teacher && <span>• {s.teacher}</span>}
                                <span className="md:hidden inline-flex items-center gap-2">
                                  • <TypeBadge t={s.type} palette={palette} />
                                </span>
                              </div>
                              {(s.note || s.description) && (
                                <div className="mt-2">
                                  <Btn
                                    // size="xs"
                                    variant="ghost"
                                    palette={palette}
                                    onClick={() =>
                                      setExpanded((e) => ({
                                        ...e,
                                        [s.id]: !e[s.id],
                                      }))
                                    }
                                  >
                                    {expanded[s.id] ? "Sembunyikan" : "Detail"}
                                  </Btn>
                                  {expanded[s.id] && (
                                    <div
                                      className="text-xs mt-1 space-y-1"
                                      style={{ color: palette.black2 }}
                                    >
                                      {s.note && (
                                        <p>
                                          <b>Catatan:</b> {s.note}
                                        </p>
                                      )}
                                      {s.description && (
                                        <p>
                                          <b>Deskripsi:</b> {s.description}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            {/* Kanan */}
                            <div className="flex items-center md:items-end justify-between gap-2 shrink-0">
                              <Badge
                                variant="outline"
                                palette={palette}
                                className="md:hidden"
                              >
                                {s.time}
                              </Badge>
                              <div className="hidden md:flex items-center gap-1">
                                <Btn
                                  size="sm"
                                  variant="secondary"
                                  palette={palette}
                                  onClick={() => {
                                    setEditing(s);
                                    setEditorOpen(true);
                                  }}
                                >
                                  <Pencil size={14} className="mr-1" /> Edit
                                </Btn>
                                {/*
                                <Btn size="sm" variant="secondary" palette={palette} onClick={() => { const { id, ...rest } = s; createMut.mutate({ dateISO: createForDate, payload: rest }); }}>
                                  <Copy size={14} className="mr-1" /> Duplikat ke {createForDate}
                                </Btn>
                                */}
                                <DeleteConfirmButton
                                  palette={palette}
                                  onConfirm={() => deleteMut.mutateAsync(s.id)}
                                  message="Hapus jadwal ini? Tindakan tidak dapat dibatalkan."
                                />
                              </div>
                              <div className="flex md:hidden items-center gap-1">
                                <Btn
                                  size="icon"
                                  variant="secondary"
                                  palette={palette}
                                  aria-label="Edit jadwal"
                                  onClick={() => {
                                    setEditing(s);
                                    setEditorOpen(true);
                                  }}
                                >
                                  <Pencil size={16} />
                                </Btn>
                                <DeleteConfirmButton
                                  palette={palette}
                                  size="icon"
                                  variant="destructive"
                                  ariaLabel="Hapus jadwal"
                                  onConfirm={() => deleteMut.mutateAsync(s.id)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </SectionCard>
                    ))}
                  </div>
                </SectionCard>

                {/* Sekilas minggu ini (opsional) */}
                {/* ... */}

                {/* Modal Editor */}
                <ScheduleEditorModal
                  open={editorOpen}
                  onClose={() => {
                    if (createMut.isPending || updateMut.isPending) return;
                    setEditorOpen(false);
                    setEditing(null);
                  }}
                  palette={palette}
                  dateISO={editing ? dateStr : createForDate}
                  initial={editing ?? undefined}
                  onSubmit={handleEditorSubmit}
                  loading={createMut.isPending || updateMut.isPending}
                />
              </>
            )}

            {/* ===== TAB: RUTIN ===== */}
            {tab === "rutin" && (
              <RoutineSection palette={palette} onApply={handleApplyRoutine} />
            )}

            {/* ===== TAB: LAPORAN ===== */}
            {tab === "laporan" && <DailyReportSection palette={palette} />}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= Child-in-file: RoutineSection ================= */
function RoutineSection({
  palette,
  onApply,
}: {
  palette: Palette;
  onApply: (dateISO: string, items: Omit<ScheduleItem, "id">[]) => void;
}) {
  const qc = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<RoutineItem | null>(null);
  const [targetDate, setTargetDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );

  const { data: routineList = [] } = useQuery({
    queryKey: ["routine-list"],
    queryFn: async () => readRoutineStore(),
  });

  const createMut = useMutation({
    mutationFn: async (payload: Omit<RoutineItem, "id">) => {
      const list = readRoutineStore();
      const item: RoutineItem = { ...payload, id: uid() };
      writeRoutineStore([...list, item]);
      return item;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routine-list"] }),
  });
  const updateMut = useMutation({
    mutationFn: async (vars: { id: string; patch: Partial<RoutineItem> }) => {
      const list = readRoutineStore();
      writeRoutineStore(
        list.map((it) => (it.id === vars.id ? { ...it, ...vars.patch } : it))
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routine-list"] }),
  });
  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const list = readRoutineStore();
      writeRoutineStore(list.filter((it) => it.id !== id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routine-list"] }),
  });

  const dayGroups = useMemo(() => {
    const map: Record<number, RoutineItem[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
    routineList.forEach((it) => map[it.dow]?.push(it));
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => a.time.localeCompare(b.time))
    );
    return map;
  }, [routineList]);

  return (
    <div>
      <SectionCard palette={palette} className="p-4">
        <div className="grid gap-3 md:grid-cols-3 md:items-end">
          <InputField
            label="Tanggal Target"
            name="routineTargetDate"
            type="date"
            value={targetDate}
            onChange={(e) =>
              setTargetDate((e.target as HTMLInputElement).value)
            }
          />
          <div className="flex gap-2 md:justify-end md:col-span-2">
            <Btn
              size="sm"
              variant="default"
              palette={palette}
              onClick={() => setEditorOpen(true)}
            >
              <Plus size={16} className="mr-1" /> Tambah Item Rutin
            </Btn>
            <Btn
              size="sm"
              variant="secondary"
              palette={palette}
              onClick={() => {
                const dow = new Date(targetDate).getDay();
                const items = (dayGroups[dow] ?? []).map((x) => ({
                  time: x.time,
                  title: x.title,
                  room: x.room,
                  teacher: x.teacher,
                  type: x.type,
                  note: x.note,
                  description: x.description,
                }));
                onApply(targetDate, items);
              }}
            >
              <UploadCloud size={16} className="mr-1" /> Terapkan ke Tanggal Ini
            </Btn>
          </div>
        </div>
      </SectionCard>

      <SectionCard palette={palette}>
        <div className="p-4 md:p-5 pb-2 flex items-center gap-2">
          <CalendarRange size={20} color={palette.quaternary} />
          <div className="text-base font-semibold">Template Mingguan</div>
        </div>
        <div className="p-4 md:p-5 pt-2 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(dayGroups).map(([k, arr]) => (
            <div
              key={k}
              className="rounded-2xl border"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
              }}
            >
              <div
                className="px-3 py-2 text-sm font-medium"
                style={{ borderBottom: `1px solid ${palette.silver1}` }}
              >
                {DOW[Number(k) as 0]}
              </div>
              <div className="p-3 grid gap-2">
                {arr.length === 0 && (
                  <div className="text-xs" style={{ color: palette.silver2 }}>
                    Belum ada.
                  </div>
                )}
                {arr.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border p-3"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white1,
                    }}
                  >
                    <div className="text-sm font-semibold">{s.title}</div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: palette.silver2 }}
                    >
                      {s.time} • {s.room ?? "-"}{" "}
                      {s.teacher ? `• ${s.teacher}` : ""}
                    </div>
                    {s.note && (
                      <div
                        className="text-xs mt-1"
                        style={{ color: palette.black2 }}
                      >
                        {s.note}
                      </div>
                    )}
                    <div className="mt-2 flex gap-2">
                      <Btn
                        size="sm"
                        variant="secondary"
                        palette={palette}
                        onClick={() => {
                          setEditing(s);
                          setEditorOpen(true);
                        }}
                      >
                        Edit
                      </Btn>
                      <Btn
                        size="sm"
                        variant="destructive"
                        palette={palette}
                        onClick={() => deleteMut.mutateAsync(s.id)}
                      >
                        Hapus
                      </Btn>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Modal Editor pakai ScheduleEditorModal yang sama */}
      <ScheduleEditorModal
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
        }}
        palette={palette}
        dateISO={targetDate}
        initial={
          editing
            ? {
                time: editing.time,
                title: editing.title,
                room: editing.room,
                teacher: editing.teacher,
                type: editing.type,
                note: editing.note,
                description: editing.description,
              }
            : undefined
        }
        onSubmit={async (payload) => {
          if (editing) {
            await updateMut.mutateAsync({
              id: editing.id,
              patch: { ...payload },
            });
          } else {
            const dow = new Date(targetDate).getDay();
            await createMut.mutateAsync({ ...payload, dow });
          }
          setEditorOpen(false);
          setEditing(null);
        }}
        loading={createMut.isPending || updateMut.isPending}
      />
    </div>
  );
}

/* ================= Child-in-file: DailyReportSection ================= */
function DailyReportSection({ palette }: { palette: Palette }) {
  const qc = useQueryClient();
  const [dateStr, setDateStr] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [draft, setDraft] = useState<Omit<DailyReport, "id">>({
    dateISO: dateStr,
    className: "",
    topic: "",
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["daily-reports", dateStr],
    queryFn: async () => readReports().filter((r) => r.dateISO === dateStr),
  });

  const addMut = useMutation({
    mutationFn: async (payload: Omit<DailyReport, "id">) => {
      const list = readReports();
      const item: DailyReport = { ...payload, id: uid() };
      writeReports([item, ...list]);
      return item;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["daily-reports", dateStr] }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      writeReports(readReports().filter((r) => r.id !== id));
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["daily-reports", dateStr] }),
  });

  const selectedPretty = useMemo(
    () =>
      new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [dateStr]
  );

  return (
    <div>
      <SectionCard palette={palette} className="p-4">
        <div className="grid gap-3 md:grid-cols-3 md:items-end">
          <InputField
            label="Tanggal"
            name="reportDate"
            type="date"
            value={dateStr}
            onChange={(e) => {
              const v = (e.target as HTMLInputElement).value;
              setDateStr(v);
              setDraft((d) => ({ ...d, dateISO: v }));
            }}
          />
        </div>
      </SectionCard>

      <SectionCard palette={palette}>
        <div className="p-4 md:p-5 pb-2 flex items-center gap-2">
          <FileText size={20} color={palette.quaternary} />
          <div className="text-base font-semibold">
            Laporan Harian ({selectedPretty})
          </div>
        </div>

        {/* Form ringkas */}
        <div className="px-4 pb-4 grid gap-3 md:grid-cols-2">
          <InputField
            label="Nama Kelas/Mapel"
            name="className"
            placeholder="Contoh: Tahsin 3A"
            value={draft.className}
            onChange={(e) =>
              setDraft({
                ...draft,
                className: (e.target as HTMLInputElement).value,
              })
            }
          />
          <InputField
            label="Jam (opsional)"
            name="time"
            placeholder="07:30-08:30"
            value={draft.time ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, time: (e.target as HTMLInputElement).value })
            }
          />
          <InputField
            label="Materi/Topik"
            name="topic"
            value={draft.topic ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                topic: (e.target as HTMLInputElement).value,
              })
            }
          />
          <InputField
            label="Kehadiran (%)"
            name="attendancePercent"
            type="number"
            value={draft.attendancePercent?.toString() ?? ""}
            placeholder="0-100"
            onChange={(e) =>
              setDraft({
                ...draft,
                attendancePercent: Number((e.target as HTMLInputElement).value),
              })
            }
          />
          <InputField
            label="PR (opsional)"
            name="homework"
            as="textarea"
            rows={4}
            value={draft.homework ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                homework: (e.target as HTMLTextAreaElement).value,
              })
            }
          />
          <InputField
            label="Catatan (opsional)"
            name="notes"
            as="textarea"
            rows={4}
            value={draft.notes ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                notes: (e.target as HTMLTextAreaElement).value,
              })
            }
          />
          <div className="md:col-span-2 flex gap-2">
            <Btn
              size="sm"
              variant="default"
              palette={palette}
              onClick={() => {
                if (!draft.className) return;
                addMut.mutate({ ...draft, dateISO: dateStr });
                setDraft({ dateISO: dateStr, className: "", topic: "" });
              }}
            >
              <Plus size={16} className="mr-1" /> Simpan Laporan
            </Btn>
          </div>
        </div>

        {/* List laporan hari ini */}
        <div className="p-4 grid gap-2">
          {reports.length === 0 && (
            <div className="text-sm" style={{ color: palette.silver2 }}>
              Belum ada laporan untuk tanggal ini.
            </div>
          )}
          {reports.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border p-3"
              style={{
                borderColor: palette.silver1,
                background: palette.white1,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {r.className}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: palette.silver2 }}
                  >
                    {r.time ? `${r.time} • ` : ""}
                    {r.teacher ?? ""}
                  </div>
                </div>
                {typeof r.attendancePercent === "number" && (
                  <Badge variant="outline" palette={palette}>
                    {r.attendancePercent}% hadir
                  </Badge>
                )}
              </div>
              {r.topic && (
                <div className="text-xs mt-2">
                  <b>Materi:</b> {r.topic}
                </div>
              )}
              {r.homework && (
                <div className="text-xs mt-1">
                  <b>PR:</b> {r.homework}
                </div>
              )}
              {r.notes && (
                <div className="text-xs mt-1" style={{ color: palette.black2 }}>
                  <b>Catatan:</b> {r.notes}
                </div>
              )}
              <div className="mt-2">
                <Btn
                  size="sm"
                  variant="destructive"
                  palette={palette}
                  onClick={() => deleteMut.mutateAsync(r.id)}
                >
                  Hapus
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
