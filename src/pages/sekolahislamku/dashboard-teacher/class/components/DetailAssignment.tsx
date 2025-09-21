// src/pages/sekolahislamku/assignment/DetailAssignment.tsx
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Calendar, Clock, Plus } from "lucide-react";
import Swal from "sweetalert2";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import ModalAddAssignmentClass from "./ModalAddAssignmentClass";
import ModalEditAssignmentClass from "./ModalEditAssignmentClass";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

type AssignmentState = {
  id?: string;
  title?: string;
  dueDate?: string; // ISO
  submitted?: number;
  total?: number;
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

export default function DetailAssignment() {
  const { id: assignmentId } = useParams<{ id: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();

  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  // data awal dari state (kalau navigasi dari list)
  const initial = (state as any)?.assignment as AssignmentState | undefined;

  const [data, setData] = useState<AssignmentState | null>(initial ?? null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = async () => {
    const title = data?.title ?? assignmentId;
    const res = await Swal.fire({
      title: "Hapus Tugas?",
      text: `Apakah Anda yakin ingin menghapus tugas "${title}"?`,
      icon: "warning",
      iconColor: palette.warning1, // override spesifik (opsional)
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!res.isConfirmed) return;

    // TODO: panggil API delete
    await Swal.fire({
      title: "Terhapus!",
      text: "Tugas berhasil dihapus.",
      icon: "success",
      iconColor: palette.success1,
      confirmButtonText: "OK",
    });
    navigate("..");
  };

  const handleEditSubmit = (
    p: Required<Pick<AssignmentState, "title" | "dueDate">> & {
      submitted?: number;
      total?: number;
    }
  ) => {
    // TODO: API update
    setData((prev) => ({
      ...(prev ?? {}),
      ...p,
    }));
    setShowEdit(false);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Tugas"
        gregorianDate={new Date().toISOString()}
        dateFmt={fmtDateLong}
      />

      {/* Modals */}
      <ModalEditAssignmentClass
        open={showEdit}
        onClose={() => setShowEdit(false)}
        palette={palette}
        defaultValues={{
          title: data?.title,
          dueDate: data?.dueDate,
          total: data?.total,
          submitted: data?.submitted,
        }}
        onSubmit={handleEditSubmit}
      />
      <ModalAddAssignmentClass
        open={showAdd}
        onClose={() => setShowAdd(false)}
        palette={palette}
        onSubmit={(payload) => {
          // contoh: tambah subtugas/penugasan baru terkait
          console.log("Tambah sub-tugas:", payload);
          setShowAdd(false);
        }}
      />

      <main className="mx-auto Replace px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <aside className="lg:w-64 mb-6 lg:mb-0 lg:sticky lg:top-16 shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 min-w-0 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center rounded-full p-1 hover:opacity-80"
                  aria-label="Kembali"
                  title="Kembali"
                >
                  <ArrowLeft size={20} strokeWidth={3} />
                </button>
                <span>Detail Tugas</span>
              </div>
              <Btn
                palette={palette}
                size="sm"
                variant="white1"
                onClick={() => setShowAdd(true)}
              >
                <Plus size={16} className="mr-1" /> Tambah Tugas
              </Btn>
            </div>

            {/* Body */}
            <SectionCard palette={palette} className="p-4 space-y-4">
              <div className="font-bold text-xl">
                {data?.title ?? `Tugas ${assignmentId}`}
              </div>

              <div
                className="text-sm space-y-1"
                style={{ color: palette.black2 }}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Batas: {fmtDateLong(data?.dueDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>
                    Terkumpul: {data?.submitted ?? 0}/{data?.total ?? 0}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Btn
                  palette={palette}
                  size="sm"
                  onClick={() =>
                    navigate(`../${assignmentId}/score`, {
                      state: { assignment: data }, // biar TaskScore bisa tampilkan judul, dll.
                    })
                  }
                >
                  Nilai
                </Btn>
                <Btn
                  palette={palette}
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowEdit(true)}
                >
                  Edit
                </Btn>
                <Btn
                  palette={palette}
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Hapus
                </Btn>
              </div>

              {/* Fallback bila dibuka langsung tanpa state */}
              {!data && (
                <div className="text-sm" style={{ color: palette.silver2 }}>
                  Data tidak dikirim via state. Sambungkan <em>fetch by ID</em>{" "}
                  di sini (gunakan <code>{assignmentId}</code>) bila perlu.
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
