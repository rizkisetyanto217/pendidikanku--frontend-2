import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LogOut, Settings, User, HelpCircle } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import SharePopover from "./SharePopover";

export default function PublicUserDropdown() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();
  const { slug } = useParams();

  const base = `/masjid/${slug}`;
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = user?.user_name || "User";
  const userRole = user?.role || "Publik";

  const queryClient = useQueryClient();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post("/api/auth/logout", null, { withCredentials: true });

      queryClient.removeQueries({ queryKey: ["currentUser"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["currentUser"], exact: true });

      sessionStorage.clear();
      localStorage.clear();

      setTimeout(() => {
        navigate("/login");
      }, 150);
    } catch (err) {
      console.error("Logout error:", err);
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-2 rounded-md transition"
        style={{
          backgroundColor: open ? theme.white2 : "transparent",
        }}
      >
        <img
          src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><circle cx='16' cy='16' r='16' fill='%23CCCCCC' /></svg>"
          alt="Profile"
          className="w-8 h-8 rounded-full"
        />
        <div className="text-left text-sm hidden sm:block">
          <div className="font-semibold" style={{ color: theme.black1 }}>
            {userName}
          </div>
          <div className="text-xs" style={{ color: theme.silver2 }}>
            {userRole}
          </div>
        </div>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-lg border z-50"
          style={{
            backgroundColor: theme.white1,
            borderColor: theme.silver1,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <ul className="py-2 text-sm" style={{ color: theme.black1 }}>
            <li>
              <button
                onClick={() => navigate(`${base}/profil`)}
                className="w-full flex items-center gap-2 px-4 py-2 text-left transition"
                style={{ backgroundColor: "transparent" }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.white2)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <User className="w-4 h-4" /> Profil
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate(`${base}/profil-saya`)}
                className="w-full flex items-center gap-2 px-4 py-2 text-left transition"
                style={{ backgroundColor: "transparent" }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.white2)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Settings className="w-4 h-4" /> Pengaturan
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate(`${base}/bantuan`)}
                className="w-full flex items-center gap-2 px-4 py-2 text-left transition"
                style={{ backgroundColor: "transparent" }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.white2)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <HelpCircle className="w-4 h-4" /> Bantuan
              </button>
            </li>

            {/* Bagikan */}
            <li>
              <div className="px-4 py-2">
                <SharePopover
                  title={document.title}
                  url={window.location.href}
                  forceCustom={true}
                />
              </div>
            </li>

            <li>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-left transition disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  color: theme.error1,
                  backgroundColor: "transparent",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.error2)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
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
          </ul>
        </div>
      )}
    </div>
  );
}
