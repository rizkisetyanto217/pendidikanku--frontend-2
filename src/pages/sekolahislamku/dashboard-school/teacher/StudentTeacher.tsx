// src/pages/sekolahislamku/teachers/TeachersPage.tsx

import { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";

import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import SchoolSidebarNav from "@/pages/sekolahislamku/components/home/SchoolSideBarNav";
import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";

import {
  UserCog,
  UserPlus,
  Search,
  Filter,
  ChevronRight,
  Upload,
  AlertTriangle,
  Mail,
  Phone,
  Briefcase,
} from "lucide-react";

/* ================= Types ================= */
export type TeacherStatus = "aktif" | "nonaktif" | "alumni";

export interface TeacherItem {
  id: string;
  nip?: string;
  name: string;
  subject?: string;
  gender?: "L" | "P";
  phone?: string;
  email?: string;
  status: TeacherStatus;
}

interface TeachersApiResponse {
  list: TeacherItem[];
  total: number;
  byGender?: { L?: number; P?: number };
  aktifCount?: number;
  subjects?: string[];
}

interface TeacherStats {
  total: number;
  L: number;
  P: number;
  aktif: number;
}

/* ================= Helpers ================= */
const genderLabel = (gender?: "L" | "P"): string => {
  if (gender === "L") return "Laki-laki";
  if (gender === "P") return "Perempuan";
  return "-";
};

const DEFAULT_SUBJECTS = [
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "IPA",
  "IPS",
  "Agama",
];

/* ================= Components ================= */
const PageHeader = ({ theme }: { theme: Palette }) => (
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
    <div className="flex items-center gap-3">
      <div
        className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: theme.white3, color: theme.quaternary }}
      >
        <UserCog size={16} className="sm:w-5 sm:h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h1
          className="text-lg sm:text-xl font-semibold truncate"
          style={{ color: theme.quaternary }}
        >
          Guru
        </h1>
        <p
          className="text-xs sm:text-sm line-clamp-1"
          style={{ color: theme.secondary }}
        >
          Kelola data pengajar, filter, dan tindakan cepat.
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2 flex-wrap">
      <Btn
        onClick={() => console.log("IMPORT CSV Guru clicked")}
        className="flex items-center gap-1.5 text-xs sm:text-sm"
        size="sm"
        palette={theme}
      >
        <Upload size={14} />
        <span className="hidden sm:inline">Import CSV</span>
        <span className="sm:hidden">Import</span>
      </Btn>
      <NavLink to="/sekolah/guru/tambah">
        <Btn
          variant="default"
          className="flex items-center gap-1.5 text-xs sm:text-sm"
          size="sm"
          palette={theme}
        >
          <UserPlus size={14} />
          <span className="hidden sm:inline">Tambah Guru</span>
          <span className="sm:hidden">Tambah</span>
        </Btn>
      </NavLink>
    </div>
  </div>
);

const StatCard = ({
  title,
  value,
  icon,
  theme,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  theme: Palette;
}) => (
  <SectionCard palette={theme} className="p-3 sm:p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs sm:text-sm" style={{ color: theme.secondary }}>
          {title}
        </p>
        <p
          className="text-lg sm:text-2xl font-semibold"
          style={{ color: theme.quaternary }}
        >
          {value}
        </p>
      </div>
      <div className="flex-shrink-0">{icon}</div>
    </div>
  </SectionCard>
);

