import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

interface PageHeaderProps {
  title: string;
  backTo?: string;
  actionButton?: {
    label: string;
    to?: string;
    state?: any; // ✅ mendukung pengiriman state via navigate
    onClick?: () => void;
  };
  onBackClick?: () => void;
}

export default function PageHeader({
  title,
  backTo,
  actionButton,
  onBackClick,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const handleBack = () => {
    if (onBackClick) return onBackClick();
    if (backTo) return navigate(backTo);
  };

  const handleAction = () => {
    if (actionButton?.onClick) return actionButton.onClick();
    if (actionButton?.to)
      return navigate(actionButton.to, { state: actionButton.state });
  };

  return (
    <div
      className="px-1 pt-1 pb-1 mb-5"
      style={{ backgroundColor: theme.white1, color: theme.black1 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          {(backTo || onBackClick) && (
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-200" />
            </button>
          )}
          <h1 className="text-2xl font-medium">{title}</h1>
        </div>

        {actionButton && (
          <button
            onClick={handleAction}
            className="py-2 px-4 rounded-lg"
            style={{
              backgroundColor: theme.primary,
              color: theme.white1,
            }}
          >
            {actionButton.label}
          </button>
        )}
      </div>

      <hr className="mt-2 border-t" style={{ borderColor: theme.silver1 }} />
    </div>
  );
}
