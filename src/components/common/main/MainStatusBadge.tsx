import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

interface StatusBadgeProps {
  text: string;
  variant: "info" | "success" | "error" | "warning" | "default" | "secondary";
}

export default function StatusBadge({ text, variant }: StatusBadgeProps) {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const variants = {
    info: {
      bg: theme.primary2,
      text: theme.primary,
    },
    success: {
      bg: theme.success2,
      text: theme.success1,
    },
    error: {
      bg: theme.error2,
      text: theme.error1,
    },
    warning: {
      bg: theme.warning1 + "33", // transparan
      text: theme.warning1,
    },
    secondary: {
      bg: theme.silver1,
      text: theme.silver2,
    },
    default: {
      bg: theme.silver1,
      text: theme.black1,
    },
  };

  const { bg, text: textColor } = variants[variant] || variants.default;

  return (
    <span
      className="px-2 py-0.5 text-xs rounded font-medium whitespace-nowrap"
      style={{ backgroundColor: bg, color: textColor }}
    >
      {text}
    </span>
  );
}
