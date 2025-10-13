// src/pages/sekolahislamku/components/home/ParentTopBar.tsx
import { useMemo, useState, type ReactNode } from "react";
import {
  NavLink,
  useLocation,
  useMatch,
  useParams,
  useNavigate,
} from "react-router-dom";
import { Menu, X, ArrowLeft } from "lucide-react";
import PublicUserDropdown from "@/components/common/public/UserDropDown";
import type { Palette } from "@/pages/sekolahislamku/components/ui/Primitives";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { NAVS, type NavItem, PROFILE_PATH } from "./navsConfig";

/* ================= Props ================= */
interface ParentTopBarProps {
  palette: Palette;
  title?: ReactNode;
  hijriDate?: string;
  gregorianDate?: string;
  dateFmt?: (iso: string) => string;
  showBack?: boolean;
  onBackClick?: () => void;
}

/* ================= Helpers ================= */
const fmtGregorian = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

const fmtHijriNow = () =>
  new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date());

const ensureLeadingSlash = (s: string) => (s.startsWith("/") ? s : `/${s}`);
const trimTrailingSlash = (s: string) => s.replace(/\/+$/, "");
const normalize = (s: string) => trimTrailingSlash(ensureLeadingSlash(s));

const resolveKind = (pathname: string): "sekolah" | "murid" | "guru" => {
  if (pathname.includes("/sekolah")) return "sekolah";
  if (pathname.includes("/guru")) return "guru";
  return "murid";
};

const buildBase = (
  slug: string | undefined,
  root: "sekolah" | "murid" | "guru"
) => normalize(`${slug ? `/${slug}` : ""}/${root}`);

const buildTo = (base: string, p: string) => {
  const child = p === "" || p === "." ? "" : `/${p.replace(/^\/+/, "")}`;
  return normalize(base + child);
};

/* Dummy identity by role (buat footer mobile) */
const dummyIdentity = (k: "sekolah" | "murid" | "guru") =>
  k === "murid"
    ? {
        initials: "A",
        name: "Ahmad Fauzi",
        email: "ahmad@murid.sch.id",
        role: "Siswa",
      }
    : k === "guru"
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

