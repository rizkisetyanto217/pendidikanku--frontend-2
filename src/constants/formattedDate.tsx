// src/constants/formattedDate.tsx
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

interface FormattedDateProps {
  value: string | Date;
  withTimezoneOffset?: boolean;
  fullMonth?: boolean; // ✅ Tambahan untuk nama bulan lengkap
  className?: string;
}

export default function FormattedDate({
  value,
  withTimezoneOffset = true,
  fullMonth = false,
  className = "",
}: FormattedDateProps) {
  const dateObj = new Date(value);
  const adjusted = withTimezoneOffset
    ? new Date(dateObj.getTime() + 7 * 60 * 60 * 1000)
    : dateObj;

  const formatPattern = fullMonth
    ? "EEEE, dd MMMM yyyy - HH:mm" // ✅ Bulan lengkap
    : "EEEE, dd MMM yyyy - HH:mm"; // ❎ Bulan singkat

  const formatted = format(adjusted, formatPattern, {
    locale: localeID,
  });

  return <span className={className}>{formatted}</span>;
}
