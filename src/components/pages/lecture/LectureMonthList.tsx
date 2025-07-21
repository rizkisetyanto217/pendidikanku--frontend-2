import React from "react";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";

interface MonthSummary {
  month: string;
  total: number;
}

export default function LectureMaterialMonthList({
  data,
  onSelectMonth,
}: {
  data: MonthSummary[];
  onSelectMonth: (month: string) => void;
}) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

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
              {item.month}
            </p>
            <p className="text-xs" style={{ color: theme.silver2 }}>
              {item.total} Kajian tatap muka & online
            </p>
          </div>
          <span style={{ color: theme.silver2 }}>›</span>
        </div>
      ))}
    </div>
  );
}
