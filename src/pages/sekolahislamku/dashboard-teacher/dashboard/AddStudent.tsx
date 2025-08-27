// src/pages/sekolahislamku/class/AddStudent.tsx
import React, { useState, useEffect } from "react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import InputField from "@/components/common/main/InputField";

export type StudentForm = {
  name: string;
  nis?: string; // Nomor Induk Siswa
  email?: string;
  phone?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  title?: string;
  defaultValue?: StudentForm;
  onSubmit: (val: StudentForm) => Promise<void> | void;
};

const AddStudent: React.FC<Props> = ({
  open,
  onClose,
  palette,
  title = "Tambah Siswa",
  defaultValue,
  onSubmit,
}) => {
  const [name, setName] = useState(defaultValue?.name ?? "");
  const [nis, setNis] = useState(defaultValue?.nis ?? "");
  const [email, setEmail] = useState(defaultValue?.email ?? "");
  const [phone, setPhone] = useState(defaultValue?.phone ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(defaultValue?.name ?? "");
    setNis(defaultValue?.nis ?? "");
    setEmail(defaultValue?.email ?? "");
    setPhone(defaultValue?.phone ?? "");
  }, [open, defaultValue]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        nis: nis.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      role="dialog"
      aria-modal
    >
      <div
        className="w-full max-w-2xl rounded-2xl"
        style={{
          background: palette.white2,
          color: palette.black1,
          border: `1px solid ${palette.silver1}`,
        }}
      >
        <form
          onSubmit={submit}
          className="flex flex-col max-h-[90vh] rounded-2xl"
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 p-4 border-b rounded-t-2xl"
            style={{ background: palette.white2, borderColor: palette.silver1 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{title}</h3>
              <Btn
                type="button"
                variant="white1"
                palette={palette}
                onClick={onClose}
              >
                Tutup
              </Btn>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 [-webkit-overflow-scrolling:touch]">
            <InputField
              label="Nama Siswa"
              name="name"
              value={name}
              placeholder="Masukkan nama lengkap"
              onChange={(e) => setName(e.currentTarget.value)}
            />
            <InputField
              label="NIS"
              name="nis"
              value={nis}
              placeholder="Nomor Induk Siswa"
              onChange={(e) => setNis(e.currentTarget.value)}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              value={email}
              placeholder="Email siswa"
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <InputField
              label="Nomor HP"
              name="phone"
              type="tel"
              value={phone}
              placeholder="08xxxxxxxxxx"
              onChange={(e) => setPhone(e.currentTarget.value)}
            />
          </div>

          {/* Footer */}
          <div
            className="sticky bottom-0 z-10 p-4 border-t flex justify-end gap-2 rounded-b-2xl
                        pb-[env(safe-area-inset-bottom)] bg-clip-padding"
            style={{ background: palette.white2, borderColor: palette.silver1 }}
          >
            <Btn
              type="button"
              variant="white1"
              palette={palette}
              onClick={onClose}
            >
              Batal
            </Btn>
            <Btn type="submit" palette={palette} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
