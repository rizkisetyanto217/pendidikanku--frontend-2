import * as React from "react";
import {
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import MiniBar from "@/pages/sekolahislamku/components/ui/MiniBar";

export type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";
export type AttendanceMode = "onsite" | "online";

export type StudentRow = {
  id: string;
  name: string;
  avatarUrl?: string;
  statusToday?: AttendanceStatus | null;
  mode?: AttendanceMode;
  time?: string; // "07:28"
  iqraLevel?: string;
  juzProgress?: number; // 0..30 (boleh desimal)
  lastScore?: number; // 0..100
};

const STATUS_BADGE: Record<
  NonNullable<StudentRow["statusToday"]>,
  "success" | "info" | "warning" | "destructive" | "secondary"
> = {
  hadir: "success",
  online: "info",
  sakit: "warning",
  alpa: "destructive",
  izin: "secondary",
};

type Props = {
  palette: Palette;
  rows: StudentRow[];

  /** teks saat kosong */
  emptyText?: string;

  /** aksi */
  onDetail?: (id: string) => void;
  onGrade?: (id: string) => void;

  /** kontrol kolom */
  showIqra?: boolean;
  showJuz?: boolean;
  showLastScore?: boolean;
};

export default function StudentsTable({
  palette,
  rows,
  emptyText = "Tidak ada data siswa.",
  onDetail,
  onGrade,
  showIqra = true,
  showJuz = true,
  showLastScore = true,
}: Props) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ color: palette.silver2 }}>
            <th className="text-left py-2 pr-3 font-medium">Nama</th>
            <th className="text-left py-2 px-3 font-medium">Status</th>
            {showIqra && (
              <th className="text-left py-2 px-3 font-medium">Iqra</th>
            )}
            {showJuz && (
              <th className="text-left py-2 px-3 font-medium">Juz</th>
            )}
            {showLastScore && (
              <th className="text-left py-2 px-3 font-medium">
                Nilai Terakhir
              </th>
            )}
            <th className="text-right py-2 pl-3 font-medium">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((s) => (
            <tr
              key={s.id}
              className="border-t"
              style={{ borderColor: palette.silver1 }}
            >
              {/* Nama + mode/time */}
              <td className="py-3 pr-3">
                <div className="font-medium">{s.name}</div>
                {s.time && (
                  <div className="text-xs" style={{ color: palette.silver2 }}>
                    {s.mode === "online" ? "Online" : "Onsite"} • {s.time}
                  </div>
                )}
              </td>

              {/* Status */}
              <td className="py-3 px-3">
                <Badge
                  palette={palette}
                  variant={
                    s.statusToday ? STATUS_BADGE[s.statusToday] : "secondary"
                  }
                >
                  {(s.statusToday ?? "-").toString().toUpperCase()}
                </Badge>
              </td>

              {/* Iqra */}
              {showIqra && <td className="py-3 px-3">{s.iqraLevel ?? "-"}</td>}

              {/* Juz */}
              {showJuz && (
                <td className="py-3 px-3">
                  <div className="w-40">
                    <MiniBar
                      palette={palette}
                      label={undefined}
                      value={s.juzProgress ?? 0}
                      total={30}
                      showPercent={false}
                      height={6}
                    />
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      {(s.juzProgress ?? 0).toFixed(1)} / 30
                    </div>
                  </div>
                </td>
              )}

              {/* Nilai Terakhir */}
              {showLastScore && (
                <td className="py-3 px-3">
                  {typeof s.lastScore === "number" ? s.lastScore : "-"}
                </td>
              )}

              {/* Aksi */}
              <td className="py-3 pl-3 text-right">
                <div className="inline-flex gap-2">
                  <Btn
                    palette={palette}
                    size="sm"
                    variant="outline"
                    onClick={() => onDetail?.(s.id)}
                  >
                    Detail
                  </Btn>
                  <Btn
                    palette={palette}
                    size="sm"
                    variant="quaternary"
                    onClick={() => onGrade?.(s.id)}
                  >
                    Nilai
                  </Btn>
                </div>
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={
                  5 + Number(showIqra) + Number(showJuz) + Number(showLastScore)
                }
                className="py-6 text-center"
                style={{ color: palette.silver2 }}
              >
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
