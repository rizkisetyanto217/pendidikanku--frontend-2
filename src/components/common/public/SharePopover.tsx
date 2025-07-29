import React, { useRef, useEffect, useState } from "react";
import { Share } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

interface SharePopoverProps {
  title: string;
  url: string;
  position?: "left" | "right"; // default: right
  customClassName?: string;
  forceCustom?: boolean; // tambahan
}

export default function SharePopover({
  title,
  url,
  position = "right",
  customClassName = "",
  forceCustom = false,
}: SharePopoverProps) {
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (!forceCustom && navigator.share) {
      navigator.share({ title, url });
    } else {
      setShowMenu(!showMenu);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    alert("Link berhasil disalin!");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className={`relative ${customClassName}`} ref={ref}>
      <button
        onClick={handleClick}
        className="flex items-center space-x-1 text-sm"
        style={{ color: themeColors.quaternary }}
      >
        <Share size={16} />
        <span>Bagikan</span>
      </button>

      {showMenu && (
        <div
          className={`absolute z-50 mt-2 p-3 border rounded shadow w-64 ${
            position === "left" ? "left-0" : "right-0"
          }`}
          style={{
            backgroundColor: themeColors.white1,
            borderColor: themeColors.silver1,
            zIndex: 9999, // Penting!
          }}
        >
          <p className="text-xs mb-2" style={{ color: themeColors.black2 }}>
            Bagikan link:
          </p>

          <input
            type="text"
            readOnly
            value={url}
            className="w-full text-xs p-1 border rounded mb-2"
            style={{
              backgroundColor: themeColors.white3,
              borderColor: themeColors.silver1,
              color: themeColors.black1,
            }}
          />

          <div className="flex justify-between">
            <button
              onClick={handleCopy}
              className="text-sm font-semibold hover:underline"
              style={{ color: themeColors.success1 }}
            >
              Salin Link
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Assalamualaikum! Lihat ini yuk: ${title} — ${url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold hover:underline"
              style={{ color: themeColors.success1 }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
