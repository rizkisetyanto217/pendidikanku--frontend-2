// src/components/common/BorderLine.tsx
import React from "react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlThema from "@/hooks/useHTMLThema";

interface BorderLineProps {
  className?: string;
  style?: React.CSSProperties;
}

const BorderLine: React.FC<BorderLineProps> = ({ className = "", style }) => {
  const { isDark, themeName } = useHtmlThema();
  const theme = pickTheme(themeName as ThemeName, isDark);

  return (
    <div
      className={`border-t my-6 ${className}`}
      style={{ borderColor: theme.silver2, ...style }}
    />
  );
};

export default BorderLine;
