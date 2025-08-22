// src/pages/sekolahislamku/components/card/TodayScheduleCard.tsx
import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight } from "lucide-react";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

export interface ScheduleItem {
  time: string;
  title: string;
  room?: string;
  slug?: string;
}

const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

export default function TodayScheduleCard({
  palette,
  items,
  seeAllPath = "/jadwal",
  seeAllState, // ⬅️ NEW
  onAdd,
  title = "Daftar Jadwal",
  addLabel = "Tambah Jadwal",
  addHref,
}: {
  palette: Palette;
  items: ScheduleItem[];
  title?: string;
  seeAllPath?: string;
  seeAllState?: any; // ⬅️ NEW
  onAdd?: () => void;
  addLabel?: string;
  addHref?: string;
}) {
  return (
    <SectionCard palette={palette}>
      <div className="p-4 md:p-5 pb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
          <CalendarDays size={20} color={palette.quaternary} /> {title}
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
        {items.map((s, i) => {
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
                  <div style={{ fontSize: 12, color: palette.silver2 }}>
                    {s.room}
                  </div>
                </div>
                <Badge variant="white1" palette={palette}>
                  {s.time}
                </Badge>
              </SectionCard>
            </Link>
          );
        })}

        <div className="pt-3">
          <Link to={seeAllPath} state={seeAllState}>
            {" "}
            {/* ⬅️ pass state */}
            <Btn variant="ghost" className="w-full" palette={palette}>
              Lihat Jadwal <ChevronRight className="ml-1" size={16} />
            </Btn>
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
