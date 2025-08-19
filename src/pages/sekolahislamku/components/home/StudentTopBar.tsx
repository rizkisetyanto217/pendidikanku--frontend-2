// // import { NavLink, useParams } from "react-router-dom";
// // import {
// //   LayoutDashboard,
// //   ClipboardCheck,
// //   FileSpreadsheet,
// //   Wallet,
// //   CalendarDays,
// //   Bell,
// // } from "lucide-react";
// // import {
// //   SectionCard,
// //   type Palette,
// // } from "@/pages/sekolahislamku/components/ui/Primitives";

// // type Item = {
// //   path: string; // relatif, tidak termasuk slug & "murid"
// //   label: string;
// //   icon: React.ComponentType<any>;
// //   end?: boolean;
// // };

// // const NAVS: Item[] = [
// //   { path: "", label: "Dashboard", icon: LayoutDashboard, end: true }, // root murid
// //   { path: "progress", label: "Progress Anak", icon: ClipboardCheck },
// //   { path: "finance", label: "Pembayaran", icon: Wallet },
// //   { path: "jadwal", label: "Jadwal", icon: CalendarDays },
// //   { path: "pengumuman", label: "Pengumuman", icon: Bell },
// //   {
// //     path: "progress/raport", // konsisten dengan route config
// //     label: "Rapor Nilai",
// //     icon: FileSpreadsheet,
// //   },
// // ];

// // export default function StudentSideBarNav({ palette }: { palette: Palette }) {
// //   const { slug } = useParams(); // ambil slug aktif

// //   return (
// //     <nav
// //       className="
// //         hidden lg:block w-64 shrink-0
// //         lg:sticky lg:top-24 lg:z-30
// //         lg:max-h-[calc(100vh-6rem)] lg:overflow-auto
// //       "
// //       aria-label="Navigasi Samping"
// //     >
// //       <SectionCard
// //         palette={palette}
// //         className="p-2"
// //         style={{ background: palette.white1 }}
// //       >
// //         <ul className="space-y-2">
// //           {NAVS.map(({ path, label, icon: Icon, end }) => {
// //             // semua link otomatis jadi /:slug/murid/...
// //             const to = path ? `/${slug}/murid/${path}` : `/${slug}/murid`;

// //             return (
// //               <li key={to}>
// //                 <NavLink
// //                   to={to}
// //                   end={!!end}
// //                   className="block focus:outline-none"
// //                 >
// //                   {({ isActive }) => (
// //                     <div
// //                       className="flex items-center gap-3 rounded-xl px-3 py-2 border transition-all hover:translate-x-[1px]"
// //                       style={{
// //                         background: palette.white1,
// //                         borderColor: isActive
// //                           ? palette.primary
// //                           : palette.silver1,
// //                         boxShadow: isActive
// //                           ? `0 0 0 1px ${palette.primary} inset`
// //                           : "none",
// //                         color: isActive ? palette.primary : palette.black1,
// //                       }}
// //                     >
// //                       <span
// //                         className="h-7 w-7 grid place-items-center rounded-lg border"
// //                         style={{
// //                           background: isActive
// //                             ? palette.primary2
// //                             : palette.white1,
// //                           borderColor: isActive
// //                             ? palette.primary
// //                             : palette.silver1,
// //                           color: isActive ? palette.primary : palette.silver2,
// //                         }}
// //                       >
// //                         <Icon size={16} />
// //                       </span>
// //                       <span className="truncate">{label}</span>
// //                     </div>
// //                   )}
// //                 </NavLink>
// //               </li>
// //             );
// //           })}
// //         </ul>
// //       </SectionCard>
// //     </nav>
// //   );
// // }

// import { useState, useEffect } from "react";
// import {
//   useLocation,
//   useParams,
//   useMatch,
//   NavLink,
//   Link,
// } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Users,
//   UserCog,
//   BookOpen,
//   CheckSquare,
//   Wallet,
//   Megaphone,
//   ClipboardCheck,
//   FileSpreadsheet,
//   CalendarDays,
//   GraduationCap,
//   Menu,
//   X,
//   Bell,
// } from "lucide-react";
// import PublicUserDropdown from "@/components/common/public/UserDropDown";
// import type { Palette } from "@/pages/sekolahislamku/components/ui/Primitives";

// interface ParentTopBarProps {
//   palette: Palette;
//   hijriDate?: string;
//   gregorianDate?: string;
//   dateFmt?: (iso: string) => string;
//   title?: React.ReactNode;
// }

// type NavItem = {
//   path: string;
//   label: string;
//   icon: React.ComponentType<any>;
//   end?: boolean;
// };

