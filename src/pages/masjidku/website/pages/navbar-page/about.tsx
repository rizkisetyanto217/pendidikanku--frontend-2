// src/pages/public/About.tsx
import React from "react";
import { Users, BookOpen, Award, Heart } from "lucide-react";
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


export default function About() {
  return (
    <div className="min-h-screen  dark:bg-gray-900">
      <WebsiteNavbar />
      <div className="h-16" />

      <FullBleed>
        {/* HERO */}
        <section className="relative w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-20 px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="mx-auto h-12 w-12 mb-4 text-pink-200" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Tentang SekolahIslamku
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Kami hadir untuk mendukung sekolah Islam agar lebih efisien,
            transparan, dan mudah dalam mengelola akademik, keuangan, dan
            komunikasi.
          </p>
        </section>

        {/* VISI & MISI */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
            <h3 className="font-semibold text-lg mb-3">Visi</h3>
            <p className="text-sm opacity-80">
              Menjadi platform pendidikan Islam digital yang terpercaya untuk
              mendukung sekolah, guru, siswa, dan orang tua dalam menciptakan
              ekosistem pembelajaran yang modern namun tetap islami.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
            <h3 className="font-semibold text-lg mb-3">Misi</h3>
            <ul className="text-sm opacity-80 list-disc pl-5 space-y-2">
              <li>Memberikan layanan administrasi sekolah yang efisien.</li>
              <li>
                Meningkatkan keterlibatan orang tua dalam pendidikan anak.
              </li>
              <li>Mendukung guru dalam pengelolaan kelas & kurikulum.</li>
              <li>Transparansi dalam keuangan & komunikasi sekolah.</li>
            </ul>
          </div>
        </section>

        {/* NILAI & KEUNGGULAN */}
        <section className="w-full px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-center font-bold text-2xl md:text-3xl mb-8">
            Nilai & Keunggulan Kami
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-center">
              <Users className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
              <h4 className="font-semibold text-lg mb-2">Kolaboratif</h4>
              <p className="text-sm opacity-80">
                Memudahkan komunikasi guru, siswa, dan orang tua dalam satu
                platform.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-center">
              <BookOpen className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
              <h4 className="font-semibold text-lg mb-2">Inovatif</h4>
              <p className="text-sm opacity-80">
                Modul akademik, keuangan, absensi, dan perpustakaan dalam satu
                sistem.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-center">
              <Award className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
              <h4 className="font-semibold text-lg mb-2">Terpercaya</h4>
              <p className="text-sm opacity-80">
                Keamanan data dijaga dengan enkripsi & kontrol akses yang ketat.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="w-full bg-white dark:bg-gray-800 border-t border-black/5">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 text-center text-sm opacity-80">
            © {new Date().getFullYear()} SekolahIslamku. Semua Hak Dilindungi.
          </div>
        </footer>
      </FullBleed>
    </div>
  );
}
