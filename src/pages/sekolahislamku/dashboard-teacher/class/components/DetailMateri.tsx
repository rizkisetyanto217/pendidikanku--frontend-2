import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import { ArrowLeft, Calendar, Paperclip } from "lucide-react";
import ModalEditMateri, { EditMateriPayload } from "./ModalEditMateri";
import Swal from "sweetalert2";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

/** ===== Types ===== */
type MaterialItem = {
  id: string;
  title: string;
  date: string; // ISO
  attachments?: number;
  content?: string;
};

type LocationState = {
  material?: MaterialItem;
  className?: string;
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

export default function DetailMateri() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const navigate = useNavigate();
  const { id: classId, materialId } = useParams<{
    id: string;
    materialId: string;
  }>();
  const { state } = useLocation();
  const { material: incoming, className } = (state ?? {}) as LocationState;

  const material = useMemo<MaterialItem | null>(() => {
    if (incoming && (!materialId || incoming.id === materialId))
      return incoming;
    return incoming ?? null;
  }, [incoming, materialId]);

  const [openEdit, setOpenEdit] = useState(false);

  const handleSubmitEditMateri = (p: EditMateriPayload) => {
    if (material) {
      material.title = p.title;
      material.date = p.date;
      material.attachments = p.attachments;
      material.content = p.content;
    }
    setOpenEdit(false);
  };

  /** 🔹 hapus dengan sweetalert */
  const handleDelete = async () => {
    if (!material) return;
    const result = await Swal.fire({
      title: "Hapus Materi?",
      text: `Apakah Anda yakin ingin menghapus materi "${material.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      // TODO: panggil API delete pakai material.id
      await Swal.fire("Terhapus!", "Materi berhasil dihapus.", "success");
      navigate(-1);
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ModalEditMateri
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        palette={palette}
        defaultValues={{
          title: material?.title,
          date: material?.date,
          attachments: material?.attachments,
          content: material?.content,
        }}
        onSubmit={handleSubmitEditMateri}
        onDelete={handleDelete} // <-- pakai swal juga di modal
      />

      <ParentTopBar
        palette={palette}
        title={material?.title || "Detail Materi"}
        gregorianDate={new Date().toISOString()}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <aside className="lg:w-64 mb-6 lg:mb-0 lg:sticky lg:top-16 shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center rounded-full p-1 hover:opacity-80"
                aria-label="Kembali"
                title="Kembali"
              >
                <ArrowLeft size={20} />
              </button>
              <span>Detail Materi</span>
              {className && (
                <Badge palette={palette} variant="outline">
                  {className}
                </Badge>
              )}
            </div>

            <SectionCard palette={palette} className="p-4 md:p-5">
              {material ? (
                <div className="space-y-3">
                  <div className="text-xl font-semibold">{material.title}</div>

                  <div
                    className="text-sm flex flex-wrap items-center gap-3"
                    style={{ color: palette.black2 }}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={16} /> {dateLong(material.date)}
                    </span>
                    {typeof material.attachments === "number" && (
                      <span className="inline-flex items-center gap-1">
                        <Paperclip size={16} /> {material.attachments} lampiran
                      </span>
                    )}
                  </div>

                  <div
                    className="rounded-xl p-3"
                    style={{
                      background: palette.white2,
                      border: `1px solid ${palette.silver1}`,
                      color: palette.black1,
                    }}
                  >
                    {material.content ? (
                      <div className="prose max-w-none">{material.content}</div>
                    ) : (
                      <div
                        className="text-sm"
                        style={{ color: palette.silver2 }}
                      >
                        Belum ada konten materi.
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Btn
                      palette={palette}
                      size="sm"
                      onClick={() => setOpenEdit(true)}
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
                </div>
              ) : (
                <div className="text-sm" style={{ color: palette.silver2 }}>
                  Materi tidak ditemukan.
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
