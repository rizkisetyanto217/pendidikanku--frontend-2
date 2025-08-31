// src/pages/sekolahislamku/assignment/ModalEditAssignmentClass.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

export type EditAssignmentPayload = {
  title: string;
  dueDate: string; // ISO
  total: number;
  submitted?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  defaultValues?: Partial<{
    title: string;
    dueDate: string; // ISO
    total: number;
    submitted: number;
  }>;
  onSubmit: (payload: EditAssignmentPayload) => void;
};

/* ============== Utils ============== */
const pad = (n: number) => n.toString().padStart(2, "0");
const isoToLocalInput = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const localToISO = (val: string) =>
  val ? new Date(val).toISOString() : new Date().toISOString();

// heuristik sederhana: tentukan dark/light untuk <input type="datetime-local">
const isDarkPalette = (p: Palette) => {
  const hex = p.white1.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 128;
};

const themeStyles = (p: Palette) => {
  const dark = isDarkPalette(p);
  return {
    dialog: { background: p.white1, color: p.black1 } as const,
    border: { borderColor: p.silver1 } as const,
    closeBtn: { border: `1px solid ${p.silver1}`, color: p.black2 } as const,
    label: { color: p.black2 } as const,
    field: {
      background: p.white2,
      color: p.black1,
      border: `1px solid ${p.silver1}`,
      colorScheme: dark ? "dark" : "light",
    } as const,
  };
};

/* ============== Field (DRY) ============== */
function Field({
  id,
  label,
  palette,
  children,
}: {
  id: string;
  label: string;
  palette: Palette;
  children: (common: {
    id: string;
    className: string;
    style: React.CSSProperties;
  }) => React.ReactNode;
}) {
  const s = themeStyles(palette);
  return (
    <div>
      <label htmlFor={id} className="text-sm mb-1 block" style={s.label}>
        {label}
      </label>
      {children({
        id,
        className: "w-full h-10 rounded-xl px-3 text-sm outline-none",
        style: s.field,
      })}
    </div>
  );
}

/* ============== Modal ============== */
export default function ModalEditAssignmentClass({
  open,
  onClose,
  palette,
  defaultValues,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [dueLocal, setDueLocal] = useState(
    isoToLocalInput(defaultValues?.dueDate)
  );
  const [total, setTotal] = useState<number>(defaultValues?.total ?? 0);
  const [submitted, setSubmitted] = useState<number | undefined>(
    defaultValues?.submitted
  );

  // reset saat buka / ganti defaultValues
  useEffect(() => {
    if (!open) return;
    setTitle(defaultValues?.title ?? "");
    setDueLocal(isoToLocalInput(defaultValues?.dueDate));
    setTotal(defaultValues?.total ?? 0);
    setSubmitted(defaultValues?.submitted);
  }, [
    open,
    defaultValues?.title,
    defaultValues?.dueDate,
    defaultValues?.total,
    defaultValues?.submitted,
  ]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const disabled = useMemo(
    () => !title.trim() || !dueLocal || total < 0 || (submitted ?? 0) < 0,
    [title, dueLocal, total, submitted]
  );
  const s = themeStyles(palette);
  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: "#0006" }}
      onClick={onOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full md:max-w-lg rounded-t-2xl md:rounded-2xl shadow-xl overflow-hidden"
        style={s.dialog}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={s.border}
        >
          <div className="font-semibold">Edit Tugas</div>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-xl"
            style={s.closeBtn}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <Field id="class-title" label="Judul Tugas" palette={palette}>
            {(common) => (
              <input
                {...common}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="contoh: Evaluasi Wudhu"
              />
            )}
          </Field>

          <Field id="class-due" label="Batas Pengumpulan" palette={palette}>
            {(common) => (
              <input
                {...common}
                type="datetime-local"
                value={dueLocal}
                onChange={(e) => setDueLocal(e.target.value)}
              />
            )}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field id="class-total" label="Target Total" palette={palette}>
              {(common) => (
                <input
                  {...common}
                  type="number"
                  min={0}
                  value={total}
                  onChange={(e) => setTotal(Number(e.target.value || 0))}
                />
              )}
            </Field>

            <Field
              id="class-submitted"
              label="Terkumpul (opsional)"
              palette={palette}
            >
              {(common) => (
                <input
                  {...common}
                  type="number"
                  min={0}
                  value={submitted ?? ""}
                  onChange={(e) =>
                    setSubmitted(
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
              )}
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 border-t flex items-center justify-end gap-2"
          style={s.border}
        >
          <Btn palette={palette} size="sm" variant="ghost" onClick={onClose}>
            Batal
          </Btn>
          <Btn
            palette={palette}
            size="sm"
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              onSubmit({
                title: title.trim(),
                dueDate: localToISO(dueLocal),
                total: Number.isFinite(total) ? total : 0,
                submitted:
                  submitted === undefined || Number.isNaN(submitted)
                    ? undefined
                    : submitted,
              });
            }}
          >
            Simpan
          </Btn>
        </div>
      </div>
    </div>
  );
}
