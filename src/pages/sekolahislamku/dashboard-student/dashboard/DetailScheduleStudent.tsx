// src/pages/sekolahislamku/student/DetailSheduleStudent.tsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, MapPin } from "lucide-react";

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Badge,
  type Palette,
  Btn,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

// samakan tipe dengan list
type TodayScheduleItem = {
  time: string;
  title: string;
  room?: string;
  date?: string;
  slug?: string;
};

type LocationState = { item?: TodayScheduleItem };

export default function DetailScheduleStudent() {
  const { scheduleId = "" } = useParams<{ scheduleId: string }>();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState | undefined;
  const navigate = useNavigate();

  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const item = state?.item;
  const readableId = (() => {
    try {
      return decodeURIComponent(scheduleId);
    } catch {
      return scheduleId;
    }
  })();

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Jadwal"
        gregorianDate={new Date().toISOString()}
        dateFmt={(iso) =>
          new Date(iso).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        }
      />

      <main className="mx-auto Replace px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />

          <div className="flex-1 space-y-6">
            {/* Kembali */}
            <Btn
              palette={palette}
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} className="mr-1" />
              Kembali
            </Btn>

            {/* Detail */}
            <SectionCard palette={palette} className="p-4 md:p-5">
              {item ? (
                <>
                  <h2 className="text-lg font-bold">{item.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <Clock size={14} />
                      <Badge variant="outline" palette={palette}>
                        <p style={{ color: palette.black2 }}>
                          {item.time || "-"}
                        </p>
                      </Badge>
                    </span>
                    {item.room && (
                      <span className="inline-flex items-center gap-2">
                        <MapPin size={14} />
                        <Badge variant="outline" palette={palette}>
                          <p style={{ color: palette.black2 }}>{item.room}</p>
                        </Badge>
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-sm" style={{ color: palette.silver2 }}>
                  Data tidak dikirim dari halaman sebelumnya. ID:{" "}
                  <b>{readableId}</b>
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
