import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import React from "react";

interface InputFieldProps {
  label: string;
  name: string;
  value?: string; // ✅ bikin optional agar file input tidak error
  placeholder?: string;
  type?: string;
  as?: "input" | "textarea";
  rows?: number;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export default function InputField({
  label,
  name,
  value,
  placeholder = "",
  type = "text",
  as = "input",
  rows = 4,
  onChange,
}: InputFieldProps) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const commonStyle = {
    backgroundColor: theme.white2,
    borderColor: theme.silver1,
    color: theme.black1,
  };

  return (
    <div className="w-full space-y-1">
      <label
        htmlFor={name}
        className="block text-sm font-medium"
        style={{ color: theme.black2 }}
      >
        {label}
      </label>

      {as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className="w-full text-sm px-4 py-2.5 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
          style={commonStyle}
        />
      ) : type === "file" ? (
        <input
          id={name}
          name={name}
          type="file"
          onChange={onChange}
          placeholder={placeholder}
          className="w-full text-sm px-4 py-2.5 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
          style={commonStyle}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full text-sm px-4 py-2.5 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
          style={commonStyle}
        />
      )}
    </div>
  );
}
