// src/pages/sekolahislamku/students/components/UploadFileStudent.tsx
import React, { useRef, useState } from "react";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import { Upload, X, FileSpreadsheet } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  palette: Palette;
};

const UploadFileStudent: React.FC<Props> = ({ open, onClose, palette }) => {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      role="dialog"
      aria-modal="true"
    >
      <SectionCard
        palette={palette}
        className="w-full max-w-md p-0 overflow-hidden rounded-2xl"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: palette.white3, background: palette.white1 }}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center"
              style={{ background: palette.white3, color: palette.quaternary }}
            >
              <Upload size={16} />
            </div>
            <div
              className="font-semibold"
              style={{ color: palette.quaternary }}
            >
              Import Siswa
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg"
            aria-label="Tutup"
            style={{ color: palette.secondary }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-5 space-y-4">
          <div className="text-sm" style={{ color: palette.secondary }}>
            Format yang didukung: <b>CSV</b> / <b>Excel</b> (xls, xlsx)
          </div>

          <div
            className="border rounded-xl px-4 py-8 text-center cursor-pointer"
            style={{
              borderColor: palette.white3,
              background: palette.white1,
              color: palette.secondary,
            }}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex flex-col items-center gap-2">
              <FileSpreadsheet />
              <div className="text-sm" style={{ color: palette.quaternary }}>
                {file ? file.name : "Klik untuk pilih file"}
              </div>
            </div>
          </div>

          {file && (
            <div
              className="text-xs p-2 rounded-lg"
              style={{ background: palette.white2, color: palette.quaternary }}
            >
              <div>
                <b>Nama:</b> {file.name}
              </div>
              <div>
                <b>Ukuran:</b> {(file.size / 1024).toFixed(1)} KB
              </div>
              <button
                className="underline mt-1"
                onClick={() => setFile(null)}
                style={{ color: palette.primary }}
              >
                Ganti file
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 flex items-center justify-end gap-2 border-t"
          style={{ borderColor: palette.white3, background: palette.white1 }}
        >
          <Btn palette={palette} variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Btn>
          <Btn
            palette={palette}
            size="sm"
            disabled={!file}
            onClick={() => {
              console.log("Upload (dummy):", file);
              onClose();
              setFile(null);
            }}
          >
            Upload (dummy)
          </Btn>
        </div>
      </SectionCard>
    </div>
  );
};

export default UploadFileStudent;
