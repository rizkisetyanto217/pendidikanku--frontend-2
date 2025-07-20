import { Outlet } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

export default function MasjidLayout() {
  const { isDark, toggleDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const DarkToggle = () => (
    <button
      onClick={toggleDark}
      className="text-sm px-3 py-1 rounded border font-medium"
      style={{
        backgroundColor: themeColors.white3,
        color: themeColors.black1,
        borderColor: themeColors.silver1,
      }}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );

  return (
    <div
      className="w-full min-h-screen px-4 md:px-6 py-4 md:py-4"
      style={{ backgroundColor: themeColors.white2 }}
    >
      <div className="w-full max-w-3xl mx-auto">
        <Outlet />
        <div className="flex justify-end lg:mt-4">
          <DarkToggle />
        </div>
      </div>
    </div>
  );
}
