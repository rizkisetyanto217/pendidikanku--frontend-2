// src/pages/sekolahislamku/assignment/ModalAddAssignmentClass.tsx
import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

export type AddAssignmentClassPayload = {
  title: string;
  kelas?: string;
  dueDate: string; // ISO string
  total: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  onSubmit: (payload: AddAssignmentClassPayload) => void;
};

export default function ModalAddAssignmentClass({
  open,
  onClose,
  palette,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState("");
  const [kelas, setKelas] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [total, setTotal] = useState(0);

  const dialogRef = useRef<HTMLDivElement>(null);

  // tutup dengan ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: "#0006" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        className="w-full md:max-w-lg rounded-t-2xl md:rounded-2xl overflow-hidden shadow-xl"
        style={{
          background: palette.white1,
          color: palette.black1,
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: palette.silver1 }}
        >
          <div className="font-semibold">Tambah Tugas Kelas</div>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-xl"
            style={{ border: `1px solid ${palette.silver1}` }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <div>
            <label className="text-sm block mb-1">Judul Tugas</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="contoh: Evaluasi Tajwid"
              className="w-full h-10 rounded-xl px-3 text-sm outline-none"
              style={{
                background: palette.white2,
                border: `1px solid ${palette.silver1}`,
              }}
            />
          </div>

          <div>
            <label className="text-sm block mb-1">Kelas (opsional)</label>
            <input
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              placeholder="contoh: TPA A"
              className="w-full h-10 rounded-xl px-3 text-sm outline-none"
              style={{
                background: palette.white2,
                border: `1px solid ${palette.silver1}`,
              }}
            />
          </div>

          <div>
            <label className="text-sm block mb-1">Batas Pengumpulan</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-10 rounded-xl px-3 text-sm outline-none"
              style={{
                background: palette.white2,
                border: `1px solid ${palette.silver1}`,
              }}
            />
          </div>

          <div>
            <label className="text-sm block mb-1">Total Target</label>
            <input
              type="number"
              min={0}
              value={total}
              onChange={(e) => setTotal(Number(e.target.value))}
              className="w-full h-10 rounded-xl px-3 text-sm outline-none"
              style={{
                background: palette.white2,
                border: `1px solid ${palette.silver1}`,
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 border-t flex justify-end gap-2"
          style={{ borderColor: palette.silver1 }}
        >
          <Btn palette={palette} size="sm" variant="ghost" onClick={onClose}>
            Batal
          </Btn>
          <Btn
            palette={palette}
            size="sm"
            onClick={() => {
              if (!title.trim() || !dueDate) return;
              onSubmit({
                title: title.trim(),
                kelas: kelas.trim() || undefined,
                dueDate: new Date(dueDate).toISOString(),
                total,
              });
              onClose();
            }}
          >
            Simpan
          </Btn>
        </div>
      </div>
    </div>
  );
}
