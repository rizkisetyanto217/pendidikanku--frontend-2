import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export default function RichEditor({
  value,
  onChange,
  label,
  placeholder = "Tulis deskripsi di sini...",
}: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  // Init Quill
  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(editorRef.current, {
        theme: isDark ? "bubble" : "snow",
        placeholder, 
        modules: {
          toolbar: [
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
        },
      });

      // Handle content change
      quillInstance.current.on("text-change", () => {
        const html = quillInstance.current!.root.innerHTML;
        onChange(html);
      });

      // Inline editor styling
      const editor = editorRef.current.querySelector(
        ".ql-editor"
      ) as HTMLElement;
      if (editor) {
        editor.style.color = isDark ? theme.black2 : theme.white1;
        editor.style.fontSize = "0.875rem"; // text-sm
      }

      // Note: placeholder style via CSS ::before selector can't be styled inline.
      // To override placeholder color, you can inject CSS if needed.
    }
  }, [isDark]);

  // Set initial value
  useEffect(() => {
    if (
      quillInstance.current &&
      value !== quillInstance.current.root.innerHTML
    ) {
      quillInstance.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="text-sm font-medium" style={{ color: theme.black2 }}>
          {label}
        </label>
      )}

      <div
        ref={editorRef}
        className="rounded-lg transition-all"
        style={{
          border: `1px solid ${theme.silver1}`,
          backgroundColor: theme.white2,
          borderRadius: "0.5rem",
          minHeight: "160px",
          padding: "12px",
          overflow: "hidden",
        }}
      />
    </div>
  );
}
