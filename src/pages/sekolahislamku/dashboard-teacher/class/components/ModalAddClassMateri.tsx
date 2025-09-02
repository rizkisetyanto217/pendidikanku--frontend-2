// src/pages/sekolahislamku/teacher/ModalAddClassMateri.tsx
import React, { useMemo, useState } from "react";
import { X, Save } from "lucide-react";
import {
  Btn,
  SectionCard,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import InputField from "@/components/common/main/InputField";

type MateriType = "pdf" | "doc" | "ppt" | "link" | "video";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    description?: string;
    type: MateriType;
    file?: File | null;
    url?: string;
  }) => void;
  palette: Palette;
};

export default function ModalAddClassMateri({
  open,
  onClose,
  onSubmit,
  palette,
}: Props) {
  const { isDark } = useHtmlDarkMode();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<MateriType>("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");

  const accept = useMemo(() => {
    switch (type) {
      case "pdf":
        return ".pdf,application/pdf";
      case "doc":
        return ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "ppt":
        return ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";
      default:
        return undefined;
    }
  }, [type]);

  if (!open) return null;

  const resetAndClose = () => {
    setFile(null);
    setUrl("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // validasi ringan
    if ((type === "link" || type === "video") && !url.trim()) return;
    if ((type === "pdf" || type === "doc" || type === "ppt") && !file) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      type,
      file,
      url: url.trim() || undefined,
    });
    resetAndClose();
  };

  const panelBg = isDark ? "bg-zinc-900" : "bg-white";
  const divider = { borderColor: isDark ? "#3f3f46" : palette.silver1 };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "#00000080" }}
      role="dialog"
      aria-modal="true"
    >
      <SectionCard
        palette={palette}
        className={`w-full max-w-lg rounded-2xl shadow-xl ${panelBg}`}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={divider}
        >
          <h2 className="text-lg font-semibold">Tambah Materi</h2>
          <button
            onClick={resetAndClose}
            className={`p-1 rounded-full transition-colors ${isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"}`}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <InputField
            label="Judul"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            placeholder="contoh: Mad Thabi'i — Ringkasan & Contoh"
          />

          <InputField
            label="Deskripsi"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            placeholder="deskripsi singkat materi"
            as="textarea"
            rows={4}
          />

          {/* Tipe + input dinamis */}
          <div className="grid grid-cols-1 gap-3">
            <div className="w-full space-y-1">
              <label
                className={`block text-sm font-medium ${isDark ? "text-zinc-300" : "text-gray-700"}`}
              >
                Tipe Materi
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const v = e.target.value as MateriType;
                  setType(v);
                  // reset field yg tidak relevan
                  if (v === "link" || v === "video") setFile(null);
                  else setUrl("");
                }}
                className={`w-full text-sm px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isDark
                    ? "text-white bg-zinc-800 border-zinc-700"
                    : "text-black bg-white border-gray-300"
                }`}
              >
                <option value="pdf">PDF</option>
                <option value="doc">Dokumen</option>
                <option value="ppt">Presentasi</option>
                <option value="video">Video</option>
                <option value="link">Tautan</option>
              </select>
            </div>

            {(type === "link" || type === "video") && (
              <InputField
                label={type === "video" ? "URL Video" : "URL Tautan"}
                name="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.currentTarget.value)}
                placeholder="https://…"
              />
            )}

            {(type === "pdf" || type === "doc" || type === "ppt") && (
              <InputField
                label="Upload File"
                name="file"
                type="file"
                accept={accept}
                onFileChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            )}
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-2 pt-3 border-t" style={divider}>
            <Btn
              type="button"
              onClick={resetAndClose}
              palette={palette}
              variant="outline"
            >
              Batal
            </Btn>
            <Btn
              type="submit"
              palette={palette}
              variant="secondary"
              disabled={
                !title.trim() ||
                ((type === "link" || type === "video") && !url.trim()) ||
                ((type === "pdf" || type === "doc" || type === "ppt") && !file)
              }
            >
              <Save size={16} className="mr-1" />
              Simpan
            </Btn>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
