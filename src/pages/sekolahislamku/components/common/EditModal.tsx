// src/pages/sekolahislamku/components/common/EditModal.tsx
import React, { useEffect } from "react";
import { X, Save } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

type EditModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  palette: Palette;
  title?: React.ReactNode; // <— tadinya string
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  children: React.ReactNode;
  widthClass?: string; // default max-w-2xl
};

export default function EditModal({
  open,
  onClose,
  onSubmit,
  palette,
  title = "Edit",
  submitLabel = "Simpan",
  cancelLabel = "Batal",
  loading = false,
  children,
  widthClass = "max-w-2xl",
}: EditModalProps) {
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
      role="dialog"
      aria-modal="true"
      onClick={() => !loading && onClose()}
      style={{ background: "rgba(0,0,0,0.35)" }}
    >
      <div
        className={`mx-auto mt-10 w-[92%] ${widthClass} rounded-2xl shadow-lg`}
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
          <div className="font-semibold text-base">{title}</div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:opacity-80 disabled:opacity-50"
            aria-label="Tutup"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 md:p-5">{children}</div>

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
            variant="default"
            size="sm"
            onClick={onSubmit}
            disabled={loading}
          >
            <Save className="mr-1" size={16} />
            {loading ? "Menyimpan…" : submitLabel}
          </Btn>
        </div>
      </div>
    </div>
  );
}
