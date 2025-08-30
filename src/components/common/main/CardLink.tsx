import { useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

type CartLinkProps = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  internal?: boolean;
  onClick?: () => void;
};

export default function CartLink({
  label,
  icon,
  href,
  internal = true,
  onClick,
}: CartLinkProps) {
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Jika ada onClick, panggil itu
    if (onClick) {
      onClick();
      return;
    }

    // 2. Kalau tidak ada onClick, gunakan href
    if (!href) return;

    if (internal) {
      navigate(href);
    } else {
      window.open(href, "_blank", "noopener noreferrer");
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer flex items-center justify-between p-3 rounded hover:opacity-90 transition-all"
      style={{
        backgroundColor: theme.white2,
        border: `1px solid ${theme.silver1}`,
      }}
    >
      <span className="flex items-center space-x-2">
        <span>{icon}</span>
        <span style={{ color: theme.black1 }}>{label}</span>
      </span>
      <span style={{ color: theme.silver4 }}>›</span>
    </div>
  );
}
