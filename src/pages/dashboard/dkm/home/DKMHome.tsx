// src/pages/dkm/home/DashboardAdminDKM.tsx
import { LayoutDashboardIcon, UserIcon } from "lucide-react";
import DashboardSidebar, {
  SidebarMenuItem,
} from "@/components/common/navigation/SidebarMenu";

export default function DashboardAdminDKM() {
  const menus: SidebarMenuItem[] = [
    { name: "Beranda", icon: <LayoutDashboardIcon />, to: "/dkm" },
    { name: "Profil Saya", icon: <UserIcon />, to: "/dkm/profil-saya" },
    // Tambahkan menu lain jika dibutuhkan
  ];

  return (
    <div className="flex gap-4">
      {/* Sidebar Kecil di dalam halaman dashboard */}
      <DashboardSidebar menus={menus} title="Navigasi" />

      {/* Konten utama */}
      <div className="flex-1 grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">Jumlah Kajian</div>
        <div className="bg-white rounded-xl shadow-sm p-4">Total Donasi</div>
        <div className="bg-white rounded-xl shadow-sm p-4">Total Donatur</div>
        <div className="bg-white rounded-xl shadow-sm p-4">Total Pengikut</div>
      </div>
    </div>
  );
}
