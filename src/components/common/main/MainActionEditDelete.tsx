// src/components/common/ActionEditDelete.tsx

import { Edit, Trash2 } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

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
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <div className="flex items-center gap-2">
      {showEdit && (
        <button
          onClick={onEdit}
          title="Edit"
          className="transition"
          style={{ color: theme.primary }}
        >
          <Edit size={18} />
        </button>
      )}

      {showDelete && (
        <button
          onClick={onDelete}
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
