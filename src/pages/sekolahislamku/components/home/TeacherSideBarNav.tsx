// src/pages/sekolahislamku/components/home/TeacherSidebarNav.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  ClipboardList,
  NotebookPen,
  Megaphone,
} from "lucide-react";

export type NavItem = {
  to: string;
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
  { to: "/guru", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/guru/kelas", label: "Kelas Saya", icon: Users },
  { to: "/guru/kehadiran", label: "Kehadiran", icon: CheckSquare },
  { to: "/guru/penilaian", label: "Penilaian", icon: ClipboardList },
  { to: "/guru/materials", label: "Materi & Tugas", icon: NotebookPen },
  { to: "/guru/pengumuman", label: "Pengumuman", icon: Megaphone },
];

const DEFAULT_ACTIONS: QuickAction[] = [
  {
    label: "Mulai Absen",
    icon: CheckSquare,
    onClick: () => alert("Mulai Absen"),
    variant: "secondary",
  },
  {
    label: "Buat Tugas",
    icon: ClipboardList,
    onClick: () => alert("Buat Tugas"),
    variant: "quaternary",
  },
  {
    label: "Buat Pengumuman",
    icon: Megaphone,
    onClick: () => alert("Buat Pengumuman"),
    variant: "outline",
  },
];

export default function TeacherSidebarNav({
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
  return (
    <nav
      className={`hidden lg:block w-64 shrink-0 lg:sticky lg:top-20 lg:z-30 lg:max-h-[calc(100vh-5rem)] lg:overflow-auto ${className}`}
      aria-label="Navigasi Pengajar"
    >
      <SectionCard
        palette={palette}
        className="p-2"
        style={{ background: palette.white1 }}
      >
        <ul className="space-y-2">
          {navs.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={!!end} className="block focus:outline-none">
                {({ isActive }) => (
                  <div
                    className="flex items-center gap-3 rounded-xl px-3 py-2 border transition-all hover:translate-x-[1px]"
                    style={{
                      background: palette.white1,
                      borderColor: isActive ? palette.primary : palette.silver1,
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
          ))}
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