// const STUDENT_NAVS: NavItem[] = [
//   { path: ".", label: "Dashboard", icon: LayoutDashboard, end: true },
//   { path: "progress", label: "Progress Anak", icon: ClipboardCheck },
//   { path: "finance", label: "Pembayaran", icon: Wallet },
//   { path: "jadwal", label: "Jadwal", icon: CalendarDays },
//   { path: "pengumuman", label: "Pengumuman", icon: Megaphone },
//   { path: "rapor", label: "Rapor Nilai", icon: FileSpreadsheet },
// ];

// const SCHOOL_NAVS: NavItem[] = [
//   { path: ".", label: "Dashboard", icon: LayoutDashboard, end: true },
//   { path: "murid", label: "Siswa", icon: Users },
//   { path: "guru", label: "Guru", icon: UserCog },
//   { path: "kelas", label: "Kelas", icon: BookOpen },
//   { path: "kehadiran", label: "Absensi", icon: CheckSquare },
//   { path: "keuangan", label: "Keuangan", icon: Wallet },
//   { path: "pengumuman", label: "Pengumuman", icon: Megaphone },
// ];

// export default function ParentTopBar({
//   palette,
//   hijriDate,
//   gregorianDate,
//   dateFmt,
//   title,
// }: ParentTopBarProps) {
//   const [open, setOpen] = useState(false);
//   const { pathname } = useLocation();

//   // Ambil slug dari params; kalau undefined (komponen tidak berada langsung di route yg declare :slug),
//   // fallback dari URL via useMatch("/:slug/*")
//   const params = useParams<{ slug?: string }>();
//   const match = useMatch("/:slug/*");
//   const slug = params.slug ?? match?.params.slug;

//   // helper prefix slug untuk path absolut
//   const withSlug = (to: string) => {
//     const abs = to.startsWith("/") ? to : `/${to}`;
//     return slug ? `/${slug}${abs}` : abs;
//   };

//   // deteksi konteks halaman sekolah vs murid
//   const isSchoolPage = pathname.includes("/sekolah");

//   // base path (sluggable)
//   const baseSchool = slug ? `/${slug}/sekolah` : "/sekolah";
//   const baseStudent = slug ? `/${slug}/murid` : "/murid";

//   // daftar nav final — setiap item sudah absolute & ber-slug ketika slug tersedia
//   const navs = (isSchoolPage ? SCHOOL_NAVS : STUDENT_NAVS).map(
//     ({ path, label, icon, end }) => {
//       const base = isSchoolPage ? baseSchool : baseStudent;
//       const to = path === "." ? base : `${base}/${path}`;
//       return { to, label, icon, end };
//     }
//   );

//   // kunci scroll saat drawer buka (mobile)
//   useEffect(() => {
//     if (!open) return;
//     const original = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = original;
//     };
//   }, [open]);

//   const brandName = title ?? "SekolahIslamku";

//   return (
//     <>
//       {/* Top Bar */}
//       <div
//         className="sticky top-0 z-40 backdrop-blur border-b"
//         style={{
//           background: `${palette.white1}E6`,
//           borderColor: palette.silver1,
//         }}
//       >
//         <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
//           {/* kiri */}
//           <div className="flex items-center gap-2">
//             <button
//               className="md:hidden -ml-1 mr-1 grid place-items-center h-9 w-9 rounded-xl"
//               onClick={() => setOpen(true)}
//               aria-label="Buka menu"
//               style={{ border: `1px solid ${palette.silver1}` }}
//             >
//               <Menu size={18} />
//             </button>

//             <div className="flex items-center gap-2">
//               {!title && <GraduationCap size={22} color={palette.black1} />}
//               <div className="leading-tight">
//                 <div className="font-semibold">
//                   {/* brand klik ke root sesuai konteks */}
//                   <Link to={isSchoolPage ? baseSchool : baseStudent}>
//                     {brandName}
//                   </Link>
//                 </div>
//                 <div
//                   className="hidden sm:block text-xs"
//                   style={{ color: palette.silver2 }}
//                 >
//                   {gregorianDate && dateFmt ? dateFmt(gregorianDate) : ""}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* kanan (desktop) */}
//           <div
//             className="hidden md:flex items-center gap-3"
//             style={{ fontSize: 14, color: palette.silver2 }}
//           >
//             <CalendarDays size={16} />
//             <span className="hidden sm:inline">
//               {gregorianDate && dateFmt ? dateFmt(gregorianDate) : ""}
//             </span>
//             {hijriDate && (
//               <span
//                 className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
//                 style={{ background: palette.secondary, color: palette.white1 }}
//               >
//                 {hijriDate}
//               </span>
//             )}

