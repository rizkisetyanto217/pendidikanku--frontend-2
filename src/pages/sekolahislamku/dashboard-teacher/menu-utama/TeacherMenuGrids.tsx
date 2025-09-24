// src/pages/sekolahislamku/teacher/TeacherMenuGrids.tsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

// UI
import {
  SectionCard,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

// Icons
import {
  Users,
  Layers,
  IdCard,
  Megaphone,
  CalendarDays,
  Settings,
  NotebookPen,
  Award,
} from "lucide-react";

/* ================= Helpers ================= */
const toLocalNoonISO = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x.toISOString();
};

type MenuItem = {
  key: string;
  label: string;
  to?: string;
  icon: React.ReactNode;
};

/* ================= Page ================= */
export default function TeacherMenuGrids() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const topbarISO = toLocalNoonISO(new Date());

  const items: MenuItem[] = useMemo(
    () => [
      {
        key: "kelas-saya",
        label: "Kelas Saya",
        to: "kelas",
        icon: <Users />,
      },
      {
        key: "kelas-all",
        label: "Seluruh Kelas",
        to: "all-classes",
        icon: <Layers />,
      },
      {
        key: "profil",
        label: "Profil Guru",
        to: "profil-guru",
        icon: <IdCard />,
      },
      {
        key: "pengumuman",
        label: "Pengumuman",
        to: "all-announcement-teacher",
        icon: <Megaphone />,
      },
      {
        key: "jadwal",
        label: "Jadwal",
        to: "jadwal",
        icon: <CalendarDays />,
      },
      {
        key: "pengaturan",
        label: "Pengaturan",
        to: "pengaturan",
        icon: <Settings />,
      },
      {
        key: "tugas",
        label: "Tugas",
        to: "tugas",
        icon: <NotebookPen />,
      },
      {
        key: "sertifikat",
        label: "Sertifikat",
        to: "sertifikat",
        icon: <Award />,
      },
    ],
    []
  );

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Menu Guru"
        gregorianDate={topbarISO}
        
        dateFmt={(iso) =>
          new Date(iso!).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        }
      />

      <main className="w-full px-4 md:px-6 py-4  md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main */}
          <section className="flex-1 flex flex-col space-y-6 min-w-0">
            <SectionCard palette={palette} className="p-4 md:p-5">
              <div className="mb-4 font-semibold text-base">
                Akses Cepat Guru
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {items.map((it) => (
                  <MenuTile key={it.key} item={it} palette={palette} />
                ))}
              </div>
            </SectionCard>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ================= Tile ================= */
function MenuTile({ item, palette }: { item: MenuItem; palette: Palette }) {
  return (
    <Link
      to={item.to || "#"}
      className="block hover:scale-[1.02] active:scale-[0.99] focus:outline-none"
      style={{ transition: "transform 160ms ease" }}
    >
      <div
        className="h-full w-full rounded-2xl border p-3 md:p-4 flex flex-col items-center justify-center text-center gap-2"
        style={{ borderColor: palette.silver1, background: palette.white1 }}
      >
        <span
          className="h-12 w-12 md:h-14 md:w-14 grid place-items-center rounded-xl"
          style={{ background: palette.primary2, color: palette.primary }}
        >
          {item.icon}
        </span>
        <div className="text-xs md:text-sm font-medium leading-tight line-clamp-2">
          {item.label}
        </div>
      </div>
    </Link>
  );
}
