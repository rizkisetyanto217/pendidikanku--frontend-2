// src/pages/sekolahislamku/assignment/ModalEditAssignmentClass.tsx
import React, { useEffect, useRef, useState } from "react";
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
  defaultValues?: {
    title?: string;
    dueDate?: string;
    total?: number;
    submitted?: number;
  };
  onSubmit: (payload: EditAssignmentPayload) => void;
};

/** Helper: ISO -> value input type datetime-local */
const isoToLocalInput = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

export default function ModalEditAssignmentClass({
  open,
  onClose,
  palette,
  defaultValues,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [dueDate, setDueDate] = useState(
    isoToLocalInput(defaultValues?.dueDate)
  );
  const [total, setTotal] = useState<number>(defaultValues?.total ?? 0);
  const [submitted, setSubmitted] = useState<number | undefined>(
    defaultValues?.submitted
  );

  // reset ketika open berubah
  useEffect(() => {
    if (!open) return;
    setTitle(defaultValues?.title ?? "");
    setDueDate(isoToLocalInput(defaultValues?.dueDate));
    setTotal(defaultValues?.total ?? 0);
    setSubmitted(defaultValues?.submitted);
  }, [open, defaultValues]);

  const dialogRef = useRef<HTMLDivElement>(null);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: "#0006" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        className="w-full md:max-w-lg rounded-t-2xl md:rounded-2xl shadow-xl overflow-hidden"
        style={{ background: palette.white1, color: palette.black1 }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: palette.silver1 }}
        >
          <div className="font-semibold">Edit Tugas</div>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-xl"
            style={{ border: `1px solid ${palette.silver1}` }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <div>
            <label className="text-sm mb-1 block">Judul Tugas</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 rounded-xl px-3 text-sm outline-none border"
              style={{ borderColor: palette.silver1 }}
              placeholder="contoh: Evaluasi Wudhu"
            />
          </div>

          <div>
            <label className="text-sm mb-1 block">Batas Pengumpulan</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-10 rounded-xl px-3 text-sm outline-none border"
              style={{ borderColor: palette.silver1 }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm mb-1 block">Target Total</label>
              <input
                type="number"
                min={0}
                value={total}
                onChange={(e) => setTotal(Number(e.target.value))}
                className="w-full h-10 rounded-xl px-3 text-sm outline-none border"
                style={{ borderColor: palette.silver1 }}
              />
            </div>
            <div>
              <label className="text-sm mb-1 block">Terkumpul</label>
              <input
                type="number"
                min={0}
                value={submitted ?? ""}
                onChange={(e) =>
                  setSubmitted(
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
                className="w-full h-10 rounded-xl px-3 text-sm outline-none border"
                style={{ borderColor: palette.silver1 }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 border-t flex items-center justify-end gap-2"
          style={{ borderColor: palette.silver1 }}
        >
          <Btn palette={palette} size="sm" variant="ghost" onClick={onClose}>
            Batal
          </Btn>
          <Btn
            palette={palette}
            size="sm"
            onClick={() => {
              onSubmit({
                title: title.trim(),
                dueDate: new Date(dueDate).toISOString(),
                total,
                submitted,
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
