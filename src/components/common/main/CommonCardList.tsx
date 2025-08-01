import { ReactNode } from "react";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";

interface CommonCardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  borderColor?: string;
  backgroundColor?: string;
}

export default function CommonCardList({
  children,
  className = "",
  padding = true,
  borderColor,
  backgroundColor,
}: CommonCardProps) {
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <div
      className={`rounded-xl border ${className}`}
      style={{
        borderColor: borderColor || themeColors.silver1,
        backgroundColor:
          backgroundColor || (isDark ? themeColors.white2 : themeColors.white1),
      }}
    >
      {children}
    </div>
  );
}
