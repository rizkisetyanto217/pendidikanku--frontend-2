// src/pages/sekolahislamku/pages/teacher/ModalEditRingkasan.tsx
import React, { useState } from "react";
import { X } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

type RingkasanData = {
  greeting: string;
  shortBio: string;
  subjects: string[];
};

type ModalEditRingkasanProps = {
  open: boolean;
  onClose: () => void;
  initial: RingkasanData;
  onSubmit: (data: RingkasanData) => void;
  palette: Palette;
};

const ModalEditRingkasan: React.FC<ModalEditRingkasanProps> = ({
  open,
  onClose,
  initial,
  onSubmit,
  palette,
}) => {
  const [form, setForm] = useState<RingkasanData>(initial);

  if (!open) return null;

  const handleChange = (field: keyof RingkasanData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      {/* modal */}
      <div
        className="relative w-full max-w-lg rounded-xl border p-5 bg-white"
        style={{ borderColor: palette.silver1, color: palette.black1 }}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">Edit Ringkasan</h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* form */}
        <div className="space-y-3 text-sm">
          {/* Salam */}
          <div>
            <label className="block mb-1 font-medium">Salam Pembuka</label>
            <textarea
              value={form.greeting}
              onChange={(e) => handleChange("greeting", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={3}
              style={{ borderColor: palette.silver1 }}
            />
          </div>

          {/* Bio Singkat */}
          <div>
            <label className="block mb-1 font-medium">Bio Singkat</label>
            <textarea
              value={form.shortBio}
              onChange={(e) => handleChange("shortBio", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={3}
              style={{ borderColor: palette.silver1 }}
            />
          </div>

          {/* Subjects */}
          <div>
            <label className="block mb-1 font-medium">Mata Pelajaran</label>
            <input
              type="text"
              placeholder="Pisahkan dengan koma, misal: Matematika, Aljabar"
              value={form.subjects.join(", ")}
              onChange={(e) =>
                handleChange(
                  "subjects",
                  e.target.value.split(",").map((s) => s.trim())
                )
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
              style={{ borderColor: palette.silver1 }}
            />
          </div>
        </div>

        {/* footer */}
        <div className="flex justify-end gap-2 mt-4">
          <Btn palette={palette} variant="ghost" onClick={onClose}>
            Batal
          </Btn>
          <Btn
            palette={palette}
            onClick={() => {
              onSubmit(form);
              onClose();
            }}
          >
            Simpan
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default ModalEditRingkasan;
