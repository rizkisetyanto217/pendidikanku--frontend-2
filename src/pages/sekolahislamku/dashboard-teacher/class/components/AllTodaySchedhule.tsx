// src/pages/sekolahislamku/dashboard-teacher/class/components/AllTodaySchedule.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import { CalendarDays, Plus, Calendar, Clock, MapPin } from "lucide-react";
import TeacherTopBar from "@/pages/sekolahislamku/components/home/TeacherTopBar";
import TeacherSidebarNav from "@/pages/sekolahislamku/components/home/TeacherSideBarNav";
import { fetchTeacherHome, type TodayClass } from "../../class/teacher";
import TambahJadwal from "../../components/dashboard/TambahJadwal";

type ScheduleItem = {
  id?: string;
  time: string;
  title: string;
  room?: string; // bisa “22 Agu • Aula 1” atau hanya “Aula 1”
  dateISO?: string; // untuk label tanggal
};

/* ========= Helpers ========= */
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
const fmtShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    : "-";

const fmtLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });

/** Ekstrak nama lokasi murni dari field room yang mungkin “DD Mon • Ruang” */
const getPureLocation = (room?: string) => {
  if (!room) return "";
  const parts = room.split("•").map((s) => s.trim());
  return parts.length > 1 ? parts.slice(1).join(" • ") : parts[0];
};

export default function AllTodaySchedule() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = (isDark ? colors.dark : colors.light) as Palette;

  const qc = useQueryClient();
  const location = useLocation();
  const preload = (location.state as any)?.upcoming as
    | ScheduleItem[]
    | undefined;

  // Ambil data yang sama dengan dashboard (shared cache)
  const { data } = useQuery({
    queryKey: ["teacher-home"],
    queryFn: fetchTeacherHome,
    staleTime: 60_000,
  });

  // Bangun list dasar:
  // 1) jika ada preload dari router state → gunakan itu
  // 2) jika tidak, ambil upcomingClasses API yang berada dalam 7 hari (hari ini s/d +6)
  const baseItems: ScheduleItem[] = useMemo(() => {
    if (Array.isArray(preload) && preload.length) {
      return preload;
    }

    const start = startOfDay(new Date());
    const end = startOfDay(addDays(new Date(), 6));

    const upcoming = (data as any)?.upcomingClasses ?? [];
    const within7 = Array.isArray(upcoming)
      ? upcoming.filter((c: any) => {
          if (!c?.dateISO) return false;
          const d = startOfDay(new Date(c.dateISO));
          return d >= start && d <= end;
        })
      : [];

    const src = within7.length ? within7 : (data?.todayClasses ?? []);

    return src
      .slice()
      .sort((a: any, b: any) => {
        const ad =
          new Date(a.dateISO ?? start).getTime() -
          new Date(b.dateISO ?? start).getTime();
        if (ad !== 0) return ad;
        return a.time.localeCompare(b.time);
      })
      .map((c: any) => ({
        id: c.id,
        time: c.time,
        title: `${c.className} — ${c.subject}`,
        dateISO: c.dateISO,
        // subteks: tgl singkat • room (jika ada dateISO)
        room: c.dateISO ? `${fmtShort(c.dateISO)} • ${c.room ?? "-"}` : c.room,
      }));
  }, [preload, data?.todayClasses, (data as any)?.upcomingClasses]);

  // ====== UI State: search & filter lokasi (selaras AllSchedule) ======
  const [search, setSearch] = useState("");
  const [locFilter, setLocFilter] = useState<string | "semua">("semua");

  const lokasiOptions = useMemo(() => {
    const set = new Set(
      baseItems
        .map((x) => getPureLocation(x.room))
        .map((s) => s.trim())
        .filter(Boolean)
    );
    return ["semua", ...Array.from(set)];
  }, [baseItems]);

  const items = useMemo(() => {
    const s = search.trim().toLowerCase();
    return baseItems.filter((j) => {
      const location = getPureLocation(j.room);
      const matchSearch =
        j.title.toLowerCase().includes(s) ||
        location.toLowerCase().includes(s) ||
        (j.time ?? "").toLowerCase().includes(s);
      const matchLoc = locFilter === "semua" || location === locFilter;
      return matchSearch && matchLoc;
    });
  }, [baseItems, search, locFilter]);

  // Modal tambah
  const [showTambahJadwal, setShowTambahJadwal] = useState(false);

  // Ketika submit modal
  const handleAddSchedule = (item: {
    time: string;
    title: string;
    room?: string;
  }) => {
    // (Opsional) Sinkronkan cache "teacher-home" untuk todayClasses
    qc.setQueryData(["teacher-home"], (prev: any) => {
      if (!prev) return prev;
      const [classNameRaw = "", subjectRaw = ""] = item.title.split(" — ");
      const newTc: TodayClass = {
        id: `temp-${Date.now()}`,
        time: item.time,
        className: classNameRaw || "Kelas",
        subject: subjectRaw || "Pelajaran",
        room: item.room,
        status: "upcoming",
        studentCount: undefined,
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

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <TeacherTopBar palette={palette} title="Semua Jadwal 7 Hari Kedepan" />

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
            <TeacherSidebarNav palette={palette} />
          </aside>

          <div className="flex-1 min-w-0 space-y-4">
            {/* Header actions — selaras AllSchedule */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <CalendarDays size={20} color={palette.primary} />
                <span>Jadwal 7 Hari Kedepan</span>
              </div>
              <div className="flex gap-2">
                <Link to="../jadwal">
                  <Btn palette={palette} size="sm" variant="ghost">
                    Kembali
                  </Btn>
                </Link>
                <Btn
                  palette={palette}
                  size="sm"
                  onClick={() => setShowTambahJadwal(true)}
                >
                  <Plus size={16} className="mr-1" /> Tambah Jadwal
                </Btn>
              </div>
            </div>

            {/* Search & Filter (meniru AllSchedule) */}
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

            {/* List semua item (tanpa slice) — UI kartu seperti AllSchedule */}
            <div className="grid gap-3">
              {items.length === 0 ? (
                <SectionCard palette={palette} className="p-6 text-center">
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Belum ada jadwal untuk 7 hari ke depan.
                  </div>
                </SectionCard>
              ) : (
                items.map((s) => (
                  <SectionCard
                    key={s.id ?? `${s.time}-${s.title}`}
                    palette={palette}
                    className="p-3 md:p-4"
                    style={{ background: palette.white1 }}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <h2 className="font-semibold">{s.title}</h2>
                        <Badge variant="white1" palette={palette}>
                          {s.time}
                        </Badge>
                      </div>

                      <div
                        className="flex flex-wrap gap-3 text-sm"
                        style={{ color: palette.black2 }}
                      >
                        <span className="flex items-center gap-1">
                          <Calendar size={16} /> {fmtLong(s.dateISO)}
                        </span>
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
                  </SectionCard>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
