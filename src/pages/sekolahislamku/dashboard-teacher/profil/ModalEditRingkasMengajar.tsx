// src/pages/sekolahislamku/pages/teacher/ModalEditInformasiMengajar.tsx
import React, { useState } from "react";
import { X } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

type InformasiMengajarData = {
  activity: string;
  rating: number;
  totalStudents: number;
  experience: number;
  isActive: boolean;
};

type ModalEditInformasiMengajarProps = {
  open: boolean;
  onClose: () => void;
  initial: InformasiMengajarData;
  onSubmit: (data: InformasiMengajarData) => void;
  palette: Palette;
};

const ModalEditInformasiMengajar: React.FC<ModalEditInformasiMengajarProps> = ({
  open,
  onClose,
  initial,
  onSubmit,
  palette,
}) => {
  const [form, setForm] = useState<InformasiMengajarData>(initial);

  if (!open) return null;

  const set = (k: keyof InformasiMengajarData, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* modal */}
      <div
        className="relative w-full max-w-lg rounded-xl border p-5 bg-white max-h-[90vh] overflow-y-auto"
        style={{ borderColor: palette.silver1, color: palette.black1 }}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">Edit Informasi Mengajar</h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* form */}
        <div className="space-y-4 text-sm">
          {/* Kegiatan */}
          <div>
            <label className="block mb-1 font-medium">Kegiatan Mengajar</label>
            <textarea
              value={form.activity}
              onChange={(e) => set("activity", e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2"
              style={{ borderColor: palette.silver1 }}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block mb-1 font-medium">Rating (0 - 5)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              max={5}
              value={form.rating}
              onChange={(e) => set("rating", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
              style={{ borderColor: palette.silver1 }}
            />
          </div>

          {/* Total siswa */}
          <div>
            <label className="block mb-1 font-medium">Total Siswa</label>
            <input
              type="number"
              value={form.totalStudents}
              onChange={(e) => set("totalStudents", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
              style={{ borderColor: palette.silver1 }}
            />
          </div>

          {/* Pengalaman */}
          <div>
            <label className="block mb-1 font-medium">Pengalaman (tahun)</label>
            <input
              type="number"
              value={form.experience}
              onChange={(e) => set("experience", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
              style={{ borderColor: palette.silver1 }}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              value={form.isActive ? "true" : "false"}
              onChange={(e) => set("isActive", e.target.value === "true")}
              className="w-full border rounded-lg px-3 py-2 bg-transparent"
              style={{ borderColor: palette.silver1 }}
            >
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
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

export default ModalEditInformasiMengajar;
