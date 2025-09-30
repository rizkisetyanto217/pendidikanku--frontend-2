// src/pages/website/PrivacyPolicy.tsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import WebsiteFooter from "../website/components/MasjidkuWebFooter";
import WebsiteNavbar from "@/components/common/public/WebsiteNavbar";

/* ====== Utilities layout (samain feel dengan Home) ====== */
const FullBleed: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => (
  <div
    className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen ${className}`}
  >
    {children}
  </div>
);

const Section: React.FC<{
  id?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ id, className = "", children }) => (
  <section id={id} className={`px-4 sm:px-6 lg:px-8 ${className}`}>
    <div className="w-full">{children}</div>
  </section>
);

type SectionItem = { id: string; title: string; content: React.ReactNode };

export default function MasjidWebPrivacyPolicy() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const bgGradient = isDark
    ? `linear-gradient(180deg, ${theme.white1} 0%, ${theme.white2} 100%)`
    : `linear-gradient(180deg, ${theme.white2} 0%, ${theme.white1} 100%)`;

  const updatedAt = useMemo(
    () =>
      new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    []
  );

  const sections: SectionItem[] = [
    {
      id: "informasi-yang-kami-kumpulkan",
      title: "1. Informasi yang Kami Kumpulkan",
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Informasi Pribadi</strong>: nama, email, nomor telepon,
            institusi.
          </li>
          <li>
            <strong>Informasi Akun</strong>: username, kata sandi (terenkripsi).
          </li>
          <li>
            <strong>Data Aktivitas</strong>: catatan login, aktivitas belajar,
            progres akademik.
          </li>
          <li>
            <strong>Data Teknis</strong>: IP, perangkat, browser, cookies, log
            server.
          </li>
          <li>
            <strong>Data Pembayaran</strong> (jika ada): metode & status
            transaksi (tanpa menyimpan detail kartu).
          </li>
        </ul>
      ),
    },
    {
      id: "penggunaan-informasi",
      title: "2. Penggunaan Informasi",
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Menyediakan, mengelola, dan meningkatkan layanan SekolahIslamku.
          </li>
          <li>Autentikasi dan manajemen akun.</li>
          <li>Dukungan pelanggan dan notifikasi terkait layanan.</li>
          <li>Analitik untuk peningkatan pengalaman pengguna.</li>
          <li>Memenuhi kewajiban hukum yang berlaku.</li>
        </ul>
      ),
    },
    {
      id: "penyimpanan-dan-keamanan",
      title: "3. Penyimpanan dan Keamanan Data",
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Penyimpanan pada infrastruktur tepercaya, akses dibatasi berdasarkan
            otorisasi.
          </li>
          <li>Penggunaan enkripsi dan praktik keamanan yang wajar.</li>
          <li>Perlu diingat, transmisi internet tidak pernah 100% aman.</li>
        </ul>
      ),
    },
    {
      id: "berbagi-dengan-pihak-ketiga",
      title: "4. Berbagi Informasi dengan Pihak Ketiga",
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Tidak menjual/menyewakan</strong> data pribadi.
          </li>
          <li>
            Penyedia layanan (hosting, pembayaran, analitik) untuk operasional.
          </li>
          <li>Otoritas hukum jika diwajibkan peraturan.</li>
        </ul>
      ),
    },
    {
      id: "hak-anda",
      title: "5. Hak Anda",
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Mengakses, memperbarui, atau menghapus data pribadi.</li>
          <li>Menolak/membatasi pemrosesan tertentu.</li>
          <li>Menarik persetujuan (sebagian layanan mungkin terbatas).</li>
          <li>Hubungi kami untuk menjalankan hak-hak ini.</li>
        </ul>
      ),
    },
    {
      id: "cookies",
      title: "6. Cookies",
      content: (
        <p>
          Kami menggunakan cookies untuk mengingat preferensi dan menganalisis
          penggunaan. Anda dapat menonaktifkan cookies di pengaturan browser;
          beberapa fitur mungkin tidak berfungsi optimal.
        </p>
      ),
    },
    {
      id: "perubahan-kebijakan",
      title: "7. Perubahan Kebijakan Privasi",
      content: (
        <p>
          Kami dapat memperbarui kebijakan ini sewaktu-waktu. Perubahan akan
          dipublikasikan pada halaman ini dengan tanggal “Terakhir diperbarui”.
        </p>
      ),
    },
    {
      id: "kontak",
      title: "8. Kontak Kami",
      content: (
        <div className="space-y-1">
          <p>Jika ada pertanyaan/permintaan terkait privasi:</p>
          <p>
            📧{" "}
            <a
              href="mailto:support@sekolahislamku.id"
              style={{ color: theme.primary }}
            >
              support@sekolahislamku.id
            </a>
          </p>
          <p>
            🌐{" "}
            <a
              href="https://www.sekolahislamku.id"
              target="_blank"
              rel="noreferrer"
              style={{ color: theme.primary }}
            >
              www.sekolahislamku.id
            </a>
          </p>
        </div>
      ),
    },
  ];

  return (
    <FullBleed>
      <div
        className="min-h-screen overflow-x-hidden w-screen"
        style={{ background: bgGradient, color: theme.black1 }}
      >
        {/* NAVBAR + spacer biar konten ga ketutup */}
        <WebsiteNavbar />
        <div style={{ height: "5.5rem" }} />

        {/* WRAPPER KONTEN */}
        <Section className="py-12 md:py-16">
          <div
            className="mx-auto max-w-4xl rounded-3xl p-6 sm:p-8 shadow-sm border"
            style={{ backgroundColor: theme.white2, borderColor: theme.white3 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1
                  className="text-3xl md:text-4xl font-bold"
                  style={{ color: theme.black1 }}
                >
                  Kebijakan Privasi
                </h1>
                <p className="mt-1 text-sm" style={{ color: theme.silver2 }}>
                  Terakhir diperbarui: {updatedAt}
                </p>
              </div>
              <Link
                to="/website"
                className="text-sm underline"
                style={{ color: theme.primary }}
              >
                Kembali ke Beranda
              </Link>
            </div>

            {/* TOC */}
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-sm"
                  style={{ color: theme.primary }}
                >
                  {s.title}
                </a>
              ))}
            </div>

            {/* CONTENT */}
            <div className="mt-8 space-y-8">
              <p style={{ color: theme.black1 }}>
                SekolahIslamku (“kami”) berkomitmen melindungi dan menghormati
                privasi Anda. Kebijakan ini menjelaskan cara kami mengumpulkan,
                menggunakan, menyimpan, serta melindungi informasi pribadi saat
                Anda menggunakan layanan kami (web maupun aplikasi).
              </p>

              {sections.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: theme.black1 }}
                  >
                    {s.title}
                  </h2>
                  <div
                    className="mt-2 text-sm leading-6"
                    style={{ color: theme.black1 }}
                  >
                    {s.content}
                  </div>
                </section>
              ))}

              <p className="text-xs" style={{ color: theme.silver2 }}>
                Dengan menggunakan layanan kami, Anda menyatakan telah membaca
                dan memahami Kebijakan Privasi ini.
              </p>
            </div>
          </div>
        </Section>

        {/* FOOTER */}
        <WebsiteFooter />
      </div>
    </FullBleed>
  );
}
