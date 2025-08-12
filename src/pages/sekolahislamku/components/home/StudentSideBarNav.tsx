// src/pages/sekolahislamku/components/home/ParentSideBarNav.tsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  FileSpreadsheet,
  Wallet,
  CalendarDays,
  Bell,
} from "lucide-react";
import {
  SectionCard,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

type Item = {
  to: string;
  label: string;
  icon: React.ComponentType<any>;
  end?: boolean;
};

const NAVS: Item[] = [
  { to: "/murid", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/murid/progress", label: "Progress Anak", icon: ClipboardCheck },
  { to: "/murid/finance", label: "Pembayaran", icon: Wallet },
  { to: "/murid/jadwal", label: "Jadwal", icon: CalendarDays },
  { to: "/murid/pengumuman", label: "Pengumuman", icon: Bell },
  { to: "/murid/rapor", label: "Rapor Nilai", icon: FileSpreadsheet },
];

export default function StudentSideBarNav({ palette }: { palette: Palette }) {
  return (
    <nav
      className="
        hidden lg:block w-64 shrink-0
        lg:sticky lg:top-24 lg:z-30
        lg:max-h-[calc(100vh-6rem)] lg:overflow-auto
      "
      aria-label="Navigasi Samping"
    >
      <SectionCard
        palette={palette}
        className="p-2"
        style={{ background: palette.white1 }}
      >
        <ul className="space-y-2">
          {NAVS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={!!end} className="block focus:outline-none">
                {({ isActive }) => (
                  <div
                    className={[
                      "flex items-center gap-3 rounded-xl px-3 py-2 border transition-all",
                      "hover:translate-x-[1px]",
                    ].join(" ")}
                    style={{
                      background: isActive ? palette.white1 : palette.white1,
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
    </nav>
  );
}