//             {/* Notifikasi ikut slug */}
//             <Link to={withSlug("/notifikasi")}>
//               <button
//                 className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-sm rounded-2xl font-medium"
//                 style={{
//                   background: "transparent",
//                   color: palette.black1,
//                   border: `1px solid ${palette.silver1}`,
//                 }}
//               >
//                 <Bell className="mr-2" size={16} /> Notifikasi
//               </button>
//             </Link>

//             <PublicUserDropdown variant="icon" withBg={false} />
//           </div>

//           {/* kanan (mobile) */}
//           <div className="md:hidden">
//             <PublicUserDropdown variant="icon" withBg={false} />
//           </div>
//         </div>
//       </div>

//       {/* Mobile Drawer */}
//       {open && (
//         <div className="md:hidden" style={{ pointerEvents: "auto" }}>
//           {/* overlay */}
//           <div
//             className="fixed inset-0 z-50 transition-opacity opacity-100"
//             onClick={() => setOpen(false)}
//             style={{ background: "#0006" }}
//           />
//           {/* panel */}
//           <aside
//             className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform translate-x-0 transition-transform"
//             style={{
//               background: palette.white1,
//               borderRight: `1px solid ${palette.silver1}`,
//             }}
//             role="dialog"
//             aria-label="Menu navigasi"
//           >
//             {/* header panel */}
//             <div
//               className="flex items-center justify-between px-3 py-3 border-b"
//               style={{ borderColor: palette.silver1 }}
//             >
//               <div className="flex items-center gap-2">
//                 {!title && <GraduationCap size={20} color={palette.primary} />}
//                 <span className="font-semibold">{brandName}</span>
//               </div>
//               <button
//                 aria-label="Tutup menu"
//                 onClick={() => setOpen(false)}
//                 className="h-9 w-9 grid place-items-center rounded-xl"
//                 style={{ border: `1px solid ${palette.silver1}` }}
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             {/* tanggal */}
//             <div
//               className="px-3 pt-3 pb-2 text-xs"
//               style={{ color: palette.silver2 }}
//             >
//               {gregorianDate && dateFmt ? dateFmt(gregorianDate) : ""}
//               {hijriDate && (
//                 <span
//                   className="ml-2 inline-flex items-center rounded-full px-2 py-0.5"
//                   style={{
//                     background: palette.secondary,
//                     color: palette.white1,
//                   }}
//                 >
//                   {hijriDate}
//                 </span>
//               )}
//             </div>

//             {/* nav list (sudah absolute & sluggable) */}
//             <nav className="px-2 pb-4" aria-label="Navigasi">
//               <ul className="space-y-2">
//                 {navs.map(({ to, label, icon: Icon, end }) => (
//                   <li key={to}>
//                     <NavLink
//                       to={to}
//                       end={!!end}
//                       onClick={() => setOpen(false)}
//                       className="block focus:outline-none"
//                     >
//                       {({ isActive }) => (
//                         <div
//                           className="flex items-center gap-3 rounded-xl px-3 py-2 border transition-all"
//                           style={{
//                             background: isActive
//                               ? palette.primary2
//                               : palette.white1,
//                             borderColor: isActive
//                               ? palette.primary
//                               : palette.silver1,
//                             boxShadow: isActive
//                               ? `0 0 0 1px ${palette.primary} inset`
//                               : "none",
//                             color: isActive ? palette.primary : palette.black1,
//                           }}
//                         >
//                           <span
//                             className="h-7 w-7 grid place-items-center rounded-lg border"
//                             style={{
//                               background: isActive
//                                 ? palette.primary2
//                                 : palette.white1,
//                               borderColor: isActive
//                                 ? palette.primary
//                                 : palette.silver1,
//                               color: isActive
//                                 ? palette.primary
//                                 : palette.silver2,
//                             }}
//                           >
//                             <Icon size={16} />
//                           </span>
//                           <span className="truncate">{label}</span>
//                         </div>
//                       )}
//                     </NavLink>
//                   </li>
//                 ))}
//               </ul>

//               {/* shortcut notifikasi (ber-slug juga) */}
//               {/* <div className="mt-3 px-1">
//                 <Link
//                   to={withSlug("/notifikasi")}
//                   onClick={() => setOpen(false)}
//                 >
//                   <div
//                     className="flex items-center gap-3 rounded-xl px-3 py-2 border"
//                     style={{
//                       background: palette.white1,
//                       borderColor: palette.silver1,
//                       color: palette.black1,
//                     }}
//                   >
//                     <span
//                       className="h-7 w-7 grid place-items-center rounded-lg border"
//                       style={{
//                         background: palette.white1,
//                         borderColor: palette.silver1,
//                         color: palette.silver2,
//                       }}
//                     >
//                       <Bell size={16} />
//                     </span>
//                     <span className="truncate">Notifikasi</span>
//                   </div>
//                 </Link>
//               </div> */}
//             </nav>
//           </aside>
//         </div>
//       )}
//     </>
//   );
// }

