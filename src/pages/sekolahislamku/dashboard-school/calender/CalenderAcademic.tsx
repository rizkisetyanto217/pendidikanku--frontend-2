// src/pages/sekolahislamku/pages/academic/CalenderAcademic.tsx
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// Theme & utils
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import axios from "@/lib/axios";

// UI primitives & layout
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

// Icons
import {
  CalendarRange,
  CalendarDays,
  Filter as FilterIcon,
  RefreshCcw,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Download,
} from "lucide-react";

/* ================== Date & format helpers ================== */
const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};
const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();
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
const dateOnly = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("id-ID") : "-";

const formatRange = (start?: string, end?: string) => {
  if (!start) return "-";
  if (!end || dateOnly(start) === dateOnly(end)) return dateOnly(start);
  return `${dateOnly(start)} – ${dateOnly(end)}`;
};

/* ================= Types ================= */
export type EventStatus = "planned" | "done" | "cancelled";

export type AcademicEvent = {
  id: string;
  title: string;
  start_date: string; // ISO
  end_date?: string; // ISO (opsional utk rentang)
  level?: string; // contoh: "1", "2", ... "6", atau "Semua"
  category?: "Akademik" | "Libur" | "Ujian" | "Kegiatan";
  status: EventStatus;
  location?: string;
};

type ApiCalendarResp = {
  list: AcademicEvent[];
  levels?: string[]; // opsi filter level
  categories?: string[];
};

