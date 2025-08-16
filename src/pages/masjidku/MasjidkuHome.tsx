import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import CartLink from "@/components/common/main/CardLink";
import ShimmerImage from "@/components/common/main/ShimmerImage";
import SocialMediaModal from "@/components/pages/home/SocialMediaModal";
import {
  MapPin,
  BookOpen,
  CreditCard,
  FileText,
  Phone,
  Share2,
  X,
  Copy,
  MessageCircle,
} from "lucide-react";
import SholatScheduleCard from "@/components/pages/home/SholatSchedule";
import MasjidkuHomePrayerCard from "@/components/pages/home/MasjidkuHomePrayerCard";

export default function MasjidkuHome() {
  const { slug } = useParams();
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const masjidku = {
    masjidku_name: "MasjidKu",
    masjidku_description:
      "Lembaga untuk Digitalisasi Masjid dan Lembaga Islam Indonesia",
    masjidku_image_url: "/image/Gambar-Masjid.jpeg",
    masjidku_instagram_url: "https://instagram.com/masjidbaitussalam",
    masjidku_whatsapp_url: "https://wa.me/6281234567890",
    masjidku_youtube_url: "https://youtube.com/@masjidbaitussalam",
  };

  const shareUrl = useMemo(
    () => (typeof window !== "undefined" ? window.location.href : ""),
    []
  );

  const shareText = useMemo(
    () =>
      `${masjidku.masjidku_name} — ${masjidku.masjidku_description}\n${shareUrl}`,
    [masjidku.masjidku_name, masjidku.masjidku_description, shareUrl]
  );

  // Handler untuk membuka WhatsApp dengan nomor langsung
  const handleWhatsAppContact = () => {
    const phoneNumber = "6281234567890"; // nomor tanpa +
    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      // Untuk mobile, coba buka app WhatsApp dulu
      try {
        window.location.href = `whatsapp://send?phone=${phoneNumber}`;
      } catch (error) {
        // Fallback ke WhatsApp Web
        window.open(
          `https://web.whatsapp.com/send?phone=${phoneNumber}`,
          "_blank"
        );
      }
    } else {
      // Untuk desktop, langsung ke WhatsApp Web
      window.open(
        `https://web.whatsapp.com/send?phone=${phoneNumber}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  // Handler untuk share via WhatsApp
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(shareText);
    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      // Untuk mobile, coba buka app WhatsApp dulu
      try {
        window.location.href = `whatsapp://send?text=${text}`;
      } catch (error) {
        // Fallback ke WhatsApp Web
        window.open(`https://web.whatsapp.com/send?text=${text}`, "_blank");
      }
    } else {
      // Untuk desktop, langsung ke WhatsApp Web
      window.open(
        `https://web.whatsapp.com/send?text=${text}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const robustCopy = async (text: string) => {
    try {
      // Cek apakah browser mendukung clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      console.warn("Clipboard API gagal:", error);
    }

    // Fallback method untuk browser lama
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-999999px";
      textarea.style.top = "-999999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const success = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (success) {
        return true;
      }
    } catch (error) {
      console.warn("Fallback copy gagal:", error);
    }

    // Jika semua method gagal, tampilkan prompt
    try {
      const result = window.prompt(
        "Tidak dapat menyalin otomatis. Silakan salin teks berikut:",
        text
      );
      return result !== null; // User menekan OK
    } catch (error) {
      console.error("Prompt copy gagal:", error);
      return false;
    }
  };

  const handleCopyText = async () => {
    const success = await robustCopy(shareText);
    if (success) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    const success = await robustCopy(shareUrl);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // UX: lock scroll + esc to close modal
  useEffect(() => {
    if (!openShare) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setOpenShare(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [openShare]);

  return (
    <>
      <PublicNavbar masjidName="MasjidKu ini" showLogin={false} />

      <div className="pt-20"></div>
      <MasjidkuHomePrayerCard location="DKI Jakarta" slug={slug || ""} />

      <div className="w-full max-w-2xl mx-auto min-h-screen pb-28 pt-8">
        <div className="flex flex-col items-center text-center">
          <ShimmerImage
            src="/image/Gambar-Masjid.jpeg"
            alt="Foto Masjid"
            className="w-32 h-32 rounded-full object-cover mb-4"
          />

          <h1 className="text-xl font-semibold" style={{ color: theme.black1 }}>
            {masjidku.masjidku_name}
          </h1>
          <p className="text-sm mt-1 mb-2" style={{ color: theme.black2 }}>
            {masjidku.masjidku_description}
          </p>

          {/* CTA: WhatsApp + Bagikan (modal) */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleWhatsAppContact}
              className="inline-flex items-center justify-center rounded-full p-2 hover:opacity-90 transition"
              style={{ backgroundColor: theme.success1 }}
              aria-label="Hubungi via WhatsApp"
            >
              <img
                src="/icons/whatsapp.svg"
                alt="WhatsApp"
                className="w-5 h-5"
                style={{
                  filter: isDark ? "" : "none",
                }}
              />
            </button>

            <button
              onClick={() => setOpenShare(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-90 transition"
              style={{ backgroundColor: theme.primary, color: theme.white1 }}
              aria-label="Bagikan halaman ini"
            >
              <Share2 size={16} />
              <span>Bagikan</span>
            </button>
          </div>

          <div className="w-full mt-6 space-y-3">
            <CartLink
              label="Profil Kami"
              icon={<MapPin size={18} />}
              href="/profil"
            />
            <CartLink
              label="Masjid yang telah bekerjasama"
              icon={<BookOpen size={18} />}
              href="/masjid"
            />
            <CartLink
              label="Ikut Program Digitalisasi 100 Masjid"
              icon={<CreditCard size={18} />}
              href="/program"
            />
            <CartLink
              label="Laporan Keuangan"
              icon={<FileText size={18} />}
              href="/finansial"
            />
            <CartLink
              label="Kontak Kami"
              icon={<Phone size={18} />}
              onClick={() => setShowSocialModal(true)}
            />
          </div>
        </div>
      </div>

      {/* ===== Modal Bagikan ===== */}
      {openShare && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          {/* overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(2px)",
            }}
            onClick={() => setOpenShare(false)}
          />
          {/* dialog */}
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-[92%] max-w-md rounded-xl p-4 ring-1 shadow-lg space-y-3"
            style={{
              backgroundColor: theme.white1,
              borderColor: theme.white3,
              color: theme.black1,
            }}
          >
            <div className="flex items-center justify-between">
              <h3
                className="text-base font-semibold"
                style={{ color: theme.primary }}
              >
                Bagikan Halaman Ini
              </h3>
              <button
                onClick={() => setOpenShare(false)}
                className="p-1 rounded hover:opacity-80"
                aria-label="Tutup modal"
                style={{ color: theme.black1 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* preview teks */}
            <div
              className="rounded-md p-3 text-sm ring-1 max-h-60 overflow-auto whitespace-pre-wrap"
              style={{
                backgroundColor: theme.white2,
                borderColor: theme.white3,
                color: theme.black1,
              }}
            >
              {shareText}
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyText}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium hover:opacity-90 transition"
                style={{ backgroundColor: theme.primary, color: theme.white1 }}
              >
                <Copy size={16} />
                <span>{copiedText ? "Teks Tersalin!" : "Salin Teks"}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium ring-1 hover:opacity-90 transition"
                style={{
                  backgroundColor: theme.white2,
                  color: theme.black1,
                  borderColor: theme.white3,
                }}
              >
                <Copy size={16} />
                <span>{copiedLink ? "Link Tersalin!" : "Salin Link"}</span>
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium hover:opacity-90 transition"
                style={{
                  backgroundColor: theme.secondary,
                  color: theme.white1,
                }}
              >
                <MessageCircle size={16} />
                <span>Bagikan via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal sosmed */}
      {/* {showSocialModal && (
        <SocialMediaModal
          show={showSocialModal}
          onClose={() => setShowSocialModal(false)}
          instagramUrl={masjidku.masjidku_instagram_url}
          youtubeUrl={masjidku.masjidku_youtube_url}
          whatsappUrl={masjidku.masjidku_whatsapp_url}
        />
      )} */}
    </>
  );
}
