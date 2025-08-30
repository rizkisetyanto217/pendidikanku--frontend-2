import { useEffect, useRef, useState } from "react";
import { Home, MapPin, Calendar, BookOpen, FileText } from "lucide-react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useLocation, useNavigate, useParams } from "react-router-dom";

interface BottomNavbarProps {
  hideOnScroll?: boolean;
}

export default function BottomNavbar({
  hideOnScroll = false,
}: BottomNavbarProps) {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams();
  const lastScrollY = useRef(0);
  const [visible, setVisible] = useState(true);

  const tabs = [
    { key: "beranda", label: "Beranda", icon: Home, path: `/masjid/${slug}` },
    {
      key: "materi",
      label: "Kajian",
      icon: BookOpen,
      path: `/masjid/${slug}/soal-materi`,
    },
    // {
    //   key: "donasi",
    //   label: "Donasi",
    //   icon: MapPin,
    //   path: `/masjid/${slug}/donasi`,
    // },
    {
      key: "post",
      label: "Postingan",
      icon: Calendar,
      path: `/masjid/${slug}/post`,
    },
    {
      key: "aktivitas",
      label: "Aktivitas",
      icon: FileText,
      path: `/masjid/${slug}/aktivitas`,
    },
  ];

  const currentPath = location.pathname;
  const activeTab = (() => {
    if (currentPath.includes("/post")) return "post";
    // if (currentPath.includes("/donasi")) return "donasi";
    if (currentPath.includes("/soal-materi") || currentPath.includes("/tema"))
      return "materi";
    if (currentPath.includes("/aktivitas")) return "aktivitas";
    return "beranda";
  })();

  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hideOnScroll]);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 border-t w-full max-w-2xl mx-auto
  flex justify-between gap-2 sm:justify-center sm:gap-6
  transition-transform duration-300 ${hideOnScroll && !visible ? "translate-y-full" : "translate-y-0"}`}
      style={{
        backgroundColor: theme.white1,
        borderColor: theme.silver1,
        minHeight: "56px",
        paddingLeft: "12px", // ≈ px-3
        paddingRight: "12px",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 6px)", // ekstra ruang di iPhone, dll
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            className="flex flex-col sm:flex-row items-center justify-center flex-1 sm:flex-initial sm:px-5 py-2 sm:py-4 transition"
            style={{
              backgroundColor: isActive ? theme.primary2 : "transparent",
            }}
          >
            <Icon
              className="w-5 h-5 sm:w-6 sm:h-6"
              style={{
                color: isActive ? theme.black1 : theme.black2,
              }}
            />
            <span
              className="text-xs sm:text-base mt-1 sm:mt-0 sm:ml-2 font-medium"
              style={{
                color: isActive ? theme.black1 : theme.black2,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
