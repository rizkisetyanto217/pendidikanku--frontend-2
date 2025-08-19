// src/pages/sekolahislamku/components/home/ParentTopBar.tsx
import { Link, NavLink } from "react-router-dom";
import {
  CalendarDays,
  Bell,
  GraduationCap,
  Menu,
  X,
  LayoutDashboard,
  ClipboardCheck,
  FileSpreadsheet,
  Wallet,
  CalendarDays as CalendarIcon,
} from "lucide-react";
import PublicUserDropdown from "@/components/common/public/UserDropDown";
import { colors } from "@/constants/colorsThema";
import { useEffect, useState } from "react";

interface ParentTopBarProps {
  palette: typeof colors.light;
  parentName?: string;
  hijriDate?: string;
  gregorianDate?: string;
  dateFmt?: (iso: string) => string;
  title?: React.ReactNode; // custom title; jika ada, ikon brand disembunyikan
}

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

/* ===== NAV items (sinkron dengan sidebar) ===== */
type Item = {
  to: string;
  label: string;
  icon: React.ComponentType<any>;
  end?: boolean;
};
const NAVS: Item[] = [
  { to: "/sekolah", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/sekolah/guru", label: "Guru", icon: ClipboardCheck },
  { to: "/sekolah/finance", label: "Kelas", icon: Wallet },
  { to: "/sekolah/jadwal", label: "Absensi", icon: CalendarIcon },
  { to: "/sekolah/pengumuman", label: "Keuangan", icon: Bell },
  { to: "/sekolah/rapor", label: "Pengumuman", icon: FileSpreadsheet },
];

// ✅ Ubah nama function agar sesuai dengan nama file
export default function ParentTopBar({
  palette,
  hijriDate,
  gregorianDate,
  dateFmt,
  title,
}: ParentTopBarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  // Ikon tampil hanya saat pakai brand default
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
            {/* tombol menu (mobile) */}
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
            <CalendarDays size={16} />
            <span className="hidden sm:inline">
              {gregorianDate && dateFmt ? dateFmt(gregorianDate) : ""}
            </span>
            {hijriDate && <Badge palette={palette}>{hijriDate}</Badge>}

            <Link to="/notifikasi">
              <Btn palette={palette}>
                <Bell className="mr-2" size={16} /> Notifikasi
              </Btn>
            </Link>

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
        className={`md:hidden fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* overlay */}
        <div
          className={`absolute inset-0 bg-black bg-opacity-60 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* panel */}
        <aside
          className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out ${
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
              {NAVS.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={!!end}
                    className={({ isActive }) =>
                      `block focus:outline-none rounded-xl border transition-all ${
                        isActive ? "bg-opacity-100" : "hover:bg-opacity-50"
                      }`
                    }
                    style={({ isActive }) => ({
                      background: isActive ? palette.primary2 : palette.white1,
                      borderColor: isActive ? palette.primary : palette.silver1,
                      boxShadow: isActive
                        ? `0 0 0 1px ${palette.primary} inset`
                        : "none",
                    })}
                    onClick={() => {
                      console.log("Navigating to:", to); // Debug log
                      setOpen(false);
                    }}
                  >
                    {({ isActive }) => (
                      <div
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                        style={{
                          color: isActive ? palette.primary : palette.black1,
                        }}
                      >
                        <span
                          className="h-7 w-7 grid place-items-center rounded-lg border flex-shrink-0"
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
                        <span className="truncate font-medium">{label}</span>
                      </div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Notifikasi shortcut */}
            <div className="mt-3 px-1">
              <Link
                to="/notifikasi"
                className="block focus:outline-none"
                onClick={() => {
                  console.log("Navigating to: /notifikasi"); // Debug log
                  setOpen(false);
                }}
              >
                <div
                  className="flex items-center gap-3 rounded-xl px-3 py-2 border cursor-pointer hover:bg-opacity-50 transition-all"
                  style={{
                    background: palette.white1,
                    borderColor: palette.silver1,
                    color: palette.black1,
                  }}
                >
                  <span
                    className="h-7 w-7 grid place-items-center rounded-lg border flex-shrink-0"
                    style={{
                      background: palette.white1,
                      borderColor: palette.silver1,
                      color: palette.silver2,
                    }}
                  >
                    <Bell size={16} />
                  </span>
                  <span className="truncate font-medium">Notifikasi</span>
                </div>
              </Link>
            </div>
          </nav>
        </aside>
      </div>
    </>
  );
}
