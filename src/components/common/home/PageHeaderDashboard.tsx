import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";

interface PageHeaderProps {
  title: string;
  backTo?: string;
  actionButton?: {
    label: string;
    to?: string; // ← ubah jadi opsional
    onClick?: () => void;
  };
  onBackClick?: () => void; // ✅ Tambahkan ini
}

export default function PageHeader({
  title,
  backTo,
  actionButton,
  onBackClick,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <div
      className="px-1 pt-1 pb-1 mb-5"
      style={{ backgroundColor: theme.white1, color: theme.black1 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          {(backTo || onBackClick) && (
            <button
              onClick={() => {
                if (onBackClick) return onBackClick();
                if (backTo) return navigate(backTo);
              }}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-200" />
            </button>
          )}

          <h1 className="text-2xl font-medium">{title}</h1>
        </div>

        {actionButton && (
          <div className="flex-shrink-0">
            <button
              onClick={() => {
                if (actionButton.onClick) return actionButton.onClick();
                if (actionButton.to) return navigate(actionButton.to);
              }}
              className="py-2 px-4 rounded-lg"
              style={{
                backgroundColor: theme.primary,
                color: theme.white1,
              }}
            >
              {actionButton.label}
            </button>
          </div>
        )}
      </div>

      <hr className="mt-2 border-t" style={{ borderColor: theme.silver1 }} />
    </div>
  );
}