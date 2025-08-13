import { Outlet } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import type { Palette } from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentSidebarNav from "@/pages/sekolahislamku/components/home/StudentSideBarNav";

export default function StudentLayout() {
  const { isDark } = useHtmlDarkMode();
  const palette = (isDark ? colors.dark : colors.light) as Palette;

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Container + 2 kolom saat lg+ */}
      <div className="mx-auto max-w-6xl pb-6 lg:flex lg:items-start lg:gap-4">
        {/* Konten halaman */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
