// src/constants/sidebarAuthorMobileData.ts
import { SidebarItem } from "@/components/common/navigation/Sidebar";
import {
  BeakerIcon,
  LayoutDashboardIcon,
  BellIcon,
  CalendarIcon,
  FileIcon,
  UsersIcon,
  PieChartIcon,
} from "lucide-react";

export const treasurerMobileDataSidebar: SidebarItem[] = [
  { text: "Beranda", icon: <BeakerIcon />, to: "/dkm" },
  {
    text: "Profil",
    icon: <LayoutDashboardIcon />,
    children: [
      { text: "Profil Masjid", to: "/dkm/profil" },
      { text: "Profil DKM", to: "/dkm/profil-dkm" },
    ],
  },
  { text: "Keuangan", icon: <PieChartIcon />, to: "/dkm/keuangan" },
];
