// src/pages/sekolahislamku/finance/modal/Tagihan.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Btn } from "@/pages/sekolahislamku/components/ui/Primitives";
import type { Palette } from "@/pages/sekolahislamku/components/ui/Primitives";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (p: {
    title: string;
    amount: number;
    due_date: string;
    class_name: string;
    type: string;
  }) => void;
  palette: Palette;
};

const Bill: React.FC<Props> = ({ open, onClose, onSubmit, palette }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [due, setDue] = useState("");
  const [kelas, setKelas] = useState("");
  const [jenis, setJenis] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset form tiap kali modal ditutup
  useEffect(() => {
    if (!open) {
      setTitle("");
      setAmount(0);
      setDue("");
      setKelas("");
      setJenis("");
    }
  }, [open]);

  // Kunci scroll body + fokus ke judul saat open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // autofocus sedikit ditunda agar element sudah ter-mount
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Tutup dengan tombol ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    // klik di area overlay (bukan di dalam card) → tutup
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      amount,
      due_date: due,
      class_name: kelas,
      type: jenis,
    });
    onClose();
  };

  const node = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-tagihan-title"
      onMouseDown={handleOverlayClick}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-lg p-5 relative"
        style={{ background: palette.white1, color: palette.black1 }}
        // stop propagate supaya klik dalam card tidak menutup modal
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-tagihan-title" className="text-lg font-semibold">
            Buat Tagihan Baru
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-full"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Judul</label>
            <input
              ref={inputRef}
              className="w-full rounded-xl border px-3 py-2 outline-none"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
              }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Nominal</label>
            <input
              type="number"
              className="w-full rounded-xl border px-3 py-2 outline-none"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
              }}
              value={Number.isNaN(amount) ? 0 : amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              min={0}
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Jatuh Tempo</label>
            <input
              type="date"
              className="w-full rounded-xl border px-3 py-2 outline-none"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
              }}
              value={due}
              onChange={(e) => setDue(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Kelas</label>
              <input
                className="w-full rounded-xl border px-3 py-2 outline-none"
                style={{
                  borderColor: palette.silver1,
                  background: palette.white2,
                }}
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="Mis. 6A"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Jenis</label>
              <select
                className="w-full rounded-xl border px-3 py-2 outline-none"
                style={{
                  borderColor: palette.silver1,
                  background: palette.white2,
                }}
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
              >
                <option value="">Pilih jenis</option>
                <option value="SPP">SPP</option>
                <option value="Seragam">Seragam</option>
                <option value="Buku">Buku</option>
                <option value="Daftar Ulang">Daftar Ulang</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Btn
              type="button"
              palette={palette}
              variant="outline"
              onClick={onClose}
            >
              Batal
            </Btn>
            <Btn type="submit" palette={palette} variant="default">
              Simpan
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(node, document.body)
    : node;
};

export default Bill;
