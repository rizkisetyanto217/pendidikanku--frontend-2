import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
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
}: {
  palette: Palette;
  items: ScheduleItem[];
  seeAllPath?: string;
}) {
  return (
    <SectionCard palette={palette}>
      <div className="p-4 md:p-5 pb-2">
        <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
          <CalendarDays size={20} color={palette.quaternary} /> Jadwal Hari Ini
        </h3>
      </div>

      <div className="p-4 pt-2 sm:p-4 lg:px-3 lg:py-0  mb-4 space-y-3">
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
            <Badge variant="outline" palette={palette}>
              {s.time}
            </Badge>
          </SectionCard>
        ))}

        <div className="pt-3">
          <Link to={seeAllPath}>
            <Btn variant="outline" className="w-full" palette={palette}>
              Lihat Jadwal
            </Btn>
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
