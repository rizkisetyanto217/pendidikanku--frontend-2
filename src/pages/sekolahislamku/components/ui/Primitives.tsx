import React from "react";
import { colors } from "@/constants/colorsThema";

export type Palette = typeof colors.light;

/* ---- SectionCard ---- */
export function SectionCard({
  children,
  palette,
  className = "",
  style,
}: {
  children: React.ReactNode;
  palette: Palette;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl border shadow-sm ${className}`}
      style={{
        background: palette.white1,
        borderColor: palette.silver1,
        color: palette.black1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ---- Badge ---- */
export function Badge({
  children,
  variant = "default",
  palette,
  className = "",
}: {
  children: React.ReactNode;
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "destructive"
    | "success"
    | "warning"
    | "info";
  palette: Palette;
  className?: string;
}) {
  const styleMap: Record<string, React.CSSProperties> = {
    default: { background: palette.primary, color: palette.white1 },
    secondary: { background: palette.secondary, color: palette.white1 },
    outline: { border: `1px solid ${palette.silver1}`, color: palette.silver2 },
    destructive: { background: palette.error1, color: palette.white1 },
    success: { background: palette.success1, color: palette.white1 },
    warning: { background: palette.warning1, color: palette.white1 },
    info: { background: palette.quaternary, color: palette.white1 },
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
      style={styleMap[variant]}
    >
      {children}
    </span>
  );
}

/* ---- Button ---- */
export function Btn({
  children,
  variant = "default",
  size = "md",
  palette,
  className = "",
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "quaternary"
    | "ghost"
    | "destructive"
    | "success";
  size?: "sm" | "md" | "lg" | "icon";
  palette: Palette;
}) {
  const sizeCls =
    size === "sm"
      ? "h-8 px-3 text-sm"
      : size === "lg"
        ? "h-12 px-5 text-base"
        : size === "icon"
          ? "h-10 w-10"
          : "h-10 px-4 text-sm";

  const baseStyle: React.CSSProperties = { borderRadius: 16, fontWeight: 600 };

  const variants: Record<string, React.CSSProperties> = {
    default: {
      background: palette.primary,
      color: palette.white1,
      border: `1px solid ${palette.primary}`,
    },
    secondary: {
      background: palette.white2,
      color: palette.black1,
      border: `1px solid ${palette.silver1}`,
    },
    quaternary: {
      background: palette.quaternary,
      color: palette.white1,
      border: `1px solid ${palette.silver1}`,
    },
    outline: {
      background: "transparent",
      color: palette.black1,
      border: `1px solid ${palette.silver1}`,
    },
    ghost: {
      background: palette.primary2,
      color: palette.black1,
      border: `1px solid ${palette.primary2}`,
    },
    destructive: {
      background: palette.error1,
      color: palette.white1,
      border: `1px solid ${palette.error1}`,
    },
    success: {
      background: palette.success1,
      color: palette.white1,
      border: `1px solid ${palette.success1}`,
    },
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 font-medium transition-all hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 ${sizeCls} ${className}`}
      style={{ ...baseStyle, ...variants[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---- ProgressBar ---- */
export function ProgressBar({
  value,
  palette,
}: {
  value: number;
  palette: Palette;
}) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full"
      style={{ background: palette.white3 }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${v}%`, background: palette.primary }}
      />
    </div>
  );
}