import { useState, useEffect, type ComponentType, type ReactNode } from "react";
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

interface ParentTopBarProps {
  palette: Palette;
  hijriDate?: string;
  parentName?: string;
  gregorianDate?: string;
  dateFmt?: (iso: string) => string;
  title?: ReactNode;
}

type NavItem = {
  path: string;
  label: string;
  icon: ComponentType<any>;
  end?: boolean;
};

const STUDENT_NAVS: NavItem[] = [
  { path: ".", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "progress", label: "Progress Anak", icon: ClipboardCheck },
  { path: "finance", label: "Pembayaran", icon: Wallet },
  { path: "jadwal", label: "Jadwal", icon: CalendarDays },
  { path: "pengumuman", label: "Pengumuman", icon: Megaphone },
  { path: "rapor", label: "Rapor Nilai", icon: FileSpreadsheet },
];

const SCHOOL_NAVS: NavItem[] = [
  { path: ".", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "murid", label: "Siswa", icon: Users },
  { path: "guru", label: "Guru", icon: UserCog },
  { path: "kelas", label: "Kelas", icon: BookOpen },
  { path: "kehadiran", label: "Absensi", icon: CheckSquare },
  { path: "keuangan", label: "Keuangan", icon: Wallet },
  { path: "pengumuman", label: "Pengumuman", icon: Megaphone },
];

export default function ParentTopBar({
  palette,
  hijriDate,
  gregorianDate,
  dateFmt,
  title,
}: ParentTopBarProps) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Ambil slug dari params; fallback via useMatch("/:slug/*")
  const params = useParams<{ slug?: string }>();
  const match = useMatch("/:slug/*");
  const slug = params.slug ?? match?.params.slug;

  // helper prefix slug untuk path absolut
  const withSlug = (to: string) => {
    const abs = to.startsWith("/") ? to : `/${to}`;
    return slug ? `/${slug}${abs}` : abs;
  };

  // deteksi konteks halaman sekolah vs murid
  const isSchoolPage = pathname.includes("/sekolah");

  // base path (sluggable)
  const baseSchool = slug ? `/${slug}/sekolah` : "/sekolah";
  const baseStudent = slug ? `/${slug}/murid` : "/murid";

  // daftar nav final — setiap item sudah absolute & ber-slug ketika slug tersedia
  const navs = (isSchoolPage ? SCHOOL_NAVS : STUDENT_NAVS).map(
    ({ path, label, icon, end }) => {
      const base = isSchoolPage ? baseSchool : baseStudent;
      const to = path === "." ? base : `${base}/${path}`;
      return { to, label, icon, end };
    }
  );

  // kunci scroll saat drawer buka (mobile)
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const brandName = title ?? "SekolahIslamku";

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
          {/* kiri */}
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
              {!title && <GraduationCap size={22} color={palette.black1} />}
              <div className="leading-tight">
                <div className="font-semibold">
                  {/* brand klik ke root sesuai konteks */}
                  <Link to={isSchoolPage ? baseSchool : baseStudent}>
                    {brandName}
                  </Link>
                </div>
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
            {hijriDate && (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ background: palette.secondary, color: palette.white1 }}
              >
                {hijriDate}
              </span>
            )}

            {/* Notifikasi ikut slug */}
            <Link to={withSlug("/notifikasi")}>
              <button
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-sm rounded-2xl font-medium"
                style={{
                  background: "transparent",
                  color: palette.black1,
                  border: `1px solid ${palette.silver1}`,
                }}
              >
                <Bell className="mr-2" size={16} /> Notifikasi
              </button>
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
      {open && (
        <div className="md:hidden" style={{ pointerEvents: "auto" }}>
          {/* overlay */}
          <div
            className="fixed inset-0 z-50 transition-opacity opacity-100"
            onClick={() => setOpen(false)}
            style={{ background: "#0006" }}
          />
          {/* panel */}
          <aside
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform translate-x-0 transition-transform"
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
                {!title && <GraduationCap size={20} color={palette.primary} />}
                <span className="font-semibold">{brandName}</span>
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

            {/* tanggal */}
            <div
              className="px-3 pt-3 pb-2 text-xs"
              style={{ color: palette.silver2 }}
            >
              {gregorianDate && dateFmt ? dateFmt(gregorianDate) : ""}
              {hijriDate && (
                <span
                  className="ml-2 inline-flex items-center rounded-full px-2 py-0.5"
                  style={{
                    background: palette.secondary,
                    color: palette.white1,
                  }}
                >
                  {hijriDate}
                </span>
              )}
            </div>

            {/* nav list (sudah absolute & sluggable) */}
            <nav className="px-2 pb-4" aria-label="Navigasi">
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
                ))}
              </ul>

            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
