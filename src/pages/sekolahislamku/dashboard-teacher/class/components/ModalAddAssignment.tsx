// src/pages/sekolahislamku/assignment/ModalAddAssignment.tsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

export type AddAssignmentPayload = {
  title: string;
  kelas?: string;
  dueDate: string; // ISO
  total: number;
};

interface ModalAddAssignmentProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AddAssignmentPayload) => void;
  palette: Palette;
}

const ModalAddAssignment: React.FC<ModalAddAssignmentProps> = ({
  open,
  onClose,
  onSubmit,
  palette,
}) => {
  const [title, setTitle] = useState("");
  const [kelas, setKelas] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [total, setTotal] = useState<number>(0);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      alert("Judul dan batas waktu wajib diisi.");
      return;
    }
    onSubmit({
      title: title.trim(),
      kelas: kelas.trim() || undefined,
      dueDate: new Date(dueDate).toISOString(),
      total,
    });
    // reset form
    setTitle("");
    setKelas("");
    setDueDate("");
    setTotal(0);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative"
        style={{ color: palette.black1 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tambah Tugas</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Judul Tugas</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border px-3 h-10 text-sm"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
                color: palette.black1,
              }}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Kelas (opsional)</label>
            <input
              type="text"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              className="w-full rounded-lg border px-3 h-10 text-sm"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
                color: palette.black1,
              }}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Batas Waktu</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border px-3 h-10 text-sm"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
                color: palette.black1,
              }}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Total Siswa</label>
            <input
              type="number"
              min={0}
              value={total}
              onChange={(e) => setTotal(Number(e.target.value))}
              className="w-full rounded-lg border px-3 h-10 text-sm"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
                color: palette.black1,
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3">
            <Btn
              palette={palette}
              variant="ghost"
              size="sm"
              onClick={onClose}
              type="button"
            >
              Batal
            </Btn>
            <Btn palette={palette} size="sm" type="submit">
              Simpan
            </Btn>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ModalAddAssignment;
