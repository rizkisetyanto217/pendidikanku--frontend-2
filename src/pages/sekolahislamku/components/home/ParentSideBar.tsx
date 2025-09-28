// src/pages/sekolahislamku/components/home/ParentSidebar.tsx
import React from "react";
import {
  Link,
  useLocation,
  useMatch,
  useParams,
  useResolvedPath,
} from "react-router-dom";
import {
  SectionCard,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import { NAVS, type NavItem } from "./navsConfig";

export type Kind = "sekolah" | "murid" | "guru";
export type AutoKind = Kind | "auto";

export type ParentSidebarProps = {
  palette: Palette;
  kind?: AutoKind;
  className?: string;
  desktopOnly?: boolean;
  mode?: "desktop" | "mobile" | "auto"; // default: auto
  openMobile?: boolean; // dipakai saat mode=auto
  onCloseMobile?: () => void;
};

/* ---------- Helpers ---------- */
const resolveKind = (pathname: string): Kind => {
  if (pathname.includes("/sekolah")) return "sekolah";
  if (pathname.includes("/guru")) return "guru";
  return "murid";
};

const buildBase = (slug: string | undefined, kind: Kind) =>
  slug ? `/${slug}/${kind}` : `/${kind}`;

const normalize = (s: string) => s.replace(/\/+$/, "");

// Pastikan path tanpa trailing slash
const buildTo = (base: string, p: string) => {
  const raw = p === "" || p === "." ? base : `${base}/${p.replace(/^\/+/, "")}`;
  return normalize(raw);
};

/* ---------- Sidebar item ---------- */
function SidebarItem({
  palette,
  to,
  end,
  icon: Icon,
  label,
  onClick,
}: {
  palette: Palette;
  to: string;
  end?: boolean;
  icon: React.ComponentType<any>;
  label: string;
  onClick?: () => void;
}) {
  const location = useLocation();
  const resolved = useResolvedPath(to);

  const current = normalize(location.pathname);
  const target = normalize(resolved.pathname);

  const isActive = end
    ? current === target
    : current === target || current.startsWith(target + "/");

  return (
    <Link to={to} onClick={onClick} className="block focus:outline-none">
      <div
        className="flex items-center gap-3 rounded-xl px-3 py-2 border transition-all hover:translate-x-px"
        style={{
          background: isActive ? palette.primary2 : palette.white1,
          borderColor: isActive ? palette.tertiary : palette.silver1,
          boxShadow: isActive ? `0 0 0 1px ${palette.tertiary} inset` : "none",
          fontWeight: isActive ? 600 : 400,
        }}
      >
        <span
          className="h-7 w-7 grid place-items-center rounded-lg border"
          style={{
            background: isActive ? palette.tertiary : palette.white1,
            borderColor: isActive ? palette.tertiary : palette.silver1,
            color: isActive ? palette.white1 : palette.silver2,
          }}
        >
          <Icon size={16} />
        </span>
        <span className="truncate font-medium">{label}</span>
      </div>
    </Link>
  );
}

/* ---------- Component ---------- */
export default function ParentSidebar({
  palette,
  kind = "auto",
  className = "",
  desktopOnly = true,
  mode = "auto",
  openMobile = false,
  onCloseMobile,
}: ParentSidebarProps) {
  const { pathname } = useLocation();
  const params = useParams<{ slug?: string }>();
  const match = useMatch("/:slug/*");
  const slug = params.slug ?? match?.params.slug ?? "";

  const resolvedKind: Kind = kind === "auto" ? resolveKind(pathname) : kind;
  const base = buildBase(slug, resolvedKind);

  const navs: (NavItem & { to: string })[] = NAVS[resolvedKind].map((n) => ({
    ...n,
    to: buildTo(base, n.path),
  }));

  const SidebarContent = (
    <SectionCard
      palette={palette}
      className="p-2"
      style={{ border: `1px solid ${palette.silver1}` }}
    >
      <ul className="space-y-2">
        {navs.map(({ to, label, icon, end }) => (
          <li key={to}>
            <SidebarItem
              palette={palette}
              to={to}
              end={end}
              icon={icon}
              label={label}
              onClick={mode !== "desktop" ? onCloseMobile : undefined}
            />
          </li>
        ))}
      </ul>
    </SectionCard>
  );

  // Desktop only
  if (mode === "desktop") {
    return (
      <nav
        className={[
          desktopOnly ? "hidden lg:block" : "",
          "w-64 shrink-0 lg:sticky lg:top-20 lg:z-30 lg:max-h-[calc(100vh-5rem)] lg:overflow-auto overflow-y-auto",
          className,
        ].join(" ")}
      >
        {SidebarContent}
      </nav>
    );
  }

  // Mobile drawer
  if (mode === "mobile" || (mode === "auto" && openMobile)) {
    return (
      <div className="fixed inset-0 z-50 flex lg:hidden">
        <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
        <div className="relative w-64 bg-white shadow-xl">{SidebarContent}</div>
      </div>
    );
  }

  // Auto → desktop render
  return (
    <nav
      className={[
        desktopOnly ? "hidden lg:block" : "",
        "w-64 shrink-0 lg:sticky lg:top-20 lg:z-30 lg:max-h-[calc(100vh-5rem)] lg:overflow-auto overflow-y-auto",
        className,
      ].join(" ")}
    >
      {SidebarContent}
    </nav>
  );
}
