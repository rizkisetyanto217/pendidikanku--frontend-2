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

export type NavItem = {
  path: "" | "." | string; // "" = dashboard root
  label: string;
  icon: React.ComponentType<any>;
  end?: boolean; // true = match exact
};

export type NavDict = {
  sekolah: NavItem[];
  murid: NavItem[];
  guru: NavItem[];
};

// path profil per role (dipakai footer)
export const PROFILE_PATH: Record<keyof NavDict, string> = {
  sekolah: "profil-sekolah",
  murid: "profil-murid",
  guru: "profil-guru",
};

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
