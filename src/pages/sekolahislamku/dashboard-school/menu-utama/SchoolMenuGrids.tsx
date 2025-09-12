// src/pages/sekolahislamku/school/SchoolMenuGrids.tsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

import {
  SectionCard,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

import type { LucideIcon } from "lucide-react";
import {
  Home,
  CalendarDays,
  Building2,
  Layers,
  CheckCircle2,
  CreditCard,
  Banknote,
  UserCog,
  Users,
  IdCard,
  Globe,
  BookOpen,
  LibraryBig,
  Bell,
  Award,
  CalendarRange,
  BarChart2,
  Settings,
} from "lucide-react";

/* ============== Helpers ============== */
const toLocalNoonISO = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x.toISOString();
};
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";


type MenuItem = {
  key: string;
  label: string;
  to?: string; // rute internal (opsional)
  onClick?: () => void; // aksi alternatif (opsional)
  icon: LucideIcon; // ikon sebagai komponen, bukan node
  note?: string; // teks kecil
};

/* ============== Page ============== */
export default function SchoolMenuGrids() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const topbarISO = toLocalNoonISO(new Date());

  // Susun item menu di sini. Ubah "to" sesuai rute di apps-mu.
  const items: MenuItem[] = useMemo(
    () => [
      { key: "beranda", label: "Beranda", to: "sekolah", icon: Home },

      {
        key: "periode",
        label: "Periode Akademik",
        to: "academic",
        icon: CalendarDays,
      },
      {
        key: "ruangan",
        label: "Ruangan",
        to: "room-school",
        icon: Building2,
      },
      { key: "kelas-all", label: "Seluruh Kelas", to: "kelas", icon: Layers },
      {
        key: "kelas-aktif",
        label: "Kelas Aktif",
        to: "kelas-aktif",
        icon: CheckCircle2,
      },

      { key: "keuangan", label: "Keuangan", to: "keuangan", icon: CreditCard },
      { key: "spp", label: "SPP", to: "spp", icon: Banknote },

      { key: "guru", label: "Guru", to: "guru", icon: UserCog },
      {
        key: "murid",
        label: "Murid",
        to: "murid",
        icon: Users,
        note: "Cari Murid",
      },

      {
        key: "profil",
        label: "Profil",
        to: "profil-sekolah",
        icon: IdCard,
      },
      { key: "website", label: "Website", to: "/website", icon: Globe },

      { key: "buku", label: "Buku", to: "buku", icon: BookOpen },
      {
        key: "pelajaran",
        label: "Pelajaran",
        to: "pelajaran",
        icon: LibraryBig,
      },
      { key: "pengumuman", label: "Pengumuman", to: "all-announcement", icon: Bell },
      {
        key: "sertifikat",
        label: "Sertifikat",
        to: "sertifikat",
        icon: Award,
      },

      {
        key: "kalender",
        label: "Kalender Akademik",
        to: "kalender",
        icon: CalendarRange,
      },
      {
        key: "statistik",
        label: "Statistik",
        to: "statistik",
        icon: BarChart2,
      },
      {
        key: "pengaturan",
        label: "Pengaturan",
        to: "pengaturan",
        icon: Settings,
      },
    ],
    []
  );

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Menu Sekolah"
        gregorianDate={topbarISO}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main */}
          <section className="lg:col-span-9 space-y-6 min-w-0">
            <SectionCard palette={palette} className="p-4 md:p-5">
              <div className="mb-4 font-semibold text-base">Akses Cepat</div>

              {/* Grid menu */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {items.map((it) => (
                  <MenuTile key={it.key} item={it} palette={palette} />
                ))}
              </div>
            </SectionCard>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ============== Tile ============== */
function MenuTile({ item, palette }: { item: MenuItem; palette: Palette }) {
  const Icon = item.icon;

  const content = (
    <div
      className="h-full w-full rounded-2xl border p-3 md:p-4 flex flex-col items-center justify-center text-center gap-2 transition-transform"
      style={{
        borderColor: palette.silver1,
        background: palette.white1,
      }}
    >
      <span
        className="h-12 w-12 md:h-14 md:w-14 grid place-items-center rounded-xl"
        style={{
          background: palette.primary2,
          color: palette.primary,
        }}
        aria-hidden
      >
        <Icon size={22} />
      </span>
      <div className="text-xs md:text-sm font-medium leading-tight line-clamp-2">
        {item.label}
      </div>
      {item.note && (
        <div
          className="text-[11px] md:text-xs"
          style={{ color: palette.silver2 }}
        >
          {item.note}
        </div>
      )}
    </div>
  );

  // Prioritaskan Link jika ada rute; kalau tidak, pakai button (aksi custom)
  return item.to ? (
    <Link
      to={item.to}
      className="block hover:scale-[1.02] active:scale-[0.99] focus:outline-none"
      style={{ transition: "transform 160ms ease" }}
    >
      {content}
    </Link>
  ) : (
    <button
      type="button"
      onClick={item.onClick}
      className="block w-full hover:scale-[1.02] active:scale-[0.99] focus:outline-none"
      style={{ transition: "transform 160ms ease" }}
    >
      {content}
    </button>
  );
}
