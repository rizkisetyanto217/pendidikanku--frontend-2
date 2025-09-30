import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/layout/AuthLayout";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import api from "@/lib/axios";
import GoogleIdentityButton from "@/pages/dashboard/auth/components/GoogleIdentityButton";

import {
  EyeIcon,
  EyeOffIcon,
  Mail,
  User,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const securityQuestions = [
  "Sebutkan nama orang",
  "Sebutkan istilah dalam islam",
  "Sebutkan sesuatu hal tentang dirimu",
];

type FormState = {
  user_name: string;
  email: string;
  password: string;
  confirm_password: string;
  security_question: string;
  security_answer: string;
};

export default function Register() {
  const [form, setForm] = useState<FormState>({
    user_name: "",
    email: "",
    password: "",
    confirm_password: "",
    security_question: "",
    security_answer: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const styles = useMemo(
    () => ({
      card: {
        backgroundColor: theme.white1,
        borderColor: theme.white3,
        color: theme.black1,
      },
      input: {
        backgroundColor: theme.white1,
        color: theme.black1,
        borderColor: theme.white3,
      },
      inputFocus: {
        borderColor: theme.primary,
        boxShadow: `0 0 0 3px ${theme.primary}22`,
      },
      muted: { color: theme.silver2 },
      primaryBtn: {
        backgroundColor: loading ? theme.primary2 : theme.primary,
        color: theme.white1,
      },
      ghostBtn: {
        backgroundColor: "transparent",
        borderColor: theme.white3,
        color: theme.black1,
      },
      progressBg: {
        backgroundColor: theme.white2,
      },
      divider: {
        backgroundColor: theme.white3,
      },
    }),
    [theme, loading, isDark]
  );

  // validation helpers
  const emailValid = /^\S+@\S+\.\S+$/.test(form.email);
  const usernameValid = form.user_name.trim().length >= 3;
  const passwordValid = form.password.length >= 8;
  const pwdMatch =
    form.password === form.confirm_password && form.password.length > 0;
  const step1Valid = usernameValid && emailValid && passwordValid && pwdMatch;
  const step2Valid =
    !!form.security_question && form.security_answer.trim().length > 0;

  return (
    <AuthLayout mode="register" fullWidth contentClassName="max-w-md mx-auto">
      {/* Brand */}
      <div className="text-center mb-8">
        <img
          src="https://picsum.photos/200/300"
          alt="Logo"
          className="h-16 w-16  rounded-2xl mx-auto mb-4 object-cover shadow-md"
        />
        <h1 className="text-2xl font-bold mb-1" style={{ color: theme.black1 }}>
          SekolahIslamku Suite
        </h1>
        <p className="text-sm" style={styles.muted}>
          Satu platform untuk operasional sekolah yang rapi & efisien
        </p>
      </div>

      {/* Card */}
      <div
        className="max-w-md mx-auto  rounded-2xl p-8 shadow-lg border transition-shadow hover:shadow-xl"
        style={styles.card}
      >
        {/* Header + Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: theme.black1 }}
            >
              Buat Akun Baru
            </h2>
            <span
              className="text-xs font-medium px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: `${theme.primary}15`,
                color: theme.primary,
              }}
            >
              Langkah {step} / 2
            </span>
          </div>
          <div
            className="h-1.5 w-full rounded-full overflow-hidden"
            style={styles.progressBg}
          >
            <div
              className="h-full transition-all duration-500 ease-out rounded-full"
              style={{
                width: step === 1 ? "50%" : "100%",
                backgroundColor: theme.primary,
              }}
            />
          </div>
        </div>

        {/* Google Sign-Up */}
        {step === 1 && (
          <div className="mb-6">
            <GoogleIdentityButton
              clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              onSuccess={() => navigate("/register-detail-sekolah")}
              theme={isDark ? "outline" : "filled_blue"}
              size="large"
              text="signup_with"
              className="w-full rounded-xl"
            />
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1" style={styles.divider} />
              <span className="text-xs font-medium" style={styles.muted}>
                atau daftar manual
              </span>
              <div className="h-px flex-1" style={styles.divider} />
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl px-4 py-3 text-sm border border-red-200 bg-red-50 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl px-4 py-3 text-sm border border-green-200 bg-green-50 text-green-700">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* FORM */}
        <form className="space-y-5">
          {step === 1 ? (
            <>
              <InputField
                label="Username"
                icon={<User className="h-5 w-5" style={styles.muted} />}
                value={form.user_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, user_name: e.target.value }))
                }
                placeholder="Minimal 3 karakter"
                styles={styles}
                valid={usernameValid || form.user_name.length === 0}
              />
              <InputField
                label="Email"
                type="email"
                icon={<Mail className="h-5 w-5" style={styles.muted} />}
                value={form.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="nama@email.com"
                styles={styles}
                valid={emailValid || form.email.length === 0}
              />
              <PasswordField
                label="Password"
                value={form.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                show={showPw}
                toggle={() => setShowPw((s) => !s)}
                styles={styles}
                helper="≥8 karakter, kombinasi huruf & angka"
              />
              <PasswordField
                label="Konfirmasi Password"
                value={form.confirm_password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, confirm_password: e.target.value }))
                }
                show={showPw2}
                toggle={() => setShowPw2((s) => !s)}
                styles={styles}
                valid={pwdMatch || form.confirm_password.length === 0}
              />

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!step1Valid}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all hover:opacity-90 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  style={styles.primaryBtn}
                >
                  Lanjutkan
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: theme.black1 }}
                >
                  Pertanyaan Keamanan
                </label>
                <div className="relative">
                  <ShieldCheck
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                    style={styles.muted}
                  />
                  <select
                    className="w-full rounded-xl border pl-10 pr-4 py-3 outline-none transition-all focus:ring-2"
                    style={styles.input}
                    value={form.security_question}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setForm((f) => ({
                        ...f,
                        security_question: e.target.value,
                      }))
                    }
                  >
                    <option value="">Pilih pertanyaan…</option>
                    {securityQuestions.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <InputField
                label="Jawaban Keamanan"
                icon={<Lock className="h-5 w-5" style={styles.muted} />}
                value={form.security_answer}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, security_answer: e.target.value }))
                }
                placeholder="Masukkan jawaban Anda"
                styles={styles}
              />

              <div
                className="flex items-center gap-2 text-xs rounded-lg p-3"
                style={{
                  backgroundColor: `${theme.primary}08`,
                  color: theme.silver2,
                }}
              >
                <ShieldCheck
                  className="h-4 w-4"
                  style={{ color: theme.primary }}
                />
                <span>Data Anda dienkripsi dan aman</span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 border font-medium transition-all hover:bg-opacity-80"
                  style={styles.ghostBtn}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={!step2Valid || loading}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all hover:opacity-90 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  style={styles.primaryBtn}
                >
                  {loading ? "Memproses..." : "Selesai"}
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </form>

        {/* Footer Link */}
        {step === 1 && (
          <div className="mt-6 text-center text-sm">
            <span style={styles.muted}>Sudah punya akun? </span>
            <button
              onClick={() => navigate("/login")}
              className="font-semibold hover:underline"
              style={{ color: theme.primary }}
            >
              Login
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

/* --- Subcomponents --- */
function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  styles,
  valid = true,
}: any) {
  return (
    <div>
      <label
        className="block text-sm font-semibold mb-2"
        style={{ color: styles.input.color }}
      >
        {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border pl-10 pr-4 py-3 outline-none transition-all focus:ring-2 ${!valid && value.length > 0 ? "border-red-400" : ""}`}
          style={{
            ...styles.input,
            borderColor:
              !valid && value.length > 0 ? "#f87171" : styles.input.borderColor,
          }}
        />
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  toggle,
  styles,
  helper,
  valid = true,
}: any) {
  return (
    <div>
      <label
        className="block text-sm font-semibold mb-2"
        style={{ color: styles.input.color }}
      >
        {label}
      </label>
      <div className="relative">
        <Lock
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
          style={styles.muted}
        />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border pl-10 pr-12 py-3 outline-none transition-all focus:ring-2 ${!valid && value.length > 0 ? "border-red-400" : ""}`}
          style={{
            ...styles.input,
            borderColor:
              !valid && value.length > 0 ? "#f87171" : styles.input.borderColor,
          }}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {show ? (
            <EyeOffIcon className="h-5 w-5" style={styles.muted} />
          ) : (
            <EyeIcon className="h-5 w-5" style={styles.muted} />
          )}
        </button>
      </div>
      {helper && (
        <p
          className="mt-1.5 text-xs flex items-center gap-1.5"
          style={styles.muted}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {helper}
        </p>
      )}
    </div>
  );
}
