// src/pages/dkm/home/DashboardAdminDKM.tsx
import { LayoutDashboardIcon, UserIcon, Sun, Moon } from "lucide-react";
import DashboardSidebar, {
  SidebarMenuItem,
} from "@/components/common/navigation/SidebarMenu";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { colors, ThemeName } from "@/constants/thema";

export default function DashboardAdminDKM() {
  const menus: SidebarMenuItem[] = [
    { name: "Beranda", icon: <LayoutDashboardIcon />, to: "/dkm" },
    { name: "Profil Saya", icon: <UserIcon />, to: "/dkm/profil-saya" },
  ];

  const { isDark, toggleDark, themeName, setThemeName } = useHtmlDarkMode();

  const themeVariant = colors[themeName as ThemeName] ?? colors.default;
  const palette = isDark ? themeVariant.dark : themeVariant.light;

  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      <DashboardSidebar menus={menus} title="Navigasi" />

      {/* Konten utama */}
      <div className="flex-1 grid grid-cols-4 gap-4">
        <div
          className="rounded-xl shadow-sm p-4"
          style={{ backgroundColor: palette.white1, color: palette.black1 }}
        >
          Jumlah Kajian
        </div>
        <div
          className="rounded-xl shadow-sm p-4"
          style={{ backgroundColor: palette.white1, color: palette.black1 }}
        >
          Total Donasi
        </div>
        <div
          className="rounded-xl shadow-sm p-4"
          style={{ backgroundColor: palette.white1, color: palette.black1 }}
        >
          Total Donatur
        </div>
        <div
          className="rounded-xl shadow-sm p-4"
          style={{ backgroundColor: palette.white1, color: palette.black1 }}
        >
          Total Pengikut
        </div>

        {/* 🎨 Area kontrol tema */}
        <div
          className="col-span-4 flex items-center justify-between rounded-xl shadow-sm p-4 mt-4"
          style={{ backgroundColor: palette.white1, color: palette.black1 }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDark}
              className="flex items-center gap-2 px-3 py-1 rounded border"
              style={{
                borderColor: palette.silver1,
                backgroundColor: palette.white2,
              }}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              {isDark ? "Mode Terang" : "Mode Gelap"}
            </button>

            <select
              value={themeName}
              onChange={(e) => setThemeName(e.target.value as ThemeName)}
              className="px-3 py-1 rounded border"
              style={{
                borderColor: palette.silver1,
                backgroundColor: palette.white2,
                color: palette.black1,
              }}
            >
              <option value="default">Default</option>
              <option value="sunrise">Sunrise</option>
              <option value="midnight">Midnight</option>
            </select>
          </div>
          <span className="text-sm text-gray-500">
            Tema aktif: {themeName} ({isDark ? "dark" : "light"})
          </span>
        </div>
      </div>
    </div>
  );
}
