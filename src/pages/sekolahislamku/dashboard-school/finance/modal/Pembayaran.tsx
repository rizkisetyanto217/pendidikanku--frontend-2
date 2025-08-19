// src/pages/sekolahislamku/finance/modal/Pembayaran.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

export type PaymentPayload = {
  date: string; // ISO (yyyy-mm-dd)
  payer_name: string;
  invoice_id?: string; // optional jika user pilih tagihan existing
  invoice_title?: string; // optional jika manual (tanpa pilih tagihan)
  method: "cash" | "transfer" | "virtual_account" | "other";
  amount: number;
  notes?: string;
};

type Option = { value: string; label: string };

interface PembayaranModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentPayload) => void;
  palette: Palette;

  /** optional: daftar tagihan utk dipilih */
  invoiceOptions?: Option[]; // [{ value: "inv_1", label: "SPP Agustus - 6A / Ahmad" }, ...]
  /** optional: default tanggal (yyyy-mm-dd). default = hari ini */
  defaultDate?: string;
}

const Pembayaran: React.FC<PembayaranModalProps> = ({
  open,
  onClose,
  onSubmit,
  palette,
  invoiceOptions = [],
  defaultDate,
}) => {
  const todayISO = useMemo(() => {
    if (defaultDate) return defaultDate;
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }, [defaultDate]);

  const [date, setDate] = useState<string>(todayISO);
  const [payer, setPayer] = useState<string>("");
  const [invoiceId, setInvoiceId] = useState<string>("");
  const [invoiceTitle, setInvoiceTitle] = useState<string>("");
  const [method, setMethod] = useState<PaymentPayload["method"]>("cash");
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Reset form setiap kali modal dibuka
  useEffect(() => {
    if (open) {
      setDate(todayISO);
      setPayer("");
      setInvoiceId("");
      setInvoiceTitle("");
      setMethod("cash");
      setAmount(0);
      setNotes("");
      // kunci scroll body saat modal terbuka
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open, todayISO]);

  // close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: PaymentPayload = {
      date,
      payer_name: payer.trim(),
      invoice_id: invoiceId || undefined,
      invoice_title: invoiceId ? undefined : invoiceTitle.trim() || undefined,
      method,
      amount: Number(amount) || 0,
      notes: notes.trim() || undefined,
    };
    onSubmit(payload);
    onClose();
  };

  const node = (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === wrapperRef.current) onClose();
      }}
      ref={wrapperRef}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92vh] overflow-auto rounded-t-2xl sm:rounded-2xl shadow-xl p-5 sm:p-6 space-y-4"
        style={{ background: palette.white1, color: palette.quaternary }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold">
            Rekam Pembayaran
          </h2>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-full"
            aria-label="Tutup modal"
            style={{ border: `1px solid ${palette.silver1}` }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 outline-none"
                style={{
                  borderColor: palette.silver1,
                  background: palette.white2,
                }}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Metode</label>
              <select
                value={method}
                onChange={(e) =>
                  setMethod(e.target.value as PaymentPayload["method"])
                }
                className="w-full rounded-xl border px-3 py-2 outline-none"
                style={{
                  borderColor: palette.silver1,
                  background: palette.white2,
                }}
              >
                <option value="cash">Tunai</option>
                <option value="transfer">Transfer</option>
                <option value="virtual_account">Virtual Account</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Nama Pembayar</label>
            <input
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 outline-none"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
              }}
              placeholder="Nama orang tua / siswa"
              required
            />
          </div>

          {/* Pilih Tagihan ATAU isi judul manual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">
                Pilih Tagihan (opsional)
              </label>
              <select
                value={invoiceId}
                onChange={(e) => {
                  setInvoiceId(e.target.value);
                  if (e.target.value) setInvoiceTitle(""); // kosongkan manual jika memilih tagihan
                }}
                className="w-full rounded-xl border px-3 py-2 outline-none"
                style={{
                  borderColor: palette.silver1,
                  background: palette.white2,
                }}
              >
                <option value="">— Tidak pilih —</option>
                {invoiceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">
                Judul Tagihan (manual)
              </label>
              <input
                value={invoiceTitle}
                onChange={(e) => {
                  setInvoiceTitle(e.target.value);
                  if (e.target.value) setInvoiceId(""); // kosongkan pilihan jika manual
                }}
                className="w-full rounded-xl border px-3 py-2 outline-none"
                style={{
                  borderColor: palette.silver1,
                  background: palette.white2,
                }}
                placeholder="cth: SPP September - 6A"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Jumlah</label>
            <input
              type="number"
              min={0}
              value={Number.isNaN(amount) ? 0 : amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-xl border px-3 py-2 outline-none"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
              }}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Catatan (opsional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border px-3 py-2 outline-none"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
              }}
              placeholder="Nomor referensi/VA, keterangan tambahan…"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
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

export default Pembayaran;
