// src/layout/DkmSettingLayout.tsx
import { SidebarMenuItem } from "@/components/common/navigation/SidebarMenu";
import DashboardSidebar from "@/components/common/navigation/SidebarMenu";
import { Outlet, useLocation } from "react-router-dom";
import {
  UserIcon,
  MoonIcon,
  HelpingHandIcon,
  HandshakeIcon,
} from "lucide-react";

export default function DkmSettingLayout() {
  const location = useLocation();

  const menus: SidebarMenuItem[] = [
    { name: "Profil", icon: <UserIcon />, to: "/dkm/profil-saya" },
    { name: "Tampilan", icon: <MoonIcon />, to: "/dkm/tampilan" },
    { name: "Dukung Kami", icon: <HelpingHandIcon />, to: "/dkm/dukung-kami" },
    { name: "Kerjasama", icon: <HandshakeIcon />, to: "/dkm/kerjasama" },
    { name: "Tanya Jawab", icon: <HelpingHandIcon />, to: "/dkm/tanya-jawab" },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-64 shrink-0">
        <DashboardSidebar
          menus={menus}
          title="Pengaturan"
          currentPath={location.pathname}
        />
      </div>

      <div className="flex-1">
        <div className="rounded-xl shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
