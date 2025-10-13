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
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import api, { setAuthToken } from "@/lib/axios";
// import GoogleIdentityButton from "@/pages/dashboard/auth/components/GoogleIdentityButton";
import LegalModal from "@/pages/dashboard/auth/components/LegalPrivacyModal";

/* ===== Types ===== */
type MasjidRole = {
  masjid_id: string;
  roles: Array<"dkm" | "teacher" | "student" | "admin" | "user">;
};
type User = {
  id: string;
  full_name: string;
  email?: string;
  user_name?: string;
  masjid_ids?: string[];
  masjid_roles?: MasjidRole[];
  roles_global?: string[];
  active_masjid_id?: string | null;
};
type LoginApiResponse = {
  data: {
    user: User;
    access_token: string;
  };
  message?: string;
};

/* ===== Utils ===== */
const FORCE_RELOAD_AFTER_REDIRECT = true;

function pickActiveMasjidId(user?: User): string | null {
  if (!user) return null;
  return (
    user.active_masjid_id ||
    (user.masjid_ids && user.masjid_ids.length > 0 ? user.masjid_ids[0] : null)
  );
}
function derivePrimaryRole(
  user?: User
): "dkm" | "teacher" | "student" | "admin" | "user" {
  const list = user?.masjid_roles ?? [];
  if (list.some((mr) => mr.roles?.includes("dkm"))) return "dkm";
  if (list.some((mr) => mr.roles?.includes("teacher"))) return "teacher";
  if (list.some((mr) => mr.roles?.includes("student"))) return "student";
  if (list.some((mr) => mr.roles?.includes("admin"))) return "admin";
  return "user";
}
async function redirectAfterLogin({
  primaryRole,
  user,
  slugParam,
  navigate,
}: {
  primaryRole: "dkm" | "teacher" | "student" | "admin" | "user";
  user: User;
  slugParam?: string;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const masjidId = pickActiveMasjidId(user);
  if (masjidId) localStorage.setItem("ctx_masjid_id", masjidId);

  const slug = slugParam || masjidId || "default";
  switch (primaryRole) {
    case "dkm":
      navigate(`/${slug}/sekolah`, { replace: true });
      break;
    case "teacher":
      navigate(`/${slug}/guru`, { replace: true });
      break;
    case "student":
      navigate(`/${slug}/murid`, { replace: true });
      break;
    case "admin":
      navigate(`/admin`, { replace: true });
      break;
    default:
      navigate(`/${slug}/murid`, { replace: true });
      break;
  }
  if (FORCE_RELOAD_AFTER_REDIRECT) window.location.reload();
}

/* ===== Component ===== */
export default function Login() {
  const { slug: slugParam } = useParams();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openLegal, setOpenLegal] = useState<false | "tos" | "privacy">(false);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Harap isi email/username dan password kamu.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<LoginApiResponse>("/auth/login", {
        identifier,
        password,
      });

      const { data } = res.data;
      if (!data?.access_token || !data?.user)
        throw new Error("Login gagal: data tidak lengkap.");

      // ✅ simpan token ke COOKIE (remember → 30 hari; else session)
      setAuthToken(data.access_token, remember);

      // ✅ simpan user ringkas (opsional)
      try {
        localStorage.setItem("auth_user", JSON.stringify(data.user));
      } catch {}

      // ✅ redirect berdasar role
      const primaryRole = derivePrimaryRole(data.user);
      await redirectAfterLogin({
        primaryRole,
        user: data.user,
        slugParam,
        navigate,
      });
    } catch (err: any) {
      console.error("[LOGIN ERROR]", err);
      if (err?.response?.data?.message) setError(err.response.data.message);
      else setError("Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (credential: string) => {
    setLoading(true);
    try {
      const res = await api.post<LoginApiResponse>("/auth/login-google", {
        id_token: credential,
      });

      const { data } = res.data;
      if (!data?.access_token || !data?.user)
        throw new Error("Login Google gagal: data tidak lengkap.");

      setAuthToken(data.access_token, true);
      try {
        localStorage.setItem("auth_user", JSON.stringify(data.user));
      } catch {}

      const primaryRole = derivePrimaryRole(data.user);
      await redirectAfterLogin({
        primaryRole,
        user: data.user,
        slugParam,
        navigate,
      });
    } catch (err) {
      console.error("[GOOGLE LOGIN ERROR]", err);
      setError("Login Google gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
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
              SekolahIslamKu Suite
            </div>
            <div className="text-xs" style={styles.muted}>
              Satu platform untuk operasional sekolah yang rapi & efisien
            </div>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="w-full rounded-2xl p-6 md:p-8" style={styles.card}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: theme.black1 }}>
          Masuk ke Akun Anda
        </h1>
        <p className="text-sm mb-6" style={styles.muted}>
          Gunakan kredensial yang terdaftar oleh sekolah Anda.
        </p>

        {error && (
          <div
            className="mb-4 rounded-xl px-3 py-2 text-sm border"
            style={{
              backgroundColor: `${theme.error1}10`,
              borderColor: `${theme.error1}33`,
              color: theme.error1,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Identifier */}
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium">
              Email / Username
            </label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full rounded-xl border px-10 py-3 outline-none focus:ring"
                style={styles.input}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border px-10 py-3 outline-none focus:ring"
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showPassword ? (
                  <EyeOffIcon size={18} />
                ) : (
                  <EyeIcon size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Remember */}
          <div className="flex justify-between items-center text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Ingat saya
            </label>
            <span
              className="inline-flex items-center gap-1 text-xs"
              style={styles.muted}
            >
              <ShieldCheck className="h-4 w-4" /> Data Anda aman
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            style={styles.primaryBtn}
          >
            {loading ? (
              "Memproses..."
            ) : (
              <>
                Masuk <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <div className="text-xs" style={styles.muted}>
            atau
          </div>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google Sign-In (opsional) */}
        {/* <GoogleIdentityButton onSuccess={onGoogleSuccess} ... /> */}

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
        </div>
      </div>

      <LegalModal
        open={!!openLegal}
        initialTab={openLegal === "privacy" ? "privacy" : "tos"}
        onClose={() => setOpenLegal(false)}
      />
    </AuthLayout>
  );
}
