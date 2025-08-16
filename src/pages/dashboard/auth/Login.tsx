import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import AuthLayout from "@/layout/AuthLayout";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import api from "@/lib/axios";

declare global {
  interface Window {
    handleCredentialResponse: (response: any) => void;
  }
}

export default function Login() {
  const { slug } = useParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const redirectToDashboard = (role: string) => {
    switch (role) {
      case "dkm":     navigate("/dkm"); break;
      case "author":  navigate("/author"); break;
      case "admin":   navigate("/admin"); break;
      case "teacher": navigate("/teacher"); break;
      case "user":
      default: {
        const target = slug ? `/masjid/${slug}` : "/masjid/masjid-baitussalam";
        navigate(target, { replace: true });
        break;
      }
    }
    // optional — kalau pakai global state auth, ini bisa dihapus
    window.location.reload();
  };

  // ==== GOOGLE LOGIN CALLBACK ====
  useEffect(() => {
    window.handleCredentialResponse = async (response: any) => {
      try {
        const res = await api.post("/auth/login-google", {
          id_token: response.credential,
        });

        // ⬇️ SIMPAN TOKEN
        const token = res.data?.data?.access_token ?? res.data?.access_token;
        if (token) localStorage.setItem("access_token", token);

        // ⬇️ /me sekarang bawa Authorization: Bearer ...
        const me = await api.get("/api/auth/me");
        const role = me.data.user?.role ?? "user";
        redirectToDashboard(role);
      } catch (err) {
        console.error("[GOOGLE LOGIN ERROR]", err);
        setError("Login Google gagal. Silakan coba lagi.");
      }
    };

    // load GIS script sekali
    if (!document.getElementById("google-identity")) {
      const script = document.createElement("script");
      script.id = "google-identity";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [navigate, slug]);

  // ==== FORM LOGIN MANUAL ====
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

      // ⬇️ SIMPAN TOKEN
      const token = res.data?.data?.access_token ?? res.data?.access_token;
      if (token) localStorage.setItem("access_token", token);

      // ⬇️ /me sekarang bawa Authorization
      const me = await api.get("/api/auth/me");
      const role = me.data.user?.role ?? "user";
      redirectToDashboard(role);
    } catch (err: any) {
      if (err.response) setError(err.response.data.message || "Login gagal, coba lagi.");
      else if (err.request) setError("Tidak ada respon dari server.");
      else setError("Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="login">
      <form onSubmit={handleLogin}>
        {/* Identifier */}
        <div className="mb-4">
          <label htmlFor="identifier" className="block text-sm" style={{ color: themeColors.black1 }}>
            Email / Username
          </label>
          <input
            type="text"
            id="identifier"
            name="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
            className="w-full p-3 mt-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{ backgroundColor: themeColors.white1, color: themeColors.black1, borderColor: themeColors.silver2 }}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm" style={{ color: themeColors.black1 }}>
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full p-3 mt-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ backgroundColor: themeColors.white1, color: themeColors.black1, borderColor: themeColors.silver2 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 rounded"
              style={{ color: themeColors.silver2 }}
            >
              {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm" style={{ color: themeColors.error1 }}>
            {error}
          </div>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white rounded-lg focus:outline-none transition"
          style={{
            backgroundColor: loading ? themeColors.primary2 : themeColors.primary,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Memproses..." : "Login"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 text-center text-sm" style={{ color: themeColors.silver2 }}>
        — atau —
      </div>

      {/* Google Sign-In */}
      <div
        id="g_id_onload"
        data-client_id="330051036041-8src8un315p823ap640hv70vp3448ruh.apps.googleusercontent.com"
        data-callback="handleCredentialResponse"
        data-auto_prompt="false"
      />
      <div className="flex justify-center">
        <div
          className="g_id_signin w-full max-w-sm"
          data-type="standard"
          data-size="large"
          data-theme={isDark ? "outline" : "filled_blue"}
          // data-width="320"   {/* <- width harus ANGKA, jangan "100%" */}
        />
      </div>
    </AuthLayout>
  );
}
