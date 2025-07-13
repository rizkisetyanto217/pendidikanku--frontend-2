// src/constants/sidebarDKMMobileData.ts
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

export const DKMMobileDataSidebar: SidebarItem[] = [
  { text: "Beranda", icon: <BeakerIcon />, to: "/dkm" },
  {
    text: "Profil",
    icon: <LayoutDashboardIcon />,
    children: [
      { text: "Profil Masjid", to: "/dkm/profil-masjid" },
      { text: "Profil DKM", to: "/dkm/profil-dkm" },
    ],
  },
  { text: "Notifikasi", icon: <BellIcon />, to: "/dkm/notifikasi" },
  { text: "Kajian", icon: <CalendarIcon />, to: "/dkm/kajian" },
  { text: "Sertifikat", icon: <FileIcon />, to: "/dkm/sertifikat" },
  { text: "Keuangan", icon: <PieChartIcon />, to: "/dkm/keuangan" },
  { text: "Postingan", icon: <UsersIcon />, to: "/dkm/postingan" },
];
