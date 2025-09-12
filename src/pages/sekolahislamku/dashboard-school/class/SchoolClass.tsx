// src/pages/sekolahislamku/pages/classes/SchoolClasses.tsx
import { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, Link, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  UserCog,
  Clock4,
  Filter as FilterIcon,
  Plus,
  Layers,
  ChevronDown,
  ArrowLeft,
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
import TambahKelas, {
  type ClassRow as NewClassRow,
} from "./components/AddClass";
import TambahLevel from "./components/AddLevel";
import axios from "@/lib/axios";
import ParentSidebar from "../../components/home/ParentSideBar";

/* ================= Types ================= */
export type ClassStatus = "active" | "inactive";

export type ClassRow = {
  id: string;
  code: string;
  name: string;
  grade: string;
  homeroom: string;
  studentCount: number;
  schedule: string;
  status: ClassStatus;
  classId?: string; // parent LEVEL id
};

export type ClassStats = {
  total: number;
  active: number;
  students: number;
  homerooms: number;
};

type ApiSchedule = {
  start?: string;
  end?: string;
  days?: string[];
  location?: string;
};
type ApiTeacherLite = {
  id: string;
  user_name: string;
  email: string;
  is_active: boolean;
};
type ApiClassSection = {
  class_sections_id: string;
  class_sections_class_id: string; // LEVEL ID
  class_sections_masjid_id: string;
  class_sections_teacher_id?: string | null;
  class_sections_slug: string;
  class_sections_name: string;
  class_sections_code?: string | null;
  class_sections_capacity?: number | null;
  class_sections_schedule?: ApiSchedule | null;
  class_sections_is_active: boolean;
  class_sections_created_at: string;
  class_sections_updated_at: string;
  teacher?: ApiTeacherLite | null;
};
type ApiListSections = { data: ApiClassSection[]; message: string };

type ApiLevel = {
  class_id: string;
  class_masjid_id: string;
  class_name: string;
  class_slug: string;
  class_description?: string | null;
  class_level?: string | null;
  class_fee_monthly_idr?: number | null;
  class_is_active: boolean;
  class_created_at: string;
};
type ApiListLevels = { data: ApiLevel[]; message: string };

type Level = {
  id: string;
  name: string;
  slug: string;
  level?: string | null;
  fee?: number | null;
  is_active: boolean;
};

type SchoolClassProps = {
  showBack?: boolean; // default: false
  backTo?: string; // optional: kalau diisi, navigate ke path ini, kalau tidak pakai nav(-1)
  backLabel?: string; // teks tombol
};
/* ================= Helpers ================= */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

const hijriWithWeekday = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

const parseGrade = (code?: string | null, name?: string): string => {
  const from = (code ?? name ?? "").toString();
  const m = from.match(/\d+/);
  return m ? m[0] : "-";
};

const scheduleToText = (sch?: ApiSchedule | null): string => {
  if (!sch) return "-";
  const days = (sch.days ?? []).join(", ");
  const time = [sch.start, sch.end].every(Boolean)
    ? `${sch.start}–${sch.end}`
    : sch.start || sch.end || "";
  const loc = sch.location ? ` @${sch.location}` : "";
  const left = [days, time].filter(Boolean).join(" ");
  return left ? `${left}${loc}` : "-";
};

const getShiftFromSchedule = (
  sch?: ApiSchedule | null
): "Pagi" | "Sore" | "-" => {
  if (!sch?.start) return "-";
  const [hh] = sch.start.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(hh)) return "-";
  return hh < 12 ? "Pagi" : "Sore";
};

