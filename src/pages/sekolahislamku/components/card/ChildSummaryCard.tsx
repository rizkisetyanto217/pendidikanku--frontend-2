import { Link } from "react-router-dom";
import {
  User2,
  BookOpen,
  CheckCircle2,
  Clock,
  ChevronRight,
  NotebookPen,
} from "lucide-react";
import {
  Badge,
  Btn,
  ProgressBar,
  SectionCard,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import { Palette } from "@/pages/sekolahislamku/components/ui/Primitives";

export interface ChildDetail {
  id: string;
  name: string;
  className: string;
  attendanceToday?: "present" | "online" | "absent" | null;
  memorizationJuz?: number;
  iqraLevel?: string;
  lastScore?: number;
}

export default function ChildSummaryCard({
  child,
  palette,
  detailPath = "/anak",
  notePath = "/anak/catatan",
  progressPath = "/anak/progress",
}: {
  child?: ChildDetail;
  palette: Palette;
  detailPath?: string;
  notePath?: string;
  progressPath?: string;
}) {
  return (
    <SectionCard palette={palette}>
      <div className="p-4 md:p-5 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
            <User2 size={20} color={palette.quaternary} />
            <span>{child?.name ?? "—"}</span>
            <Badge variant="outline" className="ml-1" palette={palette}>
              {child?.className ?? "Kelas"}
            </Badge>
          </h3>
          <Link to={detailPath} className="inline-flex items-center">
            <Btn size="sm" variant="ghost" palette={palette}>
              Detail <ChevronRight className="ml-1" size={16} />
            </Btn>
          </Link>
        </div>
      </div>

      <div className="sm:p-4 md:pt-1 pt-0 grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Absensi */}
          <SectionCard
            palette={palette}
            className="p-3"
            style={{ background: palette.white2 }}
          >
            <div style={{ fontSize: 12, color: palette.silver2 }}>
              Absensi Hari Ini
            </div>
            <div className="mt-1 flex items-center gap-2">
              {child?.attendanceToday === "present" && (
                <Badge variant="success" palette={palette}>
                  <CheckCircle2 className="mr-1" size={12} /> Hadir
                </Badge>
              )}
              {child?.attendanceToday === "online" && (
                <Badge variant="info" palette={palette}>
                  <Clock className="mr-1" size={12} /> Online
                </Badge>
              )}
              {child?.attendanceToday === "absent" && (
                <Badge variant="destructive" palette={palette}>
                  Alpa
                </Badge>
              )}
              {!child?.attendanceToday && (
                <Badge variant="outline" palette={palette}>
                  Belum tercatat
                </Badge>
              )}
            </div>
          </SectionCard>

          {/* Hafalan */}
          <SectionCard
            palette={palette}
            className="p-3"
            style={{ background: palette.white2 }}
          >
            <div style={{ fontSize: 12, color: palette.silver2 }}>Hafalan</div>
            <div className="mt-2">
              <ProgressBar
                value={
                  (Math.max(0, Math.min(2, child?.memorizationJuz ?? 0)) / 2) *
                  100
                }
                palette={palette}
              />
              <div
                className="mt-1"
                style={{ fontSize: 12, color: palette.silver2 }}
              >
                ~ {child?.memorizationJuz ?? 0} Juz
              </div>
            </div>
          </SectionCard>

          {/* Nilai terakhir */}
          <SectionCard
            palette={palette}
            className="p-3"
            style={{ background: palette.white2 }}
          >
            <div style={{ fontSize: 12, color: palette.silver2 }}>
              Terakhir Nilai
            </div>
            <div className="mt-1 text-lg font-semibold">
              {child?.lastScore ?? 0}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          palette={palette}
          className="p-3"
          style={{ background: palette.white2 }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={16} color={palette.tertiary} />
              <div className="text-sm">
                Level Bacaan:{" "}
                <span style={{ fontWeight: 600 }}>
                  {child?.iqraLevel ?? "-"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row md:items-center">
              <Link to={notePath} className="w-full md:w-auto">
                <Btn
                  size="sm"
                  variant="outline"
                  palette={palette}
                  className="w-full md:w-auto"
                >
                  <NotebookPen className="mr-2" size={16} /> Catatan
                </Btn>
              </Link>
              <Link to={progressPath} className="w-full md:w-auto">
                <Btn
                  size="sm"
                  variant="quaternary"
                  palette={palette}
                  className="w-full md:w-auto"
                >
                  Lihat Progress
                </Btn>
              </Link>
            </div>
          </div>
        </SectionCard>
      </div>
    </SectionCard>
  );
}
