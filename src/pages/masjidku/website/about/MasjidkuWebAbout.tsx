// src/pages/SekolahIslamkuAbout.tsx
import React, { useMemo } from "react";
import {
  ShieldCheck,
  Target,
  Rocket,
  Users,
  BookOpen,
  Calendar,
  Wallet,
  GraduationCap,
  BarChart3,
  Heart,
  Handshake,
  Leaf,
  Globe2,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";
import WebsiteNavbar from "@/components/common/public/WebsiteNavbar";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import WebsiteFooter from "../components/MasjidkuWebFooter";

/** ===== Helpers ===== */
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

/** ===== Page ===== */
export default function MasjidkuWebAbout() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const bg = useMemo(
    () =>
      isDark
        ? `linear-gradient(180deg, ${theme.white1} 0%, ${theme.white2} 100%)`
        : `linear-gradient(180deg, ${theme.white2} 0%, ${theme.white1} 100%)`,
    [isDark, theme]
  );

  const cardStyle = useMemo(
    () => ({
      backgroundColor: theme.white1,
      borderColor: theme.white3,
      color: theme.black1,
    }),
    [theme]
  );

  const muted = useMemo(() => ({ color: theme.silver2 }), [theme]);

  const primaryBtn = useMemo(
    () => ({
      backgroundColor: theme.primary,
      borderColor: theme.primary,
      color: theme.white1,
    }),
    [theme]
  );

  const ghostBtn = useMemo(
    () => ({
      color: theme.black1,
      borderColor: theme.white3,
      backgroundColor: isDark ? theme.white2 : "transparent",
    }),
    [theme, isDark]
  );

  const kpis = [
    { label: "Sekolah Terbantu", value: "250+" },
    { label: "Guru & Staf", value: "8.5k+" },
    { label: "Siswa Tercatat", value: "150k+" },
    { label: "Integrasi Aktif", value: "50+" },
  ];

  const values = [
    {
      icon: ShieldCheck,
      title: "Amanah",
      desc: "Keamanan & privasi data jadi prioritas utama.",
    },
    {
      icon: BarChart3,
      title: "Transparan",
      desc: "Semua proses terukur & dapat diaudit.",
    },
    {
      icon: Heart,
      title: "Empati",
      desc: "Didesain bersama kebutuhan guru & orang tua.",
    },
    {
      icon: Leaf,
      title: "Sederhana",
      desc: "UI ringan, cepat dipelajari, hemat waktu.",
    },
    {
      icon: Handshake,
      title: "Kolaboratif",
      desc: "Berkolaborasi dengan sekolah & komunitas.",
    },
    {
      icon: Globe2,
      title: "Skalabel",
      desc: "Siap tumbuh mengikuti skala institusi Anda.",
    },
  ];

  const timeline = [
    {
      year: "2019",
      title: "Riset Kebutuhan",
      desc: "Memetakan pain point administrasi sekolah & madrasah.",
    },
    {
      year: "2021",
      title: "Pilot Project",
      desc: "Uji coba di beberapa sekolah untuk modul PPDB & Absensi.",
    },
    {
      year: "2023",
      title: "Suite Terintegrasi",
      desc: "Rilis dashboard terpadu: akademik, keuangan, komunikasi.",
    },
    {
      year: "2025",
      title: "Ekspansi & Integrasi",
      desc: "Payment gateway, WhatsApp gateway, & analitik KPI lanjutan.",
    },
  ];

  return (
    <FullBleed>
      <div
        className="min-h-screen w-screen overflow-x-hidden"
        style={{ background: bg, color: theme.black1 }}
      >
        {/* NAVBAR */}
        <WebsiteNavbar />
        <div style={{ height: "5.5rem" }} />

        {/* HERO */}
        <div className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=2400&auto=format&fit=crop"
            alt="Tentang SekolahIslamku Suite"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: isDark ? 0.28 : 0.22 }}
          />
          <Section className="relative py-16 sm:py-20 lg:py-28">
            <div className="max-w-5xl">
              <span
                className="inline-flex items-center gap-2 text-xs font-medium rounded-full border px-3 py-1"
                style={{
                  backgroundColor: isDark ? theme.white2 : theme.white1,
                  borderColor: theme.white3,
                  color: theme.black1,
                }}
              >
                <Target className="h-3.5 w-3.5" /> Tentang Kami
              </span>
              <h1
                className="mt-4 text-4xl md:text-5xl font-bold leading-tight"
                style={{ color: theme.black1 }}
              >
                Misi Kami: Menyederhanakan Administrasi, Memperkuat Pembelajaran
              </h1>
              <p className="mt-3 max-w-3xl" style={muted}>
                SekolahIslamku Suite membantu institusi pendidikan mengelola
                proses akademik, keuangan, dan komunikasi secara
                terintegrasi—agar guru fokus pada yang paling penting:
                membimbing murid.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm shadow-sm transition hover:shadow-md"
                  style={primaryBtn}
                >
                  <ChevronRight className="h-4 w-4" /> Mulai Sekarang
                </a>
                <a
                  href="/#demo"
                  className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm transition hover:opacity-90"
                  style={ghostBtn}
                >
                  Lihat Demo
                </a>
              </div>
            </div>
          </Section>
        </div>

        {/* MISI & VISI */}
        <Section id="visi-misi" className="py-14 md:py-20">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl border p-6 sm:p-8" style={cardStyle}>
              <div
                className="h-11 w-11 rounded-2xl grid place-items-center"
                style={{
                  backgroundColor: theme.primary2,
                  color: theme.primary,
                }}
              >
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-2xl font-bold">Misi</h3>
              <p className="mt-2" style={muted}>
                Menghadirkan platform yang aman, sederhana, dan terukur untuk
                meningkatkan efisiensi operasional sekolah serta memperkuat
                kolaborasi guru–orang tua–siswa.
              </p>
            </div>
            <div className="rounded-3xl border p-6 sm:p-8" style={cardStyle}>
              <div
                className="h-11 w-11 rounded-2xl grid place-items-center"
                style={{
                  backgroundColor: theme.primary2,
                  color: theme.primary,
                }}
              >
                <Rocket className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-2xl font-bold">Visi</h3>
              <p className="mt-2" style={muted}>
                Menjadi ekosistem digital pendidikan Islam yang terpercaya,
                transparan, dan berdampak luas bagi kemajuan pendidikan di
                Indonesia.
              </p>
            </div>
          </div>
        </Section>

        {/* CERITA / TIMELINE */}
        <Section id="cerita" className="py-14 md:py-20">
          <header className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Perjalanan Kami</h2>
            <p className="mt-2" style={muted}>
              Dari riset kebutuhan hingga menjadi suite terintegrasi yang
              digunakan banyak sekolah.
            </p>
          </header>
          <ol
            className="relative border-s pl-6"
            style={{ borderColor: theme.white3 }}
          >
            {timeline.map((t) => (
              <li key={t.year} className="mb-8 ms-4">
                <div
                  className="absolute w-3 h-3 rounded-full -start-1.5"
                  style={{ backgroundColor: theme.primary }}
                />
                <time
                  className="text-xs uppercase tracking-wide"
                  style={{ color: theme.silver2 }}
                >
                  {t.year}
                </time>
                <h3 className="text-lg font-semibold mt-1">{t.title}</h3>
                <p className="text-sm mt-1" style={muted}>
                  {t.desc}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        {/* NILAI INTI */}
        <Section id="nilai" className="py-14 md:py-20">
          <header className="mb-8 md:mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">
              Nilai yang Kami Pegang
            </h2>
            <p className="mt-2" style={muted}>
              Prinsip kerja yang membimbing setiap keputusan & rilis fitur.
            </p>
          </header>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-3xl border p-5 sm:p-6 hover:shadow transition"
                style={cardStyle}
              >
                <div
                  className="h-10 w-10 rounded-2xl grid place-items-center"
                  style={{
                    backgroundColor: theme.primary2,
                    color: theme.primary,
                  }}
                >
                  <v.icon className="h-5 w-5" />
                </div>
                <div className="mt-3 font-semibold">{v.title}</div>
                <p className="text-sm mt-1" style={muted}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* APA YANG KAMI LAKUKAN */}
        <Section id="yang-kami-lakukan" className="py-14 md:py-20">
          <header className="mb-8 md:mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">
              Apa yang Kami Lakukan
            </h2>
            <p className="mt-2" style={muted}>
              Modul-modul inti yang memudahkan operasional sekolah Anda.
            </p>
          </header>
          <div className="grid md:grid-cols-4 gap-6 xl:gap-8">
            {[
              { icon: Users, title: "PPDB Online" },
              { icon: BookOpen, title: "Akademik & Rapor" },
              { icon: Calendar, title: "Absensi & Jadwal" },
              { icon: Wallet, title: "Keuangan & SPP" },
            ].map((m) => (
              <div
                key={m.title}
                className="rounded-3xl border p-6 text-center"
                style={cardStyle}
              >
                <div
                  className="mx-auto h-12 w-12 rounded-2xl grid place-items-center"
                  style={{
                    backgroundColor: theme.primary2,
                    color: theme.primary,
                  }}
                >
                  <m.icon className="h-6 w-6" />
                </div>
                <div className="mt-3 font-semibold">{m.title}</div>
                <p className="text-sm mt-1" style={muted}>
                  Terintegrasi dalam satu dashboard yang aman & ringan.
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ANGKA & DAMPAK */}
        <Section id="dampak" className="py-14 md:py-20">
          <div
            className="rounded-3xl border p-6 sm:p-8"
            style={{
              ...cardStyle,
              backgroundImage:
                "radial-gradient(80% 100% at 50% 0%, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0) 70%)",
            }}
          >
            <h2 className="text-2xl md:text-3xl font-bold">Angka & Dampak</h2>
            <p className="mt-2" style={muted}>
              Pertumbuhan ekosistem SekolahIslamku Suite di berbagai daerah.
            </p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {kpis.map((k) => (
                <div
                  key={k.label}
                  className="rounded-2xl border p-4 text-center"
                  style={{
                    borderColor: theme.white3,
                    backgroundColor: theme.white1,
                  }}
                >
                  <div
                    className="text-2xl md:text-3xl font-bold"
                    style={{ color: theme.primary }}
                  >
                    {k.value}
                  </div>
                  <div className="text-xs mt-1" style={muted}>
                    {k.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* TIM INTI (placeholder) */}
        <Section id="tim" className="py-14 md:py-20">
          <header className="mb-8 md:mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Tim Inti</h2>
            <p className="mt-2" style={muted}>
              Tim kecil, misi besar — berfokus pada dampak nyata bagi sekolah.
            </p>
          </header>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
            {[
              { name: "Aulia Rahman", role: "Product & Research" },
              { name: "Siti Kharisma", role: "Customer Success" },
              { name: "Fathur Rizky", role: "Engineering" },
              { name: "Nadia Putri", role: "Operations" },
            ].map((m) => (
              <figure
                key={m.name}
                className="rounded-3xl overflow-hidden border text-center"
                style={cardStyle}
              >
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop"
                  alt={m.name}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
                <figcaption className="p-4">
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs mt-0.5" style={muted}>
                    {m.role}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        {/* CTA KONTAK */}
        <div
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${colors.light.quaternary} 100%)`,
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1544717305-996b815c338c?q=80&w=2000&auto=format&fit=crop"
            alt="CTA"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{ opacity: 0.1 }}
            loading="lazy"
          />
          <Section className="py-14 md:py-20">
            <div
              className="rounded-3xl border backdrop-blur-sm p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center"
              style={{
                borderColor: `${colors.light.white1}33`,
                color: colors.light.white1,
              }}
            >
              <div>
                <h3 className="text-2xl md:text-3xl font-bold">
                  Siap Bergerak Bersama?
                </h3>
                <p className="mt-2" style={{ opacity: 0.9 }}>
                  Jadwalkan demo atau hubungi tim kami untuk konsultasi
                  kebutuhan sekolah Anda.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="/#demo"
                    className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm shadow transition hover:opacity-90"
                    style={{
                      backgroundColor: colors.light.white1,
                      color: theme.primary,
                      borderColor: colors.light.white1,
                    }}
                  >
                    <Calendar className="h-4 w-4" /> Booking Demo
                  </a>
                  <a
                    href="#kontak"
                    className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm transition"
                    style={{
                      backgroundColor: "transparent",
                      color: colors.light.white1,
                      borderColor: `${colors.light.white1}99`,
                    }}
                  >
                    <Phone className="h-4 w-4" /> Hubungi Kami
                  </a>
                </div>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3">
                  <MapPin className="h-5 w-5" /> Jakarta • Bandung • Surabaya
                  (remote-first)
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5" /> sales@sekolahislamku.id
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5" /> +62 812-3456-7890
                </li>
              </ul>
            </div>
          </Section>
        </div>

        {/* FOOTER */}
        <WebsiteFooter />
      </div>
    </FullBleed>
  );
}
