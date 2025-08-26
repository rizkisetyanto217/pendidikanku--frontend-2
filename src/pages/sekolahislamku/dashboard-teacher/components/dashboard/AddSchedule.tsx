// =============================
// File: src/pages/sekolahislamku/pages/schedule/modal/TambahJadwal.tsx
// =============================
import React, { useEffect, useRef, useState } from "react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

export interface AddScheduleItem {
  time: string; // HH:MM
  title: string;
  room?: string;
  slug?: string;
}

const generateSlug = (text: string) =>
  (text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

export default function AddSchedule({
  open,
  onClose,
  onSubmit,
  palette,
  defaultTime,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: AddScheduleItem) => void;
  palette: Palette;
  defaultTime?: string; // optional prefill e.g. "10:00"
}) {
  const [time, setTime] = useState<string>(defaultTime || "");
  const [title, setTitle] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const [error, setError] = useState<string>("");

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  // Reset form when opened/closed
  useEffect(() => {
    if (open) {
      setTime(defaultTime || "");
      setTitle("");
      setRoom("");
      setError("");
      // Focus first input on open
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    }
  }, [open, defaultTime]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Close when clicking outside dialog
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!time || !title.trim()) {
      setError("Jam dan Judul wajib diisi");
      return;
    }
    const payload: AddScheduleItem = {
      time: time.trim(),
      title: title.trim(),
      room: room.trim() || undefined,
      slug: generateSlug(title),
    };
    onSubmit(payload);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.3)" }}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl shadow-xl border"
        style={{ background: palette.white1, borderColor: palette.silver1 }}
      >
        <div
          className="px-5 pt-4 pb-3 border-b"
          style={{ borderColor: palette.silver1 }}
        >
          <h3 className="text-base font-semibold">Tambah Jadwal</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {error ? (
            <div
              className="text-sm rounded-lg px-3 py-2"
              style={{ background: palette.white2, color: palette.quaternary }}
            >
              {error}
            </div>
          ) : null}

          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Jam *</label>
            <input
              ref={firstFieldRef}
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-xl border px-3 py-2 outline-none"
              style={{
                borderColor: palette.silver1,
                background: palette.white1,
                color: palette.black1,
              }}
              required
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Judul / Kegiatan *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: TPA A — Tahsin"
              className="rounded-xl border px-3 py-2 outline-none"
              style={{
                borderColor: palette.silver1,
                background: palette.white1,
                color: palette.black1,
              }}
              required
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Ruangan (opsional)</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Aula 1 / R. Tahfiz"
              className="rounded-xl border px-3 py-2 outline-none"
              style={{
                borderColor: palette.silver1,
                background: palette.white1,
                color: palette.black1,
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Btn
              type="button"
              variant="outline"
              palette={palette}
              onClick={onClose}
            >
              Batal
            </Btn>
            <Btn type="submit" palette={palette}>
              Simpan
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}


