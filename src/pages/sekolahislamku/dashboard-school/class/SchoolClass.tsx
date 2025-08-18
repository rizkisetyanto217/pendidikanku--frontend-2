import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  UserCog,
  Clock4,
  Filter as FilterIcon,
  Plus,
  Eye,
  Pencil,
} from "lucide-react";

import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";
import SchoolSidebarNav from "../../components/home/SchoolSideBarNav";
import TambahKelas, {
  type ClassRow as NewClassRow,
} from "./components/TambahKelas";

/* =============== Types =============== */
export type ClassStatus = "active" | "inactive";

export type ClassRow = {
  id: string;
  code: string;
  name: string;
  grade: string; // diturunkan dari code/name (jika ada angka), fallback "-"
  homeroom: string; // dari teacher.user_name
  studentCount: number; // belum ada di API → 0 dulu
  schedule: string; // render dari schedule JSON
  status: ClassStatus; // dari class_sections_is_active
};

export type ClassStats = {
  total: number;
  active: number;
  students: number;
  homerooms: number;
};

export type ClassesPayload = {
  dateISO: string;
  stats: ClassStats;
  items: ClassRow[];
};

/* ======== API Shapes (sesuai contoh respons) ========= */
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

type ApiListResponse = {
  data: ApiClassSection[];
  message: string;
};

/* =============== Helpers =============== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

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

/* =============== Fetcher =============== */
import axios from "@/lib/axios";

async function fetchClassSections({
  q,
  status,
}: {
  q?: string;
  status?: ClassStatus | "all";
}): Promise<ApiClassSection[]> {
  const params: Record<string, any> = {};
  if (q && q.trim().length > 0) params.search = q.trim();
  if (status && status !== "all") params.active_only = status === "active";
  // sort default dari server: created_at desc
  const res = await axios.get<ApiListResponse>("/api/a/class-sections", {
    params,
  });
  return res.data?.data ?? [];
}

/* =============== Page =============== */
export default function SchoolClasses() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  const [sp, setSp] = useSearchParams();
  const [openTambah, setOpenTambah] = useState(false);

  // Query params (UI)
  const q = (sp.get("q") ?? "").trim();
  const grade = sp.get("grade") ?? "all";
  const status = (sp.get("status") ?? "all") as ClassStatus | "all";
  const shift = (sp.get("shift") ?? "all") as "Pagi" | "Sore" | "all";

  // Fetch dari API
  const {
    data: apiItems,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["class-sections", q, status],
    queryFn: () => fetchClassSections({ q, status }),
    staleTime: 60_000,
  });

  // Refetch ketika modal tambah ditutup (misal habis create)
  useEffect(() => {
    if (!openTambah) {
      refetch();
    }
  }, [openTambah, refetch]);

  // Map API → UI rows
  const mappedRows: ClassRow[] = useMemo(() => {
    const arr = apiItems ?? [];
    return arr.map((it) => ({
      id: it.class_sections_id,
      code: it.class_sections_code ?? "-",
      name: it.class_sections_name,
      grade: parseGrade(it.class_sections_code, it.class_sections_name),
      homeroom: it.teacher?.user_name ?? "-",
      studentCount: 0, // Belum tersedia di API
      schedule: scheduleToText(it.class_sections_schedule),
      status: it.class_sections_is_active ? "active" : "inactive",
    }));
  }, [apiItems]);

  // Filter client-side untuk grade & shift (karena API belum support)
  const filteredRows = useMemo(() => {
    return mappedRows.filter((r) => {
      const okGrade = grade === "all" ? true : r.grade === grade;
      const rowShift = (() => {
        const apiItem = (apiItems ?? []).find(
          (x) => x.class_sections_id === r.id
        );
        return getShiftFromSchedule(apiItem?.class_sections_schedule);
      })();
      const okShift = shift === "all" ? true : rowShift === shift;
      return okGrade && okShift;
    });
  }, [mappedRows, grade, shift, apiItems]);

  // Stats (disusun dari hasil filter server + client)
  const stats: ClassStats = useMemo(() => {
    const total = mappedRows.length;
    const active = mappedRows.filter((x) => x.status === "active").length;
    const students = mappedRows.reduce((a, b) => a + (b.studentCount || 0), 0); // 0
    const homerooms = new Set(mappedRows.map((x) => x.homeroom).filter(Boolean))
      .size;
    return { total, active, students, homerooms };
  }, [mappedRows]);

  // Opsi grade dinamis (dari hasil map)
  const grades = useMemo(() => {
    const set = new Set<string>();
    mappedRows.forEach((x) => {
      if (x.grade && x.grade !== "-") set.add(x.grade);
    });
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [mappedRows]);

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(sp);
    if (v) next.set(k, v);
    else next.delete(k);
    setSp(next, { replace: true });
  };

  const items = filteredRows;

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Kelas"
        gregorianDate={new Date().toISOString()}
        hijriDate={undefined}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <SchoolSidebarNav palette={palette} />

          <div className="flex-1 space-y-6 min-w-0 lg:p-4">
            {/* Header + actions */}
            <section className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="h-10 w-10 grid place-items-center rounded-xl"
                  style={{
                    background: palette.primary2,
                    color: palette.primary,
                  }}
                >
                  <BookOpen size={18} />
                </span>
                <div>
                  <div className="text-lg font-semibold">Kelas</div>
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Kelola data kelas, wali, dan kapasitas.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Btn palette={palette} onClick={() => setOpenTambah(true)}>
                  <Plus className="mr-2" size={16} />
                  Tambah Kelas
                </Btn>
              </div>
            </section>

            {/* KPI mini */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MiniKPI
                palette={palette}
                icon={<Users size={16} />}
                label="Total Siswa"
                value={stats.students} // 0 untuk sekarang (belum ada di API)
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
              <div className="px-4 md:px-5 pb-4 grid grid-cols-1 md:grid-cols-5 gap-3">
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
                    className="w-full rounded-lg border px-3 py-2 bg-transparent"
                    style={{ borderColor: palette.silver1 }}
                  />
                </div>

                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.silver2 }}
                  >
                    Tingkat (estimasi)
                  </div>
                  <select
                    value={grade}
                    onChange={(e) => setParam("grade", e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 bg-transparent"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <option value="all">Semua</option>
                    {grades.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.silver2 }}
                  >
                    Shift (dari jam mulai)
                  </div>
                  <select
                    value={shift}
                    onChange={(e) => setParam("shift", e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 bg-transparent"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <option value="all">Semua</option>
                    <option value="Pagi">Pagi</option>
                    <option value="Sore">Sore</option>
                  </select>
                </div>

                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.silver2 }}
                  >
                    Status
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setParam("status", e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 bg-transparent"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <option value="all">Semua</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* Tabel */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 font-medium">Daftar Kelas</div>
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
                              <Link to={`/school/classes/${r.id}`}>
                                <Btn
                                  palette={palette}
                                  variant="quaternary"
                                  size="sm"
                                >
                                  <Eye size={14} className="mr-1" /> Lihat
                                </Btn>
                              </Link>
                              <Link to={`/school/classes/${r.id}/edit`}>
                                <Btn
                                  palette={palette}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Pencil size={14} className="mr-1" /> Kelola
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

      {/* Modal Tambah Kelas */}
      <TambahKelas
        open={openTambah}
        onClose={() => setOpenTambah(false)}
        palette={palette}
        onCreated={(row: NewClassRow) => {
          console.log("Kelas baru dibuat:", row);
          // Opsional: refetch di useEffect setelah modal close
        }}
      />
    </div>
  );
}

/* =============== Small UI (unchanged) =============== */
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
