// src/components/common/public/UserDropDown.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LogOut,
  Settings,
  HelpCircle,
  MoreVertical,
  Moon,
  Sun,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useQueryClient } from "@tanstack/react-query";
import SharePopover from "./SharePopover";
import { useResponsive } from "@/hooks/isResponsive";
import { apiLogout } from "@/lib/axios";

interface PublicUserDropdownProps {
  variant?: "default" | "icon";
  withBg?: boolean;
}

export default function PublicUserDropdown({
  variant = "default",
  withBg = true,
}: PublicUserDropdownProps) {
  const { isDark, setDarkMode, themeName, setThemeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const { data: user } = useCurrentUser();
  const isLoggedIn = !!user;
  const navigate = useNavigate();
  const { slug } = useParams();

  const base = `/masjid/${slug}`;
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useResponsive();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setOpen(false);
    try {
      await apiLogout();
      queryClient.removeQueries({ queryKey: ["currentUser"], exact: true });
      navigate(slug ? `${base}/login` : "/login", { replace: true });
    } catch (err: any) {
      console.error("Logout error (ignored):", err?.response ?? err);
      navigate(slug ? `${base}/login` : "/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItemClass =
    "w-full flex items-center gap-2 px-4 py-2 text-left transition";
  const hoverStyle = (e: React.MouseEvent<HTMLButtonElement>) =>
    (e.currentTarget.style.backgroundColor = theme.white2);
  const outStyle = (e: React.MouseEvent<HTMLButtonElement>) =>
    (e.currentTarget.style.backgroundColor = "transparent");

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={`h-9 w-9 grid place-items-center rounded-xl transition ${
          variant === "default" ? "px-2" : ""
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          backgroundColor: withBg ? theme.white3 : "transparent",
          color: theme.black1,
        }}
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-lg border z-50"
          role="menu"
          style={{
            backgroundColor: theme.white1,
            borderColor: theme.silver1,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <ul className="py-2 text-sm" style={{ color: theme.black1 }}>
            {!isLoggedIn && (
              <li>
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/login");
                  }}
                  className={menuItemClass}
                  onMouseOver={hoverStyle}
                  onMouseOut={outStyle}
                >
                  <LogOut className="w-4 h-4" /> Login
                </button>
              </li>
            )}

            {isLoggedIn && (
              <li>
                <button
                  onClick={() => {
                    setOpen(false);
                    const url = isMobile
                      ? `${base}/aktivitas/pengaturan/menu`
                      : `${base}/aktivitas/pengaturan/profil-saya`;
                    navigate(url);
                  }}
                  className={menuItemClass}
                  onMouseOver={hoverStyle}
                  onMouseOut={outStyle}
                >
                  <Settings className="w-4 h-4" /> Pengaturan
                </button>
              </li>
            )}

            {/* Bantuan */}
            <li>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate(`${base}/bantuan`);
                }}
                className={menuItemClass}
                onMouseOver={hoverStyle}
                onMouseOut={outStyle}
              >
                <HelpCircle className="w-4 h-4" /> Bantuan
              </button>
            </li>

            {/* Toggle Dark/Light */}
            <li>
              <button
                onClick={() => {
                  setDarkMode(!isDark);
                  setOpen(false);
                }}
                className={menuItemClass}
                onMouseOver={hoverStyle}
                onMouseOut={outStyle}
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4" /> Mode Terang
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" /> Mode Gelap
                  </>
                )}
              </button>
            </li>

            {/* Pilih Tema */}
            <li>
              <div className="px-4 py-2">
                <p className="text-xs mb-1" style={{ color: theme.silver2 }}>
                  Pilih Tema
                </p>
                <select
                  value={themeName}
                  onChange={(e) => {
                    setThemeName(e.target.value as ThemeName);
                    setOpen(false);
                  }}
                  className="w-full border rounded px-2 py-1 text-sm"
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
            </li>

            {/* Share */}
            <li>
              <div className="px-4 py-2">
                <SharePopover
                  title={document.title}
                  url={window.location.href}
                  forceCustom
                />
              </div>
            </li>

            {/* Logout */}
            {isLoggedIn && (
              <li>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`${menuItemClass} disabled:opacity-60 disabled:cursor-not-allowed`}
                  style={{ color: theme.error1 }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = theme.error2)
                  }
                  onMouseOut={outStyle}
                >
                  {isLoggingOut ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ color: theme.error1 }}
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 11-8 8z"
                        />
                      </svg>
                      <span>Keluar...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" /> Keluar
                    </>
                  )}
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
