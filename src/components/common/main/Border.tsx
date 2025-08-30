import React from "react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

interface BorderLineProps {
  className?: string;
  style?: React.CSSProperties;
}

const BorderLine: React.FC<BorderLineProps> = ({ className = "", style }) => {
  const isDarkMode = useHtmlDarkMode();
  const themeColors = isDarkMode ? colors.dark : colors.light;

  return (
    <div
      className={`border-t my-6 ${className}`}
      style={{ borderColor: themeColors.silver2, ...style }}
    />
  );
};

export default BorderLine;
