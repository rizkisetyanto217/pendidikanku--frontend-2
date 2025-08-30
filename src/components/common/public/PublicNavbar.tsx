import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import PublicUserDropdown from "./UserDropDown";

interface PublicNavbarProps {
  masjidName: string;
  masjidSlug?: string; // 🔁 optional, biar bisa fallback dari URL
  hideOnScroll?: boolean;
  showLogin?: boolean; // ✅ baru: bisa sembunyikan tombol login
  loginEnabled?: boolean; // ✅ baru: paksa enable/disable (default true)
}

export default function PublicNavbar({
  masjidName,
  masjidSlug,
  hideOnScroll = false,
  showLogin = true, // default: tampilkan login
  loginEnabled = true, // default: tombol login aktif
}: PublicNavbarProps) {
  const navigate = useNavigate();
  const { slug: slugFromParams } = useParams<{ slug?: string }>();

  // 🔁 Resolve slug dengan prioritas: props → useParams → pathname
  const resolvedSlug = useMemo(() => {
    if (masjidSlug && masjidSlug.trim()) return masjidSlug.trim();
    if (slugFromParams && slugFromParams.trim()) return slugFromParams.trim();
    const parts = window.location.pathname.split("/").filter(Boolean);
    // cari pola /masjid/:slug/...
    const masjidIdx = parts.indexOf("masjid");
    if (masjidIdx !== -1 && parts[masjidIdx + 1]) return parts[masjidIdx + 1];
    return ""; // terakhir kalau benar2 ga ketemu
  }, [masjidSlug, slugFromParams]);

  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const { data: user, isLoading } = useCurrentUser();
  const isLoggedIn = !!user;

  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hideOnScroll) return;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setVisible(
            currentScrollY <= lastScrollY.current || currentScrollY < 80
          );
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hideOnScroll]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // setDropdownOpen(false); // kalau pakai state dropdown
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLoginClick = () => {
    if (resolvedSlug) {
      navigate(`/masjid/${resolvedSlug}/login`);
    } else {
      // fallback aman kalau slug belum kebaca → arahkan ke /login umum
      console.warn("[PublicNavbar] masjidSlug unresolved, fallback to /login");
      navigate(`/login`);
    }
  };

  const willDisableLogin = !resolvedSlug || !loginEnabled; // ✅ gabung kondisi

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-6 py-3 shadow max-w-2xl mx-auto transition-transform duration-300 ${
        hideOnScroll && !visible ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{ backgroundColor: themeColors.white1, color: themeColors.black1 }}
    >
      <h2 className="text-lg font-semibold">{masjidName}</h2>

      <div className="flex items-center gap-2" ref={dropdownRef}>
        {!isLoading && isLoggedIn ? (
          <PublicUserDropdown />
        ) : showLogin ? ( // ✅ hanya render tombol login kalau showLogin = true
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoginClick}
              disabled={willDisableLogin} // ✅ tetap bisa dinonaktifkan
              aria-disabled={willDisableLogin}
              className="text-sm font-semibold px-4 py-2 rounded-md shadow-sm hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: themeColors.primary,
                color: themeColors.white1,
              }}
              title={
                willDisableLogin
                  ? !resolvedSlug
                    ? "Menyiapkan halaman..."
                    : "Login dimatikan untuk halaman ini"
                  : "Login"
              }
            >
              Login
            </button>
            <PublicUserDropdown variant="icon" />
          </div>
        ) : (
          // ✅ kalau showLogin = false, cukup icon menu saja (atau kosong)
          <PublicUserDropdown variant="icon" />
        )}
      </div>
    </div>
  );
}
