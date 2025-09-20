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
  {
    id: "s4",
    nis: "202304",
    name: "Fatimah Az-Zahra",
    class_name: "1A",
    gender: "P",
    parent_name: "Ibu Khadijah",
    phone: "081455566677",
    email: "fatimah.azzahra@example.com",
    status: "aktif",
  },
  {
    id: "s5",
    nis: "202305",
    name: "Muhammad Rizki",
    class_name: "2B",
    gender: "L",
    parent_name: "Pak Abdullah",
    phone: "081533344455",
    email: "muhammad.rizki@example.com",
    status: "aktif",
  },
  {
    id: "s6",
    nis: "202306",
    name: "Aisyah Putri",
    class_name: "3A",
    gender: "P",
    parent_name: "Ibu Maryam",
    phone: "081611122233",
    email: "aisyah.putri@example.com",
    status: "aktif",
  },
  {
    id: "s7",
    nis: "202307",
    name: "Omar Al-Faruq",
    class_name: "3B",
    gender: "L",
    parent_name: "Pak Usman",
    phone: "081799988877",
    email: "omar.alfaruq@example.com",
    status: "alumni",
  },
  {
    id: "s8",
    nis: "202308",
    name: "Zainab Husna",
    class_name: "2A",
    gender: "P",
    parent_name: "Ibu Aminah",
    phone: "081844455566",
    email: "zainab.husna@example.com",
    status: "aktif",
  },
  {
    id: "s9",
    nis: "202309",
    name: "Ali bin Abi Thalib",
    class_name: "1B",
    gender: "L",
    parent_name: "Pak Hamza",
    phone: "081922233344",
    email: "ali.thalib@example.com",
    status: "nonaktif",
  },
  {
    id: "s10",
    nis: "202310",
    name: "Khadijah Binti Khuwailid",
    class_name: "3A",
    gender: "P",
    parent_name: "Ibu Safiyyah",
    phone: "081077788899",
    email: "khadijah.khuwailid@example.com",
    status: "aktif",
  },
  {
    id: "s11",
    nis: "202311",
    name: "Hamza Al-Qadri",
    class_name: "2B",
    gender: "L",
    parent_name: "Pak Bilal",
    phone: "081155566677",
    email: "hamza.qadri@example.com",
    status: "aktif",
  },
  {
    id: "s12",
    nis: "202312",
    name: "Ruqayyah Zahra",
    class_name: "1A",
    gender: "P",
    parent_name: "Ibu Hajar",
    phone: "081233344455",
    email: "ruqayyah.zahra@example.com",
    status: "alumni",
  },
  {
    id: "s13",
    nis: "202313",
    name: "Khalid Ibn Walid",
    class_name: "3B",
    gender: "L",
    parent_name: "Pak Sa'ad",
    phone: "081311122233",
    email: "khalid.walid@example.com",
    status: "aktif",
  },
  {
    id: "s14",
    nis: "202314",
    name: "Ummu Salamah",
    class_name: "2A",
    gender: "P",
    parent_name: "Ibu Zubaidah",
    phone: "081499988877",
    email: "ummu.salamah@example.com",
    status: "aktif",
  },
  {
    id: "s15",
    nis: "202315",
    name: "Salman Al-Farisi",
    class_name: "1B",
    gender: "L",
    parent_name: "Pak Suhaib",
    phone: "081577788899",
    email: "salman.farisi@example.com",
    status: "nonaktif",
  },
  {
    id: "s16",
    nis: "202316",
    name: "Hafshah Binti Umar",
    class_name: "3A",
    gender: "P",
    parent_name: "Ibu Umm Habibah",
    phone: "081655566677",
    email: "hafshah.umar@example.com",
    status: "aktif",
  },
  {
    id: "s17",
    nis: "202317",
    name: "Usman Ibn Affan",
    class_name: "2B",
    gender: "L",
    parent_name: "Pak Anas",
    phone: "081733344455",
    email: "usman.affan@example.com",
    status: "aktif",
  },
  {
    id: "s18",
    nis: "202318",
    name: "Sawdah Binti Zam'ah",
    class_name: "1A",
    gender: "P",
    parent_name: "Ibu Juwairiyah",
    phone: "081811122233",
    email: "sawdah.zamah@example.com",
    status: "alumni",
  },
  
];

/* ================= Components ================= */
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
  <div className="flex justify-between items-center mb-6 md:mb-10">
    <div className="flex items-center gap-3">
      {onBackClick && (
        <Btn
          palette={palette}
          variant="ghost"
          onClick={onBackClick}
          className="flex items-center gap-1 mt-7 md:mt-0"
        >
          <ArrowLeft size={20} />
        </Btn>
      )}
    </div>
    <div className="flex items-center gap-2 flex-wrap mt-3 md:mt-0">
      <Btn
        onClick={onImportClick}
        className="flex items-center gap-1.5 text-xs sm:text-sm"
        size="sm"
        palette={palette}
        variant="outline"
      >
        <Upload size={14} />{" "}
        <span className="hidden sm:inline">Import CSV</span>
      </Btn>
      <Btn
        variant="default"
        className="flex items-center gap-1.5 text-xs sm:text-sm"
        size="sm"
        palette={palette}
        onClick={onAddClick}
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
    className="border-t hover:bg-black/5 dark:hover:bg-white/5"
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
    {/* Mobile: Card View */}
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

    {/* Desktop: Table View */}
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
            {/* <th className="text-right pr-3">Aksi</th> */}
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
          {isError && (
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
              <td colSpan={8} className="py-10 text-center">
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
    // Tambahkan error handling dan retry
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
      // email: s.email,
      status: s.status || "aktif",
    }));
  }, [resp]);

  // Selalu gunakan dummy data jika tidak ada data dari API atau jika terjadi error
  const students = useMemo(() => {
    if (isError || studentsFromApi.length === 0) {
      return DUMMY_STUDENTS;
    }
    return studentsFromApi;
  }, [studentsFromApi, isError]);

  return (
    <>
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

      <ParentTopBar
        palette={palette}
        title="Siswa"
        hijriDate={hijriWithWeekday(new Date().toISOString())}
      />
      <div className="lg:flex lg:gap-4 lg:p-4 lg:pt-6">
        <ParentSidebar palette={palette} className="hidden lg:block" />
        <main className="flex-1 max-w-6xl mx-auto space-y-6 px-3 sm:px-4">
          <PageHeader
            palette={palette}
            onImportClick={() => setOpenImport(true)}
            onAddClick={() => setOpenAdd(true)}
            onBackClick={() => navigate(-1)}
          />
          <StudentsTable
            palette={palette}
            students={students}
            isLoading={false} // Set ke false agar langsung menampilkan dummy data
            isError={false} // Set ke false agar tidak menampilkan error
            isFetching={isFetching}
            onRefetch={refetch}
          />
        </main>
      </div>
    </>
  );
};

export default StudentsPage;
