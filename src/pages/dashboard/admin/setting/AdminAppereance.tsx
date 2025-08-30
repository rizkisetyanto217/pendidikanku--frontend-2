// src/pages/settings/Appereance.tsx

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import ThemeSelect from "@/components/pages/settings/ThemeSelect";

export default function AdminAppereance() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  return (
    <div
      className="p-6 rounded-xl shadow-sm"
      style={{ backgroundColor: theme.white1, color: theme.black1 }}
    >
      <h1 className="text-2xl font-bold mb-6">Tampilan</h1>
      <ThemeSelect />
    </div>
  );
}
