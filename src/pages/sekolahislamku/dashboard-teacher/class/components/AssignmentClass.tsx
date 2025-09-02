import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { pickTheme } from "@/constants/thema";

import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

import {
  CalendarDays,
  Clock,
  Users,
  ClipboardList,
  ChevronRight,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Download,
} from "lucide-react";

/* ========= Helpers tanggal ========= */
const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};
const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    : "-";

const hijriLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

/* ========= Types ========= */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

type NextSession = {
  dateISO: string;
  time: string;
  title: string;
  room?: string;
};

type TeacherClassSummary = {
  id: string;
  name: string;
  room?: string;
  homeroom: string;
  assistants?: string[];
  studentsCount: number;
  todayAttendance: Record<AttendanceStatus, number>;
  nextSession?: NextSession;
  materialsCount: number;
  assignmentsCount: number;
  academicTerm: string;
  cohortYear: number;
};

type Attachment = { name: string; url?: string };

type AssignmentStatus = "draft" | "terbit" | "selesai";
type Assignment = {
  id: string;
  title: string;
  description?: string;
  createdAt: string; // ISO
  dueDate?: string; // ISO
  status: AssignmentStatus;
  totalSubmissions?: number;
  graded?: number;
  attachments?: Attachment[];
  author?: string;
};

/* ========= Dummy Fetch ========= */
async function fetchTeacherClasses(): Promise<TeacherClassSummary[]> {
  const now = new Date();
  const mk = (d: Date, addDay = 0) => {
    const x = new Date(d);
    x.setDate(x.getDate() + addDay);
    return x.toISOString();
  };

  return Promise.resolve([
    {
      id: "tpa-a",
      name: "TPA A",
      room: "Aula 1",
      homeroom: "Ustadz Abdullah",
      assistants: ["Ustadzah Amina"],
      studentsCount: 22,
      todayAttendance: { hadir: 18, online: 1, sakit: 1, izin: 1, alpa: 1 },
      nextSession: {
        dateISO: mk(now, 0),
        time: "07:30",
        title: "Tahsin — Tajwid & Makhraj",
        room: "Aula 1",
      },
      materialsCount: 12,
      assignmentsCount: 4,
      academicTerm: "2025/2026 — Ganjil",
      cohortYear: 2025,
    },
    {
      id: "tpa-b",
      name: "TPA B",
      room: "R. Tahfiz",
      homeroom: "Ustadz Salman",
      assistants: ["Ustadzah Maryam"],
      studentsCount: 20,
      todayAttendance: { hadir: 15, online: 2, sakit: 1, izin: 1, alpa: 1 },
      nextSession: {
        dateISO: mk(now, 1),
        time: "09:30",
        title: "Hafalan Juz 30",
        room: "R. Tahfiz",
      },
      materialsCount: 9,
      assignmentsCount: 3,
      academicTerm: "2025/2026 — Ganjil",
      cohortYear: 2025,
    },
    {
      id: "tpa-c",
      name: "TPA C",
      room: "Aula 2",
      homeroom: "Ustadz Abu Bakar",
      assistants: [],
      studentsCount: 18,
      todayAttendance: { hadir: 14, online: 0, sakit: 2, izin: 1, alpa: 1 },
      nextSession: {
        dateISO: mk(now, 2),
        time: "08:00",
        title: "Latihan Makhraj",
        room: "Aula 2",
      },
      materialsCount: 7,
      assignmentsCount: 2,
      academicTerm: "2024/2025 — Genap",
      cohortYear: 2024,
    },
  ]);
}

