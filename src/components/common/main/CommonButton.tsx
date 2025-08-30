// src/components/common/CommonButton.tsx
import { Link } from "react-router-dom";
import useHtmlThema from "@/hooks/useHTMLThema";
import { pickTheme, ThemeName } from "@/constants/thema";

interface CommonButtonProps {
  to: string;
  text: string;
  variant?: "solid" | "outline";
  state?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
}

export default function CommonButton({
  to,
  text,
  variant = "solid",
  state,
  className = "",
  style = {},
}: CommonButtonProps) {
  const { isDark, themeName } = useHtmlThema();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const isOutline = variant === "outline";

  return (
    <Link to={to} state={state}>
      <button
        className={`px-4 py-2 text-sm font-semibold rounded transition hover:opacity-90 ${className}`}
        style={{
          backgroundColor: isOutline ? "transparent" : theme.primary,
          color: isOutline ? theme.primary : theme.white1,
          border: isOutline ? `1px solid ${theme.primary}` : "none",
          ...style,
        }}
      >
        {text}
      </button>
    </Link>
  );
}
