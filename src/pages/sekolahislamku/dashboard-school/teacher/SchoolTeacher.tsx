import { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
import TambahGuru from "../components/Guru/modal/TambahGuru";
import UploadFileGuru from "../components/Guru/modal/UploadFileGuru";

/* ================= Types ================= */
export type TeacherStatus = "aktif" | "nonaktif" | "alumni";

export interface TeacherItem {
  id: string; // masjid_teachers_id
  nip?: string;
  name: string; // user_name
  subject?: string;
  gender?: "L" | "P";
  phone?: string;
  email?: string;
  status: TeacherStatus; // default "aktif" (endpoint belum kirim)
}

interface TeacherStats {
  total: number;
  L: number;
  P: number;
  aktif: number;
}

/** Response: GET /api/a/masjid-teachers/by-masjid */
type TeachersByMasjidResponse = {
  code: number;
  status: string;
  message: string;
  data: {
    total: number;
    teachers: Array<{
      masjid_teachers_id: string;
      masjid_teachers_masjid_id: string;
      masjid_teachers_user_id: string;
      user_name: string;
      masjid_teachers_created_at: string;
      masjid_teachers_updated_at: string;
    }>;
  };
};

/* ================= Helpers ================= */
const genderLabel = (gender?: "L" | "P"): string =>
  gender === "L" ? "Laki-laki" : gender === "P" ? "Perempuan" : "-";

const DEFAULT_SUBJECTS = [
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "IPA",
  "IPS",
  "Agama",
];

/* ================= Components kecil ================= */
const PageHeader = ({
  theme,
  onImportClick,
  onAddClick,
}: {
  theme: Palette;
  onImportClick: () => void;
  onAddClick: () => void;
}) => (
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
        onClick={onImportClick}
        className="flex items-center gap-1.5 text-xs sm:text-sm"
        size="sm"
        palette={theme}
      >
        <Upload size={14} />
        <span className="hidden sm:inline">Import CSV</span>
        <span className="sm:hidden">Import</span>
      </Btn>

      <Btn
        variant="default"
        className="flex items-center gap-1.5 text-xs sm:text-sm"
        size="sm"
        palette={theme}
        onClick={onAddClick}
      >
        <UserPlus size={14} />
        <span className="hidden sm:inline">Tambah Guru</span>
        <span className="sm:hidden">Tambah</span>
      </Btn>
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex gap-2 flex-1">
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
  <tr className="border-t" style={{ borderColor: theme.white3 }}>
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
    {/* Desktop Table View */}
    <div className="overflow-auto">
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
          {!isLoading &&
            !isError &&
            teachers.map((t) => (
              <TeacherTableRow key={t.id} teacher={t} theme={theme} />
            ))}
        </tbody>
      </table>
    </div>

    <div
      className="p-3 sm:mt-3 text-xs flex items-center justify-between border-t"
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

  // Modal
  const [openAdd, setOpenAdd] = useState(false);
  const [openImport, setOpenImport] = useState(false);

  // Filter states
  const [q, setQ] = useState("");
  const [mapel, setMapel] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<TeacherStatus | "semua">("semua");

  // Current user → ambil masjidId
  const { user } = useCurrentUser();
  const masjidId = useMemo(() => {
    const u: any = user || {};
    return (
      u.masjid_id ||
      u.lembaga_id ||
      u.mosque_id ||
      u?.masjid?.id ||
      u?.lembaga?.id ||
      (Array.isArray(u?.masjid_teacher_ids) && u.masjid_teacher_ids[0]) ||
      ""
    );
  }, [user]);

  // Fetch: /api/a/masjid-teachers/by-masjid
  const {
    data: resp,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["masjid-teachers", masjidId],
    enabled: !!masjidId, // tunggu masjidId siap
    staleTime: 2 * 60 * 1000,
    queryFn: async (): Promise<TeachersByMasjidResponse> => {
      const res = await axios.get("/api/a/masjid-teachers/by-masjid", {
        params: masjidId ? { masjid_id: masjidId } : undefined,
      });
      return res.data;
    },
  });

  // Mapping & filter lokal
  const teachersRaw = resp?.data?.teachers ?? [];
  const teachersAll: TeacherItem[] = useMemo(
    () =>
      teachersRaw.map((t) => ({
        id: t.masjid_teachers_id,
        name: t.user_name,
        status: "aktif", // default sampai endpoint kirim status
      })),
    [teachersRaw]
  );

  const teachers = useMemo(() => {
    let list = teachersAll;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(needle) ||
          (t.nip ?? "").toLowerCase().includes(needle) ||
          (t.email ?? "").toLowerCase().includes(needle)
      );
    }
    if (status !== "semua") {
      list = list.filter((t) => t.status === status);
    }
    // mapel filter di-skip sementara (subject belum ada di API ini)
    return list;
  }, [teachersAll, q, status]);

  const subjects = DEFAULT_SUBJECTS; // placeholder sampai backend kirim subjects

  // Stats
  const stats: TeacherStats = useMemo(() => {
    const total = resp?.data?.total ?? teachersAll.length;
    const aktif = teachers.filter((t) => t.status === "aktif").length;
    // gender belum tersedia → 0 (atau hitung jika nanti ada)
    const L = teachers.filter((t) => t.gender === "L").length;
    const P = teachers.filter((t) => t.gender === "P").length;
    return { total, L, P, aktif };
  }, [resp, teachers, teachersAll]);

  return (
    <>
      <TambahGuru
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        palette={theme}
        subjects={subjects}
        masjidId={masjidId}
        onCreated={() => refetch()}
      />
      <UploadFileGuru
        open={openImport}
        onClose={() => setOpenImport(false)}
        palette={theme}
      />

      <ParentTopBar palette={theme} title="Guru" />
      <div className="lg:flex lg:items-start lg:gap-4 lg:p-4 lg:pt-6">
        <SchoolSidebarNav palette={theme} className="hidden lg:block" />

        <main className="flex-1 mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">
          <PageHeader
            theme={theme}
            onImportClick={() => setOpenImport(true)}
            onAddClick={() => setOpenAdd(true)}
          />

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
            isLoading={isLoading && !!masjidId}
            isError={isError}
            isFetching={isFetching}
            onRefetch={refetch}
          />
        </main>
      </div>
    </>
  );
}
