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

type SeeAllState<T = unknown> = T | undefined;

const slugify = (text: string) =>
  (text ?? "")
    .toString()
    .normalize("NFKD") // buang diakritik
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

export default function TodayScheduleCard<TState = unknown>({
  palette,
  items,
  title = "Daftar Jadwal",
  seeAllPath = "/jadwal",
  seeAllState,
  getSeeAllState,
  onAdd,
  addLabel = "Tambah Jadwal",
  addHref,
  maxItems = 3,
  onItemClick,
}: {
  palette: Palette;
  items: ScheduleItem[];
  title?: string;
  /** Rute tujuan tombol “Lihat Jadwal” */
  seeAllPath?: string;
  /** State yang dilempar ke rute tujuan (opsional) */
  seeAllState?: SeeAllState<TState>;
  /** Jika disediakan, state akan dihitung dari items saat render */
  getSeeAllState?: (items: ScheduleItem[]) => SeeAllState<TState>;
  /** Aksi tambah (kalau tidak pakai addHref) */
  onAdd?: () => void;
  addLabel?: string;
  addHref?: string;
  /** Berapa item ditampilkan di kartu (default 3) */
  maxItems?: number;
  /** Intercept klik item (opsional) */
  onItemClick?: (item: ScheduleItem, index: number) => void;
}) {
  const visible = maxItems > 0 ? items.slice(0, maxItems) : items;
  const finalState =
    typeof getSeeAllState === "function" ? getSeeAllState(items) : seeAllState;

  return (
    <SectionCard palette={palette}>
      <div className="p-4 md:p-5 pb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
          <CalendarDays size={20} color={palette.quaternary} /> {title}
        </h3>

        {addHref ? (
          <Link to={addHref}>
            <Btn
              size="sm"
              variant="ghost"
              palette={palette}
              aria-label={addLabel}
            >
              {addLabel}
            </Btn>
          </Link>
        ) : onAdd ? (
          <Btn
            size="sm"
            variant="ghost"
            palette={palette}
            onClick={onAdd}
           
            aria-label={addLabel}
          >
            {addLabel}
          </Btn>
        ) : null}
      </div>

      <div className="p-4 pt-2 sm:p-4 lg:px-3 lg:py-0 mb-4 space-y-3">
        {visible.map((s, i) => {
          const slug = s.slug || slugify(s.title);
          const href = `/jadwal/${slug}`;
          return (
            <Link
              key={`${slug}-${s.time}-${i}`}
              to={href}
              onClick={(e) => {
                if (onItemClick) {
                  e.preventDefault();
                  onItemClick(s, i);
                }
              }}
            >
              <SectionCard
                palette={palette}
                className="p-3 flex items-center justify-between hover:bg-gray-50 transition rounded-xl mb-3"
                style={{ background: palette.white2 }}
              >
                <div>
                  <div className="text-sm font-medium flex gap-3">
                    {s.title}
                  </div>
                  {(s.room || s.time) && (
                    <div style={{ fontSize: 12, color: palette.black2 }}>
                      {s.room}
                    </div>
                  )}
                </div>
                <Badge
                  variant="white1"
                  palette={palette}
                  aria-label={`Waktu ${s.time}`}
                >
                  {s.time}
                </Badge>
              </SectionCard>
            </Link>
          );
        })}

        <div className="pt-3">
          <Link to={seeAllPath} state={finalState}>
            <Link to={seeAllPath} state={finalState}>
              <Btn
                variant="ghost"
                className="w-full"
                palette={palette}
                style={{ background: palette.white2, color: palette.black1, borderColor: palette.silver1 }}
              >
                Lihat Jadwal <ChevronRight className="ml-1" size={16} />
              </Btn>
            </Link>
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
