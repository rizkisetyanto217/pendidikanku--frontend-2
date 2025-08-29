// src/pages/sekolahislamku/components/home/ParentSidebar.tsx
import React from "react";
import { NavLink, useLocation, useMatch, useParams } from "react-router-dom";
import {
  SectionCard,
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
  Book,
  ClipboardCheck,
  FileSpreadsheet,
  CalendarDays,
  ClipboardList,
  // NotebookPen,
  Bell,
} from "lucide-react";

/* =============== Types =============== */
export type Kind = "sekolah" | "murid" | "guru";
export type AutoKind = Kind | "auto";

export type NavItem = {
  /** path relatif dari base "/:slug/{kind}" */
  path: "" | "." | string;
  label: string;
  icon: React.ComponentType<any>;
  end?: boolean;
};

type NavDict = Record<Kind, NavItem[]>;

export type ParentSidebarProps = {
  palette: Palette;
  /** auto = deteksi dari pathname (/sekolah | /murid | /guru) */
  kind?: AutoKind;
  /** override nav per kind kalau perlu */
  customNavs?: Partial<NavDict>;
  className?: string;
  /** sembunyikan di mobile (default true) */
  desktopOnly?: boolean;
};

/* =============== Default Navs =============== */
const DEFAULT_NAVS: NavDict = {
  sekolah: [
    { path: "", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "guru", label: "Guru", icon: UserCog },
    { path: "kelas", label: "Kelas", icon: BookOpen },
    // { path: "kehadiran", label: "Absensi", icon: CheckSquare },
    { path: "buku", label: "Buku", icon: Book },
    { path: "keuangan", label: "Keuangan", icon: Wallet },
    // { path: "pengumuman", label: "Pengumuman", icon: Megaphone },
  ],
  murid: [
    { path: "", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "progress", label: "Progress Anak", icon: ClipboardCheck },
    { path: "finance", label: "Pembayaran", icon: Wallet },
    { path: "jadwal", label: "Jadwal", icon: CalendarDays },
    { path: "pengumuman", label: "Pengumuman", icon: Bell },
    { path: "progress/raport", label: "Rapor Nilai", icon: FileSpreadsheet },
  ],
  guru: [
    { path: "", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "kelas", label: "Kelas Saya", icon: Users },
    { path: "kehadiran", label: "Kehadiran", icon: CheckSquare },
    { path: "penilaian", label: "Penilaian", icon: ClipboardList },
    // { path: "materials", label: "Materi & Tugas", icon: NotebookPen },
    // { path: "pengumuman", label: "Pengumuman", icon: Megaphone },
  ],
};

/* =============== Utils =============== */
const resolveKind = (pathname: string): Kind => {
  if (pathname.includes("/sekolah")) return "sekolah";
  if (pathname.includes("/guru")) return "guru";
  return "murid";
};

const buildBase = (slug: string | undefined, kind: Kind) =>
  slug ? `/${slug}/${kind}` : `/${kind}`;

const buildTo = (base: string, p: string) =>
  p === "" || p === "." ? base : `${base}/${p.replace(/^\/+/, "")}`;

/* =============== Component =============== */
export default function ParentSidebar({
  palette,
  kind = "auto",
  customNavs,
  className = "",
  desktopOnly = true,
}: ParentSidebarProps) {
  const { pathname } = useLocation();

  // Ambil slug aman untuk nested routes
  const params = useParams<{ slug?: string }>();
  const match = useMatch("/:slug/*");
  const slug = params.slug ?? match?.params.slug ?? "";

  const resolvedKind: Kind = kind === "auto" ? resolveKind(pathname) : kind;

  const base = buildBase(slug, resolvedKind);
  const navs =
    (customNavs?.[resolvedKind] ?? DEFAULT_NAVS[resolvedKind]).map(
      ({ path, label, icon, end }) => ({
        to: buildTo(base, path),
        label,
        icon,
        end,
      })
    );

  return (
    <nav
      className={[
        desktopOnly ? "hidden lg:block" : "",
        "w-64 shrink-0 lg:sticky lg:top-20 lg:z-30 lg:max-h-[calc(100vh-5rem)] lg:overflow-auto",
        className,
      ].join(" ")}
      aria-label={
        resolvedKind === "sekolah"
          ? "Navigasi Sekolah"
          : resolvedKind === "guru"
          ? "Navigasi Pengajar"
          : "Navigasi Murid"
      }
    >
      <SectionCard palette={palette} className="p-2">
        <ul className="space-y-2">
          {navs.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={!!end} className="block focus:outline-none">
                {({ isActive }) => (
                  <div
                    className="flex items-center gap-3 rounded-xl px-3 py-2 border transition-all hover:translate-x-px"
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
                        background: isActive ? palette.primary2 : palette.white1,
                        borderColor: isActive ? palette.primary : palette.silver1,
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
