// src/pages/sekolahislamku/schedule/components/ScheduleEditorModal.tsx
import React, { useEffect, useState } from "react";
import EditModal from "@/pages/sekolahislamku/components/common/EditModal";
import { type Palette } from "@/pages/sekolahislamku/components/ui/Primitives";

type ScheduleForm = {
  time: string;
  title: string;
  room?: string;
  teacher?: string;
  type?: "class" | "exam" | "event";
  note?: string;
  description?: string;
};

export type ScheduleEditorModalProps = {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  dateISO: string;
  initial?: Partial<ScheduleForm> | null;
  onSubmit: (payload: ScheduleForm) => void | Promise<void>;
  loading?: boolean;
};

const idDate = (d: Date) =>
  d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function ScheduleEditorModal({
  open,
  onClose,
  palette,
  dateISO,
  initial,
  onSubmit,
  loading = false,
}: ScheduleEditorModalProps) {
  const [data, setData] = useState<ScheduleForm>({
    time: initial?.time ?? "07:30",
    title: initial?.title ?? "",
    room: initial?.room ?? "",
    teacher: initial?.teacher ?? "",
    type: initial?.type ?? "class",
    note: initial?.note ?? "",
    description: initial?.description ?? "",
  });

  useEffect(() => {
    if (!open) return;
    setData({
      time: initial?.time ?? "07:30",
      title: initial?.title ?? "",
      room: initial?.room ?? "",
      teacher: initial?.teacher ?? "",
      type: initial?.type ?? "class",
      note: initial?.note ?? "",
      description: initial?.description ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    initial?.time,
    initial?.title,
    initial?.room,
    initial?.teacher,
    initial?.type,
    initial?.note,
    initial?.description,
  ]);

  const prettyDate = idDate(new Date(dateISO));

  const submit = async () => {
    if (!data.title.trim()) return;
    await onSubmit(data);
  };

  return (
    <EditModal
      open={open}
      onClose={onClose}
      onSubmit={submit}
      palette={palette}
      title={
        <span className="flex flex-col">
          <span>{initial ? "Edit Jadwal" : "Tambah Jadwal"}</span>
          <span
            className="text-xs font-normal"
            style={{ color: palette.black2 }}
          >
            {prettyDate}
          </span>
        </span>
      }
      submitLabel="Simpan"
      cancelLabel="Batal"
      loading={loading}
    >
      <div className="grid gap-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs" style={{ color: palette.black2 }}>
              Waktu
            </label>
            <input
              type="time"
              value={data.time}
              onChange={(e) => setData((s) => ({ ...s, time: e.target.value }))}
              className="h-9 w-full rounded-xl px-3 text-sm"
              style={{
                background: palette.white2,
                color: palette.black1,
                border: `1px solid ${palette.silver1}`,
              }}
              required
            />
          </div>
          <div>
            <label className="text-xs" style={{ color: palette.black2 }}>
              Jenis
            </label>
            <select
              value={data.type}
              onChange={(e) =>
                setData((s) => ({ ...s, type: e.target.value as any }))
              }
              className="h-9 w-full rounded-xl px-3 text-sm"
              style={{
                background: palette.white2,
                color: palette.black1,
                border: `1px solid ${palette.silver1}`,
              }}
            >
              <option value="class">Kelas</option>
              <option value="exam">Ujian</option>
              <option value="event">Kegiatan</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs" style={{ color: palette.black2 }}>
            Judul
          </label>
          <input
            value={data.title}
            onChange={(e) => setData((s) => ({ ...s, title: e.target.value }))}
            className="h-9 w-full rounded-xl px-3 text-sm"
            style={{
              background: palette.white2,
              color: palette.black1,
              border: `1px solid ${palette.silver1}`,
            }}
            placeholder="Contoh: Tahfiz Setoran"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs" style={{ color: palette.black2 }}>
              Ruang/Tempat
            </label>
            <input
              value={data.room}
              onChange={(e) => setData((s) => ({ ...s, room: e.target.value }))}
              className="h-9 w-full rounded-xl px-3 text-sm"
              style={{
                background: palette.white2,
                color: palette.black1,
                border: `1px solid ${palette.silver1}`,
              }}
              placeholder="Aula 1"
            />
          </div>
          <div>
            <label className="text-xs" style={{ color: palette.black2 }}>
              Pengajar
            </label>
            <input
              value={data.teacher}
              onChange={(e) =>
                setData((s) => ({ ...s, teacher: e.target.value }))
              }
              className="h-9 w-full rounded-xl px-3 text-sm"
              style={{
                background: palette.white2,
                color: palette.black1,
                border: `1px solid ${palette.silver1}`,
              }}
              placeholder="Ust. Ali"
            />
          </div>
        </div>

        <div>
          <label className="text-xs" style={{ color: palette.black2 }}>
            Catatan Singkat
          </label>
          <input
            value={data.note}
            onChange={(e) => setData((s) => ({ ...s, note: e.target.value }))}
            className="h-9 w-full rounded-xl px-3 text-sm"
            style={{
              background: palette.white2,
              color: palette.black1,
              border: `1px solid ${palette.silver1}`,
            }}
            placeholder="Target hafalan 5 ayat per siswa"
          />
        </div>

        <div>
          <label className="text-xs" style={{ color: palette.black2 }}>
            Deskripsi
          </label>
          <textarea
            value={data.description}
            onChange={(e) =>
              setData((s) => ({ ...s, description: e.target.value }))
            }
            className="min-h-[110px] w-full rounded-xl px-3 py-2 text-sm"
            style={{
              background: palette.white2,
              color: palette.black1,
              border: `1px solid ${palette.silver1}`,
            }}
            placeholder="Deskripsi panjang (opsional)"
          />
        </div>
      </div>
    </EditModal>
  );
}
