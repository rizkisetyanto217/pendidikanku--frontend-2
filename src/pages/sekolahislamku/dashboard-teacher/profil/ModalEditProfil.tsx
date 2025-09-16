// src/pages/sekolahislamku/pages/teacher/ModalEditProfilLengkap.tsx
import React, { useState } from "react";
import { X } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

type ProfilLengkapData = {
  fullname: string;
  phone: string;
  email: string;
  city: string;
  location: string;
  birthPlace: string;
  birthDate: string;
  company: string;
  position: string;
  education: string;
  experience: number;
};

type ModalEditProfilLengkapProps = {
  open: boolean;
  onClose: () => void;
  initial: ProfilLengkapData;
  onSubmit: (data: ProfilLengkapData) => void;
  palette: Palette;
};

const ModalEditProfilLengkap: React.FC<ModalEditProfilLengkapProps> = ({
  open,
  onClose,
  initial,
  onSubmit,
  palette,
}) => {
  const [form, setForm] = useState<ProfilLengkapData>(initial);

  if (!open) return null;

  const set = (k: keyof ProfilLengkapData, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* modal */}
      <div
        className="relative w-full max-w-2xl rounded-xl border p-5 bg-white max-h-[90vh] overflow-y-auto"
        style={{ borderColor: palette.silver1, color: palette.black1 }}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">Edit Profil Lengkap</h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* form */}
        <div className="space-y-4 text-sm">
          {/* Informasi Personal */}
          <div>
            <h3 className="font-medium mb-2">Informasi Personal</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Nama Lengkap"
                value={form.fullname}
                onChange={(e) => set("fullname", e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Telepon"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Kota"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Provinsi/Lokasi"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Tempat Lahir"
                value={form.birthPlace}
                onChange={(e) => set("birthPlace", e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => set("birthDate", e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Informasi Profesional */}
          <div>
            <h3 className="font-medium mb-2">Informasi Profesional</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Instansi"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Posisi"
                value={form.position}
                onChange={(e) => set("position", e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Pendidikan"
                value={form.education}
                onChange={(e) => set("education", e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Pengalaman (tahun)"
                value={form.experience}
                onChange={(e) => set("experience", Number(e.target.value))}
                className="border rounded px-3 py-2"
              />
            </div>
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

export default ModalEditProfilLengkap;
