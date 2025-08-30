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
        borderColor: borderColor || theme.silver1,
        backgroundColor:
          backgroundColor || (isDark ? theme.white2 : theme.white1),
      }}
    >
      {children}
    </div>
  );
}