/* ================= Component ================= */
export default function ParentTopBar({
  palette,
  hijriDate,
  gregorianDate,
  dateFmt,
  title,
  showBack = false,
  onBackClick,
}: ParentTopBarProps) {
  const { isDark } = useHtmlDarkMode();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // slug awareness
  const params = useParams<{ slug?: string }>();
  const match = useMatch("/:slug/*");
  const slug = params.slug ?? match?.params.slug ?? "";

  const kind = resolveKind(pathname);
  const base = buildBase(slug, kind);

  const navs: (NavItem & { to: string })[] = useMemo(
    () => NAVS[kind].map((n) => ({ ...n, to: buildTo(base, n.path) })),
    [kind, base]
  );

  // label aktif
  const activeLabel = useMemo(() => {
    if (title && typeof title === "string") return title;
    const found = navs.find((n) =>
      n.end
        ? pathname === n.to
        : pathname === n.to || pathname.startsWith(n.to + "/")
    );
    return found?.label ?? "";
  }, [pathname, navs, title]);

  // tanggal
  const nowISO = gregorianDate ?? new Date().toISOString();
  const gregLabel = dateFmt ? dateFmt(nowISO) : fmtGregorian(nowISO);
  const hijriLabel = hijriDate || fmtHijriNow();

  const handleBack = () => (onBackClick ? onBackClick() : navigate(-1));

  // profile link untuk footer
  const profileTo = buildTo(base, PROFILE_PATH[kind] ?? "profil");

  /* ------- UI ------- */
  return (
    <>
      <div
        className="sticky top-0 z-40 backdrop-blur border-b"
        style={{ borderColor: palette.silver1 }}
      >
        <div className="mx-auto max-w-screen-2xl px-4 py-3 flex items-center justify-between">
          {/* Mobile (<= md) */}
          <div className="flex items-center gap-3 md:hidden flex-1">
            {showBack && (
              <button
                className="h-9 w-9 grid place-items-center rounded-xl border"
                onClick={handleBack}
                aria-label="Kembali"
                style={{ borderColor: palette.silver1 }}
              >
                <ArrowLeft size={18} />
              </button>
            )}

            <span
              className="font-semibold text-lg truncate flex-1 text-start"
              style={{ color: palette.black2 }}
            >
              {activeLabel}
            </span>

            <div className="flex items-center gap-2">
              {/* Hamburger */}
              <button
                className="h-9 w-9 grid place-items-center rounded-xl border"
                onClick={() => setOpen(true)}
                aria-label="Buka menu"
                style={{ borderColor: palette.silver1 }}
              >
                <Menu size={18} />
              </button>
              <PublicUserDropdown variant="icon" withBg={false} />
            </div>
          </div>

          {/* Desktop (>= md) */}
          <div className="hidden md:flex items-center gap-3">
            <img
              src="/image/Gambar-Masjid.jpeg"
              alt="Logo Sekolah"
              className="w-12 h-12 rounded-full object-cover"
            />
            <span
              className="text-base font-semibold"
              style={{ color: palette.primary }}
            >
              SDIT Al-Hikmah
            </span>
          </div>

          <div
            className="hidden md:flex items-center gap-3 text-sm"
            style={{ color: palette.silver1 }}
          >
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
              style={{
                background: palette.secondary,
                color: isDark ? palette.black1 : palette.silver1,
              }}
            >
              {hijriLabel}
            </span>
            <PublicUserDropdown variant="icon" withBg={false} />
          </div>
        </div>
      </div>

      {/* ======= Mobile Drawer ======= */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50"
          style={{ background: "#0006" }}
          onClick={() => setOpen(false)}
        >
          <aside
            className="absolute top-0 left-0 w-72 max-w-[75vw] h-full flex flex-col overflow-hidden"
            style={{
              background: palette.white1,
              borderRight: `1px solid ${palette.silver1}`,
              color: palette.black1,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex flex-col items-center px-4 py-6 border-b relative"
              style={{ borderColor: palette.silver1 }}
            >
              <img
                src="/image/Gambar-Masjid.jpeg"
                alt="Logo Sekolah"
                className="w-16 h-16 rounded-full object-cover border-2"
                style={{ borderColor: palette.primary }}
              />
              <h2
                className="font-bold text-lg mt-2"
                style={{ color: palette.primary }}
              >
                SDIT Al-Hikmah
              </h2>
              <button
                aria-label="Tutup menu"
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 h-9 w-9 grid place-items-center rounded-xl"
                style={{ border: `1px solid ${palette.silver1}` }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Isi menu (scroll) */}
            <div className="flex-1 overflow-y-auto">
              <div
                className="px-3 pt-3 pb-2 text-xs"
                style={{ color: palette.silver2 }}
              >
                {gregLabel}
              </div>

              <nav className="px-2 pb-4">
                <ul className="space-y-2">
                  {navs.map(({ to, label, icon: Icon, end }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        end={!!end}
                        onClick={() => setOpen(false)}
                        className="block focus:outline-none"
                      >
                        {({ isActive }) => (
                          <div
                            className="flex items-center gap-3 rounded-xl px-3 py-2 border transition-all hover:translate-x-px"
                            style={{
                              background: isActive
                                ? palette.primary2
                                : palette.white1,
                              borderColor: isActive
                                ? palette.primary
                                : palette.silver1,
                              boxShadow: isActive
                                ? `0 0 0 1px ${palette.primary} inset`
                                : "none",
                              color: isActive
                                ? palette.primary
                                : palette.black1,
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
                                color: isActive
                                  ? palette.primary
                                  : palette.silver2,
                              }}
                            >
                              <Icon size={16} />
                            </span>
                            <span className="font-medium text-sm">{label}</span>
                          </div>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Footer (FIXED) */}
            <div
              className="border-t p-3 pb-[env(safe-area-inset-bottom)] "
              style={{
                borderColor: palette.silver1,
                background: palette.white1,
              }}
            >
              {(() => {
                const info = dummyIdentity(kind);
                return (
                  <div
                    className="rounded-xl border p-3 justify-between flex items-center  mt-3"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white1,
                    }}
                  >
                    <div className="flex  items-center gap-3">
                      <div
                        className="h-9 w-9 shrink-0 rounded-full grid place-items-center font-semibold"
                        style={{
                          background: palette.primary2,
                          color: palette.primary,
                        }}
                      >
                        {info.initials}
                      </div>
                      <div className="min-w-0">
                        {/* <div className="text-sm font-medium">{info.name}</div> */}
                        <div
                          className="text-xs truncate"
                          style={{ color: palette.black2 }}
                        >
                          {info.email}
                        </div>
                        <div className="text-[11px] opacity-70">
                          {info.role}
                        </div>
                      </div>
                    </div>

                    <div className=" flex items-center gap-2">
                      <button
                        className="h-9 w-9 rounded-lg border grid place-items-center"
                        style={{
                          borderColor: palette.silver1,
                          color: palette.silver2,
                        }}
                        // onClick={logout}
                        aria-label="Keluar"
                      >
                        ⎋
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
