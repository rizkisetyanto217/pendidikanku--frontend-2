/* ================= Imports ================= */
import { useState, useMemo } from "react";
import { useNavigate, NavLink, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "../../components/home/ParentSideBar";

import {
  UserPlus,
  ChevronRight,
  Upload,
  AlertTriangle,
  Mail,
  Phone,
  ArrowLeft,
} from "lucide-react";

import TambahGuru from "./components/AddTeacher";
import UploadFileGuru from "./components/UploadFileTeacher";

/* ================= Types ================= */
export interface TeacherItem {
  id: string;
  nip?: string;
  name: string;
  subject?: string;
  gender?: "L" | "P";
  phone?: string;
  email?: string;
}

type SchoolTeacherProps = {
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
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

const hijriWithWeekday = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/* ================= Dummy Data ================= */
const DUMMY_TEACHERS: TeacherItem[] = [
  {
    id: "1",
    nip: "19800101",
    name: "Ahmad Fauzi",
    subject: "Matematika",
    gender: "L",
    phone: "081234567890",
    email: "ahmad.fauzi@example.com",
  },
  {
    id: "2",
    nip: "19800202",
    name: "Siti Nurhaliza",
    subject: "Bahasa Indonesia",
    gender: "P",
    phone: "081298765432",
    email: "siti.nurhaliza@example.com",
  },
  {
    id: "3",
    nip: "19800303",
    name: "Budi Santoso",
    subject: "IPA",
    gender: "L",
    phone: "081377788899",
    email: "budi.santoso@example.com",
  },
  {
    id: "4",
    nip: "19800404",
    name: "Dewi Anggraini",
    subject: "Bahasa Inggris",
    gender: "P",
    phone: "081366655544",
    email: "dewi.anggraini@example.com",
  },
];

/* ================= Slug Hook ================= */
function useSchoolSlug() {
  const { slug } = useParams<{ slug: string }>();
  const makePath = (path: string) => `/${slug}/sekolah/${path}`;
  return { slug, makePath };
}

/* ================= Components ================= */
const PageHeader = ({
  palette,
  onImportClick,
  onAddClick,
  onBackClick,
  backLabel = "Kembali",
}: {
  palette: Palette;
  onImportClick: () => void;
  onAddClick: () => void;
  onBackClick?: () => void;
  backLabel?: string;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
    <div className="flex items-center gap-5">
      {onBackClick && (
        <Btn
          palette={palette}
          variant="ghost"
          onClick={onBackClick}
          className="flex items-center gap-1.5 mt-7 md:mt-0"
        >
          <ArrowLeft size={20} />
        </Btn>
      )}
      <h1 className="text-lg font-semibold">Guru</h1>
    </div>

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

function TeacherCardMobile({
  teacher,
  palette,
}: {
  teacher: TeacherItem;
  palette: Palette;
}) {
  const { makePath } = useSchoolSlug();

  return (
    <div
      key={teacher.id}
      className="border rounded-lg p-4 space-y-3"
      style={{ borderColor: palette.silver1 }}
    >
      <div className="font-medium">{teacher.name}</div>
      <div className="text-xs opacity-70">{teacher.subject ?? "-"}</div>

      <div className="text-sm space-y-1">
        <div>
          <span className="text-gray-600">NIP: </span>
          {teacher.nip ?? "-"}
        </div>
        <div>
          <span className="text-gray-600">Gender: </span>
          {genderLabel(teacher.gender)}
        </div>
        <div>
          <span className="text-gray-600">Kontak: </span>
          <div className="flex gap-3 mt-1">
            {teacher.phone && (
              <a
                href={`tel:${teacher.phone}`}
                className="flex items-center gap-1 text-sm hover:underline"
                style={{ color: palette.primary }}
              >
                <Phone size={14} /> {teacher.phone}
              </a>
            )}
            {teacher.email && (
              <a
                href={`mailto:${teacher.email}`}
                className="flex items-center gap-1 text-sm hover:underline"
                style={{ color: palette.primary }}
              >
                <Mail size={14} /> Email
              </a>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex gap-2 pt-2 border-t"
        style={{ borderColor: palette.silver1 }}
      >
        <NavLink
          to={makePath(`guru/${teacher.id}`)}
          className="underline text-sm"
          style={{ color: palette.primary }}
        >
          Detail
        </NavLink>
      </div>
    </div>
  );
}

const TeacherTableRow = ({
  teacher,
  palette,
}: {
  teacher: TeacherItem;
  palette: Palette;
}) => {
  const { makePath } = useSchoolSlug();

  return (
    <tr
      className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      style={{ borderColor: palette.silver1 }}
    >
      <td className="py-3 px-5">{teacher.nip ?? "-"}</td>
      <td className="py-3">
        <div className="font-medium">{teacher.name}</div>
        {teacher.email && (
          <div className="text-xs opacity-70">{teacher.email}</div>
        )}
      </td>
      <td className="py-3">{teacher.subject ?? "-"}</td>
      <td className="py-3">{genderLabel(teacher.gender)}</td>
      <td className="py-3">
        <div className="flex items-center gap-3 text-sm">
          {teacher.phone && (
            <a
              href={`tel:${teacher.phone}`}
              className="flex items-center gap-1 hover:underline"
              style={{ color: palette.primary }}
            >
              <Phone size={14} /> {teacher.phone}
            </a>
          )}
          {teacher.email && (
            <a
              href={`mailto:${teacher.email}`}
              className="flex items-center gap-1 hover:underline"
              style={{ color: palette.primary }}
            />
          )}
        </div>
      </td>
      <td className="py-3 text-right">
        <div className="flex items-center gap-2 justify-end mr-3">
          <NavLink to={makePath(`guru/${teacher.id}`)}>
            <Btn
              size="sm"
              palette={palette}
              variant="quaternary"
              className="flex items-center gap-1"
            >
              Detail <ChevronRight size={14} />
            </Btn>
          </NavLink>
        </div>
      </td>
    </tr>
  );
};

const TeachersTable = ({
  palette,
  teachers,
  isLoading,
  isError,
  isFetching,
  onRefetch,
}: {
  palette: Palette;
  teachers: TeacherItem[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  onRefetch: () => void;
}) => (
  <SectionCard palette={palette} className="p-0">
    {/* Mobile */}
    <div className="block md:hidden p-4 space-y-3">
      {isLoading && <div className="text-center text-sm">Memuat data…</div>}
      {isError && (
        <div
          className="text-center text-sm"
          style={{ color: palette.warning1 }}
        >
          <AlertTriangle size={16} className="inline mr-1" /> Terjadi kesalahan.{" "}
          <button className="underline" onClick={onRefetch}>
            Coba lagi
          </button>
        </div>
      )}
      {!isLoading && !isError && teachers.length === 0 && (
        <div className="text-center text-sm opacity-70">
          Belum ada data guru.
        </div>
      )}
      {!isLoading &&
        !isError &&
        teachers.map((t) => (
          <TeacherCardMobile key={t.id} teacher={t} palette={palette} />
        ))}
    </div>

    {/* Desktop */}
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-[800px] w-full text-sm">
        <thead>
          <tr
            className="text-left border-b"
            style={{ color: palette.silver2, borderColor: palette.silver1 }}
          >
            <th className="py-3 px-5">NIP</th>
            <th>Nama</th>
            <th>Mapel</th>
            <th>Gender</th>
            <th>Kontak</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={6} className="py-8 text-center opacity-70">
                Memuat data…
              </td>
            </tr>
          )}
          {isError && (
            <tr>
              <td
                colSpan={6}
                className="py-8 text-center"
                style={{ color: palette.warning1 }}
              >
                <AlertTriangle size={16} className="inline mr-1" /> Terjadi
                kesalahan.
              </td>
            </tr>
          )}
          {!isLoading && !isError && teachers.length === 0 && (
            <tr>
              <td colSpan={6} className="py-10 text-center opacity-70">
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
      className="p-3 text-xs flex items-center justify-between border-t"
      style={{ color: palette.silver2, borderColor: palette.silver1 }}
    >
      <div>
        {isFetching ? "Memuat ulang…" : `Menampilkan ${teachers.length} data`}
      </div>
      <button className="underline" onClick={onRefetch}>
        Refresh
      </button>
    </div>
  </SectionCard>
);

/* ================= Main Component ================= */
const TeachersPage: React.FC<SchoolTeacherProps> = ({ showBack = false }) => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  const [openAdd, setOpenAdd] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [q, setQ] = useState("");

  const { user } = useCurrentUser();
  const masjidId = useMemo(() => {
    const u: any = user || {};
    return u.masjid_id || u.lembaga_id || u?.masjid?.id || u?.lembaga?.id || "";
  }, [user]);

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
    queryFn: async () => {
      const res = await axios.get("/api/a/masjid-teachers/by-masjid", {
        params: masjidId ? { masjid_id: masjidId } : undefined,
      });
      return res.data;
    },
  });

  const teachersFromApi: TeacherItem[] =
    resp?.data?.teachers?.map((t: any) => ({
      id: t.masjid_teachers_id,
      nip: "N/A",
      name: t.user_name,
      subject: "Umum",
    })) ?? [];

  const teachersAll =
    teachersFromApi.length > 0 ? teachersFromApi : DUMMY_TEACHERS;

  const teachers = useMemo(() => {
    let list = teachersAll;
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(needle) ||
          (t.nip ?? "").toLowerCase().includes(needle) ||
          (t.email ?? "").toLowerCase().includes(needle)
      );
    }
    return list;
  }, [teachersAll, q]);

  return (
    <>
      <TambahGuru
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        palette={palette}
        subjects={DEFAULT_SUBJECTS}
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
        <main className="flex-1 mx-auto max-w-6xl px-3 sm:px-4 space-y-6">
          <PageHeader
            palette={palette}
            onImportClick={() => setOpenImport(true)}
            onAddClick={() => setOpenAdd(true)}
            onBackClick={showBack ? () => navigate(-1) : undefined}
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
