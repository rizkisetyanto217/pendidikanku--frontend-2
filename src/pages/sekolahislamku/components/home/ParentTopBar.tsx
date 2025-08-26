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
} from "lucide-react";
import PublicUserDropdown from "@/components/common/public/UserDropDown";
import type { Palette } from "@/pages/sekolahislamku/components/ui/Primitives";

/* ===================== Types ===================== */
interface ParentTopBarProps {
  palette: Palette;
  /** Bila diberikan, pakai ini; jika tidak akan dihitung lokal */
  hijriDate?: string;
  gregorianDate?: string; // ISO; fallback: today
  /** Custom formatter utk Masehi; default: id-ID lengkap */
  dateFmt?: (iso: string) => string;
  title?: ReactNode;
}

type NavItem = {
  path: "." | string;
  label: string;
  icon: ComponentType<any>;
  end?: boolean;
};

/* ===================== Helpers ===================== */
const buildBase = (
  slug: string | undefined,
  root: "sekolah" | "murid" | "guru"
) => (slug ? `/${slug}/${root}` : `/${root}`);

const idIdFormat = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

/** Hijri fallback (Umm al-Qura). Return "" bila tidak didukung browser */
const formatHijriLocal = (d: Date) => {
  try {
    const fmt = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `${fmt.format(d)} H`;
  } catch {
    return "";
  }
};

/* ===================== Nav Definitions (RELATIF) ===================== */
const STUDENT_NAVS: NavItem[] = [
  { path: ".", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "progress", label: "Progress Anak", icon: ClipboardCheck },
  { path: "finance", label: "Pembayaran", icon: Wallet },
  { path: "jadwal", label: "Jadwal", icon: Megaphone }, // bisa ganti ke CalendarDays kalau dipakai
  { path: "pengumuman", label: "Pengumuman", icon: Megaphone },
  { path: "rapor", label: "Rapor Nilai", icon: FileSpreadsheet },
];

const SCHOOL_NAVS: NavItem[] = [
  { path: ".", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "murid", label: "Siswa", icon: Users },
  { path: "guru", label: "Guru", icon: UserCog },
  { path: "kelas", label: "Kelas", icon: BookOpen },
  { path: "kehadiran", label: "Absensi", icon: CheckSquare },
  { path: "buku", label: "Buku", icon: BookOpen },
  { path: "keuangan", label: "Keuangan", icon: Wallet },
  { path: "pengumuman", label: "Pengumuman", icon: Megaphone },
];

const TEACHER_NAVS: NavItem[] = [
  { path: ".", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "kelas", label: "Kelas Saya", icon: Users },
  { path: "kehadiran", label: "Kehadiran", icon: CheckSquare },
  { path: "penilaian", label: "Penilaian", icon: ClipboardList },
  { path: "materials", label: "Materi & Tugas", icon: NotebookPen },
  { path: "pengumuman", label: "Pengumuman", icon: Megaphone },
];

