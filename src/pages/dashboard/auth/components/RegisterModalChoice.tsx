// src/pages/dashboard/auth/components/RegisterChoiceModal.tsx
import React, { useEffect, useState, useMemo } from "react";
import { User, Building2, X, CheckCircle2 } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

type Props = {
  open: boolean;
  onClose: () => void;
  /** hanya mengembalikan pilihan jenis pendaftaran (bukan role) */
  onSelect: (choice: "school" | "user") => void;
};

type Choice = "school" | "user" | null;

export default function RegisterChoiceModal({
  open,
  onClose,
  onSelect,
}: Props) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const [selected, setSelected] = useState<Choice>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setSelected(null);
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // ✅ PENTING: hooks (useMemo) dipanggil SEBELUM early return
  const styles = useMemo(
    () => ({
      cardBase: {
        backgroundColor: isDark ? `${theme.primary}12` : `${theme.primary}0F`,
        border: `1px solid ${theme.white3}`,
      },
      cardSelected: {
        border: `1px solid ${theme.primary}`,
        boxShadow: `0 0 0 3px ${theme.primary}22`,
      },
      muted: { color: theme.silver2 },
      chip: {
        backgroundColor: theme.white2,
        border: `1px solid ${theme.white3}`,
        color: theme.black1,
      },
    }),
    [isDark, theme]
  );

  if (!open) return null; // ✅ setelah semua hooks

  const Card = ({
    title,
    desc,
    icon,
    choice,
  }: {
    title: string;
    desc: string;
    icon: React.ReactNode;
    choice: Exclude<Choice, null>;
  }) => {
    const active = selected === choice;
    return (
      <button
        type="button"
        onClick={() => setSelected(choice)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setSelected(choice);
          }
        }}
        className="text-left rounded-2xl p-5 border transition w-full focus:outline-none"
        style={{
          ...(styles.cardBase as React.CSSProperties),
          ...(active ? (styles.cardSelected as React.CSSProperties) : {}),
          color: theme.black1,
        }}
        aria-pressed={active}
        aria-label={title}
      >
        <div className="flex items-start gap-3">
          <div
            className="h-10 w-10 grid place-items-center rounded-xl shrink-0"
            style={{
              backgroundColor: theme.white2,
              border: `1px solid ${theme.white3}`,
            }}
          >
            {icon}
          </div>
          <div className="flex-1">
            <div className="font-semibold flex items-center gap-2">
              {title}
              {active && (
                <CheckCircle2
                  className="h-4 w-4"
                  style={{ color: theme.primary }}
                />
              )}
            </div>
            <p className="mt-2 text-sm" style={styles.muted}>
              {desc}
            </p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: isDark ? "#00000080" : "#00000066" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-choice-title"
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{
          backgroundColor: theme.white1,
          color: theme.black1,
          border: `1px solid ${theme.white3}`,
        }}
      >
        {/* header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: theme.white3 }}
        >
          <div id="register-choice-title" className="font-semibold">
            Pilih Jenis Pendaftaran
          </div>
          <button
            aria-label="Tutup"
            onClick={onClose}
            className="p-2 rounded-lg hover:opacity-80"
            style={{ color: theme.silver2 }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* body */}
        <div className="p-5">
          <p className="text-sm mb-5" style={styles.muted}>
            Pilih salah satu: <b>Daftar atas nama Sekolah</b> atau{" "}
            <b>Daftar sebagai Pengguna</b>.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card
              choice="school"
              title="Daftar atas nama Sekolah"
              desc="Buat akun institusi untuk mengelola data sekolah, pengguna, dan modul."
              icon={
                <Building2
                  className="h-5 w-5"
                  style={{ color: theme.primary }}
                />
              }
            />
            <Card
              choice="user"
              title="Daftar sebagai Pengguna"
              desc="Buat akun pribadi (orang tua/siswa/guru) untuk akses fitur dasar."
              icon={
                <User className="h-5 w-5" style={{ color: theme.primary }} />
              }
            />
          </div>

          {/* footer */}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs" style={styles.muted}>
              Dengan melanjutkan, Anda menyetujui S&K dan Kebijakan Privasi.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm"
                style={{
                  border: `1px solid ${theme.white3}`,
                  color: theme.black1,
                }}
              >
                Batal
              </button>
              <button
                onClick={() => selected && onSelect(selected)}
                disabled={!selected}
                className="rounded-xl px-4 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: selected ? theme.primary : theme.white3,
                  color: selected ? theme.white1 : theme.silver2,
                }}
              >
                Lanjut
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
