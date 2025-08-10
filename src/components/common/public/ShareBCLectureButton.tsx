import React, { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Share2, X, Copy, MessageCircle } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

/* ========= Types ========= */
type MinimalSession = { startTime: string; place?: string };

type Props = {
  lectureTitle: string;
  teacherNames?: string;
  nextDateIso?: string; // opsional—kalau kosong akan dipilih dari sessions
  place?: string; // opsional—fallback dari sesi terdekat
  sessions?: MinimalSession[]; // untuk hitung jadwal terdekat
  url?: string; // default: window.location.href
  buttonLabel?: string; // label tombol trigger
  className?: string; // class tambahan untuk trigger
  variant?: "primary" | "soft" | "ghost";
};

/* ========= Utils ========= */
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

const pickNext = (sessions?: MinimalSession[]) => {
  if (!sessions?.length) return undefined as Date | undefined;
  const items = sessions
    .filter((s) => !!s.startTime)
    .map((s) => new Date(s.startTime))
    .sort((a, b) => a.getTime() - b.getTime());

  const now = Date.now();
  return items.find((d) => d.getTime() >= now) ?? items[0];
};

/* ========= Component ========= */
export default function ShareBCLectureButton({
  lectureTitle,
  teacherNames,
  nextDateIso,
  place,
  sessions,
  url,
  buttonLabel = "Bagikan",
  className,
  variant = "ghost",
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

  const nearestDateIso = useMemo(() => {
    if (nextDateIso) return nextDateIso;
    const d = pickNext(sessions);
    return d?.toISOString();
  }, [nextDateIso, sessions]);

  const nearestPlace = useMemo(() => {
    if (place) return place;
    if (!sessions?.length || !nearestDateIso) return undefined;
    const hit = sessions.find(
      (s) => new Date(s.startTime).toISOString() === nearestDateIso
    );
    return hit?.place;
  }, [place, sessions, nearestDateIso]);

  const bcText = useMemo(() => {
    const waktu = formatTanggalId(nearestDateIso);
    return [
      `*${lectureTitle || "Kajian Masjid"}*`,
      teacherNames ? `👤 Pemateri: *${teacherNames}*` : null,
      nearestDateIso ? `🗓️ Waktu: ${waktu}` : null,
      nearestPlace ? `📍 Tempat: ${nearestPlace}` : null,
      "",
      "InsyaAllah kajian terbuka untuk umum. Yuk hadir & ajak keluarga/teman.",
      "",
      shareUrl ? `🔗 Info lengkap: ${shareUrl}` : null,
      "",
      "#KajianMasjid #MasjidKu",
    ]
      .filter(Boolean)
      .join("\n");
  }, [lectureTitle, teacherNames, nearestDateIso, nearestPlace, shareUrl]);

  /* ===== Handlers ===== */
  const handleCopy = useCallback(
    async (text: string, setFlag: (v: boolean) => void) => {
      try {
        await navigator.clipboard.writeText(text);
        setFlag(true);
        setTimeout(() => setFlag(false), 1500);
      } catch {
        // eslint-disable-next-line no-alert
        window.prompt("Salin teks berikut:", text);
      }
    },
    []
  );

  const handleCopyBC = () => handleCopy(bcText, setCopiedBC);
  const handleCopyLink = () => handleCopy(shareUrl, setCopiedLink);

  const handleWhatsApp = () => {
    const q = encodeURIComponent(bcText);
    window.open(`https://wa.me/?text=${q}`, "_blank", "noopener,noreferrer");
  };

  /* ===== Side effects: lock scroll + close on ESC ===== */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* ===== Trigger styles ===== */
  const triggerBase =
    "inline-flex items-center gap-2 px-3 py-2 rounded-md font-medium hover:opacity-90 transition";
  const triggerStyleMap: Record<
    NonNullable<Props["variant"]>,
    React.CSSProperties
  > = {
    primary: { backgroundColor: theme.primary, color: theme.white1 },
    soft: {
      backgroundColor: theme.primary2,
      color: theme.primary,
      borderColor: theme.primary,
    },
    ghost: {
      backgroundColor: "transparent",
      color: theme.primary,
      borderColor: theme.primary,
    },
  };
  const triggerHasRing = variant !== "primary";

  /* ===== Modal (portal to body) ===== */
  const modal =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            {/* overlay */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(2px)",
              }}
              onClick={() => setOpen(false)}
            />
            {/* dialog */}
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
              {/* header */}
              <div className="flex items-center justify-between">
                <h3
                  className="text-base font-semibold"
                  style={{ color: theme.primary }}
                >
                  Bagikan Tema Kajian
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

              {/* preview */}
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

              {/* actions */}
              <div className="space-y-2">
                <button
                  onClick={handleCopyBC}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium hover:opacity-90 transition"
                  style={{
                    backgroundColor: theme.primary,
                    color: theme.white1,
                  }}
                >
                  <Copy size={16} />
                  <span>
                    {copiedBC ? "Broadcast Tersalin!" : "Salin Broadcast"}
                  </span>
                </button>

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
                      {copiedLink ? "Link Tersalin!" : "Salin Link"}
                    </span>
                  </button>
                )}

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
          </div>,
          document.body
        )
      : null;

  /* ===== Render ===== */
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={[
          triggerBase,
          triggerHasRing ? "ring-1" : "",
          className || "",
        ].join(" ")}
        style={triggerStyleMap[variant]}
        aria-label="Bagikan tema kajian ini"
      >
        <Share2 size={16} />
        <span>{buttonLabel}</span>
      </button>
      {modal}
    </>
  );
}
