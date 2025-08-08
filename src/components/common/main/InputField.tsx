import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import React from "react";

interface InputFieldProps {
  label: string;
  name: string;
  value?: string;
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

  const baseInputClass = `w-full text-sm px-4 py-2.5 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
    isDark
      ? "text-white placeholder-zinc-500 bg-zinc-800 border-zinc-700"
      : "text-black placeholder-gray-400 bg-white border-gray-300"
  }`;

  return (
    <div className="w-full space-y-1">
      <label
        htmlFor={name}
        className={`block text-sm font-medium ${
          isDark ? "text-zinc-300" : "text-gray-700"
        }`}
      >
        {label}
      </label>

      {as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseInputClass}
        />
      ) : type === "file" ? (
        <input
          id={name}
          name={name}
          type="file"
          onChange={onChange}
          className={baseInputClass}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseInputClass}
        />
      )}
    </div>
  );
}
