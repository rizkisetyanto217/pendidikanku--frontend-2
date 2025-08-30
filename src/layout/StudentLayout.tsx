import { Outlet } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import type { Palette } from "@/pages/sekolahislamku/components/ui/Primitives";

export default function StudentLayout() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

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
