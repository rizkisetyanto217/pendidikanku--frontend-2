// src/pages/sekolahislamku/components/home/StudentTopBar.tsx
import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  Link,
  NavLink,
  useLocation,
  useMatch,
  useParams,
} from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  BookOpen,
  CheckSquare,
  Wallet,
  Megaphone,
  FileSpreadsheet,
  ClipboardCheck,
  ClipboardList,
  NotebookPen,
  GraduationCap,
  Menu,
  X,
  School,
  ChartBar,
  Calendar1,
  PanelLeftOpen,
} from "lucide-react";
import PublicUserDropdown from "@/components/common/public/UserDropDown";
import type { Palette } from "@/pages/sekolahislamku/components/ui/Primitives";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

/* ===================== Types ===================== */
interface ParentTopBarProps {
  palette: Palette;
  title?: ReactNode;
  hijriDate?: string; // opsional: sudah berformat
  gregorianDate?: string; // ISO
  dateFmt?: (iso: string) => string;
}

type NavItem = {
  path: "." | string;
  label: string;
  icon: ComponentType<any>;
  end?: boolean;
};

/* ===================== Date helpers ===================== */
const toCivilUtcDate = (d: Date) =>
  new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

const formatIDGregorian = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

const formatHijriLocal = (d: Date) => {
  try {
    return new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
      weekday: "long",
    }).format(toCivilUtcDate(d));
  } catch {
    return "";
  }
};

/* ===================== Nav data ===================== */
const STUDENT_NAVS: NavItem[] = [
  { path: ".", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "menu-utama", label: "Menu Utama", icon: ChartBar },
  { path: "progress", label: "Progress Anak", icon: ClipboardCheck },
  { path: "finance", label: "Pembayaran", icon: Wallet },
  { path: "jadwal", label: "Jadwal", icon: Calendar1 },
  { path: "pengumuman", label: "Pengumuman", icon: Megaphone },
  { path: "rapor", label: "Rapor Nilai", icon: FileSpreadsheet },
  { path: "profil-murid", label: "Profil", icon: Users },
];

const SCHOOL_NAVS: NavItem[] = [
  { path: ".", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "menu-utama", label: "Menu Utama", icon: ChartBar },
  { path: "murid", label: "Siswa", icon: Users },
  { path: "guru", label: "Guru", icon: UserCog },
  { path: "kelas", label: "Kelas", icon: BookOpen },
  { path: "kehadiran", label: "Absensi", icon: CheckSquare },
  { path: "buku", label: "Buku", icon: BookOpen },
  { path: "keuangan", label: "Keuangan", icon: Wallet },
  { path: "profil-sekolah", label: "Profil", icon: School },
  { path: "academic", label: "Akademik", icon: FileSpreadsheet },
  // { path: "room", label: "Ruangan", icon: ChartBar },
];

const TEACHER_NAVS: NavItem[] = [
  { path: ".", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "menu-utama", label: "Menu Utama", icon: ChartBar },
  { path: "kelas", label: "Kelas Saya", icon: Users },
  { path: "kehadiran", label: "Kehadiran", icon: CheckSquare },
  { path: "penilaian", label: "Penilaian", icon: ClipboardList },
  { path: "materials", label: "Materi & Tugas", icon: NotebookPen },
  { path: "pengumuman", label: "Pengumuman", icon: Megaphone },
  { path: "profil-guru", label: "Profil", icon: Users },
];

