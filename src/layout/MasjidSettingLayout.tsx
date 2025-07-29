// src/layout/MasjidSettingLayout.tsx

import { SidebarMenuItem } from "@/components/common/navigation/SidebarMenu";
import DashboardSidebar from "@/components/common/navigation/SidebarMenu";
import { Outlet, useLocation, useParams } from "react-router-dom";
import {
  UserIcon,
  MoonIcon,
  HelpingHandIcon,
  HandshakeIcon,
  MessageCircleIcon,
} from "lucide-react";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

export default function MasjidSettingLayout() {
  const location = useLocation();
  const { slug } = useParams();

  const base = `/masjid/${slug}`;

  const menus: SidebarMenuItem[] = [
    { name: "Profil", icon: <UserIcon />, to: `${base}/profil-saya` },
    { name: "Tampilan", icon: <MoonIcon />, to: `${base}/tampilan` },
    {
      name: "Dukung Kami",
      icon: <HelpingHandIcon />,
      to: `${base}/dukung-kami`,
    },
    { name: "Kerjasama", icon: <HandshakeIcon />, to: `${base}/kerjasama` },
    {
      name: "Tanya Jawab",
      icon: <MessageCircleIcon />,
      to: `${base}/tanya-jawab`,
    },
  ];

  return (
    <>
      <PageHeaderUser
        title="Dokumen"
        onBackClick={() => window.history.length > 1 && history.back()}
      />

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
    </>
  );
}
