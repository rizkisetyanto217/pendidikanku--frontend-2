// src/pages/sekolahislamku/teacher/components/ModalGrading.tsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

export type ModalGradingProps = {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  student?: { id: string; name: string; score?: number };
  assignmentTitle?: string;
  assignmentClassName?: string; // ⬅️ NEW
  onSubmit: (payload: { id: string; score: number }) => void;
};

export default function ModalGrading({
  open,
  onClose,
  palette,
  student,
  assignmentTitle,
  assignmentClassName, // ⬅️ NEW
  onSubmit,
}: ModalGradingProps) {
  const [score, setScore] = useState<number | "">("");

  useEffect(() => {
    setScore(student?.score ?? "");
  }, [student]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (score === "") return;
    onSubmit({ id: student?.id ?? "new", score: Number(score) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-xl shadow-lg p-6"
        style={{ background: palette.white1, color: palette.black1 }}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {student ? `Nilai ${student.name}` : "Buat Penilaian"}
          </h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* info siswa + kelas + tugas */}
        <div className="mb-4 space-y-1 text-sm">
          <p>
            <span style={{ color: palette.silver2 }}>Siswa: </span>
            <span className="font-medium">
              {student?.name ?? "Belum dipilih"}
            </span>
          </p>
          {assignmentClassName && (
            <p>
              <span style={{ color: palette.silver2 }}>Kelas: </span>
              <span className="font-medium">{assignmentClassName}</span>
            </p>
          )}
          {assignmentTitle && (
            <p>
              <span style={{ color: palette.silver2 }}>Tugas: </span>
              <span className="font-medium">{assignmentTitle}</span>
            </p>
          )}
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm mb-1"
              style={{ color: palette.silver2 }}
            >
              Nilai (0–100)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) =>
                setScore(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full rounded-lg border px-3 py-2 outline-none"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
                color: palette.black1,
              }}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Btn
              type="button"
              palette={palette}
              variant="outline"
              onClick={onClose}
            >
              Batal
            </Btn>
            <Btn type="submit" palette={palette}>
              Simpan
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
