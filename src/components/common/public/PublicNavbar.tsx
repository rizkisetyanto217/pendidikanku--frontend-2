import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import PublicUserDropdown from "./UserDropDown";

interface PublicNavbarProps {
  masjidName: string;
  hideOnScroll?: boolean; // ⬅️ opsional
}

export default function PublicNavbar({
  masjidName,
  hideOnScroll = false, // ⬅️ default = false
}: PublicNavbarProps) {
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const { data: user, isLoading } = useCurrentUser();
  const isLoggedIn = !!user;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🔁 Scroll hide logic (aktif hanya jika hideOnScroll)
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

  // 🔒 Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-6 py-3 shadow max-w-4xl mx-auto transition-transform duration-300 ${
        hideOnScroll && !visible ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{ backgroundColor: themeColors.white1 }}
    >
      <h2
        className="text-lg font-semibold"
        style={{ color: themeColors.black1 }}
      >
        {masjidName}
      </h2>

      {!isLoading && isLoggedIn ? (
        <PublicUserDropdown />
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="text-sm font-semibold hover:underline"
          style={{ color: themeColors.primary }}
        >
          Login
        </button>
      )}
    </div>
  );
}
