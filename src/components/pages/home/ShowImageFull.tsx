// components/common/main/ShowImageFull.tsx
import React from "react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

interface ShowImageFullProps {
  url: string;
  onClose: () => void;
}

export default function ShowImageFull({ url, onClose }: ShowImageFullProps) {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: isDark ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.7)",
      }}
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={decodeURIComponent(url)}
          alt="Full Size"
          className="w-full h-auto rounded-lg shadow-lg"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 px-3 py-1 rounded text-sm font-medium shadow transition"
          style={{
            backgroundColor: theme.white1,
            color: theme.black1,
            border: `1px solid ${theme.silver1}`,
          }}
        >
          ✕ Tutup
        </button>
      </div>
    </div>
  );
}
