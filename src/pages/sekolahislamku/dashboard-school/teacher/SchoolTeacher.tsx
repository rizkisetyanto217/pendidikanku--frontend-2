import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";

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
  ArrowLeft,
} from "lucide-react";
import TambahGuru from "./components/AddTeacher";
import UploadFileGuru from "./components/UploadFileTeacher";
import ParentSidebar from "../../components/home/ParentSideBar";

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
  status: TeacherStatus; // default "aktif"
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

type SchoolTeacherProps = {
  showBack?: boolean; // default: false
  backTo?: string; // optional: kalau diisi, navigate ke path ini, kalau tidak pakai nav(-1)
  backLabel?: string; // teks tombol
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

// --- timezone-safe helpers (pakai “siang lokal”)
const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};
// const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();
const hijriWithWeekday = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/* ================= Components kecil ================= */
const PageHeader = ({
  palette,
  onImportClick,
  onAddClick,
  onBackClick, // NEW
  backLabel = "Kembali", // NEW
}: {
  palette: Palette;
  onImportClick: () => void;
  onAddClick: () => void;
  onBackClick?: () => void;
  backLabel?: string;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
    {/* Kiri: Back + Title */}
    <div className="flex items-center gap-3">
      {onBackClick && (
        <Btn
          palette={palette}
          variant="ghost"
          onClick={onBackClick}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline"></span>
        </Btn>
      )}
      <div className="min-w-0 flex-1">
        <h1
          className="text-lg sm:text-xl font-semibold truncate"
          style={{ color: palette.black1 }}
        >
          Guru
        </h1>
        <p
          className="text-xs sm:text-sm line-clamp-1"
          style={{ color: palette.black2 }}
        >
          Kelola data pengajar, filter, dan tindakan cepat.
        </p>
      </div>
    </div>

    {/* Kanan: Action buttons */}
    <div className="flex items-center gap-2 flex-wrap">
      <Btn
        onClick={onImportClick}
        className="flex items-center gap-1.5 text-xs sm:text-sm"
        size="sm"
        palette={palette}
        variant="outline"
      >
        <Upload size={14} />
        <span className="hidden sm:inline">Import CSV</span>
        <span className="sm:hidden">Import</span>
      </Btn>

      <Btn
        variant="default"
        className="flex items-center gap-1.5 text-xs sm:text-sm"
        size="sm"
        palette={palette}
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
  palette,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  palette: Palette;
}) => (
  <SectionCard palette={palette} className="p-3 sm:p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs sm:text-sm" style={{ color: palette.silver2 }}>
          {title}
        </p>
        <p
          className="text-lg sm:text-2xl font-semibold"
          style={{ color: palette.black1 }}
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
  palette,
}: {
  stats: TeacherStats;
  palette: Palette;
}) => (
  <div
    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3"
    style={{ color: palette.black1 }}
  >
    <StatCard
      title="Total Guru"
      value={stats.total}
      icon={<Briefcase size={18} />}
      palette={palette}
    />
    <StatCard
      title="Aktif"
      value={stats.aktif}
      icon={
        <Badge variant="success" palette={palette} className="text-xs px-2">
          OK
        </Badge>
      }
      palette={palette}
    />
    <StatCard
      title="Laki-laki"
      value={stats.L}
      icon={
        <Badge palette={palette} className="text-xs px-2">
          L
        </Badge>
      }
      palette={palette}
    />
    <StatCard
      title="Perempuan"
      value={stats.P}
      icon={
        <Badge palette={palette} className="text-xs px-2">
          P
        </Badge>
      }
      palette={palette}
    />
  </div>
);

interface FiltersProps {
  palette: Palette;
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
  palette,
  q,
  setQ,
  mapel,
  setMapel,
  status,
  setStatus,
  subjects,
  onApply,
}: FiltersProps) => (
  <SectionCard palette={palette} className="p-3 sm:p-4">
    <div className="space-y-3">
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2.5 sm:py-2 border"
        style={{ borderColor: palette.silver1, background: palette.white1 }}
      >
        <Search
          size={16}
          className="flex-shrink-0"
          style={{ color: palette.silver2 }}
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama, NIP, email…"
          className="w-full bg-transparent outline-none text-sm"
          style={{ color: palette.black1 }}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex gap-2 flex-1">
          <div
            className="flex-1 sm:flex-none rounded-xl border px-3 py-2"
            style={{
              borderColor: palette.silver1,
              background: palette.white1,
              color: palette.black1,
            }}
          >
            <div className="text-xs mb-1" style={{ color: palette.silver2 }}>
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
              borderColor: palette.silver1,
              background: palette.white1,
              color: palette.black1,
            }}
          >
            <div className="text-xs mb-1" style={{ color: palette.silver2 }}>
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
          palette={palette}
        >
          <Filter size={16} /> Terapkan
        </Btn>
      </div>
    </div>
  </SectionCard>
);

