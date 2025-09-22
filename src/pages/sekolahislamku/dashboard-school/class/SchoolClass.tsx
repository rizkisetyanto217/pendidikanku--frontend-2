// src/pages/sekolahislamku/pages/classes/SchoolClasses.tsx
import { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useSearchParams,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import {
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
import ParentSidebar from "../../components/home/ParentSideBar";
import TambahKelas, {
  type ClassRow as NewClassRow,
} from "./components/AddClass";
import TambahLevel from "./components/AddLevel";
import axios from "@/lib/axios";

/* ================= Types ================= */
export type ClassStatus = "active" | "inactive";

export interface ClassRow {
  id: string;
  code: string;
  name: string;
  grade: string;
  homeroom: string;
  studentCount: number;
  schedule: string;
  status: ClassStatus;
  classId?: string;
}

export interface ClassStats {
  total: number;
  active: number;
  students: number;
  homerooms: number;
}

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
  class_sections_class_id: string;
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

export interface Level {
  id: string;
  name: string;
  slug: string;
  level?: string | null;
  fee?: number | null;
  is_active: boolean;
}

type SchoolClassProps = {
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
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

const uid = (p = "tmp") =>
  `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/* ================= Dummy Data ================= */
const DUMMY_LEVELS: Level[] = [
  {
    id: "lv-1",
    name: "SD Kelas 1",
    slug: "sd-1",
    level: "1",
    fee: 150000,
    is_active: true,
  },
  {
    id: "lv-2",
    name: "SD Kelas 2",
    slug: "sd-2",
    level: "2",
    fee: 150000,
    is_active: true,
  },
];

const DUMMY_CLASSES: ClassRow[] = [
  {
    id: "cls-1",
    code: "1A",
    name: "Kelas 1A",
    grade: "1",
    homeroom: "Ahmad Fauzi",
    studentCount: 28,
    schedule: "Senin, Rabu, Jumat 07:30–09:30 @Ruang A1",
    status: "active",
    classId: "lv-1",
  },
  {
    id: "cls-2",
    code: "1B",
    name: "Kelas 1B",
    grade: "1",
    homeroom: "Siti Nurhaliza",
    studentCount: 26,
    schedule: "Selasa & Kamis 08:00–10:00 @Ruang A2",
    status: "inactive",
    classId: "lv-1",
  },
  {
    id: "cls-3",
    code: "2A",
    name: "Kelas 2A",
    grade: "2",
    homeroom: "Budi Santoso",
    studentCount: 30,
    schedule: "Senin–Kamis 09:00–11:00 @Ruang B1",
    status: "active",
    classId: "lv-2",
  },
];

/* ================= Fetchers ================= */
async function fetchClassSections({
  q,
  status,
  classId,
}: {
  q?: string;
  status?: ClassStatus | "all";
  classId?: string;
}): Promise<ApiClassSection[]> {
  const params: Record<string, any> = {};
  if (q?.trim()) params.search = q.trim();
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
  return (res.data?.data ?? []).map(mapLevelRow);
}

/* ================= UI ================= */
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
        className="w-full h-11 rounded-lg border pl-3 pr-10 bg-transparent text-sm appearance-none"
        style={{ borderColor: palette.silver1, color: palette.black1 }}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
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

  const q = (sp.get("q") ?? "").trim();
  const status = (sp.get("status") ?? "all") as ClassStatus | "all";
  const shift = (sp.get("shift") ?? "all") as "Pagi" | "Sore" | "all";
  const levelId = sp.get("level_id") ?? "";

  const levelsQ = useQuery({
    queryKey: ["levels"],
    queryFn: fetchLevels,
    staleTime: 60_000,
  });
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

  useEffect(() => {
    if (!openTambah) refetch();
  }, [openTambah, refetch]);

  const mappedRows: ClassRow[] = useMemo(
    () =>
      (apiItems ?? []).map((it) => ({
        id: it.class_sections_id,
        classId: it.class_sections_class_id,
        code: it.class_sections_code ?? "-",
        name: it.class_sections_name,
        grade: parseGrade(it.class_sections_code, it.class_sections_name),
        homeroom: it.teacher?.user_name ?? "-",
        studentCount: 0,
        schedule: scheduleToText(it.class_sections_schedule),
        status: it.class_sections_is_active ? "active" : "inactive",
      })),
    [apiItems]
  );

  const filteredRows = useMemo(() => {
    return mappedRows.filter((r) => {
      const apiItem = (apiItems ?? []).find(
        (x) => x.class_sections_id === r.id
      );
      const rowShift = getShiftFromSchedule(apiItem?.class_sections_schedule);
      return shift === "all" || rowShift === shift;
    });
  }, [mappedRows, shift, apiItems]);

  const sectionCountByLevel = useMemo(() => {
    const m = new Map<string, number>();
    mappedRows.forEach((r) => {
      if (r.classId) m.set(r.classId, (m.get(r.classId) ?? 0) + 1);
    });
    return m;
  }, [mappedRows]);

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(sp);
    v ? next.set(k, v) : next.delete(k);
    setSp(next, { replace: true });
  };

  const items = filteredRows.length > 0 ? filteredRows : DUMMY_CLASSES;
  const levels =
    levelsQ.data && levelsQ.data.length > 0 ? levelsQ.data : DUMMY_LEVELS;

  const toSlug = (s: string) =>
    (s || "level-baru").toLowerCase().trim().replace(/\s+/g, "-");

  const handleLevelCreated = (payload?: any) => {
    const lvl: Level = {
      id: payload?.id ?? uid("lv"),
      name: payload?.name ?? "Level Baru",
      slug: payload?.slug ?? toSlug(payload?.name ?? ""),
      level: payload?.level ?? null,
      fee: payload?.fee ?? null,
      is_active: payload?.is_active ?? true,
    };
    qc.setQueryData<Level[]>(["levels"], (old = []) => [lvl, ...(old ?? [])]);
    setOpenTambahLevel(false);
  };

  const handleClassCreated = (row: NewClassRow) => {
    const dummy: ApiClassSection = {
      class_sections_id: (row as any).id ?? uid("sec"),
      class_sections_class_id: (row as any).classId ?? levels[0]?.id ?? "",
      class_sections_masjid_id: (row as any).masjidId ?? "",
      class_sections_teacher_id: (row as any).teacherId ?? null,
      class_sections_slug:
        (row as any).slug ?? toSlug(row.name ?? "kelas-baru"),
      class_sections_name: row.name ?? "Kelas Baru",
      class_sections_code: (row as any).code ?? "-",
      class_sections_capacity: (row as any).capacity ?? null,
      class_sections_schedule: (row as any).schedule ?? {
        days: [],
        start: undefined,
        end: undefined,
      },
      class_sections_is_active: (row as any).is_active ?? true,
      class_sections_created_at: new Date().toISOString(),
      class_sections_updated_at: new Date().toISOString(),
      teacher: (row as any).teacher
        ? {
            id: (row as any).teacher.id ?? uid("tch"),
            user_name: (row as any).teacher.user_name ?? "Guru Baru",
            email: (row as any).teacher.email ?? "",
            is_active: (row as any).teacher.is_active ?? true,
          }
        : null,
    };

    qc.setQueryData<ApiClassSection[]>(
      ["class-sections", q, status, levelId],
      (old = []) => [dummy, ...(old ?? [])]
    );

    setOpenTambah(false);
  };

  return (
    <div
      className="h-full w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Kelas"
        gregorianDate={new Date().toISOString()}
        dateFmt={dateLong}
        hijriDate={hijriWithWeekday(new Date().toISOString())}
      />

      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main Content */}
          <section className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Header */}
            <div className="flex gap-3 items-center">
              {showBack && (
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                  className="inline-flex items-center gap-2"
                >
                  <ArrowLeft size={20} />
          
                </Btn>
              )}
              <h1 className="text-lg font-semibold">Seluruh Kelas</h1>
            </div>

            {/* Panel Tingkat */}
            <SectionCard palette={palette}>
              <div className="flex p-4 md:p-5 pb-2 items-center justify-between">
                <div className="font-medium flex items-center gap-2">
                  <Layers size={18} /> Tingkat
                </div>
                <Btn
                  palette={palette}
                  variant="outline"
                  onClick={() => setOpenTambahLevel(true)}
                >
                  <Layers size={16} className="mr-2" /> Tambah Level
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
                {levels.map((lv) => {
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
                    >
                      {lv.name}{" "}
                      <span style={{ color: palette.silver2 }}>({cnt})</span>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* Filter */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 font-medium flex items-center gap-2">
                <FilterIcon size={18} /> Filter
              </div>
              <div className="px-4 md:px-5 pb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <div className="text-xs mb-1">Pencarian</div>
                  <input
                    placeholder="Cari slug/nama/kode…"
                    defaultValue={sp.get("q") ?? ""}
                    onKeyDown={(e) => {
                      if ((e as any).key === "Enter")
                        setParam("q", (e.target as HTMLInputElement).value);
                    }}
                    className="w-full h-11 rounded-lg border px-3 bg-transparent text-sm"
                    style={{ borderColor: palette.silver1 }}
                  />
                </div>
                <div>
                  <div className="text-xs mb-1">Shift</div>
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
                <div>
                  <div className="text-xs mb-1">Status</div>
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

            {/* Tabel */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 flex items-center justify-between">
                <div className="font-medium">Daftar Kelas</div>
                <Btn palette={palette} onClick={() => setOpenTambah(true)}>
                  <Plus className="mr-2" size={16} /> Tambah Kelas
                </Btn>
              </div>

              <div className="px-4 md:px-5 pb-4 overflow-x-auto">
                <table className="min-w-[800px] w-full text-sm">
                  <thead
                    className="text-left border-b"
                    style={{
                      color: palette.silver2,
                      borderColor: palette.silver1,
                    }}
                  >
                    <tr>
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
                    className="divide-y"
                    style={{ borderColor: palette.silver1 }}
                  >
                    {isLoading || isFetching ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center">
                          Memuat data…
                        </td>
                      </tr>
                    ) : items.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center">
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

                <div
                  className="pt-3 flex items-center justify-between text-xs"
                  style={{ color: palette.silver2 }}
                >
                  <div>Menampilkan {items.length} kelas</div>
                  <button onClick={() => refetch()} className="underline">
                    Refresh
                  </button>
                </div>
              </div>
            </SectionCard>
          </section>
        </div>
      </main>

      {/* Modals */}
      <TambahLevel
        open={openTambahLevel}
        onClose={() => setOpenTambahLevel(false)}
        onCreated={handleLevelCreated}
        palette={palette}
      />
      <TambahKelas
        open={openTambah}
        onClose={() => setOpenTambah(false)}
        palette={palette}
        onCreated={handleClassCreated}
      />
    </div>
  );
};

export default SchoolClass;
