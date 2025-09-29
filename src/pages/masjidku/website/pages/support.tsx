// src/pages/public/SupportPage.tsx
import React from "react";
import {
  Heart,
  Phone,
  Mail,
  Banknote,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import WebsiteNavbar from "@/components/common/public/WebsiteNavbar";

const FullBleed: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen ${className}`}
  >
    {children}
  </div>
);

export default function SupportPage() {
  return (
    <div className="min-h-screen dark:bg-gray-900">
      <WebsiteNavbar />
      <div className="h-16" />

      {/* ====== HERO FULL WIDTH ====== */}
      <FullBleed>
        {/* ====== HERO ====== */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="mx-auto h-12 w-12 mb-4 text-pink-300" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Dukung SekolahIslamKu
          </h1>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            Kontribusi Anda membantu kami terus menghadirkan layanan pendidikan
            Islam yang lebih baik bagi semua santri, orang tua, dan guru.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <NavLink
              to="/website/daftar-sekarang"
              className="rounded-full px-5 py-2.5 text-sm font-semibold bg-white text-blue-700 hover:opacity-90 transition"
            >
              Bergabung Sekarang
            </NavLink>
            <a
              href="#cara-dukung"
              className="rounded-full px-5 py-2.5 text-sm font-semibold bg-white/10 text-white hover:bg-white/15 transition"
            >
              Cara Mendukung
            </a>
          </div>
        </section>
      </FullBleed>

      {/* ====== 3 KARTU DUKUNGAN ====== */}
      <FullBleed>
        <section
          id="cara-dukung"
          className="w-full px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center">
            <Banknote className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">Donasi</h3>
            <p className="text-sm opacity-80 mt-1 mb-4">
              Dukung operasional dan pengembangan fitur lewat donasi.
            </p>
            <NavLink
              to="/website/donasi"
              className="inline-block rounded-full px-4 py-2 text-sm font-medium bg-green-500 text-white hover:opacity-90 transition"
            >
              Donasi Sekarang
            </NavLink>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center">
            <Phone className="h-10 w-10 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">Hubungi Kami</h3>
            <p className="text-sm opacity-80 mt-1 mb-4">
              Butuh panduan atau proposal? Tim kami siap membantu.
            </p>
            <a
              href="tel:+628123456789"
              className="inline-block rounded-full px-4 py-2 text-sm font-medium bg-blue-500 text-white hover:opacity-90 transition"
            >
              Telepon
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center">
            <Mail className="h-10 w-10 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">Email</h3>
            <p className="text-sm opacity-80 mt-1 mb-4">
              Kirim pertanyaan, saran, atau kolaborasi ke email resmi kami.
            </p>
            <a
              href="mailto:support@sekolahislamku.id"
              className="inline-block rounded-full px-4 py-2 text-sm font-medium bg-purple-500 text-white hover:opacity-90 transition"
            >
              Kirim Email
            </a>
          </div>
        </section>
      </FullBleed>

      <FullBleed>
        {/* ====== DETAIL & FAQ ====== */}
        <section className="w-full px-4 sm:px-6 lg:px-8 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
            <h3 className="font-semibold text-lg mb-3">Detail Donasi</h3>
            <ul className="text-sm space-y-2">
              <li>
                <span className="opacity-70">Bank:</span>{" "}
                <span className="font-medium">BSI</span>
              </li>
              <li>
                <span className="opacity-70">No. Rekening:</span>{" "}
                <span className="font-medium">1234 5678 9012</span>
              </li>
              <li>
                <span className="opacity-70">Atas Nama:</span>{" "}
                <span className="font-medium">Yayasan SekolahIslamKu</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
            <h3 className="font-semibold text-lg mb-3">Pertanyaan Umum</h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-medium inline-flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" /> Apakah donasi transparan?
                </div>
                <p className="opacity-80 mt-1">
                  Ya, laporan ringkas penggunaan donasi akan dipublikasikan.
                </p>
              </div>
              <div>
                <div className="font-medium inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Apakah ada bukti donasi?
                </div>
                <p className="opacity-80 mt-1">
                  Ada. Anda akan menerima konfirmasi via email setelah
                  verifikasi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER STRIP */}
        <footer className="w-full bg-white dark:bg-gray-800 border-t border-black/5">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm opacity-80 text-center md:text-left">
              Butuh bantuan cepat? Hubungi kami lewat telepon atau email.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="tel:+628123456789"
                className="rounded-full px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:opacity-90 transition"
              >
                Telepon
              </a>
              <a
                href="mailto:support@sekolahislamku.id"
                className="rounded-full px-4 py-2 text-sm font-medium bg-purple-600 text-white hover:opacity-90 transition"
              >
                Email
              </a>
            </div>
          </div>
        </footer>
      </FullBleed>
    </div>
  );
}
