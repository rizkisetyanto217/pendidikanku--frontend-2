// src/pages/sekolahislamku/teachers/TeachersPage.tsx
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import axios from "@/lib/axios";

import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import SchoolSidebarNav from "@/pages/sekolahislamku/components/home/SchoolSideBarNav";
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
} from "lucide-react";

/* ================= Types ================ */
export type TeacherStatus = "aktif" | "nonaktif" | "alumni";

export interface TeacherItem {
  id: string;
  nip?: string; // or employee ID
  name: string;
  subject?: string; // mapel / bidang ajar
  gender?: "L" | "P";
  phone?: string;
  email?: string;
  status: TeacherStatus;
}

/* =============== Helpers =============== */
const genderLabel = (g?: "L" | "P") =>
  g === "L" ? "Laki-laki" : g === "P" ? "Perempuan" : "-";

/* =============== Main Page =============== */
export default function StudentTeacher() {
  const { isDark } = useHtmlDarkMode();
  const theme: Palette = isDark ? colors.dark : colors.light;

  // filters
  const [q, setQ] = useState("");
  const [mapel, setMapel] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<TeacherStatus | "semua">("semua");

  // ====== Fetch teachers
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["teachers", { q, mapel, status }],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (q) params.q = q; // nama, NIP, email
      if (mapel) params.subject = mapel;
      if (status !== "semua") params.status = status;
      const res = await axios.get("/api/a/teachers", { params });
      return res.data as {
        list: TeacherItem[];
        total: number;
        byGender?: { L?: number; P?: number };
        aktifCount?: number;
        subjects?: string[]; // optional from backend
      };
    },
  });

  const teachers = data?.list ?? [];
  const subjects = data?.subjects ?? [
    "Matematika",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "IPA",
    "IPS",
    "Agama",
  ]; // fallback demo

  const stats = useMemo(() => {
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
      {/* Top navbar */}
      <ParentTopBar palette={theme} title="Guru" />

      <div className="lg:flex lg:items-start lg:gap-4 lg:p-4 lg:pt-6">
        {/* Sidebar kiri */}
        <SchoolSidebarNav palette={theme} className="hidden lg:block" />

        {/* Konten kanan */}
        <main className="flex-1 mx-auto max-w-6xl px-4 py-6 space-y-5">
          {/* Header + actions */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: theme.white3, color: theme.quaternary }}
              >
                <UserCog size={20} />
              </div>
              <div>
                <h1
                  className="text-xl font-semibold"
                  style={{ color: theme.quaternary }}
                >
                  Guru
                </h1>
                <p className="text-sm" style={{ color: theme.secondary }}>
                  Kelola data pengajar, filter, dan tindakan cepat.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Btn
                onClick={() => console.log("IMPORT CSV Guru clicked")}
                className="flex items-center gap-2"
                size="sm"
                palette={theme}
              >
                <Upload size={16} /> Import CSV
              </Btn>
              <NavLink to="/sekolah/guru/tambah">
                <Btn
                  variant="default"
                  className="flex items-center gap-2"
                  size="sm"
                  palette={theme}
                >
                  <UserPlus size={16} /> Tambah Guru
                </Btn>
              </NavLink>
            </div>
          </div>

          {/* Statistic cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <SectionCard palette={theme} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: theme.secondary }}>
                    Total Guru
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: theme.quaternary }}
                  >
                    {stats.total}
                  </p>
                </div>
                <Briefcase />
              </div>
            </SectionCard>
            <SectionCard palette={theme} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: theme.secondary }}>
                    Aktif
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: theme.quaternary }}
                  >
                    {stats.aktif}
                  </p>
                </div>
                <Badge variant="success" palette={theme}>
                  OK
                </Badge>
              </div>
            </SectionCard>
            <SectionCard palette={theme} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: theme.secondary }}>
                    Laki-laki
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: theme.quaternary }}
                  >
                    {stats.L}
                  </p>
                </div>
                <Badge palette={theme}>L</Badge>
              </div>
            </SectionCard>
            <SectionCard palette={theme} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: theme.secondary }}>
                    Perempuan
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: theme.quaternary }}
                  >
                    {stats.P}
                  </p>
                </div>
                <Badge palette={theme}>P</Badge>
              </div>
            </SectionCard>
          </div>

          {/* Filters */}
          <SectionCard palette={theme} className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div
                className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2 border"
                style={{ borderColor: theme.white3, background: theme.white1 }}
              >
                <Search size={16} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama, NIP, email…"
                  className="w-full bg-transparent outline-none"
                  style={{ color: theme.quaternary }}
                />
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="rounded-xl border px-3 py-2"
                  style={{
                    borderColor: theme.white3,
                    background: theme.white1,
                    color: theme.quaternary,
                  }}
                >
                  <div className="text-xs" style={{ color: theme.secondary }}>
                    Mapel
                  </div>
                  <select
                    value={mapel ?? ""}
                    onChange={(e) => setMapel(e.target.value || undefined)}
                    className="bg-transparent outline-none"
                  >
                    <option value="">Semua</option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  className="rounded-xl border px-3 py-2"
                  style={{
                    borderColor: theme.white3,
                    background: theme.white1,
                    color: theme.quaternary,
                  }}
                >
                  <div className="text-xs" style={{ color: theme.secondary }}>
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
                  palette={theme}
                >
                  <Filter size={16} /> Terapkan
                </Btn>
              </div>
            </div>
          </SectionCard>

          {/* Table */}
          <SectionCard palette={theme} className="p-2 md:p-4">
            <div className="overflow-auto">
              <table className="min-w-[800px] w-full">
                <thead>
                  <tr
                    className="text-left text-sm"
                    style={{ color: theme.secondary }}
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

                  {!isLoading && teachers.length === 0 && (
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

                  {teachers.map((t) => (
                    <tr
                      key={t.id}
                      className="border-t"
                      style={{ borderColor: theme.white3 }}
                    >
                      <td className="py-3 align-top">
                        <div
                          className="font-medium"
                          style={{ color: theme.quaternary }}
                        >
                          {t.nip ?? "-"}
                        </div>
                      </td>
                      <td className="py-3 align-top">
                        <div
                          className="font-medium"
                          style={{ color: theme.quaternary }}
                        >
                          {t.name}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: theme.secondary }}
                        >
                          {t.email ?? ""}
                        </div>
                      </td>
                      <td
                        className="py-3 align-top"
                        style={{ color: theme.primary }}
                      >
                        {t.subject ?? "-"}
                      </td>
                      <td
                        className="py-3 align-top"
                        style={{ color: theme.quaternary }}
                      >
                        {genderLabel(t.gender)}
                      </td>
                      <td className="py-3 align-top">
                        <div
                          className="flex items-center gap-3 text-sm"
                          style={{ color: theme.quaternary }}
                        >
                          {t.phone && (
                            <a
                              href={`tel:${t.phone}`}
                              className="flex items-center gap-1 hover:underline"
                            >
                              <Phone size={14} /> {t.phone}
                            </a>
                          )}
                          {t.email && (
                            <a
                              href={`mailto:${t.email}`}
                              className="flex items-center gap-1 hover:underline"
                            >
                              <Mail size={14} /> {t.email}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 align-top">
                        {t.status === "aktif" && (
                          <Badge variant="success" palette={theme}>
                            Aktif
                          </Badge>
                        )}
                        {t.status === "nonaktif" && (
                          <Badge variant="warning" palette={theme}>
                            Nonaktif
                          </Badge>
                        )}
                        {t.status === "alumni" && (
                          <Badge variant="info" palette={theme}>
                            Alumni
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 align-top">
                        <div className="flex items-center gap-2 justify-end">
                          <NavLink to={`/sekolah/guru/${t.id}`}>
                            <Btn
                              size="sm"
                              palette={theme}
                              className="flex items-center gap-1"
                            >
                              Detail <ChevronRight size={14} />
                            </Btn>
                          </NavLink>
                          <NavLink to={`/sekolah/absensi?guru=${t.id}`}>
                            <Btn size="sm" palette={theme}>
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
              style={{ color: theme.secondary }}
            >
              <div>
                {isFetching
                  ? "Memuat ulang…"
                  : `Menampilkan ${teachers.length} data`}
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
