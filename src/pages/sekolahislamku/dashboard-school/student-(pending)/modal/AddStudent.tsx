import { X, UserPlus } from "lucide-react";
import {
  Btn,
  SectionCard,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import React, { useState } from "react";

type Props = {
  open: boolean;
  palette: Palette;
  classes: string[];
  onClose: () => void;
};

export default function AddStudent({
  open,
  palette,
  classes,
  onClose,
}: Props) {
  const [form, setForm] = useState({
    nis: "",
    name: "",
    class_name: "",
    gender: "", // "L" | "P"
    parent_name: "",
    phone: "",
    email: "",
    status: "aktif", // "aktif" | "nonaktif" | "alumni"
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      role="dialog"
      aria-modal="true"
    >
      <SectionCard
        palette={palette}
        className="w-full max-w-2xl p-0 overflow-hidden shadow-2xl rounded-2xl"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: palette.white3, background: palette.white1 }}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ background: palette.white3, color: palette.quaternary }}
            >
              <UserPlus size={18} />
            </div>
            <div>
              <div
                className="font-semibold"
                style={{ color: palette.quaternary }}
              >
                Tambah Siswa
              </div>
              <div className="text-xs" style={{ color: palette.secondary }}>
                Isi data siswa kemudian simpan.
              </div>
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

        {/* Body / Form */}
        <div className="px-4 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field
              label="Nama*"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              palette={palette}
            />
            <Field
              label="NIS"
              value={form.nis}
              onChange={(v) => setForm({ ...form, nis: v })}
              palette={palette}
            />

            <Field
              label="Kelas*"
              type="select"
              options={[
                { label: "Pilih Kelas", value: "" },
                ...classes.map((c) => ({ label: c, value: c })),
              ]}
              value={form.class_name}
              onChange={(v) => setForm({ ...form, class_name: v })}
              palette={palette}
            />

            <Field
              label="Jenis Kelamin"
              type="select"
              options={[
                { label: "Tidak dipilih", value: "" },
                { label: "Laki-laki", value: "L" },
                { label: "Perempuan", value: "P" },
              ]}
              value={form.gender}
              onChange={(v) => setForm({ ...form, gender: v })}
              palette={palette}
            />

            <Field
              label="Nama Orang Tua/Wali"
              value={form.parent_name}
              onChange={(v) => setForm({ ...form, parent_name: v })}
              palette={palette}
            />
            <Field
              label="No. HP"
              type="tel"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              palette={palette}
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              palette={palette}
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: palette.secondary }}>
              Status
            </label>
            <div className="flex items-center gap-2">
              {(["aktif", "nonaktif", "alumni"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setForm({ ...form, status: st })}
                  className="px-3 py-1 rounded-lg text-sm border"
                  style={{
                    borderColor: palette.white3,
                    background:
                      form.status === st ? palette.primary : palette.white1,
                    color:
                      form.status === st ? palette.white1 : palette.quaternary,
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
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
            onClick={() => {
              console.log("Simpan siswa (dummy):", form);
              onClose();
            }}
          >
            Simpan (dummy)
          </Btn>
        </div>
      </SectionCard>
    </div>
  );
}

/* Field helper */
function Field({
  label,
  value,
  onChange,
  palette,
  type = "text",
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  palette: Palette;
  type?: "text" | "select" | "email" | "tel";
  options?: { label: string; value: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs" style={{ color: palette.secondary }}>
        {label}
      </label>
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl px-3 py-2 outline-none border bg-transparent"
          style={{
            borderColor: palette.white3,
            background: palette.white1,
            color: palette.quaternary,
          }}
        >
          {(options ?? []).map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={type}
          className="w-full rounded-xl px-3 py-2 outline-none border"
          style={{
            borderColor: palette.white3,
            background: palette.white1,
            color: palette.quaternary,
          }}
        />
      )}
    </div>
  );
}
