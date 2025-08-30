import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

interface FaqItemProps {
  number: number;
  question: string;
  answer: string;
}

export default function MasjidFaqItem({
  number,
  question,
  answer,
}: FaqItemProps) {
  const [open, setOpen] = useState(false);
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  return (
    <div
      className="rounded-xl border px-4 py-3 transition-all shadow-sm"
      style={{
        backgroundColor: theme.white1,
        borderColor: theme.white3,
        color: theme.black1,
      }}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex justify-between items-center w-full text-left"
      >
        <span className="text-sm font-medium">
          {number}. {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          style={{ color: theme.black2 }}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? "max-h-[500px] mt-3" : "max-h-0"
        }`}
      >
        <p className="text-sm leading-relaxed" style={{ color: theme.silver2 }}>
          {answer}
        </p>
      </div>
    </div>
  );
}
