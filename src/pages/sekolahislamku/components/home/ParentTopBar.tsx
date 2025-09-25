

// // src/pages/sekolahislamku/components/home/ParentTopBar.tsx
// import {
//   useEffect,
//   useMemo,
//   useState,
//   type ComponentType,
//   type ReactNode,
// } from "react";
// import {
//   NavLink,
//   useLocation,
//   useMatch,
//   useParams,
//   useNavigate,
// } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Users,
//   UserCog,
//   BookOpen,
//   CheckSquare,
//   Wallet,
//   Megaphone,
//   FileSpreadsheet,
//   ClipboardCheck,
//   Calendar1,
//   Menu,
//   X,
//   School,
//   ChartBar,
//   ArrowLeft,
//   CalendarDays,
// } from "lucide-react";
// import PublicUserDropdown from "@/components/common/public/UserDropDown";
// import type { Palette } from "@/pages/sekolahislamku/components/ui/Primitives";
// import useHtmlDarkMode from "@/hooks/useHTMLThema";

// /* ===================== Types ===================== */
// interface ParentTopBarProps {
//   palette: Palette;
//   title?: ReactNode;
//   hijriDate?: string;
//   gregorianDate?: string;
//   dateFmt?: (iso: string) => string;
//   showBack?: boolean; // boleh override manual
//   onBackClick?: () => void;
// }

// /* ===================== Date helpers ===================== */
// const toCivilUtcDate = (d: Date) =>
//   new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

// const formatIDGregorian = (iso: string) =>
//   new Intl.DateTimeFormat("id-ID", {
//     weekday: "long",
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   }).format(new Date(iso));

// const formatHijriLocal = (d: Date) => {
//   try {
//     return new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
//       day: "numeric",
//       month: "long",
//       year: "numeric",
//       timeZone: "UTC",
//       weekday: "long",
//     }).format(toCivilUtcDate(d));
//   } catch {
//     return "";
//   }
// };

// /* ===================== Nav data ===================== */
// type NavItem = {
//   path: "." | string;
//   label: string;
//   icon: ComponentType<any>;
//   end?: boolean;
// };

// const STUDENT_NAVS: NavItem[] = [
//   { path: ".", label: "Dashboard", icon: LayoutDashboard, end: true },
//   { path: "menu-utama", label: "Menu Utama", icon: ChartBar },
//   { path: "progress", label: "Progress Anak", icon: ClipboardCheck },
//   { path: "finance", label: "Pembayaran", icon: Wallet },
//   { path: "jadwal", label: "Jadwal", icon: Calendar1 },
//   { path: "pengumuman", label: "Pengumuman", icon: Megaphone },
//   { path: "rapor", label: "Rapor Nilai", icon: FileSpreadsheet },
//   { path: "profil-murid", label: "Profil", icon: Users },
// ];

// const SCHOOL_NAVS: NavItem[] = [
//   { path: ".", label: "Dashboard", icon: LayoutDashboard, end: true },
//   { path: "menu-utama", label: "Menu Utama", icon: ChartBar },
//   { path: "murid", label: "Siswa", icon: Users },
//   { path: "guru", label: "Guru", icon: UserCog },
//   { path: "kelas", label: "Kelas", icon: BookOpen },
//   { path: "kehadiran", label: "Absensi", icon: CheckSquare },
//   { path: "buku", label: "Buku", icon: BookOpen },
//   { path: "keuangan", label: "Keuangan", icon: Wallet },
//   { path: "profil-sekolah", label: "Profil", icon: School },
//   { path: "academic", label: "Akademik", icon: FileSpreadsheet },
// ];

// const TEACHER_NAVS: NavItem[] = [
//   { path: ".", label: "Dashboard", icon: LayoutDashboard, end: true },
//   { path: "menu-utama", label: "Menu Utama", icon: ChartBar },
//   { path: "kelas", label: "Kelas Saya", icon: Users },
//   { path: "jadwal", label: "Jadwal", icon: CalendarDays },
//   { path: "profil-guru", label: "Profil", icon: Users },
// ];

