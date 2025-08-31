import React, { useEffect, useState } from "react";
import { X, Download } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

type Props = {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  defaultName?: string;
  /** Terima FormData agar backend mudah menerima multipart */
  onExport: (form: FormData) => void;
};

export default function ModalExportResult({
  open,
  onClose,
  palette,
  defaultName = "rekap-penilaian",
  onExport,
}: Props) {
  const [filename, setFilename] = useState(defaultName);
  const [format, setFormat] = useState<"xlsx" | "csv" | "pdf">("xlsx");
  const [includeScores, setIncludeScores] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setFilename(defaultName);
    setFormat("xlsx");
    setIncludeScores(true);
    setFile(null);
  }, [open, defaultName]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ background: "#0006" }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl overflow-hidden shadow-xl"
        style={{
          background: palette.white1,
          color: palette.black1,
          border: `1px solid ${palette.silver1}`,
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: palette.silver1 }}
        >
          <div className="font-semibold">Export Hasil Penilaian</div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="h-9 w-9 grid place-items-center rounded-xl"
            style={{
              border: `1px solid ${palette.silver1}`,
              color: palette.black2,
            }}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (FormData) */}
        <form
          encType="multipart/form-data"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const fd = new FormData();
            fd.append("filename", (filename || defaultName).trim());
            fd.append("format", format);
            fd.append("includeScores", includeScores ? "1" : "0");
            if (file) fd.append("attachment", file); // key: attachment
            onExport(fd);
          }}
        >
          <div className="p-4 space-y-3">
            <div>
              <label
                className="text-sm mb-1 block"
                style={{ color: palette.black2 }}
              >
                Nama berkas
              </label>
              <input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full h-10 rounded-xl px-3 text-sm outline-none"
                style={{
                  background: palette.white2,
                  color: palette.black1,
                  border: `1px solid ${palette.silver1}`,
                }}
                placeholder="rekap-penilaian"
              />
            </div>

            <div>
              <label
                className="text-sm mb-1 block"
                style={{ color: palette.black2 }}
              >
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full h-10 rounded-xl px-3 text-sm outline-none"
                style={{
                  background: palette.white2,
                  color: palette.black1,
                  border: `1px solid ${palette.silver1}`,
                }}
              >
                <option value="xlsx">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="pdf">PDF (.pdf)</option>
              </select>
            </div>

            <div>
              <label
                className="text-sm mb-1 block"
                style={{ color: palette.black2 }}
              >
                Lampiran (opsional)
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border file:cursor-pointer rounded-xl"
                style={{
                  color: palette.black1,
                  border: `1px solid ${palette.silver1}`,
                  background: palette.white2,
                }}
                // sesuaikan ekstensi yang diizinkan:
                accept=".xlsx,.csv,.pdf,.png,.jpg,.jpeg"
              />
              {file && (
                <div
                  className="mt-1 text-xs"
                  style={{ color: palette.silver2 }}
                >
                  {file.name} — {(file.size / 1024).toFixed(1)} KB
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeScores}
                onChange={(e) => setIncludeScores(e.target.checked)}
              />
              Sertakan nilai siswa
            </label>
          </div>

          {/* Footer */}
          <div
            className="px-4 py-3 border-t flex items-center justify-end gap-2"
            style={{ borderColor: palette.silver1 }}
          >
            <Btn
              type="button"
              palette={palette}
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
            >
              Batal
            </Btn>
            <Btn type="submit" palette={palette}>
              <Download size={16} className="mr-2" />
              Export
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
