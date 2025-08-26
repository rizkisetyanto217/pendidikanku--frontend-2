// src/pages/sekolahislamku/schedule/TambahJadwal.tsx
import React, { useMemo, useState } from "react";
import { X, Save, CalendarDays } from "lucide-react";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

export interface ScheduleItem {
  time: string; // "07:30"
  title: string;
  room?: string;
  slug?: string;
}

const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

export default function TambahJadwal({
  open,
  onClose,
  palette,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  onCreated?: (item: ScheduleItem) => void;
}) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState<string>("");
  const [room, setRoom] = useState("");

  const isValid = useMemo(() => title.trim() && time.trim(), [title, time]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    const item: ScheduleItem = {
      title: title.trim(),
      time: time.trim(),
      room: room.trim() || undefined,
      slug: generateSlug(title.trim()),
    };
    onCreated?.(item);
    // reset + tutup
    setTitle("");
    setTime("");
    setRoom("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4">
        <SectionCard palette={palette}>
          <form onSubmit={handleSubmit} className="p-4 md:p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-9 w-9 grid place-items-center rounded-xl"
                  style={{
                    background: palette.white3,
                    color: palette.quaternary,
                  }}
                >
                  <CalendarDays size={18} />
                </span>
                <div className="text-lg font-semibold">Tambah Jadwal</div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg"
                aria-label="Tutup"
                style={{ background: palette.white2, color: palette.silver2 }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div
                  className="text-xs mb-1"
                  style={{ color: palette.silver2 }}
                >
                  Judul
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mis. Upacara bendera"
                  className="w-full rounded-lg border px-3 py-2 bg-transparent"
                  style={{ borderColor: palette.silver1 }}
                  required
                />
              </div>

              <div>
                <div
                  className="text-xs mb-1"
                  style={{ color: palette.silver2 }}
                >
                  Waktu
                </div>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 bg-transparent"
                  style={{ borderColor: palette.silver1 }}
                  required
                />
              </div>

              <div>
                <div
                  className="text-xs mb-1"
                  style={{ color: palette.silver2 }}
                >
                  Ruangan (opsional)
                </div>
                <input
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Mis. Aula, Lab 1"
                  className="w-full rounded-lg border px-3 py-2 bg-transparent"
                  style={{ borderColor: palette.silver1 }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Btn
                type="button"
                palette={palette}
                variant="quaternary"
                onClick={onClose}
              >
                Batal
              </Btn>
              <Btn palette={palette} disabled={!isValid}>
                <Save size={16} className="mr-2" /> Simpan
              </Btn>
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
