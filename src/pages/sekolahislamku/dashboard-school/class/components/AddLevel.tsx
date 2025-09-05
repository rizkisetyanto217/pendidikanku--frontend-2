// src/pages/sekolahislamku/pages/classes/components/TambahLevel.tsx
import { useState } from "react";
import axios from "@/lib/axios";
import { X, Layers } from "lucide-react";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

type Props = {
  open: boolean;
  palette: Palette;
  onClose: () => void;
  onCreated?: () => void; // refetch setelah sukses
};

export default function AddLevel({ open, palette, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const canSave = name.trim().length >= 1 && !saving;

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      // Backend umumnya auto-tenant dari token; kirim field minimal
      const payload: any = {
        classes_name: name.trim(),
        classes_code: code.trim() || null,
        classes_slug: slugify(name),
        classes_is_active: true,
      };
      await axios.post("/api/a/classes", payload);
      onCreated?.();
      onClose();
    } catch (e) {
      console.error("Gagal membuat level:", e);
      alert("Gagal membuat level");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      role="dialog"
      aria-modal="true"
    >
      <SectionCard
        palette={palette}
        className="w-full max-w-md overflow-hidden rounded-2xl"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: palette.white3, background: palette.white1 }}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-xl grid place-items-center"
              style={{ background: palette.white3, color: palette.quaternary }}
            >
              <Layers size={18} />
            </div>
            <div
              className="font-semibold"
              style={{ color: palette.black2 }}
            >
              Tambah Level / Tingkat
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg"
            aria-label="Tutup"
            style={{ color: palette.secondary, background: palette.white3 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4 space-y-3">
          <Field
            label="Nama Level*"
            placeholder="Contoh: Kelas 1"
            value={name}
            onChange={setName}
            palette={palette}
          />
          <Field
            label="Kode (opsional)"
            placeholder="Contoh: 1"
            value={code}
            onChange={setCode}
            palette={palette}
          />
          <div className="text-xs" style={{ color: palette.secondary }}>
            Satu level dapat memiliki banyak kelas/section (mis. Kelas 1A, 1B).
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 flex items-center justify-end gap-2 border-t"
          style={{ borderColor: palette.white3, background: palette.white1 }}
        >
          <Btn palette={palette} size="sm" variant="ghost" onClick={onClose}>
            Batal
          </Btn>
          <Btn
            palette={palette}
            size="sm"
            disabled={!canSave}
            onClick={handleSave}
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </Btn>
        </div>
      </SectionCard>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  palette,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  palette: Palette;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs" style={{ color: palette.secondary }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-3 py-2 outline-none border"
        style={{
          borderColor: palette.white3,
          background: palette.white1,
          color: palette.quaternary,
        }}
      />
    </div>
  );
}
