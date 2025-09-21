// src/pages/sekolahislamku/jadwal/DetailSchedule.tsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { ArrowLeft, Clock, MapPin, PencilLine, Trash2 } from "lucide-react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ModalEditSchedule from "@/pages/sekolahislamku/dashboard-school/dashboard/ModalEditSchedule";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

export type TodayScheduleItem = {
  title: string;
  time?: string;
  room?: string;
};

const decodeId = (id: string) => {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
};

export default function DetailSchedule() {
  const { scheduleId = "" } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();

  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  // Ambil item dari state (jika datang dari list). Kalau tidak ada, kita
  // hanya tampilkan ID ter-decode. (Nanti bisa kamu sambungkan ke API by id.)
  const incoming = (state as any)?.item as TodayScheduleItem | undefined;

  const [item, setItem] = useState<TodayScheduleItem | null>(incoming ?? null);
  const [editOpen, setEditOpen] = useState(false);

  const readableId = useMemo(() => decodeId(scheduleId), [scheduleId]);

  const handleDelete = () => {
    if (!confirm(`Hapus jadwal ini?`)) return;
    // TODO: panggil API delete bila sudah ada
    navigate(-1); // kembali ke list
  };

  const handleSubmitEdit = (p: {
    title: string;
    time: string;
    room?: string;
  }) => {
    // TODO: sambungkan ke API update bila sudah ada
    setItem({ title: p.title, time: p.time, room: p.room });
    setEditOpen(false);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Jadwal"
        gregorianDate={new Date().toISOString()}
      />

      {/* Modal Edit */}
      <ModalEditSchedule
        open={editOpen}
        onClose={() => setEditOpen(false)}
        palette={palette}
        defaultTitle={item?.title || ""}
        defaultTime={item?.time || ""}
        defaultRoom={item?.room || ""}
        onSubmit={handleSubmitEdit}
        onDelete={handleDelete}
      />

      <main className="mx-auto Replace px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <aside className="lg:w-64 mb-6 lg:mb-0 lg:sticky lg:top-16 shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 min-w-0 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center rounded-full p-1 hover:opacity-80"
                  aria-label="Kembali"
                  title="Kembali"
                >
                  <ArrowLeft size={20} />
                </button>
                <span>Detail Jadwal</span>
              </div>
            </div>

            {/* Card Detail */}
            <SectionCard palette={palette} className="p-4 md:p-5">
              {item ? (
                <>
                  <div className="font-bold text-xl">{item.title}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <Clock size={16} />
                      <Badge palette={palette} variant="white1">
                        {item.time || "-"}
                      </Badge>
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={16} />
                      <Badge palette={palette} variant="outline">
                        {item.room || "-"}
                      </Badge>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Fallback kalau tidak ada state: tampilkan ID ter-decode */}
                  <div className="font-bold text-xl break-words">
                    Jadwal: <span className="font-normal">{readableId}</span>
                  </div>
                  <div
                    className="mt-2 text-sm"
                    style={{ color: palette.silver2 }}
                  >
                    Data detail tidak dikirim via state. Sambungkan fetch by ID
                    di sini bila diperlukan.
                  </div>
                </>
              )}
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
