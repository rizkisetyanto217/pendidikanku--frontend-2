import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import PublicUserDropdown from "@/components/common/public/UserDropDown"; // ⬅️ import

type PageTopBarProps = {
  palette: Palette;
  backTo?: string;
  onBack?: () => void;
  label?: React.ReactNode;
  title?: React.ReactNode;
  rightSlot?: React.ReactNode; // biarkan optional
  sticky?: boolean;
  className?: string;
};

export default function PageTopBar({
  palette,
  backTo = "/student",
  onBack,
  label,
  title,
  rightSlot = <PublicUserDropdown variant="icon" />, // ⬅️ default-nya dropdown
  sticky = true,
  className,
}: PageTopBarProps) {
  const navigate = useNavigate();

  return (
    <div
      className={`${sticky ? "sticky top-0 z-40" : ""} border-b ${className ?? ""}`}
      style={{
        background: `${palette.white1}E6`,
        borderColor: palette.silver1,
      }}
    >
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onBack ? (
            <button onClick={onBack}>
              <Btn variant="outline" size="sm" palette={palette}>
                <ArrowLeft size={16} />
              </Btn>
            </button>
          ) : (
            <Link to={backTo}>
              <Btn variant="outline" size="sm" palette={palette}>
                <ArrowLeft size={16} />
              </Btn>
            </Link>
          )}

          {(label || title) && (
            <div className="pl-1 flex items-center gap-2 min-w-0">
              {label && (
                <>
                  <span className="text-sm" style={{ color: palette.silver2 }}>
                    {label}
                  </span>
                  <span
                    className="hidden sm:inline-block w-1 h-1 rounded-full"
                    style={{ background: palette.silver2 }}
                  />
                </>
              )}
              {title && (
                <span className="font-semibold truncate max-w-[50vw]">
                  {title}
                </span>
              )}
            </div>
          )}
        </div>

        {rightSlot /* akan default ke PublicUserDropdown kalau tidak diisi */}
      </div>
    </div>
  );
}
