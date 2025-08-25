// src/pages/SekolahIslamkuRegister.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  BookOpen,
  Calendar,
  ArrowRight,
  PlayCircle,
  X,
} from "lucide-react";
import WebsiteNavbar from "@/components/common/public/WebsiteNavbar";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import WebsiteFooter from "../components/MasjidkuWebFooter";

/* Helpers layout */
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

/* Intro Modal */
const IntroModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
}> = ({ open, onClose, onProceed }) => {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const [agree, setAgree] = useState(false);

  // lock scroll + esc
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(3px)",
        }}
        onClick={onClose}
      />
      {/* dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-[92%] max-w-2xl rounded-3xl p-5 ring-1 shadow-xl"
        style={{
          backgroundColor: theme.white1,
          borderColor: theme.white3,
          color: theme.black1,
        }}
      >
        {/* close */}
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-3 right-3 p-2 rounded-xl transition hover:opacity-80"
          style={{ color: theme.black1 }}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className="h-11 w-11 rounded-2xl grid place-items-center shrink-0"
            style={{ backgroundColor: theme.primary2, color: theme.primary }}
          >
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-bold">
              Selamat Datang di SekolahIslamku Suite
            </h3>
            <p className="mt-1 text-sm" style={{ color: theme.silver2 }}>
              Platform end-to-end untuk digitalisasi sekolah:{" "}
              <strong>PPDB</strong>, <strong>Akademik</strong>,{" "}
              <strong>Absensi</strong>, <strong>Keuangan</strong>, hingga{" "}
              <strong>Komunikasi</strong> orang tua—terpusat dan aman.
            </p>

            <div className="mt-4 grid sm:grid-cols-3 gap-2">
              {[
                { icon: Users, text: "PPDB Online" },
                { icon: BookOpen, text: "Rapor Digital" },
                { icon: Calendar, text: "Jadwal & Presensi" },
              ].map((x) => (
                <div
                  key={x.text}
                  className="rounded-2xl px-3 py-2 ring-1 text-sm flex items-center gap-2"
                  style={{
                    borderColor: theme.white3,
                    backgroundColor: theme.white2,
                  }}
                >
                  <x.icon className="h-4 w-4" />
                  {x.text}
                </div>
              ))}
            </div>

            {/* consent */}
            <label className="mt-4 flex items-start gap-2 text-sm select-none">
              <input
                type="checkbox"
                className="mt-1"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span style={{ color: theme.black1 }}>
                Saya telah membaca & menyetujui{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Ketentuan Layanan
                </a>{" "}
                dan{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Kebijakan Privasi
                </a>
                .
              </span>
            </label>

            {/* actions */}
            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <button
                disabled={!agree}
                onClick={onProceed}
                className="inline-flex items-center justify-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm shadow-sm transition hover:shadow-md disabled:opacity-60"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.white1,
                  borderColor: theme.primary,
                }}
              >
                <ArrowRight className="h-4 w-4" />
                Lanjut ke Login/Register
              </button>
              <a
                href="/demo"
                className="inline-flex items-center justify-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm transition hover:opacity-90"
                style={{
                  color: theme.black1,
                  borderColor: theme.white3,
                  backgroundColor: isDark ? theme.white2 : "transparent",
                }}
              >
                <PlayCircle className="h-4 w-4" />
                Lihat Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* PAGE: Intro only → redirect to login/register */
export default function MasjidkuRegisterNow() {
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const bg = useMemo(
    () =>
      isDark
        ? `linear-gradient(180deg, ${theme.white1} 0%, ${theme.white2} 100%)`
        : `linear-gradient(180deg, ${theme.white2} 0%, ${theme.white1} 100%)`,
    [isDark, theme]
  );

  const proceed = () => {
    // arahkan ke halaman login/register milikmu
    // ganti ke route yang kamu pakai (mis. "/auth/register" atau "/login?tab=register")
    navigate("/login?register=1");
  };

  // modal selalu tampil saat halaman dibuka
  const [open, setOpen] = useState(true);

  return (
    <FullBleed>
      <div
        className="min-h-screen w-screen overflow-x-hidden"
        style={{ background: bg, color: theme.black1 }}
      >
        <WebsiteNavbar />
        <div style={{ height: "5.5rem" }} />

        {/* Background hero halus (tanpa form) */}
        <div className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=2400&auto=format&fit=crop"
            alt="Sekolah digital"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: isDark ? 0.22 : 0.18 }}
            loading="eager"
          />
          <Section className="relative py-20 sm:py-24 lg:py-28">
            <div className="max-w-3xl">
              <h1
                className="text-4xl md:text-5xl font-bold"
                style={{ color: theme.black1 }}
              >
                Mulai Digitalisasi Sekolah Anda
              </h1>
              <p
                className="mt-3 text-sm md:text-base"
                style={{ color: theme.silver2 }}
              >
                Halaman ini hanya pengantar. Klik <strong>Lanjut</strong> di
                modal untuk menuju halaman <em>login/register</em>, lalu
                selesaikan pendaftaran di sana.
              </p>
              <button
                onClick={() => setOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-full ring-1 px-5 py-2.5 text-sm shadow-sm transition hover:shadow-md"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.white1,
                  borderColor: theme.primary,
                }}
              >
                <ArrowRight className="h-4 w-4" />
                Buka Modal Perkenalan
              </button>
            </div>
          </Section>
        </div>

        {/* Modal Intro */}
        <IntroModal
          open={open}
          onClose={() => setOpen(false)}
          onProceed={proceed}
        />

        {/* FOOTER */}
        <WebsiteFooter />
      </div>
    </FullBleed>
  );
}
