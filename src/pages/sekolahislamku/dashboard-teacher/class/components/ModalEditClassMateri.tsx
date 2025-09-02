// src/pages/sekolahislamku/teacher/ModalEditClassMateri.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Btn,
  Badge,
  type Palette,
  SectionCard,
} from "@/pages/sekolahislamku/components/ui/Primitives";

type MaterialType = "pdf" | "doc" | "ppt" | "link" | "video";

export type EditClassMaterialInput = {
  id: string; // wajib untuk replace item
  title: string;
  description?: string;
  type: MaterialType;
  attachments?: { name: string; url?: string }[];
  author?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditClassMaterialInput) => void;
  palette: Palette;
  initial?: EditClassMaterialInput; // data awal materi yg mau di-edit
};

const defaultInput: EditClassMaterialInput = {
  id: "",
  title: "",
  description: "",
  type: "pdf",
  attachments: [],
  author: "",
};

export default function ModalEditClassMateri({
  open,
  onClose,
  onSubmit,
  palette,
  initial,
}: Props) {
  const [form, setForm] = useState<EditClassMaterialInput>(defaultInput);
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (open) {
      setForm({
        ...defaultInput,
        ...(initial ?? {}),
        // safety: attachments paling tidak array
        attachments: Array.isArray(initial?.attachments)
          ? initial!.attachments
          : [],
      });
      setErrors({});
    }
  }, [open, initial]);

  const disabled = useMemo(() => !form.title.trim(), [form.title]);

  const handleChange = (key: keyof EditClassMaterialInput, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleAttachmentChange = (
    idx: number,
    key: "name" | "url",
    value: string
  ) => {
    setForm((f) => {
      const next = [...(f.attachments ?? [])];
      next[idx] = { ...next[idx], [key]: value };
      return { ...f, attachments: next };
    });
  };

  const handleAddAttachment = () => {
    setForm((f) => ({
      ...f,
      attachments: [...(f.attachments ?? []), { name: "", url: "" }],
    }));
  };

  const handleRemoveAttachment = (idx: number) => {
    setForm((f) => {
      const next = [...(f.attachments ?? [])];
      next.splice(idx, 1);
      return { ...f, attachments: next };
    });
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Judul tidak boleh kosong.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      id: form.id, // penting untuk replace item
      title: form.title.trim(),
      description: form.description?.trim(),
      type: form.type,
      attachments: form.attachments?.map((a) => ({
        name: (a.name ?? "").trim(),
        url: (a.url ?? "").trim() || undefined,
      })),
      author: form.author?.trim(),
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl rounded-2xl shadow-xl overflow-hidden"
        style={{
          background: palette.white1,
          border: `1px solid ${palette.silver1}`,
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: palette.silver1 }}
          >
            <div
              className="font-semibold text-lg"
              style={{ color: palette.black1 }}
            >
              Edit Materi
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-sm"
              style={{ color: palette.silver2 }}
            >
              Tutup
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-auto">
            {/* Judul */}
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: palette.black1 }}
              >
                Judul <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Judul materi…"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: errors.title ? "#ef4444" : palette.silver1,
                  background: palette.white1,
                  color: palette.black1,
                }}
              />
              {errors.title && (
                <div className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                  {errors.title}
                </div>
              )}
            </div>

            {/* Deskripsi */}
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: palette.black1 }}
              >
                Deskripsi
              </label>
              <textarea
                value={form.description ?? ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Deskripsi singkat materi…"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                rows={3}
                style={{
                  borderColor: palette.silver1,
                  background: palette.white1,
                  color: palette.black1,
                }}
              />
            </div>

            {/* Type & Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: palette.black1 }}
                >
                  Tipe Materi
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    handleChange("type", e.target.value as MaterialType)
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                    color: palette.black1,
                  }}
                >
                  <option value="pdf">PDF</option>
                  <option value="doc">Dokumen</option>
                  <option value="ppt">Presentasi</option>
                  <option value="video">Video</option>
                  <option value="link">Tautan</option>
                </select>
              </div>

              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: palette.black1 }}
                >
                  Penulis / Pengunggah
                </label>
                <input
                  value={form.author ?? ""}
                  onChange={(e) => handleChange("author", e.target.value)}
                  placeholder="Nama pengunggah…"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                    color: palette.black1,
                  }}
                />
              </div>
            </div>

            {/* Attachments */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-medium"
                  style={{ color: palette.black1 }}
                >
                  Lampiran
                </label>
                <Btn
                  type="button"
                //   size="xs"
                  variant="outline"
                  palette={palette}
                  onClick={handleAddAttachment}
                >
                  + Tambah Lampiran
                </Btn>
              </div>

              <div className="mt-2 space-y-2">
                {(form.attachments ?? []).length === 0 && (
                  <div className="text-xs" style={{ color: palette.silver2 }}>
                    Belum ada lampiran.
                  </div>
                )}

                {(form.attachments ?? []).map((att, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center"
                  >
                    <input
                      value={att.name ?? ""}
                      onChange={(e) =>
                        handleAttachmentChange(idx, "name", e.target.value)
                      }
                      placeholder="Nama file/tautan"
                      className="md:col-span-2 rounded-lg border px-3 py-2 text-sm outline-none"
                      style={{
                        borderColor: palette.silver1,
                        background: palette.white1,
                        color: palette.black1,
                      }}
                    />
                    <input
                      value={att.url ?? ""}
                      onChange={(e) =>
                        handleAttachmentChange(idx, "url", e.target.value)
                      }
                      placeholder="URL (opsional)"
                      className="md:col-span-3 rounded-lg border px-3 py-2 text-sm outline-none"
                      style={{
                        borderColor: palette.silver1,
                        background: palette.white1,
                        color: palette.black1,
                      }}
                    />
                   
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-5 py-4 border-t flex items-center justify-end gap-2"
            style={{ borderColor: palette.silver1 }}
          >
            <Btn
              type="button"
              variant="outline"
              size="sm"
              palette={palette}
              onClick={onClose}
            >
              Batal
            </Btn>
            <Btn type="submit" size="sm" palette={palette} disabled={disabled}>
              Simpan Perubahan
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
