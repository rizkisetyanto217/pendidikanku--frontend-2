// src/pages/auth/Login.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  EyeIcon,
  EyeOffIcon,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import AuthLayout from "@/layout/AuthLayout";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import api from "@/lib/axios";
import GoogleIdentityButton from "@/pages/dashboard/auth/components/GoogleIdentityButton";
import LegalModal from "@/pages/dashboard/auth/components/LegalPrivacyModal"; // ⬅️ import modal

export default function Login() {
  const { slug } = useParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ⬅️ state untuk buka modal & tab awal
  const [openLegal, setOpenLegal] = useState<false | "tos" | "privacy">(false);

  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

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
      ringFocus: `0 0 0 3px ${theme.primary}33`,
    }),
    [theme, loading]
  );

  const redirectToDashboard = (role: string) => {
    switch (role) {
      case "dkm":
        navigate("/dkm");
        break;
      case "author":
        navigate("/author");
        break;
      case "admin":
        navigate("/admin");
        break;
      case "teacher":
        navigate("/teacher");
        break;
      case "user":
      default: {
        const target = slug ? `/masjid/${slug}` : "/masjid/masjid-baitussalam";
        navigate(target, { replace: true });
        break;
      }
    }
    window.location.reload();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!identifier || !password) {
      setError("Harap isi email/username dan password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { identifier, password });
      const token = res.data?.data?.access_token ?? res.data?.access_token;
      if (token) {
        if (remember) localStorage.setItem("access_token", token);
        else sessionStorage.setItem("access_token", token);
      }

      const me = await api.get("/api/auth/me");
      const role = me.data.user?.role ?? "user";
      redirectToDashboard(role);
    } catch (err: any) {
      if (err.response)
        setError(err.response.data.message || "Login gagal, coba lagi.");
      else if (err.request) setError("Tidak ada respon dari server.");
      else setError("Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (credential: string) => {
    try {
      const res = await api.post("/auth/login-google", {
        id_token: credential,
      });
      const token = res.data?.data?.access_token ?? res.data?.access_token;
      if (token) localStorage.setItem("access_token", token);

      const me = await api.get("/api/auth/me");
      const role = me.data.user?.role ?? "user";
      redirectToDashboard(role);
    } catch (err) {
      console.error("[GOOGLE LOGIN ERROR]", err);
      setError("Login Google gagal. Silakan coba lagi.");
    }
  };

  return (
    <AuthLayout mode="login" fullWidth contentClassName="max-w-xl mx-auto">
      {/* Brand */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2">
          <img
            src="https://picsum.photos/200/300"
            alt="Logo"
            className="h-10 w-10 rounded object-cover"
          />
          <div className="text-left">
            <div className="font-bold text-lg" style={{ color: theme.black1 }}>
              SekolahIslamku Suite
            </div>
            <div className="text-xs" style={styles.muted}>
              Satu platform untuk operasional sekolah yang rapi & efisien
            </div>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="w-full rounded-2xl p-6 md:p-8" style={styles.card}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: theme.black1 }}>
            Masuk ke Akun Anda
          </h1>
          <p className="text-sm mt-1" style={styles.muted}>
            Gunakan kredensial yang terdaftar oleh sekolah Anda.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-5 rounded-xl px-3 py-2 text-sm border"
            role="alert"
            style={{
              backgroundColor: isDark
                ? `${theme.error1}10`
                : `${theme.error1}0D`,
              borderColor: `${theme.error1}33`,
              color: theme.error1,
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Identifier */}
          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium"
              style={{ color: theme.black1 }}
            >
              Email / Username
            </label>
            <div className="relative mt-2">
              <span className="absolute inset-y-0 left-3 flex items-center">
                <Mail className="h-5 w-5" style={styles.muted as any} />
              </span>
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
                className="w-full rounded-xl border px-10 py-3 outline-none focus:ring"
                style={{ ...styles.input, boxShadow: `0 0 0 0px transparent` }}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = styles.ringFocus)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium"
                style={{ color: theme.black1 }}
              >
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-xs hover:underline"
                style={{ color: theme.primary }}
              >
                Lupa password?
              </a>
            </div>
            <div className="relative mt-2">
              <span className="absolute inset-y-0 left-3 flex items-center">
                <Lock className="h-5 w-5" style={styles.muted as any} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border px-10 py-3 outline-none focus:ring"
                style={{ ...styles.input, boxShadow: `0 0 0 0px transparent` }}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = styles.ringFocus)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1"
                style={{ color: theme.silver2 }}
              >
                {showPassword ? (
                  <EyeOffIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember + security note */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <label
              className="inline-flex items-center gap-2 text-sm"
              style={{ color: theme.black1 }}
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border"
                style={{ borderColor: theme.white3 }}
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Ingat saya
            </label>
            <span
              className="inline-flex items-center gap-1 text-xs"
              style={styles.muted}
            >
              <ShieldCheck className="h-4 w-4" />
              Data Anda aman & terenkripsi
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={styles.primaryBtn}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Memproses...
              </>
            ) : (
              <>
                Masuk <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div
            className="h-px flex-1"
            style={{ backgroundColor: theme.white3 }}
          />
          <div className="text-xs" style={styles.muted}>
            atau
          </div>
          <div
            className="h-px flex-1"
            style={{ backgroundColor: theme.white3 }}
          />
        </div>

        {/* Google Sign-In (reusable) */}
        <div className="w-full flex justify-center">
          <GoogleIdentityButton
            clientId="330051036041-8src8un315p823ap640hv70vp3448ruh.apps.googleusercontent.com"
            onSuccess={onGoogleSuccess}
            theme={isDark ? "outline" : "filled_blue"}
            size="large"
            text="continue_with"
            className="w-full max-w-sm"
          />
        </div>

        {/* Ketentuan -> buka modal */}
        <div className="mt-6 text-xs text-center" style={styles.muted}>
          Dengan masuk, Anda menyetujui{" "}
          <button
            type="button"
            onClick={() => setOpenLegal("tos")}
            className="hover:underline"
            style={{ color: theme.primary }}
          >
            S&K
          </button>{" "}
          dan{" "}
          <button
            type="button"
            onClick={() => setOpenLegal("privacy")}
            className="hover:underline"
            style={{ color: theme.primary }}
          >
            Kebijakan Privasi
          </button>
          .
        </div>
      </div>

      {/* ===== Modal S&K / Privasi ===== */}
      <LegalModal
        open={!!openLegal}
        initialTab={openLegal === "privacy" ? "privacy" : "tos"}
        onClose={() => setOpenLegal(false)}
        // showAccept // <- aktifkan kalau perlu tombol “Saya Setuju”
        // onAccept={() => setOpenLegal(false)}
      />
    </AuthLayout>
  );
}