async function fetchAssignmentsByClass(classId: string): Promise<Assignment[]> {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const tmr = new Date(now.getTime() + 864e5);
  const yst = new Date(now.getTime() - 864e5);

  const base: Record<string, Assignment[]> = {
    "tpa-a": [
      {
        id: "a-001",
        title: "Latihan Tajwid: Idgham",
        description: "Kerjakan 10 soal tentang idgham bighunnah & bilaghunnah.",
        createdAt: iso(yst),
        dueDate: iso(tmr),
        status: "terbit",
        totalSubmissions: 18,
        graded: 12,
        attachments: [{ name: "soal-idgham.pdf" }],
        author: "Ustadz Abdullah",
      },
      {
        id: "a-002",
        title: "Rekaman Bacaan QS. An-Naba 1–10",
        description: "Upload rekaman suara bacaan masing-masing.",
        createdAt: iso(now),
        dueDate: iso(tmr),
        status: "draft",
        totalSubmissions: 0,
        graded: 0,
        attachments: [],
        author: "Ustadzah Amina",
      },
    ],
    "tpa-b": [
      {
        id: "a-101",
        title: "Setoran Hafalan Juz 30 (Pekan Ini)",
        createdAt: iso(yst),
        dueDate: iso(tmr),
        status: "terbit",
        totalSubmissions: 14,
        graded: 9,
        attachments: [{ name: "format-penilaian.xlsx" }],
        author: "Ustadz Salman",
      },
    ],
  };
  return Promise.resolve(base[classId] ?? []);
}

/* ========= Query Keys ========= */
const QK = {
  CLASSES: ["teacher-classes-list"] as const,
  ASSIGNMENTS: (classId: string) =>
    ["teacher-class-assignments", classId] as const,
};

