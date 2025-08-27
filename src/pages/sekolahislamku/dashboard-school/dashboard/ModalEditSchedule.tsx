// src/pages/sekolahislamku/components/dashboard/ModalEditSchedule.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

type EditPayload = {
  title: string;
  time: string; // "HH:MM"
  room?: string;
};

type ModalEditScheduleProps = {
  open: boolean;
  onClose: () => void;
  palette: Palette;

  // Prefill
  defaultTitle?: string;
  defaultTime?: string;
  defaultRoom?: string;
  /** Opsional, kalau mau ditampilkan sebagai info tanggal di header modal */
  defaultDateISO?: string;

  onSubmit: (payload: EditPayload) => void;
  /** Opsional: jika diisi, tombol Hapus akan muncul */
  onDelete?: () => void;
};

const fmtLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : undefined;

const timeOk = (t: string) => /^\d{2}:\d{2}$/.test(t);

const ModalEditSchedule: React.FC<ModalEditScheduleProps> = ({
  open,
  onClose,
  palette,
  defaultTitle = "",
  defaultTime = "",
  defaultRoom = "",
  defaultDateISO,
  onSubmit,
  onDelete,
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [time, setTime] = useState(defaultTime);
  const [room, setRoom] = useState(defaultRoom);
  const [touched, setTouched] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset form ketika modal dibuka
  useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setTime(defaultTime);
      setRoom(defaultRoom);
      setTouched(false);
    }
  }, [open, defaultTitle, defaultTime, defaultRoom]);

  // ESC untuk close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const invalidTime = touched && !timeOk(time);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!title.trim()) return;
    if (!timeOk(time)) return;
    onSubmit({ title: title.trim(), time, room: room.trim() || undefined });
  };

  if (!open) return null;

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      aria-modal
      role="dialog"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
        style={{
          background: palette.white1,
          color: palette.black1,
          border: `1px solid ${palette.silver1}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: palette.silver1, background: palette.white2 }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-lg">Edit Jadwal</h3>
              {defaultDateISO && (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: palette.silver2 }}
                >
                  {fmtLong(defaultDateISO)}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg text-sm hover:opacity-80"
              style={{
                background: palette.white1,
                border: `1px solid ${palette.silver1}`,
                color: palette.black1,
              }}
              aria-label="Tutup"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Body / Form */}
        <form onSubmit={submit} className="px-5 py-4 space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm">Judul</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: TPA A — Tahsin"
              className="w-full rounded-xl px-3 h-10 outline-none text-sm"
              style={{
                background: palette.white2,
                color: palette.black1,
                border: `1px solid ${palette.silver1}`,
              }}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm">Waktu (HH:MM)</label>
              <input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="07:30"
                className="w-full rounded-xl px-3 h-10 outline-none text-sm"
                style={{
                  background: palette.white2,
                  color: palette.black1,
                  border: `1px solid ${invalidTime ? palette.error1 : palette.silver1}`,
                }}
                onBlur={() => setTouched(true)}
              />
              {invalidTime && (
                <p className="text-xs mt-1" style={{ color: palette.error1 }}>
                  Format waktu harus HH:MM (mis. 07:30)
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm">Lokasi / Ruang</label>
              <input
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Aula 1"
                className="w-full rounded-xl px-3 h-10 outline-none text-sm"
                style={{
                  background: palette.white2,
                  color: palette.black1,
                  border: `1px solid ${palette.silver1}`,
                }}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div
          className="px-5 py-4 flex items-center justify-between border-t"
          style={{ borderColor: palette.silver1, background: palette.white2 }}
        >
          
          <div className="flex gap-2">
            <Btn palette={palette} size="sm" variant="ghost" onClick={onClose}>
              Batal
            </Btn>
            <Btn
              palette={palette}
              size="sm"
              onClick={submit as any}
              disabled={!title.trim() || !timeOk(time)}
            >
              Simpan
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEditSchedule;