const TeacherTableRow = ({
  teacher,
  palette,
}: {
  teacher: TeacherItem;
  palette: Palette;
}) => (
  <tr
    className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
    style={{ borderColor: palette.silver1 }}
  >
    <td className="py-3 align-top">
      <div className="font-medium" style={{ color: palette.black1 }}>
        {teacher.nip ?? "-"}
      </div>
    </td>
    <td className="py-3 align-top">
      <div className="font-medium" style={{ color: palette.black1 }}>
        {teacher.name}
      </div>
      {teacher.email && (
        <div className="text-xs" style={{ color: palette.silver2 }}>
          {teacher.email}
        </div>
      )}
    </td>
    <td className="py-3 align-top" style={{ color: palette.black1 }}>
      {teacher.subject ?? "-"}
    </td>
    <td className="py-3 align-top" style={{ color: palette.black1 }}>
      {genderLabel(teacher.gender)}
    </td>
    <td className="py-3 align-top">
      <div
        className="flex items-center gap-3 text-sm"
        style={{ color: palette.black1 }}
      >
        {teacher.phone && (
          <a
            href={`tel:${teacher.phone}`}
            className="flex items-center gap-1 hover:underline"
            title={`Telepon ${teacher.phone}`}
            style={{ color: palette.primary }}
          >
            <Phone size={14} /> {teacher.phone}
          </a>
        )}
        {teacher.email && (
          <a
            href={`mailto:${teacher.email}`}
            className="flex items-center gap-1 hover:underline"
            title={`Email ${teacher.email}`}
            style={{ color: palette.primary }}
          >
            <Mail size={14} /> Email
          </a>
        )}
      </div>
    </td>
    <td className="py-3 align-top">
      {teacher.status === "aktif" && (
        <Badge variant="success" palette={palette}>
          Aktif
        </Badge>
      )}
      {teacher.status === "nonaktif" && (
        <Badge variant="warning" palette={palette}>
          Nonaktif
        </Badge>
      )}
      {teacher.status === "alumni" && (
        <Badge variant="info" palette={palette}>
          Alumni
        </Badge>
      )}
    </td>
    <td className="py-3 align-top">
      <div className="flex items-center gap-2 justify-end">
        <NavLink to={`/sekolah/guru/${teacher.id}`}>
          <Btn
            size="sm"
            palette={palette}
            variant="quaternary"
            className="flex items-center gap-1"
          >
            Detail <ChevronRight size={14} />
          </Btn>
        </NavLink>
        <NavLink to={`/sekolah/absensi?guru=${teacher.id}`}>
          <Btn size="sm" palette={palette} variant="outline">
            Absensi
          </Btn>
        </NavLink>
      </div>
    </td>
  </tr>
);

interface TeachersTableProps {
  palette: Palette;
  teachers: TeacherItem[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  onRefetch: () => void;
}

const TeachersTable = ({
  palette,
  teachers,
  isLoading,
  isError,
  isFetching,
  onRefetch,
}: TeachersTableProps) => (
  <SectionCard palette={palette} className="p-0 sm:p-2 lg:p-4">
    {/* Desktop Table View */}
    <div className="overflow-auto">
      <table className="min-w-[800px] w-full">
        <thead>
          <tr
            className="text-left text-sm border-b"
            style={{ color: palette.silver2, borderColor: palette.silver1 }}
          >
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
                style={{ color: palette.silver2 }}
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
                  style={{ color: palette.warning1 }}
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
                style={{ color: palette.silver2 }}
              >
                Belum ada data guru.
              </td>
            </tr>
          )}
          {!isLoading &&
            !isError &&
            teachers.map((t) => (
              <TeacherTableRow key={t.id} teacher={t} palette={palette} />
            ))}
        </tbody>
      </table>
    </div>

    <div
      className="p-3 sm:mt-3 text-xs flex items-center justify-between border-t"
      style={{ color: palette.silver2, borderColor: palette.silver1 }}
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
const TeachersPage: React.FC<SchoolTeacherProps> = ({
  showBack = false,
  backTo,
  backLabel = "Kembali",
}) => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
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
    enabled: !!masjidId,
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
        status: "aktif", // default
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
    // mapel filter di-skip sementara
    return list;
  }, [teachersAll, q, status]);

  const subjects = DEFAULT_SUBJECTS;

  // Stats
  const stats: TeacherStats = useMemo(() => {
    const total = resp?.data?.total ?? teachersAll.length;
    const aktif = teachers.filter((t) => t.status === "aktif").length;
    const L = teachers.filter((t) => t.gender === "L").length;
    const P = teachers.filter((t) => t.gender === "P").length;
    return { total, L, P, aktif };
  }, [resp, teachers, teachersAll]);

  return (
    <>
      <TambahGuru
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        palette={palette}
        subjects={subjects}
        masjidId={masjidId}
        onCreated={() => refetch()}
      />
      <UploadFileGuru
        open={openImport}
        onClose={() => setOpenImport(false)}
        palette={palette}
      />

      <ParentTopBar
        palette={palette}
        title="Guru"
        hijriDate={hijriWithWeekday(new Date().toISOString())}
      />
      <div className="lg:flex lg:items-start lg:gap-4 lg:p-4 lg:pt-6">
        <ParentSidebar palette={palette} className="hidden lg:block" />

        <main className="flex-1 mx-auto max-w-6xl px-3 sm:px-4  sm:space-y-5">

           
          <PageHeader
            palette={palette}
            onImportClick={() => setOpenImport(true)}
            onAddClick={() => setOpenAdd(true)}
            onBackClick={
              showBack
                ? () => (backTo ? navigate(backTo) : navigate(-1))
                : undefined
            }
            backLabel={backLabel}
          />

          <StatsGrid stats={stats} palette={palette} />

          <FiltersSection
            palette={palette}
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
            palette={palette}
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
};
export default TeachersPage;
