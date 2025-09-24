// src/pages/sekolahislamku/dashboard-teacher/menu-utama/settings/TeacherSettings.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import {
  Bell,
  Lock,
  User,
  Palette as PaletteIcon,
  ArrowLeft,
  Check,
  ChevronRight,
  Mail,
  Phone,
  Shield,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  LogOut,
  Settings,
  Camera,
  Edit,
} from "lucide-react";

/* ===== Helpers ===== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

const hijriWithWeekday = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

const TODAY_ISO = new Date().toISOString();

/* ===== Types ===== */
type TeacherSettingsProps = {
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
};

type SettingItem = {
  icon: any;
  title: string;
  subtitle?: string;
  action?: "toggle" | "navigate" | "button";
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onClick?: () => void;
  rightContent?: React.ReactNode;
};

/* ===== Component ===== */
const TeacherSettings: React.FC<TeacherSettingsProps> = ({
  showBack = false,
  backTo,
  backLabel = "Kembali",
}) => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const SettingRow: React.FC<SettingItem> = ({
    icon: Icon,
    title,
    subtitle,
    action,
    value,
    onToggle,
    onClick,
    rightContent,
  }) => (
    <div
      className={`flex items-center justify-between p-4 ${action === "navigate" ? "cursor-pointer hover:bg-opacity-50" : ""}`}
      style={
        action === "navigate"
          ? {
              transition: "background-color 0.2s",
            }
          : {}
      }
      onMouseEnter={
        action === "navigate"
          ? (e) => {
              e.currentTarget.style.backgroundColor = palette.silver1 + "30";
            }
          : undefined
      }
      onMouseLeave={
        action === "navigate"
          ? (e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }
          : undefined
      }
      onClick={action === "navigate" ? onClick : undefined}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: palette.primary + "20" }}
        >
          <Icon size={18} style={{ color: palette.primary }} />
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          {subtitle && (
            <p className="text-sm mt-0.5" style={{ color: palette.black2 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {rightContent}
        {action === "toggle" && (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={value}
              onChange={(e) => onToggle?.(e.target.checked)}
            />
            <div
              className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                value ? "shadow-sm" : ""
              }`}
              style={{
                backgroundColor: value ? palette.primary : palette.silver1,
              }}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  value ? "translate-x-5" : "translate-x-0.5"
                } mt-0.5`}
              />
            </div>
          </label>
        )}
        {action === "navigate" && (
          <ChevronRight size={16} style={{ color: palette.black2 }} />
        )}
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Pengaturan"
        gregorianDate={TODAY_ISO}
        hijriDate={hijriWithWeekday(TODAY_ISO)}
        dateFmt={dateLong}
        showBack
      />

      <main className="w-full px-4 md:px-6 py-4  md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Header */}
            <div className="md:flex  hidden items-center gap-4">
              <Btn
                palette={palette}
                onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                variant="ghost"
              >
                <ArrowLeft size={20} />
              </Btn>
              <h1 className="font-semibold text-xl">Pengaturan</h1>
            </div>

            {/* Profile Card */}
            <SectionCard palette={palette}>
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white"
                      style={{ backgroundColor: palette.primary }}
                    >
                      UA
                    </div>
                    <button
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md border"
                      style={{ borderColor: palette.silver1 }}
                    >
                      <Camera size={12} style={{ color: palette.black2 }} />
                    </button>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg">Ustadz Abdullah</h2>
                    <p className="text-sm" style={{ color: palette.black2 }}>
                      abdullah@sekolah.id
                    </p>
                    <Badge palette={palette} variant="success" className="mt-2">
                      Guru Aktif
                    </Badge>
                  </div>
                  <Btn palette={palette} variant="outline" size="sm">
                    <Edit size={14} />
                    Edit
                  </Btn>
                </div>
              </div>
            </SectionCard>

            {/* Account Settings */}
            <SectionCard palette={palette}>
              <div className="p-2">
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: palette.silver1 }}
                >
                  <h3 className="font-semibold text-base">Akun & Keamanan</h3>
                </div>
                <div
                  className="divide-y"
                  style={{
                    borderColor: palette.silver1,
                  }}
                >
                  <SettingRow
                    icon={User}
                    title="Informasi Personal"
                    subtitle="Nama, email, dan detail profil"
                    action="navigate"
                    onClick={() => navigate("/sekolahislamku/teacher/profile")}
                  />
                  <SettingRow
                    icon={Lock}
                    title="Keamanan"
                    subtitle="Ubah kata sandi dan keamanan akun"
                    action="navigate"
                    onClick={() => navigate("/sekolahislamku/teacher/security")}
                  />
                  <SettingRow
                    icon={Shield}
                    title="Privasi"
                    subtitle="Kontrol privasi dan data personal"
                    action="navigate"
                    onClick={() => navigate("/sekolahislamku/teacher/privacy")}
                  />
                </div>
              </div>
            </SectionCard>

            {/* App Settings */}
            <SectionCard palette={palette}>
              <div className="p-2">
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: palette.silver1 }}
                >
                  <h3 className="font-semibold text-base">Aplikasi</h3>
                </div>
                <div
                  className="divide-y"
                  style={{
                    borderColor: palette.silver1,
                  }}
                >
                  <SettingRow
                    icon={isDark ? Sun : Moon}
                    title="Mode Tampilan"
                    subtitle={`Saat ini: ${isDark ? "Gelap" : "Terang"}`}
                    action="toggle"
                    value={isDark}
                    onToggle={(value) => {
                      // Toggle theme logic here
                      console.log("Toggle theme:", value);
                    }}
                  />
                  <SettingRow
                    icon={Bell}
                    title="Notifikasi Push"
                    subtitle="Terima pemberitahuan penting"
                    action="toggle"
                    value={notifEnabled}
                    onToggle={setNotifEnabled}
                  />
                  <SettingRow
                    icon={Mail}
                    title="Email Notifikasi"
                    subtitle="Notifikasi melalui email"
                    action="toggle"
                    value={emailNotif}
                    onToggle={setEmailNotif}
                  />
                  <SettingRow
                    icon={soundEnabled ? Volume2 : VolumeX}
                    title="Suara Notifikasi"
                    subtitle="Bunyi untuk notifikasi"
                    action="toggle"
                    value={soundEnabled}
                    onToggle={setSoundEnabled}
                  />
                </div>
              </div>
            </SectionCard>

            {/* More Options */}
            <SectionCard palette={palette}>
              <div className="p-2">
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: palette.silver1 }}
                >
                  <h3 className="font-semibold text-base">Lainnya</h3>
                </div>
                <div
                  className="divide-y"
                  style={{
                    borderColor: palette.silver1,
                  }}
                >
                  <SettingRow
                    icon={Settings}
                    title="Pengaturan Lanjutan"
                    subtitle="Konfigurasi sistem dan backup"
                    action="navigate"
                    onClick={() =>
                      navigate("/sekolahislamku/teacher/advanced-settings")
                    }
                  />
                  <div className="px-4 py-4">
                    <Btn
                      palette={palette}
                      variant="outline"
                      className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        if (confirm("Apakah Anda yakin ingin keluar?")) {
                          // Logout logic
                          navigate("/login");
                        }
                      }}
                    >
                      <LogOut size={16} />
                      Keluar Akun
                    </Btn>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherSettings;
