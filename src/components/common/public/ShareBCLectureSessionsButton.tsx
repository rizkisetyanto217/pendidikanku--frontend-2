import React, { useMemo, useState } from "react";
import { Share2, X, Copy, MessageCircle } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

type Props = {
  /** Judul kajian */
  title: string;
  /** ISO datetime string, contoh: 2025-08-10T19:00:00Z */
  dateIso?: string;
  /** Nama pemateri */
  teacher?: string;
  /** Lokasi/Tempat */
  place?: string;
  /** URL tujuan share; default: window.location.href */
  url?: string;
  /** Label tombol trigger */
  buttonLabel?: string;
  /** ClassName opsional untuk tombol trigger */
  className?: string;
  variant?: "primary" | "soft" | "ghost"; // ✅ tambah
};

export default function ShareBCLectureSessionsButton({
  title,
  dateIso,
  teacher,
  place,
  url,
  buttonLabel = "Bagikan",
  className,
  variant = "primary", // ✅ default lama
}: Props) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const [open, setOpen] = useState(false);
  const [copiedBC, setCopiedBC] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const shareUrl = useMemo(
    () => url || (typeof window !== "undefined" ? window.location.href : ""),
    [url]
  );

  const triggerStyle =
    variant === "primary"
      ? { backgroundColor: theme.primary, color: theme.white1 }
      : variant === "soft"
        ? {
            backgroundColor: theme.primary2,
            color: theme.primary,
            borderColor: theme.primary,
          }
        : {
            backgroundColor: "transparent",
            color: theme.primary,
            borderColor: theme.primary,
          };

  const triggerHasRing = variant !== "primary";
  const formatTanggalId = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const tanggal = d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const jam = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${tanggal} • ${jam} WIB`;
  };

  const bcText = useMemo(() => {
    const waktu = formatTanggalId(dateIso);
    return [
      `*${title || "Kajian Masjid"}*`,
      teacher ? `👤 Pemateri: *${teacher}*` : null,
      dateIso ? `🗓️ Waktu: ${waktu}` : null,
      place ? `📍 Tempat: ${place}` : null,
      "",
      "InsyaAllah kajian terbuka untuk umum. Yuk hadir & ajak keluarga/teman.",
      "",
      shareUrl ? `🔗 Info lengkap: ${shareUrl}` : null,
      "",
      "#KajianMasjid #MasjidKu",
    ]
      .filter(Boolean)
      .join("\n");
  }, [title, teacher, place, dateIso, shareUrl]);

  const handleCopyBC = async () => {
    try {
      await navigator.clipboard.writeText(bcText);
      setCopiedBC(true);
      setTimeout(() => setCopiedBC(false), 1500);
    } catch {
      // fallback paling sederhana
      // eslint-disable-next-line no-alert
      window.prompt("Salin teks berikut:", bcText);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    } catch {
      // eslint-disable-next-line no-alert
      window.prompt("Salin tautan berikut:", shareUrl);
    }
  };

  const handleWhatsApp = () => {
    const q = encodeURIComponent(bcText);
    window.open(`https://wa.me/?text=${q}`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={[
          "inline-flex items-center gap-2 px-3 py-2 rounded-md font-medium hover:opacity-90 transition",
          triggerHasRing ? "ring-1" : "",
          className || "",
        ].join(" ")}
        style={triggerStyle}
        aria-label="Bagikan kajian ini"
      >
        <Share2 size={16} />
        <span>{buttonLabel}</span>
      </button>


      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-[92%] max-w-md rounded-xl p-4 ring-1 shadow-lg space-y-3"
            style={{
              backgroundColor: theme.white1,
              borderColor: theme.white3,
              color: theme.black1,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3
                className="text-base font-semibold"
                style={{ color: theme.primary }}
              >
                Bagikan Kajian
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:opacity-80"
                aria-label="Tutup modal"
                style={{ color: theme.black1 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview BC */}
            <div
              className="rounded-md p-3 text-sm ring-1 max-h-60 overflow-auto whitespace-pre-wrap"
              style={{
                backgroundColor: theme.white2,
                borderColor: theme.white3,
                color: theme.black1,
              }}
            >
              {bcText}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {/* ✅ Primary: Salin Broadcast */}
              <button
                onClick={handleCopyBC}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium hover:opacity-90 transition"
                style={{ backgroundColor: theme.primary, color: theme.white1 }}
              >
                <Copy size={16} />
                <span>
                  {copiedBC ? "Broadcast Tersalin!" : "Salin Broadcast"}
                </span>
              </button>

              {/* Secondary: Salin Link */}
              {shareUrl && (
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium ring-1 hover:opacity-90 transition"
                  style={{
                    backgroundColor: theme.white2,
                    color: theme.black1,
                    borderColor: theme.white3,
                  }}
                >
                  <Copy size={16} />
                  <span>
                    {copiedLink ? "Link Tersalin!" : "Salin Link Saja"}
                  </span>
                </button>
              )}

              {/* Tertiary: WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium hover:opacity-90 transition"
                style={{
                  backgroundColor: theme.secondary,
                  color: theme.white1,
                }}
              >
                <MessageCircle size={16} />
                <span>Kirim via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
