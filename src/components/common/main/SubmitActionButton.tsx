import React from "react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

type ButtonVariant = "submit" | "next";

type Props = {
  isPending: boolean;
  isEditMode?: boolean;
  onNextClick?: () => void;
};

type ButtonProps = {
  variant: ButtonVariant;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

const Button = ({ variant, children, onClick, disabled }: ButtonProps) => {
  const isDarkMode = useHtmlDarkMode();
  const theme = isDarkMode ? colors.dark : colors.light;

  const background = variant === "submit" ? theme.tertiary : theme.primary;
  const backgroundHover =
    variant === "submit" ? theme.secondary : theme.quaternary;
  const textColor =
    variant === "submit"
      ? isDarkMode
        ? colors.dark.black1
        : colors.light.primary
      : "#FFFFFF";

  return (
    <button
      type={variant === "submit" ? "submit" : "button"}
      className="px-6 py-2 font-semibold rounded-[8px] transition-colors"
      style={{
        backgroundColor: background,
        color: textColor,
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
}: Props) {
  return (
    <div className="flex justify-end gap-4">
      <Button variant="submit" disabled={isPending}>
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
