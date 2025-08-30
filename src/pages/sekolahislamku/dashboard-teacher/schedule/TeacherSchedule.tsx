// src/pages/sekolahislamku/dashboard-teacher/schedule/TeacherSchedule.tsx
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Plus, Pencil, CalendarRange } from "lucide-react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import { DeleteConfirmButton } from "../../components/common/DeleteConfirmModal";
import ScheduleEditorModal from "./components/ScheduleEditorModal";
import ParentSidebar from "../../components/home/ParentSideBar";

/* ================= Types ================= */
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

/* =============== Helpers =============== */
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

/* ================= Fake API (localStorage) ================= */
const LS_KEY = "teacher_schedule_store_v1";
type Store = Record<string, ScheduleItem[]>; // key: yyyy-mm-dd
const readStore = (): Store => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
};
const writeStore = (s: Store) =>
  localStorage.setItem(LS_KEY, JSON.stringify(s));

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

  const store = readStore();
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
  const store = readStore();
  const key = dateISO;
  const list = store[key] ?? [];
  const newItem: ScheduleItem = { ...item, id: uid() };
  store[key] = [...list, newItem];
  writeStore(store);
  return newItem;
}
async function updateSchedule(
  dateISO: string,
  id: string,
  patch: Partial<ScheduleItem>
) {
  const store = readStore();
  const key = dateISO;
  store[key] = (store[key] ?? []).map((it) =>
    it.id === id ? { ...it, ...patch } : it
  );
  writeStore(store);
}
async function deleteSchedule(dateISO: string, id: string) {
  const store = readStore();
  const key = dateISO;
  store[key] = (store[key] ?? []).filter((it) => it.id !== id);
  writeStore(store);
}

/* ================= Small bits ================= */
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

/* ================= Page ================= */
export default function TeacherSchedule() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const qc = useQueryClient();

  // Tanggal yang sedang dilihat
  const [dateStr, setDateStr] = useState<string>(() => toISODate(new Date()));

  // Tanggal target untuk membuat jadwal baru (bisa berbeda)
  const todayISO = toISODate(new Date());
  const maxISO = addDaysISO(todayISO, 7); // maksimal 7 hari ke depan
  const [createForDate, setCreateForDate] = useState<string>(dateStr);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleItem | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["teacher-schedule", dateStr],
    queryFn: () => listSchedule(dateStr),
    staleTime: 60_000,
  });

  // CREATE: sekarang menerima variabel dateISO agar bisa buat ke tanggal lain
  const createMut = useMutation({
    mutationFn: (vars: {
      dateISO: string;
      payload: Omit<ScheduleItem, "id">;
    }) => createSchedule(vars.dateISO, vars.payload),
    onSuccess: (_res, vars) => {
      // Refresh list untuk tanggal yang sedang dilihat dan tanggal tujuan create (kalau beda)
      qc.invalidateQueries({ queryKey: ["teacher-schedule", dateStr] });
      if (vars.dateISO !== dateStr) {
        qc.invalidateQueries({ queryKey: ["teacher-schedule", vars.dateISO] });
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

  // Submit dari modal editor
  const handleEditorSubmit = async (payload: Omit<ScheduleItem, "id">) => {
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, patch: payload });
    } else {
      // 🆕 create ke tanggal yang dipilih pada "Untuk:"
      await createMut.mutateAsync({ dateISO: createForDate, payload });
    }
    setEditorOpen(false);
    setEditing(null);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        gregorianDate={new Date().toISOString()}
        title="Jadwal (Guru)"
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />

          <div className="flex-1 space-y-6">
            {/* Filter / Toolbar */}
            <SectionCard palette={palette} className="p-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} color={palette.quaternary} />
                  <input
                    type="date"
                    aria-label="Lihat jadwal tanggal"
                    value={dateStr}
                    onChange={(e) => {
                      setDateStr(e.target.value);
                      // sinkron default createForDate dengan tanggal yang sedang dilihat,
                      // namun tetap dibatasi min/max
                      const v = e.target.value;
                      const clamped =
                        v < todayISO ? todayISO : v > maxISO ? maxISO : v;
                      setCreateForDate(clamped);
                    }}
                    className="h-9 w-48 rounded-xl px-3 text-sm"
                    style={{
                      background: palette.white1,
                      color: palette.black1,
                      border: `1px solid ${palette.silver1}`,
                    }}
                  />
                  <Btn
                    size="sm"
                    variant="secondary"
                    palette={palette}
                    onClick={onToday}
                  >
                    Hari ini
                  </Btn>
                </div>

                {/* 🆕 Target tanggal untuk pembuatan jadwal */}
                <div className="md:ml-auto flex items-center gap-2">
                  <div className="text-xs" style={{ color: palette.silver2 }}>
                    Tambah untuk:
                  </div>
                  <input
                    type="date"
                    aria-label="Tanggal untuk pembuatan jadwal baru"
                    value={createForDate}
                    onChange={(e) => setCreateForDate(e.target.value)}
                    min={todayISO}
                    max={maxISO}
                    className="h-9 w-44 rounded-xl px-3 text-sm"
                    style={{
                      background: palette.white1,
                      color: palette.black1,
                      border: `1px solid ${palette.silver1}`,
                    }}
                  />
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

            {/* Jadwal hari terpilih */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2">
                <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
                  <CalendarDays size={20} color={palette.quaternary} /> Jadwal{" "}
                  {selectedPretty}
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
                    Belum ada jadwal. Klik "Tambah Jadwal" untuk membuat.
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

                          {s.note && (
                            <p
                              className="mt-1 text-xs"
                              style={{ color: palette.black2 }}
                            >
                              {s.note}
                            </p>
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

            {/* Sekilas minggu ini */}
            {data && data.nextDays.length > 0 && (
              <SectionCard palette={palette}>
                <div className="p-4 md:p-5 pb-2">
                  <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
                    <CalendarRange size={20} color={palette.quaternary} />
                    Minggu Ini
                  </h3>
                </div>
                <div className="p-4 md:p-0 md:px-5 pt-2 grid gap-3 mb-5">
                  {data.nextDays.map((d) => (
                    <div
                      key={d.date}
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
                        {idDate(new Date(d.date))}
                      </div>
                      <div className="p-3 grid gap-2">
                        {d.items.length === 0 && (
                          <div
                            className="text-xs"
                            style={{ color: palette.silver2 }}
                          >
                            Belum ada jadwal pada hari ini.
                          </div>
                        )}
                        {d.items.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between rounded-xl border px-3 py-2"
                            style={{
                              borderColor: palette.silver1,
                              background: palette.white1,
                            }}
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">
                                {s.title}
                              </div>
                              <div
                                className="text-xs mt-0.5 truncate"
                                style={{ color: palette.silver2 }}
                              >
                                {s.room ?? "-"}{" "}
                                {s.teacher ? `• ${s.teacher}` : ""}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <TypeBadge t={s.type} palette={palette} />
                              <Badge variant="outline" palette={palette}>
                                {s.time}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Modal Editor */}
            <ScheduleEditorModal
              open={editorOpen}
              onClose={() => {
                if (createMut.isPending || updateMut.isPending) return;
                setEditorOpen(false);
                setEditing(null);
              }}
              palette={palette}
              // Header modal menampilkan tanggal ini:
              dateISO={editing ? dateStr : createForDate}
              initial={editing ?? undefined}
              onSubmit={handleEditorSubmit}
              loading={createMut.isPending || updateMut.isPending}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
