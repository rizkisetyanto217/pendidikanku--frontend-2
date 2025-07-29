// src/pages/settings/Appereance.tsx

import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import ThemeSelect from "@/components/pages/settings/ThemeSelect";

export default function MasjidAppereance() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

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
