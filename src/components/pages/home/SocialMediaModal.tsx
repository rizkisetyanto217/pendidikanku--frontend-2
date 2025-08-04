// components/modals/SocialMediaModal.tsx
import React, { useEffect, useRef } from "react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { X } from "lucide-react";


interface SocialMediaModalProps {
  show: boolean;
  onClose: () => void;
  data: {
    instagram?: string;
    whatsapp?: string;
    youtube?: string;
    facebook?: string;
    tiktok?: string;
  };
}

export default function SocialMediaModal({
  show,
  onClose,
  data,
}: SocialMediaModalProps) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, onClose]);

  if (!show) return null;

  const items = [
    { key: "instagram", label: "Instagram", prefix: "https://instagram.com/" },
    { key: "whatsapp", label: "WhatsApp", prefix: "https://wa.me/" },
    { key: "youtube", label: "YouTube", prefix: "" },
    { key: "facebook", label: "Facebook", prefix: "https://facebook.com/" },
    { key: "tiktok", label: "TikTok", prefix: "https://tiktok.com/@" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="w-full max-w-xl rounded-lg p-6 relative"
        style={{
          backgroundColor: theme.white1,
          color: theme.black1,
          border: `1px solid ${theme.silver1}`,
        }}
      >
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
          style={{ color: theme.silver2 }}
        >
          <X size={22} />
        </button>

        {/* Judul */}
        <h2 className="text-lg font-semibold mb-5">Sosial Media Masjid</h2>

        {/* Daftar Link Sosmed */}
        <div className="space-y-3">
          {items.map((item) => {
            const value = data[item.key as keyof typeof data];
            if (!value) return null;

            const isFullUrl = value.startsWith("http");
            const href = isFullUrl ? value : `${item.prefix}${value}`;

            return (
              <a
                key={item.key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-5 py-3 rounded text-base font-medium text-center transition-all"
                style={{
                  backgroundColor: theme.white2,
                  color: theme.black1,
                  border: `1px solid ${theme.silver1}`,
                }}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Tombol Tutup Bawah */}
        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="text-base px-5 py-2 rounded"
            style={{ color: theme.silver2 }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
