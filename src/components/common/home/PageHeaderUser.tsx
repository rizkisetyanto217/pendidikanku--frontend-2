import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
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
}

export default function PageHeaderUser({
  title,
  backTo,
  actionButton,
  onBackClick,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <div className="sticky top-0 z-30 px-1 pt-1 pb-2 backdrop-blur-md bg-opacity-80">
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
        <PublicUserDropdown variant="icon"  />
      </div>
    </div>
  );
}
