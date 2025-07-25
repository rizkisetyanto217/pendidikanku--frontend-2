import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  useEffect(() => {
    // Attach global callback from Google Sign-In
    window.handleCredentialResponse = async (response: any) => {
      try {
        const res = await api.post("/auth/login-google", {
          id_token: response.credential,
        });

        if (res.data.status === "success") {
          const user = res.data.data.user;
          const token = res.data.data.access_token;

          localStorage.setItem("userData", JSON.stringify(user));
          sessionStorage.setItem("token", token);

          switch (user.role) {
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
              navigate("/masjid/masjid-baitusalam");
            default:
              navigate("/login");
          }

          window.location.reload();
        } else {
          setError("Login Google gagal.");
        }
      } catch (err) {
        console.error("[GOOGLE LOGIN FAILED]", err);
        setError("Login Google gagal. Silakan coba lagi.");
      }
    };

    // Load Google Sign-In script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      delete (window as any).handleCredentialResponse;
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Harap isi email/username dan password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", { identifier, password });

      if (response.data.status === "success") {
        const user = response.data.data.user;
        const token = response.data.data.access_token;

        localStorage.setItem("userData", JSON.stringify(user));
        sessionStorage.setItem("token", token);

        switch (user.role) {
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
          default:
            navigate("/login");
        }

        window.location.reload();
      } else {
        setError("Login gagal, coba lagi.");
      }
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.message || "Login gagal, coba lagi.");
      } else if (error.request) {
        setError("Tidak ada respon dari server.");
      } else {
        setError("Terjadi kesalahan saat login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="login">
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label
            htmlFor="identifier"
            className="block text-sm"
            style={{ color: themeColors.black1 }}
          >
            Email / Username
          </label>
          <input
            type="text"
            id="identifier"
            name="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="w-full p-3 mt-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: themeColors.white1,
              color: themeColors.black1,
              borderColor: themeColors.silver2,
            }}
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm"
            style={{ color: themeColors.black1 }}
          >
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
              className="w-full p-3 mt-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: themeColors.white1,
                color: themeColors.black1,
                borderColor: themeColors.silver2,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 rounded"
              style={{ color: themeColors.silver2 }}
            >
              {showPassword ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm" style={{ color: themeColors.error1 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 text-white rounded-lg focus:outline-none transition`}
          style={{
            backgroundColor: loading
              ? themeColors.primary2
              : themeColors.primary,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Memproses..." : "Login"}
        </button>
      </form>

      {/* Divider */}
      <div
        className="my-6 text-center text-sm"
        style={{ color: themeColors.silver2 }}
      >
        — atau —
      </div>

      {/* Google Sign In */}
      <div
        id="g_id_onload"
        data-client_id="330051036041-8src8un315p823ap640hv70vp3448ruh.apps.googleusercontent.com"
        data-callback="handleCredentialResponse"
        data-auto_prompt="false"
      ></div>
      <div
        className="g_id_signin"
        data-type="standard"
        data-theme={isDark ? "outline" : "filled_blue"}
      ></div>
    </AuthLayout>
  );
}
