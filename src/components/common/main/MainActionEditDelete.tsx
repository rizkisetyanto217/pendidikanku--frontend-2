// src/components/common/ActionEditDelete.tsx

import { Edit, Trash2 } from "lucide-react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

interface ActionEditDeleteProps {
  onEdit?: () => void;
  onDelete?: () => void;
  showEdit?: boolean;
  showDelete?: boolean;
}

export default function ActionEditDelete({
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
}: ActionEditDeleteProps) {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  return (
    <div className="flex items-center gap-2">
      {showEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // ⛔️ Cegah trigger onRowClick
            onEdit?.();
          }}
          title="Edit"
          className="transition"
          style={{ color: theme.primary }}
        >
          <Edit size={18} />
        </button>
      )}

      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // ⛔️ Cegah trigger onRowClick
            onDelete?.();
          }}
          title="Hapus"
          className="transition"
          style={{ color: theme.error1 }}
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}
