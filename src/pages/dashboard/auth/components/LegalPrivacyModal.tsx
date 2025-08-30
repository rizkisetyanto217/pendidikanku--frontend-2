import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

export type LegalModalProps = {
  open: boolean;
  onClose: () => void;
  /** Tab awal yang dibuka */
  initialTab?: "tos" | "privacy";
  /** Tanggal pembaruan */
  lastUpdated?: string;
  /** Tampilkan tombol “Saya Setuju” */
  showAccept?: boolean;
  /** Callback saat klik “Saya Setuju” */
  onAccept?: () => void;
  /** Override konten default (opsional) */
  termsContent?: React.ReactNode;
  privacyContent?: React.ReactNode;
};

export default function LegalModal({
  open,
  onClose,
  initialTab = "tos",
  lastUpdated = "25 Agustus 2025",
  showAccept = false,
  onAccept,
  termsContent,
  privacyContent,
}: LegalModalProps) {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const [tab, setTab] = useState<"tos" | "privacy">(initialTab);
  useEffect(() => setTab(initialTab), [initialTab, open]);

  // close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const panelRef = useRef<HTMLDivElement>(null);
  const styles = useMemo(
    () => ({
      overlay: {
        backgroundColor: isDark ? "#00000088" : "#00000066",
      },
      panel: {
        backgroundColor: theme.white1,
        borderColor: theme.white3,
        color: theme.black1,
      },
      muted: { color: theme.silver2 },
      tabBase: "px-3 py-1.5 rounded-full text-sm font-medium transition border",
    }),
    [theme, isDark]
  );

  if (!open) return null;

  const DefaultTerms = () => (
    <div
      className="space-y-3 text-sm leading-relaxed"
      style={{ color: theme.black1 }}
    >
      <p>
        Selamat datang di <strong>SekolahIslamku Suite</strong>. Dengan
        menggunakan layanan ini, Anda menyetujui Syarat & Ketentuan berikut.
      </p>
      <ol className="list-decimal pl-5 space-y-2">
        <li>
          <strong>Akun & Keamanan.</strong> Anda bertanggung jawab atas
          kerahasiaan kredensial dan seluruh aktivitas pada akun Anda.
        </li>
        <li>
          <strong>Penggunaan yang Wajar.</strong> Layanan digunakan sesuai
          ketentuan sekolah dan hukum yang berlaku. Larangan penyalahgunaan,
          spam, atau akses tidak sah.
        </li>
        <li>
          <strong>Konten & Data.</strong> Data milik institusi tetap menjadi
          milik institusi; kami mengelolanya sesuai kebijakan privasi.
        </li>
        <li>
          <strong>Layanan.</strong> Fitur dapat berubah/ditingkatkan dari waktu
          ke waktu untuk perbaikan layanan.
        </li>
        <li>
          <strong>Penutup.</strong> Pelanggaran berat dapat berakibat pembatasan
          atau penghentian akses.
        </li>
      </ol>
      <p className="pt-2" style={styles.muted}>
        Versi ringkas. Versi lengkap tersedia atas permintaan institusi Anda.
      </p>
    </div>
  );

  const DefaultPrivacy = () => (
    <div
      className="space-y-3 text-sm leading-relaxed"
      style={{ color: theme.black1 }}
    >
      <p>
        Kebijakan Privasi ini menjelaskan bagaimana kami menangani informasi
        pribadi pengguna platform.
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>Pengumpulan Data:</strong> nama, email/username, peran,
          aktivitas pembelajaran/administrasi yang relevan.
        </li>
        <li>
          <strong>Penggunaan:</strong> operasional platform, dukungan, analitik
          agregat untuk peningkatan layanan.
        </li>
        <li>
          <strong>Berbagi:</strong> tidak dijual; dapat dibagikan dengan mitra
          pemroses data yang mematuhi perjanjian kerahasiaan.
        </li>
        <li>
          <strong>Keamanan:</strong> enkripsi, kontrol akses berbasis peran,
          audit log.
        </li>
        <li>
          <strong>Hak Anda:</strong> akses, koreksi, atau penghapusan sesuai
          kebijakan institusi dan peraturan yang berlaku.
        </li>
      </ul>
      <p className="pt-2" style={styles.muted}>
        Untuk permintaan data, hubungi admin sekolah atau tim dukungan kami.
      </p>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="legal-title"
      style={styles.overlay}
      onClick={(e) => {
        // close only if clicking backdrop (not panel)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="w-full max-w-3xl rounded-2xl border shadow-xl overflow-hidden"
        style={styles.panel}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: theme.white3 }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" style={{ color: theme.primary }} />
            <h2 id="legal-title" className="text-base font-semibold">
              Kebijakan Layanan
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 rounded-lg hover:opacity-80"
            style={{ color: theme.silver2 }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-4 flex items-center gap-2">
          <button
            className={`${styles.tabBase} ${
              tab === "tos" ? "border-transparent" : "bg-transparent"
            }`}
            onClick={() => setTab("tos")}
            style={{
              backgroundColor: tab === "tos" ? theme.primary : "transparent",
              color: tab === "tos" ? theme.white1 : theme.black1,
              borderColor: theme.white3,
            }}
          >
            Syarat & Ketentuan
          </button>
          <button
            className={`${styles.tabBase} ${
              tab === "privacy" ? "border-transparent" : "bg-transparent"
            }`}
            onClick={() => setTab("privacy")}
            style={{
              backgroundColor:
                tab === "privacy" ? theme.primary : "transparent",
              color: tab === "privacy" ? theme.white1 : theme.black1,
              borderColor: theme.white3,
            }}
          >
            Kebijakan Privasi
          </button>

          <span className="ml-auto text-xs" style={styles.muted}>
            Diperbarui: {lastUpdated}
          </span>
        </div>

        {/* Body */}
        <div
          className="px-5 pb-5 pt-4 max-h-[70vh] overflow-y-auto space-y-4"
          style={{ scrollbarWidth: "thin" as any }}
        >
          {tab === "tos"
            ? (termsContent ?? <DefaultTerms />)
            : (privacyContent ?? <DefaultPrivacy />)}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 border-t flex items-center justify-end gap-2"
          style={{ borderColor: theme.white3 }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border"
            style={{
              backgroundColor: isDark ? theme.white2 : theme.white1,
              color: theme.black1,
              borderColor: theme.white3,
            }}
          >
            Tutup
          </button>
          {showAccept && (
            <button
              onClick={onAccept}
              className="px-4 py-2 rounded-xl font-medium"
              style={{ backgroundColor: theme.primary, color: theme.white1 }}
            >
              Saya Setuju
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
