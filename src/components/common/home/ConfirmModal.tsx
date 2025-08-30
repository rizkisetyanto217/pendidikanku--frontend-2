import React from "react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi",
  message = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  confirmText = "Ya",
  cancelText = "Batal",
  isLoading = false,
}: ConfirmModalProps) {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div
        className="rounded-xl p-6 w-[90%] max-w-sm shadow-xl"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        <h2
          className="text-lg font-semibold mb-2"
          style={{ color: theme.black1 }}
        >
          {title}
        </h2>
        <p className="text-sm mb-4" style={{ color: theme.black2 }}>
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition"
            onClick={onClose}
            style={{
              backgroundColor: theme.white3,
              color: theme.black1,
            }}
          >
            {cancelText}
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              backgroundColor: theme.error1,
              color: theme.white1,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
