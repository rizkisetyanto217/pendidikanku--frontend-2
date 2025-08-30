import { ReactNode } from "react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

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
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
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
