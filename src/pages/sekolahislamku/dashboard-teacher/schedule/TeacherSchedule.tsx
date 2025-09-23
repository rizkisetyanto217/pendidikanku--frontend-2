// ==============================================
// File: src/pages/sekolahislamku/dashboard-teacher/schedule/TeacherSchedule.tsx
// Layout dan sistem disamakan dengan CalenderAcademic
// Menggunakan in-memory storage dengan query system
// ==============================================

import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// Theme & utils
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

// UI primitives & layout
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

// Icons
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  Clock,
  MapPin,
  User,
} from "lucide-react";

/* ================= Helpers ================= */
type ScheduleRow = {
  id: string;
  title: string;
  date: string; // ISO
  time: string; // HH:mm
  room?: string;
  teacher?: string;
  type?: "class" | "exam" | "event";
  description?: string;
};

type TeacherScheduleProps = {
  showBack?: boolean; // default: false
  backTo?: string; // optional: kalau diisi, navigate ke path ini, kalau tidak pakai nav(-1)
  backLabel?: string; // teks tombol
};

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

const hijriLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

const toMonthStr = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const monthLabel = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, (m || 1) - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
};

const toLocalInputValue = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/* ================= Dummy API (in-memory) ================= */
// Storage per-bulan: key "YYYY-MM" -> ScheduleRow[]
const scheduleStore = new Map<string, ScheduleRow[]>();

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

const scheduleApi = {
  async list(month: string): Promise<ScheduleRow[]> {
    await delay();
    // seed contoh kalau kosong
    if (!scheduleStore.has(month)) {
      const [y, m] = month.split("-").map(Number);
      scheduleStore.set(month, [
        {
          id: uid(),
          title: "Tahsin Al-Quran",
          date: new Date(y, m - 1, 8, 7, 30).toISOString(),
          time: "07:30",
          room: "Aula 1",
          teacher: "Ust. Ahmad",
          type: "class",
          description: "Pembelajaran tahsin dengan fokus makhraj huruf",
        },
        {
          id: uid(),
          title: "Matematika Kelas 5",
          date: new Date(y, m - 1, 12, 10, 0).toISOString(),
          time: "10:00",
          room: "Ruang 5A",
          teacher: "Bu Sari",
          type: "class",
          description: "Materi pecahan dan desimal",
        },
        {
          id: uid(),
          title: "Ujian Tengah Semester",
          date: new Date(y, m - 1, 20, 8, 0).toISOString(),
          time: "08:00",
          room: "Aula Utama",
          type: "exam",
          description: "UTS mata pelajaran semua kelas",
        },
      ]);
    }
    return JSON.parse(JSON.stringify(scheduleStore.get(month)!));
  },

  async create(
    month: string,
    payload: Omit<ScheduleRow, "id">
  ): Promise<ScheduleRow> {
    await delay();
    const curr = scheduleStore.get(month) || [];
    const row: ScheduleRow = { id: uid(), ...payload };
    scheduleStore.set(month, [...curr, row]);
    return JSON.parse(JSON.stringify(row));
  },

  async update(month: string, payload: ScheduleRow): Promise<ScheduleRow> {
    await delay();
    const curr = scheduleStore.get(month) || [];
    const idx = curr.findIndex((x) => x.id === payload.id);
    if (idx >= 0) curr[idx] = { ...payload };
    scheduleStore.set(month, curr);
    return JSON.parse(JSON.stringify(payload));
  },

  async remove(month: string, id: string): Promise<void> {
    await delay();
    const curr = scheduleStore.get(month) || [];
    scheduleStore.set(
      month,
      curr.filter((x) => x.id !== id)
    );
  },
};

/* ========================================================= */

