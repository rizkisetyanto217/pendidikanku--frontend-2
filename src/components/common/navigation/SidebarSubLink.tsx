import { Link, useLocation, matchPath } from "react-router-dom";
import { useEffect, useState } from "react";
import { colors } from "@/constants/colorsThema";

interface SidebarSubLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}

export default function SidebarSubLink({
  to,
  icon,
  text,
  onClick,
}: SidebarSubLinkProps) {
  const location = useLocation();
  const active =
    location.pathname === to || location.pathname.startsWith(to + "/");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const theme = isDark ? colors.dark : colors.light;
  const bgColor = active ? theme.primary2 : "transparent";
  const textColor = active ? theme.primary : theme.silver2;
  const fontWeight = active ? "bold" : "normal";

  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontWeight,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = theme.primary2;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm">{text}</span>
    </Link>
  );
}
