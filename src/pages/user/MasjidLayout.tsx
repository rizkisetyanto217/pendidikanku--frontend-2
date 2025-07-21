import { Outlet } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

export default function MasjidLayout() {
  const { isDark, toggleDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;


  return (
    <div
      className="w-full min-h-screen px-4 md:px-6 py-4 md:py-4"
      style={{ backgroundColor: themeColors.white2 }}
    >
      <div className="w-full max-w-2xl mx-auto">
        <Outlet />
        <div className="flex justify-end lg:mt-4">
        </div>
      </div>
    </div>
  );
}
