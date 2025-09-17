// src/pages/sekolahislamku/students/StudentsPage.tsx
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import axios from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import {
  Users,
  UserPlus,
  Search,
  Filter,
  ChevronRight,
  Upload,
  AlertTriangle,
  GraduationCap,
  Mail,
  Phone,
  ArrowLeft,
} from "lucide-react";

import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";

import TambahSiswa from "./modal/AddStudent";
// NOTE: pastikan komponen ini menerima props: { open, onClose, palette }
import UploadFileSiswa from "./modal/UploadFileStudent";
import ParentSidebar from "../../components/home/ParentSideBar";

/* ================= Types ================ */
export type StudentStatus = "aktif" | "nonaktif" | "alumni";

export interface StudentItem {
  id: string;
  nis?: string;
  name: string;
  class_name?: string; // contoh: "6A"
  gender?: "L" | "P";
  parent_name?: string;
  phone?: string;
  email?: string;
  status: StudentStatus;
}

/* =============== Helpers =============== */
const genderLabel = (g?: "L" | "P") =>
  g === "L" ? "Laki-laki" : g === "P" ? "Perempuan" : "-";

/* =============== Main Page =============== */
export default function StudentsPage() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  // === Modal states (mutually exclusive)
  const [openAdd, setOpenAdd] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);

  const openTambahSiswa = () => {
    setOpenUpload(false);
    setOpenAdd(true);
  };
  const openUploadCSV = () => {
    setOpenAdd(false);
    setOpenUpload(true);
  };
  const closeAllModals = () => {
    setOpenAdd(false);
    setOpenUpload(false);
  };

  // filters
  const [q, setQ] = useState("");
  const [kelas, setKelas] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<StudentStatus | "semua">("semua");

  // ====== Fetch students
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["students", { q, kelas, status }],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (q) params.q = q;
      if (kelas) params.class = kelas;
      if (status !== "semua") params.status = status;
      const res = await axios.get("/api/a/students", { params });
      return res.data as {
        list: StudentItem[];
        total: number;
        byGender?: { L?: number; P?: number };
        aktifCount?: number;
        classes?: string[];
      };
    },
  });

  const students = data?.list ?? [];
  const classes = data?.classes ?? ["1A", "1B", "2A", "2B", "3A", "3B"]; // fallback demo

  const stats = useMemo(() => {
    const total = data?.total ?? students.length;
    const L =
      data?.byGender?.L ?? students.filter((s) => s.gender === "L").length;
    const P =
      data?.byGender?.P ?? students.filter((s) => s.gender === "P").length;
    const aktif =
      data?.aktifCount ?? students.filter((s) => s.status === "aktif").length;
    return { total, L, P, aktif };
  }, [data, students]);

  return (
    <>
      {/* Modals (mutually exclusive) */}
      <TambahSiswa
        open={openAdd}
        onClose={closeAllModals}
        palette={palette}
        classes={classes}
      />
      <UploadFileSiswa
        open={openUpload}
        onClose={closeAllModals}
        palette={palette}
      />

      {/* Top navbar */}
      <ParentTopBar palette={palette} title="Siswa" />
      <div className="lg:flex lg:items-start lg:gap-4 lg:p-4 lg:pt-6">
        {/* Sidebar kiri */}
        <ParentSidebar palette={palette} className="hidden lg:block" />

        {/* Konten kanan */}
        <main className="flex-1 mx-auto max-w-6xl px-4 space-y-6 py-5 md:py-0">
          {/* Header + actions */}
          <div className="flex flex-col  items-start  flex-wrap gap-5">
            <div className="flex items-center gap-3">
              {/* Back button biasa */}
              <div className="mx-auto max-w-6xl ">
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2"
                >
                  <ArrowLeft size={20} />
                </Btn>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Btn
                variant="ghost"
                onClick={openUploadCSV}
                className="flex items-center gap-2"
                size="sm"
                palette={palette}
              >
                <Upload size={16} /> Import CSV
              </Btn>
              <Btn
                variant="default"
                className="flex items-center gap-2"
                size="sm"
                palette={palette}
                onClick={openTambahSiswa}
              >
                <UserPlus size={16} /> Tambah Siswa
              </Btn>
            </div>
          </div>

          {/* Statistic cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <SectionCard palette={palette} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: palette.black2 }}>
                    Total Siswa
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: palette.quaternary }}
                  >
                    {stats.total}
                  </p>
                </div>
                <GraduationCap />
              </div>
            </SectionCard>
            <SectionCard palette={palette} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: palette.black2 }}>
                    Aktif
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: palette.quaternary }}
                  >
                    {stats.aktif}
                  </p>
                </div>
                <Badge variant="success" palette={palette}>
                  OK
                </Badge>
              </div>
            </SectionCard>
            <SectionCard palette={palette} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: palette.black2 }}>
                    Laki-laki
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: palette.quaternary }}
                  >
                    {stats.L}
                  </p>
                </div>
                <Badge palette={palette}>L</Badge>
              </div>
            </SectionCard>
            <SectionCard palette={palette} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: palette.black2 }}>
                    Perempuan
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: palette.quaternary }}
                  >
                    {stats.P}
                  </p>
                </div>
                <Badge palette={palette}>P</Badge>
              </div>
            </SectionCard>
          </div>

          {/* Filters */}
          <SectionCard palette={palette} className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div
                className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2 border"
                style={{
                  borderColor: palette.white3,
                  background: palette.white1,
                }}
              >
                <Search size={16} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama, NIS, orang tua…"
                  className="w-full bg-transparent outline-none"
                  style={{ color: palette.quaternary }}
                />
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="rounded-xl border px-3 py-2"
                  style={{
                    borderColor: palette.white3,
                    background: palette.white1,
                    color: palette.quaternary,
                  }}
                >
                  <div className="text-xs" style={{ color: palette.black2 }}>
                    Kelas
                  </div>
                  <select
                    value={kelas ?? ""}
                    onChange={(e) => setKelas(e.target.value || undefined)}
                    className="bg-transparent outline-none"
                  >
                    <option value="">Semua</option>
                    {classes.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  className="rounded-xl border px-3 py-2"
                  style={{
                    borderColor: palette.white3,
                    background: palette.white1,
                    color: palette.quaternary,
                  }}
                >
                  <div className="text-xs" style={{ color: palette.black2 }}>
                    Status
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="bg-transparent outline-none"
                  >
                    <option value="semua">Semua</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>

                <Btn
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => refetch()}
                  palette={palette}
                >
                  <Filter size={16} /> Terapkan
                </Btn>
              </div>
            </div>
          </SectionCard>

          {/* Table */}
          <SectionCard palette={palette} className="p-2 md:p-4">
            <div className="overflow-auto">
              <table className="min-w-[800px] w-full">
                <thead>
                  <tr
                    className="text-left text-sm"
                    style={{ color: palette.secondary }}
                  >
                    <th className="py-3">NIS</th>
                    <th>Nama</th>
                    <th>Kelas</th>
                    <th>JK</th>
                    <th>Orang Tua</th>
                    <th>Kontak</th>
                    <th>Status</th>
                    <th className="text-right pr-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center"
                        style={{ color: palette.secondary }}
                      >
                        Memuat data…
                      </td>
                    </tr>
                  )}

                  {isError && (
                    <tr>
                      <td colSpan={8} className="py-8">
                        <div
                          className="flex items-center gap-2 justify-center text-sm"
                          style={{ color: palette.warning1 }}
                        >
                          <AlertTriangle size={16} /> Terjadi kesalahan.
                          <button
                            className="underline"
                            onClick={() => refetch()}
                          >
                            Coba lagi
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!isLoading && students.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-10 text-center"
                        style={{ color: palette.secondary }}
                      >
                        Belum ada data siswa.
                      </td>
                    </tr>
                  )}

                  {students.map((s) => (
                    <tr
                      key={s.id}
                      className="border-t"
                      style={{ borderColor: palette.white3 }}
                    >
                      <td className="py-3 align-top">
                        <div
                          className="font-medium"
                          style={{ color: palette.quaternary }}
                        >
                          {s.nis ?? "-"}
                        </div>
                      </td>
                      <td className="py-3 align-top">
                        <div
                          className="font-medium"
                          style={{ color: palette.quaternary }}
                        >
                          {s.name}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: palette.secondary }}
                        >
                          {s.email ?? ""}
                        </div>
                      </td>
                      <td
                        className="py-3 align-top"
                        style={{ color: palette.primary }}
                      >
                        {s.class_name ?? "-"}
                      </td>
                      <td
                        className="py-3 align-top"
                        style={{ color: palette.quaternary }}
                      >
                        {genderLabel(s.gender)}
                      </td>
                      <td className="py-3 align-top">
                        <div
                          className="text-sm"
                          style={{ color: palette.quaternary }}
                        >
                          {s.parent_name ?? "-"}
                        </div>
                      </td>
                      <td className="py-3 align-top">
                        <div
                          className="flex items-center gap-3 text-sm"
                          style={{ color: palette.quaternary }}
                        >
                          {s.phone && (
                            <a
                              href={`tel:${s.phone}`}
                              className="flex items-center gap-1 hover:underline"
                            >
                              <Phone size={14} /> {s.phone}
                            </a>
                          )}
                          {s.email && (
                            <a
                              href={`mailto:${s.email}`}
                              className="flex items-center gap-1 hover:underline"
                            >
                              <Mail size={14} /> {s.email}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 align-top">
                        {s.status === "aktif" && (
                          <Badge variant="success" palette={palette}>
                            Aktif
                          </Badge>
                        )}
                        {s.status === "nonaktif" && (
                          <Badge variant="warning" palette={palette}>
                            Nonaktif
                          </Badge>
                        )}
                        {s.status === "alumni" && (
                          <Badge variant="info" palette={palette}>
                            Alumni
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 align-top">
                        <div className="flex items-center gap-2 justify-end">
                          <NavLink to={`/sekolah/murid/${s.id}`}>
                            <Btn
                              size="sm"
                              palette={palette}
                              className="flex items-center gap-1"
                            >
                              Detail <ChevronRight size={14} />
                            </Btn>
                          </NavLink>
                          <NavLink to={`/sekolah/penilaian?siswa=${s.id}`}>
                            <Btn size="sm" palette={palette}>
                              Nilai
                            </Btn>
                          </NavLink>
                          <NavLink to={`/sekolah/absensi?siswa=${s.id}`}>
                            <Btn size="sm" palette={palette}>
                              Absensi
                            </Btn>
                          </NavLink>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer state */}
            <div
              className="mt-3 text-xs flex items-center justify-between"
              style={{ color: palette.secondary }}
            >
              <div>
                {isFetching
                  ? "Memuat ulang…"
                  : `Menampilkan ${students.length} data`}
              </div>
              <div className="flex items-center gap-2">
                <button className="underline" onClick={() => refetch()}>
                  Refresh
                </button>
              </div>
            </div>
          </SectionCard>
        </main>
      </div>
    </>
  );
}
