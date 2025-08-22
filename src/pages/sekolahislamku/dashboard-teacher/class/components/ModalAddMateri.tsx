// src/pages/sekolahislamku/components/dashboard/ModalAddMateri.tsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

interface ModalAddMateriProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: { title: string; description: string }) => void;
  palette: Palette;
}

const ModalAddMateri: React.FC<ModalAddMateriProps> = ({
  open,
  onClose,
  onSubmit,
  palette,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative"
        style={{ background: palette.white1, color: palette.black1 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tambah Materi</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Judul</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
              }}
              placeholder="Masukkan judul materi"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
              }}
              rows={4}
              placeholder="Masukkan deskripsi singkat"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <Btn variant="ghost" size="sm" palette={palette} onClick={onClose}>
            Batal
          </Btn>
          <Btn
            size="sm"
            palette={palette}
            onClick={() => {
              onSubmit({ title, description });
              setTitle("");
              setDescription("");
              onClose();
            }}
          >
            Simpan
          </Btn>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalAddMateri;
