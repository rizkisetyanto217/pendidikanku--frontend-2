// src/components/layout/AuthLayout.tsx
import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

// ⬇️ Import modal pilihan pendaftaran (bukan role)
import RegisterChoiceModal from "@/pages/dashboard/auth/components/RegisterModalChoice";

type AuthLayoutProps = {
  children: React.ReactNode;
  mode?: "login" | "register";
  fullWidth?: boolean;
  contentClassName?: string;
};

export default function AuthLayout({
  children,
  mode = "login",
  fullWidth = false,
  contentClassName = "",
}: AuthLayoutProps) {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const isLogin = mode === "login";

  const navigate = useNavigate();
  const [openChoice, setOpenChoice] = useState(false);

  const handleOpenChoice = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // cegah Link langsung pindah halaman
    setOpenChoice(true);
  }, []);

  // ⬇️ Handler netral: map pilihan ke rute register
  const handleSelectChoice = useCallback(
    (choice: "school" | "user") => {
      setOpenChoice(false);
      if (choice === "school") {
        navigate("/register-sekolah");
      } else {
        navigate("/register-user");
      }
    },
    [navigate]
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center w-full"
      style={{
        background: isDark
          ? `linear-gradient(180deg, ${theme.white1} 0%, ${theme.white2} 100%)`
          : `linear-gradient(180deg, ${theme.white2} 0%, ${theme.white1} 100%)`,
        color: theme.black1,
      }}
    >
      <div
        className={[
          "rounded-xl shadow-md w-full border",
          fullWidth ? "max-w-none px-4 sm:px-6 lg:px-8 py-8" : "max-w-md p-8",
          contentClassName,
        ].join(" ")}
        style={{ backgroundColor: theme.white1, borderColor: theme.white3 }}
      >
        {/* Konten Halaman */}
        {children}

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: theme.silver2 }}>
            {isLogin ? (
              <>
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  onClick={handleOpenChoice}
                  className="hover:underline"
                  style={{ color: theme.primary }}
                >
                  Daftar
                </Link>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="hover:underline"
                  style={{ color: theme.primary }}
                >
                  Login
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Modal pilihan pendaftaran (school/user) */}
      {isLogin && (
        <RegisterChoiceModal
          open={openChoice}
          onClose={() => setOpenChoice(false)}
          onSelect={handleSelectChoice}
        />
      )}
    </div>
  );
}
