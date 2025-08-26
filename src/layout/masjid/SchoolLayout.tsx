// src/pages/sekolahislamku/layouts/SchoolLayout.tsx
import { Outlet } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import type { Palette } from "@/pages/sekolahislamku/components/ui/Primitives";

import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

export default function SchoolLayout() {
  const { isDark } = useHtmlDarkMode();
  const palette = (isDark ? colors.dark : colors.light) as Palette;

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* TopBar untuk mobile & desktop */}
      {/* <SchoolTopBar
        palette={palette}
        // hijriDate="15 Rajab 1446"
        // gregorianDate="2025-01-15"
        // dateFmt={(iso) => new Date(iso).toLocaleDateString('id-ID')}
      /> */}

      {/* Container + 2 kolom saat lg+ */}
      <div className="mx-auto max-w-6xl pb-6 lg:flex lg:items-start lg:gap-4">
        {/* Sidebar Navigation (desktop only) */}
        <ParentSidebar palette={palette} />

        {/* Konten halaman */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
