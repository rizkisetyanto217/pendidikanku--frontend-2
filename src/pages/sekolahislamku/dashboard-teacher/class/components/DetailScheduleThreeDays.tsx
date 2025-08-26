import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Clock,
  MapPin,
  CalendarDays,
  PencilLine,
  Trash2,
} from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";

import ModalEditSchedule from "@/pages/sekolahislamku/dashboard-school/components/dashboard/ModalEditSchedule";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

type ThreeDaysScheduleItem = {
  title: string;
  time?: string;
  room?: string;
  dateISO?: string;
};

const decodeId = (id: string) => {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
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

export default function DetailScheduleThreeDays() {
  const { scheduleId = "" } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();

  const { isDark } = useHtmlDarkMode();
  const palette: Palette = (isDark ? colors.dark : colors.light) as Palette;

  // data dari state (opsional)
  const incoming = (state as any)?.item as ThreeDaysScheduleItem | undefined;

  const [item, setItem] = useState<ThreeDaysScheduleItem | null>(
    incoming ?? null
  );
  const [editOpen, setEditOpen] = useState(false);
  const readableId = useMemo(() => decodeId(scheduleId), [scheduleId]);

  const handleDelete = () => {
    if (!confirm("Hapus jadwal ini?")) return;
    // TODO: panggil API delete dengan readableId sebagai key jika perlu
    navigate(-1);
  };

  const handleSubmitEdit = (p: {
    title: string;
    time: string;
    room?: string;
  }) => {
    // TODO: panggil API update
    setItem((prev) => ({
      title: p.title,
      time: p.time,
      room: p.room,
      dateISO: prev?.dateISO,
    }));
    setEditOpen(false);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Jadwal (3 Hari)"
        gregorianDate={new Date().toISOString()}
      />

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

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <aside className="lg:w-64 mb-6 lg:mb-0 lg:sticky lg:top-16 shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center font-semibold text-lg gap-2">
                <ArrowLeft
                  onClick={() => navigate(-1)}
                  size={16}
                  className="mr-1"
                />

                <div className="font-semibold text-lg">Detail Jadwal</div>
              </div>
            </div>

            <SectionCard palette={palette} className="p-4 md:p-5">
              {item ? (
                <>
                  <div className="font-bold text-xl">{item.title}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={16} />
                      <Badge palette={palette} variant="outline">
                        {fmtDateLong(item.dateISO)}
                      </Badge>
                    </span>
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
                  {/* fallback jika user buka via URL langsung */}
                  <div className="font-bold text-xl break-words">
                    Jadwal: <span className="font-normal">{readableId}</span>
                  </div>
                  <div
                    className="mt-2 text-sm"
                    style={{ color: palette.silver2 }}
                  >
                    Data tidak dikirim via state. Sambungkan fetch by ID di sini
                    jika perlu.
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
