// src/pages/public/Contact.tsx
import React from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
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


export default function Contact() {
  return (
    <div className="min-h-screen  dark:bg-gray-900">
      <WebsiteNavbar />
      <div className="h-16" />

      <FullBleed>
        {/* HERO */}
        <section className="relative w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 px-4 sm:px-6 lg:px-8 text-center">
          <Mail className="mx-auto h-12 w-12 mb-4 text-pink-200" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Hubungi Kami</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Ada pertanyaan, masukan, atau ingin bekerja sama? Tim kami siap
            membantu Anda.
          </p>
        </section>

        {/* INFO GRID */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-center">
            <Phone className="h-10 w-10 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Telepon</h3>
            <p className="text-sm opacity-80 mb-4">
              Hubungi tim kami melalui nomor berikut:
            </p>
            <a
              href="tel:+628123456789"
              className="inline-block rounded-full px-4 py-2 text-sm font-medium bg-blue-500 text-white hover:opacity-90 transition"
            >
              +62 812 3456 789
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-center">
            <Mail className="h-10 w-10 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Email</h3>
            <p className="text-sm opacity-80 mb-4">
              Kirimkan pertanyaan atau saran melalui email:
            </p>
            <a
              href="mailto:support@sekolahislamku.id"
              className="inline-block rounded-full px-4 py-2 text-sm font-medium bg-purple-500 text-white hover:opacity-90 transition"
            >
              support@sekolahislamku.id
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-center">
            <MapPin className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Alamat</h3>
            <p className="text-sm opacity-80">
              Jl. Pendidikan No. 123, Jakarta, Indonesia
            </p>
          </div>
        </section>

        {/* FORM KONTAK */}
        <section className="w-full px-4 sm:px-6 lg:px-8 pb-16 max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
            <h3 className="font-semibold text-lg mb-4">Kirim Pesan</h3>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-4 text-sm"
            >
              <input
                type="text"
                placeholder="Nama Anda"
                required
                className="w-full rounded-xl border px-4 py-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="email"
                placeholder="Email Anda"
                required
                className="w-full rounded-xl border px-4 py-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Pesan Anda"
                rows={4}
                required
                className="w-full rounded-xl border px-4 py-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="w-full rounded-full px-5 py-3 font-medium bg-indigo-600 text-white hover:opacity-90 transition"
              >
                Kirim Pesan
              </button>
            </form>
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