// /* ===================== Small UI ===================== */
// function NavLinkItem({
//   to,
//   icon: Icon,
//   label,
//   end,
//   palette,
//   onClick,
// }: {
//   to: string;
//   icon: ComponentType<any>;
//   label: string;
//   end?: boolean;
//   palette: Palette;
//   onClick?: () => void;
// }) {
//   return (
//     <NavLink
//       to={to}
//       end={!!end}
//       onClick={onClick}
//       className="block focus:outline-none"
//     >
//       {({ isActive }) => (
//         <div
//           className="flex items-center gap-3 rounded-xl px-3 py-2 border transition-all hover:translate-x-px"
//           style={{
//             background: isActive ? palette.primary2 : palette.white1,
//             borderColor: isActive ? palette.primary : palette.silver1,
//             boxShadow: isActive ? `0 0 0 1px ${palette.primary} inset` : "none",
//             color: isActive ? palette.primary : palette.black1,
//           }}
//         >
//           <span
//             className="h-7 w-7 grid place-items-center rounded-lg border"
//             style={{
//               background: isActive ? palette.primary2 : palette.white1,
//               borderColor: isActive ? palette.primary : palette.silver1,
//               color: isActive ? palette.primary : palette.silver2,
//             }}
//           >
//             <Icon size={16} />
//           </span>
//           <span className="font-medium text-sm">{label}</span>
//         </div>
//       )}
//     </NavLink>
//   );
// }

// function MobileDrawer({
//   open,
//   onClose,
//   navs,
//   palette,
//   isDark,
//   formattedGregorian,
// }: {
//   open: boolean;
//   onClose: () => void;
//   navs: NavItem[];
//   palette: Palette;
//   isDark: boolean;
//   formattedGregorian: string;
// }) {
//   if (!open) return null;
//   return (
//     <div className="md:hidden" style={{ pointerEvents: "auto" }}>
//       <div
//         className="fixed inset-0 z-50"
//         onClick={onClose}
//         style={{ background: "#0006" }}
//       />
//       <aside
//         className="fixed inset-y-0 left-0 z-50 w-72 max-w-[70vw] flex flex-col"
//         style={{
//           background: palette.white1,
//           borderRight: `1px solid ${palette.silver1}`,
//         }}
//       >
//         <div
//           className="flex flex-col items-center px-4 py-6 border-b relative"
//           style={{ borderColor: palette.silver1 }}
//         >
//           <img
//             src="/image/Gambar-Masjid.jpeg"
//             alt="Logo Sekolah"
//             className="w-16 h-16 rounded-full object-cover border-2"
//             style={{ borderColor: palette.primary }}
//           />
//           <h2
//             className="font-bold text-lg mt-2"
//             style={{ color: palette.primary }}
//           >
//             SDIT Al-Hikmah
//           </h2>
//           <button
//             aria-label="Tutup menu"
//             onClick={onClose}
//             className="absolute top-4 right-4 h-9 w-9 grid place-items-center rounded-xl"
//             style={{ border: `1px solid ${palette.silver1}` }}
//           >
//             <X size={18} />
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto">
//           <div
//             className="px-3 pt-3 pb-2 text-xs"
//             style={{ color: palette.silver2 }}
//           >
//             {formattedGregorian}
//           </div>
//           <nav className="px-2 pb-4">
//             <ul className="space-y-2">
//               {navs.map(({ path, label, icon, end }) => (
//                 <li key={path}>
//                   <NavLinkItem
//                     to={path}
//                     icon={icon}
//                     label={label}
//                     end={end}
//                     palette={palette}
//                     onClick={onClose}
//                   />
//                 </li>
//               ))}
//             </ul>
//           </nav>
//         </div>
//       </aside>
//     </div>
//   );
// }

// /* ===================== Utils ===================== */
// const buildBase = (
//   slug: string | undefined,
//   root: "sekolah" | "murid" | "guru"
// ) => (slug ? `/${slug}/${root}` : `/${root}`);

