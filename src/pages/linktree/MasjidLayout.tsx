// MasjidLayout.tsx
import { Outlet } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

export default function MasjidLayout() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  return (
    <div
      className="w-full h-screen flex flex-col"
      style={{ backgroundColor: themeColors.white2 }}
    >
      {/* Area konten scrollable */}
      <div className="w-full flex-1 overflow-y-auto px-4 md:px-6">
        <div className="w-full max-w-2xl mx-auto pb-24 pt-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