const StatsGrid = ({
  stats,
  theme,
}: {
  stats: TeacherStats;
  theme: Palette;
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
    <StatCard
      title="Total Guru"
      value={stats.total}
      icon={<Briefcase size={18} />}
      theme={theme}
    />
    <StatCard
      title="Aktif"
      value={stats.aktif}
      icon={
        <Badge variant="success" palette={theme} className="text-xs px-2">
          OK
        </Badge>
      }
      theme={theme}
    />
    <StatCard
      title="Laki-laki"
      value={stats.L}
      icon={
        <Badge palette={theme} className="text-xs px-2">
          L
        </Badge>
      }
      theme={theme}
    />
    <StatCard
      title="Perempuan"
      value={stats.P}
      icon={
        <Badge palette={theme} className="text-xs px-2">
          P
        </Badge>
      }
      theme={theme}
    />
  </div>
);

interface FiltersProps {
  theme: Palette;
  q: string;
  setQ: (value: string) => void;
  mapel: string | undefined;
  setMapel: (value: string | undefined) => void;
  status: TeacherStatus | "semua";
  setStatus: (value: TeacherStatus | "semua") => void;
  subjects: string[];
  onApply: () => void;
}

const FiltersSection = ({
  theme,
  q,
  setQ,
  mapel,
  setMapel,
  status,
  setStatus,
  subjects,
  onApply,
}: FiltersProps) => (
  <SectionCard palette={theme} className="p-3 sm:p-4">
    <div className="space-y-3">
      {/* Search Input */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2.5 sm:py-2 border"
        style={{ borderColor: theme.white3, background: theme.white1 }}
      >
        <Search size={16} className="flex-shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama, NIP, email…"
          className="w-full bg-transparent outline-none text-sm"
          style={{ color: theme.quaternary }}
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex gap-2 flex-1">
          {/* Subject Filter */}
          <div
            className="flex-1 sm:flex-none rounded-xl border px-3 py-2"
            style={{
              borderColor: theme.white3,
              background: theme.white1,
              color: theme.quaternary,
            }}
          >
            <div className="text-xs mb-1" style={{ color: theme.secondary }}>
              Mapel
            </div>
            <select
              value={mapel ?? ""}
              onChange={(e) => setMapel(e.target.value || undefined)}
              className="w-full bg-transparent outline-none text-sm"
            >
              <option value="">Semua</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div
            className="flex-1 sm:flex-none rounded-xl border px-3 py-2"
            style={{
              borderColor: theme.white3,
              background: theme.white1,
              color: theme.quaternary,
            }}
          >
            <div className="text-xs mb-1" style={{ color: theme.secondary }}>
              Status
            </div>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as TeacherStatus | "semua")
              }
              className="w-full bg-transparent outline-none text-sm"
            >
              <option value="semua">Semua</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>
        </div>

        <Btn
          size="sm"
          className="flex items-center justify-center gap-2 text-sm py-2.5 sm:py-2"
          onClick={onApply}
          palette={theme}
        >
          <Filter size={16} /> Terapkan
        </Btn>
      </div>
    </div>
  </SectionCard>
);

const TeacherTableRow = ({
  teacher,
  theme,
}: {
  teacher: TeacherItem;
  theme: Palette;
}) => (
  <tr
    key={teacher.id}
    className="border-t"
    style={{ borderColor: theme.white3 }}
  >
    <td className="py-3 align-top">
      <div className="font-medium" style={{ color: theme.quaternary }}>
        {teacher.nip ?? "-"}
      </div>
    </td>

    <td className="py-3 align-top">
      <div className="font-medium" style={{ color: theme.quaternary }}>
        {teacher.name}
      </div>
      {teacher.email && (
        <div className="text-xs" style={{ color: theme.secondary }}>
          {teacher.email}
        </div>
      )}
    </td>

    <td className="py-3 align-top" style={{ color: theme.primary }}>
      {teacher.subject ?? "-"}
    </td>

    <td className="py-3 align-top" style={{ color: theme.quaternary }}>
      {genderLabel(teacher.gender)}
    </td>

    <td className="py-3 align-top">
      <div
        className="flex items-center gap-3 text-sm"
        style={{ color: theme.quaternary }}
      >
        {teacher.phone && (
          <a
            href={`tel:${teacher.phone}`}
            className="flex items-center gap-1 hover:underline"
            title={`Telepon ${teacher.phone}`}
          >
            <Phone size={14} /> {teacher.phone}
          </a>
        )}
        {teacher.email && (
          <a
            href={`mailto:${teacher.email}`}
            className="flex items-center gap-1 hover:underline"
            title={`Email ${teacher.email}`}
          >
            <Mail size={14} /> Email
          </a>
        )}
      </div>
    </td>

    <td className="py-3 align-top">
      {teacher.status === "aktif" && (
        <Badge variant="success" palette={theme}>
          Aktif
        </Badge>
      )}
      {teacher.status === "nonaktif" && (
        <Badge variant="warning" palette={theme}>
          Nonaktif
        </Badge>
      )}
      {teacher.status === "alumni" && (
        <Badge variant="info" palette={theme}>
          Alumni
        </Badge>
      )}
    </td>

    <td className="py-3 align-top">
      <div className="flex items-center gap-2 justify-end">
        <NavLink to={`/sekolah/guru/${teacher.id}`}>
          <Btn size="sm" palette={theme} className="flex items-center gap-1">
            Detail <ChevronRight size={14} />
          </Btn>
        </NavLink>
        <NavLink to={`/sekolah/absensi?guru=${teacher.id}`}>
          <Btn size="sm" palette={theme}>
            Absensi
          </Btn>
        </NavLink>
      </div>
    </td>
  </tr>
);

