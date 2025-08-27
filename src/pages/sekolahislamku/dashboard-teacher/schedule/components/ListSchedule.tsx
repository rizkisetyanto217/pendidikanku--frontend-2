import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight } from "lucide-react";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

// Reuse ScheduleItem type dari TodayScheduleCard
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

export default function ListJadwal({
  palette,
  items,
  title = "Daftar Jadwal",
  onAdd,
  addLabel = "Tambah Jadwal",
}: {
  palette: Palette;
  items: ScheduleItem[];
  title?: string;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <SectionCard palette={palette}>
      {/* Header */}
      <div className="p-4 md:p-5 pb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
          <CalendarDays size={20} color={palette.quaternary} /> {title}
        </h3>

        {onAdd && (
          <Btn size="sm" variant="ghost" palette={palette} onClick={onAdd}>
            {addLabel}
          </Btn>
        )}
      </div>

      {/* List Items */}
      <div className="p-4 pt-2 sm:p-4 lg:px-3 lg:py-0 space-y-3 mb-5">
        {items.length > 0 ? (
          items.map((s, i) => {
            const slug = s.slug || generateSlug(s.title);
            return (
              <Link key={`${s.title}-${i}`} to={`/jadwal/${slug}`}>
                <SectionCard
                  palette={palette}
                  className="p-3 flex items-center justify-between hover:bg-gray-50 transition rounded-xl mb-3"
                  style={{ background: palette.white2 }}
                >
                  <div>
                    <div className="text-sm font-medium flex gap-3">
                      {s.title}
                    </div>
                    {s.room && (
                      <div
                        style={{ fontSize: 12, color: palette.silver2 }}
                        className="truncate"
                      >
                        {s.room}
                      </div>
                    )}
                  </div>
                  <Badge variant="white1" palette={palette}>
                    {s.time}
                  </Badge>
                </SectionCard>
              </Link>
            );
          })
        ) : (
          <div
            className="text-sm text-center py-4"
            style={{ color: palette.silver2 }}
          >
            Belum ada jadwal tersedia.
          </div>
        )}
      </div>
    </SectionCard>
  );
}
