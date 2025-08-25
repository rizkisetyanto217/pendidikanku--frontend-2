// src/components/common/public/MainNavbar.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";

// Routes public
const navItems: Array<{ label: string; to: string; end?: boolean }> = [
  { label: "Beranda", to: "/website", end: true },
  { label: "Dukungan", to: "/website/dukungan" },
  { label: "Panduan", to: "/website/panduan" },
  { label: "Fitur", to: "/website/fitur" },
  { label: "Tentang", to: "/website/tentang" },
  { label: "Kontak", to: "/website/hubungi-kami" },
];

type NavItemProps = {
  to: string;
  label: string;
  color: string;
  primary: string;
  end?: boolean;
  onClick?: () => void;
};

function NavItemLink({
  to,
  label,
  color,
  primary,
  end,
  onClick,
}: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className="relative text-sm font-medium group"
    >
      {({ isActive }) => (
        <span className="inline-block py-2" style={{ color }}>
          {label}
          <span
            className="absolute left-0 right-0 -bottom-1 h-0.5 rounded-full transition-all duration-200 ease-out"
            style={{
              backgroundColor: primary,
              opacity: isActive ? 1 : 0,
              transform: `scaleX(${isActive ? 1 : 0.25})`,
              transformOrigin: "left",
            }}
          />
          {!isActive && (
            <span
              className="absolute left-0 right-0 -bottom-1 h-px rounded-full transition-opacity duration-200 ease-out opacity-0 group-hover:opacity-40"
              style={{ backgroundColor: primary }}
            />
          )}
        </span>
      )}
    </NavLink>
  );
}

export default function WebsiteNavbar() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const [dark, setDark] = useState<boolean>(isDark);
  useEffect(() => setDark(isDark), [isDark]);

  const [open, setOpen] = useState(false);

  const toggleTheme = () => {
    const root = document.documentElement;
    const next = !dark;
    setDark(next);
    if (next) {
      root.classList.add("dark");
      try {
        localStorage.setItem("theme", "dark");
      } catch {}
    } else {
      root.classList.remove("dark");
      try {
        localStorage.setItem("theme", "light");
      } catch {}
    }
  };

  useEffect(() => {
    const saved = (() => {
      try {
        return localStorage.getItem("theme");
      } catch {
        return null;
      }
    })();
    if (!saved) {
      const preferDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const root = document.documentElement;
      if (preferDark) root.classList.add("dark");
      setDark(preferDark);
    }
  }, []);

  const iconColor = useMemo(() => ({ color: theme.black1 }), [theme]);

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 shadow-sm"
      style={{
        backgroundColor: dark ? theme.white2 : theme.white1,
        borderBottom: `1px solid ${theme.white3}`,
      }}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo */}
        <NavLink
          to="/website"
          end
          className="flex items-center gap-2 font-bold text-lg"
        >
          <img
            src="https://picsum.photos/200/300"
            alt="Logo"
            className="h-8 w-8 rounded object-cover"
          />
          <span style={{ color: theme.black1 }}>SekolahIslamku</span>
        </NavLink>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <NavItemLink
              key={item.label}
              to={item.to}
              end={item.end}
              label={item.label}
              color={theme.black1}
              primary={theme.primary}
            />
          ))}
        </div>

        {/* Right Controls (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition hover:opacity-80"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              //   border: `1px solid ${theme.white3}`,
              background: dark ? theme.white2 : theme.white1,
              ...iconColor,
            }}
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <NavLink
            to="/website/daftar-sekarang"
            className="rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90"
            style={{ backgroundColor: theme.primary, color: theme.white1 }}
          >
            Daftar Sekarang
          </NavLink>
        </div>

        {/* Mobile Controls: theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition hover:opacity-80"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              //   border: `1px solid ${theme.white3}`,
              background: dark ? theme.white2 : theme.white1,
              ...iconColor,
            }}
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            className="p-2 rounded-lg"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
            style={iconColor}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          className="md:hidden flex flex-col gap-3 px-6 py-4"
          style={{
            backgroundColor: dark ? theme.white2 : theme.white1,
            borderTop: `1px solid ${theme.white3}`,
          }}
        >
          {navItems.map((item) => (
            <NavItemLink
              key={item.label}
              to={item.to}
              end={item.end}
              label={item.label}
              color={theme.black1}
              primary={theme.primary}
              onClick={() => setOpen(false)}
            />
          ))}

          <NavLink
            to="/website/daftar-sekarang"
            className="mt-2 rounded-full px-4 py-2 text-center text-sm font-medium transition hover:opacity-90"
            style={{ backgroundColor: theme.primary, color: theme.white1 }}
            onClick={() => setOpen(false)}
          >
            Daftar Sekarang
          </NavLink>
        </div>
      )}
    </nav>
  );
}