// src/pages/auth/Register.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/layout/AuthLayout";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import api from "@/lib/axios";
// import GoogleIdentityButton from "@/pages/dashboard/auth/components/GoogleIdentityButton";

import {
  EyeIcon,
  EyeOffIcon,
  Mail,
  User,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

type FormState = {
  user_name: string;
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
};

type RegisterResponse = {
  data: null;
  message?: string;
};

export default function Register() {
  const [form, setForm] = useState<FormState>({
    user_name: "",
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

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
      muted: { color: theme.silver2 },
      primaryBtn: {
        backgroundColor: loading ? theme.primary2 : theme.primary,
        color: theme.white1,
      },
      divider: { backgroundColor: theme.white3 },
    }),
    [theme, loading]
  );

  // Validations
  const emailValid = /^\S+@\S+\.\S+$/.test(form.email);
  const usernameValid = form.user_name.trim().length >= 3;
  const fullnameValid = form.full_name.trim().length >= 3;
  const passwordValid = form.password.length >= 8;
  const pwdMatch =
    form.password === form.confirm_password && form.password.length > 0;

  const canSubmit =
    emailValid && usernameValid && fullnameValid && passwordValid && pwdMatch;

  const handleChange =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setForm((f) => ({ ...f, [key]: v }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // ⬇️ Sesuai payload Postman
      const payload: FormState = {
        user_name: form.user_name.trim(),
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirm_password: form.confirm_password,
      };

      const res = await api.post<RegisterResponse>("/auth/register", payload);

      setSuccess(res.data?.message || "Registration successful");
      // Opsional: redirect ke login setelah sukses
      setTimeout(() => navigate("/login"), 800);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Pendaftaran gagal. Silakan coba lagi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="register" fullWidth contentClassName="max-w-md mx-auto">
      {/* Brand */}
      <div className="text-center mb-8">
        <img
          src="https://picsum.photos/200/300"
          alt="Logo"
          className="h-16 w-16 rounded-2xl mx-auto mb-4 object-cover shadow-md"
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
        className="max-w-md mx-auto rounded-2xl p-8 shadow-lg border transition-shadow hover:shadow-xl"
        style={styles.card}
      >
        <h2
          className="text-xl font-semibold mb-6"
          style={{ color: theme.black1 }}
        >
          Buat Akun Baru
        </h2>

        {/* Google (opsional) */}
        {/* <div className="mb-6">
          <GoogleIdentityButton
            clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
            onSuccess={() => navigate("/login")}
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
        </div> */}

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
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Field
            label="Username"
            icon={<User className="h-5 w-5" style={styles.muted} />}
            value={form.user_name}
            onChange={handleChange("user_name")}
            placeholder="Minimal 3 karakter"
            styles={styles}
            invalid={form.user_name.length > 0 && !usernameValid}
          />

          <Field
            label="Nama Lengkap"
            icon={<User className="h-5 w-5" style={styles.muted} />}
            value={form.full_name}
            onChange={handleChange("full_name")}
            placeholder="Nama lengkap Anda"
            styles={styles}
            invalid={form.full_name.length > 0 && !fullnameValid}
          />

          <Field
            label="Email"
            type="email"
            icon={<Mail className="h-5 w-5" style={styles.muted} />}
            value={form.email}
            onChange={handleChange("email")}
            placeholder="nama@email.com"
            styles={styles}
            invalid={form.email.length > 0 && !emailValid}
          />

          <PasswordField
            label="Password"
            value={form.password}
            onChange={handleChange("password")}
            show={showPw}
            toggle={() => setShowPw((s) => !s)}
            styles={styles}
            helper="≥8 karakter, kombinasi huruf & angka"
            invalid={form.password.length > 0 && !passwordValid}
          />

          <PasswordField
            label="Konfirmasi Password"
            value={form.confirm_password}
            onChange={handleChange("confirm_password")}
            show={showPw2}
            toggle={() => setShowPw2((s) => !s)}
            styles={styles}
            invalid={form.confirm_password.length > 0 && !pwdMatch}
          />

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={styles.primaryBtn}
          >
            {loading ? (
              "Memproses..."
            ) : (
              <>
                Daftar <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span style={styles.muted}>Sudah punya akun? </span>
          <button
            onClick={() => navigate("/login")}
            className="font-semibold hover:underline"
            style={{ color: theme.primary }}
          >
            Masuk
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}

/* ---------- Reusable Inputs ---------- */
function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  styles,
  invalid = false,
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
          className="w-full rounded-xl border pl-10 pr-4 py-3 outline-none transition-all focus:ring-2"
          style={{
            ...styles.input,
            borderColor: invalid ? "#f87171" : styles.input.borderColor,
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
  invalid = false,
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
          className="w-full rounded-xl border pl-10 pr-12 py-3 outline-none transition-all focus:ring-2"
          style={{
            ...styles.input,
            borderColor: invalid ? "#f87171" : styles.input.borderColor,
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
        <p className="mt-1.5 text-xs" style={styles.muted}>
          {helper}
        </p>
      )}
    </div>
  );
}
