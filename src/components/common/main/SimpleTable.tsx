import { ReactNode } from "react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

interface SimpleTableProps {
  columns: string[];
  rows: ReactNode[][];
  onRowClick?: (rowIndex: number) => void;
  emptyText?: string;
}

export default function SimpleTable({
  columns,
  rows,
  onRowClick,
  emptyText = "Belum ada data.",
}: SimpleTableProps) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <div className="w-full overflow-x-auto">
      <table
        className="min-w-[600px] w-full text-sm border rounded-lg overflow-hidden"
        style={{ borderColor: theme.silver1 }}
      >
        <thead style={{ backgroundColor: theme.success2 }}>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-4 py-2 text-left whitespace-nowrap"
                style={{ color: theme.black2 }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center px-4 py-6"
                style={{
                  color: theme.silver2,
                }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((cells, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-t hover:cursor-pointer transition"
                style={{ borderColor: theme.silver1 }}
                onClick={() => onRowClick?.(rowIndex)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.white3)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {cells.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-2 align-top max-w-[200px]"
                    style={{
                      color: theme.black1,
                      backgroundColor: "transparent",
                      maxWidth: "200px",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    <div
                      className="flex flex-wrap gap-1"
                      style={{
                        display:
                          typeof cell === "string" ? "-webkit-box" : "flex",
                        WebkitLineClamp: typeof cell === "string" ? 3 : "unset",
                        WebkitBoxOrient: "vertical",
                        overflow: typeof cell === "string" ? "hidden" : "unset",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {cell}
                    </div>
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
