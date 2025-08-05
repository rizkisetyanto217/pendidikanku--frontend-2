import AdminTopbar from "@/components/common/navigation/AdminTopbar";
import MobileSidebar from "@/components/common/navigation/MobileSidebar";
import Sidebar, { SidebarItem } from "@/components/common/navigation/Sidebar";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

// src/layout/GenericAdminLayout.tsx
type Props = {
  desktopSidebar: SidebarItem[];
  mobileSidebar: SidebarItem[];
  topbarTitle?: string; // kalau mau judul role
};

export default function GenericAdminLayout({
  desktopSidebar,
  mobileSidebar,
  topbarTitle,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isDark } = useHtmlDarkMode();

  const isDashboard = location.pathname.endsWith("/");

  const theme = isDark ? colors.dark : colors.light;

  return (
    <div
      className="min-h-screen flex relative"
      style={{ backgroundColor: theme.white2, overflow: "visible" }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:h-screen">
        <Sidebar items={desktopSidebar} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={mobileSidebar}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-auto">
        <AdminTopbar onMenuClick={() => setIsOpen(true)} title={topbarTitle} />
        <div className={isDashboard ? "p-8" : "p-4"}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
