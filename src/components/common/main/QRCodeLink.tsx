import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import toast from "react-hot-toast";

interface QRCodeLinkProps {
  value: string; // URL atau text yang mau di-QR-kan
}

export default function QRCodeLink({ value }: QRCodeLinkProps) {
  const [showUrl, setShowUrl] = useState(false);
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Link berhasil disalin!");
  };

  return (
    <div className="flex justify-center py-4">
      <div className="flex flex-col items-center space-y-2">
        <div onClick={() => setShowUrl(!showUrl)} className="cursor-pointer">
          <QRCodeSVG
            value={value}
            size={128}
            bgColor={theme.white1}
            fgColor={theme.black1}
            includeMargin={true}
          />
        </div>

        <p className="text-xs text-center" style={{ color: theme.silver2 }}>
          Klik QR Code untuk melihat dan menyalin tautan
        </p>

        {showUrl && (
          <div className="text-center mt-2 space-y-1">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline block"
              style={{ color: theme.primary }}
            >
              {value}
            </a>
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1 rounded border"
              style={{
                color: theme.success1,
                borderColor: theme.success1,
              }}
            >
              📋 Salin Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
