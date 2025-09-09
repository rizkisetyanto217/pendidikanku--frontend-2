// src/pages/sekolahislamku/pages/academic/SchoolSubject.tsx

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
  LibraryBig,
  BookOpen,
  UserCog,
  Layers,
  Filter as FilterIcon,
  RefreshCcw,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
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

/* ================= Types ================= */
export type SubjectStatus = "active" | "inactive";

export type SubjectRow = {
  id: string;
  code: string;
  name: string;
  level?: string; // contoh: SD/MI Kelas 1,2,3…
  hours_per_week?: number;
  teacher_name?: string;
  status: SubjectStatus;
};

type ApiSubjectsResp = {
  list: SubjectRow[];
  levels?: string[]; // opsi filter level
};

/* =============== Page =============== */
const SchoolSubject: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  const gregorianISO = toLocalNoonISO(new Date());

  // ==== Filters ====
  const [q, setQ] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [status, setStatus] = useState<SubjectStatus | "semua">("semua");

  // ==== Data (dummy fallback jika API belum siap) ====
  const subjectsQ = useQuery({
    queryKey: ["subjects", { q, level, status }],
    queryFn: async () => {
      // Jika endpoint sudah ada, tinggal ganti jadi axios.get("/api/a/subjects", { params: { q, level, status }})
      const dummy: ApiSubjectsResp = {
        list: Array.from({ length: 12 }).map((_, i) => ({
          id: `sub-${i + 1}`,
          code: `SBJ${String(i + 1).padStart(2, "0")}`,
          name: [
            "Matematika",
            "Bahasa Indonesia",
            "Bahasa Inggris",
            "IPA",
            "IPS",
            "Pendidikan Agama",
            "Tahfizh",
            "Fiqih",
            "Sejarah",
            "PJOK",
            "Seni Budaya",
            "Prakarya",
          ][i % 12],
          level: ["1", "2", "3", "4", "5", "6"][i % 6],
          hours_per_week: [2, 3, 4][i % 3],
          teacher_name: `Ustadz/Ustadzah ${i + 1}`,
          status: i % 5 === 0 ? "inactive" : "active",
        })),
        levels: ["1", "2", "3", "4", "5", "6"],
      };

      return dummy;
    },
    staleTime: 60_000,
  });

  const rows = useMemo(() => {
    let list = subjectsQ.data?.list ?? [];
    if (level) list = list.filter((r) => (r.level || "") === level);
    if (status !== "semua") list = list.filter((r) => r.status === status);
    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(qq) ||
          r.code.toLowerCase().includes(qq) ||
          (r.teacher_name || "").toLowerCase().includes(qq)
      );
    }
    return list;
  }, [subjectsQ.data?.list, q, level, status]);

  const levelOptions = subjectsQ.data?.levels ?? ["1", "2", "3", "4", "5", "6"];

  // KPI kecil
  const kpi = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r) => r.status === "active").length;
    const inactive = total - active;
    const uniqueTeachers = new Set(rows.map((r) => r.teacher_name || "")).size;
    return { total, active, inactive, uniqueTeachers };
  }, [rows]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Mata Pelajaran"
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
                <LibraryBig size={18} />
              </span>
              <div>
                <div className="text-lg font-semibold">Mata Pelajaran</div>
                <div className="text-sm" style={{ color: palette.black2 }}>
                  Kelola daftar mapel, level, dan pengampu.
                </div>
              </div>
              {/* Back button biasa */}
              <div className="ml-auto max-w-6xl px-4 flex justify-end">
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

            {/* Filter */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 font-medium flex items-center gap-2">
                <FilterIcon size={18} /> Filter
              </div>
              <div className="px-4 md:px-5 pb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
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
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>

                {/* Pencarian */}
                <div className="md:col-span-3">
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.silver2 }}
                  >
                    Cari (nama/kode/pengampu)
                  </div>
                  <div className="flex items-center gap-2">
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
                    <Btn
                      palette={palette}
                      variant="outline"
                      size="sm"
                      onClick={() => subjectsQ.refetch()}
                    >
                      <RefreshCcw size={16} />
                    </Btn>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Tabel Mapel */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 flex items-center justify-between">
                <div className="font-medium">Daftar Mata Pelajaran</div>
                <Btn palette={palette} size="sm" className="gap-1">
                  <Plus size={16} /> Tambah
                </Btn>
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
                      <th className="py-2 pr-4">Kode</th>
                      <th className="py-2 pr-4">Nama Mapel</th>
                      <th className="py-2 pr-4">Level</th>
                      <th className="py-2 pr-4">Jam / Minggu</th>
                      <th className="py-2 pr-4">Pengampu</th>
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
                          Tidak ada data.
                        </td>
                      </tr>
                    ) : (
                      rows.map((r) => (
                        <tr key={r.id} className="align-middle">
                          <td className="py-3 pr-4 font-medium">{r.code}</td>
                          <td className="py-3 pr-4">{r.name}</td>
                          <td className="py-3 pr-4">{r.level ?? "-"}</td>
                          <td className="py-3 pr-4">
                            {r.hours_per_week ?? "-"}
                          </td>
                          <td className="py-3 pr-4">{r.teacher_name ?? "-"}</td>
                          <td className="py-3 pr-4">
                            <Badge
                              palette={palette}
                              variant={
                                r.status === "active" ? "success" : "outline"
                              }
                            >
                              {r.status === "active" ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </td>
                          <td className="py-3 pr-2">
                            <div className="flex justify-end gap-2">
                              <Btn
                                palette={palette}
                                size="sm"
                                variant="outline"
                                className="gap-1"
                              >
                                <Pencil size={14} /> Edit
                              </Btn>
                              <Btn
                                palette={palette}
                                size="sm"
                                variant="quaternary"
                                className="gap-1"
                              >
                                <Trash2 size={14} /> Hapus
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
                  Menampilkan {rows.length} mapel
                </div>
              </div>
            </SectionCard>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SchoolSubject;

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
          {icon ?? <LibraryBig size={18} />}
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
