// src/pages/sekolahislamku/pages/academic/CalenderAcademic.tsx
import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "@/lib/axios"; // tetap ada kalau nanti ganti ke backend asli

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
} from "lucide-react";

/* ================= Helpers ================= */
type EventRow = {
  id: string;
  title: string;
  date: string; // ISO
  level?: string;
  category?: string;
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
// Storage per-bulan: key "YYYY-MM" -> EventRow[]
const store = new Map<string, EventRow[]>();

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

const fakeApi = {
  async list(month: string): Promise<EventRow[]> {
    await delay();
    // seed contoh kalau kosong
    if (!store.has(month)) {
      const [y, m] = month.split("-").map(Number);
      store.set(month, [
        {
          id: uid(),
          title: "Contoh: Ujian",
          date: new Date(y, m - 1, 10, 7).toISOString(),
          category: "Ujian",
        },
        {
          id: uid(),
          title: "Contoh: Rapat",
          date: new Date(y, m - 1, 15, 13).toISOString(),
          category: "Kegiatan",
        },
      ]);
    }
    return JSON.parse(JSON.stringify(store.get(month)!));
  },
  async create(
    month: string,
    payload: Omit<EventRow, "id">
  ): Promise<EventRow> {
    await delay();
    const curr = store.get(month) || [];
    const row: EventRow = { id: uid(), ...payload };
    store.set(month, [...curr, row]);
    return JSON.parse(JSON.stringify(row));
  },
  async update(month: string, payload: EventRow): Promise<EventRow> {
    await delay();
    const curr = store.get(month) || [];
    const idx = curr.findIndex((x) => x.id === payload.id);
    if (idx >= 0) curr[idx] = { ...payload };
    store.set(month, curr);
    return JSON.parse(JSON.stringify(payload));
  },
  async remove(month: string, id: string): Promise<void> {
    await delay();
    const curr = store.get(month) || [];
    store.set(
      month,
      curr.filter((x) => x.id !== id)
    );
  },
};
/* ========================================================= */

const CalenderAcademic: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [month, setMonth] = useState<string>(toMonthStr());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editing, setEditing] = useState<EventRow | null>(null);

  // List events (dummy)
  const eventsQ = useQuery({
    queryKey: ["acad-events", month],
    queryFn: () => fakeApi.list(month),
    staleTime: 30_000,
  });

  const byDate = useMemo(() => {
    const map = new Map<string, EventRow[]>();
    (eventsQ.data ?? []).forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      map.set(key, [...(map.get(key) || []), e]);
    });
    return map;
  }, [eventsQ.data]);

  // CRUD (dummy)
  const createMut = useMutation({
    mutationFn: (payload: Omit<EventRow, "id">) =>
      fakeApi.create(month, payload),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["acad-events", month] });
      setSelectedDay(row.date.slice(0, 10));
    },
  });
  const updateMut = useMutation({
    mutationFn: (payload: EventRow) => fakeApi.update(month, payload),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["acad-events", month] });
      setSelectedDay(row.date.slice(0, 10));
    },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => fakeApi.remove(month, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["acad-events", month] }),
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

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Kalender Akademik"
        gregorianDate={nowISO}
        hijriDate={hijriLong(nowISO)}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <aside className="lg:col-span-3">
            <ParentSidebar palette={palette} />
          </aside>

          <section className="lg:col-span-9 space-y-6 min-w-0">
            {/* Header */}
            <section className="flex items-start gap-3">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={20} />
              </Btn>
              <span
                className="h-10 w-10 grid place-items-center rounded-xl"
                style={{ background: palette.primary2, color: palette.primary }}
              >
                <CalendarDays size={18} />
              </span>
              <div>
                <div className="text-lg font-semibold">Kalender Akademik</div>
                <div className="text-sm" style={{ color: palette.black2 }}>
                  Klik tanggal untuk melihat/menambah acara.
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
                  style={{ color: palette.silver2 }}
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
                    const has = c.dateKey ? byDate.get(c.dateKey) : undefined;
                    const selected = selectedDay === c.dateKey;
                    return (
                      <button
                        key={i}
                        disabled={!c.dateKey}
                        onClick={() => setSelectedDay(c.dateKey!)}
                        className="h-24 rounded-lg border p-2 text-left relative transition disabled:opacity-50"
                        style={{
                          borderColor: palette.silver1,
                          background: selected
                            ? palette.primary2
                            : palette.white1,
                        }}
                      >
                        <div className="text-xs font-medium">
                          {c.label ?? ""}
                        </div>
                        {!!has && has.length > 0 && (
                          <div className="absolute right-2 top-2 flex gap-1">
                            {has.slice(0, 3).map((_, idx) => (
                              <span
                                key={idx}
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: palette.primary }}
                              />
                            ))}
                            {has.length > 3 && (
                              <span
                                className="text-[10px]"
                                style={{ color: palette.black2 }}
                              >
                                +{has.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        {has && has[0] && (
                          <div
                            className="mt-2 text-xs line-clamp-3"
                            style={{ color: palette.black2 }}
                          >
                            {has[0].title}
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
                      Agenda {new Date(selectedDay).toLocaleDateString("id-ID")}
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
                    {(byDate.get(selectedDay) ?? []).map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                        style={{ borderColor: palette.silver1 }}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {ev.title}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: palette.black2 }}
                          >
                            {new Date(ev.date).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {ev.category ? ` • ${ev.category}` : ""}{" "}
                            {ev.level ? `• Kelas ${ev.level}` : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Btn
                            palette={palette}
                            size="sm"
                            variant="ghost"
                            className="gap-1"
                            onClick={() => setEditing(ev)}
                          >
                            <Pencil size={14} />
                          </Btn>
                          <Btn
                            palette={palette}
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => deleteMut.mutate(ev.id)}
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
                        Belum ada agenda pada tanggal ini.
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
        <EditModal
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

export default CalenderAcademic;

/* =============== Modal Ringkas =============== */
function EditModal({
  palette,
  value,
  onClose,
  onSubmit,
}: {
  palette: Palette;
  value: EventRow;
  onClose: () => void;
  onSubmit: (v: EventRow) => void;
}) {
  const [form, setForm] = useState<EventRow>(value);
  const set = (k: keyof EventRow, v: any) => setForm((s) => ({ ...s, [k]: v }));

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
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-sm">
            {form.id ? "Ubah Agenda" : "Tambah Agenda"}
          </div>
          <button onClick={onClose} className="p-1">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <div className="text-xs mb-1" style={{ color: palette.silver2 }}>
              Judul
            </div>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full h-10 rounded-lg border px-3 bg-transparent"
              style={{ borderColor: palette.silver1 }}
              placeholder="Contoh: Ujian Tengah Semester"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs mb-1" style={{ color: palette.silver2 }}>
                Tanggal & Waktu
              </div>
              <input
                type="datetime-local"
                value={toLocalInputValue(form.date)}
                onChange={(e) =>
                  set("date", new Date(e.target.value).toISOString())
                }
                className="w-full h-10 rounded-lg border px-3 bg-transparent"
                style={{ borderColor: palette.silver1 }}
              />
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: palette.silver2 }}>
                Kategori (opsional)
              </div>
              <input
                value={form.category || ""}
                onChange={(e) => set("category", e.target.value)}
                className="w-full h-10 rounded-lg border px-3 bg-transparent"
                style={{ borderColor: palette.silver1 }}
                placeholder="Akademik/Libur/Ujian…"
              />
            </div>
          </div>

          <div>
            <div className="text-xs mb-1" style={{ color: palette.silver2 }}>
              Level/Kelas (opsional)
            </div>
            <input
              value={form.level || ""}
              onChange={(e) => set("level", e.target.value)}
              className="w-full h-10 rounded-lg border px-3 bg-transparent"
              style={{ borderColor: palette.silver1 }}
              placeholder="Semua / 1 / 2 / …"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
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
