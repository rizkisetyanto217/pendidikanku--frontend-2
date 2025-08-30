// src/pages/auth/components/ModalRegister.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import InputField from "@/components/common/main/InputField";

/* ==============================================
   ModalRegister (pakai InputField untuk form)
================================================= */

export type AngkatanOption = "2025/2026" | "2026/2027" | "2027/2028";

export type PendaftaranPayload = {
  angkatan: string;
  program: string;
  nama: string;
  email: string;
  phone: string;
  alamat: string;
  orangTua: string;
};

export type ModalRegisterProps = {
  initialOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (payload: PendaftaranPayload) => Promise<void> | void;
  angkatanOptions?: string[];
  programByAngkatan?: Record<string, string[]>;
  slug?: string;
  donePathTemplate?: string; // default "/:slug/murid"
};

const DEFAULT_ANGKATAN: AngkatanOption[] = [
  "2025/2026",
  "2026/2027",
  "2027/2028",
];
const DEFAULT_PROGRAMS: Record<string, string[]> = {
  "2025/2026": ["Kelas 1", "Kelas 2", "Kelas 3"],
  "2026/2027": ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4"],
  "2027/2028": ["Kelas 1", "Kelas 2"],
};
const DEFAULT_DONE_TEMPLATE = "/:slug/murid";

function resolveSlug(propSlug?: string, urlSlug?: string) {
  return propSlug || urlSlug || "sekolahku";
}
function fillPathTemplate(tpl: string, slug: string) {
  return tpl.replace(":slug", slug);
}
function isEmail(v: string) {
  return /.+@.+\..+/.test(v);
}
function isPhoneID(v: string) {
  const digits = (v.match(/\d/g) || []).length;
  return digits >= 8;
}