/* ===================== Tiny UI ===================== */
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
          <span className="truncate">{label}</span>
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
  hijriLabel,
  navs,
  palette,
}: {
  open: boolean;
  onClose: () => void;
  brand: ReactNode;
  formattedGregorian: string;
  hijriLabel: string;
  navs: {
    to: string;
    label: string;
    icon: ComponentType<any>;
    end?: boolean;
  }[];
  palette: Palette;
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
        className="fixed inset-y-0 left-0 z-50 w-72 max-w-[70vw]"
        style={{
          background: palette.white1,
          borderRight: `1px solid ${palette.silver1}`,
        }}
        role="dialog"
        aria-label="Menu navigasi"
      >
        <div
          className="flex items-center justify-between px-3 py-3 border-b"
          style={{ borderColor: palette.silver1 }}
        >
          <div className="flex items-center gap-2">
            <GraduationCap size={20} color={palette.primary} />
            <span className="font-semibold">{brand}</span>
          </div>
          <button
            aria-label="Tutup menu"
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-xl"
            style={{ border: `1px solid ${palette.silver1}` }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="px-3 pt-3 pb-2 text-xs flex flex-col gap-1 items-start"
          style={{ color: palette.silver2 }}
        >
          {formattedGregorian}
          <span
            className="ml-2 inline-flex items-center rounded-full px-2 py-0.5"
            style={{ background: palette.secondary, color: palette.white1 }}
          >
            {hijriLabel || "—"}
          </span>
        </div>

        <nav className="px-2 pb-4" aria-label="Navigasi">
          <ul className="space-y-2">
            {navs.map(({ to, label, icon, end }) => (
              <li key={to}>
                <NavLinkItem
                  to={to}
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
      </aside>
    </div>
  );
}

/* ===================== Main Component ===================== */
export default function ParentTopBar({
  palette,
  hijriDate,
  gregorianDate,
  dateFmt,
  title,
}: ParentTopBarProps) {
  const [open, setOpen] = useState(false);
  const [midnightTick, setMidnightTick] = useState(0); // trigger re-render after midnight
  const { pathname } = useLocation();

  // slug awareness
  const params = useParams<{ slug?: string }>();
  const match = useMatch("/:slug/*");
  const slug = params.slug ?? match?.params.slug ?? "";

  // Tentukan jenis halaman (sekolah/murid/guru)
  const pageKind: "sekolah" | "murid" | "guru" = pathname.includes("/sekolah")
    ? "sekolah"
    : pathname.includes("/guru")
      ? "guru"
      : "murid";

  // Base URL untuk semua link di nav (slug-aware)
  const base = buildBase(slug, pageKind);

  // Sumber nav sesuai jenis halaman
  const navs = useMemo(() => {
    const source =
      pageKind === "sekolah"
        ? SCHOOL_NAVS
        : pageKind === "guru"
          ? TEACHER_NAVS
          : STUDENT_NAVS;
    return source.map(({ path, label, icon, end }) => ({
      to: path === "." ? base : `${base}/${path}`,
      label,
      icon,
      end,
    }));
  }, [pageKind, base]);

  // Dates (always available)
  const now = useMemo(() => new Date(), [pathname, midnightTick]);
  const gIso = gregorianDate ?? now.toISOString();
  const formattedGregorian = useMemo(
    () => (dateFmt ? dateFmt(gIso) : idIdFormat(gIso)),
    [gIso, dateFmt]
  );
  const hijriLabel = useMemo(
    () => hijriDate || formatHijriLocal(now),
    [hijriDate, now]
  );

  // Lock scroll when drawer open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => void (document.body.style.overflow = prev);
  }, [open]);

  // Auto update after midnight (supaya tanggal ganti otomatis)
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

  // Judul default sesuai jenis dashboard
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
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          {/* Left: Brand & subtitle (Masehi kecil) */}
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

            {/* Judul kiri */}
            <div className="flex items-center gap-2">
              {!title && <GraduationCap size={22} color={palette.black1} />}
              <div className="leading-tight">
                <div className="font-semibold">
                  <Link to={base}>{brandNode}</Link>
                </div>
                <div
                  className="hidden sm:block text-xs"
                  style={{ color: palette.silver2 }}
                >
                  {formattedGregorian}
                </div>
              </div>
            </div>
          </div>

          {/* Right (desktop) */}
          <div
            className="hidden md:flex items-center gap-3"
            style={{ fontSize: 14, color: palette.silver2 }}
          >
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ background: palette.secondary, color: palette.white1 }}
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

        {/* (Opsional) Mobile inline dates – disembunyikan untuk ringkas */}
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        open={open}
        onClose={() => setOpen(false)}
        brand={brandNode}
        formattedGregorian={formattedGregorian}
        hijriLabel={hijriLabel}
        navs={navs}
        palette={palette}
      />
    </>
  );
}
