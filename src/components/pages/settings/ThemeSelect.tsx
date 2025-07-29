// src/components/common/ThemeSelect.tsx

import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

interface ThemeSelectProps {
  label?: string;
  className?: string;
}

export default function ThemeSelect({
  label = "Tema",
  className = "",
}: ThemeSelectProps) {
  const { isDark, setDarkMode } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDarkMode(e.target.value === "dark");
  };

  return (
    <div className={`relative w-fit ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-2" htmlFor="themeSelect">
          {label}
        </label>
      )}
      <select
        id="themeSelect"
        onChange={handleChange}
        value={isDark ? "dark" : "light"}
        className="appearance-none border pr-10 pl-4 py-2 rounded-md text-sm w-40"
        style={{
          backgroundColor: theme.white2,
          color: theme.black1,
          borderColor: theme.silver1,
        }}
      >
        <option value="light">Terang</option>
        <option value="dark">Gelap</option>
      </select>

      {/* Icon custom dropdown */}
      <div className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400">
        ▼
      </div>
    </div>
  );
}
