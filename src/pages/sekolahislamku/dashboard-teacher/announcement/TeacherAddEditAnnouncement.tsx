import React, { useEffect, useState } from "react";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

export type TeacherAnnouncementForm = {
  id?: string;
  title: string;
  date: string; // ISO (YYYY-MM-DDT00:00:00Z)
  body: string;
  themeId?: string | null;
};

type Props = {
  palette: Palette;
  open: boolean;
  onClose: () => void;
  initial?: TeacherAnnouncementForm | null; // jika ada => mode Edit
  onSubmit: (v: TeacherAnnouncementForm) => void;
  saving?: boolean;
  error?: string | null;
};

const isoToInput = (iso?: string) => (iso ? iso.slice(0, 10) : "");
const inputToIsoUTC = (ymd: string) =>
  ymd ? new Date(`${ymd}T00:00:00.000Z`).toISOString() : "";

export default function TeacherAddEditAnnouncement({
  palette,
  open,
  onClose,
  initial,
  onSubmit,
  saving,
  error,
}: Props) {
  const isEdit = !!initial?.id;

  const [title, setTitle] = useState("");
  const [dateYmd, setDateYmd] = useState("");
  const [body, setBody] = useState("");
  const [themeId, setThemeId] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title ?? "");
      setDateYmd(isoToInput(initial.date));
      setBody(initial.body ?? "");
      setThemeId(initial.themeId ?? "");
    } else {
      setTitle("");
      setDateYmd("");
      setBody("");
      setThemeId("");
    }
  }, [open, initial]);

  if (!open) return null;
  const disabled = saving || !title.trim() || !dateYmd;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center"
      style={{ background: "rgba(0,0,0,.35)" }}
    >
      <SectionCard
        palette={palette}
        className="w-[min(720px,94vw)] p-4 md:p-5 rounded-2xl shadow-xl"
        style={{ background: palette.white1, color: palette.black1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Edit Pengumuman" : "Tambah Pengumuman"}
          </h3>
          <button
            className="text-sm opacity-70 hover:opacity-100"
            onClick={onClose}
            aria-label="Tutup"
          >
            Tutup
          </button>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm opacity-80">Judul</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: palette.silver2,
                background: palette.white2,
              }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul pengumuman"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm opacity-80">Tanggal</label>
            <input
              type="date"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: palette.silver2,
                background: palette.white2,
              }}
              value={dateYmd}
              onChange={(e) => setDateYmd(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm opacity-80">Isi</label>
            <textarea
              rows={5}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: palette.silver2,
                background: palette.white2,
              }}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Konten pengumuman"
            />
          </div>

          {!!error && (
            <div className="text-sm" style={{ color: palette.error1 }}>
              {error}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Btn
            palette={palette}
            variant="ghost"
            onClick={onClose}
            disabled={!!saving}
          >
            Batal
          </Btn>
          <Btn
            palette={palette}
            onClick={() =>
              onSubmit({
                id: initial?.id,
                title: title.trim(),
                date: inputToIsoUTC(dateYmd),
                body: body.trim(),
                themeId: (themeId || "").trim() || undefined,
              })
            }
            disabled={disabled}
          >
            {saving ? "Menyimpan…" : isEdit ? "Simpan" : "Tambah"}
          </Btn>
        </div>
      </SectionCard>
    </div>
  );
}
