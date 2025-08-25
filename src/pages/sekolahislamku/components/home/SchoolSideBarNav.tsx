import React from "react";
import { NavLink, useParams, useMatch } from "react-router-dom";
import {
  SectionCard,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import {
  LayoutDashboard,
  UserCog,
  BookOpen,
  CheckSquare,
  Wallet,
  Megaphone,
  Book,
} from "lucide-react";

/* ================= Types ================= */
export type NavItem = {
  /** path relatif dari base "/:slug/sekolah" */
  path: "." | string;
  label: string;
  icon: React.ComponentType<any>;
  end?: boolean;
};

const DEFAULT_NAVS: NavItem[] = [
  { path: ".", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "guru", label: "Guru", icon: UserCog },
  { path: "kelas", label: "Kelas", icon: BookOpen },
  // { path: "kehadiran", label: "Absensi", icon: CheckSquare },
  { path: "buku", label: "Buku", icon: Book },
  { path: "keuangan", label: "Keuangan", icon: Wallet },
  { path: "pengumuman", label: "Pengumuman", icon: Megaphone },
];

export default function SchoolSidebarNav({
  palette,
  navs = DEFAULT_NAVS,
  className = "",
}: {
  palette: Palette;
  navs?: NavItem[];
  className?: string;
}) {
  // Ambil slug dari URL (cocokkan fallback jika komponen dipakai di nested route)
  const params = useParams<{ slug?: string }>();
  const match = useMatch("/:slug/*");
  const slug = params.slug ?? match?.params.slug ?? "";

  // base absolute "/:slug/sekolah"
  const base = slug ? `/${slug}/sekolah` : "/sekolah";

  // builder tujuan final
  const buildTo = (p: string) =>
    p === "." ? base : `${base}/${p.replace(/^\/+/, "")}`;

  return (
    <nav
      className={`hidden lg:block w-64 shrink-0 lg:sticky lg:top-20 lg:z-30 lg:max-h-[calc(100vh-5rem)] lg:overflow-auto ${className}`}
      aria-label="Navigasi Sekolah"
    >
      <SectionCard palette={palette} className="p-2">
        <ul className="space-y-2">
          {navs.map(({ path, label, icon: Icon, end }) => {
            const to = buildTo(path);
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
    </nav>
  );
}
