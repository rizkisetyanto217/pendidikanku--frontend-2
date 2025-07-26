import { useEffect, useRef, useState } from "react";
import { Home, MapPin, Calendar, BookOpen, FileText } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function BottomNavbar() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams();
  const lastScrollY = useRef(0);
  const [visible, setVisible] = useState(true);

  const tabs = [
    { key: "beranda", label: "Beranda", icon: Home, path: `/masjid/${slug}` },
    {
      key: "jadwal",
      label: "Jadwal",
      icon: Calendar,
      path: `/masjid/${slug}/jadwal-kajian`,
    },
    {
      key: "donasi",
      label: "Donasi",
      icon: MapPin,
      path: `/masjid/${slug}/donasi`,
    },
    {
      key: "materi",
      label: "Materi",
      icon: BookOpen,
      path: `/masjid/${slug}/soal-materi`,
    },
    {
      key: "aktivitas",
      label: "Aktivitas",
      icon: FileText,
      path: `/masjid/${slug}/aktivitas`,
    },
  ];

  // Menentukan tab aktif dari URL saat ini
  const currentPath = location.pathname;
  const activeTab = (() => {
    if (currentPath.includes("/jadwal-kajian")) return "jadwal";
    if (currentPath.includes("/donasi")) return "donasi";
    if (currentPath.includes("/soal-materi")) return "materi";
    if (currentPath.includes("/aktivitas")) return "aktivitas";
    return "beranda";
  })();

  useEffect(() => {
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
  }, []);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 border-t w-full max-w-4xl mx-auto flex justify-between sm:justify-center sm:gap-4 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{
        backgroundColor: theme.white1,
        borderColor: theme.silver1,
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
        minHeight: "56px",
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            className="flex flex-col sm:flex-row items-center justify-center flex-1 sm:flex-initial sm:px-6 py-2 sm:py-4 transition"
            style={{
              backgroundColor: isActive ? theme.primary2 : "transparent",
            }}
          >
            <Icon
              className="w-5 h-5 sm:w-6 sm:h-6"
              style={{
                color: isActive ? theme.primary : theme.black2,
              }}
            />
            <span
              className="text-xs sm:text-base mt-1 sm:mt-0 sm:ml-2 font-medium"
              style={{
                color: isActive ? theme.primary : theme.black2,
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
