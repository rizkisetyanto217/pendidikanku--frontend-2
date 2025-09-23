// src/pages/sekolahislamku/pages/academic/SchoolActiveClass.tsx
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// Theme & utils
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

// UI primitives & layout
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

// Icons
import {
  Users,
  GraduationCap,
  Filter as FilterIcon,
  RefreshCcw,
  ArrowLeft,
} from "lucide-react";

/* ============== Helpers ============== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";
const hijriLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";
const toLocalNoonISO = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x.toISOString();
};

/* ============== Types ============== */
type ClassRow = {
  id: string;
  name: string;
  academic_year: string;
  homeroom_teacher: string;
  student_count: number;
  status: "active" | "inactive";
};

type ApiActiveClassResp = {
  list: ClassRow[];
};

/* ============== Page ============== */
const SchoolActiveClass: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  const gregorianISO = toLocalNoonISO(new Date());

  // Query data (dummy)
  const classesQ = useQuery({
    queryKey: ["active-classes"],
    queryFn: async (): Promise<ApiActiveClassResp> => {
      // Ganti ke axios.get("/api/a/classes/active") nanti
      const dummy: ApiActiveClassResp = {
        list: Array.from({ length: 8 }).map((_, i) => ({
          id: `cls-${i + 1}`,
          name: `Kelas ${i + 1}${["A", "B"][i % 2]}`,
          academic_year: "2025/2026",
          homeroom_teacher: `Ustadz/Ustadzah ${i + 1}`,
          student_count: 25 + (i % 6),
          status: i % 5 === 0 ? "inactive" : "active",
        })),
      };
      return dummy;
    },
    staleTime: 60_000,
  });

  const rows = useMemo(() => classesQ.data?.list ?? [], [classesQ.data]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Kelas Aktif"
        gregorianDate={gregorianISO}
        hijriDate={hijriLong(gregorianISO)}
        dateFmt={dateLong}
        showBack={true}
      />

      <main className="w-full px-4 md:px-6  md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main */}

          <section className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Header */}

            <section className="md:flex hidden items-center gap-7 ">
              <span className="h-10 w-10 grid place-items-center rounded-xl rounded-t-none font-bold ">
                <Btn
                  onClick={() => navigate(-1)}
                  palette={palette}
                  variant="ghost"
                >
                  <ArrowLeft size={20} className="cursor-pointer" />
                </Btn>
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold">Daftar Kelas Aktif</div>
              </div>
            </section>

            {/* Table */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 font-medium flex items-center gap-2">
                <FilterIcon size={18} /> Daftar Kelas
              </div>

              <div className="px-4 md:px-5 pb-4 overflow-x-auto">
                <table className="w-full text-sm min-w-[760px]">
                  <thead
                    className="text-left"
                    style={{ color: palette.silver2 }}
                  >
                    <tr
                      className="border-b"
                      style={{ borderColor: palette.silver1 }}
                    >
                      <th className="py-2 pr-4">Nama Kelas</th>
                      <th className="py-2 pr-4">Wali Kelas</th>
                      <th className="py-2 pr-4">Tahun Ajaran</th>
                      <th className="py-2 pr-4">Jumlah Siswa</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: palette.silver1 }}
                  >
                    {rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center"
                          style={{ color: palette.silver2 }}
                        >
                          Tidak ada data kelas.
                        </td>
                      </tr>
                    ) : (
                      rows.map((r) => (
                        <tr key={r.id}>
                          <td className="py-3 pr-4 font-medium">{r.name}</td>
                          <td className="py-3 pr-4">{r.homeroom_teacher}</td>
                          <td className="py-3 pr-4">{r.academic_year}</td>
                          <td className="py-3 pr-4">{r.student_count}</td>
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div
                  className="pt-3 text-xs"
                  style={{ color: palette.silver2 }}
                >
                  Menampilkan {rows.length} kelas
                </div>
              </div>
            </SectionCard>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SchoolActiveClass;
