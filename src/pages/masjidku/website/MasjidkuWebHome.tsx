// src/pages/SekolahIslamkuHome.tsx
import React, { useMemo } from "react";
import {
  BookOpen,
  Users,
  Award,
  Clock,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Phone,
  Star,
} from "lucide-react";

import WebsiteNavbar from "@/components/common/public/WebsiteNavbar";
import WebsiteFooter from "./components/MasjidkuWebFooter";

import useHtmlThema from "@/hooks/useHTMLThema";
import { pickTheme, ThemeName } from "@/constants/thema";

import TestimonialSlider, {
  TestimonialItem,
} from "./components/MasjidkuTestimonialSlider";
import { Link } from "react-router-dom";

/** =================== Data =================== */
const modules = [
  {
    title: "Penerimaan Siswa Baru (PPDB)",
    desc: "Form online, seleksi, verifikasi berkas, pembayaran, hingga penetapan kelas otomatis.",
    icon: Users,
    img: "https://images.unsplash.com/photo-1601935111741-a8da1e5b0534?q=80&w=1400&auto=format&fit=crop",
  },
  {
    title: "Akademik & Kurikulum",
    desc: "RPP, penjadwalan, penilaian, rapor digital, kelulusan—semuanya tersentral.",
    icon: BookOpen,
    img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1400&auto=format&fit=crop",
  },
  {
    title: "Absensi & Kehadiran",
    desc: "Scan QR/ID, izin/surat sakit, rekap kehadiran real-time untuk guru & siswa.",
    icon: Clock,
    img: "https://images.unsplash.com/photo-1596495578065-8fe1800a2a4b?q=80&w=1400&auto=format&fit=crop",
  },
];

const features = [
  {
    title: "Keuangan & SPP",
    img: "https://images.unsplash.com/photo-1454165205744-3b78555e5572?q=80&w=1400&auto=format&fit=crop",
  },
  {
    title: "Komunikasi & Notifikasi",
    img: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1400&auto=format&fit=crop",
  },
  {
    title: "LMS & E-Learning",
    img: "https://images.unsplash.com/photo-1584697964199-10c09b6b29a3?q=80&w=1400&auto=format&fit=crop",
  },
  {
    title: "Inventaris & Perpustakaan",
    img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1400&auto=format&fit=crop",
  },
];

const advantages = [
  {
    label: "Implementasi Cepat",
    points: [
      "Onboarding < 7 hari",
      "Template data siap pakai",
      "Tim support responsif",
    ],
  },
  {
    label: "Satu Dashboard",
    points: ["360° data sekolah", "KPI & analitik", "Ekspor ke Excel/PDF"],
  },
  {
    label: "Integrasi Fleksibel",
    points: [
      "WhatsApp/Email gateway",
      "Payment gateway",
      "Siapkan SSO sekolah",
    ],
  },
  {
    label: "Keamanan Data",
    points: ["Backup harian", "Kontrol akses role-based", "Jejak audit"],
  },
];

const testimonials: TestimonialItem[] = [
  {
    name: "Nurhandayani",
    role: "Kepala Sekolah SMP Nurul Fajar",
    quote:
      "Administrasi jauh lebih tertib. Orang tua bisa pantau nilai & SPP dari rumah, guru fokus mengajar.",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Fajar Nugraha",
    role: "Wakasek Kurikulum SMK Cendekia",
    quote:
      "Penjadwalan & rapor digital mempercepat pekerjaan hingga 60%. Laporan kepala sekolah real-time.",
    img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Hj. Rahmawati",
    role: "Kepala Madrasah Aliyah",
    quote:
      "Absensi digital mempermudah monitoring kehadiran siswa, rekap otomatis tanpa manual.",
    img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Budi Santoso",
    role: "Guru Matematika",
    quote: "Input nilai cepat, rapor online bisa diakses orang tua kapan pun.",
    img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Siti Aminah",
    role: "Wali Murid",
    quote:
      "Saya mudah memantau kehadiran, nilai, dan tagihan SPP dari satu aplikasi.",
    img: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Hendri Pratama",
    role: "Kepala TU",
    quote: "Transaksi SPP transparan, rekonsiliasi tinggal ekspor laporan.",
    img: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=800&auto=format&fit=crop",
  },
];

const kpis = [
  { label: "Sekolah Terbantu", value: "250+" },
  { label: "Guru & Staff", value: "8.5k+" },
  { label: "Siswa Tercatat", value: "150k+" },
  { label: "Integrasi Aktif", value: "50+" },
];

/** ========= Utilities ========= */
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