// /* ===================== Main ===================== */
// export default function ParentTopBar({
//   palette,
//   hijriDate,
//   gregorianDate,
//   dateFmt,
//   title,
//   showBack,
//   onBackClick,
// }: ParentTopBarProps) {
//   const { isDark } = useHtmlDarkMode();
//   const [open, setOpen] = useState(false);
//   const [midnightTick, setMidnightTick] = useState(0);
//   const { pathname } = useLocation();
//   const navigate = useNavigate();

//   // slug awareness
//   const params = useParams<{ slug?: string; id?: string }>();
//   const match = useMatch("/:slug/*");
//   const slug = params.slug ?? match?.params.slug ?? "";

//   const pageKind: "sekolah" | "murid" | "guru" = pathname.includes("/sekolah")
//     ? "sekolah"
//     : pathname.includes("/guru")
//       ? "guru"
//       : "murid";

//   const base = buildBase(slug, pageKind);

//   const navs = useMemo<NavItem[]>(() => {
//     const source =
//       pageKind === "sekolah"
//         ? SCHOOL_NAVS
//         : pageKind === "guru"
//           ? TEACHER_NAVS
//           : STUDENT_NAVS;
//     return source.map(({ path, label, icon, end }) => ({
//       path: path === "." ? base : `${base}/${path}`,
//       label,
//       icon,
//       end,
//     }));
//   }, [pageKind, base]);

//   // aktif label
//   const activeLabel = useMemo(() => {
//     if (title && typeof title === "string") return title;
//     const found = navs.find(
//       (n) => pathname === n.path || pathname.startsWith(n.path + "/")
//     );
//     return found?.label ?? "";
//   }, [pathname, navs, title]);

//   // auto showBack kalau ada param id (nested)
//   const autoShowBack = showBack ?? !!params.id;

//   // tanggal
//   const now = useMemo(() => new Date(), [pathname, midnightTick]);
//   const gIso = gregorianDate ?? now.toISOString();
//   const formattedGregorian = useMemo(
//     () => (dateFmt ? dateFmt(gIso) : formatIDGregorian(gIso)),
//     [gIso, dateFmt]
//   );
//   const hijriLabel = useMemo(
//     () => hijriDate || formatHijriLocal(now),
//     [hijriDate, now]
//   );

//   const handleBackClick = () => {
//     if (onBackClick) onBackClick();
//     else navigate(-1);
//   };

//   // refresh tiap tengah malam
//   useEffect(() => {
//     const d = new Date();
//     const msUntilMidnight =
//       new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() -
//       d.getTime();
//     const t = setTimeout(
//       () => setMidnightTick((x) => x + 1),
//       msUntilMidnight + 1000
//     );
//     return () => clearTimeout(t);
//   }, [midnightTick]);

//   return (
//     <>
//       <div
//         className="sticky top-0 z-40 backdrop-blur border-b"
//         style={{ borderColor: palette.silver1 }}
//       >
//         <div className="mx-auto px-4 py-3 flex items-center justify-between">
//           {/* Mobile */}
//           <div className="flex items-center gap-3 md:hidden flex-1">
//             {autoShowBack && (
//               <button
//                 className="h-9 w-9 grid place-items-center rounded-xl border flex-shrink-0"
//                 onClick={handleBackClick}
//                 aria-label="Kembali"
//                 style={{ borderColor: palette.silver1 }}
//               >
//                 <ArrowLeft size={18} />
//               </button>
//             )}
//             <span
//               className="font-semibold text-lg truncate flex-1 text-start"
//               style={{ color: palette.black2 }}
//             >
//               {activeLabel}
//             </span>
//             <div className="flex items-center gap-2 flex-shrink-0">
//               <button
//                 className="h-9 w-9 grid place-items-center rounded-xl border"
//                 onClick={() => setOpen(true)}
//                 aria-label="Buka menu"
//                 style={{ borderColor: palette.silver1 }}
//               >
//                 <Menu size={18} />
//               </button>
//               <PublicUserDropdown variant="icon" withBg={false} />
//             </div>
//           </div>

//           {/* Desktop */}
//           <div className="hidden md:flex gap-3 items-center">
//             <img
//               src="/image/Gambar-Masjid.jpeg"
//               alt="Logo Sekolah"
//               className="w-12 h-12 rounded-full object-cover"
//             />
//             <span
//               className="text-base font-semibold"
//               style={{ color: palette.primary }}
//             >
//               SDIT Al-Hikmah
//             </span>
//           </div>

