import React, { useRef, useEffect, useState } from "react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
}

export default function RichEditor({
  value,
  onChange,
  label,
  placeholder = "Tulis deskripsi kajian...",
}: RichEditorProps) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectionChanged, setSelectionChanged] = useState(false); // trigger re-render

  // Set isi editor dari prop value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  // Ambil data saat content berubah
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Untuk mengaktifkan status tombol (bold, italic, dsb)
  const isActive = (command: string) => {
    try {
      return document.queryCommandState?.(command);
    } catch {
      return false;
    }
  };

  const currentBlock = () => {
    try {
      return document.queryCommandValue("formatBlock");
    } catch {
      return "";
    }
  };

  // Terapkan format
  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Dengarkan perubahan selection untuk refresh UI status tombol
  useEffect(() => {
    const handler = () => setSelectionChanged((v) => !v);
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  const toolbarButtons = [
    {
      label: "B",
      command: "bold",
      active: isActive("bold"),
      className: "font-bold",
    },
    {
      label: "I",
      command: "italic",
      active: isActive("italic"),
      className: "italic",
    },
    {
      label: "U",
      command: "underline",
      active: isActive("underline"),
      className: "underline",
    },
    {
      label: "• List",
      command: "insertUnorderedList",
      active: isActive("insertUnorderedList"),
    },
    {
      label: "1. List",
      command: "insertOrderedList",
      active: isActive("insertOrderedList"),
    },
  ];

  const headingButtons = [1, 2, 3, 4, 5, 6].map((n) => ({
    label: `H${n}`,
    command: "formatBlock",
    value: `<h${n}>`,
    active: currentBlock()?.toLowerCase() === `h${n}`,
  }));

  const paragraphButton = {
    label: "P",
    command: "formatBlock",
    value: "<p>",
    active: currentBlock()?.toLowerCase() === "p",
  };

  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="text-sm font-medium" style={{ color: theme.black2 }}>
          {label}
        </label>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-1 text-sm">
        {toolbarButtons.map(({ label, command, active, className }) => (
          <button
            key={label}
            type="button"
            onClick={() => applyFormat(command)}
            className={`border px-2 rounded ${className ?? ""} ${
              active ? "bg-blue-500 text-white" : ""
            }`}
          >
            {label}
          </button>
        ))}

        {[...headingButtons, paragraphButton].map(
          ({ label, command, value, active }) => (
            <button
              key={label}
              type="button"
              onClick={() => applyFormat(command, value)}
              className={`border px-2 rounded text-sm ${
                active ? "bg-green-500 text-white" : ""
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        dir="ltr"
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-[120px] text-sm rounded border p-2 prose dark:prose-invert"
        style={{
          backgroundColor: theme.white2,
          color: isDark ? theme.black1 : theme.black1,
          borderColor: theme.silver1,
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
