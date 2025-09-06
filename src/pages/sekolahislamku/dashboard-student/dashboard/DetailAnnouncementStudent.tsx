import { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

type Announcement = {
  id: string;
  title: string;
  date: string; // ISO
  body: string;
  type?: "info" | "warning" | "success";
};

type LocationState = {
  item?: Announcement;
};

const dateFmt = (iso?: string) =>
  (iso ? new Date(iso) : new Date()).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function DetailAnnouncementStudent() {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation() as { state?: LocationState };
  const navigate = useNavigate();

  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const item = state?.item;

  // kalau tidak ada data sama sekali, kembali (atau di sini tempatmu fetch by id)
  useEffect(() => {
    if (!item) navigate(-1);
  }, [item, navigate]);

  if (!item) return null;

  const badgeVariant =
    item.type === "warning"
      ? "warning"
      : item.type === "success"
        ? "success"
        : "info";

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Pengumuman"
        gregorianDate={new Date().toISOString()}
        dateFmt={dateFmt}
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

            <SectionCard palette={palette} className="p-4 md:p-6">
              {/* Header */}
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Bell size={18} color={palette.quaternary} />
                    <Badge palette={palette} variant={badgeVariant as any}>
                      {item.type ?? "info"}
                    </Badge>
                  </div>
                  <h1 className="mt-2 text-xl md:text-2xl font-bold break-words">
                    {item.title}
                  </h1>
                  <div
                    className="mt-1 text-sm"
                    style={{ color: palette.black2 }}
                  >
                    {dateFmt(item.date)}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div
                className="mt-5 leading-relaxed whitespace-pre-line"
                style={{ color: palette.black2 }}
              >
                {item.body}
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
