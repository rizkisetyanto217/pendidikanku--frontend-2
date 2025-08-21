// src/pages/sekolahislamku/components/home/ParentTopBar.tsx
import { Link, NavLink, useParams } from "react-router-dom";
import {
  CalendarDays,
  Bell,
  GraduationCap,
  Menu,
  X,
  LayoutDashboard,
  Users,
  CheckSquare,
  ClipboardList,
  NotebookPen,
  Megaphone,
} from "lucide-react";
import PublicUserDropdown from "@/components/common/public/UserDropDown";
import { colors } from "@/constants/colorsThema";
import { useEffect, useState } from "react";

/* ============ Types ============ */
type NavItem = {
  to: string; // absolute path TANPA slug, contoh: "/guru/kelas"
  label: string;
  icon: React.ComponentType<any>;
  end?: boolean;
};

interface TeacherTopBarProps {
  palette: typeof colors.light;
  parentName?: string;
  hijriDate?: string;
  gregorianDate?: string;
  dateFmt?: (iso: string) => string;
  title?: React.ReactNode;
  navs?: NavItem[]; // default = TEACHER_NAVS
}

/* ============ Default NAV: GURU ============ */
const TEACHER_NAVS: NavItem[] = [
  { to: "/guru", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/guru/kelas", label: "Kelas Saya", icon: Users },
  { to: "/guru/kehadiran", label: "Kehadiran", icon: CheckSquare },
  { to: "/guru/penilaian", label: "Penilaian", icon: ClipboardList },
  { to: "/guru/materials", label: "Materi & Tugas", icon: NotebookPen },
  { to: "/guru/pengumuman", label: "Pengumuman", icon: Megaphone },
];

/* ===== Small Primitives (local) ===== */
function Badge({
  children,
  palette,
}: {
  children: React.ReactNode;
  palette: typeof colors.light;
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

function Btn({
  children,
  palette,
  onClick,
}: {
  children: React.ReactNode;
  palette: typeof colors.light;
  onClick?: () => void;
}) {
  return (
    <button
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

/* ============ Component ============ */
export default function TeacherTopBar({
  palette,
  hijriDate,
  gregorianDate,
  dateFmt,
  title,
  navs,
}: TeacherTopBarProps) {
  const [open, setOpen] = useState(false);
  const NAVS: NavItem[] = navs ?? TEACHER_NAVS;

  // 👉 ambil slug & helper pembuat URL ber‑slug
  const { slug } = useParams();
  const withSlug = (path: string) => {
    // path di sini adalah absolute tanpa slug, contoh: "/guru/kelas"
    const prefix = slug ? `/${slug}` : "";
    // hindari double slash
    return `${prefix}${path.startsWith("/") ? path : `/${path}`}`;
  };

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const isDefaultBrand = title == null;
  const brand = isDefaultBrand ? "SekolahIslamku" : title;

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
          {/* kiri: brand + (mobile) menu button */}
          <div className="flex items-center gap-2">
            <button
              className="md:hidden -ml-1 mr-1 grid place-items-center h-9 w-9 rounded-xl"
              onClick={() => setOpen(true)}
              aria-label="Buka menu"
              style={{ border: `1px solid ${palette.silver1}` }}
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2">
              {isDefaultBrand && (
                <GraduationCap size={22} color={palette.black1} />
              )}
              <div className="leading-tight">
                <div className="font-semibold">{brand}</div>
                <div
                  className="hidden sm:block text-xs"
                  style={{ color: palette.silver2 }}
                >
                  {gregorianDate && dateFmt ? dateFmt(gregorianDate) : ""}
                </div>
              </div>
            </div>
          </div>

          {/* kanan (desktop) */}
          <div
            className="hidden md:flex items-center gap-3"
            style={{ fontSize: 14, color: palette.silver2 }}
          >
            {/* <CalendarDays size={16} />
            <span className="hidden sm:inline">
              {gregorianDate && dateFmt ? dateFmt(gregorianDate) : ""}
            </span> */}
            {hijriDate && <Badge palette={palette}>{hijriDate}</Badge>}

           

            <PublicUserDropdown variant="icon" withBg={false} />
          </div>

          {/* kanan (mobile) */}
          <div className="md:hidden">
            <PublicUserDropdown variant="icon" withBg={false} />
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className="md:hidden"
        aria-hidden={!open}
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        {/* overlay */}
        <div
          className={`fixed inset-0 z-50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
          style={{ background: "#0006" }}
        />

        {/* panel */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            background: palette.white1,
            borderRight: `1px solid ${palette.silver1}`,
          }}
          role="dialog"
          aria-label="Menu navigasi"
        >
          {/* header panel */}
          <div
            className="flex items-center justify-between px-3 py-3 border-b"
            style={{ borderColor: palette.silver1 }}
          >
            <div className="flex items-center gap-2">
              {isDefaultBrand && (
                <GraduationCap size={20} color={palette.primary} />
              )}
              <span className="font-semibold">{brand}</span>
            </div>
            <button
              aria-label="Tutup menu"
              onClick={() => setOpen(false)}
              className="h-9 w-9 grid place-items-center rounded-xl"
              style={{ border: `1px solid ${palette.silver1}` }}
            >
              <X size={18} />
            </button>
          </div>

          {/* tanggal + hijri */}
          <div
            className="px-3 pt-3 pb-2 text-xs"
            style={{ color: palette.silver2 }}
          >
            {gregorianDate && dateFmt ? dateFmt(gregorianDate) : ""}
            {hijriDate ? (
              <span
                className="ml-2 inline-flex items-center rounded-full px-2 py-0.5"
                style={{ background: palette.secondary, color: palette.white1 }}
              >
                {hijriDate}
              </span>
            ) : null}
          </div>

          {/* nav list */}
          <nav className="px-2 pb-4" aria-label="Navigasi">
            <ul className="space-y-2">
              {(navs ?? TEACHER_NAVS).map(({ to, label, icon: Icon, end }) => {
                const abs = withSlug(to); // ➜ inject slug di sini
                return (
                  <li key={abs}>
                    <NavLink
                      to={abs}
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
                              color: isActive
                                ? palette.primary
                                : palette.silver2,
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

            {/* Notifikasi shortcut */}
            <div className="mt-3 px-1">
              <Link to={withSlug("/notifikasi")} onClick={() => setOpen(false)}>
                <div
                  className="flex items-center gap-3 rounded-xl px-3 py-2 border"
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
