import React from "react";
import { colors } from "@/constants/colorsThema";
import { Link, To } from "react-router-dom";

export type Palette = typeof colors.light;

type SectionCardProps = React.HTMLAttributes<HTMLDivElement> & {
  palette: Palette;
  /** Paksa bg di semua mode: "white1" | "black1" | "auto" (default) */
  bg?: "auto" | "white1" | "black1";
  /** Override bg khusus saat dark mode: "white1" | "black1" */
  bgOnDark?: "white1" | "black1";
};

export function SectionCard({
  children,
  palette,
  className = "",
  style,
  bg = "auto",
  bgOnDark,
  ...rest // <- tampung onClick, id, role, dsb
}: React.PropsWithChildren<SectionCardProps>) {
  // Deteksi dark mode dari palette yang dikirim
  const isDark =
    palette === (colors as any).dark ||
    (typeof palette.white1 === "string" &&
      /^#/.test(palette.white1) &&
      parseInt(palette.white1.slice(1, 3), 16) < 0x66);

  // Tentukan background final
  let background = palette.white1;
  if (bg === "black1") background = palette.black1;
  if (bg === "white1") background = palette.white1;

  // Jika dark mode & ada override khusus
  if (isDark && bgOnDark) {
    background = palette[bgOnDark] as string;
  }

  // Kontraskan warna teks & border
  const isBgBlack = background === (palette.black1 as string);
  const textColor = isBgBlack ? palette.white1 : palette.black1;
  const borderColor = isBgBlack ? palette.white3 : palette.silver1;

  return (
    <div
      {...rest} // <- forward semua atribut/handler (onClick, onMouseEnter, dll)
      className={`rounded-2xl border shadow-sm ${className}`}
      style={{
        background,
        borderColor,
        color: textColor,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
/* ---- Badge ---- */
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
    | "info"
    | "black1" // NEW
    | "white1"; // NEW
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

    // NEW
    black1: {
      background: palette.black1,
      color: palette.white1,
      border: `1px solid ${palette.white3}`,
    },
    white1: {
      background: palette.white1,
      color: palette.black1,
      border: `1px solid ${palette.silver1}`,
    },
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
/* ---- Button ---- */
type BtnVariant =
  | "default"
  | "secondary"
  | "outline"
  | "quaternary"
  | "ghost"
  | "destructive"
  | "success"
  | "black1" // NEW
  | "white1" // NEW
  | "silver";

type BtnSize = "sm" | "md" | "lg" | "icon";

export function Btn({
  children,
  variant = "default",
  size = "md",
  palette,
  className = "",
  style,
  tone = "normal",
  block = false, // NEW: full width
  loading = false, // NEW: spinner + disabled
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: BtnSize;
  palette: Palette;
  /** pakai saat tombol di atas surface gelap (black1) */
  tone?: "normal" | "inverted";
  block?: boolean;
  loading?: boolean;
}) {
  const sizeCls =
    size === "sm"
      ? "h-8 px-3 text-sm"
      : size === "lg"
        ? "h-12 px-5 text-base"
        : size === "icon"
          ? "h-10 w-10 p-0"
          : "h-10 px-4 text-sm";

  const baseStyle: React.CSSProperties = { borderRadius: 16, fontWeight: 600 };

  const variants: Record<BtnVariant, React.CSSProperties> = {
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
    // NEW variants
    black1: {
      background: palette.black1,
      color: palette.white1,
      border: `1px solid ${palette.white3}`,
    },
    white1: {
      background: palette.white1,
      color: palette.black1,
      border: `1px solid ${palette.silver1}`,
    },
    silver: {
      background: palette.silver1,
      color: palette.black1,
      border: `1px solid ${palette.white1}`,
    },
  };

  // Override khusus saat di surface gelap
  const invertedOverrides: Partial<Record<BtnVariant, React.CSSProperties>> = {
    outline: { color: palette.white1, border: `1px solid ${palette.white3}` },
    secondary: {
      background: palette.black1,
      color: palette.white1,
      border: `1px solid ${palette.white3}`,
    },
    ghost: {
      background: "transparent",
      color: palette.white1,
      border: `1px solid ${palette.black1}`,
    },
  };

  const computedStyle: React.CSSProperties = {
    ...baseStyle,
    ...variants[variant],
    ...(tone === "inverted" ? invertedOverrides[variant] : {}),
    ...(disabled || loading ? { opacity: 0.6, cursor: "not-allowed" } : {}),
    ...style,
  };

  return (
    <button
      className={`${
        block ? "w-full" : ""
      } inline-flex items-center justify-center gap-1.5 font-medium transition-all hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 ${sizeCls} ${className}`}
      style={computedStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ color: "currentColor" }}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            opacity="0.25"
          />
          <path
            d="M22 12a10 10 0 0 1-10 10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      )}
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
        style={{ width: `${v}%`, background: palette.black1 }}
      />
    </div>
  );
}

export function LinkBtn({
  to,
  children,
  palette,
  variant = "default",
  size = "md",
  className = "",
  style,
  tone = "normal",
  block = false,
  state,
  replace,
  disabled = false,
  ...rest
}: {
  to: To;
  children: React.ReactNode;
  palette: Palette;
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "quaternary"
    | "ghost"
    | "destructive"
    | "success"
    | "black1"
    | "white1"
    | "silver"

  size?: "sm" | "md" | "lg" | "icon";
  tone?: "normal" | "inverted";
  block?: boolean;
  className?: string;
  style?: React.CSSProperties;
  state?: any;
  replace?: boolean;
  disabled?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const sizeCls =
    size === "sm"
      ? "h-8 px-3 text-sm"
      : size === "lg"
        ? "h-12 px-5 text-base"
        : size === "icon"
          ? "h-10 w-10 p-0"
          : "h-10 px-4 text-sm";

  // pakai helper style yang sama dengan Btn:
  const btnStyle = {
    borderRadius: 16,
    fontWeight: 600,
    ...(variant === "ghost"
      ? {
          background: palette.primary2,
          color: palette.black1,
          border: `1px solid ${palette.primary2}`,
        }
      : variant === "outline"
        ? {
            background: "transparent",
            color: palette.black1,
            border: `1px solid ${palette.silver1}`,
          }
        : variant === "secondary"
          ? {
              background: palette.white2,
              color: palette.black1,
              border: `1px solid ${palette.silver1}`,
            }
          : variant === "quaternary"
            ? {
                background: palette.quaternary,
                color: palette.white1,
                border: `1px solid ${palette.silver1}`,
              }
            : variant === "destructive"
              ? {
                  background: palette.error1,
                  color: palette.white1,
                  border: `1px solid ${palette.error1}`,
                }
              : variant === "success"
                ? {
                    background: palette.success1,
                    color: palette.white1,
                    border: `1px solid ${palette.success1}`,
                  }
                : variant === "black1"
                  ? {
                      background: palette.black1,
                      color: palette.white1,
                      border: `1px solid ${palette.white3}`,
                    }
                  : variant === "white1"
                    ? {
                        background: palette.white1,
                        color: palette.black1,
                        border: `1px solid ${palette.silver1}`,
                      }
                    : variant === "silver"
                      ? {
                          background: palette.silver1,
                          color: palette.silver2,
                          border: `1px solid ${palette.silver1}`,
                        }
                      : {
                          background: palette.primary,
                          color: palette.white1,
                          border: `1px solid ${palette.primary}`,
                        }),
    ...(tone === "inverted" && variant === "outline"
      ? { color: palette.white1, border: `1px solid ${palette.white3}` }
      : {}),
    ...(disabled ? { opacity: 0.6, cursor: "not-allowed" } : {}),
    ...style,
  } as React.CSSProperties;

  return (
    <Link
      to={to}
      state={state}
      replace={replace}
      aria-disabled={disabled || undefined}
      className={`${block ? "w-full" : ""} inline-flex items-center justify-center gap-1.5 font-medium transition-all hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 ${sizeCls} ${className}`}
      style={btnStyle}
      {...rest}
    >
      {children}
    </Link>
  );
}
