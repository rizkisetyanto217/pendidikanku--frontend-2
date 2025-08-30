import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import PublicUserDropdown from "@/components/common/public/UserDropDown";

interface PageHeaderProps {
  title: string;
  backTo?: string;
  actionButton?: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
  onBackClick?: () => void;
  withPaddingTop?: boolean; // ✅ tambahan opsional
}

export default function PageHeaderUser({
  title,
  backTo,
  actionButton,
  onBackClick,
  withPaddingTop = false, // default false
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  return (
    <div
      className={`sticky top-0 z-30 px-1 pb-2 backdrop-blur-md bg-opacity-80 ${
        withPaddingTop ? "pt-4" : "pt-1"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        {/* Back & Title */}
        <div className="flex items-center gap-4">
          {(backTo || onBackClick) && (
            <button
              onClick={() => {
                if (onBackClick) return onBackClick();
                if (backTo) return navigate(backTo);
              }}
              className="p-2 rounded-lg"
              style={{
                backgroundColor: theme.white3,
                color: theme.black1,
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-xl font-medium" style={{ color: theme.black1 }}>
            {title}
          </h1>
        </div>

        {/* Langsung render dropdown */}
        <PublicUserDropdown variant="icon" />
      </div>
    </div>
  );
}
