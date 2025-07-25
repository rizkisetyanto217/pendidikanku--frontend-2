import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import clsx from "clsx";
import toast from "react-hot-toast";

interface PageHeaderProps {
  title: string;
  backTo?: string;
  actionButton?: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
  onBackClick?: () => void;
}

export default function PageHeaderUser({
  title,
  backTo,
  actionButton,
  onBackClick,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { isDark, toggleDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const { slug } = useParams();

  const { data: masjidData } = useQuery({
    queryKey: ["masjid-header", slug],
    queryFn: async () => {
      const res = await axios.get(`/public/masjids/${slug}`);
      return res.data?.data;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // ⏳ cache 10 menit
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="px-1 pt-1 pb-1 mb-5 relative">
      <div className="flex items-center justify-between mb-2">
        {/* Back & Title */}
        <div className="flex items-center gap-4">
          {(backTo || onBackClick) && (
            <button
              onClick={() => {
                if (onBackClick) return onBackClick();
                if (backTo) return navigate(backTo);
              }}
              className="p-2 rounded-lg"
              style={{
                backgroundColor: theme.white3,
                color: theme.black1,
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <h1 className="text-2xl font-medium" style={{ color: theme.black1 }}>
            {title}
          </h1>
        </div>

        {/* Action + Dropdown */}
        <div className="flex items-center gap-2">
          {actionButton && (
            <button
              onClick={() => {
                if (actionButton.onClick) return actionButton.onClick();
                if (actionButton.to) return navigate(actionButton.to);
              }}
              className="py-2 px-4 rounded-lg"
              style={{
                backgroundColor: theme.primary,
                color: theme.white1,
              }}
            >
              {actionButton.label}
            </button>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-2 rounded-lg"
              style={{
                backgroundColor: theme.white3,
                color: theme.black1,
              }}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            <div
              className={clsx(
                "absolute right-0 mt-2 w-44 rounded-md shadow-md border transform transition duration-150 origin-top-right z-50",
                showMenu
                  ? "scale-100 opacity-100"
                  : "scale-95 opacity-0 pointer-events-none"
              )}
              style={{
                backgroundColor: theme.white1,
                borderColor: theme.silver1,
              }}
            >
              {masjidData && (
                <>
                  <LinkDropdownItem
                    label="🏠 Beranda"
                    onClick={() =>
                      navigate(`/masjid/${masjidData.masjid_slug}`)
                    }
                  />
                  <LinkDropdownSubmenu
                    label="📚 Menu"
                    items={[
                      {
                        label: "🏛️ Profil Masjid",
                        onClick: () =>
                          navigate(`/masjid/${masjidData.masjid_slug}/profil`),
                      },
                      {
                        label: "📆 Jadwal Kajian",
                        onClick: () =>
                          navigate(
                            `/masjid/${masjidData.masjid_slug}/jadwal-kajian`
                          ),
                      },
                      {
                        label: "📰 Laporan Keuangan",
                        onClick: () =>
                          navigate(
                            `/masjid/${masjidData.masjid_slug}/keuangan`
                          ),
                      },
                    ]}
                  />

                  <button
                    onClick={() => {
                      toggleDark();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    style={{ color: theme.black1 }}
                  >
                    {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
                  </button>

                  <LinkDropdownItem
                    label="🔗 Bagikan Halaman Ini"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link halaman berhasil disalin!");
                      setShowMenu(false);
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkDropdownItem({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      style={{ color: theme.black1 }}
    >
      {label}
    </button>
  );
}

function LinkDropdownSubmenu({
  label,
  items,
}: {
  label: string;
  items: { label: string; onClick: () => void }[];
}) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        style={{ color: theme.black1 }}
      >
        {label} ▾
      </button>

      <div
        className={clsx(
          "absolute left-0 mt-1 w-full rounded-md shadow-md border z-50 transition-all duration-150",
          open
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        )}
        style={{
          backgroundColor: theme.white1,
          borderColor: theme.silver1,
        }}
      >
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              item.onClick();
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            style={{ color: theme.black1 }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