const TeacherSchedule: React.FC<TeacherScheduleProps> = ({
  showBack = false,
  backTo,
  backLabel = "Kembali",
}) => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  const qc = useQueryClient();

  const [month, setMonth] = useState<string>(toMonthStr());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editing, setEditing] = useState<ScheduleRow | null>(null);

  // List schedules (dummy)
  const schedulesQ = useQuery({
    queryKey: ["teacher-schedules", month],
    queryFn: () => scheduleApi.list(month),
    staleTime: 30_000,
  });

  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleRow[]>();
    (schedulesQ.data ?? []).forEach((s) => {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const existing = map.get(key) || [];
      // Sort by time
      existing.push(s);
      existing.sort((a, b) => a.time.localeCompare(b.time));
      map.set(key, existing);
    });
    return map;
  }, [schedulesQ.data]);

  // CRUD (dummy)
  const createMut = useMutation({
    mutationFn: (payload: Omit<ScheduleRow, "id">) =>
      scheduleApi.create(month, payload),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["teacher-schedules", month] });
      setSelectedDay(row.date.slice(0, 10));
    },
  });

  const updateMut = useMutation({
    mutationFn: (payload: ScheduleRow) => scheduleApi.update(month, payload),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["teacher-schedules", month] });
      setSelectedDay(row.date.slice(0, 10));
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => scheduleApi.remove(month, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["teacher-schedules", month] }),
  });

  // Calendar grid
  const days = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const first = new Date(y, (m || 1) - 1, 1);
    const firstWeekday = (first.getDay() + 6) % 7; // Mon=0
    const total = new Date(y, m, 0).getDate();
    const cells: { label: number | null; dateKey: string | null }[] = [];

    for (let i = 0; i < firstWeekday; i++)
      cells.push({ label: null, dateKey: null });

    for (let d = 1; d <= total; d++) {
      const key = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ label: d, dateKey: key });
    }

    while (cells.length % 7 !== 0) cells.push({ label: null, dateKey: null });

    return cells;
  }, [month]);

  const gotoPrev = () => {
    const [y, m] = month.split("-").map(Number);
    setMonth(toMonthStr(new Date(y, m - 2, 1)));
  };

  const gotoNext = () => {
    const [y, m] = month.split("-").map(Number);
    setMonth(toMonthStr(new Date(y, m, 1)));
  };

  const nowISO = new Date().toISOString();

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "class":
        return palette.primary;
      case "exam":
        return "#ef4444";
      case "event":
        return "#10b981";
      default:
        return palette.primary;
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case "class":
        return "Kelas";
      case "exam":
        return "Ujian";
      case "event":
        return "Acara";
      default:
        return "Kelas";
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Jadwal Mengajar"
        gregorianDate={nowISO}
        hijriDate={hijriLong(nowISO)}
        dateFmt={dateLong}
        showBack
      />

      <main className="w-full px-4 md:px-6  md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <section className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Header */}
            <section className="flex items-start gap-3">
              {showBack && (
                <Btn
                  palette={palette}
                  onClick={() => navigate(-1)}
                  variant="ghost"
                  className="cursor-pointer mr-3"
                >
                  <ArrowLeft
                    aria-label={backLabel}
                    // title={backLabel}

                    size={20}
                  />
                </Btn>
              )}
              <span
                className="h-10 w-10 grid place-items-center rounded-xl"
                style={{ background: palette.primary2, color: palette.primary }}
              >
                <CalendarDays size={18} />
              </span>
              <div>
                <div className="text-base font-semibold">Jadwal Mengajar</div>
                <div className="text-sm" style={{ color: palette.black2 }}>
                  Klik tanggal untuk melihat/menambah jadwal mengajar.
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Btn palette={palette} variant="outline" onClick={gotoPrev}>
                  <ChevronLeft size={16} />
                </Btn>
                <div className="px-2 text-sm font-medium">
                  {monthLabel(month)}
                </div>
                <Btn palette={palette} variant="outline" onClick={gotoNext}>
                  <ChevronRight size={16} />
                </Btn>
              </div>
            </section>

            {/* Kalender */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5">
                <div
                  className="grid grid-cols-7 gap-2 text-xs mb-2"
                  style={{ color: palette.black2 }}
                >
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(
                    (d) => (
                      <div key={d} className="text-center">
                        {d}
                      </div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {days.map((c, i) => {
                    const schedules = c.dateKey
                      ? byDate.get(c.dateKey)
                      : undefined;
                    const selected = selectedDay === c.dateKey;
                    return (
                      <button
                        key={i}
                        disabled={!c.dateKey}
                        onClick={() => setSelectedDay(c.dateKey!)}
                        className="aspect-square rounded-lg border p-1 sm:p-2 text-left relative transition disabled:opacity-40"
                        style={{
                          borderColor: palette.silver1,
                          background: selected
                            ? palette.primary2
                            : palette.white1,
                        }}
                      >
                        {/* Tanggal */}
                        <div className="text-[11px] sm:text-xs font-medium">
                          {c.label ?? ""}
                        </div>

                        {/* Titik indikator */}
                        {!!schedules && schedules.length > 0 && (
                          <div className="absolute right-1 top-1 flex gap-0.5">
                            {schedules.slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: getTypeColor(s.type) }}
                              />
                            ))}
                          </div>
                        )}

                        {/* Event ringkas */}
                        {schedules && schedules[0] && (
                          <div
                            className="mt-1 text-[10px] sm:text-xs line-clamp-2 leading-snug"
                            style={{ color: palette.black2 }}
                          >
                            {schedules[0].time} {schedules[0].title}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </SectionCard>

            {/* Panel hari terpilih */}
            {selectedDay && (
              <SectionCard palette={palette}>
                <div className="p-4 md:p-5">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      Jadwal {new Date(selectedDay).toLocaleDateString("id-ID")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Btn
                        palette={palette}
                        size="sm"
                        onClick={() =>
                          setEditing({
                            id: "",
                            title: "",
                            date: new Date(
                              selectedDay + "T07:00:00"
                            ).toISOString(),
                            time: "07:00",
                          })
                        }
                        className="gap-1"
                      >
                        <Plus size={16} />
                      </Btn>
                      <Btn
                        palette={palette}
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDay(null)}
                      >
                        <X size={16} />
                      </Btn>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {(byDate.get(selectedDay) ?? []).map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-start justify-between rounded-lg border px-3 py-3"
                        style={{ borderColor: palette.silver1 }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2 mb-1">
                            <span
                              className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0"
                              style={{
                                background: getTypeColor(schedule.type),
                              }}
                            />
                            <div>
                              <div className="text-sm font-medium">
                                {schedule.title}
                              </div>
                              <div
                                className="text-xs flex items-center gap-3 mt-1"
                                style={{ color: palette.black2 }}
                              >
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {schedule.time}
                                </span>
                                {schedule.room && (
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    {schedule.room}
                                  </span>
                                )}
                                {schedule.teacher && (
                                  <span className="flex items-center gap-1">
                                    <User size={12} />
                                    {schedule.teacher}
                                  </span>
                                )}
                              </div>
                              <div
                                className="text-xs mt-1"
                                style={{ color: palette.black2 }}
                              >
                                {getTypeLabel(schedule.type)}
                              </div>
                              {schedule.description && (
                                <div
                                  className="text-xs mt-2 opacity-80"
                                  style={{ color: palette.black2 }}
                                >
                                  {schedule.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <Btn
                            palette={palette}
                            size="sm"
                            variant="ghost"
                            className="gap-1"
                            onClick={() => setEditing(schedule)}
                          >
                            <Pencil size={14} />
                          </Btn>
                          <Btn
                            palette={palette}
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => deleteMut.mutate(schedule.id)}
                            disabled={deleteMut.isPending}
                          >
                            <Trash2 size={14} />
                          </Btn>
                        </div>
                      </div>
                    ))}
                    {(byDate.get(selectedDay) ?? []).length === 0 && (
                      <div
                        className="text-sm"
                        style={{ color: palette.silver2 }}
                      >
                        Belum ada jadwal pada tanggal ini.
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
            )}
          </section>
        </div>
      </main>

      {/* Modal */}
      {editing && (
        <EditScheduleModal
          palette={palette}
          value={editing}
          onClose={() => setEditing(null)}
          onSubmit={(val) => {
            if (!val.title.trim()) return;
            if (val.id) {
              updateMut.mutate(val, { onSuccess: () => setEditing(null) });
            } else {
              const { id, ...payload } = val;
              createMut.mutate(payload, { onSuccess: () => setEditing(null) });
            }
          }}
        />
      )}
    </div>
  );
};

export default TeacherSchedule;

/* =============== Modal Edit Jadwal =============== */
function EditScheduleModal({
  palette,
  value,
  onClose,
  onSubmit,
}: {
  palette: Palette;
  value: ScheduleRow;
  onClose: () => void;
  onSubmit: (v: ScheduleRow) => void;
}) {
  const [form, setForm] = useState<ScheduleRow>(value);
  const set = (k: keyof ScheduleRow, v: any) =>
    setForm((s) => ({ ...s, [k]: v }));

  // Dummy options (ganti nanti kalau dari API/backend)
  const roomOptions = ["Aula 1", "Aula Utama", "Ruang 5A", "Ruang 6B"];
  const classOptions = ["1A", "2B", "3C", "4D", "5A", "6B"];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.2)" }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-xl border p-4"
        style={{
          borderColor: palette.silver1,
          background: palette.white1,
          color: palette.black1,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold">
            {form.id ? "Ubah Jadwal" : "Tambah Jadwal"}
          </div>
          <button onClick={onClose} className="p-1">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 text-sm">
          {/* Judul */}
          <div>
            <div className="text-xs mb-2" style={{ color: palette.silver2 }}>
              Judul Jadwal
            </div>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full h-10 rounded-lg border px-3 bg-transparent"
              style={{ borderColor: palette.silver1 }}
              placeholder="Contoh: Matematika Kelas 5A"
            />
          </div>

          {/* Tanggal & Jenis */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs mb-2" style={{ color: palette.silver2 }}>
                Tanggal & Waktu
              </div>
              <input
                type="datetime-local"
                value={toLocalInputValue(form.date)}
                onChange={(e) => {
                  const newDate = new Date(e.target.value).toISOString();
                  const time = e.target.value.split("T")[1] || "07:00";
                  set("date", newDate);
                  set("time", time);
                }}
                className="w-full h-10 rounded-lg border px-3 bg-transparent text-xs"
                style={{ borderColor: palette.silver1 }}
              />
            </div>
            <div>
              <div className="text-xs mb-2" style={{ color: palette.silver2 }}>
                Jenis
              </div>
              <select
                value={form.type || "class"}
                onChange={(e) => set("type", e.target.value)}
                className="w-full h-10 rounded-lg border px-3 bg-transparent"
                style={{
                  borderColor: palette.silver1,
                  background: palette.white1,
                }}
              >
                <option value="class">Kelas</option>
                <option value="exam">Ujian</option>
                <option value="event">Acara</option>
              </select>
            </div>
          </div>

          {/* Ruangan & Kelas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs mb-2" style={{ color: palette.silver2 }}>
                Ruangan
              </div>
              <select
                value={form.room || ""}
                onChange={(e) => set("room", e.target.value)}
                className="w-full h-10 rounded-lg border px-3 bg-transparent"
                style={{
                  borderColor: palette.silver1,
                  background: palette.white1,
                }}
              >
                <option value="">- Pilih Ruangan -</option>
                {roomOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs mb-2" style={{ color: palette.silver2 }}>
                Kelas
              </div>
              <select
                value={form.teacher || ""}
                onChange={(e) => set("teacher", e.target.value)}
                className="w-full h-10 rounded-lg border px-3 bg-transparent"
                style={{
                  borderColor: palette.silver1,
                  background: palette.white1,
                }}
              >
                <option value="">- Pilih Kelas -</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <div className="text-xs mb-2" style={{ color: palette.silver2 }}>
              Deskripsi (opsional)
            </div>
            <textarea
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 bg-transparent resize-none"
              style={{ borderColor: palette.silver1 }}
              placeholder="Deskripsi atau catatan tambahan..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <Btn palette={palette} variant="ghost" onClick={onClose}>
            Batal
          </Btn>
          <Btn
            palette={palette}
            onClick={() => onSubmit(form)}
            className="gap-1"
          >
            {form.id ? <Pencil size={16} /> : <Plus size={16} />} Simpan
          </Btn>
        </div>
      </div>
    </div>
  );
}
