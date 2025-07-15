// src/constants/sidebarData.ts
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

export const DKMDesktopDataSidebar: SidebarItem[] = [
  { text: "Beranda", icon: <BeakerIcon />, to: "/dkm" },
  {
    text: "Profil",
    icon: <LayoutDashboardIcon />,
    to: "/dkm/profil-masjid",
    activeBasePath: ["/dkm/profil-dkm"],
  },
  {
    text: "Kajian",
    icon: <CalendarIcon />,
    to: "/dkm/kajian",
    activeBasePath: ["/dkm/kajian", "/dkm/tema", "/dkm/kajian-detail"],
  },

  { text: "Sertifikat", icon: <FileIcon />, to: "/dkm/sertifikat" },
  { text: "Keuangan", icon: <PieChartIcon />, to: "/dkm/keuangan" },
  { text: "Postingan", icon: <UsersIcon />, to: "/dkm/postingan" },
];
