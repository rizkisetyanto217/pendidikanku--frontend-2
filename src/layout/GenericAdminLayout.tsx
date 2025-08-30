// src/layout/GenericAdminLayout.tsx
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import AdminTopbar from "@/components/common/navigation/AdminTopbar";
import MobileSidebar from "@/components/common/navigation/MobileSidebar";
import Sidebar, { SidebarItem } from "@/components/common/navigation/Sidebar";

import useHtmlThema from "@/hooks/useHTMLThema";
import { pickTheme, ThemeName } from "@/constants/thema";

type Props = {
  desktopSidebar: SidebarItem[];
  mobileSidebar: SidebarItem[];
  topbarTitle?: string; // optional: judul/topbar role
};

export default function GenericAdminLayout({
  desktopSidebar,
  mobileSidebar,
  topbarTitle,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const { isDark, themeName } = useHtmlThema();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const isDashboard = location.pathname.endsWith("/");

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