export function ModalRegister({
  initialOpen = false,
  onClose,
  onSubmit,
  angkatanOptions = DEFAULT_ANGKATAN,
  programByAngkatan = DEFAULT_PROGRAMS,
  slug: propSlug,
  donePathTemplate = DEFAULT_DONE_TEMPLATE,
}: ModalRegisterProps) {
  const navigate = useNavigate();
  const { slug: urlSlug } = useParams();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const [open, setOpen] = useState(initialOpen);
  const [step, setStep] = useState(0); // 0: Angkatan, 1: Program, 2: Form, 3: Konfirmasi
  const [loading, setLoading] = useState(false);

  const [angkatan, setAngkatan] = useState<string>("");
  const [program, setProgram] = useState("");
  const [form, setForm] = useState({
    nama: "",
    email: "",
    phone: "",
    alamat: "",
    orangTua: "",
  });
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const [submitError, setSubmitError] = useState<string>("");

  useEffect(() => setOpen(initialOpen), [initialOpen]);

  // Lock scroll saat modal terbuka
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus trap + auto focus
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const first = modalRef.current?.querySelector(
      "input,select,textarea,button"
    ) as HTMLElement | null;
    first?.focus();

    function onFocus(e: FocusEvent) {
      if (!modalRef.current) return;
      if (!modalRef.current.contains(e.target as Node)) {
        modalRef.current.focus();
      }
    }
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, [open, step]);

  // Shortcuts
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
      if (e.key === "Enter") {
        if (step === 0 && canNextAngkatan) setStep(1);
        else if (step === 1 && canNextProgram) setStep(2);
        else if (step === 2 && canSubmitForm && !loading) void handleSubmit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, angkatan, program, form, loading]);

  const percent = [25, 50, 75, 100][Math.min(step, 3)];
  const programs = useMemo(
    () => (angkatan ? programByAngkatan[angkatan] || [] : []),
    [angkatan, programByAngkatan]
  );

  const canNextAngkatan = Boolean(angkatan);
  const canNextProgram = Boolean(program);
  const canSubmitForm = Boolean(form.nama && form.email && form.phone);

  function resetAll() {
    setStep(0);
    setAngkatan("");
    setProgram("");
    setForm({ nama: "", email: "", phone: "", alamat: "", orangTua: "" });
    setErrors({});
    setSubmitError("");
    setLoading(false);
  }

  function handleClose() {
    setOpen(false);
    onClose?.();
  }

  function validateForm() {
    const e: { email?: string; phone?: string } = {};
    if (!isEmail(form.email)) e.email = "Format email tidak valid";
    if (!isPhoneID(form.phone)) e.phone = "Nomor HP kurang valid";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!canSubmitForm || loading) return;
    if (!validateForm()) return;
    setSubmitError("");

    try {
      setLoading(true);
      const payload = { angkatan, program, ...form } as PendaftaranPayload;
      await onSubmit?.(payload);
      setStep(3);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal mengirim pendaftaran. Coba lagi.";
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  }

  function goToDashboard() {
    const resolvedSlug = resolveSlug(propSlug, urlSlug);
    const target = fillPathTemplate(donePathTemplate, resolvedSlug);
    resetAll();
    setOpen(false);
    navigate(target);
  }

  return (
    <>
      <Btn palette={palette} onClick={() => setOpen(true)}>
        Buka Form Pendaftaran
      </Btn>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-register-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,.5)" }}
            onClick={handleClose}
          />

          {/* Panel */}
          <div
            ref={modalRef}
            tabIndex={-1}
            className="relative z-10 w-full max-w-lg rounded-2xl p-5 shadow-lg outline-none"
            style={{
              background: palette.white1,
              color: palette.black1,
              boxShadow: "0 10px 40px rgba(0,0,0,.2)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 id="modal-register-title" className="text-xl font-semibold">
                  Pendaftaran Peserta Baru
                </h2>
                <p className="text-sm" style={{ color: palette.silver2 }}>
                  Lengkapi langkah-langkah berikut untuk mendaftar.
                </p>
              </div>
              <Btn
                palette={palette}
                variant="ghost"
                onClick={handleClose}
                className="h-8 w-8 p-0 grid place-items-center"
                aria-label="Tutup"
                title="Tutup"
              >
                ✕
              </Btn>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div
                className="h-2 w-full overflow-hidden rounded-full"
                style={{ background: palette.white2 }}
                aria-label="Progres pendaftaran"
              >
                <div
                  className="h-full transition-all"
                  style={{ width: `${percent}%`, background: palette.primary }}
                />
              </div>
              <div className="mt-1 text-xs" style={{ color: palette.silver2 }}>
                Langkah {Math.min(step + 1, 4)} dari 4
              </div>
            </div>

            {/* Body */}
            <div className="mt-5 space-y-4">
              {/* Error submit */}
              {submitError && (
                <div
                  className="text-sm rounded-xl px-3 py-2 border"
                  style={{
                    borderColor: (palette as any).error1 ?? "#ef4444",
                    color: (palette as any).error1 ?? "#ef4444",
                    background:
                      (palette as any).error2 ?? "rgba(239,68,68,0.08)",
                  }}
                >
                  {submitError}
                </div>
              )}

              {/* Step 0: Angkatan */}
              {step === 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium">Angkatan</label>
                  <select
                    value={angkatan}
                    onChange={(e) => {
                      setAngkatan(e.target.value);
                      setProgram("");
                    }}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{
                      borderColor: palette.silver2,
                      background: palette.white2,
                      color: palette.black1,
                    }}
                  >
                    <option value="">Pilih angkatan</option>
                    {angkatanOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <div className="mt-4 flex items-center justify-between">
                    <span />
                    <Btn
                      palette={palette}
                      onClick={() => setStep(1)}
                      disabled={!canNextAngkatan}
                    >
                      Lanjut →
                    </Btn>
                  </div>
                </div>
              )}

              {/* Step 1: Program */}
              {step === 1 && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium">
                    Program/Kelas
                  </label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    disabled={!angkatan}
                    className="w-full rounded-lg border px-3 py-2 text-sm disabled:opacity-60"
                    style={{
                      borderColor: palette.silver2,
                      background: palette.white2,
                      color: palette.black1,
                    }}
                  >
                    <option value="">
                      {angkatan ? "Pilih program" : "Pilih angkatan dulu"}
                    </option>
                    {programs.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <div className="mt-4 flex items-center justify-between">
                    <Btn
                      palette={palette}
                      variant="ghost"
                      onClick={() => setStep(0)}
                    >
                      ← Kembali
                    </Btn>
                    <Btn
                      palette={palette}
                      onClick={() => setStep(2)}
                      disabled={!canNextProgram}
                    >
                      Lanjut →
                    </Btn>
                  </div>
                </div>
              )}

              {/* Step 2: Form (pakai InputField) */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                      label="Nama Lengkap"
                      name="nama"
                      value={form.nama}
                      onChange={(e) =>
                        setForm({ ...form, nama: e.target.value })
                      }
                      placeholder="Nama sesuai KTP/KK"
                    />

                    <div>
                      <InputField
                        label="Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder="nama@email.com"
                      />
                      {errors.email && (
                        <p
                          className="mt-1 text-xs"
                          style={{ color: (palette as any).error1 }}
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <InputField
                        label="No. HP"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        placeholder="08xxxxxxxxxx"
                      />
                      {errors.phone && (
                        <p
                          className="mt-1 text-xs"
                          style={{ color: (palette as any).error1 }}
                        >
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <InputField
                      label="Alamat"
                      name="alamat"
                      value={form.alamat}
                      onChange={(e) =>
                        setForm({ ...form, alamat: e.target.value })
                      }
                      placeholder="Alamat lengkap"
                    />

                    <InputField
                      label="Nama Orang Tua/Wali"
                      name="orangTua"
                      value={form.orangTua}
                      onChange={(e) =>
                        setForm({ ...form, orangTua: e.target.value })
                      }
                      placeholder="Nama orang tua/wali"
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <Btn
                      palette={palette}
                      variant="ghost"
                      onClick={() => setStep(1)}
                    >
                      ← Kembali
                    </Btn>
                    <Btn
                      palette={palette}
                      onClick={handleSubmit}
                      disabled={!canSubmitForm || loading}
                    >
                      {loading ? "Mengirim..." : "Daftar Sekarang"}
                    </Btn>
                  </div>
                </div>
              )}

              {/* Step 3: Konfirmasi */}
              {step === 3 && (
                <div className="py-4 text-center">
                  <div
                    className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full text-2xl"
                    style={{
                      background: (palette as any).success2 ?? "#dcfce7",
                      color: (palette as any).success1 ?? "#16a34a",
                    }}
                  >
                    ✓
                  </div>
                  <h3 className="text-lg font-semibold">
                    Pendaftaran Terkirim
                  </h3>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: palette.silver2 }}
                  >
                    Terima kasih, data Anda sudah kami terima untuk {angkatan} —{" "}
                    {program}. Silakan menunggu verifikasi dari Admin Sekolah.
                  </p>
                  <div className="mt-4">
                    <Btn palette={palette} onClick={goToDashboard}>
                      Selesai
                    </Btn>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function PendaftaranButtonWithModal(
  props: Omit<ModalRegisterProps, "initialOpen">
) {
  return <ModalRegister {...props} />;
}
