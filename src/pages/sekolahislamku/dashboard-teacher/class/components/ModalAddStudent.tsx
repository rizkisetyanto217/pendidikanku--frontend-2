// src/pages/sekolahislamku/teacher/components/ModalAddStudent.tsx
import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

export type AddStudentPayload = {
  id: string; // slug/ID unik (otomatis dari nama)
  name: string; // Nama siswa
  nis?: string; // Opsional: nomor induk
  kelasId?: string; // Opsional: id kelas aktif
};

function slugify(s: string) {
  return (s ?? "")
    .toLowerCase()
    .trim()
    .replace(/[_—–]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ModalAddStudent({
  open,
  onClose,
  palette,
  onSubmit,
  initial,
  title = "Tambah Siswa",
}: {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  onSubmit: (payload: AddStudentPayload) => Promise<void> | void;
  initial?: Partial<AddStudentPayload>;
  title?: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [nis, setNis] = useState(initial?.nis ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset saat modal dibuka + fokus input + lock scroll body
  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setNis(initial?.nis ?? "");
    setErr(null);
    setTimeout(() => inputRef.current?.focus(), 30);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, initial?.name, initial?.nis]);

  // ESC untuk menutup
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setErr("Nama siswa wajib diisi.");
    setErr(null);
    setSaving(true);
    try {
      const payload: AddStudentPayload = {
        id: slugify(trimmed),
        name: trimmed,
        nis: nis.trim() || undefined,
        kelasId: initial?.kelasId,
      };
      await onSubmit(payload);
      onClose();
    } catch (error: any) {
      setErr(error?.message ?? "Gagal menambahkan siswa.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50" aria-modal role="dialog">
      {/* overlay */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        style={{ background: "#0006" }}
      />
      {/* panel */}
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div
          className="w-full max-w-lg rounded-2xl border shadow-lg"
          style={{ background: palette.white1, borderColor: palette.silver1 }}
        >
          {/* header */}
          <div
            className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: palette.silver1 }}
          >
            <div className="font-semibold">{title}</div>
            <button
              onClick={onClose}
              className="h-9 w-9 grid place-items-center rounded-xl"
              style={{ border: `1px solid ${palette.silver1}` }}
              aria-label="Tutup"
            >
              <X size={18} />
            </button>
          </div>

          {/* body */}
          <form onSubmit={handleSubmit} className="px-4 py-4 grid gap-3">
            <label className="grid gap-1 text-sm">
              <span>
                Nama Siswa <span style={{ color: palette.error1 }}>*</span>
              </span>
              <input
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth: Ahmad"
                className="h-10 rounded-lg px-3 border outline-none"
                style={{
                  background: palette.white2,
                  color: palette.black1,
                  borderColor: palette.silver1,
                }}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span>NIS (opsional)</span>
              <input
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="cth: 2025-001"
                className="h-10 rounded-lg px-3 border outline-none"
                style={{
                  background: palette.white2,
                  color: palette.black1,
                  borderColor: palette.silver1,
                }}
              />
            </label>

            {name && (
              <div className="text-xs" style={{ color: palette.silver2 }}>
                ID otomatis: <code>{slugify(name)}</code>
              </div>
            )}

            {err && (
              <div
                className="text-sm rounded-lg px-3 py-2"
                style={{
                  color: palette.error1,
                  background: palette.error2,
                  border: `1px solid ${palette.error1}`,
                }}
              >
                {err}
              </div>
            )}

            {/* footer */}
            <div className="mt-2 flex items-center justify-end gap-2">
              <Btn
                palette={palette}
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={saving}
              >
                Batal
              </Btn>
              <Btn palette={palette} type="submit" disabled={saving}>
                {saving ? "Menyimpan…" : "Simpan"}
              </Btn>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
