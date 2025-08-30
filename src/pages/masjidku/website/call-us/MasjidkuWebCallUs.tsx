// src/pages/ContactUs.tsx
import React, { useMemo } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  Instagram,
  Youtube,
  Facebook,
} from "lucide-react";
import WebsiteNavbar from "@/components/common/public/WebsiteNavbar";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import WebsiteFooter from "../components/MasjidkuWebFooter";

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

export default function MasjidkuWebCallUs() {
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
        {/* Navbar */}
        <WebsiteNavbar />
        <div style={{ height: "5.5rem" }} />

        {/* Hero */}
        <div className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1544717305-996b815c338c?q=80&w=2400&auto=format&fit=crop"
            alt="Hero background"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: 0.14 }}
            loading="eager"
          />
          <Section className="relative py-14 sm:py-20 lg:py-24">
            <div className="text-center max-w-3xl mx-auto">
              <h1
                className="text-4xl md:text-5xl font-bold"
                style={{ color: theme.black1 }}
              >
                Hubungi Kami
              </h1>
              <p className="mt-3" style={{ color: theme.silver2 }}>
                Tim SekolahIslamku siap membantu. Pilih kanal komunikasi yang
                paling nyaman untuk Anda.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <a
                  href="tel:+6281234567890"
                  className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm shadow-sm transition hover:shadow-md"
                  style={primaryBtn}
                >
                  <Phone className="h-4 w-4" /> Telepon Sekarang
                </a>
                <a
                  href="mailto:sales@sekolahislamku.id"
                  className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm transition"
                  style={{
                    color: theme.black1,
                    borderColor: theme.white3,
                    backgroundColor: isDark ? theme.white2 : "transparent",
                  }}
                >
                  <Mail className="h-4 w-4" /> Kirim Email
                </a>
              </div>
            </div>
          </Section>
        </div>

        {/* Content */}
        <Section className="py-12 md:py-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cards */}
            <div className="lg:col-span-1 space-y-4">
              {[
                {
                  icon: <Phone className="h-5 w-5" />,
                  title: "Telepon",
                  value: "+62 812-3456-7890",
                  href: "tel:+6281234567890",
                },
                {
                  icon: <Mail className="h-5 w-5" />,
                  title: "Email",
                  value: "sales@sekolahislamku.id",
                  href: "mailto:sales@sekolahislamku.id",
                },
                {
                  icon: <MapPin className="h-5 w-5" />,
                  title: "Alamat",
                  value: "Jl. Pendidikan No. 123, Indonesia",
                },
                {
                  icon: <Clock className="h-5 w-5" />,
                  title: "Jam Operasional",
                  value: "Senin–Jumat 09.00–17.00 WIB",
                },
              ].map((c, idx) => (
                <a
                  key={idx}
                  href={(c as any).href}
                  className="block rounded-2xl p-4 border hover:shadow-sm transition"
                  style={{
                    backgroundColor: theme.white1,
                    borderColor: theme.white3,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{c.icon}</div>
                    <div>
                      <div
                        className="font-semibold"
                        style={{ color: theme.black1 }}
                      >
                        {c.title}
                      </div>
                      <div className="text-sm" style={{ color: theme.silver2 }}>
                        {c.value}
                      </div>
                    </div>
                  </div>
                </a>
              ))}

              {/* Socials */}
              <div
                className="rounded-2xl p-4 border"
                style={{
                  backgroundColor: theme.white1,
                  borderColor: theme.white3,
                }}
              >
                <div
                  className="font-semibold mb-3"
                  style={{ color: theme.black1 }}
                >
                  Ikuti Kami
                </div>
                <div
                  className="flex items-center gap-3"
                  style={{ color: theme.silver2 }}
                >
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
            </div>

            {/* Form + Map */}
            <div className="lg:col-span-2 space-y-8">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="rounded-3xl border p-6 md:p-8"
                style={{
                  backgroundColor: theme.white1,
                  borderColor: theme.white3,
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5" />
                  <div
                    className="font-semibold"
                    style={{ color: theme.black1 }}
                  >
                    Kirim Pesan
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs" style={{ color: theme.silver2 }}>
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
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
                      Subjek
                    </label>
                    <input
                      type="text"
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
                      Pesan
                    </label>
                    <textarea
                      required
                      rows={5}
                      className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2"
                      style={{
                        backgroundColor: theme.white1,
                        borderColor: theme.white3,
                        color: theme.black1,
                      }}
                    />
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <button
                    className="inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm shadow-sm transition hover:shadow-md"
                    style={primaryBtn}
                  >
                    <Send className="h-4 w-4" /> Kirim Pesan
                  </button>
                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline"
                    style={{ color: theme.black1 }}
                  >
                    atau chat via WhatsApp
                  </a>
                </div>
              </form>

              <div
                className="rounded-3xl border overflow-hidden"
                style={{
                  borderColor: theme.white3,
                  backgroundColor: theme.white1,
                }}
              >
                {/* Map placeholder (ganti dengan embed map sekolah jika sudah ada) */}
                <img
                  src="https://images.unsplash.com/photo-1496568816309-51d7c20e2b18?q=80&w=1600&auto=format&fit=crop"
                  alt="Lokasi kantor"
                  className="w-full h-72 object-cover"
                  loading="lazy"
                />
                <div className="p-4 text-sm" style={{ color: theme.silver2 }}>
                  *Silakan ganti gambar ini dengan embed peta lokasi
                  sekolah/kantor Anda.
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* FOOTER */}
        <WebsiteFooter />
      </div>
    </FullBleed>
  );
}
