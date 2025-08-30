import React from "react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

interface MonthSummary {
  month: string; // format: "2025-07"
  total: number;
}

export default function LectureMaterialMonthList({
  data,
  onSelectMonth,
}: {
  data: MonthSummary[];
  onSelectMonth: (month: string) => void;
}) {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  // ✅ Fungsi bantu untuk ubah "2025-07" → "Juli 2025"
  const formatMonthYear = (input: string) => {
    const [year, month] = input.split("-");
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const monthIndex = parseInt(month, 10) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  };

  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div
          key={item.month}
          onClick={() => onSelectMonth(item.month)}
          className="p-3 rounded-md flex justify-between items-center cursor-pointer transition-all"
          style={{
            backgroundColor: theme.white1,
            border: `1px solid ${theme.silver1}`,
          }}
        >
          <div>
            <p className="font-semibold" style={{ color: theme.black1 }}>
              {formatMonthYear(item.month)} {/* ✅ Format baru */}
            </p>
            <p className="text-xs" style={{ color: theme.silver2 }}>
              {item.total} Kajian
            </p>
          </div>
          <span style={{ color: theme.silver2 }}>›</span>
        </div>
      ))}
    </div>
  );
}
