// src/pages/SekolahIslamkuTutorial.tsx
import React, { useMemo, useState } from "react";
import {
  GraduationCap,
  Users,
  Settings,
  PlayCircle,
  CheckCircle2,
  LogIn,
  Smartphone,
  CalendarDays,
  ClipboardList,
  MessageSquare,
  CreditCard,
  FileText,
  Link as LinkIcon,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

import WebsiteNavbar from "@/components/common/public/WebsiteNavbar";
import WebsiteFooter from "@/pages/masjidku/website/components/MasjidkuWebFooter";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

/* ================= Utilities ================= */
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

/* ================= Page ================= */
type RoleKey = "murid" | "guru" | "sekolah";

export default function MasjidkuWebTutorial() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const [role, setRole] = useState<RoleKey>("murid");

  const primaryBtn = useMemo(
    () => ({
      backgroundColor: theme.primary,
      borderColor: theme.primary,
      color: theme.white1,
    }),
    [theme]
  );

  /* ---------- data per role ---------- */
  const steps: Record<
    RoleKey,
    { title: string; desc: string; icon: React.ElementType }[]
  > = {
    murid: [
      {
        title: "Masuk / Daftar",
        desc: "Gunakan akun yang dibagikan sekolah atau daftar via undangan wali kelas.",
        icon: LogIn,
      },
      {
        title: "Lengkapi Profil",
        desc: "Periksa data siswa & orang tua; ubah kontak/WA bila perlu.",
        icon: Smartphone,
      },
      {
        title: "Lihat Jadwal",
        desc: "Pantau jadwal pelajaran & agenda ujian dari menu Kalender.",
        icon: CalendarDays,
      },
      {
        title: "Kumpulkan Tugas",
        desc: "Buka materi/tugas, unggah jawaban, cek nilai dan feedback guru.",
        icon: ClipboardList,
      },
      {
        title: "Pantau Nilai & Kehadiran",
        desc: "Rekap nilai, absen harian, dan catatan sikap tersedia real-time.",
        icon: CheckCircle2,
      },
      {
        title: "Komunikasi",
        desc: "Terima pengumuman & chat wali kelas (portal orang tua).",
        icon: MessageSquare,
      },
    ],
    guru: [
      {
        title: "Masuk & Atur Kelas",
        desc: "Cek daftar kelas yang diampu, atur RPP & topik pembelajaran.",
        icon: Settings,
      },
      {
        title: "Input Jadwal & Materi",
        desc: "Buat pertemuan, unggah materi, tetapkan tenggat tugas/kuis.",
        icon: CalendarDays,
      },
      {
        title: "Absensi Cepat",
        desc: "Pakai QR/ID atau centang manual; sistem rekap otomatis.",
        icon: Smartphone,
      },
      {
        title: "Penilaian & Rapor",
        desc: "Input nilai pengetahuan/keterampilan, deskripsi sikap, finalkan rapor.",
        icon: CheckCircle2,
      },
      {
        title: "Komunikasi Orang Tua",
        desc: "Kirim pengumuman kelas, pesan ke wali, dan pantau respons.",
        icon: MessageSquare,
      },
      {
        title: "Analitik Kelas",
        desc: "Lihat ringkasan ketercapaian & siswa yang perlu perhatian.",
        icon: ClipboardList,
      },
    ],
    sekolah: [
      {
        title: "Onboarding & Struktur",
        desc: "Tambahkan tahun ajaran, rombel, mapel, guru, serta data siswa.",
        icon: Settings,
      },
      {
        title: "PPDB & Penempatan",
        desc: "Buka gelombang, verifikasi berkas, penempatan kelas otomatis.",
        icon: ClipboardList,
      },
      {
        title: "Kalender Akademik",
        desc: "Atur kalender, jadwal ujian, dan hari besar; sinkron otomatis.",
        icon: CalendarDays,
      },
      {
        title: "Kebijakan Absensi",
        desc: "Aktifkan QR/ID, atur toleransi terlambat & alur izin/sakit.",
        icon: Smartphone,
      },
      {
        title: "Keuangan & SPP",
        desc: "Buat tagihan, aktifkan payment gateway, rekonsiliasi & laporan.",
        icon: CreditCard,
      },
      {
        title: "Pelaporan & KPI",
        desc: "Pantau dashboard 360°, ekspor Excel/PDF untuk pimpinan.",
        icon: CheckCircle2,
      },
    ],
  };

  const resources: Record<
    RoleKey,
    { title: string; kind: "video" | "doc" | "link"; href: string }[]
  > = {
    murid: [
      { title: "Video 3 Menit: Mulai dari HP", kind: "video", href: "#" },
      { title: "Panduan PDF: Portal Orang Tua", kind: "doc", href: "#" },
      { title: "FAQ Absensi & Nilai", kind: "link", href: "#" },
    ],
    guru: [
      { title: "Video: Input Nilai & Rapor", kind: "video", href: "#" },
      { title: "Template RPP & Bank Soal", kind: "doc", href: "#" },
      { title: "Best Practice Komunikasi", kind: "link", href: "#" },
    ],
    sekolah: [
      { title: "Checklist Implementasi 7 Hari", kind: "doc", href: "#" },
      { title: "Video: PPDB End-to-End", kind: "video", href: "#" },
      { title: "Contoh SOP & Kebijakan", kind: "link", href: "#" },
    ],
  };

  const faqs: Record<RoleKey, { q: string; a: string }[]> = {
    murid: [
      {
        q: "Lupa kata sandi?",
        a: "Gunakan tombol Lupa Password atau minta reset ke admin sekolah.",
      },
      {
        q: "Tidak lihat kelas?",
        a: "Pastikan tahun ajaran aktif & Anda sudah dimasukkan ke rombel.",
      },
    ],
    guru: [
      {
        q: "Nilai tidak muncul di rapor?",
        a: "Pastikan komponen penilaian lengkap & periode penilaian benar.",
      },
      {
        q: "Tidak bisa absen QR?",
        a: "Cek koneksi, izin kamera browser, atau gunakan opsi input manual.",
      },
    ],
    sekolah: [
      {
        q: "Payment gateway belum aktif?",
        a: "Lengkapi dokumen merchant & hubungi tim aktivasi kami.",
      },
      {
        q: "Ekspor PDF terlihat kosong?",
        a: "Periksa filter (kelas/semester) dan ulangi generate laporan.",
      },
    ],
  };

  /* ---------- small components ---------- */
  const RoleTabs = () => {
    const tabs: { key: RoleKey; label: string; icon: React.ElementType }[] = [
      { key: "murid", label: "Murid / Orang Tua", icon: GraduationCap },
      { key: "guru", label: "Guru", icon: Users },
      { key: "sekolah", label: "Sekolah / Admin", icon: Settings },
    ];
    return (
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setRole(t.key)}
            className="rounded-full px-4 py-2 text-sm ring-1 transition"
            style={{
              color: role === t.key ? theme.white1 : theme.black1,
              backgroundColor:
                role === t.key
                  ? theme.primary
                  : isDark
                    ? theme.white2
                    : "transparent",
              borderColor: role === t.key ? theme.primary : theme.white3,
            }}
          >
            <t.icon className="h-4 w-4 inline-block mr-2" />
            {t.label}
          </button>
        ))}
      </div>
    );
  };

  const StepItem = ({
    title,
    desc,
    Icon,
  }: {
    title: string;
    desc: string;
    Icon: React.ElementType;
  }) => (
    <div
      className="rounded-2xl p-4 border"
      style={{ backgroundColor: theme.white1, borderColor: theme.white3 }}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: theme.white2,
            border: `1px solid ${theme.white3}`,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold" style={{ color: theme.black1 }}>
            {title}
          </div>
          <div className="text-sm mt-1" style={{ color: theme.silver2 }}>
            {desc}
          </div>
        </div>
      </div>
    </div>
  );

  const ResourceCard = ({
    title,
    kind,
    href,
  }: {
    title: string;
    kind: "video" | "doc" | "link";
    href: string;
  }) => {
    const icon =
      kind === "video" ? PlayCircle : kind === "doc" ? FileText : LinkIcon;
    return (
      <a
        href={href}
        className="rounded-2xl p-4 border hover:shadow-sm transition block"
        style={{
          backgroundColor: theme.white1,
          borderColor: theme.white3,
          color: theme.black1,
        }}
      >
        <div className="flex items-start gap-3">
          {React.createElement(icon, { className: "h-5 w-5" })}
          <div className="text-sm font-medium">{title}</div>
        </div>
      </a>
    );
  };

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
        <WebsiteNavbar />
        <div style={{ height: "5.5rem" }} />

        {/* HERO */}
        <div className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=2400&auto=format&fit=crop"
            alt="Tutorial background"
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
                <PlayCircle className="h-3.5 w-3.5" /> Tutorial & Panduan Cepat
              </span>
              <h1
                className="mt-4 text-4xl md:text-5xl font-bold"
                style={{ color: theme.black1 }}
              >
                Mulai dengan Peran Anda
              </h1>
              <p className="mt-3" style={{ color: theme.silver2 }}>
                Ikuti langkah ringkas sesuai peran. Tersedia video singkat,
                panduan PDF, dan FAQ.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <a
                  href="#video"
                  className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm shadow-sm transition hover:shadow-md"
                  style={primaryBtn}
                >
                  <PlayCircle className="h-4 w-4" /> Lihat Video 3 Menit
                </a>
                <a
                  href="/website/hubungi-kami"
                  className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm transition"
                  style={{
                    color: theme.black1,
                    borderColor: theme.white3,
                    backgroundColor: isDark ? theme.white2 : "transparent",
                  }}
                >
                  <HelpCircle className="h-4 w-4" /> Butuh Bantuan?
                </a>
              </div>
            </div>
          </Section>
        </div>

        {/* ROLE TABS */}
        <Section className="py-8">
          <div className="flex items-center justify-center">
            <RoleTabs />
          </div>
        </Section>

        {/* QUICK START */}
        <Section id="quick-start" className="py-6 md:py-10">
          <header className="mb-6">
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{ color: theme.black1 }}
            >
              Langkah Cepat{" "}
              {role === "murid"
                ? "Murid/Ortu"
                : role === "guru"
                  ? "Guru"
                  : "Sekolah/Admin"}
            </h2>
            <p className="mt-2" style={{ color: theme.silver2 }}>
              5–6 langkah ringkas untuk langsung jalan.
            </p>
          </header>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps[role].map((s) => (
              <StepItem
                key={s.title}
                title={s.title}
                desc={s.desc}
                Icon={s.icon}
              />
            ))}
          </div>
        </Section>

        {/* RESOURCES */}
        <Section id="resources" className="py-10 md:py-14">
          <header className="mb-6">
            <h3
              className="text-xl md:text-2xl font-bold"
              style={{ color: theme.black1 }}
            >
              Materi & Sumber Daya
            </h3>
          </header>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources[role].map((r) => (
              <ResourceCard
                key={r.title}
                title={r.title}
                kind={r.kind}
                href={r.href}
              />
            ))}
          </div>
          <div className="mt-6">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm transition"
              style={{
                color: theme.black1,
                borderColor: theme.white3,
                backgroundColor: isDark ? theme.white2 : "transparent",
              }}
            >
              <FileText className="h-4 w-4" /> Unduh Panduan Lengkap (PDF)
            </a>
          </div>
        </Section>

        {/* VIDEO STRIP */}
        <Section id="video" className="py-10">
          <div
            className="rounded-3xl border p-4 md:p-6"
            style={{ backgroundColor: theme.white2, borderColor: theme.white3 }}
          >
            <div className="grid lg:grid-cols-2 gap-6 items-center">
              <div
                className="aspect-video rounded-2xl overflow-hidden border"
                style={{
                  borderColor: theme.white3,
                  backgroundColor: theme.white1,
                }}
              >
                {/* Ganti src embed YouTube/Vimeo jika ada */}
                <div
                  className="h-full w-full flex items-center justify-center text-sm"
                  style={{ color: theme.silver2 }}
                >
                  Preview Video Tutorial (tempel embed di sini)
                </div>
              </div>
              <div>
                <h3
                  className="text-xl md:text-2xl font-bold"
                  style={{ color: theme.black1 }}
                >
                  Video Ringkas sesuai Peran
                </h3>
                <p className="mt-2 text-sm" style={{ color: theme.silver2 }}>
                  Tonton alur utama: login, navigasi menu, dan tugas harian.
                  Durasi ±3 menit.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href="#"
                    className="rounded-full px-4 py-2 text-sm ring-1"
                    style={{ borderColor: theme.white3, color: theme.black1 }}
                  >
                    Murid/Ortu
                  </a>
                  <a
                    href="#"
                    className="rounded-full px-4 py-2 text-sm ring-1"
                    style={{ borderColor: theme.white3, color: theme.black1 }}
                  >
                    Guru
                  </a>
                  <a
                    href="#"
                    className="rounded-full px-4 py-2 text-sm ring-1"
                    style={{ borderColor: theme.white3, color: theme.black1 }}
                  >
                    Sekolah/Admin
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" className="py-12 md:py-16">
          <header className="mb-8">
            <h3
              className="text-xl md:text-2xl font-bold"
              style={{ color: theme.black1 }}
            >
              FAQ –{" "}
              {role === "murid"
                ? "Murid/Ortu"
                : role === "guru"
                  ? "Guru"
                  : "Sekolah/Admin"}
            </h3>
          </header>
          <div className="grid lg:grid-cols-2 gap-6">
            {faqs[role].map((f) => (
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

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/website/hubungi-kami"
              className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm shadow-sm transition hover:shadow-md"
              style={primaryBtn}
            >
              <HelpCircle className="h-4 w-4" /> Masih Bingung? Hubungi Kami
            </a>
            <a
              href="/website/fitur"
              className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm transition"
              style={{
                color: theme.black1,
                borderColor: theme.white3,
                backgroundColor: isDark ? theme.white2 : "transparent",
              }}
            >
              <ChevronRight className="h-4 w-4" /> Jelajahi Semua Fitur
            </a>
          </div>
        </Section>

        <WebsiteFooter />
      </div>
    </FullBleed>
  );
}
