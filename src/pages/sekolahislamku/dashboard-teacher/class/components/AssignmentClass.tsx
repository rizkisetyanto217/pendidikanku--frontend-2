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

// ===== Reuse: data & tipe assignments
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

// ===== Dummy classes (biar tampilan header tetap work)
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

  /* ========= Actions ========= */
  const handleDownload = (a: Assignment) => {
    const att = a.attachments?.[0];
    if (!att) return alert("Tugas ini belum memiliki lampiran untuk diunduh.");
    if (att.url) return window.open(att.url, "_blank", "noopener,noreferrer");
    const blob = new Blob(
      [`Tugas: ${a.title}\n\nPlaceholder untuk "${att.name}".`],
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
  // state modal edit
  // di dalam component AssignmentClass()
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);

  // buka modal
  const onEdit = (a: Assignment) => {
    setEditing(a);
    setOpenEdit(true);
  };

  // mapping default values untuk modal
  const editDefaults = useMemo(() => {
    if (!editing) return undefined;
    return {
      title: editing.title,
      dueDate: editing.dueDate,
      // Modal pakai "total" & "submitted".
      // Kita map ke schema kita (totalSubmissions & graded).
      total: editing.totalSubmissions ?? 0,
      submitted: editing.totalSubmissions, // isian "Terkumpul"
    };
  }, [editing]);

  // submit dari modal -> update cache assignments
  const handleEditSubmit = (payload: EditAssignmentPayload) => {
    qc.setQueryData<Assignment[]>(QK.ASSIGNMENTS(id), (old = []) =>
      old.map((a) => {
        if (a.id !== editing?.id) return a;

        // prioritas: jika user isi "submitted", pakai itu jadi totalSubmissions,
        // kalau tidak, pakai "total" sebagai fallback.
        const newTotalSub =
          payload.submitted ?? payload.total ?? a.totalSubmissions;

        return {
          ...a,
          title: payload.title.trim(),
          dueDate: payload.dueDate || a.dueDate,
          totalSubmissions:
            typeof newTotalSub === "number"
              ? Math.max(0, newTotalSub)
              : a.totalSubmissions,
          // nilai graded kita biarkan apa adanya (bisa tambahin field baru di modal kalau mau edit terpisah)
        };
      })
    );

    setOpenEdit(false);
    setEditing(null);
  };

  // function delete
  const handleDelete = async (a: Assignment) => {
    const res = await Swal.fire({
      title: "Hapus tugas?",
      text: `"${a.title}" akan dihapus. Tindakan ini tidak bisa dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      background: palette.white1,
      color: palette.black1,
      confirmButtonColor: (palette as any).destructive ?? "#ef4444",
      cancelButtonColor: palette.primary,
    });

    if (!res.isConfirmed) return;

    try {
      // TODO: panggil API delete di sini kalau sudah ada
      // await api.delete(`/classes/${id}/assignments/${a.id}`);

      // Optimistic update: hapus dari cache daftar tugas
      qc.setQueryData<Assignment[]>(QK.ASSIGNMENTS(id), (old = []) =>
        old.filter((x) => x.id !== a.id)
      );

      // (Opsional) kurangi counter assignments di info kelas agar konsisten
      qc.setQueryData<TeacherClassSummary[]>(QK.CLASSES, (old = []) =>
        old.map((c) =>
          c.id === id
            ? {
                ...c,
                assignmentsCount: Math.max(0, (c.assignmentsCount ?? 0) - 1),
              }
            : c
        )
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
    } catch (e) {
      await Swal.fire({
        title: "Gagal menghapus",
        text: "Terjadi kesalahan saat menghapus tugas.",
        icon: "error",
        background: palette.white1,
        color: palette.black1,
        confirmButtonColor: (palette as any).destructive ?? "#ef4444",
      });
    }
  };

  // state add assignmentClass
  // state modal add
  const [openAdd, setOpenAdd] = useState(false);

  // submit dari modal add -> tambah ke cache assignments + update counter kelas
  const handleAddSubmit = (payload: AddAssignmentClassPayload) => {
    const nowISO = new Date().toISOString();

    const newItem: Assignment = {
      id: `a-${Date.now()}`, // id dummy unik
      title: payload.title,
      description: "", // bisa diisi dari modal kalau ditambah field
      createdAt: nowISO,
      dueDate: payload.dueDate,
      status: "draft", // default
      totalSubmissions: payload.total ?? 0,
      graded: 0,
      attachments: [],
      author: cls?.homeroom ?? "Guru",
    };

    // 1) sisipkan ke daftar tugas kelas aktif
    qc.setQueryData<Assignment[]>(QK.ASSIGNMENTS(id), (old = []) => [
      newItem,
      ...old,
    ]);

    // 2) update counter assignments di info kelas
    qc.setQueryData<TeacherClassSummary[]>(QK.CLASSES, (old = []) =>
      old.map((c) =>
        c.id === id
          ? { ...c, assignmentsCount: (c.assignmentsCount ?? 0) + 1 }
          : c
      )
    );

    // 3) tutup modal + (opsional) toast
    setOpenAdd(false);
    Swal.fire({
      title: "Tugas ditambahkan",
      text: "Tugas baru berhasil ditambahkan.",
      icon: "success",
      timer: 1400,
      showConfirmButton: false,
      background: palette.white1,
      color: palette.black1,
    });
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

      <main className="mx-auto Replace px-4 py-6">
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
                    style={{ color: palette.black2 }}
                  >
                    <Badge variant="outline" palette={palette}>
                      <h1 style={{ color: palette.black2 }}>
                        {cls?.room ?? "-"}
                      </h1>
                    </Badge>
                    <span>Wali Kelas: {cls?.homeroom ?? "-"}</span>
                    <span>• {cls?.academicTerm ?? "-"}</span>
                    <span>• Angkatan {cls?.cohortYear ?? "-"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Btn
                    palette={palette}
                    variant="secondary"
                    size="sm"
                    onClick={() => setOpenAdd(true)} // <-- buka modal add
                  >
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
                            <div
                              className="text-base font-semibold truncate"
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
                              className="h-6"
                            >
                              {a.status.toUpperCase()}
                            </Badge>
                            {a.dueDate && (
                              <Badge palette={palette} variant="outline">
                                <h1 style={{ color: palette.black2 }}>
                                  {" "}
                                  Jatuh tempo: {dueBadge}
                                </h1>
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
                            style={{ color: palette.black2 }}
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
                        style={{ color: palette.black2 }}
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

                        {/* Route detail: ../assignment/:assignmentId */}
                        <Link to={`../assignment/${a.id}`} relative="path">
                          <Btn palette={palette} size="sm">
                            Buka <ChevronRight size={16} className="ml-1" />
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
