import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import PublicUserDropdown from "@/components/common/public/UserDropDown";

export interface LinktreeNavbarProps {
  /** Nama brand di kiri (default: "sekolahislamku") */
  brandName?: string;
  /** Optional: logo brand; jika kosong akan pakai inisial */
  brandIconSrc?: string;
  /** Klik brand ke mana (default: "/") */
  onBrandClick?: () => void;
  /** Ketika navbar overlap di atas cover (glass → solid saat scroll) */
  coverOverlap?: boolean;
  /** Tampilkan hamburger/user menu (default: true) */
  showMenu?: boolean;
  /** Ganti komponen menu default (mis. hamburger custom) */
  menuSlot?: React.ReactNode;
  /** Class max-width container (default: max-w-screen-xl) */
  maxWidthClass?: string;
}

export default function LinktreeNavbar({
  brandName = "sekolahislamku",
  brandIconSrc,
  onBrandClick,
  coverOverlap = true,
  showMenu = true,
  menuSlot,
  maxWidthClass = "max-w-screen-xl",
}: LinktreeNavbarProps) {
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const [solid, setSolid] = useState(!coverOverlap);
  const ticking = useRef(false);

  useEffect(() => {
    if (!coverOverlap) return;
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setSolid(y > 8);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [coverOverlap]);

  const containerClass = useMemo(() => {
    if (!coverOverlap) return "bg-white dark:bg-zinc-900 border-b";
    return solid
      ? "bg-white/90 dark:bg-zinc-900/70 border-b backdrop-blur-md"
      : "bg-transparent";
  }, [coverOverlap, solid]);

  const borderColor = theme.white3;

  const handleBrandClick = () => {
    if (onBrandClick) return onBrandClick();
    try {
      navigate("/");
    } catch {
      /* noop */
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* full width on desktop; kontrol via maxWidthClass */}
      <div className={`mx-auto w-full ${maxWidthClass} px-3 sm:px-4`}>
        <nav
          className={`mt-2 sm:mt-3 h-12 sm:h-14 grid grid-cols-[1fr_auto] items-center rounded-2xl transition-all ${containerClass}`}
          style={{ borderColor }}
          aria-label="Linktree navbar"
        >
          {/* LEFT: Brand (ikon + nama) */}
          <button
            onClick={handleBrandClick}
            className="flex items-center gap-2 pl-1 sm:pl-1.5 group"
            aria-label="Beranda sekolahislamku"
            title={brandName}
            style={{ color: theme.black1 }}
          >
            {brandIconSrc ? (
              <img
                src={brandIconSrc}
                alt={brandName}
                className="h-8 w-8 rounded-full object-cover border"
                style={{ borderColor }}
              />
            ) : (
              <div
                className="h-8 w-8 rounded-full grid place-items-center text-xs font-bold border"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.white1,
                  borderColor: theme.primary,
                }}
              >
                SI
              </div>
            )}

            <span className="text-sm sm:text-base font-semibold">
              {brandName}
            </span>
          </button>

          {/* RIGHT: Only hamburger / user menu */}
          <div className="pr-1 sm:pr-1.5 flex items-center gap-1.5">
            {showMenu
              ? (menuSlot ?? <PublicUserDropdown variant="icon" />)
              : null}
          </div>
        </nav>
      </div>
    </div>
  );
}
