// src/components/charts/MiniBar.tsx
import * as React from "react";
import { type Palette } from "@/pages/sekolahislamku/components/ui/Primitives";

type MiniBarProps = {
  palette: Palette;
  /** Teks kecil di kiri atas bar */
  label?: React.ReactNode;
  /** Nilai saat ini */
  value: number;
  /** Total maksimum (> 0) */
  total: number;

  /** Tinggi bar dalam px (default 8) */
  height?: number;
  /** Radius sudut (default 9999 = pill) */
  radius?: number;
  /** Tampilkan persentase di kanan (default true) */
  showPercent?: boolean;
  /** Tampilkan fraction value/total di kanan (default false) */
  showFraction?: boolean;

  /** Animasi lebar saat value berubah (default true) */
  animated?: boolean;

  /** Override warna track & bar (opsional) */
  trackColor?: string;
  barColor?: string;

  /** Label aksesibilitas */
  ariaLabel?: string;
};

export default function MiniBar({
  palette,
  label,
  value,
  total,
  height = 8,
  radius = 9999,
  showPercent = true,
  showFraction = false,
  animated = true,
  trackColor,
  barColor,
  ariaLabel = "Progress",
}: MiniBarProps) {
  const safeTotal = total > 0 ? total : 0;
  const pct = safeTotal > 0 ? Math.round((value / safeTotal) * 100) : 0;
  const clampedPct = Math.max(0, Math.min(100, pct));

  const rightText = showPercent
    ? `${clampedPct}%`
    : showFraction
      ? `${value}/${safeTotal}`
      : undefined;

  return (
    <div>
      {(label || rightText) && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span style={{ color: palette.silver2 }}>{label}</span>
          {rightText && (
            <span style={{ color: palette.silver2 }}>{rightText}</span>
          )}
        </div>
      )}

      <div
        className="w-full overflow-hidden"
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedPct}
        style={{
          height,
          borderRadius: radius,
          background: trackColor ?? palette.white2,
        }}
        title={showPercent ? `${clampedPct}%` : undefined}
      >
        <div
          className={
            animated
              ? "h-full transition-[width] duration-300 ease-out"
              : "h-full"
          }
          style={{
            width: `${clampedPct}%`,
            background: barColor ?? palette.primary,
            borderRadius: radius,
          }}
        />
      </div>
    </div>
  );
}
