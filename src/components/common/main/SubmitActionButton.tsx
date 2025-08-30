import React from "react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
type ButtonVariant = "primary" | "next";

type Props = {
  isPending: boolean;
  isEditMode?: boolean;
  onNextClick?: () => void;
  disabled?: boolean;
};

type ButtonProps = {
  variant: ButtonVariant;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

const Button = ({ variant, children, onClick, disabled }: ButtonProps) => {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const background = variant === "primary" ? theme.primary : theme.tertiary;
  const backgroundHover =
    variant === "primary" ? theme.quaternary : theme.secondary;
  const textColor = variant === "primary" ? "#FFFFFF" : theme.black1;

  return (
    <button
      type={variant === "primary" ? "submit" : "button"}
      className="px-6 py-2 font-semibold rounded-[8px] transition-colors disabled:opacity-50"
      style={{
        backgroundColor: background,
        color: textColor,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onClick={onClick}
      onMouseOver={(e) =>
        (e.currentTarget.style.backgroundColor = backgroundHover)
      }
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = background)}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default function SubmitActionButtons({
  isPending,
  isEditMode = false,
  onNextClick,
  disabled,
}: Props) {
  return (
    <div className="flex justify-end gap-4">
      <Button variant="primary" disabled={isPending || disabled}>
        {isPending
          ? "Menyimpan..."
          : isEditMode
            ? "Simpan Perubahan"
            : "Simpan Sekarang"}
      </Button>

      {onNextClick && (
        <Button variant="next" onClick={onNextClick}>
          Lanjut
        </Button>
      )}
    </div>
  );
}
