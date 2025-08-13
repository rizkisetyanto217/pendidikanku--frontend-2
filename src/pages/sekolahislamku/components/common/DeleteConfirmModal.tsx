// src/pages/sekolahislamku/components/common/DeleteConfirm.tsx
import React, { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

/* ========== Modal Konfirmasi Hapus ========== */
export function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  palette,
  title = "Konfirmasi Hapus",
  message = "Hapus item ini? Tindakan tidak dapat dibatalkan.",
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  palette: Palette;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}) {
  // Esc to close + lock scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.35)" }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="mx-auto mt-24 w-[92%] max-w-md rounded-2xl shadow-lg"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: palette.white1,
          color: palette.black1,
          border: `1px solid ${palette.silver1}`,
        }}
      >
        <div
          className="p-4 md:p-5 border-b flex items-center justify-between"
          style={{ borderColor: palette.silver1 }}
        >
          <div className="font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:opacity-80"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 md:p-5 text-sm" style={{ color: palette.black2 }}>
          {message}
        </div>

        <div className="p-4 md:p-5 pt-0 flex items-center justify-end gap-2">
          <Btn
            palette={palette}
            variant="white1"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Btn>
          <Btn
            palette={palette}
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={loading}
          >
            <Trash2 size={16} className="mr-1" />
            {loading ? "Menghapus…" : confirmLabel}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ========== Tombol + Modal Sekaligus ========== */
export function DeleteConfirmButton({
  palette,
  onConfirm,
  title,
  message = "Hapus item ini? Tindakan tidak dapat dibatalkan.",
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  size = "sm",
  variant = "destructive",
  ariaLabel,
  children,
}: {
  palette: Palette;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  size?: "sm" | "md" | "icon";
  variant?: "destructive" | "outline" | "secondary" | "default";
  ariaLabel?: string; // untuk icon-only
  children?: React.ReactNode; // custom isi tombol (default pakai icon + "Hapus")
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    try {
      setBusy(true);
      await onConfirm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Btn
        palette={palette}
        variant={variant}
        size={size as any}
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
      >
        {children ?? (
          <>
            <Trash2
              size={size === "icon" ? 16 : 14}
              className={size === "icon" ? "" : "mr-1"}
            />
            {size === "icon" ? null : "Hapus"}
          </>
        )}
      </Btn>

      <DeleteConfirmModal
        open={open}
        onClose={() => !busy && setOpen(false)}
        onConfirm={handleConfirm}
        palette={palette}
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        loading={busy}
      />
    </>
  );
}