/* ===================== Small UI ===================== */
function NavLinkItem({
  to,
  icon: Icon,
  label,
  end,
  palette,
  onClick,
}: {
  to: string;
  icon: ComponentType<any>;
  label: string;
  end?: boolean;
  palette: Palette;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={!!end}
      onClick={onClick}
      className="block focus:outline-none"
    >
      {({ isActive }) => (
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-2 border transition-all hover:translate-x-px"
          style={{
            background: isActive ? palette.primary2 : palette.white1,
            borderColor: isActive ? palette.primary : palette.silver1,
            boxShadow: isActive ? `0 0 0 1px ${palette.primary} inset` : "none",
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
          <span className="font-medium text-sm">{label}</span>
        </div>
      )}
    </NavLink>
  );
}

function MobileDrawer({
  open,
  onClose,
  brand,
  formattedGregorian,
  navs,
  palette,
  isDark,
}: {
  open: boolean;
  onClose: () => void;
  brand: ReactNode;
  formattedGregorian: string;
  navs: NavItem[];
  palette: Palette;
  isDark: boolean;
}) {
  if (!open) return null;
  return (
    <div className="md:hidden" style={{ pointerEvents: "auto" }}>
      {/* overlay */}
      <div
        className="fixed inset-0 z-50"
        onClick={onClose}
        style={{ background: "#0006" }}
      />
      {/* panel */}
      <aside
        id="mobile-drawer"
        className="fixed inset-y-0 left-0 z-50 w-72 max-w-[70vw] flex flex-col"
        style={{
          background: palette.white1,
          borderRight: `1px solid ${palette.silver1}`,
        }}
        role="dialog"
        aria-label="Menu navigasi"
      >
        {/* Header fixed */}
        <div
          className="flex flex-col items-center px-4 py-6 border-b relative flex-shrink-0"
          style={{ borderColor: palette.silver1 }}
        >
          <div className="mb-3">
            <img
              src="/image/Gambar-Masjid.jpeg"
              alt="Logo Sekolah"
              className="w-16 h-16 rounded-full object-cover border-2"
              style={{ borderColor: palette.primary }}
            />
          </div>
          <div className="text-center">
            <h2
              className="font-bold text-lg leading-tight"
              style={{ color: palette.primary }}
            >
              SDIT
            </h2>
            <p className="text-sm mt-1" style={{ color: palette.silver2 }}>
              Al-Hikmah
            </p>
          </div>
          <button
            aria-label="Tutup menu"
            onClick={onClose}
            className="absolute top-4 right-4 h-9 w-9 grid place-items-center rounded-xl"
            style={{ border: `1px solid ${palette.silver1}` }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Konten scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Tanggal */}
          <div
            className="px-3 pt-3 pb-2 text-xs flex flex-col gap-1 items-start"
            style={{ color: palette.silver2 }}
          >
            {formattedGregorian}
          </div>

          {/* Navigation */}
          <nav className="px-2 pb-4" aria-label="Navigasi">
            <ul className="space-y-2">
              {navs.map(({ path, label, icon, end }) => (
                <li key={path}>
                  <NavLinkItem
                    to={path}
                    icon={icon}
                    label={label}
                    end={end}
                    palette={palette}
                    onClick={onClose}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  );
}

/* ===================== Utils ===================== */
const buildBase = (
  slug: string | undefined,
  root: "sekolah" | "murid" | "guru"
) => (slug ? `/${slug}/${root}` : `/${root}`);

/* ===================== Main ===================== */
export default function ParentTopBar({
  palette,
  hijriDate,
  gregorianDate,
  dateFmt,
  title,
}: ParentTopBarProps) {
  const { isDark } = useHtmlDarkMode();
  const [open, setOpen] = useState(false);
  const [midnightTick, setMidnightTick] = useState(0);
  const { pathname } = useLocation();

  // slug awareness
  const params = useParams<{ slug?: string }>();
  const match = useMatch("/:slug/*");
  const slug = params.slug ?? match?.params.slug ?? "";

  // page kind
  const pageKind: "sekolah" | "murid" | "guru" = pathname.includes("/sekolah")
    ? "sekolah"
    : pathname.includes("/guru")
      ? "guru"
      : "murid";

  const base = buildBase(slug, pageKind);

  // navs
  const navs = useMemo<NavItem[]>(() => {
    const source =
      pageKind === "sekolah"
        ? SCHOOL_NAVS
        : pageKind === "guru"
          ? TEACHER_NAVS
          : STUDENT_NAVS;
    return source.map(({ path, label, icon, end }) => ({
      path: path === "." ? base : `${base}/${path}`,
      label,
      icon,
      end,
    }));
  }, [pageKind, base]);

  // dates
  const now = useMemo(() => new Date(), [pathname, midnightTick]);
  const gIso = gregorianDate ?? now.toISOString();
  const formattedGregorian = useMemo(
    () => (dateFmt ? dateFmt(gIso) : formatIDGregorian(gIso)),
    [gIso, dateFmt]
  );
  const hijriLabel = useMemo(
    () => hijriDate || formatHijriLocal(now),
    [hijriDate, now]
  );

  // lock scroll when drawer opens
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // tick after midnight to refresh dates
  useEffect(() => {
    const d = new Date();
    const msUntilMidnight =
      new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() -
      d.getTime();
    const t = setTimeout(
      () => setMidnightTick((x) => x + 1),
      msUntilMidnight + 1000
    );
    return () => clearTimeout(t);
  }, [midnightTick]);

  const brandNode =
    title ??
    (pageKind === "sekolah"
      ? "Dashboard Sekolah"
      : pageKind === "guru"
        ? "Dashboard Guru"
        : "Dashboard Murid");

  return (
    <>
      {/* Top Bar */}
      <div
        className="sticky top-0 z-40 backdrop-blur border-b"
        style={{
          background: `${palette.white1}E6`,
          borderColor: palette.silver1,
        }}
      >
        <div className="mx-auto Replace px-4 py-3 flex items-center justify-between gap-3">
          {/* Left */}
          <div className="flex items-center gap-2">
            <button
              className="md:hidden -ml-1 mr-1 grid place-items-center h-9 w-9 rounded-xl"
              onClick={() => setOpen(true)}
              aria-label="Buka menu"
              aria-controls="mobile-drawer"
              style={{ border: `1px solid ${palette.silver1}` }}
            >
              <Menu size={18} />
            </button>

            {/* Logo + Nama Sekolah dalam kolom */}
            <div className="md:flex  hidden gap-3 items-center justify-between">
              <img
                src="/image/Gambar-Masjid.jpeg"
                alt="Logo Sekolah"
                className="w-12 h-12 rounded-full object-cover items-center flex"
              />

              <span
                className="mt-1 text-xs font-semibold"
                style={{ color: palette.primary }}
              >
                <p className="text-base"> SDIT Al-Hikmah</p>
              </span>
            </div>
          </div>

          {/* Right (desktop) */}
          <div
            className="hidden md:flex items-center gap-3"
            style={{ fontSize: 14, color: palette.silver1 }}
          >
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
              style={{
                background: palette.secondary,
                // kontras diperbaiki
                color: isDark ? palette.black1 : palette.silver1,
              }}
              aria-label="Tanggal Hijriah"
              title={hijriLabel}
            >
              {hijriLabel || "—"}
            </span>
            <PublicUserDropdown variant="icon" withBg={false} />
          </div>

          {/* Right (mobile) */}
          <div className="md:hidden">
            <PublicUserDropdown variant="icon" withBg={false} />
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        open={open}
        onClose={() => setOpen(false)}
        brand={brandNode}
        formattedGregorian={formattedGregorian}
        navs={navs}
        palette={palette}
        isDark={isDark}
      />
    </>
  );
}
