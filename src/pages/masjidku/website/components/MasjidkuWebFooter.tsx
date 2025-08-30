import React from "react";
import { NavLink } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Youtube,
  Facebook,
} from "lucide-react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

export default function WebsiteFooter() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const linkCls = "text-sm hover:underline";
  const textMuted = { color: theme.silver2 };

  return (
    <footer className="border-t" style={{ borderColor: theme.white3 }}>
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Brand & mission */}
          <div>
            <div
              className="flex items-center gap-2 font-semibold text-lg"
              style={{ color: theme.black1 }}
            >
              <img
                src="https://images.unsplash.com/photo-1614851099008-94fddf0ae3a5?q=80&w=200&auto=format&fit=crop"
                alt="Logo SekolahIslamku"
                className="h-8 w-8 rounded-lg object-cover"
                loading="lazy"
              />
              SekolahIslamku Suite
            </div>
            <p className="mt-3 text-sm" style={textMuted}>
              Platform manajemen sekolah terpadu—PPDB, akademik, absensi,
              keuangan, dan komunikasi orang tua.
            </p>

            <div className="mt-4 flex items-center gap-3" style={textMuted}>
              <a
                href="#"
                aria-label="Instagram"
                className="p-2 rounded-xl ring-1 transition hover:opacity-80"
                style={{ borderColor: theme.white3 }}
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="p-2 rounded-xl ring-1 transition hover:opacity-80"
                style={{ borderColor: theme.white3 }}
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="p-2 rounded-xl ring-1 transition hover:opacity-80"
                style={{ borderColor: theme.white3 }}
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Produk */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: theme.black1 }}>
              Produk
            </h4>
            <ul className="space-y-2" style={textMuted}>
              <li>
                <NavLink to="/website/fitur" className={linkCls}>
                  PPDB & Penempatan
                </NavLink>
              </li>
              <li>
                <NavLink to="/website/fitur" className={linkCls}>
                  Akademik & Rapor
                </NavLink>
              </li>
              <li>
                <NavLink to="/website/fitur" className={linkCls}>
                  Absensi & Perizinan
                </NavLink>
              </li>
              <li>
                <NavLink to="/website/fitur" className={linkCls}>
                  Keuangan & SPP
                </NavLink>
              </li>
              <li>
                <NavLink to="/website/fitur" className={linkCls}>
                  LMS & E-Learning
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Sumber daya */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: theme.black1 }}>
              Sumber Daya
            </h4>
            <ul className="space-y-2" style={textMuted}>
              <li>
                <a href="/website#demo" className={linkCls}>
                  Jadwalkan Demo
                </a>
              </li>
              <li>
                <NavLink to="/website/dukung-kami" className={linkCls}>
                  Dukung Kami
                </NavLink>
              </li>
              <li>
                <NavLink to="/website/fitur" className={linkCls}>
                  Dokumentasi Singkat
                </NavLink>
              </li>
              <li>
                <NavLink to="/website/tentang" className={linkCls}>
                  Rilis & Perkembangan
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Perusahaan */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: theme.black1 }}>
              Perusahaan
            </h4>
            <ul className="space-y-2" style={textMuted}>
              <li>
                <NavLink to="/website/tentang" className={linkCls}>
                  Tentang
                </NavLink>
              </li>
              <li>
                <NavLink to="/website/fitur" className={linkCls}>
                  Studi Kasus
                </NavLink>
              </li>
              <li>
                <NavLink to="/website/hubungi-kami" className={linkCls}>
                  Hubungi Kami
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: theme.black1 }}>
              Kontak
            </h4>
            <ul className="space-y-2 text-sm" style={textMuted}>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Jl. Pendidikan No. 123, Indonesia
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> +62 812-3456-7890
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> sales@sekolahislamku.id
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-8 border-t pt-4 text-xs flex flex-col md:flex-row items-center justify-between"
          style={{ borderColor: theme.white3, color: theme.silver2 }}
        >
          <div>
            © {new Date().getFullYear()} SekolahIslamku Suite. All rights
            reserved.
          </div>
          <div className="mt-2 md:mt-0 flex gap-4">
            <a href="#" className="hover:underline">
              Kebijakan Privasi
            </a>
            <a href="#" className="hover:underline">
              Syarat & Ketentuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
