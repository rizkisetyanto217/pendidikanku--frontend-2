import {
  useState,
  useEffect,
  useMemo,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  useLocation,
  useParams,
  useMatch,
  NavLink,
  Link,
} from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  BookOpen,
  CheckSquare,
  Wallet,
  Megaphone,
  ClipboardCheck,
  FileSpreadsheet,
  CalendarDays,
  GraduationCap,
  Menu,
  X,
  Bell,
} from "lucide-react";
import PublicUserDropdown from "@/components/common/public/UserDropDown";
import type { Palette } from "@/pages/sekolahislamku/components/ui/Primitives";

/* ================= Types ================= */
type NavBase = {
  path: string; // relatif terhadap base (murid|sekolah)
  label: string;
  icon: ComponentType<any>;
  end?: boolean;
};

interface ParentTopBarProps {
  palette: Palette;
  /** contoh: "16 Muharram 1447 H" */
  hijriDate?: string;
  /** ISO string (akan diformat via dateFmt) */
  gregorianDate?: string;
  /** formatter tanggal (wajib bila kirim gregorianDate) */
  dateFmt?: (iso: string) => string;
  /** Judul/brand yang tampil di kiri; default "SekolahIslamku" */
  title?: ReactNode;
  /**
   * Opsional: paksa mode sekolah atau murid.
   * Bila tidak diset, otomatis deteksi dari URL (`/sekolah` vs `/murid`).
   */
  forceContext?: "school" | "student";
}

/* ================= Constants ================= */
// Menu murid
const STUDENT_NAVS: NavBase[] = [
  { path: ".", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "progress", label: "Progress Anak", icon: ClipboardCheck },
  { path: "finance", label: "Pembayaran", icon: Wallet },
  { path: "jadwal", label: "Jadwal", icon: CalendarDays },
  { path: "pengumuman", label: "Pengumuman", icon: Megaphone },
  { path: "rapor", label: "Rapor Nilai", icon: FileSpreadsheet },
];

// Menu sekolah
const SCHOOL_NAVS: NavBase[] = [
  { path: ".", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "murid", label: "Siswa", icon: Users },
  { path: "guru", label: "Guru", icon: UserCog },
  { path: "kelas", label: "Kelas", icon: BookOpen },
  { path: "kehadiran", label: "Absensi", icon: CheckSquare },
  { path: "keuangan", label: "Keuangan", icon: Wallet },
  { path: "pengumuman", label: "Pengumuman", icon: Megaphone },
];

/* ================ Small UI ================= */
function Badge({
  children,
  palette,
}: {
  children: ReactNode;
  palette: Palette;
}) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: palette.secondary, color: palette.white1 }}
    >
      {children}
    </span>
  );
}

function GhostBtn({
  children,
  palette,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  palette: Palette;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-sm rounded-2xl font-medium"
      style={{
        background: "transparent",
        color: palette.black1,
        border: `1px solid ${palette.silver1}`,
      }}
    >
      {children}
    </button>
  );
}

