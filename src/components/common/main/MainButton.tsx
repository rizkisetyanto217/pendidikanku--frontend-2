import { Link } from "react-router-dom";

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
  const isOutline = variant === "outline";

  return (
    <Link to={to} state={state}>
      <button
        className={`px-4 py-2 text-sm font-semibold rounded ${className}`}
        style={{
          backgroundColor: isOutline ? "transparent" : "#2563eb",
          color: isOutline ? "#2563eb" : "#fff",
          border: isOutline ? "1px solid #2563eb" : "none",
          ...style,
        }}
      >
        {text}
      </button>
    </Link>
  );
}
