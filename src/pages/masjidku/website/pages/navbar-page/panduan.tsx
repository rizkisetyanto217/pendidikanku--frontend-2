import React from "react";
import {
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
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

export default function Panduan() {
  return (
    <div className="min-h-screen  dark:bg-gray-900">
      <WebsiteNavbar />
      <div className="h-16" />

      {/* HERO */}
      <FullBleed>
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 mb-4 text-yellow-300" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Panduan SekolahIslamKu
          </h1>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            Temukan panduan penggunaan, dokumentasi, dan tutorial agar Anda
            lebih cepat memahami fitur-fitur SekolahIslamKu.
          </p>
        </section>
      </FullBleed>

      {/* 3 KARTU PANDUAN */}
      <FullBleed>
        <section className="w-full px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 text-center">
            <FileText className="h-10 w-10 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">Mulai Cepat</h3>
            <p className="text-sm opacity-80 mt-1 mb-4">
              Ikuti panduan langkah-langkah awal untuk setup akun sekolah Anda.
            </p>
            <a
              href="/docs/quickstart"
              className="inline-block rounded-full px-4 py-2 text-sm font-medium bg-blue-500 text-white hover:opacity-90 transition"
            >
              Baca Panduan
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 text-center">
            <BookOpen className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">Dokumentasi</h3>
            <p className="text-sm opacity-80 mt-1 mb-4">
              Dokumentasi lengkap untuk semua modul akademik, keuangan, dan
              administrasi.
            </p>
            <a
              href="/docs"
              className="inline-block rounded-full px-4 py-2 text-sm font-medium bg-green-500 text-white hover:opacity-90 transition"
            >
              Lihat Dokumentasi
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 text-center">
            <Video className="h-10 w-10 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">Video Tutorial</h3>
            <p className="text-sm opacity-80 mt-1 mb-4">
              Belajar lebih cepat melalui video tutorial interaktif yang kami
              sediakan.
            </p>
            <a
              href="/website/tutorial"
              className="inline-block rounded-full px-4 py-2 text-sm font-medium bg-purple-500 text-white hover:opacity-90 transition"
            >
              Tonton Video
            </a>
          </div>
        </section>
      </FullBleed>

      {/* FAQ */}
      <FullBleed>
        <section className="w-full px-4 sm:px-6 lg:px-8 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-lg mb-3">Pertanyaan Umum</h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-medium inline-flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" /> Bagaimana cara login?
                </div>
                <p className="opacity-80 mt-1">
                  Gunakan akun yang diberikan sekolah Anda. Jika lupa password,
                  gunakan fitur reset password.
                </p>
              </div>
              <div>
                <div className="font-medium inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Apakah data saya aman?
                </div>
                <p className="opacity-80 mt-1">
                  Ya, kami menggunakan enkripsi dan backup harian untuk menjaga
                  keamanan data sekolah.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-lg mb-3">Tips Penggunaan</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm opacity-90">
              <li>Selalu perbarui data siswa dan guru secara berkala.</li>
              <li>Gunakan fitur ekspor untuk menyimpan laporan penting.</li>
              <li>Aktifkan notifikasi untuk update akademik dan keuangan.</li>
            </ul>
          </div>
        </section>
      </FullBleed>

      {/* FOOTER STRIP */}
      <FullBleed>
        <footer className="w-full bg-white dark:bg-gray-800 border-t border-black/5">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm opacity-80 text-center md:text-left">
              Masih butuh bantuan? Kunjungi halaman dokumentasi lengkap kami.
            </p>
            <a
              href="/docs"
              className="rounded-full px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:opacity-90 transition"
            >
              Dokumentasi Lengkap
            </a>
          </div>
        </footer>
      </FullBleed>
    </div>
  );
}