/* ================= Component ================= */
export default function ParentTopBar({
  palette,
  hijriDate,
  gregorianDate,
  dateFmt,
  title,
  forceContext,
}: ParentTopBarProps) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Ambil slug dari params atau dari pattern fallback
  const params = useParams<{ slug?: string }>();
  const match = useMatch("/:slug/*");
  const slug = params.slug ?? match?.params.slug;

  // Tentukan konteks (school/student)
  const context: "school" | "student" = useMemo(() => {
    if (forceContext) return forceContext;
    return pathname.includes("/sekolah") ? "school" : "student";
  }, [forceContext, pathname]);

  // Base path
  const basePath = useMemo(() => {
    const base = context === "school" ? "sekolah" : "murid";
    return slug ? `/${slug}/${base}` : `/${base}`;
  }, [context, slug]);

  // Bangun daftar nav absolut (dengan slug)
  const navs = useMemo(() => {
    const source = context === "school" ? SCHOOL_NAVS : STUDENT_NAVS;
    return source.map(({ path, label, icon, end }) => {
      const to = path === "." ? basePath : `${basePath}/${path}`;
      return { to, label, icon, end };
    });
  }, [context, basePath]);

  // Helper buat path lain yang tetap sluggable
  const withSlug = (to: string) => {
    const abs = to.startsWith("/") ? to : `/${to}`;
    return slug ? `/${slug}${abs}` : abs;
  };

  // Kunci scroll saat drawer terbuka
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const brandName = title ?? "SekolahIslamku";
  const formattedDate =
    gregorianDate && dateFmt ? (dateFmt(gregorianDate) as string) : "";

  return (
    <>
      {/* ====== Top Bar ====== */}
      <header
        className="sticky top-0 z-40 backdrop-blur border-b"
        style={{
          background: `${palette.white1}E6`,
          borderColor: palette.silver1,
        }}
        role="banner"
      >
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          {/* Kiri: menu button + brand + tanggal di bawah judul */}
          <div className="flex items-center gap-2">
            <GhostBtn
              palette={palette}
              ariaLabel="Buka menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={18} />
            </GhostBtn>

            <div className="flex items-center gap-2">
              {!title && <GraduationCap size={22} color={palette.black1} />}
              <div className="leading-tight">
                <div className="font-semibold">
                  <Link to={basePath}>{brandName}</Link>
                </div>
                {/* Tanggal SELALU di bawah judul */}
                <div className="text-xs" style={{ color: palette.silver2 }}>
                  {formattedDate}
                </div>
              </div>
            </div>
          </div>

          {/* Kanan (desktop): tanpa duplikasi tanggal */}
          <div
            className="hidden md:flex items-center gap-3"
            style={{ fontSize: 14, color: palette.silver2 }}
          >
            {/* tampilkan hijri sebagai badge kecil (opsional) */}
            {hijriDate && <Badge palette={palette}>{hijriDate}</Badge>}

            {/* shortcut notifikasi */}
            <Link to={withSlug("/notifikasi")}>
              <GhostBtn palette={palette}>
                <Bell className="mr-2" size={16} /> Notifikasi
              </GhostBtn>
            </Link>

            <PublicUserDropdown variant="icon" withBg={false} />
          </div>

          {/* Kanan (mobile) */}
          <div className="md:hidden">
            <PublicUserDropdown variant="icon" withBg={false} />
          </div>
        </div>
      </header>

      {/* ====== Drawer Mobile ====== */}
      <div
        className="md:hidden"
        aria-hidden={!open}
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        {/* Overlay */}
        <div
          className={`fixed inset-0 z-50 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
          style={{ background: "#0006" }}
          aria-label="Tutup menu"
        />

        {/* Panel */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            background: palette.white1,
            borderRight: `1px solid ${palette.silver1}`,
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
        >
          {/* Header panel */}
          <div
            className="flex items-center justify-between px-3 py-3 border-b"
            style={{ borderColor: palette.silver1 }}
          >
            <div className="flex items-center gap-2">
              {!title && <GraduationCap size={20} color={palette.primary} />}
              <span className="font-semibold">{brandName}</span>
            </div>
            <GhostBtn
              palette={palette}
              ariaLabel="Tutup menu"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </GhostBtn>
          </div>

          {/* Tanggal + Hijri (mobile) */}
          <div
            className="px-3 pt-3 pb-2 text-xs"
            style={{ color: palette.silver2 }}
          >
            {formattedDate}
            {hijriDate && (
              <span
                className="ml-2 inline-flex items-center rounded-full px-2 py-0.5"
                style={{ background: palette.secondary, color: palette.white1 }}
              >
                {hijriDate}
              </span>
            )}
          </div>

          {/* Nav list */}
          <nav className="px-2 pb-4" aria-label="Navigasi">
            <ul className="space-y-2">
              {navs.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={!!end}
                    className="block focus:outline-none"
                    onClick={() => setOpen(false)}
                  >
                    {({ isActive }) => (
                      <div
                        className="flex items-center gap-3 rounded-xl px-3 py-2 border transition-all"
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

            {/* Shortcut Notifikasi (mobile) */}
            <div className="mt-3 px-1">
              <Link to={withSlug("/notifikasi")} onClick={() => setOpen(false)}>
                <div
                  className="flex items-center gap-3 rounded-xl px-3 py-2 border transition-all"
                  style={{
                    background: palette.white1,
                    borderColor: palette.silver1,
                    color: palette.black1,
                  }}
                >
                  <span
                    className="h-7 w-7 grid place-items-center rounded-lg border"
                    style={{
                      background: palette.white1,
                      borderColor: palette.silver1,
                      color: palette.silver2,
                    }}
                  >
                    <Bell size={16} />
                  </span>
                  <span className="truncate">Notifikasi</span>
                </div>
              </Link>
            </div>
          </nav>
        </aside>
      </div>
    </>
  );
}
