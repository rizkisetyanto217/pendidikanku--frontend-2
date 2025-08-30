import { MenuIcon, MoonIcon, SunIcon } from "lucide-react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import UserDropdown from "./AdminDropDownTopbar";
import { Link } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface AdminTopbarProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
  title?: string;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { isDark, toggleDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const { data: user, isLoading } = useCurrentUser();
  const isLoggedIn = !!user;

  return (
    <header
      className="flex items-center justify-between px-6 py-4 shadow md:ml-0"
      style={{
        backgroundColor: themeColors.white1,
        color: themeColors.black1,
      }}
    >
      <div className="md:hidden">
        <button onClick={onMenuClick}>
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <button
          onClick={toggleDark}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {isDark ? (
            <SunIcon className="w-5 h-5 text-yellow-400" />
          ) : (
            <MoonIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {isLoading ? null : isLoggedIn ? (
          <UserDropdown />
        ) : (
          <Link
            to="/login"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
