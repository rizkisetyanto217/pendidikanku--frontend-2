import React, { useEffect, useRef } from "react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { X } from "lucide-react";

interface SocialMediaModalProps {
  show: boolean;
  onClose: () => void;
  data: {
    masjid_instagram_url?: string;
    masjid_whatsapp_url?: string;
    masjid_youtube_url?: string;
    masjid_facebook_url?: string;
    masjid_tiktok_url?: string;
    // ✅ tambahkan ini
    masjid_whatsapp_group_ikhwan_url?: string;
    masjid_whatsapp_group_akhwat_url?: string;
  };
}

type ItemConf = {
  key: keyof SocialMediaModalProps["data"];
  label: string;
  prefix?: string;
  iconSrc: string;
  normalize?: (v: string) => string;
  // ✅ untuk kasus khusus (WhatsApp group)
  customHref?: (raw: string) => string;
};

/* --- fungsi biasa: aman untuk hooks order --- */
function toHref(conf: ItemConf, rawValue: string) {
  const v = conf.normalize ? conf.normalize(rawValue.trim()) : rawValue.trim();
  const isURL = /^https?:\/\//i.test(v);
  if (isURL) return v;
  if (conf.customHref) return conf.customHref(v);
  if (conf.prefix) return `${conf.prefix}${v}`;
  return `https://${v}`;
}

export default function SocialMediaModal({
  show,
  onClose,
  data,
}: SocialMediaModalProps) {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const modalRef = useRef<HTMLDivElement>(null);

  const items: ItemConf[] = [
    {
      key: "masjid_instagram_url",
      label: "Instagram",
      prefix: "https://instagram.com/",
      iconSrc: "/icons/instagram.svg",
      normalize: (v) => v.replace(/^@/, ""),
    },
    {
      key: "masjid_whatsapp_url",
      label: "WhatsApp",
      prefix: "https://wa.me/",
      iconSrc: "/icons/whatsapp.svg",
      normalize: (v) => v.replace(/[^\d]/g, "").replace(/^0/, "62"),
    },
    {
      key: "masjid_youtube_url",
      label: "YouTube",
      iconSrc: "/icons/youtube.svg",
    },
    {
      key: "masjid_facebook_url",
      label: "Facebook",
      prefix: "https://facebook.com/",
      iconSrc: "/icons/facebook.svg",
    },
    {
      key: "masjid_tiktok_url",
      label: "TikTok",
      prefix: "https://tiktok.com/@",
      iconSrc: "/icons/tiktok.svg",
      normalize: (v) => v.replace(/^@/, ""),
    },

    // ✅ Grup WhatsApp Ikhwan
    {
      key: "masjid_whatsapp_group_ikhwan_url",
      label: "Grup WhatsApp Ikhwan",
      iconSrc: "/icons/whatsapp.svg",
      customHref: (v) =>
        /^https?:\/\//i.test(v) ? v : `https://chat.whatsapp.com/${v}`,
    },
    // ✅ Grup WhatsApp Akhwat
    {
      key: "masjid_whatsapp_group_akhwat_url",
      label: "Grup WhatsApp Akhwat",
      iconSrc: "/icons/whatsapp.svg",
      customHref: (v) =>
        /^https?:\/\//i.test(v) ? v : `https://chat.whatsapp.com/${v}`,
    },
  ];

  // Tutup saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node))
        onClose();
    };
    if (show) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, onClose]);

  // Tutup saat ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (show) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Sosial Media Masjid"
    >
      <div
        ref={modalRef}
        className="w-full max-w-xl rounded-lg p-6 relative"
        style={{
          backgroundColor: theme.white1,
          color: theme.black1,
          border: `1px solid ${theme.silver1}`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded p-1 hover:opacity-80 transition"
          aria-label="Tutup"
          title="Tutup"
          style={{ color: theme.silver2 }}
        >
          <X size={22} />
        </button>

        <h2 className="text-lg font-semibold mb-5">Sosial Media Masjid</h2>

        <div className="space-y-3">
          {items.map((item) => {
            const raw = data[item.key];
            if (!raw || !raw.trim()) return null;
            const href = toHref(item, raw);

            return (
              <a
                key={item.key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3 rounded text-base font-medium transition-all"
                style={{
                  backgroundColor: theme.white2,
                  color: theme.black1,
                  border: `1px solid ${theme.silver1}`,
                }}
              >
                <img
                  src={item.iconSrc}
                  alt=""
                  aria-hidden="true"
                  className="w-5 h-5"
                />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="text-base px-5 py-2 rounded hover:opacity-80 transition"
            style={{ color: theme.silver2 }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
