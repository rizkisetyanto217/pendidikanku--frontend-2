import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { pickTheme } from "@/constants/thema";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import {
  ArrowLeft,
  CalendarDays,
  BookOpen,
  FileText,
  ClipboardList,
  GraduationCap,
  ChevronRight,
  Search,
} from "lucide-react";

/* ===== Helpers ===== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/* ===== Dummy data kelas yang diikuti murid ===== */
type EnrolledClass = {
  id: string;
  name: string;
  room?: string;
  homeroom: string;
  nextSession?: { dateISO: string; time: string; title: string };
  progress?: number; // 0-100 (kemajuan materi)
  pendingAssignments?: number;
  activeQuizzes?: number;
  lastScore?: number; // nilai terakhir
};

const ENROLLED: EnrolledClass[] = [
  {
    id: "tpa-a",
    name: "TPA A",
    room: "Aula 1",
    homeroom: "Ustadz Abdullah",
    nextSession: {
      dateISO: new Date().toISOString(),
      time: "07:30",
      title: "Tahsin — Tajwid & Makhraj",
    },
    progress: 68,
    pendingAssignments: 2,
    activeQuizzes: 1,
    lastScore: 88,
  },
  {
    id: "tpa-b",
    name: "TPA B",
    room: "R. Tahfiz",
    homeroom: "Ustadz Salman",
    nextSession: {
      dateISO: new Date(Date.now() + 864e5).toISOString(),
      time: "09:30",
      title: "Hafalan Juz 30",
    },
    progress: 42,
    pendingAssignments: 1,
    activeQuizzes: 0,
    lastScore: 92,
  },
];

const MyClass: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName, isDark);

  // kalau rute kamu memakai /:slug/siswa atau /:slug/santri, ubah konstanta ini
  const base = `/${slug}/murid`;

  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return ENROLLED;
    return ENROLLED.filter(
      (c) =>
        c.name.toLowerCase().includes(key) ||
        c.homeroom.toLowerCase().includes(key) ||
        (c.room ?? "").toLowerCase().includes(key)
    );
  }, [q]);

  const go = (path: string) => navigate(`${base}${path}`);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Kelas Saya (Murid)"
        gregorianDate={new Date().toISOString()}
        dateFmt={dateLong}
        showBack
      />

      <main className="w-full px-4 md:px-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Content */}
          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Back + title */}
            <div className="md:flex hidden gap-3 items-center">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={20} />
              </Btn>
              <h1 className="textlg font-semibold">Daftar Kelas</h1>
            </div>

            {/* Search */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5">
                <div
                  className="flex items-center gap-2 rounded-xl border px-3 h-10 w-full md:w-96"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <Search size={16} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari kelas / wali kelas / ruangan…"
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: palette.black1 }}
                  />
                </div>
              </div>
            </SectionCard>

            {/* List kelas */}
            <div className="grid gap-3">
              {list.map((c) => (
                <SectionCard key={c.id} palette={palette} className="p-0">
                  <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-base md:text-lg font-semibold">
                            {c.name}
                          </div>
                          {c.room && (
                            <Badge
                              palette={palette}
                              variant="outline"
                              className="h-6"
                            >
                              {c.room}
                            </Badge>
                          )}
                        </div>

                        {/* meta */}
                        <div
                          className="mt-2 flex flex-wrap items-center gap-3 text-sm"
                          style={{ color: palette.black2 }}
                        >
                          <span>Wali Kelas: {c.homeroom}</span>
                          <span>• Progres: {c.progress ?? 0}%</span>
                          <span>
                            • Tugas menunggu: {c.pendingAssignments ?? 0}
                          </span>
                          <span>• Quiz aktif: {c.activeQuizzes ?? 0}</span>
                          {typeof c.lastScore === "number" && (
                            <span>• Nilai terakhir: {c.lastScore}</span>
                          )}
                        </div>

                        {/* sesi berikutnya */}
                        {c.nextSession && (
                          <div
                            className="mt-2 flex flex-wrap items-center gap-2 text-sm"
                            style={{ color: palette.black2 }}
                          >
                            <CalendarDays size={14} />
                            <span>
                              {dateLong(c.nextSession.dateISO)} •{" "}
                              {c.nextSession.time}
                            </span>
                            <span>— {c.nextSession.title}</span>
                          </div>
                        )}
                      </div>

                      <Btn
                        palette={palette}
                        variant="ghost"
                        onClick={() => go(`/kelas/${c.id}`)}
                        className="shrink-0"
                      >
                        <ChevronRight size={18} />
                      </Btn>
                    </div>
                  </div>

                  {/* Aksi cepat (Murid) */}
                  <div
                    className="px-4 md:px-5 pb-4 md:pb-5 pt-3 border-t flex flex-wrap items-center justify-between gap-3"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <div className="text-sm" style={{ color: palette.black2 }}>
                      Aksi cepat
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Btn
                        palette={palette}
                        size="sm"
                        onClick={() => go(`/kelas/${c.id}`)}
                      >
                        Masuk Kelas
                      </Btn>
                      <Btn
                        palette={palette}
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          go(`/menu-utama/my-class/${c.id}/materi`)
                        }
                      >
                        <BookOpen size={16} className="mr-1" />
                        Materi
                      </Btn>
                      <Btn
                        palette={palette}
                        size="sm"
                        variant="outline"
                        onClick={() => go(`/menu-utama/my-class/${c.id}/tugas`)}
                      >
                        <FileText size={16} className="mr-1" />
                        Tugas
                      </Btn>
                      <Btn
                        palette={palette}
                        size="sm"
                        variant="outline"
                        onClick={() => go(`/menu-utama/my-class/${c.id}/quiz`)}
                      >
                        <ClipboardList size={16} className="mr-1" />
                        Quiz
                      </Btn>
                      <Btn
                        palette={palette}
                        size="sm"
                        variant="outline"
                        onClick={() => go(`/kelas/${c.id}/score`)}
                      >
                        <GraduationCap size={16} className="mr-1" />
                        Nilai
                      </Btn>
                    </div>
                  </div>
                </SectionCard>
              ))}

              {list.length === 0 && (
                <SectionCard palette={palette}>
                  <div
                    className="p-6 text-sm text-center"
                    style={{ color: palette.silver2 }}
                  >
                    Belum ada kelas yang diikuti.
                  </div>
                </SectionCard>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyClass;
