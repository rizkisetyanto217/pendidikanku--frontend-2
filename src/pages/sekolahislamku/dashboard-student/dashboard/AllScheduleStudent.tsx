// src/pages/sekolahislamku/student/AllScheduleStudent.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, CalendarDays } from "lucide-react";

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

// 🔗 ambil tipe & data helper
import {
  TodayScheduleItem,
  mockTodaySchedule,
} from "@/pages/sekolahislamku/dashboard-school/types/TodaySchedule";

type LocationState = {
  items?: TodayScheduleItem[];
  title?: string;
};

const topbarDateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function AllScheduleStudent() {
  const { state } = useLocation() as { state?: LocationState };
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  // Ambil data hanya untuk hari ini
  const items: TodayScheduleItem[] =
    state?.items && state.items.length > 0 ? state.items : mockTodaySchedule;

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={state?.title ?? "Jadwal Hari Ini"}
        gregorianDate={new Date().toISOString()}
        dateFmt={topbarDateFmt}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />

          <div className="flex-1 space-y-6">
            <Btn
              palette={palette}
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} className="mr-1" />
              Kembali
            </Btn>

            <SectionCard palette={palette} className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-base">
                  <CalendarDays size={18} /> Jadwal Hari Ini
                </div>
              </div>
            </SectionCard>

            <SectionCard palette={palette} className="p-4 md:p-5">
              {items.length === 0 ? (
                <div
                  className="rounded-xl border p-4 text-sm text-center"
                  style={{
                    borderColor: palette.silver1,
                    color: palette.silver2,
                  }}
                >
                  Tidak ada jadwal hari ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((it, idx) => {
                    const id = encodeURIComponent(
                      it.slug ?? it.title ?? String(idx)
                    );
                    return (
                      <Link
                        key={id}
                        to={`detail/${id}`} // ➜ route detail
                        state={{ item: it }} // ➜ kirim data ke detail
                        className="block rounded-xl border p-3 md:p-4 hover:shadow-sm transition"
                        style={{
                          borderColor: palette.silver1,
                          background: palette.white1,
                        }}
                      >
                        <div className="font-semibold">{it.title}</div>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={14} />
                            <Badge palette={palette} variant="outline">
                              {it.time}
                            </Badge>
                          </span>
                          {it.room && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={14} />
                              <Badge palette={palette} variant="outline">
                                {it.room}
                              </Badge>
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
