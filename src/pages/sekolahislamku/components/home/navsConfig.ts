import {
  LayoutDashboard,
  Users,
  UserCog,
  BookOpen,
  Wallet,
  ClipboardCheck,
  FileSpreadsheet,
  CalendarDays,
  ChartBar,
  School,
} from "lucide-react";

/* ================= Types ================= */
export type NavItem = {
  path: "" | "." | string;
  label: string;
  icon: React.ComponentType<any>;
  end?: boolean;
};

export type NavDict = {
  sekolah: NavItem[];
  murid: NavItem[];
  guru: NavItem[];
};

/* ================= Default Navs ================= */
export const NAVS: NavDict = {
  sekolah: [
    { path: "", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "menu-utama", label: "Menu Utama", icon: ChartBar },
    { path: "guru", label: "Guru", icon: UserCog },
    { path: "kelas", label: "Kelas", icon: BookOpen },
    { path: "buku", label: "Buku", icon: BookOpen },
    { path: "keuangan", label: "Keuangan", icon: Wallet },
    { path: "profil-sekolah", label: "Profil", icon: School },
    { path: "academic", label: "Akademik", icon: FileSpreadsheet },
  ],
  murid: [
    { path: "", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "menu-utama", label: "Menu Utama", icon: ChartBar },
    { path: "progress", label: "Progress Anak", icon: ClipboardCheck },
    { path: "finance", label: "Pembayaran", icon: Wallet },
    { path: "jadwal", label: "Jadwal", icon: CalendarDays },
    { path: "tugas", label: "Tugas", icon: ClipboardCheck },
    { path: "profil-murid", label: "Profil", icon: Users },
    // kalau mau nambah "Pengumuman" atau "Rapor Nilai", tambahkan di sini
    // { path: "pengumuman", label: "Pengumuman", icon: Megaphone },
    // { path: "rapor", label: "Rapor Nilai", icon: FileSpreadsheet },
  ],
  guru: [
    { path: "", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "menu-utama", label: "Menu Utama", icon: ChartBar },
    { path: "kelas", label: "Kelas Saya", icon: Users },
    { path: "guru-mapel", label: "Guru Mapel", icon: Users },

    { path: "jadwal", label: "Jadwal", icon: CalendarDays },
    { path: "profil-guru", label: "Profil", icon: Users },
  ],
};
