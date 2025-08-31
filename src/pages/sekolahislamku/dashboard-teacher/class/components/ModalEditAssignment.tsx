// src/pages/sekolahislamku/assignment/ModalEditAssignment.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { colors } from "@/constants/colorsThema";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

export type EditAssignmentPayload = {
  title: string;
  kelas?: string;
  dueDate: string; // ISO string
  total: number;
  submitted?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  palette: Palette ;
  defaultValues?: {
    title?: string;
    kelas?: string;
    dueDate?: string; // ISO
    total?: number;
    submitted?: number;
  };
  onSubmit: (payload: EditAssignmentPayload) => void;
  onDelete?: () => void; // optional: tampilkan tombol Hapus jika ada
};

/** Helper: ISO -> value input type="datetime-local" (tanpa timezone) */
const isoToLocalInput = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

/** Helper: value input "yyyy-MM-ddTHH:mm" -> ISO */
const localInputToISO = (val: string) => {
  // treat as local time
  if (!val) return new Date().toISOString();
  const d = new Date(val);
  // menjaga agar dianggap local; new Date(val) sudah local
  return d.toISOString();
};

export default function ModalEditAssignment({
  open,
  onClose,
  palette,
  defaultValues,
  onSubmit,
  onDelete,
}: Props) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [kelas, setKelas] = useState(defaultValues?.kelas ?? "");
  const [dueLocal, setDueLocal] = useState(
    isoToLocalInput(defaultValues?.dueDate)
  );
  const [total, setTotal] = useState<number>(defaultValues?.total ?? 0);
  const [submitted, setSubmitted] = useState<number | undefined>(
    defaultValues?.submitted
  );

  // Reset saat open berubah (prefill ulang ketika edit item berbeda)
  useEffect(() => {
    if (!open) return;
    setTitle(defaultValues?.title ?? "");
    setKelas(defaultValues?.kelas ?? "");
    setDueLocal(isoToLocalInput(defaultValues?.dueDate));
    setTotal(defaultValues?.total ?? 0);
    setSubmitted(defaultValues?.submitted);
  }, [
    open,
    defaultValues?.title,
    defaultValues?.kelas,
    defaultValues?.dueDate,
    defaultValues?.total,
    defaultValues?.submitted,
  ]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const dialogRef = useRef<HTMLDivElement>(null);
  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const disabled = useMemo(() => {
    return !title.trim() || !dueLocal || total < 0 || (submitted ?? 0) < 0;
  }, [title, dueLocal, total, submitted]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      onClick={onOverlayClick}
      style={{ background: "#0006" }}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={dialogRef}
        className="w-full md:max-w-lg rounded-t-2xl md:rounded-2xl overflow-hidden shadow-xl"
        style={{
          background: (palette as Palette).white1,
          color: (palette as Palette).black1,
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{
            borderColor:
              (palette as Palette).silver2 ?? (palette as Palette).silver1,
          }}
        >
          <div className="font-semibold">Edit Tugas</div>
          <button
            aria-label="Tutup"
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-xl"
            style={{
              border: `1px solid ${(palette as Palette).silver1}`,
              color: (palette as Palette).black2,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Judul */}
          <div>
            <label
              className="text-sm mb-1 block"
              style={{ color: (palette as Palette).black2 }}
            >
              Judul Tugas
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="contoh: Evaluasi Wudhu"
              className="w-full h-10 rounded-xl px-3 text-sm outline-none"
              style={{
                background: (palette as Palette).white2,
                color: (palette as Palette).black1,
                border: `1px solid ${(palette as Palette).silver1}`,
              }}
            />
          </div>

          {/* Kelas (opsional) */}
          <div>
            <label
              className="text-sm mb-1 block"
              style={{ color: (palette as Palette).black2 }}
            >
              Kelas (opsional)
            </label>
            <input
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              placeholder="contoh: TPA A"
              className="w-full h-10 rounded-xl px-3 text-sm outline-none"
              style={{
                background: (palette as Palette).white2,
                color: (palette as Palette).black1,
                border: `1px solid ${(palette as Palette).silver1}`,
              }}
            />
          </div>

          {/* Batas Pengumpulan */}
          <div>
            <label
              className="text-sm mb-1 block"
              style={{ color: (palette as Palette).black2 }}
            >
              Batas Pengumpulan
            </label>
            <input
              type="datetime-local"
              value={dueLocal}
              onChange={(e) => setDueLocal(e.target.value)}
              className="w-full h-10 rounded-xl px-3 text-sm outline-none"
              style={{
                background: (palette as Palette).white2,
                color: (palette as Palette).black1,
                border: `1px solid ${(palette as Palette).silver1}`,
              }}
            />
          </div>

          {/* Total & Submitted */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                className="text-sm mb-1 block"
                style={{ color: (palette as Palette).black2 }}
              >
                Total (target pengumpulan)
              </label>
              <input
                type="number"
                min={0}
                value={total}
                onChange={(e) => setTotal(Number(e.target.value || 0))}
                className="w-full h-10 rounded-xl px-3 text-sm outline-none"
                style={{
                  background: (palette as Palette).white2,
                  color: (palette as Palette).black1,
                  border: `1px solid ${(palette as Palette).silver1}`,
                }}
              />
            </div>
            <div>
              <label
                className="text-sm mb-1 block"
                style={{ color: (palette as Palette).black2 }}
              >
                Terkumpul (opsional)
              </label>
              <input
                type="number"
                min={0}
                value={submitted ?? ""}
                onChange={(e) =>
                  setSubmitted(
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
                className="w-full h-10 rounded-xl px-3 text-sm outline-none"
                style={{
                  background: (palette as Palette).white2,
                  color: (palette as Palette).black1,
                  border: `1px solid ${(palette as Palette).silver1}`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 border-t flex items-center justify-between gap-2"
          style={{ borderColor: (palette as Palette).silver1 }}
        >
          <div className="flex gap-2">
            {onDelete ? (
              <Btn
                palette={palette as Palette}
                size="sm"
                variant="quaternary"
                onClick={onDelete}
              >
                Hapus
              </Btn>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Btn
              palette={palette as Palette}
              size="sm"
              variant="ghost"
              onClick={onClose}
            >
              Batal
            </Btn>
            <Btn
              palette={palette as Palette}
              size="sm"
              onClick={() => {
                if (disabled) return;
                onSubmit({
                  title: title.trim(),
                  kelas: kelas.trim() || undefined,
                  dueDate: localInputToISO(dueLocal),
                  total: Number.isFinite(total) ? total : 0,
                  submitted:
                    submitted === undefined || Number.isNaN(submitted)
                      ? undefined
                      : submitted,
                });
              }}
            >
              Simpan Perubahan
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
