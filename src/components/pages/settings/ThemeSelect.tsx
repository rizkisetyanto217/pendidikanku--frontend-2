// src/components/common/ThemeSelect.tsx

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

interface ThemeSelectProps {
  label?: string;
  className?: string;
}

export default function ThemeSelect({
  label = "Tema",
  className = "",
}: ThemeSelectProps) {
  const { isDark, mode, setMode, themeName, setThemeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  return (
    <div className={`space-y-3 w-fit ${className}`}>
      {label && (
        <label
          htmlFor="themeSelect"
          className="block text-sm font-medium"
          style={{ color: theme.black2 }}
        >
          {label}
        </label>
      )}

      {/* Pilih mode terang/gelap/system */}
      <select
        id="modeSelect"
        onChange={(e) => setMode(e.target.value as any)}
        value={mode}
        className="appearance-none border pr-10 pl-4 py-2 rounded-md text-sm w-40 transition focus:outline-none focus:ring-2 focus:ring-teal-500"
        style={{
          backgroundColor: theme.white2,
          color: theme.black1,
          borderColor: theme.silver1,
        }}
      >
        <option value="light">Terang</option>
        <option value="dark">Gelap</option>
        <option value="system">Sistem</option>
      </select>

      {/* Pilih varian tema */}
      <select
        id="themeVariant"
        onChange={(e) => setThemeName(e.target.value as ThemeName)}
        value={themeName}
        className="appearance-none border pr-10 pl-4 py-2 rounded-md text-sm w-40 transition focus:outline-none focus:ring-2 focus:ring-teal-500"
        style={{
          backgroundColor: theme.white2,
          color: theme.black1,
          borderColor: theme.silver1,
        }}
      >
        <option value="default">Default</option>
        <option value="sunrise">Sunrise</option>
        <option value="midnight">Midnight</option>
      </select>
    </div>
  );
}
