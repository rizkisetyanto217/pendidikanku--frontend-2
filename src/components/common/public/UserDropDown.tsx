import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LogOut,
  Settings,
  HelpCircle,
  MoreVertical,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useQueryClient } from "@tanstack/react-query";
import SharePopover from "./SharePopover";
import { useResponsive } from "@/hooks/isResponsive";
import { apiLogout } from "@/lib/axios";

import MyProfile, { MyProfileData } from "./MyProfile";
import ModalEditProfile, { EditProfileData } from "./ModalEditProfile";

interface PublicUserDropdownProps {
  variant?: "default" | "icon";
  withBg?: boolean;
}

/* ================= Helpers ================= */
const buildMyProfileData = (u: any): MyProfileData | undefined => {
  if (!u) return undefined;
  const p = u.profile || {};
  return {
    user: {
      full_name: u.full_name ?? u.name ?? "",
      email: u.email ?? "",
    },
    profile: {
      donation_name: p.donation_name ?? u.donation_name,
      photo_url: p.photo_url ?? u.avatar_url ?? u.avatarUrl,
      date_of_birth: p.date_of_birth,
      gender: p.gender,
      location: p.location,
      occupation: p.occupation,
      phone_number: p.phone_number,
      bio: p.bio,
    },
  };
};

const buildInitialEdit = (u: any): EditProfileData | undefined => {
  if (!u) return undefined;
  const p = u.profile || {};
  return {
    user: {
      full_name: u.full_name ?? u.name ?? "",
      email: u.email ?? "",
    },
    profile: {
      donation_name: p.donation_name,
      photo_url: p.photo_url,
      date_of_birth: p.date_of_birth,
      gender: p.gender,
      location: p.location,
      occupation: p.occupation,
      phone_number: p.phone_number,
      bio: p.bio,
    },
  };
};

/* ================= Component ================= */
export default function PublicUserDropdown({
  variant = "default",
  withBg = true,
}: PublicUserDropdownProps) {
  const { isDark, setDarkMode, themeName, setThemeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const { data: user } = useCurrentUser();
  const isLoggedIn = !!user;
  const profileData = useMemo(() => buildMyProfileData(user as any), [user]);

  const navigate = useNavigate();
  const { slug } = useParams();
  const { isMobile } = useResponsive();
  const queryClient = useQueryClient();

  const base = `/masjid/${slug}`;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Modal states
  const [profileOpen, setProfileOpen] = useState(false);
  // state
  const [editOpen, setEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editInitial, setEditInitial] = useState<EditProfileData | undefined>();

  // converter dari MyProfileData -> EditProfileData
 const fromMyProfileToEdit = (d: MyProfileData): EditProfileData => ({
   user: { full_name: d.user?.full_name, email: d.user?.email },
   profile: d.profile ? { ...d.profile } : undefined, // ⬅️ aman bila undefined
 });


  const handleLogout = async () => {
    setIsLoggingOut(true);
    setOpen(false);
    try {
      await apiLogout();
      queryClient.removeQueries({ queryKey: ["currentUser"], exact: true });
      navigate(slug ? `${base}/login` : "/login", { replace: true });
    } catch {
      navigate(slug ? `${base}/login` : "/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // close dropdown when clicking outside
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
        onClick={() => setOpen((v) => !v)}
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

            {/* Profil Saya */}
            <li>
              <button
                onClick={() => {
                  setOpen(false);
                  setProfileOpen(true);
                }}
                className={menuItemClass}
                onMouseOver={hoverStyle}
                onMouseOut={outStyle}
              >
                <User className="w-4 h-4" /> Profil Saya
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

      {/* ===== Modals ===== */}
      <MyProfile
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        data={profileData}
        onEdit={(mp) => {
          // ⬅️ sekarang MyProfile mengirim snapshot
          setProfileOpen(false);
          setEditInitial(fromMyProfileToEdit(mp)); // placeholder dari snapshot
          setEditOpen(true);
        }}
      />
      {editInitial && (
        <ModalEditProfile
          open={editOpen}
          onClose={() => setEditOpen(false)}
          initial={editInitial}
          loading={isSaving}
          onSave={async (payload, opts = {}) => {
            // ⬅️ default {}
            const { photoFile } = opts; // aman walau tidak dikirim
            try {
              setIsSaving(true);
              // TODO: kirim ke API…
            } finally {
              setIsSaving(false);
              setEditOpen(false);
            }
          }}
        />
      )}
    </div>
  );
}