// id unik sederhana untuk dummy
const uid = (p = "tmp") =>
  `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/* ================= Fetchers ================= */
async function fetchClassSections({
  q,
  status,
  classId,
}: {
  q?: string;
  status?: ClassStatus | "all";
  classId?: string; // filter by level
}): Promise<ApiClassSection[]> {
  const params: Record<string, any> = {};
  if (q && q.trim().length > 0) params.search = q.trim();
  if (status && status !== "all") params.active_only = status === "active";
  if (classId) params.class_id = classId;
  const res = await axios.get<ApiListSections>("/api/a/class-sections", {
    params,
  });
  return res.data?.data ?? [];
}

function mapLevelRow(x: ApiLevel): Level {
  return {
    id: x.class_id,
    name: x.class_name,
    slug: x.class_slug,
    level: x.class_level ?? null,
    fee: x.class_fee_monthly_idr ?? null,
    is_active: x.class_is_active,
  };
}

async function fetchLevels(): Promise<Level[]> {
  const res = await axios.get<ApiListLevels>("/api/a/classes");
  const rows = Array.isArray(res.data?.data) ? res.data.data : [];
  return rows.map(mapLevelRow);
}

/* =============== Small UI =============== */
function MiniKPI({
  palette,
  icon,
  label,
  value,
  tone,
}: {
  palette: Palette;
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone?: "success" | "normal";
}) {
  const bg = tone === "success" ? "#0EA5A222" : undefined;
  return (
    <SectionCard palette={palette}>
      <div className="p-4 flex items-center gap-3">
        <span
          className="h-10 w-10 grid place-items-center rounded-xl"
          style={{
            background: bg ?? palette.primary2,
            color: tone === "success" ? palette.success1 : palette.primary,
          }}
        >
          {icon}
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

/** Reusable SelectBox: dropdown rapi (ikon chevron hitam, padding kanan cukup) */
function SelectBox({
  value,
  onChange,
  children,
  palette,
  className = "",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  palette: Palette;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className="w-full h-11 rounded-lg border pl-3 pr-10 bg-transparent text-sm leading-none appearance-none"
        style={{
          borderColor: palette.silver1,
          color: palette.black1,
        }}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        style={{ color: "#111" }} // ikon hitam
      />
    </div>
  );
}

/* ================= Page ================= */
const SchoolClass: React.FC<SchoolClassProps> = ({
  showBack = false,
  backTo,
  backLabel = "Kembali",
}) => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const navigate = useNavigate();
  

  const [sp, setSp] = useSearchParams();
  const qc = useQueryClient();

  const [openTambah, setOpenTambah] = useState(false);
  const [openTambahLevel, setOpenTambahLevel] = useState(false);
  const { slug = "" } = useParams<{ slug: string }>();

  // Query params (UI)
  const q = (sp.get("q") ?? "").trim();
  const status = (sp.get("status") ?? "all") as ClassStatus | "all";
  const shift = (sp.get("shift") ?? "all") as "Pagi" | "Sore" | "all";
  const levelId = sp.get("level_id") ?? ""; // filter by LEVEL

  // LEVELS
  const levelsQ = useQuery({
    queryKey: ["levels"],
    queryFn: fetchLevels,
    staleTime: 60_000,
  });

  // SECTIONS
  const {
    data: apiItems,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["class-sections", q, status, levelId],
    queryFn: () =>
      fetchClassSections({ q, status, classId: levelId || undefined }),
    staleTime: 60_000,
  });

  // Jika modal tambah kelas ditutup, boleh refetch (tetap ada optimistic insert jadi terasa instan)
  useEffect(() => {
    if (!openTambah) refetch();
  }, [openTambah, refetch]);

  // Map API → UI rows
  const mappedRows: ClassRow[] = useMemo(() => {
    const arr = apiItems ?? [];
    return arr.map((it) => ({
      id: it.class_sections_id,
      classId: it.class_sections_class_id,
      code: it.class_sections_code ?? "-",
      name: it.class_sections_name,
      grade: parseGrade(it.class_sections_code, it.class_sections_name),
      homeroom: it.teacher?.user_name ?? "-",
      studentCount: 0,
      schedule: scheduleToText(it.class_sections_schedule),
      status: it.class_sections_is_active ? "active" : "inactive",
    }));
  }, [apiItems]);

  // Filter client-side: Shift (level sudah di server bila levelId ada)
  const filteredRows = useMemo(() => {
    return mappedRows.filter((r) => {
      const apiItem = (apiItems ?? []).find(
        (x) => x.class_sections_id === r.id
      );
      const rowShift = getShiftFromSchedule(apiItem?.class_sections_schedule);
      return shift === "all" ? true : rowShift === shift;
    });
  }, [mappedRows, shift, apiItems]);

  // Stats
  const stats: ClassStats = useMemo(() => {
    const total = filteredRows.length;
    const active = filteredRows.filter((x) => x.status === "active").length;
    const students = filteredRows.reduce(
      (a, b) => a + (b.studentCount || 0),
      0
    );
    const homerooms = new Set(
      filteredRows.map((x) => x.homeroom).filter(Boolean)
    ).size;
    return { total, active, students, homerooms };
  }, [filteredRows]);

  // Jumlah section per level (untuk badge)
  const sectionCountByLevel = useMemo(() => {
    const m = new Map<string, number>();
    mappedRows.forEach((r) => {
      if (!r.classId) return;
      m.set(r.classId, (m.get(r.classId) ?? 0) + 1);
    });
    return m;
  }, [mappedRows]);

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(sp);
    if (v) next.set(k, v);
    else next.delete(k);
    setSp(next, { replace: true });
  };

  const items = filteredRows;
  const levels = levelsQ.data ?? [];

  /* ===== Optimistic handlers (tambah Level & Kelas) ===== */

  // Map minimal NewClassRow -> ApiClassSection (dummy)
  function mapNewClassToApiSection(
    row: Partial<NewClassRow>,
    defaultLevelId?: string
  ): ApiClassSection {
    const nowIso = new Date().toISOString();
    const name = row.name ?? "Kelas Baru";
    return {
      class_sections_id: (row as any).id ?? uid("sec"),
      class_sections_class_id:
        (row as any).classId ?? defaultLevelId ?? levels[0]?.id ?? "",
      class_sections_masjid_id: (row as any).masjidId ?? "",
      class_sections_teacher_id: (row as any).teacherId ?? null,
      class_sections_slug:
        (row as any).slug ??
        name.toLowerCase().replace(/\s+/g, "-") +
          "-" +
          Math.random().toString(36).slice(2, 5),
      class_sections_name: name,
      class_sections_code: (row as any).code ?? "-",
      class_sections_capacity: (row as any).capacity ?? null,
      class_sections_schedule: (row as any).schedule ?? {
        days: (row as any).days ?? [],
        start: (row as any).start ?? undefined,
        end: (row as any).end ?? undefined,
        location: (row as any).location ?? undefined,
      },
      class_sections_is_active: (row as any).is_active ?? true,
      class_sections_created_at: nowIso,
      class_sections_updated_at: nowIso,
      teacher:
        (row as any).teacher ??
        ((row as any).homeroom
          ? {
              id: uid("t"),
              user_name: (row as any).homeroom,
              email: "",
              is_active: true,
            }
          : null),
    };
  }
  // util kecil untuk slug
  const toSlug = (s: string) =>
    (s || "level-baru").toLowerCase().trim().replace(/\s+/g, "-");

  // >>> GANTI handler lamamu dengan ini:
  const handleLevelCreated = (payload?: any) => {
    const lvl: Level = {
      id: payload?.id ?? payload?.class_id ?? payload?.level_id ?? uid("lv"),
      name: payload?.name ?? payload?.class_name ?? "Level Baru",
      slug:
        payload?.slug ??
        payload?.class_slug ??
        toSlug(payload?.name ?? payload?.class_name ?? ""),
      level: payload?.level ?? payload?.class_level ?? null,
      fee: payload?.fee ?? payload?.class_fee_monthly_idr ?? null,
      is_active:
        typeof payload?.is_active === "boolean"
          ? payload.is_active
          : typeof payload?.class_is_active === "boolean"
            ? payload.class_is_active
            : true,
    };

    qc.setQueryData<Level[]>(["levels"], (old = []) => [lvl, ...old]);
    setOpenTambahLevel(false);
  };

  const handleClassCreated = (row: NewClassRow) => {
    const dummy = mapNewClassToApiSection(row, levelId || undefined);

    // sisipkan ke cache daftar sections untuk kombinasi filter aktif
    qc.setQueryData<ApiClassSection[]>(
      ["class-sections", q, status, levelId],
      (old = []) => [dummy, ...old]
    );

    setOpenTambah(false);
  };

  /* ================= Render ================= */
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Kelas"
        gregorianDate={new Date().toISOString()}
        dateFmt={dateLong}
        hijriDate={hijriWithWeekday(new Date().toISOString())}
      />

      <main className="mx-auto max-w-6xl px-4 py-2">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />

          <div className="flex-1 space-y-6 min-w-0 lg:p-4">
            {/* Header */}
            <section className="flex items-center gap-6">
              <span
                className="h-10 w-10 grid place-items-center rounded-xl"
                
              >
                {showBack && (
                  <div className="mx-auto max-w-6xl flex items-center">
                    <Btn
                      palette={palette}
                      variant="ghost"
                      onClick={() => navigate(-1)}
                      className="inline-flex items-center gap-2"
                      aria-label={backLabel}
                      title={backLabel}
                    >
                      <ArrowLeft size={18} />
                    </Btn>
                  </div>
                )}
              </span>
            
                <div className="text-lg font-semibold">Kelas & Tingkat</div>
                
          
            </section>

            {/* Panel Tingkat */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 flex items-center justify-between">
                <div className="font-medium flex items-center gap-2">
                  <Layers size={18} /> Tingkat
                </div>
                <Btn
                  palette={palette}
                  variant="outline"
                  onClick={() => setOpenTambahLevel(true)}
                >
                  <Layers size={16} className="mr-2" />
                  Tambah Level
                </Btn>
              </div>

              <div className="px-4 md:px-5 pb-4 flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 rounded-lg border text-sm ${!levelId ? "font-semibold" : ""}`}
                  style={{
                    borderColor: palette.silver1,
                    background: !levelId ? palette.primary2 : palette.white1,
                    color: !levelId ? palette.primary : palette.quaternary,
                  }}
                  onClick={() => setParam("level_id", "")}
                >
                  Semua Tingkat
                </button>
                {(levels ?? []).map((lv) => {
                  const cnt = sectionCountByLevel.get(lv.id) ?? 0;
                  const active = levelId === lv.id;
                  return (
                    <button
                      key={lv.id}
                      className={`px-3 py-1.5 rounded-lg border text-sm ${active ? "font-semibold" : ""}`}
                      style={{
                        borderColor: palette.silver1,
                        background: active ? palette.primary2 : palette.white1,
                        color: active ? palette.primary : palette.quaternary,
                      }}
                      onClick={() => setParam("level_id", lv.id)}
                      title={`Kelas: ${cnt}`}
                    >
                      {lv.name}{" "}
                      <span style={{ color: palette.silver2 }}>({cnt})</span>
                    </button>
                  );
                })}
                {levelsQ.isLoading && (
                  <span className="text-sm" style={{ color: palette.silver2 }}>
                    Memuat tingkat…
                  </span>
                )}
              </div>
            </SectionCard>

            {/* KPI mini */}
            <section
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              style={{ color: palette.black2 }}
            >
              <MiniKPI
                palette={palette}
                icon={<Users size={16} />}
                label="Total Siswa"
                value={stats.students}
              />
              <MiniKPI
                palette={palette}
                icon={<BookOpen size={16} />}
                label="Total Kelas"
                value={stats.total}
              />
              <MiniKPI
                palette={palette}
                icon={<Clock4 size={16} />}
                label="Aktif"
                value={stats.active}
                tone="success"
              />
              <MiniKPI
                palette={palette}
                icon={<UserCog size={16} />}
                label="Wali Kelas"
                value={stats.homerooms}
              />
            </section>

            {/* Filter bar */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 font-medium flex items-center gap-2">
                <FilterIcon size={18} /> Filter
              </div>

              <div className="px-4 md:px-5 pb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.silver2 }}
                  >
                    Pencarian
                  </div>
                  <input
                    placeholder="Cari slug/nama/kode…"
                    defaultValue={sp.get("q") ?? ""}
                    onKeyDown={(e) => {
                      if ((e as any).key === "Enter") {
                        setParam("q", (e.target as HTMLInputElement).value);
                      }
                    }}
                    className="w-full h-11 rounded-lg border px-3 bg-transparent text-sm"
                    style={{
                      borderColor: palette.silver1,
                      color: palette.black1,
                    }}
                  />
                </div>

                {/* Shift */}
                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.silver2 }}
                  >
                    Shift (dari jam mulai)
                  </div>
                  <SelectBox
                    value={shift}
                    onChange={(e) => setParam("shift", e.target.value)}
                    palette={palette}
                  >
                    <option value="all">Semua</option>
                    <option value="Pagi">Pagi</option>
                    <option value="Sore">Sore</option>
                  </SelectBox>
                </div>

                {/* Status */}
                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.silver2 }}
                  >
                    Status
                  </div>
                  <SelectBox
                    value={status}
                    onChange={(e) => setParam("status", e.target.value)}
                    palette={palette}
                  >
                    <option value="all">Semua</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </SelectBox>
                </div>
              </div>
            </SectionCard>

            {/* Tabel Kelas */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 flex items-center justify-between">
                <div className="font-medium">Daftar Kelas</div>
                <Btn palette={palette} onClick={() => setOpenTambah(true)}>
                  <Plus className="mr-2" size={16} />
                  Tambah Kelas
                </Btn>
              </div>

              <div className="px-4 md:px-5 pb-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead
                    className="text-left"
                    style={{
                      color: palette.silver2,
                      borderColor: palette.silver1,
                    }}
                  >
                    <tr className="border-b">
                      <th className="py-2 pr-4">Kode</th>
                      <th className="py-2 pr-4">Nama Kelas</th>
                      <th className="py-2 pr-4">Tingkat</th>
                      <th className="py-2 pr-4">Wali Kelas</th>
                      <th className="py-2 pr-4">Siswa</th>
                      <th className="py-2 pr-4">Jadwal</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody
                    style={{ borderColor: palette.silver1 }}
                    className="divide-y"
                  >
                    {isLoading || isFetching ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-6 text-center"
                          style={{ color: palette.silver2 }}
                        >
                          Memuat data…
                        </td>
                      </tr>
                    ) : items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-6 text-center"
                          style={{ color: palette.silver2 }}
                        >
                          Tidak ada data yang cocok.
                        </td>
                      </tr>
                    ) : (
                      items.map((r) => (
                        <tr key={r.id} className="align-middle">
                          <td className="py-3 pr-4 font-medium">{r.code}</td>
                          <td className="py-3 pr-4">{r.name}</td>
                          <td className="py-3 pr-4">{r.grade}</td>
                          <td className="py-3 pr-4">{r.homeroom}</td>
                          <td className="py-3 pr-4">{r.studentCount}</td>
                          <td className="py-3 pr-4">{r.schedule}</td>
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
                              <Link
                                to={`/${slug}/sekolah/kelas/detail/${r.id}`}
                              >
                                <Btn
                                  palette={palette}
                                  variant="outline"
                                  size="sm"
                                >
                                  Kelola
                                </Btn>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className="pt-3 flex items-center justify-between text-xs">
                  <div style={{ color: palette.silver2 }}>
                    Menampilkan {items.length} kelas
                  </div>
                  <button
                    onClick={() => refetch()}
                    className="underline"
                    style={{ color: palette.silver2 }}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>

      {/* Modals */}
      <TambahLevel
        open={openTambahLevel}
        onClose={() => setOpenTambahLevel(false)}
        onCreated={handleLevelCreated} // ← cukup passing fungsinya saja
        palette={palette}
      />

      <TambahKelas
        open={openTambah}
        onClose={() => setOpenTambah(false)}
        palette={palette}
        onCreated={(row: NewClassRow) => handleClassCreated(row)} // langsung tambah ke cache
      />
    </div>
  );
};

export default SchoolClass;
