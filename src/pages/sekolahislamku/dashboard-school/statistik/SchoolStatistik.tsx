// src/pages/sekolahislamku/pages/academic/SchoolStatistik.tsx
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
  UserCog,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ArrowLeft,
} from "lucide-react";

/* ========= helpers ========= */
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

/* ========= types ========= */
type SchoolStat = {
  teachers: number;
  students: number;
  classes: number;
  subjects: number;
  events: number;
  studentsByLevel: Record<string, number>; // { "1": 50, "2": 52, ... }
  studentsByGender: { male: number; female: number };
  eventsByMonth: number[]; // length 12
};

/* ========= page ========= */
const SchoolStatistik: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const gregorianISO = toLocalNoonISO(new Date());

  // ---- data (dummy => ganti axios.get('/api/...') jika siap) ----
  const statsQ = useQuery({
    queryKey: ["school-stats"],
    queryFn: async (): Promise<{ stats: SchoolStat }> => {
      // const { data } = await axios.get("/api/a/school/statistics");
      // return data;
      return {
        stats: {
          teachers: 26,
          students: 342,
          classes: 12,
          subjects: 18,
          events: 43,
          studentsByLevel: {
            "1": 60,
            "2": 58,
            "3": 56,
            "4": 56,
            "5": 56,
            "6": 56,
          },
          studentsByGender: { male: 170, female: 172 },
          eventsByMonth: [2, 3, 4, 6, 5, 3, 4, 4, 3, 5, 2, 2],
        },
      };
    },
    staleTime: 60_000,
  });

  const s = statsQ.data?.stats;

  const kpis = useMemo(
    () =>
      s
        ? [
            { label: "Guru", value: s.teachers, icon: <UserCog size={18} /> },
            { label: "Siswa", value: s.students, icon: <Users size={18} /> },
            {
              label: "Kelas",
              value: s.classes,
              icon: <GraduationCap size={18} />,
            },
            { label: "Mapel", value: s.subjects, icon: <BookOpen size={18} /> },
            {
              label: "Agenda",
              value: s.events,
              icon: <CalendarDays size={18} />,
            },
          ]
        : [],
    [s]
  );

  // Donut ratio guru:siswa
  const donutData = useMemo(() => {
    if (!s) return null;
    const total = s.teachers + s.students;
    const pctTeachers = s.teachers / total;
    const degTeachers = Math.round(pctTeachers * 360);
    return {
      pctTeachers: Math.round(pctTeachers * 100),
      pctStudents: 100 - Math.round(pctTeachers * 100),
      conic: `conic-gradient(${palette.primary} 0deg ${degTeachers}deg, ${palette.silver1} ${degTeachers}deg 360deg)`,
    };
  }, [s, palette]);

  // Bars level
  const levelBars = useMemo(() => {
    if (!s) return [];
    const entries = Object.entries(s.studentsByLevel);
    const max = Math.max(...entries.map(([, v]) => v), 1);
    return entries.map(([lvl, val]) => ({
      label: `Kls ${lvl}`,
      val,
      w: (val / max) * 100,
    }));
  }, [s]);

  // Bars events by month
  const monthBars = useMemo(() => {
    if (!s) return [];
    const arr = s.eventsByMonth;
    const max = Math.max(...arr, 1);
    const labels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    return arr.map((v, i) => ({ label: labels[i], val: v, h: (v / max) * 72 })); // max 72px
  }, [s]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Statistik Sekolah"
        gregorianDate={gregorianISO}
        hijriDate={hijriLong(gregorianISO)}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-4 md:py-6 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main */}
          <section className="lg:col-span-9 space-y-6 min-w-0">
            {/* Header */}
            <section className="flex items-start gap-7">
              <span className="h-10 w-10 grid place-items-center rounded-xl">
                <Btn
                  palette={palette}
                  variant="ghost"
                  className="inline-flex items-center gap-2"
                >
                  <ArrowLeft onClick={() => navigate(-1)} size={20} />
                </Btn>
              </span>
              
            </section>

            {/* KPI */}
            <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              {kpis.map((k) => (
                <KpiTile
                  key={k.label}
                  palette={palette}
                  label={k.label}
                  value={k.value}
                  icon={k.icon}
                />
              ))}
            </section>

            {/* Statistik visual */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Donut ratio */}
              <SectionCard palette={palette}>
                <div className="p-4 md:p-5">
                  <div className="font-medium mb-3">Rasio Guru : Siswa</div>
                  {s && donutData ? (
                    <div className="flex items-center gap-5">
                      <div
                        className="relative h-28 w-28 rounded-full"
                        style={{ background: donutData.conic }}
                      >
                        <div
                          className="absolute inset-3 rounded-full"
                          style={{ background: palette.white1 }}
                        />
                        <div className="absolute inset-0 grid place-items-center text-sm font-semibold">
                          {s.teachers}:{s.students}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: palette.primary }}
                          />
                          <span>Guru</span>
                          <Badge palette={palette} variant="outline">
                            <p style={{ color: palette.black2 }}>
                              {donutData.pctTeachers}%
                            </p>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: palette.silver1 }}
                          />
                          <span>Siswa</span>
                          <Badge palette={palette} variant="outline">
                            <p style={{ color: palette.black2 }}>
                              {donutData.pctStudents}%
                            </p>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyLoading palette={palette} />
                  )}
                </div>
              </SectionCard>

              {/* Bar: siswa per level */}
              <SectionCard palette={palette}>
                <div className="p-4 md:p-5">
                  <div className="font-medium mb-3">
                    Distribusi Siswa per Kelas
                  </div>
                  {s ? (
                    <div className="space-y-2">
                      {levelBars.map((b) => (
                        <div key={b.label}>
                          <div
                            className="flex justify-between text-xs mb-1"
                            style={{ color: palette.black2 }}
                          >
                            <span>{b.label}</span>
                            <span>{b.val}</span>
                          </div>
                          <div
                            className="h-2.5 rounded-full"
                            style={{
                              background: palette.white2,
                              border: `1px solid ${palette.silver1}`,
                            }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${b.w}%`,
                                background: palette.primary,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyLoading palette={palette} />
                  )}
                </div>
              </SectionCard>

              {/* Bar: agenda per bulan */}
              <SectionCard palette={palette}>
                <div className="p-4 md:p-5">
                  <div className="font-medium mb-3">Agenda per Bulan</div>
                  {s ? (
                    <div className="h-40 flex items-end gap-2">
                      {monthBars.map((b) => (
                        <div
                          key={b.label}
                          className="flex flex-col items-center gap-1"
                        >
                          <div
                            className="w-5 rounded-md"
                            style={{
                              height: `${b.h}px`,
                              background: palette.primary,
                            }}
                          />
                          <div
                            className="text-[10px]"
                            style={{ color: palette.black2 }}
                          >
                            {b.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyLoading palette={palette} />
                  )}
                </div>
              </SectionCard>

              {/* Ringkasan teks */}
              <SectionCard palette={palette}>
                <div className="p-4 md:p-5">
                  <div className="font-medium mb-2">Ringkasan</div>
                  {s ? (
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>{s.teachers} guru aktif mengajar.</li>
                      <li>
                        {s.students} siswa terdaftar pada {s.classes} kelas.
                      </li>
                      <li>{s.subjects} mata pelajaran tersedia.</li>
                      <li>{s.events} agenda tercatat tahun ini.</li>
                    </ul>
                  ) : (
                    <EmptyLoading palette={palette} />
                  )}
                </div>
              </SectionCard>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SchoolStatistik;

/* ===== UI helpers ===== */
function KpiTile({
  palette,
  label,
  value,
  icon,
}: {
  palette: Palette;
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}) {
  return (
    <SectionCard palette={palette}>
      <div className="p-4 md:p-5 flex items-center gap-3">
        <span
          className="h-10 w-10 grid place-items-center rounded-xl"
          style={{ background: palette.primary2, color: palette.primary }}
        >
          {icon}
        </span>
        <div>
          <div className="text-xs" style={{ color: palette.black2 }}>
            {label}
          </div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
    </SectionCard>
  );
}

function EmptyLoading({ palette }: { palette: Palette }) {
  return (
    <div className="text-sm" style={{ color: palette.black2 }}>
      Memuat data…
    </div>
  );
}
