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
import { NAVS, type NavItem, PROFILE_PATH } from "./navsConfig";

/* ========= Types ========= */
export type Kind = "sekolah" | "murid" | "guru";
export type AutoKind = Kind | "auto";

export type ParentSidebarProps = {
  palette: Palette;
  kind?: AutoKind;
  className?: string;
  desktopOnly?: boolean;
  mode?: "desktop" | "mobile" | "auto";
  openMobile?: boolean;
  onCloseMobile?: () => void;
};

/* ========= Helpers ========= */
const ensureLeadingSlash = (s: string) => (s.startsWith("/") ? s : `/${s}`);
const trimTrailingSlash = (s: string) => s.replace(/\/+$/, "");
const normalize = (s: string) => trimTrailingSlash(ensureLeadingSlash(s));

const resolveKind = (pathname: string): Kind => {
  if (pathname.includes("/sekolah")) return "sekolah";
  if (pathname.includes("/guru")) return "guru";
  return "murid";
};

const buildBase = (slug: string | undefined, kind: Kind) =>
  normalize(`${slug ? `/${slug}` : ""}/${kind}`);

const buildTo = (base: string, p: string) => {
  const child = p === "" || p === "." ? "" : `/${p.replace(/^\/+/, "")}`;
  return normalize(base + child);
};

/* ========= Item ========= */
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

/* ========= Footer ========= */
function SidebarFooter({
  palette,
  kind,
  base,
}: {
  palette: Palette;
  kind: Kind;
  base: string;
}) {
  const identity =
    kind === "murid"
      ? {
          initials: "A",
          name: "Ahmad Fauzi",
          email: "ahmad@murid.sch.id",
          role: "Siswa",
        }
      : kind === "guru"
        ? {
            initials: "U",
            name: "Ustadz Abdullah",
            email: "abdullah@guru.sch.id",
            role: "Guru",
          }
        : {
            initials: "S",
            name: "SDIT Al-Hikmah",
            email: "admin@sekolah.sch.id",
            role: "Admin Sekolah",
          };

  const profileTo = buildTo(base, PROFILE_PATH[kind] ?? "profil");

  return (
    <div
      className="rounded-xl border p-3 mt-5 flex items-center justify-between gap-2"
      style={{ borderColor: palette.silver1, background: palette.white1 }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-9 w-9 shrink-0 rounded-full grid place-items-center font-semibold"
          style={{ background: palette.primary2, color: palette.primary }}
        >
          {identity.initials}
        </div>
        <div className="min-w-0">
          {/* <div className="text-sm font-medium">{identity.name}</div> */}
          <div className="text-sm truncate" style={{ color: palette.black2 }}>
            {identity.email}
          </div>
          <div className="text-[11px] opacity-70">{identity.role}</div>
        </div>
      </div>

      <div className=" flex items-center gap-5">
        {/* <Link to={profileTo} className="flex-1">
          <div
            className="w-full rounded-lg border px-3 py-2 text-center text-sm"
            style={{ borderColor: palette.silver1, background: palette.white1 }}
          >
            Profil
          </div>
        </Link> */}
        <button
          className="h-9 w-9 rounded-lg border grid place-items-center"
          style={{ borderColor: palette.silver1, color: palette.silver2 }}
        >
          ⎋
        </button>
      </div>
    </div>
  );
}

/* ========= Main ========= */
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

  const footerNode = (
    <SidebarFooter palette={palette} kind={resolvedKind} base={base} />
  );

  /* ===== Desktop ===== */
  if (mode === "desktop") {
    return (
      <nav
        className={[
          desktopOnly ? "hidden lg:block" : "",
          "w-64 shrink-0 lg:sticky lg:top-20 lg:z-30 lg:max-h-[calc(100vh-5rem)] lg:overflow-hidden",
          className,
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <SectionCard
            palette={palette}
            className="p-2 flex-1 overflow-y-auto"
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
                  />
                </li>
              ))}
            </ul>
            <div className="h-3" />
          </SectionCard>

          {/* footer desktop */}
          <div className="mt-2">{footerNode}</div>
        </div>
      </nav>
    );
  }

  /* ===== Mobile drawer ===== */
  if (mode === "mobile" || (mode === "auto" && openMobile)) {
    return (
      <div className="fixed inset-0 z-50 flex lg:hidden">
        {/* backdrop */}
        <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />

        {/* drawer */}
        <div
          className="relative h-full w-72 shadow-xl flex flex-col overflow-hidden"
          style={{ background: palette.white1, color: palette.black1 }}
        >
          {/* AREA SCROLL – daftar menu */}
          <div className="flex-1 overflow-y-auto px-2 pt-2">
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
                      onClick={onCloseMobile}
                    />
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          {/* FOOTER TETAP (muncul di mobile) */}
          <div
            className="border-t p-2"
            style={{ borderColor: palette.silver1, background: palette.white1 }}
          >
            <SidebarFooter palette={palette} kind={resolvedKind} base={base} />
          </div>
        </div>
      </div>
    );
  }

  /* ===== Auto → desktop render ===== */
  return (
    <nav
      className={[
        desktopOnly ? "hidden lg:block" : "",
        "w-64 shrink-0 lg:sticky lg:top-20 lg:z-30 lg:max-h-[calc(100vh-5rem)] lg:overflow-hidden",
        className,
      ].join(" ")}
    >
      <div className="flex h-full flex-col">
        <SectionCard
          palette={palette}
          className="p-2 flex-1 overflow-y-auto"
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
                />
              </li>
            ))}
          </ul>
          <div className="h-3" />
        </SectionCard>

        <div className="mt-2">{footerNode}</div>
      </div>
    </nav>
  );
}
