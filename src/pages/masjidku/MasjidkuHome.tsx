import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import CartLink from "@/components/common/main/CardLink";
import ShimmerImage from "@/components/common/main/ShimmerImage";
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
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import MasjidkuHomePrayerCard from "@/components/pages/home/MasjidkuHomePrayerCard";
import LinktreeNavbar from "@/components/common/public/LintreeNavbar";


/* =========================================================
   Helpers
========================================================= */
const isMobileUA = () =>
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

async function robustCopy(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-999999px";
    ta.style.top = "-999999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    if (ok) return true;
  } catch {}

  try {
    const result = window.prompt("Salin teks berikut:", text);
    return result !== null;
  } catch {
    return false;
  }
}

function openWhatsAppNumber(phoneDigits: string, message?: string) {
  const digits = phoneDigits.replace(/[^\d]/g, "");
  const txt = message ? `&text=${encodeURIComponent(message)}` : "";

  if (isMobileUA()) {
    // native app (fallback ke web jika gagal)
    const deep = `whatsapp://send?phone=${digits}${txt}`;
    try {
      window.location.href = deep;
    } catch {
      window.open(
        `https://web.whatsapp.com/send?phone=${digits}${txt}`,
        "_blank"
      );
    }
  } else {
    window.open(
      `https://web.whatsapp.com/send?phone=${digits}${txt}`,
      "_blank",
      "noopener,noreferrer"
    );
  }
}

