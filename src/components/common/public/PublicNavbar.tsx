import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, HelpCircle, LogOut } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import PublicUserDropdown from "./UserDropDown";


interface PublicNavbarProps {
  masjidName: string;
}

export default function PublicNavbar({ masjidName }: PublicNavbarProps) {
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

  

  // Scroll hide navbar
  useEffect(() => {
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
  }, []);

  // Click outside to close dropdown
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

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(
      () => {
        window.location.href = "/login";
      }
    );
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-6 py-3 shadow max-w-4xl mx-auto transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
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
