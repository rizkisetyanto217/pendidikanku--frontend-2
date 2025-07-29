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

export default function MasjidSettingMenu() {
  const location = useLocation();
  const { slug } = useParams();

  const base = `/masjid/${slug}`;

  const menus: SidebarMenuItem[] = [
    {
      name: "Profil",
      icon: <UserIcon />,
      to: `${base}/aktivitas/pengaturan/profil-saya`,
    },
    {
      name: "Tampilan",
      icon: <MoonIcon />,
      to: `${base}/aktivitas/pengaturan/tampilan`,
    },
    {
      name: "Dukung Kami",
      icon: <HelpingHandIcon />,
      to: `${base}/aktivitas/pengaturan/dukung-kami`,
    },
    {
      name: "Kerjasama",
      icon: <HandshakeIcon />,
      to: `${base}/aktivitas/pengaturan/kerjasama`,
    },
    {
      name: "Tanya Jawab",
      icon: <MessageCircleIcon />,
      to: `${base}/aktivitas/pengaturan/tanya-jawab`,
    },
  ];

  return (
    <>
      <div className="flex-1">
        {/* Tampilkan hanya di mobile */}
        <div className="md:hidden space-y-2">
          {menus.map((menu) => (
            <a
              key={menu.to}
              href={menu.to}
              className={`flex items-center gap-2 p-3 rounded border ${
                location.pathname === menu.to
                  ? "bg-gray-100 dark:bg-gray-800"
                  : ""
              }`}
            >
              {menu.icon}
              <span>{menu.name}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
