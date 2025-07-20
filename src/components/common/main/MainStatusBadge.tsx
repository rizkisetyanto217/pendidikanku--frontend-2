// src/components/common/StatusBadge.tsx
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

interface StatusBadgeProps {
  text: string;
  variant: "info" | "success" | "error" | "warning" | "default";
}

export default function StatusBadge({ text, variant }: StatusBadgeProps) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

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