interface TeachersTableProps {
  theme: Palette;
  teachers: TeacherItem[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  onRefetch: () => void;
}

const TeachersTable = ({
  theme,
  teachers,
  isLoading,
  isError,
  isFetching,
  onRefetch,
}: TeachersTableProps) => (
  <SectionCard palette={theme} className="p-0 sm:p-2 lg:p-4">
    {/* Mobile Card View */}
    <div className="block sm:hidden">
      {isLoading && (
        <div
          className="py-8 text-center text-sm"
          style={{ color: theme.secondary }}
        >
          Memuat data…
        </div>
      )}

      {isError && (
        <div className="py-8 px-4">
          <div
            className="flex items-center gap-2 justify-center text-sm"
            style={{ color: theme.warning1 }}
          >
            <AlertTriangle size={16} />
            Terjadi kesalahan.
            <button className="underline" onClick={onRefetch}>
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {!isLoading && !isError && teachers.length === 0 && (
        <div
          className="py-10 text-center text-sm"
          style={{ color: theme.secondary }}
        >
          Belum ada data guru.
        </div>
      )}

      {!isLoading &&
        !isError &&
        teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="border-b p-4 last:border-b-0"
            style={{ borderColor: theme.white3 }}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h3
                  className="font-medium text-sm truncate"
                  style={{ color: theme.quaternary }}
                >
                  {teacher.name}
                </h3>
                <p className="text-xs mt-1" style={{ color: theme.secondary }}>
                  {teacher.nip ? `NIP: ${teacher.nip}` : "Tanpa NIP"}
                </p>
              </div>
              <div className="flex-shrink-0 ml-2">
                {teacher.status === "aktif" && (
                  <Badge variant="success" palette={theme} className="text-xs">
                    Aktif
                  </Badge>
                )}
                {teacher.status === "nonaktif" && (
                  <Badge variant="warning" palette={theme} className="text-xs">
                    Nonaktif
                  </Badge>
                )}
                {teacher.status === "alumni" && (
                  <Badge variant="info" palette={theme} className="text-xs">
                    Alumni
                  </Badge>
                )}
              </div>
            </div>

            <div
              className="space-y-1 text-xs"
              style={{ color: theme.secondary }}
            >
              <div>
                Mapel:{" "}
                <span style={{ color: theme.primary }}>
                  {teacher.subject ?? "-"}
                </span>
              </div>
              <div>JK: {genderLabel(teacher.gender)}</div>
              {teacher.phone && (
                <div className="flex items-center gap-1">
                  <Phone size={12} />
                  <a href={`tel:${teacher.phone}`} className="hover:underline">
                    {teacher.phone}
                  </a>
                </div>
              )}
              {teacher.email && (
                <div className="flex items-center gap-1">
                  <Mail size={12} />
                  <a
                    href={`mailto:${teacher.email}`}
                    className="hover:underline truncate"
                  >
                    {teacher.email}
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <NavLink to={`/sekolah/guru/${teacher.id}`} className="flex-1">
                <Btn
                  size="sm"
                  palette={theme}
                  className="w-full justify-center text-xs"
                >
                  Detail
                </Btn>
              </NavLink>
              <NavLink
                to={`/sekolah/absensi?guru=${teacher.id}`}
                className="flex-1"
              >
                <Btn
                  size="sm"
                  palette={theme}
                  className="w-full justify-center text-xs"
                >
                  Absensi
                </Btn>
              </NavLink>
            </div>
          </div>
        ))}
    </div>

    {/* Desktop Table View */}
    <div className="hidden sm:block overflow-auto">
      <table className="min-w-[800px] w-full">
        <thead>
          <tr className="text-left text-sm" style={{ color: theme.secondary }}>
            <th className="py-3">NIP</th>
            <th>Nama</th>
            <th>Mapel</th>
            <th>JK</th>
            <th>Kontak</th>
            <th>Status</th>
            <th className="text-right pr-2">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {/* Loading State */}
          {isLoading && (
            <tr>
              <td
                colSpan={7}
                className="py-8 text-center"
                style={{ color: theme.secondary }}
              >
                Memuat data…
              </td>
            </tr>
          )}

          {/* Error State */}
          {isError && (
            <tr>
              <td colSpan={7} className="py-8">
                <div
                  className="flex items-center gap-2 justify-center text-sm"
                  style={{ color: theme.warning1 }}
                >
                  <AlertTriangle size={16} />
                  Terjadi kesalahan.
                  <button className="underline" onClick={onRefetch}>
                    Coba lagi
                  </button>
                </div>
              </td>
            </tr>
          )}

          {/* Empty State */}
          {!isLoading && !isError && teachers.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="py-10 text-center"
                style={{ color: theme.secondary }}
              >
                Belum ada data guru.
              </td>
            </tr>
          )}

          {/* Data Rows */}
          {!isLoading &&
            !isError &&
            teachers.map((teacher) => (
              <TeacherTableRow
                key={teacher.id}
                teacher={teacher}
                theme={theme}
              />
            ))}
        </tbody>
      </table>
    </div>

    {/* Table Footer */}
    <div
      className="p-3 sm:mt-3 text-xs flex items-center justify-between border-t sm:border-t-0"
      style={{ color: theme.secondary, borderColor: theme.white3 }}
    >
      <div>
        {isFetching ? "Memuat ulang…" : `Menampilkan ${teachers.length} data`}
      </div>
      <div className="flex items-center gap-2">
        <button className="underline" onClick={onRefetch}>
          Refresh
        </button>
      </div>
    </div>
  </SectionCard>
);

/* ================= Main Component ================= */
export default function TeachersPage() {
  const { isDark } = useHtmlDarkMode();
  const theme: Palette = isDark ? colors.dark : colors.light;

  // Filter states
  const [q, setQ] = useState("");
  const [mapel, setMapel] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<TeacherStatus | "semua">("semua");

  // API query
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["teachers", { q, mapel, status }],
    queryFn: async (): Promise<TeachersApiResponse> => {
      const params: Record<string, string> = {};
      if (q) params.q = q;
      if (mapel) params.subject = mapel;
      if (status !== "semua") params.status = status;

      const response = await axios.get("/api/a/teachers", { params });
      return response.data;
    },
  });

