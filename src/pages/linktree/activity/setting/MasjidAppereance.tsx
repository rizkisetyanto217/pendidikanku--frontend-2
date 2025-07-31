// src/pages/settings/Appereance.tsx

import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import ThemeSelect from "@/components/pages/settings/ThemeSelect";

export default function MasjidAppereance() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <div
     
    >
      <h1 className="text-2xl font-bold mb-6">Tampilan</h1>
      <ThemeSelect />
    </div>
  );
}
