import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

interface LoginPromptModalProps {
  show: boolean;
  onClose: () => void;
  onLogin?: () => void;
  onContinue?: () => void;
  title?: string;
  message?: string;
  continueLabel?: string;
  showContinueButton?: boolean;
}

export default function LoginPromptModal({
  show,
  onClose,
  onLogin,
  onContinue,
  title = "Login Diperlukan",
  message = "Silakan login terlebih dahulu untuk mengakses fitur ini.",
  continueLabel = "Lanjutkan Tanpa Login",
  showContinueButton = false,
}: LoginPromptModalProps) {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div
        className="rounded-lg p-6 w-[90%] max-w-sm text-center shadow-lg"
        style={{ backgroundColor: theme.white1 }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: theme.black1 }}
        >
          {title}
        </h3>
        <p className="text-sm mb-4" style={{ color: theme.silver2 }}>
          {message}
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          {showContinueButton && (
            <button
              onClick={onContinue}
              className="px-4 py-2 text-sm rounded"
              style={{
                backgroundColor: theme.white3,
                color: theme.black1,
              }}
            >
              {continueLabel}
            </button>
          )}
          <button
            onClick={onLogin || (() => (window.location.href = "/login"))}
            className="px-4 py-2 text-sm rounded"
            style={{
              backgroundColor: theme.primary,
              color: theme.white1,
            }}
          >
            Login
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded"
            style={{
              backgroundColor: theme.error1,
              color: theme.white1,
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
