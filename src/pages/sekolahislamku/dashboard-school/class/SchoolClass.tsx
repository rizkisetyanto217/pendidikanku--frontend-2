// src/pages/sekolahislamku/school/SchoolClasses.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  UserCog,
  Clock4,
  Filter as FilterIcon,
  Upload,
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
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import SchoolSidebarNav from "../../components/home/SchoolSideBarNav";

/* =============== Types =============== */
type ClassStatus = "active" | "inactive";
type ClassRow = {
  id: string;
  code: string;
  name: string;
  grade: string; // misal: "1", "2", "3", ... atau "A", "B"
  homeroom: string;
  studentCount: number;
  schedule: string; // "Pagi", "Sore", dst
  status: ClassStatus;
};

type ClassStats = {
  total: number;
  active: number;
  students: number;
  homerooms: number;
};

type ClassesPayload = {
  dateISO: string;
  stats: ClassStats;
  items: ClassRow[];
};

/* =============== Helpers =============== */
const dateLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

/* =============== Dummy API =============== */
const DUMMY: ClassRow[] = [
  {
    id: "c-3a",
    code: "3A",
    name: "Kelas 3A",
    grade: "3",
    homeroom: "Ust. Farid",
    studentCount: 28,
    schedule: "Pagi",
    status: "active",
  },
  {
    id: "c-3b",
    code: "3B",
    name: "Kelas 3B",
    grade: "3",
    homeroom: "Ustdz. Salma",
    studentCount: 27,
    schedule: "Pagi",
    status: "active",
  },
  {
    id: "c-4a",
    code: "4A",
    name: "Kelas 4A",
    grade: "4",
    homeroom: "Ust. Rafi",
    studentCount: 30,
    schedule: "Pagi",
    status: "active",
  },
  {
    id: "c-4b",
    code: "4B",
    name: "Kelas 4B",
    grade: "4",
    homeroom: "Ustdz. Nisa",
    studentCount: 26,
    schedule: "Sore",
    status: "active",
  },
  {
    id: "c-5a",
    code: "5A",
    name: "Kelas 5A",
    grade: "5",
    homeroom: "Ust. Rendy",
    studentCount: 25,
    schedule: "Sore",
    status: "active",
  },
  {
    id: "c-2a",
    code: "2A",
    name: "Kelas 2A",
    grade: "2",
    homeroom: "Ustdz. Hana",
    studentCount: 29,
    schedule: "Pagi",
    status: "active",
  },
  {
    id: "c-6a",
    code: "6A",
    name: "Kelas 6A",
    grade: "6",
    homeroom: "Ust. Damar",
    studentCount: 24,
    schedule: "Sore",
    status: "inactive",
  },
  {
    id: "c-1a",
    code: "1A",
    name: "Kelas 1A",
    grade: "1",
    homeroom: "Ustdz. Maryam",
    studentCount: 31,
    schedule: "Pagi",
    status: "active",
  },
];

async function fetchClasses({
  q,
  grade,
  status,
  shift,
}: {
  q?: string;
  grade?: string;
  status?: ClassStatus | "all";
  shift?: "Pagi" | "Sore" | "all";
}): Promise<ClassesPayload> {
  const items = DUMMY.filter((r) => {
    const okQ = q
      ? [r.name, r.code, r.homeroom].join(" ").toLowerCase().includes(q)
      : true;
    const okGrade = grade && grade !== "all" ? r.grade === grade : true;
    const okStatus = status && status !== "all" ? r.status === status : true;
    const okShift = shift && shift !== "all" ? r.schedule === shift : true;
    return okQ && okGrade && okStatus && okShift;
  });

  const stats: ClassStats = {
    total: DUMMY.length,
    active: DUMMY.filter((x) => x.status === "active").length,
    students: DUMMY.reduce((a, b) => a + b.studentCount, 0),
    homerooms: new Set(DUMMY.map((x) => x.homeroom)).size,
  };

  return {
    dateISO: new Date().toISOString(),
    stats,
    items,
  };
}

/* =============== Page =============== */
export default function SchoolClasses() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();

  const q = (sp.get("q") ?? "").trim().toLowerCase();
  const grade = sp.get("grade") ?? "all";
  const status = (sp.get("status") ?? "all") as ClassStatus | "all";
  const shift = (sp.get("shift") ?? "all") as "Pagi" | "Sore" | "all";

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["school-classes", q, grade, status, shift],
    queryFn: () => fetchClasses({ q, grade, status, shift }),
    staleTime: 60_000,
  });

  const items = data?.items ?? [];

  const grades = useMemo(
    () =>
      Array.from(new Set(DUMMY.map((x) => x.grade))).sort(
        (a, b) => Number(a) - Number(b)
      ),
    []
  );

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(sp);
    if (v) next.set(k, v);
    else next.delete(k);
    setSp(next, { replace: true });
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Kelas"
        gregorianDate={data?.dateISO}
        hijriDate={undefined}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          {/* Sidebar kiri */}
          <SchoolSidebarNav palette={palette} />

          {/* Konten kanan */}
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
                <Btn
                  palette={palette}
                  variant="outline"
                  onClick={() => alert("Import CSV kelas")}
                >
                  <Upload className="mr-2" size={16} />
                  Import CSV
                </Btn>
                <Btn
                  palette={palette}
                  onClick={() => navigate("/school/classes/new")}
                >
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
                value={data?.stats.students ?? 0}
              />
              <MiniKPI
                palette={palette}
                icon={<BookOpen size={16} />}
                label="Total Kelas"
                value={data?.stats.total ?? 0}
              />
              <MiniKPI
                palette={palette}
                icon={<Clock4 size={16} />}
                label="Aktif"
                value={data?.stats.active ?? 0}
                tone="success"
              />
              <MiniKPI
                palette={palette}
                icon={<UserCog size={16} />}
                label="Wali Kelas"
                value={data?.stats.homerooms ?? 0}
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
                    placeholder="Cari nama kelas / kode / wali…"
                    defaultValue={sp.get("q") ?? ""}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
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
                    Tingkat
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
                    Shift
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
    </div>
  );
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
  const bg = tone === "success" ? "#0EA5A222" : undefined; // pakai transparan ringan
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