/* =============== Page =============== */
const CalenderAcademic: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  const gregorianISO = toLocalNoonISO(new Date());

  // ==== Filters ====
  const [q, setQ] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<EventStatus | "semua">("semua");
  const [month, setMonth] = useState<string>(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}`;
  });

  // ==== Data (dummy fallback jika API belum siap) ====
  const eventsQ = useQuery({
    queryKey: ["academic-calendar", { q, level, category, status, month }],
    queryFn: async (): Promise<ApiCalendarResp> => {
      // Jika endpoint sudah ada, gunakan ini:
      // const { data } = await axios.get("/api/a/academic/calendar", {
      //   params: { q, level, category, status, month }
      // });
      // return data;

      const base = new Date(`${month}-01T00:00:00`);
      const mkISO = (d: Date, plusDay = 0) => {
        const x = new Date(d);
        x.setDate(x.getDate() + plusDay);
        return x.toISOString();
      };

      const dummy: ApiCalendarResp = {
        list: [
          {
            id: "ev-1",
            title: "Masa Orientasi Siswa",
            start_date: mkISO(base, 1),
            end_date: mkISO(base, 3),
            level: "Semua",
            category: "Kegiatan",
            status: "planned",
            location: "Aula Sekolah",
          },
          {
            id: "ev-2",
            title: "Ujian Tengah Semester",
            start_date: mkISO(base, 10),
            end_date: mkISO(base, 14),
            level: "4",
            category: "Ujian",
            status: "planned",
          },
          {
            id: "ev-3",
            title: "Libur Maulid",
            start_date: mkISO(base, 18),
            level: "Semua",
            category: "Libur",
            status: "done",
          },
          {
            id: "ev-4",
            title: "Rapat Orang Tua",
            start_date: mkISO(base, 22),
            level: "Semua",
            category: "Kegiatan",
            status: "planned",
            location: "Ruang Pertemuan",
          },
          {
            id: "ev-5",
            title: "Pembagian Rapor",
            start_date: mkISO(base, 28),
            level: "Semua",
            category: "Akademik",
            status: "planned",
          },
        ],
        levels: ["Semua", "1", "2", "3", "4", "5", "6"],
        categories: ["Akademik", "Libur", "Ujian", "Kegiatan"],
      };

      return dummy;
    },
    staleTime: 60_000,
  });

  // ==== Derived rows ====
  const rows = useMemo(() => {
    let list = eventsQ.data?.list ?? [];
    if (level) list = list.filter((r) => (r.level || "Semua") === level);
    if (category) list = list.filter((r) => (r.category || "") === category);
    if (status !== "semua") list = list.filter((r) => r.status === status);
    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(qq) ||
          (r.location || "").toLowerCase().includes(qq)
      );
    }
    // sort by start_date ascending
    return [...list].sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
  }, [eventsQ.data?.list, q, level, category, status]);

  const levelOptions = eventsQ.data?.levels ?? [
    "Semua",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
  ];
  const categoryOptions = eventsQ.data?.categories ?? [
    "Akademik",
    "Libur",
    "Ujian",
    "Kegiatan",
  ];

  // KPI kecil
  const kpi = useMemo(() => {
    const total = rows.length;
    const planned = rows.filter((r) => r.status === "planned").length;
    const done = rows.filter((r) => r.status === "done").length;
    const cancelled = rows.filter((r) => r.status === "cancelled").length;
    return { total, planned, done, cancelled };
  }, [rows]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Kalender Akademik"
        gregorianDate={gregorianISO}
        hijriDate={hijriLong(gregorianISO)}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main */}
          <section className="lg:col-span-9 space-y-6 min-w-0">
            {/* Header */}
            <section className="flex items-start gap-3">
              <span
                className="h-10 w-10 grid place-items-center rounded-xl"
                style={{ background: palette.primary2, color: palette.primary }}
              >
                <CalendarDays size={18} />
              </span>
              <div>
                <div className="text-lg font-semibold">Kalender Akademik</div>
                <div className="text-sm" style={{ color: palette.black2 }}>
                  Daftar agenda & kegiatan sekolah berdasarkan bulan.
                </div>
              </div>
              <div className="ml-auto">
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> Kembali
                </Btn>
              </div>
            </section>

            {/* KPI ringkas */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiTile
                palette={palette}
                label="Total Agenda"
                value={kpi.total}
                icon={<CalendarRange size={18} />}
              />
              <KpiTile
                palette={palette}
                label="Terjadwal"
                value={kpi.planned}
              />
              <KpiTile
                palette={palette}
                label="Selesai"
                value={kpi.done}
                tone="success"
              />
              <KpiTile
                palette={palette}
                label="Dibatalkan"
                value={kpi.cancelled}
                tone="danger"
              />
            </section>

            {/* Filter */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 font-medium flex items-center gap-2">
                <FilterIcon size={18} /> Filter
              </div>
              <div className="px-4 md:px-5 pb-4 grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* Bulan */}
                <div className="md:col-span-2">
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.silver2 }}
                  >
                    Bulan
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="month"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full h-11 rounded-lg border px-3 bg-transparent text-sm"
                      style={{
                        borderColor: palette.silver1,
                        color: palette.black1,
                      }}
                    />
                    <Btn
                      palette={palette}
                      variant="outline"
                      size="sm"
                      onClick={() => eventsQ.refetch()}
                    >
                      <RefreshCcw size={16} />
                    </Btn>
                  </div>
                </div>

                {/* Level */}
                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.silver2 }}
                  >
                    Level/Kelas
                  </div>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full h-11 rounded-lg border px-3 bg-transparent text-sm"
                    style={{
                      borderColor: palette.silver1,
                      color: palette.black1,
                    }}
                  >
                    <option value="">Semua</option>
                    {levelOptions.map((lv) => (
                      <option key={lv} value={lv}>
                        {lv}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kategori */}
                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.silver2 }}
                  >
                    Kategori
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 rounded-lg border px-3 bg-transparent text-sm"
                    style={{
                      borderColor: palette.silver1,
                      color: palette.black1,
                    }}
                  >
                    <option value="">Semua</option>
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.silver2 }}
                  >
                    Status
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-11 rounded-lg border px-3 bg-transparent text-sm"
                    style={{
                      borderColor: palette.silver1,
                      color: palette.black1,
                    }}
                  >
                    <option value="semua">Semua</option>
                    <option value="planned">Terjadwal</option>
                    <option value="done">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>

                {/* Pencarian */}
                <div className="md:col-span-2">
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.silver2 }}
                  >
                    Cari (judul/lokasi)
                  </div>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Ketik kata kunci…"
                    className="w-full h-11 rounded-lg border px-3 bg-transparent text-sm"
                    style={{
                      borderColor: palette.silver1,
                      color: palette.black1,
                    }}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Tabel Agenda */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 flex items-center justify-between">
                <div className="font-medium">Daftar Agenda Bulan Ini</div>
                <div className="flex items-center gap-2">
                  <Btn
                    palette={palette}
                    size="sm"
                    variant="outline"
                    className="gap-1"
                  >
                    <Download size={16} /> Ekspor
                  </Btn>
                  <Btn palette={palette} size="sm" className="gap-1">
                    <Plus size={16} /> Tambah
                  </Btn>
                </div>
              </div>

              <div className="px-4 md:px-5 pb-4 overflow-x-auto">
                <table className="w-full text-sm min-w-[940px]">
                  <thead
                    className="text-left"
                    style={{ color: palette.silver2 }}
                  >
                    <tr
                      className="border-b"
                      style={{ borderColor: palette.silver1 }}
                    >
                      <th className="py-2 pr-4">Tanggal</th>
                      <th className="py-2 pr-4">Judul</th>
                      <th className="py-2 pr-4">Level</th>
                      <th className="py-2 pr-4">Kategori</th>
                      <th className="py-2 pr-4">Lokasi</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: palette.silver1 }}
                  >
                    {rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center"
                          style={{ color: palette.silver2 }}
                        >
                          Tidak ada agenda untuk filter ini.
                        </td>
                      </tr>
                    ) : (
                      rows.map((r) => (
                        <tr key={r.id} className="align-middle">
                          <td className="py-3 pr-4 font-medium">
                            {formatRange(r.start_date, r.end_date)}
                          </td>
                          <td className="py-3 pr-4">{r.title}</td>
                          <td className="py-3 pr-4">{r.level ?? "Semua"}</td>
                          <td className="py-3 pr-4">{r.category ?? "-"}</td>
                          <td className="py-3 pr-4">{r.location ?? "-"}</td>
                          <td className="py-3 pr-4">
                            <Badge
                              palette={palette}
                              variant={
                                r.status === "done"
                                  ? "success"
                                  : r.status === "cancelled"
                                    ? "warning"
                                    : "outline"
                              }
                            >
                              {r.status === "planned"
                                ? "Terjadwal"
                                : r.status === "done"
                                  ? "Selesai"
                                  : "Dibatalkan"}
                            </Badge>
                          </td>
                          <td className="py-3 pr-2">
                            <div className="flex justify-end gap-2">
                              <Btn
                                palette={palette}
                                size="sm"
                                variant="ghost"
                                className="gap-1"
                              >
                                <Pencil size={14} />
                              </Btn>
                              <Btn
                                palette={palette}
                                size="sm"
                                variant="destructive"
                                className="gap-1"
                              >
                                <Trash2 size={14} />
                              </Btn>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div
                  className="pt-3 text-xs"
                  style={{ color: palette.silver2 }}
                >
                  Menampilkan {rows.length} agenda
                </div>
              </div>
            </SectionCard>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CalenderAcademic;

/* ================= Small UI helpers ================= */
function KpiTile({
  palette,
  label,
  value,
  icon,
  tone,
}: {
  palette: Palette;
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  tone?: "success" | "warning" | "danger";
}) {
  const toneBg =
    tone === "success"
      ? "#DCFCE7"
      : tone === "warning"
        ? "#FEF3C7"
        : tone === "danger"
          ? "#FEE2E2"
          : undefined;
  return (
    <SectionCard palette={palette}>
      <div className="p-4 md:p-5 flex items-center gap-3">
        <span
          className="h-10 w-10 grid place-items-center rounded-xl"
          style={{
            background: toneBg ?? palette.primary2,
            color: palette.primary,
          }}
        >
          {icon ?? <CalendarDays size={18} />}
        </span>
        <div>
          <div className="text-xs" style={{ color: palette.silver2 }}>
            {label}
          </div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
    </SectionCard>
  );
}