  // Derived data
  const teachers = data?.list ?? [];
  const subjects = data?.subjects ?? DEFAULT_SUBJECTS;

  // Statistics calculation
  const stats: TeacherStats = useMemo(() => {
    const total = data?.total ?? teachers.length;
    const L =
      data?.byGender?.L ?? teachers.filter((t) => t.gender === "L").length;
    const P =
      data?.byGender?.P ?? teachers.filter((t) => t.gender === "P").length;
    const aktif =
      data?.aktifCount ?? teachers.filter((t) => t.status === "aktif").length;

    return { total, L, P, aktif };
  }, [data, teachers]);

  return (
    <>
      <ParentTopBar palette={theme} title="Guru" />

      <div className="lg:flex lg:items-start lg:gap-4 lg:p-4 lg:pt-6">
        <SchoolSidebarNav palette={theme} className="hidden lg:block" />

        <main className="flex-1 mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">
          <PageHeader theme={theme} />

          <StatsGrid stats={stats} theme={theme} />

          <FiltersSection
            theme={theme}
            q={q}
            setQ={setQ}
            mapel={mapel}
            setMapel={setMapel}
            status={status}
            setStatus={setStatus}
            subjects={subjects}
            onApply={refetch}
          />

          <TeachersTable
            theme={theme}
            teachers={teachers}
            isLoading={isLoading}
            isError={isError}
            isFetching={isFetching}
            onRefetch={refetch}
          />
        </main>
      </div>
    </>
  );
}
