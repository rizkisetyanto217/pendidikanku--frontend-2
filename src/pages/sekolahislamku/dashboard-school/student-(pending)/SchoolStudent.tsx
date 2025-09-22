// src/pages/sekolahislamku/students/StudentsPage.tsx
/* ================= Imports ================= */
import { useState, useMemo } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "../../components/home/ParentSideBar";

import TambahSiswa from "./modal/AddStudent";
import UploadFileSiswa from "./modal/UploadFileStudent";

import {
  UserPlus,
  ChevronRight,
  Upload,
  AlertTriangle,
  Mail,
  Phone,
  ArrowLeft,
} from "lucide-react";

/* ================= Types ================= */
export interface StudentItem {
  id: string;
  nis?: string;
  name: string;
  class_name?: string;
  gender?: "L" | "P";
  parent_name?: string;
  phone?: string;
  email?: string;
  status: "aktif" | "nonaktif" | "alumni";
}

/* ================= Helpers ================= */
const genderLabel = (g?: "L" | "P") =>
  g === "L" ? "Laki-laki" : g === "P" ? "Perempuan" : "-";

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
const DUMMY_STUDENTS: StudentItem[] = [
  {
    id: "s1",
    nis: "202301",
    name: "Ahmad Fauzi",
    class_name: "1A",
    gender: "L",
    parent_name: "Bapak Fauzan",
    phone: "081234567890",
    email: "ahmad.fauzi@example.com",
    status: "aktif",
  },
  {
    id: "s2",
    nis: "202302",
    name: "Siti Nurhaliza",
    class_name: "1B",
    gender: "P",
    parent_name: "Ibu Rahma",
    phone: "081298765432",
    email: "siti.nurhaliza@example.com",
    status: "aktif",
  },
  {
    id: "s3",
    nis: "202303",
    name: "Budi Santoso",
    class_name: "2A",
    gender: "L",
    parent_name: "Pak Santoso",
    phone: "081377788899",
    email: "budi.santoso@example.com",
    status: "nonaktif",
  },
  // ... sisanya tetap sama
];

/* ================= UI Components ================= */
const PageHeader = ({
  palette,
  onImportClick,
  onAddClick,
  onBackClick,
}: {
  palette: Palette;
  onImportClick: () => void;
  onAddClick: () => void;
  onBackClick?: () => void;
}) => (
  <div className="flex items-center justify-between gap-3 pb-4">
    <div className="flex items-center gap-3">
      {onBackClick && (
        <Btn palette={palette} variant="ghost" onClick={onBackClick}>
          <ArrowLeft size={20} />
        </Btn>
      )}
      <h1 className="font-semibold text-lg">Data Siswa</h1>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      <Btn
        onClick={onImportClick}
        size="sm"
        palette={palette}
        variant="outline"
        className="flex items-center gap-1.5 text-xs sm:text-sm"
      >
        <Upload size={14} />{" "}
        <span className="hidden sm:inline">Import CSV</span>
      </Btn>
      <Btn
        onClick={onAddClick}
        size="sm"
        palette={palette}
        variant="default"
        className="flex items-center gap-1.5 text-xs sm:text-sm"
      >
        <UserPlus size={14} />{" "}
        <span className="hidden sm:inline">Tambah Siswa</span>
      </Btn>
    </div>
  </div>
);

function StudentCardMobile({
  s,
  palette,
}: {
  s: StudentItem;
  palette: Palette;
}) {
  return (
    <div
      key={s.id}
      className="border rounded-lg p-4 space-y-2"
      style={{ borderColor: palette.silver1 }}
    >
      <div className="font-medium">{s.name}</div>
      <div className="text-xs opacity-70">{s.class_name ?? "-"}</div>
      <div className="text-sm">NIS: {s.nis ?? "-"}</div>
      <div className="text-sm">JK: {genderLabel(s.gender)}</div>
      <div className="text-sm">Orang Tua: {s.parent_name ?? "-"}</div>
      <div className="flex gap-3 text-sm">
        {s.phone && (
          <a
            href={`tel:${s.phone}`}
            className="flex items-center gap-1 hover:underline"
            style={{ color: palette.primary }}
          >
            <Phone size={14} /> {s.phone}
          </a>
        )}
        {s.email && (
          <a
            href={`mailto:${s.email}`}
            className="flex items-center gap-1 hover:underline"
            style={{ color: palette.primary }}
          >
            <Mail size={14} /> Email
          </a>
        )}
      </div>
      <div>
        <Badge
          palette={palette}
          variant={
            s.status === "aktif"
              ? "success"
              : s.status === "nonaktif"
                ? "warning"
                : "info"
          }
        >
          {s.status}
        </Badge>
      </div>
      <div
        className="flex gap-2 pt-2 border-t text-sm"
        style={{ borderColor: palette.silver1 }}
      >
        <NavLink
          to={`/sekolah/murid/${s.id}`}
          className="underline text-xs"
          style={{ color: palette.primary }}
        >
          Detail
        </NavLink>
        <NavLink
          to={`/sekolah/penilaian?siswa=${s.id}`}
          className="underline"
          style={{ color: palette.primary }}
        >
          Nilai
        </NavLink>
        <NavLink
          to={`/sekolah/absensi?siswa=${s.id}`}
          className="underline"
          style={{ color: palette.primary }}
        >
          Absensi
        </NavLink>
      </div>
    </div>
  );
}

