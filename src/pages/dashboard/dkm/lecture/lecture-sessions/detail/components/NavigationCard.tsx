import { Link, useLocation } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

interface NavigationCardProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  state?: any;
  isActive?: boolean; // ✅ tambahkan ini
}

export default function NavigationCard({
  icon,
  label,
  to,
  state,
}: NavigationCardProps) {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  return (
    <Link
      to={to}
      state={state} // ✅ kirim state ke link
      className="flex flex-col items-center justify-center text-center p-4 rounded-2xl border hover:shadow-md transition"
      style={{
        backgroundColor: theme.white1,
        borderColor: theme.primary2,
        color: theme.black1,
      }}
    >
      <div>{icon}</div>
      <span
        className="mt-3 text-sm font-medium"
        style={{ color: theme.black1 }}
      >
        {label}
      </span>
    </Link>
  );
}
