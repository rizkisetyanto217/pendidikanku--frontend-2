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
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ModalEditSchedule from "@/pages/sekolahislamku/dashboard-school/dashboard/ModalEditSchedule";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
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

  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

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
        showBack
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

      <main className="w-full px-4 md:px-6  md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 min-w-0 space-y-4">
            <div className="mx-auto  md:flex hidden items-center gap-3">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="cursor-pointer" size={20} />
              </Btn>

              <h1 className="font-semibold text-lg">Ruangan</h1>
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