const StudentTableRow = ({
  s,
  palette,
}: {
  s: StudentItem;
  palette: Palette;
}) => (
  <tr
    className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
    style={{ borderColor: palette.silver1 }}
  >
    <td className="py-3 px-5">{s.nis ?? "-"}</td>
    <td className="py-3">
      <div className="font-medium">{s.name}</div>
      {s.email && <div className="text-xs opacity-70">{s.email}</div>}
    </td>
    <td>{s.class_name ?? "-"}</td>
    <td>{genderLabel(s.gender)}</td>
    <td>{s.parent_name ?? "-"}</td>
    <td>
      <div className="flex gap-3 text-sm">
        {s.phone && (
          <a
            href={`tel:${s.phone}`}
            className="hover:underline flex items-center gap-1"
            style={{ color: palette.primary }}
          >
            <Phone size={14} /> {s.phone}
          </a>
        )}
        {s.email && (
          <a
            href={`mailto:${s.email}`}
            className="hover:underline flex items-center gap-1"
            style={{ color: palette.primary }}
          >
            {/* <Mail size={14} /> Email */}
          </a>
        )}
      </div>
    </td>
    <td>
      <Badge
        palette={palette}
        variant={
          s.status === "aktif"
            ? "success"
            : s.status === "nonaktif"
              ? "warning"
              : "info"
        }
      >
        {s.status}
      </Badge>
    </td>
    <td className="text-right">
      <div className="flex gap-2 justify-end">
        <NavLink to={`/sekolah/murid/${s.id}`}>
          <Btn
            size="sm"
            palette={palette}
            variant="quaternary"
            className="flex items-center gap-1 text-xs mr-2"
          >
            Detail <ChevronRight size={14} />
          </Btn>
        </NavLink>
      </div>
    </td>
  </tr>
);

const StudentsTable = ({
  palette,
  students,
  isLoading,
  isError,
  isFetching,
  onRefetch,
}: {
  palette: Palette;
  students: StudentItem[];
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
          <AlertTriangle size={16} className="inline mr-1" /> Terjadi kesalahan.
          <button className="underline ml-1" onClick={onRefetch}>
            Coba lagi
          </button>
        </div>
      )}
      {!isLoading && !isError && students.length === 0 && (
        <div className="text-center text-sm opacity-70">
          Belum ada data siswa.
        </div>
      )}
      {!isLoading &&
        !isError &&
        students.map((s) => (
          <StudentCardMobile key={s.id} s={s} palette={palette} />
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
            <th className="py-3 px-5">NIS</th>
            <th>Nama</th>
            <th>Kelas</th>
            <th>JK</th>
            <th>Orang Tua</th>
            <th>Kontak</th>
            <th>Status</th>
            <th className="text-right pr-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={8} className="py-8 text-center">
                Memuat data…
              </td>
            </tr>
          )}
          {isError && students.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="py-8 text-center"
                style={{ color: palette.warning1 }}
              >
                <AlertTriangle size={16} className="inline mr-1" /> Terjadi
                kesalahan.
              </td>
            </tr>
          )}

          {!isLoading && !isError && students.length === 0 && (
            <tr>
              <td colSpan={8} className="py-10 text-center opacity-70">
                Belum ada data siswa.
              </td>
            </tr>
          )}
          {!isLoading &&
            !isError &&
            students.map((s) => (
              <StudentTableRow key={s.id} s={s} palette={palette} />
            ))}
        </tbody>
      </table>
    </div>

    <div
      className="p-3 text-xs flex justify-between border-t"
      style={{ color: palette.silver2, borderColor: palette.silver1 }}
    >
      <div>
        {isFetching ? "Memuat ulang…" : `Menampilkan ${students.length} data`}
      </div>
      <button className="underline" onClick={onRefetch}>
        Refresh
      </button>
    </div>
  </SectionCard>
);

/* ================= Main Component ================= */
const StudentsPage: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  const [openAdd, setOpenAdd] = useState(false);
  const [openImport, setOpenImport] = useState(false);

  const {
    data: resp,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await axios.get("/api/a/students");
      return res.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const studentsFromApi: StudentItem[] = useMemo(() => {
    if (!resp?.list || !Array.isArray(resp.list)) return [];
    return resp.list.map((s: any) => ({
      id: s.student_id || s.id || `temp-${Math.random()}`,
      nis: s.student_nis || s.nis,
      name: s.student_name || s.name || "Nama tidak tersedia",
      class_name: s.class_name || s.class,
      gender: s.gender,
      parent_name: s.parent_name,
      phone: s.phone,
      email: s.email,
      status: s.status || "aktif",
    }));
  }, [resp]);

  const students = useMemo(() => {
    if (isError || studentsFromApi.length === 0) return DUMMY_STUDENTS;
    return studentsFromApi;
  }, [studentsFromApi, isError]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Modals */}
      <TambahSiswa
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        palette={palette}
        classes={["1A", "1B", "2A"]}
      />
      <UploadFileSiswa
        open={openImport}
        onClose={() => setOpenImport(false)}
        palette={palette}
      />

      {/* Topbar */}
      <ParentTopBar
        palette={palette}
        title="Siswa"
        hijriDate={hijriWithWeekday(new Date().toISOString())}
      />

      {/* Layout */}
      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Content */}
          <section className="flex-1 flex flex-col space-y-6 min-w-0">
            <PageHeader
              palette={palette}
              onImportClick={() => setOpenImport(true)}
              onAddClick={() => setOpenAdd(true)}
              onBackClick={() => navigate(-1)}
            />
            <StudentsTable
              palette={palette}
              students={students}
              isLoading={false}
              isError={false}
              isFetching={false}
              onRefetch={refetch}
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentsPage;