async function shareViaNative(title: string, text: string, url: string) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/* =========================================================
   Component
========================================================= */
export default function MasjidkuHome() {
  const { slug } = useParams();
  const [openShare, setOpenShare] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  // Demo data — gantikan dari API jika sudah tersedia
  const masjidku = {
    masjidku_name: "MasjidKu",
    masjidku_description:
      "Lembaga untuk Digitalisasi Masjid dan Lembaga Islam Indonesia",
    masjidku_image_url: "/image/Gambar-Masjid.jpeg",
    masjidku_instagram_url: "https://instagram.com/masjidbaitussalam",
    masjidku_whatsapp_url: "https://wa.me/6281234567890",
    masjidku_youtube_url: "https://youtube.com/@masjidbaitussalam",
    // Optional
    masjidku_donation_url: "",
  };

  const shareUrl = useMemo(
    () => (typeof window !== "undefined" ? window.location.href : ""),
    []
  );

  const shareTitle = masjidku.masjidku_name;
  const shareText = useMemo(
    () => `${masjidku.masjidku_name} — ${masjidku.masjidku_description}`,
    [masjidku.masjidku_name, masjidku.masjidku_description]
  );

  // ====== Share handlers ======
  const onShareClick = async () => {
    const ok = await shareViaNative(shareTitle, shareText, shareUrl);
    if (!ok) setOpenShare(true);
  };

  const onShareCopyText = async () => {
    const ok = await robustCopy(`${shareText}\n${shareUrl}`);
    if (ok) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 1800);
    }
  };

  const onShareCopyLink = async () => {
    const ok = await robustCopy(shareUrl);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1800);
    }
  };

  const onShareViaWA = () => {
    const text = `${shareText}\n${shareUrl}`;
    if (isMobileUA()) {
      try {
        window.location.href = `whatsapp://send?text=${encodeURIComponent(text)}`;
      } catch {
        window.open(
          `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`,
          "_blank"
        );
      }
    } else {
      window.open(
        `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  // UX: lock scroll & ESC close ketika modal share terbuka
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
      <LinktreeNavbar
      // title={masjidku.masjidku_name}
      // subtitle={masjidku.masjidku_description}
      // coverOverlap
      // showBack
      // onShare={() => setOpenShare(true)} // kalau mau pakai modal share kamu sendiri
      />
      {/* ===== HERO ===== */}
      <section className="relative w-full mt-24">
        {/* cover */}
        <div className="h-44 sm:h-56 w-full overflow-hidden">
          <div
            className="h-full w-full bg-center bg-cover"
            style={{ backgroundImage: `url(${masjidku.masjidku_image_url})` }}
          />
        </div>
        {/* overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-transparent" />

        {/* avatar card — dark-mode aware */}
        <div className="max-w-2xl mx-auto px-4">
          <div className="-mt-10 sm:-mt-14 flex items-end gap-3">
            {/* bungkus gambar dengan border dinamis, bukan ring-white statis */}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 shadow-md"
              style={{
                borderColor: isDark ? theme.black1 : theme.white1, // terang di dark-mode, putih di light
                backgroundColor: isDark ? theme.white3 : theme.white1, // fallback bg kalau gambar belum load
              }}
            >
              <ShimmerImage
                src={masjidku.masjidku_image_url}
                alt="Logo / Foto Masjid"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="pb-1">
              <h1
                className="text-xl sm:text-2xl font-semibold drop-shadow"
                style={{
                  // teks terang di atas cover: gunakan warna terang di kedua mode
                  color: isDark ? theme.black1 : theme.black1,
                }}
              >
                {masjidku.masjidku_name}
              </h1>

              <p
                className="text-xs sm:text-sm line-clamp-2 drop-shadow"
                style={{
                  // sedikit lebih redup dari title
                  color: isDark ? theme.black2 : theme.black1,
                  opacity: 0.9,
                }}
              >
                {masjidku.masjidku_description}
              </p>
            </div>
          </div>
        </div>

        {/* quick actions */}
        <div className="max-w-2xl mx-auto px-4 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() =>
                openWhatsAppNumber(
                  "6281234567890",
                  `Assalamualaikum, saya ingin bertanya tentang kegiatan di ${masjidku.masjidku_name}.`
                )
              }
              className="flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium shadow-sm hover:shadow transition ring-1"
              style={{
                backgroundColor: theme.success1,
                color: theme.white1,
                borderColor: theme.success1,
              }}
            >
              <img src="/icons/whatsapp.svg" alt="WA" className="w-4 h-4" />
              WhatsApp
            </button>

            <button
              onClick={onShareClick}
              className="flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium shadow-sm hover:shadow transition ring-1"
              style={{
                backgroundColor: theme.primary,
                color: theme.white1,
                borderColor: theme.primary,
              }}
            >
              <Share2 size={16} /> Bagikan
            </button>

            <a
              href="/masjid"
              className="flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium shadow-sm hover:shadow transition ring-1"
              style={{
                backgroundColor: theme.white1,
                color: theme.black1,
                borderColor: theme.white3,
              }}
            >
              <ExternalLink size={16} /> Eksplor Masjid
            </a>

            <a
              href={masjidku.masjidku_instagram_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium shadow-sm hover:shadow transition ring-1"
              style={{
                backgroundColor: theme.white1,
                color: theme.black1,
                borderColor: theme.white3,
              }}
            >
              <img src="/icons/instagram.svg" alt="IG" className="w-4 h-4" /> IG
            </a>
          </div>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <main className="w-full max-w-2xl mx-auto pb-28 px-4">
        {/* spacing from navbar */}
        <div className="pt-6" />

        {/* Prayer schedule */}
        <MasjidkuHomePrayerCard location="DKI Jakarta" slug={slug || ""} />

        {/* Menu Utama */}
        <section className="mt-6">
          <h2
            className="text-lg font-semibold mb-3"
            style={{ color: theme.black1 }}
          >
            Menu Utama
          </h2>
          <div className="space-y-2">
            <CartLink
              label="Profil Kami"
              icon={<MapPin size={18} />}
              href="/profil"
            />
            <CartLink
              label="Website"
              icon={<MapPin size={18} />}
              href="/website"
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
              onClick={() => openWhatsAppNumber("6281234567890")}
            />
          </div>
        </section>

        {/* Optional: Donasi */}
        {masjidku.masjidku_donation_url && (
          <section className="mt-6">
            <a
              href={masjidku.masjidku_donation_url}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-between gap-3 rounded-xl px-4 py-3 ring-1 transition hover:shadow"
              style={{
                backgroundColor: theme.white1,
                borderColor: theme.white3,
                color: theme.black1,
              }}
            >
              <div className="flex items-center gap-3">
                <CreditCard size={18} />
                <div>
                  <div className="font-semibold">Dukung Program</div>
                  <div className="text-sm opacity-80">Klik untuk berdonasi</div>
                </div>
              </div>
              <ChevronRight size={18} />
            </a>
          </section>
        )}
      </main>

      {/* ===== SHARE MODAL ===== */}
      {openShare && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(2px)",
            }}
            onClick={() => setOpenShare(false)}
          />
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

            <div
              className="rounded-md p-3 text-sm ring-1 max-h-60 overflow-auto whitespace-pre-wrap"
              style={{
                backgroundColor: theme.white2,
                borderColor: theme.white3,
                color: theme.black1,
              }}
            >
              {shareText}\n{shareUrl}
            </div>

            <div className="space-y-2">
              <button
                onClick={onShareCopyText}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium hover:opacity-90 transition"
                style={{ backgroundColor: theme.primary, color: theme.white1 }}
              >
                <Copy size={16} />
                <span>{copiedText ? "Teks Tersalin!" : "Salin Teks"}</span>
              </button>

              <button
                onClick={onShareCopyLink}
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
                onClick={onShareViaWA}
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
    </>
  );
}
