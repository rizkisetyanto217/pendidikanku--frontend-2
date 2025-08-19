// src/pages/sekolahislamku/finance/modal/Export.tsx
import React, { useMemo, useRef, useState, DragEvent } from "react";
import { createPortal } from "react-dom";
import { X, UploadCloud, File as FileIcon, Trash2 } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

type ExportModalProps = {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  onSubmit?: (data: {
    month: string;
    format: string;
    file?: File | null;
  }) => void; // opsional
  accept?: string; // default ".xlsx,.csv,.pdf"
  maxSizeMB?: number; // default 10
};

const Export: React.FC<ExportModalProps> = ({
  open,
  onClose,
  palette,
  onSubmit,
  accept = ".xlsx,.csv,.pdf",
  maxSizeMB = 10,
}) => {
  const [month, setMonth] = useState("");
  const [format, setFormat] = useState<"xlsx" | "csv" | "pdf">("xlsx");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxBytes = useMemo(() => maxSizeMB * 1024 * 1024, [maxSizeMB]);

  if (!open) return null;

  const handleFiles = (f?: File) => {
    if (!f) return;
    if (f.size > maxBytes) {
      alert(`Ukuran file > ${maxSizeMB}MB`);
      return;
    }
    if (
      accept &&
      !accept
        .split(",")
        .some((ext) => f.name.toLowerCase().endsWith(ext.trim().toLowerCase()))
    ) {
      alert(`Tipe file tidak didukung. Boleh: ${accept}`);
      return;
    }
    setFile(f);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer?.files?.[0];
    handleFiles(f ?? undefined);
  };

  const submitUIOnly = () => {
    const payload = { month, format, file };
    if (onSubmit) onSubmit(payload);
    else console.log("Export UI payload:", payload);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-3"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-xl p-6 space-y-5"
        style={{ background: palette.white1, color: palette.quaternary }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Export / Upload Data</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:opacity-70"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Periode Bulan</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 outline-none"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
              }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Format Export</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full rounded-xl border px-3 py-2 outline-none"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
              }}
            >
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
              <option value="pdf">PDF (.pdf)</option>
            </select>
          </div>
        </div>

        {/* Upload Area (opsional) */}
        <div className="space-y-2">
          <label className="block text-sm">Upload File (opsional)</label>

          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`rounded-2xl border px-4 py-6 text-center cursor-pointer transition
                ${isDragging ? "ring-2" : ""}`}
              style={{
                borderColor: isDragging ? palette.primary : palette.silver1,
                background: palette.white2,
              }}
              aria-label="Drop file di sini atau klik untuk memilih"
            >
              <div className="mx-auto mb-2 w-10 h-10 rounded-full grid place-items-center">
                <UploadCloud size={22} />
              </div>
              <p className="text-sm">Tarik & letakkan file di sini</p>
              <p className="text-xs opacity-70 mt-1">
                atau klik untuk memilih. Boleh: {accept} • Maks {maxSizeMB}MB
              </p>
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => handleFiles(e.target.files?.[0])}
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3"
              style={{
                borderColor: palette.silver1,
                background: palette.white2,
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileIcon size={18} />
                <div className="truncate">
                  <div className="text-sm truncate">{file.name}</div>
                  <div className="text-xs opacity-70">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1 rounded hover:opacity-70"
                aria-label="Hapus file"
                title="Hapus file"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Btn palette={palette} variant="secondary" onClick={onClose}>
            Batal
          </Btn>
          <Btn palette={palette} onClick={submitUIOnly}>
            {file ? "Upload & Proses" : "Export"}
          </Btn>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Export;
