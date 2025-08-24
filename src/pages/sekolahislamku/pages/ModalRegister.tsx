import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

// ==============================================
// ModalRegister (Refactor Penuh, pakai Palette + Btn)
// - Semua tombol pakai <Btn palette={palette}> (kecuali select/input)
// - Warna mengikuti tema via colorsThema + useHtmlDarkMode
// - onSubmit mendukung async (loading state)
// - Navigasi ke "/:slug/murid" setelah selesai
// ==============================================

// ===== Types =====
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
  /** buka modal saat render pertama */
  initialOpen?: boolean;
  /** callback ketika modal ditutup */
  onClose?: () => void;
  /** callback ketika submit; kalau mengembalikan Promise, tombol akan loading */
  onSubmit?: (payload: PendaftaranPayload) => Promise<void> | void;
  /** override daftar angkatan */
  angkatanOptions?: string[];
  /** override mapping program per angkatan */
  programByAngkatan?: Record<string, string[]>;
  /** opsional: paksa slug; bila kosong akan baca dari URL */
  slug?: string;
  /** setelah selesai, path tujuan; default "/:slug/murid" */
  donePathTemplate?: string; // contoh: "/:slug/murid"
};

// ===== Defaults =====
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

// ===== Utilities =====
function resolveSlug(
  propSlug: string | undefined,
  urlSlug: string | undefined
) {
  return propSlug || urlSlug || "sekolahku";
}

function fillPathTemplate(tpl: string, slug: string) {
  return tpl.replace(":slug", slug);
}

function isEmail(v: string) {
  // ringan saja, bukan RFC lengkap
  return /.+@.+\..+/.test(v);
}

function isPhoneID(v: string) {
  // sederhana: angka, +, spasi, strip; min 8 digit
  const digits = (v.match(/\d/g) || []).length;
  return digits >= 8;
}

// ===== Komponen Utama =====
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
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

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

  const percent = [25, 50, 75, 100][step] || 0;
  const programs = useMemo(
    () => (angkatan ? programByAngkatan[angkatan] || [] : []),
    [angkatan, programByAngkatan]
  );

  const canNextAngkatan = Boolean(angkatan);
  const canNextProgram = Boolean(program);
  const canSubmitForm = Boolean(form.nama && form.email && form.phone);

  // Close with ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function resetAll() {
    setStep(0);
    setAngkatan("");
    setProgram("");
    setForm({ nama: "", email: "", phone: "", alamat: "", orangTua: "" });
    setErrors({});
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
    try {
      setLoading(true);
      const payload = { angkatan, program, ...form } as PendaftaranPayload;
      await onSubmit?.(payload);
      setStep(3);
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,.5)" }}
            onClick={handleClose}
          />

          {/* Modal */}
          <div
            className="relative z-10 w-full max-w-lg rounded-2xl p-5 shadow-lg"
            style={{
              background: palette.white1,
              color: palette.black1,
              boxShadow: "0 10px 40px rgba(0,0,0,.2)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
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
              >
                ✕
              </Btn>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div
                className="h-2 w-full overflow-hidden rounded-full"
                style={{ background: palette.white2 }}
              >
                <div
                  className="h-full transition-all"
                  style={{ width: `${percent}%`, background: palette.primary }}
                />
              </div>
              <div className="mt-1 text-xs" style={{ color: palette.silver2 }}>
                Langkah {step + 1} dari 4
              </div>
            </div>

            {/* Body */}
            <div className="mt-5 space-y-4">
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

              {/* Step 2: Form */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium">
                        Nama Lengkap
                      </label>
                      <input
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                        style={{
                          borderColor: palette.silver2,
                          background: palette.white2,
                          color: palette.black1,
                        }}
                        placeholder="Nama sesuai KTP/KK"
                        value={form.nama}
                        onChange={(e) =>
                          setForm({ ...form, nama: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Email</label>
                      <input
                        type="email"
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                        style={{
                          borderColor: palette.silver2,
                          background: palette.white2,
                          color: palette.black1,
                        }}
                        placeholder="nama@email.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                      {errors.email && (
                        <p
                          className="mt-1 text-xs"
                          style={{ color: palette.error1 }}
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        No. HP
                      </label>
                      <input
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                        style={{
                          borderColor: palette.silver2,
                          background: palette.white2,
                          color: palette.black1,
                        }}
                        placeholder="08xxxxxxxxxx"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                      />
                      {errors.phone && (
                        <p
                          className="mt-1 text-xs"
                          style={{ color: palette.error1 }}
                        >
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium">
                        Alamat
                      </label>
                      <input
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                        style={{
                          borderColor: palette.silver2,
                          background: palette.white2,
                          color: palette.black1,
                        }}
                        placeholder="Alamat lengkap"
                        value={form.alamat}
                        onChange={(e) =>
                          setForm({ ...form, alamat: e.target.value })
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium">
                        Nama Orang Tua/Wali
                      </label>
                      <input
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                        style={{
                          borderColor: palette.silver2,
                          background: palette.white2,
                          color: palette.black1,
                        }}
                        placeholder="Nama orang tua/wali"
                        value={form.orangTua}
                        onChange={(e) =>
                          setForm({ ...form, orangTua: e.target.value })
                        }
                      />
                    </div>
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
                      background: palette.success2,
                      color: palette.success1,
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
                    Terima kasih, data Anda sudah kami terima untuk {angkatan} -{" "}
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

/**
 * Komponen praktis: tombol + modal
 * Pakai ini kalau mau langsung render tombol “Buka Form Pendaftaran”
 */
export function PendaftaranButtonWithModal(
  props: Omit<ModalRegisterProps, "initialOpen">
) {
  return <ModalRegister {...props} />;
}
