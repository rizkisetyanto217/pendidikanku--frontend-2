import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight } from "lucide-react";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

export interface ScheduleItem {
  time: string; // "07:30"
  title: string;
  room?: string;
}

export default function TodayScheduleCard({
  palette,
  items,
  seeAllPath = "/jadwal",
  onAdd, // ⬅️ opsional
  addLabel = "Tambah Jadwal", // ⬅️ opsional (default teks)
  addHref, // ⬅️ NEW
}: {
  palette: Palette;
  items: ScheduleItem[];
  seeAllPath?: string;
  onAdd?: () => void; // ⬅️ kalau dikirim, tombol muncul
  addLabel?: string; // ⬅️ bisa ganti teks tombol
  addHref?: string; // ⬅️ NEW
}) {
  return (
    <SectionCard palette={palette}>
      <div className="p-4 md:p-5 pb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
          <CalendarDays size={20} color={palette.quaternary} /> Jadwal Hari Ini
        </h3>

        {addHref ? (
          <Link to={addHref}>
            <Btn size="sm" variant="ghost" palette={palette}>
              {addLabel}
            </Btn>
          </Link>
        ) : onAdd ? (
          <Btn size="sm" variant="ghost" palette={palette} onClick={onAdd}>
            {addLabel}
          </Btn>
        ) : null}
      </div>

      <div className="p-4 pt-2 sm:p-4 lg:px-3 lg:py-0 mb-4 space-y-3">
        {items.map((s, i) => (
          <SectionCard
            key={`${s.title}-${i}`}
            palette={palette}
            className="p-3 flex items-center justify-between"
            style={{ background: palette.white2 }}
          >
            <div>
              <div className="text-sm font-medium">{s.title}</div>
              <div style={{ fontSize: 12, color: palette.silver2 }}>
                {s.room}
              </div>
            </div>
            <Badge variant="white1" palette={palette}>
              {s.time}
            </Badge>
          </SectionCard>
        ))}

        <div className="pt-3">
          <Link to={"/sekolah/semua-jadwal"}>
            <Btn variant="ghost" className="w-full" palette={palette}>
              Lihat Jadwal <ChevronRight className="ml-1" size={16} />
            </Btn>
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
