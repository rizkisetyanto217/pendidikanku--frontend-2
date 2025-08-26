import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import { ArrowLeft, Calendar, Paperclip } from "lucide-react";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

/** ===== Types (selaras TeacherClass) ===== */
type MaterialItem = {
  id: string;
  title: string;
  date: string; // ISO
  attachments?: number; // jumlah lampiran
  content?: string; // (opsional) jika kamu punya konten materi
};

type LocationState = {
  material?: MaterialItem; // bisa dikirim dari TeacherClassDetail via Link state
  className?: string; // opsional
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
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = (isDark ? colors.dark : colors.light) as Palette;

  const navigate = useNavigate();
  const { id: classId, materialId } = useParams<{
    id: string;
    materialId: string;
  }>();
  const { state } = useLocation();
  const { material: incoming, className } = (state ?? {}) as LocationState;

  // Sumber data materi:
  // - Utamakan dari router state (cepat, tanpa refetch)
  // - Jika kamu punya API, di sini kamu bisa fetch by classId + materialId
  //   dan fallback ke incoming kalau ada.
  const material = useMemo<MaterialItem | null>(() => {
    if (incoming && (!materialId || incoming.id === materialId))
      return incoming;
    // TODO: panggil API fetch detail materi di sini jika diperlukan
    // misal: return dataDariAPI
    return incoming ?? null;
  }, [incoming, materialId]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={material?.title || "Detail Materi"}
        gregorianDate={new Date().toISOString()}
        dateFmt={(iso) => dateLong(iso)}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <aside className="lg:w-64 mb-6 lg:mb-0 lg:sticky lg:top-16 shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 min-w-0 space-y-4">
            {/* Header actions */}
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
              {className ? (
                <Badge palette={palette} variant="outline">
                  {className}
                </Badge>
              ) : null}
            </div>

            {/* Content */}
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
                        Belum ada konten materi. (Isi dari API / editor materi
                        dapat ditampilkan di sini.)
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Btn
                      palette={palette}
                      size="sm"
                      onClick={() =>
                        alert("Edit materi (hubungkan ke modal/halaman edit)")
                      }
                    >
                      Edit
                    </Btn>
                    <Btn
                      palette={palette}
                      size="sm"
                      variant="quaternary"
                      onClick={() => {
                        if (!confirm(`Hapus materi "${material.title}"?`))
                          return;
                        alert("Hapus materi (panggil API di sini)");
                        navigate(-1);
                      }}
                    >
                      Hapus
                    </Btn>
                  </div>
                </div>
              ) : (
                <div className="text-sm" style={{ color: palette.silver2 }}>
                  Materi tidak ditemukan. (Pastikan Anda melewatkan state atau
                  implementasikan fetch by ID.)
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
