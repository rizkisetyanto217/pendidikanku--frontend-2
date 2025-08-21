// src/pages/sekolahislamku/teacher/components/ModalExport.tsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

interface ModalExportProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
  palette: Palette;
}

const ModalExport: React.FC<ModalExportProps> = ({
  open,
  onClose,
  onSubmit,
  palette,
}) => {
  const [file, setFile] = useState<File | null>(null);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Content */}
      <div
        className="relative bg-white rounded-xl p-6 w-full max-w-md z-10 shadow-lg"
        style={{ background: palette.white1, color: palette.black1 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Upload CSV</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setFile(e.target.files[0]);
              }
            }}
            className="w-full border rounded-lg p-2 text-sm"
            style={{ borderColor: palette.silver1 }}
          />
          {file && (
            <div className="text-xs text-gray-500">
              File dipilih: {file.name}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6">
          <Btn palette={palette} size="sm" variant="ghost" onClick={onClose}>
            Batal
          </Btn>
          <Btn
            palette={palette}
            size="sm"
            onClick={() => {
              if (file) {
                onSubmit(file);
                setFile(null);
              } else {
                alert("Pilih file terlebih dahulu!");
              }
            }}
          >
            Upload
          </Btn>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalExport;
