// src/pages/sekolahislamku/assignment/AllAssignment.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowLeft,
  Plus,
} from "lucide-react";

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import ModalAddAssignment, {
  type AddAssignmentPayload,
} from "./ModalAddAssignment";
import ModalEditAssignment from "./ModalEditAssignment";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

/* =========================
   Types
========================= */
type AssignmentStatus = "terbuka" | "selesai" | "terlambat";

type IncomingAssignment = {
  id: string;
  title: string;
  dueDate: string; // ISO dari TeacherClassDetail
  submitted: number;
  total: number;
  graded?: number;
  kelas?: string;
};

type AssignmentItem = {
  id: string;
  title: string;
  kelas?: string;
  dueDateISO: string;
  createdISO?: string;
  submitted: number;
  total: number;
  status: AssignmentStatus;
};

type LocationState = {
  assignments?: IncomingAssignment[];
  heading?: string;
};

/* =========================
   Helpers
========================= */
const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    : "-";

const computeStatus = (a: {
  dueDateISO: string;
  submitted: number;
  total: number;
}): AssignmentStatus => {
  const now = new Date();
  const due = new Date(a.dueDateISO);
  if (a.submitted >= a.total) return "selesai";
  if (due < now) return "terlambat";
  return "terbuka";
};

/* =========================
   Page
========================= */
export default function AllAssignment() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  // Ambil data dari TeacherClassDetail via router state
  const { state } = useLocation();
  const { assignments = [], heading } = (state ?? {}) as LocationState;

  // Normalisasi state → item lokal (sekali di awal)
  const initialItems = useMemo<AssignmentItem[]>(
    () =>
      (assignments ?? []).map((x) => {
        const base: AssignmentItem = {
          id: x.id,
          title: x.title,
          kelas: x.kelas,
          dueDateISO: x.dueDate,
          createdISO: undefined, // isi jika ada field created dari API
          submitted: x.submitted,
          total: x.total,
          status: "terbuka",
        };
        return { ...base, status: computeStatus(base) };
      }),
    [assignments]
  );

  // Data lokal (agar bisa edit/hapus/tambah tanpa fetch)
  const [items, setItems] = useState<AssignmentItem[]>(initialItems);

  // Search & Filter
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<AssignmentStatus | "semua">("semua");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((a) => {
      const byStatus = status === "semua" ? true : a.status === status;
      const bySearch =
        a.title.toLowerCase().includes(s) ||
        (a.kelas ?? "").toLowerCase().includes(s);
      return byStatus && bySearch;
    });
  }, [q, status, items]);

  const statusBadgeTone = (st: AssignmentStatus) => {
    if (st === "terbuka")
      return { text: palette.primary, bg: palette.primary2 };
    if (st === "selesai")
      return { text: palette.success1, bg: palette.success2 };
    return { text: palette.error1, bg: palette.error2 };
  };

  //  state handle submit
  const [showTambah, setShowTambah] = useState(false);

  // state modal edit
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // cari item yang sedang diedit
  const editingItem = useMemo(
    () => items.find((it) => it.id === editingId) || null,
    [items, editingId]
  );

  // buka modal edit
  const handleEdit = (a: AssignmentItem) => {
    setEditingId(a.id);
    setShowEdit(true);
  };

  // submit dari modal edit
  const handleEditSubmit = (p: {
    title: string;
    kelas?: string;
    dueDate: string; // ISO
    total: number;
    submitted?: number;
  }) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === editingId
          ? {
              ...it,
              title: p.title,
              kelas: p.kelas,
              dueDateISO: p.dueDate,
              total: p.total,
              submitted: p.submitted ?? it.submitted,
              // status dihitung ulang:
              status:
                (p.submitted ?? it.submitted) >= p.total
                  ? "selesai"
                  : new Date(p.dueDate) < new Date()
                    ? "terlambat"
                    : "terbuka",
            }
          : it
      )
    );
    setShowEdit(false);
    setEditingId(null);
  };

  // hapus dari modal edit
  const handleEditDelete = () => {
    if (!editingItem) return;
    if (!confirm(`Hapus tugas "${editingItem.title}"?`)) return;
    setItems((prev) => prev.filter((x) => x.id !== editingItem.id));
    setShowEdit(false);
    setEditingId(null);
  };

  const handleAddSubmit = (payload: AddAssignmentPayload) => {
    const newItem: AssignmentItem = {
      id: `local-${Date.now()}`,
      title: payload.title,
      kelas: payload.kelas,
      dueDateISO: payload.dueDate,
      createdISO: new Date().toISOString(),
      submitted: 0,
      total: payload.total,
      status: "terbuka",
    };
    setItems((prev) => [newItem, ...prev]);
    setShowTambah(false);
  };

  const handleDelete = (a: AssignmentItem) => {
    if (!confirm(`Hapus tugas "${a.title}"?`)) return;
    setItems((prev) => prev.filter((x) => x.id !== a.id));
  };

  const fmtDateLong = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-";

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top Bar */}
      <ParentTopBar
        palette={palette}
        gregorianDate={new Date().toISOString()}
        title={heading || "Semua Tugas"}
        dateFmt={fmtDateLong}
      />

      {/* Modals */}
      <ModalAddAssignment
        open={showTambah}
        onClose={() => setShowTambah(false)}
        palette={palette}
        onSubmit={handleAddSubmit}
      />
      <ModalEditAssignment
        open={showEdit}
        onClose={() => {
          setShowEdit(false);
          setEditingId(null);
        }}
        palette={palette}
        defaultValues={
          editingItem
            ? {
                title: editingItem.title,
                kelas: editingItem.kelas,
                dueDate: editingItem.dueDateISO, // ISO string
                total: editingItem.total,
                submitted: editingItem.submitted,
              }
            : undefined
        }
        onSubmit={handleEditSubmit}
        onDelete={editingItem ? handleEditDelete : undefined}
      />

      {/* Content + Sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          {/* Sidebar kiri */}
          <aside className="lg:w-64 mb-6 lg:mb-0 lg:sticky lg:top-16 shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Konten utama */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Header actions (Back + Tambah) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center rounded-full p-1 hover:opacity-80"
                  aria-label="Kembali"
                  title="Kembali"
                >
                  <ArrowLeft size={20} />
                </button>
                <span>{heading || "Semua Tugas"}</span>
              </div>
              <div className="flex gap-2">
                <Btn
                  palette={palette}
                  size="sm"
                  onClick={() => setShowTambah(true)}
                >
                  <Plus size={16} className="mr-1" /> Tambah Tugas
                </Btn>
              </div>
            </div>

            {/* Search & Filter */}
            <SectionCard palette={palette} className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                {/* Search */}
                <div
                  className="flex-1 flex items-center gap-2 rounded-2xl border h-10 px-3"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <Search size={16} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari tugas atau kelas…"
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: palette.black1 }}
                    aria-label="Cari tugas"
                  />
                </div>

                {/* Filter status */}
                <div className="flex items-center gap-2">
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as AssignmentStatus | "semua")
                    }
                    className="h-10 rounded-xl px-3 text-sm outline-none"
                    style={{
                      background: palette.white1,
                      color: palette.black1,
                      border: `1px solid ${palette.silver1}`,
                    }}
                    aria-label="Filter status"
                  >
                    {["semua", "terbuka", "selesai", "terlambat"].map((s) => (
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* List Tugas */}
            <div className="grid gap-3">
              {filtered.length === 0 ? (
                <SectionCard palette={palette} className="p-6 text-center">
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Tidak ada tugas ditemukan.
                  </div>
                </SectionCard>
              ) : (
                filtered.map((a) => {
                  const tone = statusBadgeTone(a.status);
                  return (
                    <SectionCard
                      key={a.id}
                      palette={palette}
                      className="p-3 md:p-4"
                      style={{ background: palette.white1 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h2 className="font-semibold truncate">
                              {a.title}
                            </h2>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ color: tone.text, background: tone.bg }}
                            >
                              {a.status[0].toUpperCase() + a.status.slice(1)}
                            </span>
                          </div>

                          <div
                            className="mt-1 text-sm flex flex-wrap gap-3"
                            style={{ color: palette.black2 }}
                          >
                            {a.createdISO && (
                              <span className="flex items-center gap-1">
                                <Calendar size={16} /> Dibuat{" "}
                                {dateShort(a.createdISO)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock size={16} /> Batas{" "}
                              {dateShort(a.dueDateISO)}
                            </span>
                            <span className="flex items-center gap-1">
                              {a.submitted}/{a.total} terkumpul
                              {a.status === "selesai" ? (
                                <CheckCircle2 size={16} />
                              ) : a.status === "terlambat" ? (
                                <AlertTriangle size={16} />
                              ) : null}
                            </span>
                            {a.kelas && (
                              <Badge palette={palette} variant="outline">
                                {a.kelas}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Aksi: Detail / Edit / Hapus */}
                        <div className="shrink-0 flex items-center gap-2">
                          <Link
                            to={`./${a.id}`} // relative ke /:slug/guru/assignments
                            state={{
                              assignment: {
                                id: a.id,
                                title: a.title,
                                dueDate: a.dueDateISO,
                                submitted: a.submitted,
                                total: a.total,
                              },
                            }}
                          >
                            <Btn palette={palette} size="sm" variant="white1">
                              Detail
                            </Btn>
                          </Link>

                          <Btn
                            palette={palette}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(a)}
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
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