/* ========= Page ========= */
export default function AssignmentClass() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName, isDark);

  // kelas (pakai cache list/detail)
  const { data: classes = [] } = useQuery({
    queryKey: QK.CLASSES,
    queryFn: fetchTeacherClasses,
    staleTime: 5 * 60_000,
  });
  const cls = useMemo(() => classes.find((c) => c.id === id), [classes, id]);

  // assignments
  const { data: assignments = [], isFetching } = useQuery({
    queryKey: QK.ASSIGNMENTS(id),
    queryFn: () => fetchAssignmentsByClass(id),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });

  // filter & search
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | AssignmentStatus>("all");

  const filtered = useMemo(() => {
    let list = assignments;
    if (status !== "all") list = list.filter((a) => a.status === status);
    const qq = q.trim().toLowerCase();
    if (qq) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(qq) ||
          (a.description ?? "").toLowerCase().includes(qq)
      );
    }
    return [...list].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );
  }, [assignments, q, status]);

  const todayISO = toLocalNoonISO(new Date());

  /* ========= Actions ========= */
  const handleDownload = (a: Assignment) => {
    const att = a.attachments?.[0];
    if (!att) {
      alert("Tugas ini belum memiliki lampiran untuk diunduh.");
      return;
    }
    if (att.url) {
      window.open(att.url, "_blank", "noopener,noreferrer");
      return;
    }
    const blob = new Blob(
      [
        `Tugas: ${a.title}\n\nTidak ada URL file sebenarnya. Ini contoh placeholder untuk "${att.name}".`,
      ],
      { type: "text/plain;charset=utf-8" }
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = att.name || `${a.title}.txt`;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  };
  

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={cls ? `Tugas: ${cls.name}` : "Tugas Kelas"}
        gregorianDate={todayISO}
        hijriDate={hijriLong(todayISO)}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />

          <div className="flex-1 min-w-0 space-y-6">
            {/* Back */}
            <Btn
              palette={palette}
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} className="mr-1" />
              Kembali
            </Btn>

            {/* Header ringkas */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lg md:text-xl font-semibold">
                    {cls?.name ?? "—"}
                  </div>
                  <div
                    className="mt-1 flex flex-wrap items-center gap-2 text-sm"
                    style={{ color: palette.silver2 }}
                  >
                    <Badge variant="outline" palette={palette}>
                      {cls?.room ?? "-"}
                    </Badge>
                    <span>Wali Kelas: {cls?.homeroom ?? "-"}</span>
                    <span>• {cls?.academicTerm ?? "-"}</span>
                    <span>• Angkatan {cls?.cohortYear ?? "-"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Btn palette={palette} variant="secondary" size="sm">
                    <Plus size={16} className="mr-1" />
                    Buat Tugas
                  </Btn>
                </div>
              </div>
            </SectionCard>

            {/* Controls */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div
                  className="flex items-center gap-2 rounded-xl border px-3 h-10"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <Search size={16} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari tugas…"
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: palette.black1 }}
                  />
                </div>

                <div
                  className="flex items-center gap-2 rounded-xl border px-3 h-10"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <Filter size={16} />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: palette.black1 }}
                  >
                    <option value="all">Semua status</option>
                    <option value="draft">Draft</option>
                    <option value="terbit">Terbit</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* List tugas */}
            <div className="grid gap-3">
              {isFetching && filtered.length === 0 && (
                <SectionCard palette={palette}>
                  <div
                    className="p-6 text-sm"
                    style={{ color: palette.silver2 }}
                  >
                    Memuat tugas…
                  </div>
                </SectionCard>
              )}

              {filtered.map((a) => {
                const dueBadge =
                  a.dueDate &&
                  (new Date(a.dueDate).toDateString() ===
                  new Date().toDateString()
                    ? "Hari ini"
                    : dateShort(a.dueDate));

                return (
                  <SectionCard
                    key={a.id}
                    palette={palette}
                    className="p-0 hover:shadow-sm transition-shadow"
                    style={{ background: palette.white1 }}
                  >
                    {/* Body */}
                    <div className="p-4 md:p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-base font-semibold truncate">
                              {a.title}
                            </div>
                            <Badge
                              palette={palette}
                              variant={
                                a.status === "terbit"
                                  ? "success"
                                  : a.status === "draft"
                                    ? "secondary"
                                    : "warning"
                              }
                              className="h-6"
                            >
                              {a.status.toUpperCase()}
                            </Badge>
                            {a.dueDate && (
                              <Badge palette={palette} variant="outline">
                                Jatuh tempo: {dueBadge}
                              </Badge>
                            )}
                          </div>

                          {a.description && (
                            <p
                              className="text-sm mt-1 line-clamp-2"
                              style={{ color: palette.black2 }}
                            >
                              {a.description}
                            </p>
                          )}

                          <div
                            className="mt-2 flex flex-wrap items-center gap-2 text-xs"
                            style={{ color: palette.silver2 }}
                          >
                            <CalendarDays size={14} />
                            <span>Dibuat: {dateLong(a.createdAt)}</span>
                            {a.author && <span>• Oleh {a.author}</span>}
                            {(a.totalSubmissions ?? 0) > 0 && (
                              <>
                                <span>•</span>
                                <span>
                                  {a.totalSubmissions} pengumpulan
                                  {typeof a.graded === "number" &&
                                    ` • ${a.graded} dinilai`}
                                </span>
                              </>
                            )}
                            {a.attachments?.length ? (
                              <>
                                <span>•</span>
                                <span>{a.attachments.length} lampiran</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer actions */}
                    <div
                      className="px-4 md:px-5 pb-4 md:pb-5 pt-3 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      style={{ borderColor: palette.silver1 }}
                    >
                      <div
                        className="text-xs"
                        style={{ color: palette.silver2 }}
                      >
                        Aksi cepat untuk tugas ini
                      </div>
                      <div className="flex gap-2">
                        <Btn
                          palette={palette}
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(a)}
                        >
                          <Download size={16} className="mr-1" />
                          Unduh
                        </Btn>

                        {/* Link ke detail tugas.
                           NOTE: route detail lama berada di /kelas/:id/assignment/:assignmentId
                           karena halaman ini di /kelas/:id/tugas, pakai path relatif naik satu tingkat */}
                        <Link to={`../assignment/${a.id}`} relative="path">
                          <Btn palette={palette} size="sm">
                            Buka <ChevronRight size={16} className="ml-1" />
                          </Btn>
                        </Link>

                        <Btn palette={palette} size="sm">
                          Edit
                        </Btn>
                        <Btn palette={palette} size="sm" variant="destructive">
                          Hapus
                        </Btn>
                      </div>
                    </div>
                  </SectionCard>
                );
              })}

              {filtered.length === 0 && !isFetching && (
                <SectionCard palette={palette}>
                  <div
                    className="p-6 text-sm text-center"
                    style={{ color: palette.silver2 }}
                  >
                    Belum ada tugas untuk kelas ini.
                  </div>
                </SectionCard>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
