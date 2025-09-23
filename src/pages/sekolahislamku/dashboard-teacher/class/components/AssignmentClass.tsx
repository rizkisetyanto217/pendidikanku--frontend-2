// src/pages/sekolahislamku/teacher/AssignmentClass.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  ChevronRight,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Download,
} from "lucide-react";

import {
  QK,
  fetchAssignmentsByClass,
  type Assignment,
  type AssignmentStatus,
} from "../types/assignments";
import ModalEditAssignmentClass from "./ModalEditAssignmentClass";
import { EditAssignmentPayload } from "./ModalEditAssignment";
import Swal from "sweetalert2";
import ModalAddAssignmentClass, {
  AddAssignmentClassPayload,
} from "./ModalAddAssignmentClass";

/* ========= Dummy teacher classes ========= */
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
  ]);
}

/* ========= Helpers ========= */
const toLocalNoonISO = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x.toISOString();
};
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

/* ========= Page ========= */
export default function AssignmentClass() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName, isDark);
  const qc = useQueryClient();

  // kelas
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

  /* ========= Modal state ========= */
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [openAdd, setOpenAdd] = useState(false);

  const onEdit = (a: Assignment) => {
    setEditing(a);
    setOpenEdit(true);
  };
  const editDefaults = useMemo(() => {
    if (!editing) return undefined;
    return {
      title: editing.title,
      dueDate: editing.dueDate,
      total: editing.totalSubmissions ?? 0,
      submitted: editing.totalSubmissions,
    };
  }, [editing]);

  const handleEditSubmit = (payload: EditAssignmentPayload) => {
    qc.setQueryData<Assignment[]>(QK.ASSIGNMENTS(id), (old = []) =>
      old.map((a) =>
        a.id !== editing?.id
          ? a
          : {
              ...a,
              title: payload.title.trim(),
              dueDate: payload.dueDate || a.dueDate,
              totalSubmissions:
                payload.submitted ?? payload.total ?? a.totalSubmissions,
            }
      )
    );
    setOpenEdit(false);
    setEditing(null);
  };

  const handleDelete = async (a: Assignment) => {
    const res = await Swal.fire({
      title: "Hapus tugas?",
      text: `"${a.title}" akan dihapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      background: palette.white1,
      color: palette.black1,
      confirmButtonColor: (palette as any).destructive ?? "#ef4444",
      cancelButtonColor: palette.primary,
    });
    if (!res.isConfirmed) return;
    qc.setQueryData<Assignment[]>(QK.ASSIGNMENTS(id), (old = []) =>
      old.filter((x) => x.id !== a.id)
    );
    await Swal.fire({
      title: "Terhapus",
      text: "Tugas berhasil dihapus.",
      icon: "success",
      timer: 1400,
      showConfirmButton: false,
      background: palette.white1,
      color: palette.black1,
    });
  };

  const handleAddSubmit = (payload: AddAssignmentClassPayload) => {
    const nowISO = new Date().toISOString();
    const newItem: Assignment = {
      id: `a-${Date.now()}`,
      title: payload.title,
      description: "",
      createdAt: nowISO,
      dueDate: payload.dueDate,
      status: "draft",
      totalSubmissions: payload.total ?? 0,
      graded: 0,
      attachments: [],
      author: cls?.homeroom ?? "Guru",
    };
    qc.setQueryData<Assignment[]>(QK.ASSIGNMENTS(id), (old = []) => [
      newItem,
      ...old,
    ]);
    setOpenAdd(false);
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
        hijriDate={new Date().toLocaleDateString(
          "id-ID-u-ca-islamic-umalqura",
          {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        )}
        dateFmt={dateLong}
        showBack
      />

      <ModalEditAssignmentClass
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setEditing(null);
        }}
        palette={palette}
        defaultValues={editDefaults}
        onSubmit={handleEditSubmit}
      />
      <ModalAddAssignmentClass
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        palette={palette}
        onSubmit={handleAddSubmit}
      />

      <main className="w-full px-4  md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Konten */}
          <div className="flex-1 flex flex-col space-y-8 min-w-0">
            {/* Header */}
            <div className="md:flex hidden items-center gap-4">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft size={18} />
              </Btn>
              <h1 className="text-lg font-semibold">Tugas Kelas</h1>
            </div>

            {/* Info kelas */}
            <SectionCard palette={palette}>
              <div className="p-6 md:p-8 flex items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <div className="text-xl md:text-2xl font-semibold mb-3">
                    {cls?.name ?? "—"}
                  </div>
                  <div
                    className="flex flex-wrap items-center gap-3 text-sm"
                    style={{ color: palette.black2 }}
                  >
                    <Badge
                      variant="outline"
                      palette={palette}
                      className="px-3 py-1"
                    >
                      {cls?.room ?? "-"}
                    </Badge>
                    <span>Wali Kelas: {cls?.homeroom ?? "-"}</span>
                    <span>• {cls?.academicTerm ?? "-"}</span>
                    <span>• Angkatan {cls?.cohortYear ?? "-"}</span>
                  </div>
                </div>
                <Btn
                  palette={palette}
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenAdd(true)}
                  className="gap-2"
                >
                  <Plus size={16} />
                </Btn>
              </div>
            </SectionCard>

            {/* Controls */}
            <SectionCard palette={palette}>
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <label
                  className="flex items-center gap-3 rounded-lg border px-4 h-12"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <Search size={18} style={{ color: palette.black2 }} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari tugas…"
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: palette.black1 }}
                  />
                </label>

                <label
                  className="flex items-center gap-3 rounded-lg border px-4 h-12"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <Filter size={18} style={{ color: palette.black2 }} />
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
                </label>
              </div>
            </SectionCard>

            {/* List tugas */}
            <div className="grid gap-6">
              {isFetching && filtered.length === 0 && (
                <SectionCard palette={palette}>
                  <div
                    className="p-8 text-sm text-center"
                    style={{ color: palette.silver2 }}
                  >
                    Memuat tugas…
                  </div>
                </SectionCard>
              )}

              {filtered.map((a) => {
                const dueBadge = a.dueDate
                  ? new Date(a.dueDate).toDateString() ===
                    new Date().toDateString()
                    ? "Hari ini"
                    : dateShort(a.dueDate)
                  : null;

                return (
                  <SectionCard
                    key={a.id}
                    palette={palette}
                    className="hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="p-6 md:p-8">
                      <div className="flex items-start justify-between gap-6 mb-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="text-lg font-semibold truncate"
                              style={{ color: palette.black2 }}
                            >
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
                              className="h-6 px-3"
                            >
                              {a.status.toUpperCase()}
                            </Badge>
                            {dueBadge && (
                              <Badge
                                palette={palette}
                                variant="outline"
                                className="h-6 px-3"
                              >
                                tempo: {dueBadge}
                              </Badge>
                            )}
                          </div>

                          {a.description && (
                            <p
                              className="text-sm mb-4 line-clamp-2"
                              style={{ color: palette.black2 }}
                            >
                              {a.description}
                            </p>
                          )}

                          <div
                            className="flex flex-wrap items-center gap-4 text-xs"
                            style={{ color: palette.black2 }}
                          >
                            <div className="flex items-center gap-2">
                              <CalendarDays size={14} />
                              <span>Dibuat: {dateLong(a.createdAt)}</span>
                            </div>
                            {a.author && <span>• Oleh {a.author}</span>}
                            {(a.totalSubmissions ?? 0) > 0 && (
                              <span>• {a.totalSubmissions} pengumpulan</span>
                            )}
                            {a.attachments?.length ? (
                              <span>• {a.attachments.length} lampiran</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer actions */}
                    <div
                      className="px-6 md:px-8 pb-6 md:pb-8 pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      style={{ borderColor: palette.silver1 }}
                    >
                      <div
                        className="text-xs"
                        style={{ color: palette.black2 }}
                      >
                        Aksi cepat untuk tugas ini
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Btn
                          palette={palette}
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.alert("Unduh belum diimplementasikan")
                          }
                          className="gap-2"
                        >
                          <Download size={16} />
                          Unduh
                        </Btn>
                        <Link to={`../assignment/${a.id}`} relative="path">
                          <Btn palette={palette} size="sm" className="gap-2">
                            Buka
                            <ChevronRight size={16} />
                          </Btn>
                        </Link>
                        <Btn
                          palette={palette}
                          size="sm"
                          onClick={() => onEdit(a)}
                        >
                          Edit
                        </Btn>
                        <Btn
                          palette={palette}
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(a)}
                        >
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
                    className="p-12 text-sm text-center"
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
