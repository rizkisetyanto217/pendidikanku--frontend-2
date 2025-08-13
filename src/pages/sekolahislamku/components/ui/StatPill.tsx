// src/pages/sekolahislamku/components/ui/StatPill.tsx
import * as React from "react";
import { type Palette } from "./Primitives";

type StatPillProps = {
  palette: Palette;
  label: React.ReactNode;
  value: React.ReactNode;
  /** Opsional */
  icon?: React.ReactNode;
  tooltip?: string;
  className?: string;
  onClick?: () => void;
};

export default function StatPill({
  palette,
  label,
  value,
  icon,
  tooltip,
  className = "",
  onClick,
}: StatPillProps) {
  const Wrapper: React.ElementType = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      title={tooltip}
      className={`p-3 rounded-xl border text-left ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ borderColor: palette.silver1, background: palette.white2 }}
    >
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-xs" style={{ color: palette.silver2 }}>
          {label}
        </div>
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </Wrapper>
  );
}
