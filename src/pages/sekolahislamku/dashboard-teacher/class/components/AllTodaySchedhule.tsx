// src/pages/sekolahislamku/dashboard-teacher/class/components/AllTodaySchedule.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import {
  CalendarDays,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";

// API & Types
import {
  fetchTeacherHome,
  TEACHER_HOME_QK,
  type TeacherHomeResponse,
  type TodayClass,
  type UpcomingClass,
} from "../../class/teacher";

import TambahJadwal from "../../dashboard/AddSchedule";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

/* =========================
   Types (UI normalized)
========================= */
type ScheduleItem = {
  id?: string;
  time: string; // "07:30"
  title: string; // "TPA A — Tahsin"
  room?: string; // bisa "22 Agu • Aula 1" atau "Aula 1"
  dateISO: string; // ISO tanggal (00:00)
};

/* =========================
   Helpers
========================= */
const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const toISODate = (d: Date) => startOfDay(d).toISOString();

const fmtShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    : "-";

const fmtLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

/** Ambil nama lokasi murni dari "DD Mon • Aula 1" → "Aula 1" */
const getPureLocation = (room?: string) => {
  if (!room) return "";
  const parts = room.split("•").map((s) => s.trim());
  return parts.length > 1 ? parts.slice(1).join(" • ") : parts[0];
};

/** Normalisasi dari tipe API ke tipe UI (ScheduleItem) */
const normalizeItem = (
  c: UpcomingClass | TodayClass,
  fallback: Date
): ScheduleItem => {
  const dateISO = (c as UpcomingClass).dateISO
    ? toISODate(new Date((c as UpcomingClass).dateISO))
    : toISODate(fallback);

  return {
    id: c.id,
    time: c.time,
    title: `${c.className} — ${c.subject}`,
    dateISO,
    room: (c as UpcomingClass).dateISO
      ? `${fmtShort((c as UpcomingClass).dateISO)} • ${c.room ?? "-"}`
      : c.room,
  };
};

