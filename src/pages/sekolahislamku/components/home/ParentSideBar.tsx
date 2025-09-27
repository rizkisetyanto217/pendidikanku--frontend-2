// src/pages/sekolahislamku/components/home/ParentSidebar.tsx
import React from "react";
import { NavLink, useLocation, useMatch, useParams } from "react-router-dom";
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
  /** mode navigasi */
  mode?: "desktop" | "mobile" | "auto";
  onCloseMobile?: () => void;
};

const resolveKind = (pathname: string): Kind => {
  if (pathname.includes("/sekolah")) return "sekolah";
  if (pathname.includes("/guru")) return "guru";
  return "murid";
};

const buildBase = (slug: string | undefined, kind: Kind) =>
  slug ? `/${slug}/${kind}` : `/${kind}`;

const buildTo = (base: string, p: string) =>
  p === "" || p === "." ? base : `${base}/${p.replace(/^\/+/, "")}`;

export default function ParentSidebar({
  palette,
  kind = "auto",
  className = "",
  desktopOnly = true,
  mode = "desktop",
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

  // cek mode mobile (untuk mode="auto")
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 1024 : false;

  const effectiveMode =
    mode === "auto" ? (isMobile ? "mobile" : "desktop") : mode;

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (effectiveMode === "mobile") {
      return (
        <div className="fixed inset-0 z-50 flex">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onCloseMobile}
          />
          {/* drawer */}
          <div className="relative w-64 bg-white dark:bg-black shadow-xl">
            {children}
          </div>
        </div>
      );
    }
    return (
      <nav
        className={[
          desktopOnly ? "hidden lg:block" : "",
          "w-64 shrink-0 lg:sticky lg:top-20 lg:z-30 lg:max-h-[calc(100vh-5rem)] lg:overflow-auto overflow-y-auto",
          className,
        ].join(" ")}
      >
        {children}
      </nav>
    );
  };

  return (
    <Wrapper>
      <SectionCard
        palette={palette}
        className="p-2"
        style={{ border: `1px solid ${palette.silver1}` }}
      >
        <ul className="space-y-2">
          {navs.map(({ to, label, icon: Icon, end }) => {
            const active = end
              ? pathname === to
              : pathname === to || pathname.startsWith(to + "/");

            return (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className="block focus:outline-none"
                  onClick={
                    effectiveMode === "mobile" ? onCloseMobile : undefined
                  }
                >
                  {() => (
                    <div
                      className="flex items-center gap-3 rounded-xl px-3 py-2 border transition-all hover:translate-x-px"
                      style={{
                        background: active ? palette.primary2 : palette.white1,
                        borderColor: active
                          ? palette.tertiary
                          : palette.silver1,
                        boxShadow: active
                          ? `0 0 0 1px ${palette.tertiary} inset`
                          : "none",
                        fontWeight: active ? "600" : "400",
                      }}
                    >
                      <span
                        className="h-7 w-7 grid place-items-center rounded-lg border"
                        style={{
                          background: active
                            ? palette.tertiary
                            : palette.white1,
                          borderColor: active
                            ? palette.tertiary
                            : palette.silver1,
                          color: active ? palette.white1 : palette.silver2,
                        }}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="truncate font-medium">{label}</span>
                    </div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </SectionCard>
    </Wrapper>
  );
}
