// src/pages/DukungKami.tsx
import React, { useMemo } from "react";
import {
  Heart,
  Handshake,
  Users,
  School,
  BookOpen,
  Database,
  CreditCard,
  QrCode,
  Repeat,
  ShieldCheck,
  FileText,
  ChevronRight,
  Mail,
  Phone,
} from "lucide-react";

import WebsiteNavbar from "@/components/common/public/WebsiteNavbar";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import WebsiteFooter from "../components/MasjidkuWebFooter";

/* =====================================================================
 * Utilities (follow SekolahIslamkuHome style)
 * ===================================================================== */
const FullBleed: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <div
    className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen ${className}`}
  >
    {children}
  </div>
);

const Section: React.FC<
  React.PropsWithChildren<{ id?: string; className?: string }>
> = ({ id, className = "", children }) => (
  <section id={id} className={`px-4 sm:px-6 lg:px-8 ${className}`}>
    <div className="w-full">{children}</div>
  </section>
);

/* =====================================================================
 * Page
 * ===================================================================== */
export default function MasjidkuWebSupportUs() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const primaryBtn = useMemo(
    () => ({
      backgroundColor: theme.primary,
      borderColor: theme.primary,
      color: theme.white1,
    }),
    [theme]
  );

  return (
    <FullBleed>
      <div
        className="min-h-screen overflow-x-hidden w-screen"
        style={{
          background: isDark
            ? `linear-gradient(180deg, ${theme.white1} 0%, ${theme.white2} 100%)`
            : `linear-gradient(180deg, ${theme.white2} 0%, ${theme.white1} 100%)`,
          color: theme.black1,
        }}
      >
        {/* NAVBAR */}
        <WebsiteNavbar />
        <div style={{ height: "5.5rem" }} />

        {/* ========================= HERO ========================= */}
        <div className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2400&auto=format&fit=crop"
            alt="Komunitas pendidikan berkolaborasi"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: isDark ? 0.25 : 0.2, filter: "saturate(0.9)" }}
            loading="eager"
          />

          <Section className="relative py-14 sm:py-20 lg:py-24">
            <div className="text-center max-w-3xl mx-auto">
              <span
                className="inline-flex items-center gap-2 text-xs font-medium rounded-full border px-3 py-1"
                style={{
                  backgroundColor: isDark ? theme.white2 : theme.white1,
                  borderColor: theme.white3,
                  color: theme.black1,
                }}
              >
                <Heart className="h-3.5 w-3.5" /> Gerakan Berbagi Akses
                Teknologi Pendidikan
              </span>
              <h1
                className="mt-4 text-4xl md:text-5xl font-bold"
                style={{ color: theme.black1 }}
              >
                Dukung Kami
              </h1>
              <p className="mt-3" style={{ color: theme.silver2 }}>
                Visi kami:{" "}
                <strong>setiap madrasah, pesantren, dan sekolah Islam</strong>{" "}
                bisa memakai SekolahIslamku
                <strong> secara gratis</strong>—dengan bantuan para donatur yang
                peduli pendidikan.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <a
                  href="#donasi"
                  className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm shadow-sm transition hover:shadow-md"
                  style={primaryBtn}
                >
                  <CreditCard className="h-4 w-4" /> Donasi Sekarang
                </a>
                <a
                  href="#ajukan"
                  className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm transition"
                  style={{
                    color: theme.black1,
                    borderColor: theme.white3,
                    backgroundColor: isDark ? theme.white2 : "transparent",
                  }}
                >
                  <ChevronRight className="h-4 w-4" /> Ajukan Beasiswa Lisensi
                </a>
              </div>
            </div>
          </Section>
        </div>

        {/* ========================= VISI & MISI ========================= */}
        <Section id="visi-misi" className="py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div
              className="rounded-3xl p-6 border"
              style={{
                backgroundColor: theme.white1,
                borderColor: theme.white3,
              }}
            >
              <div
                className="flex items-center gap-2 text-lg font-semibold"
                style={{ color: theme.black1 }}
              >
                <School className="h-5 w-5" /> Visi
              </div>
              <p className="mt-3 text-sm" style={{ color: theme.silver2 }}>
                Akses teknologi pendidikan yang <strong>merata</strong>,{" "}
                <strong>aman</strong>, dan <strong>berdampak</strong> bagi
                seluruh lembaga pendidikan Islam di Indonesia.
              </p>
            </div>
            <div
              className="rounded-3xl p-6 border"
              style={{
                backgroundColor: theme.white1,
                borderColor: theme.white3,
              }}
            >
              <div
                className="flex items-center gap-2 text-lg font-semibold"
                style={{ color: theme.black1 }}
              >
                <Handshake className="h-5 w-5" /> Misi
              </div>
              <ul
                className="mt-3 space-y-2 text-sm"
                style={{ color: theme.silver2 }}
              >
                {[
                  "Mensubsidi lisensi platform bagi lembaga yang membutuhkan",
                  "Menyediakan pelatihan dan pendampingan untuk guru & operator",
                  "Menjaga keberlanjutan infrastruktur (server, backup, keamanan)",
                  "Mendorong kolaborasi donatur, yayasan, dan komunitas",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2">
                    <Heart className="h-4 w-4 mt-0.5" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* ========================= PROGRAM PENDANAAN ========================= */}
        <Section id="program" className="py-12 md:py-16">
          <header className="mb-8 text-center">
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: theme.black1 }}
            >
              Ke Mana Donasi Anda Dialokasikan
            </h2>
            <p className="mt-3" style={{ color: theme.silver2 }}>
              Kami fokus pada dampak langsung bagi sekolah.
            </p>
          </header>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Beasiswa Lisensi",
                desc: "Membiayai penggunaan platform untuk sekolah membutuhkan.",
              },
              {
                icon: Database,
                title: "Infrastruktur",
                desc: "Server, backup harian, monitoring, dan keamanan data.",
              },
              {
                icon: Users,
                title: "Pelatihan Guru",
                desc: "Sesi onboarding, materi, dan pendampingan operasional.",
              },
              {
                icon: ShieldCheck,
                title: "Kepatuhan & Audit",
                desc: "Kebijakan, SOP, dan jejak audit demi transparansi.",
              },
            ].map((i) => (
              <div
                key={i.title}
                className="rounded-2xl p-5 border"
                style={{
                  backgroundColor: theme.white1,
                  borderColor: theme.white3,
                }}
              >
                <div className="flex items-start gap-3">
                  <i.icon className="h-5 w-5" />
                  <div>
                    <div
                      className="font-semibold"
                      style={{ color: theme.black1 }}
                    >
                      {i.title}
                    </div>
                    <div
                      className="text-sm mt-1"
                      style={{ color: theme.silver2 }}
                    >
                      {i.desc}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ========================= DAMPAK & ESTIMASI ========================= */}
        <Section id="dampak" className="py-12">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Sekolah Terbantu", value: "250+" },
              { label: "Guru & Staf Terlatih", value: "8.5k+" },
              { label: "Siswa Terlayani", value: "150k+" },
            ].map((k) => (
              <div
                key={k.label}
                className="rounded-2xl p-4 border text-center"
                style={{
                  backgroundColor: theme.white1,
                  borderColor: theme.white3,
                }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: theme.black1 }}
                >
                  {k.value}
                </div>
                <div className="text-xs mt-1" style={{ color: theme.silver2 }}>
                  {k.label}
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-6 rounded-2xl border p-4"
            style={{
              backgroundColor: theme.white2,
              borderColor: theme.white3,
              color: theme.black1,
            }}
          >
            <div className="text-sm" style={{ color: theme.silver2 }}>
              *Estimasi biaya berjenjang untuk lisensi & infrastruktur akan
              dipublikasikan pada laporan triwulan. Donatur dapat memilih skema{" "}
              <strong>sekali donasi</strong> atau{" "}
              <strong>berkala (recurring)</strong> sesuai preferensi.
            </div>
          </div>
        </Section>

        {/* ========================= CARA BERDONASI ========================= */}
        <Section id="donasi" className="py-12 md:py-16">
          <header className="mb-8 text-center">
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: theme.black1 }}
            >
              Cara Berdonasi
            </h2>
            <p className="mt-3" style={{ color: theme.silver2 }}>
              Pilih metode yang paling nyaman untuk Anda.
            </p>
          </header>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Transfer Bank */}
            <div
              className="rounded-3xl p-6 border"
              style={{
                backgroundColor: theme.white1,
                borderColor: theme.white3,
              }}
            >
              <div
                className="flex items-center gap-2 font-semibold"
                style={{ color: theme.black1 }}
              >
                <CreditCard className="h-5 w-5" /> Transfer Bank (Contoh)
              </div>
              <ul
                className="mt-3 text-sm space-y-2"
                style={{ color: theme.silver2 }}
              >
                <li>Bank Syariah Indonesia (BSI)</li>
                <li>
                  No. Rek: <strong>123 456 7890</strong>
                </li>
                <li>
                  a/n: <strong>Yayasan SekolahIslamku</strong>
                </li>
              </ul>
            </div>

            {/* QRIS */}
            <div
              className="rounded-3xl p-6 border"
              style={{
                backgroundColor: theme.white1,
                borderColor: theme.white3,
              }}
            >
              <div
                className="flex items-center gap-2 font-semibold"
                style={{ color: theme.black1 }}
              >
                <QrCode className="h-5 w-5" /> QRIS (Contoh)
              </div>
              <div
                className="mt-3 aspect-square rounded-xl border flex items-center justify-center text-xs"
                style={{ borderColor: theme.white3, color: theme.silver2 }}
              >
                Tempat QRIS — ganti dengan gambar resmi
              </div>
            </div>

            {/* Donasi Berkala */}
            <div
              className="rounded-3xl p-6 border"
              style={{
                backgroundColor: theme.white1,
                borderColor: theme.white3,
              }}
            >
              <div
                className="flex items-center gap-2 font-semibold"
                style={{ color: theme.black1 }}
              >
                <Repeat className="h-5 w-5" /> Donasi Berkala
              </div>
              <p className="mt-3 text-sm" style={{ color: theme.silver2 }}>
                Dukung sekolah secara berkelanjutan setiap bulan. Anda akan
                menerima ringkasan dampak melalui email.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                {["Rp100k", "Rp250k", "Rp500k", "Rp1jt"].map((x) => (
                  <span
                    key={x}
                    className="rounded-full px-3 py-1 border"
                    style={{ borderColor: theme.white3, color: theme.black1 }}
                  >
                    {x}/bulan
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm shadow-sm transition hover:shadow-md"
              style={primaryBtn}
            >
              <Phone className="h-4 w-4" /> Konfirmasi via WhatsApp
            </a>
            <a
              href="mailto:donasi@sekolahislamku.id"
              className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm transition"
              style={{
                color: theme.black1,
                borderColor: theme.white3,
                backgroundColor: isDark ? theme.white2 : "transparent",
              }}
            >
              <Mail className="h-4 w-4" /> donasi@sekolahislamku.id
            </a>
          </div>
        </Section>

        {/* ========================= TRANSPARANSI ========================= */}
        <Section id="transparansi" className="py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3
                className="text-2xl md:text-3xl font-bold"
                style={{ color: theme.black1 }}
              >
                Transparansi & Akuntabilitas
              </h3>
              <ul
                className="mt-3 space-y-2 text-sm"
                style={{ color: theme.silver2 }}
              >
                {[
                  "Laporan triwulan: alokasi dana & jumlah sekolah terbantu",
                  "Rangkuman dampak: guru terlatih, siswa terlayani, progres fitur",
                  "Audit internal & jejak audit sistem untuk setiap perubahan kebijakan",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 mt-0.5" /> {x}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm transition"
                  style={{
                    color: theme.black1,
                    borderColor: theme.white3,
                    backgroundColor: isDark ? theme.white2 : "transparent",
                  }}
                >
                  <FileText className="h-4 w-4" /> Contoh Laporan (PDF)
                </a>
              </div>
            </div>
            <div
              className="rounded-3xl p-6 border"
              style={{
                backgroundColor: theme.white1,
                borderColor: theme.white3,
              }}
            >
              <div
                className="font-semibold flex items-center gap-2"
                style={{ color: theme.black1 }}
              >
                <Users className="h-5 w-5" /> Sponsor Perusahaan / CSR
              </div>
              <p className="mt-2 text-sm" style={{ color: theme.silver2 }}>
                Perusahaan dapat bermitra untuk mensubsidi lisensi sekolah
                sasaran (daerah 3T/TPK, pesantren kecil, dll). Kami sediakan
                paket branding, laporan dampak, dan pelibatan karyawan.
              </p>
              <a
                href="mailto:partnership@sekolahislamku.id"
                className="mt-4 inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm transition"
                style={{
                  color: theme.black1,
                  borderColor: theme.white3,
                  backgroundColor: isDark ? theme.white2 : "transparent",
                }}
              >
                <Mail className="h-4 w-4" /> partnership@sekolahislamku.id
              </a>
            </div>
          </div>
        </Section>

        {/* ========================= AJUKAN BEASISWA LISENSI ========================= */}
        <Section id="ajukan" className="py-12 md:py-16">
          <div
            className="rounded-3xl border p-6 md:p-8"
            style={{ backgroundColor: theme.white2, borderColor: theme.white3 }}
          >
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div>
                <h3
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: theme.black1 }}
                >
                  Ajukan Beasiswa Lisensi
                </h3>
                <p className="mt-2 text-sm" style={{ color: theme.silver2 }}>
                  Lembaga Anda membutuhkan subsidi lisensi? Ajukan di sini. Tim
                  kami akan menyeleksi berdasarkan kriteria kebutuhan dan
                  dampak.
                </p>
                <ul
                  className="mt-3 space-y-2 text-sm"
                  style={{ color: theme.silver2 }}
                >
                  {[
                    "Prioritas: madrasah/pesantren kecil, daerah 3T/TPK, atau biaya operasional terbatas",
                    "Komitmen minimal: satu PIC operasional & kesediaan mengikuti pelatihan",
                    "Pelaporan dampak sederhana tiap semester",
                  ].map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <CheckIcon /> {x}
                    </li>
                  ))}
                </ul>
              </div>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="rounded-2xl border p-4 md:p-6"
                style={{
                  backgroundColor: theme.white1,
                  borderColor: theme.white3,
                }}
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs" style={{ color: theme.silver2 }}>
                      Nama Lembaga
                    </label>
                    <input
                      required
                      className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.white1,
                        borderColor: theme.white3,
                        color: theme.black1,
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs" style={{ color: theme.silver2 }}>
                      Jenjang
                    </label>
                    <input
                      placeholder="MI/MTs/MA/SD/SMP/SMA/SMK/Pesantren"
                      className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.white1,
                        borderColor: theme.white3,
                        color: theme.black1,
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs" style={{ color: theme.silver2 }}>
                      Kontak PIC
                    </label>
                    <input
                      placeholder="Nama & No. HP"
                      className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.white1,
                        borderColor: theme.white3,
                        color: theme.black1,
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs" style={{ color: theme.silver2 }}>
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.white1,
                        borderColor: theme.white3,
                        color: theme.black1,
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs" style={{ color: theme.silver2 }}>
                      Kota/Kabupaten
                    </label>
                    <input
                      className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.white1,
                        borderColor: theme.white3,
                        color: theme.black1,
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs" style={{ color: theme.silver2 }}>
                      Link Website/Media Sosial
                    </label>
                    <input
                      className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.white1,
                        borderColor: theme.white3,
                        color: theme.black1,
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs" style={{ color: theme.silver2 }}>
                      Cerita Singkat Kebutuhan
                    </label>
                    <textarea
                      rows={4}
                      className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.white1,
                        borderColor: theme.white3,
                        color: theme.black1,
                      }}
                    />
                  </div>
                </div>
                <button
                  className="mt-4 inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm shadow-sm transition hover:shadow-md"
                  style={primaryBtn}
                >
                  <ChevronRight className="h-4 w-4" /> Ajukan
                </button>
              </form>
            </div>
          </div>
        </Section>

        {/* ========================= FAQ ========================= */}
        <Section id="faq" className="py-12 md:py-16">
          <header className="mb-8 text-center">
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: theme.black1 }}
            >
              FAQ Donatur
            </h2>
            <p className="mt-3" style={{ color: theme.silver2 }}>
              Pertanyaan umum tentang program dukungan.
            </p>
          </header>
          <div className="grid lg:grid-cols-2 gap-6">
            {[
              {
                q: "Apakah donasi saya bisa ditujukan ke sekolah tertentu?",
                a: "Bisa. Kami akan menghubungi sekolah sasaran untuk verifikasi & kesiapan implementasi.",
              },
              {
                q: "Apakah ada bukti penggunaan dana?",
                a: "Ada. Donatur menerima ringkasan triwulan & tautan ke laporan lengkap.",
              },
              {
                q: "Bisakah donasi dilakukan berkala otomatis?",
                a: "Bisa. Kami mendukung skema berkala (bulanan/kuartalan).",
              },
              {
                q: "Apakah donasi bisa atas nama perusahaan?",
                a: "Bisa. Tersedia paket CSR/sponsorship dengan benefit pelaporan & branding.",
              },
            ].map((f) => (
              <div
                key={f.q}
                className="rounded-2xl p-5 border"
                style={{
                  backgroundColor: theme.white1,
                  borderColor: theme.white3,
                }}
              >
                <div className="font-semibold" style={{ color: theme.black1 }}>
                  {f.q}
                </div>
                <div className="text-sm mt-2" style={{ color: theme.silver2 }}>
                  {f.a}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ========================= FOOTER MINI ========================= */}
        {/* FOOTER */}
        <WebsiteFooter />
      </div>
    </FullBleed>
  );
}

// Simple check icon (to avoid extra import)
function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mt-0.5"
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
