import { Menu, Moon, Sun } from "lucide-react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlThema from "@/hooks/useHTMLThema";
import UserDropdown from "./AdminDropDownTopbar";
import { Link } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface AdminTopbarProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
  title?: string;
}

export default function AdminTopbar({ onMenuClick, title }: AdminTopbarProps) {
  const { isDark, toggleDark, themeName } = useHtmlThema();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const { data: user, isLoading } = useCurrentUser();
  const isLoggedIn = !!user;

  return (
    <header
      className="flex items-center justify-between px-6 py-4 shadow md:ml-0"
      style={{
        backgroundColor: theme.white1,
        color: theme.black1,
        borderBottom: `1px solid ${theme.white3}`,
      }}
    >
      {/* Left: menu (mobile) */}
      <div className="md:hidden">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md transition hover:opacity-85"
          style={{
            border: `1px solid ${theme.white3}`,
            backgroundColor: theme.white2,
          }}
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center: optional title */}
      <div className="hidden md:block">
        {title ? (
          <h1
            className="text-sm md:text-base font-semibold"
            style={{ color: theme.black1 }}
          >
            {title}
          </h1>
        ) : (
          <span className="sr-only">Admin Topbar</span>
        )}
      </div>

      <div className="flex-1" />

      {/* Right: theme toggle + user */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleDark}
          className="p-2 rounded-full transition"
          style={{
            border: `1px solid ${theme.white3}`,
            backgroundColor: isDark ? theme.white2 : "transparent",
          }}
          aria-label="Toggle dark mode"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {isLoading ? null : isLoggedIn ? (
          <UserDropdown />
        ) : (
          <Link
            to="/login"
            className="text-sm font-medium hover:underline"
            style={{ color: theme.primary }}
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