//           <div
//             className="hidden md:flex items-center gap-3 text-sm"
//             style={{ color: palette.silver1 }}
//           >
//             <span
//               className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
//               style={{
//                 background: palette.secondary,
//                 color: isDark ? palette.black1 : palette.silver1,
//               }}
//             >
//               {hijriLabel || "—"}
//             </span>
//             <PublicUserDropdown variant="icon" withBg={false} />
//           </div>
//         </div>
//       </div>

//       <MobileDrawer
//         open={open}
//         onClose={() => setOpen(false)}
//         navs={navs}
//         palette={palette}
//         isDark={isDark}
//         formattedGregorian={formattedGregorian}
//       />
//     </>
//   );
// }

// src/pages/sekolahislamku/components/home/ParentTopBar.tsx
import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
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
import { NAVS, type NavItem } from "./navsConfig";

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
const formatIDGregorian = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

const formatHijriLocal = (d: Date) =>
  new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
    weekday: "long",
  }).format(new Date(d));

const buildBase = (slug: string | undefined, root: "sekolah" | "murid" | "guru") =>
  slug ? `/${slug}/${root}` : `/${root}`;

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

  const pageKind: "sekolah" | "murid" | "guru" = pathname.includes("/sekolah")
    ? "sekolah"
    : pathname.includes("/guru")
    ? "guru"
    : "murid";

  const base = buildBase(slug, pageKind);

  const navs: NavItem[] = useMemo(
    () =>
      NAVS[pageKind].map((n) => ({
        ...n,
        path: n.path === "." ? base : `${base}/${n.path}`,
      })),
    [pageKind, base]
  );

  const activeLabel = useMemo(() => {
    if (title && typeof title === "string") return title;
    const found = navs.find((n) => pathname === n.path || pathname.startsWith(n.path + "/"));
    return found?.label ?? "";
  }, [pathname, navs, title]);

  const now = new Date();
  const gIso = gregorianDate ?? now.toISOString();
  const formattedGregorian = dateFmt ? dateFmt(gIso) : formatIDGregorian(gIso);
  const hijriLabel = hijriDate || formatHijriLocal(now);

  const handleBackClick = () => (onBackClick ? onBackClick() : navigate(-1));

  return (
    <>
      <div
        className="sticky top-0 z-40 backdrop-blur border-b"
        style={{ borderColor: palette.silver1 }}
      >
        <div className="mx-auto px-4 py-3 flex items-center justify-between">
          {/* Mobile */}
          <div className="flex items-center gap-3 md:hidden flex-1">
            {showBack && (
              <button
                className="h-9 w-9 grid place-items-center rounded-xl border"
                onClick={handleBackClick}
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
              <button
                className="h-9 w-9 grid place-items-center rounded-xl border"
                onClick={() => setOpen(true)}
                style={{ borderColor: palette.silver1 }}
              >
                <Menu size={18} />
              </button>
              <PublicUserDropdown variant="icon" withBg={false} />
            </div>
          </div>

          {/* Desktop */}
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

      {/* Mobile Drawer */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50"
          style={{ background: "#0006" }}
          onClick={() => setOpen(false)}
        >
          <aside
            className="absolute top-0 left-0 w-72 max-w-[75vw] h-full flex flex-col"
            style={{
              background: palette.white1,
              borderRight: `1px solid ${palette.silver1}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header dengan logo sekolah */}
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

            {/* Isi menu */}
            <div className="flex-1 overflow-y-auto">
              <div
                className="px-3 pt-3 pb-2 text-xs"
                style={{ color: palette.silver2 }}
              >
                {formattedGregorian}
              </div>
              <nav className="px-2 pb-4">
                <ul className="space-y-2">
                  {navs.map(({ path, label, icon: Icon, end }) => (
                    <li key={path}>
                      <NavLink
                        to={path}
                        end={!!end} // penting! hanya aktif persis kalau `end` true
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
          </aside>
        </div>
      )}
    </>
  );
}