export default function SekolahIslamkuHome() {
  const { isDark, themeName } = useHtmlThema();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const primaryBtnStyle = useMemo(
    () => ({
      backgroundColor: theme.primary,
      borderColor: theme.primary,
      color: "#FFFFFF",
    }),
    [theme]
  );

  const supportBtnStyle = useMemo(
    () => ({
      color: theme.quaternary,
      borderColor: theme.quaternary,
      backgroundColor: isDark ? theme.white2 : "transparent",
    }),
    [theme, isDark]
  );

  const pageBg = useMemo(
    () =>
      isDark
        ? `linear-gradient(180deg, ${theme.white1} 0%, ${theme.white2} 100%)`
        : `linear-gradient(180deg, ${theme.white2} 0%, ${theme.white1} 100%)`,
    [isDark, theme]
  );

  return (
    <FullBleed>
      <div
        id="home"
        className="min-h-screen overflow-x-hidden w-screen"
        // style={{ background: pageBg, color: theme.black1 }}
      >
        {/* NAVBAR */}
        <WebsiteNavbar />
        <div  />

        {/* HERO */}
        <div className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2400&auto=format&fit=crop"
            alt="Hero background"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: isDark ? 0.3 : 0.25, filter: "saturate(0.9)" }}
            loading="eager"
          />

          <Section className="relative py-16 sm:py-20 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Left: copy + CTA */}
              <div>
                <span
                  className="inline-flex items-center gap-2 text-xs font-medium rounded-full border px-3 py-1"
                  style={{
                    backgroundColor: isDark ? theme.white2 : theme.white1,
                    borderColor: theme.white3,
                    color: theme.black1,
                  }}
                >
                  <Star className="h-3.5 w-3.5" /> Solusi End-to-End untuk
                  Administrasi Sekolah
                </span>

                <h1
                  className="mt-4 text-4xl md:text-5xl xl:text-6xl font-bold leading-tight"
                  style={{ color: theme.black1 }}
                >
                  Kelola Sekolah{" "}
                  <span style={{ color: theme.primary }}>Lebih Mudah</span>,
                  Cepat, & Transparan
                </h1>

                <p className="mt-4 max-w-3xl" style={{ color: theme.black2 }}>
                  Dari PPDB, akademik, kehadiran, keuangan, hingga komunikasi
                  orang tua—semua terintegrasi dalam satu platform yang ringan
                  dan aman.
                </p>

                {/* CTA row */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    to={"/website/daftar-sekarang"}
                    className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm shadow-sm transition hover:shadow-md"
                    style={primaryBtnStyle}
                  >
                    <ChevronRight className="h-4 w-4" />
                    Daftar Sekarang Gratis
                  </Link>

                  <Link
                 to={"dukungan"}
                    className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm transition hover:opacity-90"
                    style={supportBtnStyle}
                  >
                    🤝 Dukung Kami
                  </Link>
                </div>
              </div>

              {/* Right: mock dashboard */}
              <div>
                <div
                  className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl ring-1"
                  style={{ borderColor: theme.white3 }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000&auto=format&fit=crop"
                    alt="Dashboard Sekolah"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div
                    className="absolute bottom-3 left-3 right-3 rounded-2xl p-3 flex items-center gap-3"
                    style={{
                      backdropFilter: "blur(6px)",
                      backgroundColor: `${theme.white2}cc`,
                      color: theme.black1,
                    }}
                  >
                    <Award className="h-4 w-4" />
                    <p className="text-xs">
                      Dashboard menyatukan akademik, keuangan, absensi, &
                      komunikasi dalam satu layar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* MODUL INTI */}
        <Section id="program" className="py-16 md:py-20">
          <header className="mb-8 md:mb-12 text-center">
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: theme.black2 }}
            >
              Modul Inti Platform
            </h2>
            <p className="mt-3" style={{ color: theme.black2 }}>
              Tersedia lengkap—siap digunakan dari hari pertama implementasi.
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-6 xl:gap-8">
            {modules.map((m) => (
              <article
                key={m.title}
                className="group rounded-3xl overflow-hidden border shadow-sm hover:shadow-md transition"
                style={{
                  backgroundColor: theme.white1,
                  borderColor: theme.white3,
                }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={m.img}
                    alt={m.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div
                    className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs"
                    style={{
                      backgroundColor: `${theme.white2}dd`,
                      color: theme.black1,
                    }}
                  >
                    <m.icon className="h-4 w-4" /> {m.title}
                  </div>
                </div>
                <div className="p-4">
                  <p style={{ color: theme.black2 }} className="text-sm">
                    {m.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* FITUR TAMBAHAN */}
        <Section id="fasilitas" className="py-16 md:py-20">
          <header className="mb-8 md:mb-12 text-center">
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: theme.black1 }}
            >
              Fitur Tambahan yang Kuat
            </h2>
            <p className="mt-3" style={{ color: theme.black2 }}>
              Sesuaikan kebutuhan sekolah—aktifkan modul sesuai prioritas.
            </p>
          </header>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
            {features.map((f) => (
              <figure
                key={f.title}
                className="rounded-3xl overflow-hidden border shadow-sm transition hover:shadow"
                style={{
                  borderColor: theme.white3,
                  backgroundColor: theme.white1,
                }}
              >
                <img
                  src={f.img}
                  alt={f.title}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                />
                <figcaption
                  className="p-4 text-sm font-medium"
                  style={{ color: theme.black1 }}
                >
                  {f.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        {/* KEUNGGULAN */}
        <Section id="keunggulan" className="py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2
                className="text-3xl md:text-4xl font-bold"
                style={{ color: theme.black1 }}
              >
                Mengapa Memilih Kami
              </h2>
              <p className="mt-3 max-w-prose" style={{ color: theme.black2 }}>
                Tim kami berpengalaman membantu sekolah negeri & swasta
                meningkatkan efisiensi operasional tanpa mengubah budaya kerja
                inti.
              </p>
              <ul className="mt-6 space-y-3">
                {advantages.map((k) => (
                  <li
                    key={k.label}
                    className="rounded-2xl border p-4 transition"
                    style={{
                      backgroundColor: theme.white2,
                      borderColor: theme.white3,
                    }}
                  >
                    <div
                      className="font-semibold mb-2"
                      style={{ color: theme.black1 }}
                    >
                      {k.label}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {k.points.map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center gap-1.5 text-xs rounded-full border px-3 py-1"
                          style={{
                            borderColor: theme.white3,
                            color: theme.black1,
                            backgroundColor: theme.white1,
                          }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> {p}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div
                className="rounded-3xl overflow-hidden shadow-xl ring-1"
                style={{ borderColor: theme.white3 }}
              >
                <img
                  src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1600&auto=format&fit=crop"
                  alt="Tim implementasi"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div
                className="absolute -bottom-6 -right-6 hidden md:block rounded-2xl px-4 py-3 shadow-lg"
                style={{ backgroundColor: theme.primary, color: "#FFFFFF" }}
              >
                Fokus: Efisiensi • Transparansi • Data-Driven
              </div>
            </div>
          </div>
        </Section>

        {/* TESTIMONI */}
        <Section id="testimoni" className="py-16 md:py-28">
          <header className="mb-8 md:mb-12 text-center">
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: theme.black1 }}
            >
              Kata Mereka
            </h2>
            <p className="mt-3" style={{ color: theme.black2 }}>
              Dampak nyata di sekolah pengguna layanan kami.
            </p>
          </header>

          <TestimonialSlider
            items={testimonials}
            theme={theme}
            autoplayDelayMs={4000}
            showArrows
          />
        </Section>

        {/* CTA DEMO */}
        <div
          id="demo"
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.quaternary} 100%)`,
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1544717305-996b815c338c?q=80&w=2000&auto=format&fit=crop"
            alt="CTA Demo"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{ opacity: 0.1 }}
            loading="lazy"
          />
          <Section className="py-16 md:py-20">
            <div
              className="rounded-3xl border backdrop-blur-sm p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center"
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "#FFFFFF",
              }}
            >
              <div>
                <h3 className="text-2xl md:text-3xl font-bold">
                  Jadwalkan Demo Gratis
                </h3>
                <p className="mt-2" style={{ opacity: 0.9 }}>
                  Lihat bagaimana platform kami menyederhanakan operasional
                  sekolah Anda—langsung bersama tim kami.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="#kontak"
                    className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm shadow transition hover:opacity-90"
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: theme.primary,
                      borderColor: "#FFFFFF",
                    }}
                  >
                    <Calendar className="h-4 w-4" /> Booking Slot Demo
                  </a>
                  <a
                    href="#kontak"
                    className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm transition"
                    style={{
                      backgroundColor: "transparent",
                      color: "#FFFFFF",
                      borderColor: "rgba(255,255,255,0.6)",
                    }}
                  >
                    <Phone className="h-4 w-4" /> Hubungi Sales
                  </a>
                </div>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  "Tanpa biaya setup",
                  "Bisa migrasi data",
                  "Bebas kontrak panjang",
                  "Garansi bantuan implementasi",
                ].map((x) => (
                  <li key={x} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        </div>

        {/* NEWSLETTER */}
        <Section className="py-16 md:py-20">
          <div
            className="rounded-3xl border p-6 md:p-10"
            style={{ backgroundColor: theme.white2, borderColor: theme.white3 }}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3
                  className="text-2xl font-bold"
                  style={{ color: theme.black1 }}
                >
                  Dapatkan Update Fitur & Studi Kasus
                </h3>
                <p className="mt-2" style={{ color: theme.black2 }}>
                  Kami kirim ringkas—insight dan rilis terbaru ke email Anda.
                </p>
              </div>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="email"
                  required
                  placeholder="Email sekolah Anda"
                  className="flex-1 rounded-2xl border px-4 py-3 outline-none focus:ring-2"
                  style={{
                    backgroundColor: theme.white1,
                    borderColor: theme.white3,
                    color: theme.black1,
                  }}
                />
                <button
                  className="rounded-2xl px-6 py-3 transition hover:opacity-90"
                  style={primaryBtnStyle}
                >
                  Langganan
                </button>
              </form>
            </div>
          </div>
        </Section>

        {/* FOOTER */}
        <WebsiteFooter />
      </div>
    </FullBleed>
  );
}
