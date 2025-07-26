import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, HelpCircle, LogOut } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

interface PublicNavbarProps {
  masjidName: string;
}

export default function PublicNavbar({ masjidName }: PublicNavbarProps) {
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const [userName, setUserName] = useState<string | null>(null);
  const [tokenExists, setTokenExists] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Throttle logic with requestAnimationFrame
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
            setVisible(false); // Scroll down
          } else {
            setVisible(true); // Scroll up
          }
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Detect click outside dropdown
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

  // Get token and user data
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userData = localStorage.getItem("userData");

    setTokenExists(!!token);

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user?.user_name) {
          setUserName(user.user_name);
        }
      } catch (error) {
        console.error("❌ Gagal parsing userData:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-6 py-4 shadow max-w-4xl mx-auto transition-transform duration-300 ${
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

      {tokenExists && userName ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-sm font-medium flex items-center gap-2"
            style={{ color: themeColors.black2 }}
          >
            👤 {userName}
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-lg border z-50"
              style={{
                backgroundColor: themeColors.white1,
                borderColor: themeColors.silver1,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              <ul
                className="py-2 text-sm"
                style={{ color: themeColors.black1 }}
              >
                <li>
                  <button
                    onClick={() => navigate("/profil")}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <User className="w-4 h-4" /> Profil
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/dkm/profil-saya")}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Settings className="w-4 h-4" /> Pengaturan
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/bantuan")}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <HelpCircle className="w-4 h-4" /> Bantuan
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-100 dark:hover:bg-red-800"
                  >
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
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
