import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

interface CommonActionButtonProps {
  text: string;
  onClick?: () => void;
  variant?: "solid" | "outline";
  className?: string;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function CommonActionButton({
  text,
  onClick,
  variant = "solid",
  className = "",
  style = {},
  type = "button",
  disabled = false,
}: CommonActionButtonProps) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const isOutline = variant === "outline";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-sm font-semibold rounded ${className}`}
      style={{
        backgroundColor: isOutline ? "transparent" : theme.primary,
        color: isOutline ? theme.primary : "#ffffff",
        border: isOutline ? `1px solid ${theme.primary}` : "none",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {text}
    </button>
  );
}