/* =========================
   Component
========================= */
export default function AllTodaySchedule() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data } = useQuery<TeacherHomeResponse>({
    queryKey: TEACHER_HOME_QK,
    queryFn: fetchTeacherHome,
    staleTime: 60_000,
  });

  // Ambil 7 hari ke depan (hari ini s/d +6)
  const DAYS = 7;
  const today = startOfDay(new Date());
  const end = startOfDay(addDays(today, DAYS - 1));

  // Susun sumber data:
  // - utamakan upcomingClasses yang berada pada rentang 7 hari
  // - jika kosong, pakai todayClasses (difallback jadi hari ini)
  const rawItems: ScheduleItem[] = useMemo(() => {
    const upcoming = (data?.upcomingClasses ?? []).filter((u) => {
      const d = startOfDay(new Date(u.dateISO));
      return d >= today && d <= end;
    });

    const fromUpcoming = upcoming.map((u) => normalizeItem(u, today));
    const fromToday =
      fromUpcoming.length > 0
        ? []
        : (data?.todayClasses ?? []).map((t) => normalizeItem(t, today));

    return [...fromUpcoming, ...fromToday].sort((a, b) => {
      const da = new Date(a.dateISO).getTime();
      const db = new Date(b.dateISO).getTime();
      if (da !== db) return da - db;
      return a.time.localeCompare(b.time);
    });
  }, [data?.upcomingClasses, data?.todayClasses]);

  /* ---------- UI State: search & filter lokasi ---------- */
  const [search, setSearch] = useState("");
  const [locFilter, setLocFilter] = useState<string | "semua">("semua");

  const lokasiOptions = useMemo(() => {
    const set = new Set(
      rawItems
        .map((x) => getPureLocation(x.room))
        .map((s) => s.trim())
        .filter(Boolean)
    );
    return ["semua", ...Array.from(set)];
  }, [rawItems]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rawItems.filter((j) => {
      const location = getPureLocation(j.room);
      const matchSearch =
        j.title.toLowerCase().includes(s) ||
        location.toLowerCase().includes(s) ||
        (j.time ?? "").toLowerCase().includes(s);
      const matchLoc = locFilter === "semua" || location === locFilter;
      return matchSearch && matchLoc;
    });
  }, [rawItems, search, locFilter]);

  /* ---------- Bucket per hari (7 kotak) ---------- */
  const dayBuckets = useMemo(() => {
    return Array.from({ length: DAYS }).map((_, i) => {
      const dISO = toISODate(addDays(today, i));
      const items = filtered
        .filter((it) => it.dateISO === dISO)
        .sort((a, b) => a.time.localeCompare(b.time));
      return { dateISO: dISO, items };
    });
  }, [filtered]);

  /* ---------- Tambah / Edit / Hapus ---------- */
  const [showTambahJadwal, setShowTambahJadwal] = useState(false);
  const [targetDateISO, setTargetDateISO] = useState<string | null>(null);

  const openAdd = (dateISO?: string) => {
    setTargetDateISO(dateISO ?? toISODate(today));
    setShowTambahJadwal(true);
  };

  const handleAddSchedule = (item: {
    time: string;
    title: string;
    room?: string;
  }) => {
    // Sinkronkan cache "teacher-home" → todayClasses (optimistic)
    qc.setQueryData(TEACHER_HOME_QK, (prev: any) => {
      if (!prev) return prev;
      const [classNameRaw = "", subjectRaw = ""] = item.title.split(" — ");
      const newTc: TodayClass = {
        id: `temp-${Date.now()}`,
        time: item.time,
        className: classNameRaw || "Kelas",
        subject: subjectRaw || "Pelajaran",
        room: item.room,
        status: "upcoming",
      };
      return {
        ...prev,
        todayClasses: [...(prev.todayClasses ?? []), newTc].sort(
          (a: TodayClass, b: TodayClass) => a.time.localeCompare(b.time)
        ),
      };
    });
    setShowTambahJadwal(false);
  };

  const handleEdit = (s: ScheduleItem) => {
    // TODO: sambungkan ke modal edit versi kamu
    alert(
      `Edit jadwal:\n${fmtLong(s.dateISO)} • ${s.time}\n${s.title}\n${
        getPureLocation(s.room) || "-"
      }`
    );
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const openEdit = (it: ScheduleItem) => {
    setEditingId(it.id ?? `${it.dateISO}-${it.time}-${it.title}`);
    setTargetDateISO(it.dateISO);
    setShowTambahJadwal(true);
  };
  // ganti fungsi lama ini
  const handleDelete = (it: ScheduleItem) => {
    if (!confirm(`Hapus jadwal "${it.title}" pada ${it.time}?`)) return;

    qc.setQueryData<TeacherHomeResponse>(TEACHER_HOME_QK, (prev) => {
      if (!prev) return prev;

      const sameUpcoming = (u: UpcomingClass) =>
        (it.id && u.id === it.id) ||
        (toISODate(new Date(u.dateISO)) === it.dateISO &&
          u.time === it.time &&
          `${u.className} — ${u.subject}` === it.title);

      const sameToday = (t: TodayClass) =>
        (it.id && t.id === it.id) ||
        (t.time === it.time && `${t.className} — ${t.subject}` === it.title);

      return {
        ...prev,
        upcomingClasses: (prev.upcomingClasses ?? []).filter(
          (u) => !sameUpcoming(u)
        ),
        todayClasses: (prev.todayClasses ?? []).filter((t) => !sameToday(t)),
      };
    });
  };

  /* =========================
     UI
  ========================= */
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        gregorianDate={new Date().toISOString()}
        title="Jadwal 7 Hari Kedepan"
        dateFmt={(iso) =>
          new Date(iso).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        }
      />

      {/* Modal: Tambah Jadwal */}
      <TambahJadwal
        open={showTambahJadwal}
        onClose={() => setShowTambahJadwal(false)}
        palette={palette}
        onSubmit={handleAddSchedule}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <aside className="lg:w-64 mb-6 lg:mb-0 lg:sticky lg:top-16 shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 min-w-0 space-y-4">
            {/* Header actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center rounded-full p-1 hover:opacity-80"
                  aria-label="Kembali"
                  title="Kembali"
                >
                  <ArrowLeft size={20} />
                </button>
                <span>Jadwal 7 Hari Kedepan</span>
              </div>
            </div>

            {/* Search & Filter */}
            <SectionCard palette={palette} className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Cari kelas/materi/lokasi…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 w-full rounded-2xl px-3 text-sm"
                    style={{
                      background: palette.white1,
                      color: palette.black1,
                      border: `1px solid ${palette.silver1}`,
                    }}
                    aria-label="Cari jadwal"
                  />
                </div>

                {lokasiOptions.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Badge palette={palette} variant="outline">
                      Lokasi
                    </Badge>
                    <select
                      value={locFilter}
                      onChange={(e) => setLocFilter(e.target.value as any)}
                      className="h-10 rounded-xl px-3 text-sm outline-none"
                      style={{
                        background: palette.white1,
                        color: palette.black1,
                        border: `1px solid ${palette.silver1}`,
                      }}
                      aria-label="Filter lokasi"
                    >
                      {lokasiOptions.map((o) => (
                        <option key={o} value={o}>
                          {o === "semua" ? "Semua" : o}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* 7 kotak — satu per hari */}
            <div className="grid gap-3">
              {dayBuckets.map(({ dateISO, items }) => (
                <SectionCard
                  key={dateISO}
                  palette={palette}
                  className="p-0 overflow-hidden"
                >
                  {/* Header tanggal */}
                  <div
                    className="px-4 py-3 border-b font-semibold flex items-center justify-between"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white1,
                    }}
                  >
                    {fmtLong(dateISO)}
                    <Btn
                      palette={palette}
                      size="sm"
                      variant="white1"
                      onClick={() => openAdd(dateISO)}
                    >
                      <Plus size={16} className="mr-1" /> Tambah di Hari Ini
                    </Btn>
                  </div>

                  {/* Isi hari */}
                  {items.length === 0 ? (
                    <div
                      className="px-4 py-3 text-sm"
                      style={{
                        color: palette.silver2,
                        background: palette.white1,
                      }}
                    >
                      Belum ada jadwal pada hari ini.
                    </div>
                  ) : (
                    <div
                      className="divide-y"
                      style={{ borderColor: palette.silver1 }}
                    >
                      {items.map((s, i) => (
                        <div
                          key={`${s.id ?? i}-${s.time}`}
                          className="px-4 py-3 flex items-center justify-between gap-4"
                          style={{ background: palette.white1 }}
                        >
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {s.title}
                            </div>
                            <div
                              className="text-sm mt-1 flex flex-wrap gap-3"
                              style={{ color: palette.black2 }}
                            >
                              {getPureLocation(s.room) && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={16} /> {getPureLocation(s.room)}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock size={16} /> {s.time}
                              </span>
                            </div>
                          </div>

                          {/* Aksi */}
                          <div className="flex items-center gap-2 shrink-0">
                            <Btn
                              palette={palette}
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(s)}
                            >
                              Edit
                            </Btn>
                            <Btn
                              palette={palette}
                              size="sm"
                              variant="quaternary"
                              onClick={() => handleDelete(s)}
                            >
                              Hapus
                            </Btn>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
