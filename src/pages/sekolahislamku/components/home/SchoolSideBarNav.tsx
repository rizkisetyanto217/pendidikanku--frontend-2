import React from "react";
import { NavLink, useParams } from "react-router-dom";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import {
  LayoutDashboard,
  Users,
  UserCog,
  BookOpen,
  CheckSquare,
  Wallet,
  Megaphone,
  BarChart2,
  Settings,
  Plus,
} from "lucide-react";

export type NavItem = {
  path: string; // relatif, bukan absolute
  label: string;
  icon: React.ComponentType<any>;
  end?: boolean;
};

export type QuickAction = {
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  variant?: "default" | "secondary" | "quaternary" | "outline" | "ghost";
};

const DEFAULT_NAVS: NavItem[] = [
  { path: "sekolah", label: "Dashboard", icon: LayoutDashboard, end: true },
  // { path: "sekolah/murid", label: "Siswa", icon: Users },
  { path: "sekolah/guru", label: "Guru", icon: UserCog },
  { path: "sekolah/kelas", label: "Kelas", icon: BookOpen },
  { path: "sekolah/kehadiran", label: "Absensi", icon: CheckSquare },
  { path: "sekolah/keuangan", label: "Keuangan", icon: Wallet },
  { path: "sekolah/pengumuman", label: "Pengumuman", icon: Megaphone },
];

const DEFAULT_ACTIONS: QuickAction[] = [
  {
    label: "Pengumuman Baru",
    icon: Megaphone,
    onClick: () => alert("Buat Pengumuman"),
    variant: "secondary",
  },
  {
    label: "Tambah Event",
    icon: Plus,
    onClick: () => alert("Tambah Event"),
    variant: "quaternary",
  },
  {
    label: "Buat Tagihan",
    icon: Wallet,
    onClick: () => alert("Buat Tagihan"),
    variant: "outline",
  },
];

export default function SchoolSidebarNav({
  palette,
  navs = DEFAULT_NAVS,
  showQuickActions = true,
  quickActions = DEFAULT_ACTIONS,
  className = "",
}: {
  palette: Palette;
  navs?: NavItem[];
  showQuickActions?: boolean;
  quickActions?: QuickAction[];
  className?: string;
}) {
  const { slug } = useParams(); // ambil slug dari URL

  // helper function untuk membuat URL dengan slug
  const withSlug = (path: string) => `/${slug}/${path}`;

  return (
    <nav
      className={`hidden lg:block w-64 shrink-0 lg:sticky lg:top-20 lg:z-30 lg:max-h-[calc(100vh-5rem)] lg:overflow-auto ${className}`}
      aria-label="Navigasi Sekolah"
    >
      <SectionCard palette={palette} className="p-2">
        <ul className="space-y-2">
          {navs.map(({ path, label, icon: Icon, end }) => {
            const to = withSlug(path); // gunakan helper function
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  end={!!end}
                  className="block focus:outline-none"
                >
                  {({ isActive }) => (
                    <div
                      className="flex items-center gap-3 rounded-xl px-3 py-2 border transition-all hover:translate-x-px"
                      style={{
                        background: palette.white1,
                        borderColor: isActive
                          ? palette.primary
                          : palette.silver1,
                        boxShadow: isActive
                          ? `0 0 0 1px ${palette.primary} inset`
                          : "none",
                        color: isActive ? palette.primary : palette.black1,
                      }}
                    >
                      <span
                        className="h-7 w-7 grid place-items-center rounded-lg border"
                        style={{
                          background: isActive
                            ? palette.primary2
                            : palette.white1,
                          borderColor: isActive
                            ? palette.primary
                            : palette.silver1,
                          color: isActive ? palette.primary : palette.silver2,
                        }}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="truncate">{label}</span>
                    </div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </SectionCard>

      {showQuickActions && (
        <SectionCard palette={palette} className="mt-3 p-3">
          <div className="font-medium mb-2">Aksi Cepat</div>
          <div className="grid grid-cols-1 gap-2">
            {quickActions.map((a, i) => {
              const Icon = a.icon;
              return (
                <Btn
                  key={i}
                  palette={palette}
                  variant={a.variant ?? "outline"}
                  onClick={a.onClick}
                >
                  <Icon className="mr-2" size={16} />
                  {a.label}
                </Btn>
              );
            })}
          </div>
        </SectionCard>
      )}
    </nav>
  );
}
