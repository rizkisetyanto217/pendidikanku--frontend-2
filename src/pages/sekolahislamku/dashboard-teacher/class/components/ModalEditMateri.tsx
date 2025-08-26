import React, { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

export type EditMateriPayload = {
  title: string;
  date: string; // ISO (yyyy-mm-dd)
  attachments?: number; // jumlah lampiran
  content?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  defaultValues?: Partial<EditMateriPayload>;
  onSubmit: (payload: EditMateriPayload) => void;
  onDelete?: () => void;
};

const isoOnlyDate = (iso?: string) => {
  if (!iso) return "";
  // jika ada waktu → strip jadi yyyy-mm-dd
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

export default function ModalEditMateri({
  open,
  onClose,
  palette,
  defaultValues,
  onSubmit,
  onDelete,
}: Props) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [date, setDate] = useState(isoOnlyDate(defaultValues?.date) ?? "");
  const [attachments, setAttachments] = useState<number | "">(
    defaultValues?.attachments ?? 0
  );
  const [content, setContent] = useState(defaultValues?.content ?? "");

  const titleRef = useRef<HTMLInputElement>(null);

  // Reset form saat modal dibuka
  useEffect(() => {
    if (!open) return;
    setTitle(defaultValues?.title ?? "");
    setDate(isoOnlyDate(defaultValues?.date) ?? "");
    setAttachments(
      typeof defaultValues?.attachments === "number"
        ? defaultValues!.attachments!
        : 0
    );
    setContent(defaultValues?.content ?? "");
    // fokuskan ke judul
    setTimeout(() => titleRef.current?.focus(), 0);
  }, [
    open,
    defaultValues?.title,
    defaultValues?.date,
    defaultValues?.attachments,
    defaultValues?.content,
  ]);

  // Tutup dengan ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const isValid = useMemo(() => title.trim().length > 0, [title]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({
      title: title.trim(),
      date: date || new Date().toISOString().slice(0, 10),
      attachments: attachments === "" ? 0 : Number(attachments),
      content: content?.trim() || undefined,
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={(e) => {
        // klik overlay untuk tutup
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ background: "rgba(15, 23, 42, 0.35)" }} // overlay
    >
      <div
        className="w-full sm:max-w-lg sm:rounded-2xl sm:shadow-xl sm:mx-4 overflow-hidden"
        style={{
          background: palette.white1,
          color: palette.black1,
          border: `1px solid ${palette.silver1}`,
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between border-b"
          style={{ borderColor: palette.silver1 }}
        >
          <div className="font-semibold">Edit Materi</div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:opacity-80"
            aria-label="Tutup"
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Judul */}
          <div className="space-y-1">
            <label className="text-sm" htmlFor="materi-title">
              Judul Materi
            </label>
            <input
              id="materi-title"
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 w-full rounded-xl px-3 text-sm outline-none"
              placeholder="Mis. Pengenalan Huruf Hijaiyah"
              style={{
                background: palette.white2,
                color: palette.black1,
                border: `1px solid ${palette.silver1}`,
              }}
              required
            />
          </div>

          {/* Tanggal */}
          <div className="space-y-1">
            <label className="text-sm" htmlFor="materi-date">
              Tanggal
            </label>
            <input
              id="materi-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 w-full rounded-xl px-3 text-sm outline-none"
              style={{
                background: palette.white2,
                color: palette.black1,
                border: `1px solid ${palette.silver1}`,
              }}
            />
          </div>

          {/* Lampiran (jumlah) */}
          <div className="space-y-1">
            <label className="text-sm" htmlFor="materi-attachments">
              Jumlah Lampiran
            </label>
            <input
              id="materi-attachments"
              type="number"
              min={0}
              value={attachments}
              onChange={(e) => {
                const v = e.target.value;
                setAttachments(v === "" ? "" : Math.max(0, Number(v)));
              }}
              className="h-10 w-full rounded-xl px-3 text-sm outline-none"
              style={{
                background: palette.white2,
                color: palette.black1,
                border: `1px solid ${palette.silver1}`,
              }}
            />
          </div>

          {/* Konten */}
          <div className="space-y-1">
            <label className="text-sm" htmlFor="materi-content">
              Konten Materi
            </label>
            <textarea
              id="materi-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-y"
              placeholder="Tulis ringkasan/poin materi di sini…"
              style={{
                background: palette.white2,
                color: palette.black1,
                border: `1px solid ${palette.silver1}`,
              }}
            />
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-between">
            {onDelete ? (
              <Btn
                palette={palette}
                variant="destructive"
                type="button"
                onClick={onDelete}
              >
                Hapus
              </Btn>
            ) : (
              <span />
            )}

            <div className="flex gap-2">
              <Btn
                palette={palette}
                variant="white1"
                type="button"
                onClick={onClose}
              >
                Batal
              </Btn>
              <Btn palette={palette} type="submit" disabled={!isValid}>
                Simpan
              </Btn>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
