// src/pages/sekolahislamku/jadwal/AllSchedule.tsx
import { useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { Clock, MapPin } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";
import SchoolSidebarNav from "@/pages/sekolahislamku/components/home/SchoolSideBarNav";
import {
  mockTodaySchedule,
  type TodayScheduleItem,
} from "../../types/TodaySchedule";

/** Bentuk state yang dilempar dari TodayScheduleCard melalui <Link state={...}> */
type LocationState = {
  items?: TodayScheduleItem[];
  heading?: string;
};

const isTime = (t?: string) => !!t && /^\d{2}:\d{2}$/.test(t);

export default function AllSchedule() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = (isDark ? colors.dark : colors.light) as Palette;

  const { state } = useLocation();
  const { items: incoming, heading } = (state ?? {}) as LocationState;

  // fallback ke mock jika tidak ada state
  const source: TodayScheduleItem[] = useMemo(() => {
    const base =
      Array.isArray(incoming) && incoming.length > 0
        ? incoming
        : mockTodaySchedule;

    return base.slice().sort((a, b) => {
      const ta = isTime(a.time) ? a.time : "99:99";
      const tb = isTime(b.time) ? b.time : "99:99";
      return ta.localeCompare(tb);
    });
  }, [incoming]);

  const [search, setSearch] = useState("");
  const [locFilter, setLocFilter] = useState<string | "semua">("semua");

  const lokasiOptions = useMemo(() => {
    const set = new Set(
      source.map((x) => (x.room ?? "").trim()).filter(Boolean)
    );
    return ["semua", ...Array.from(set)];
  }, [source]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return source.filter((j) => {
      const matchSearch =
        j.title.toLowerCase().includes(s) ||
        (j.room ?? "").toLowerCase().includes(s) ||
        (j.time ?? "").toLowerCase().includes(s);
      const matchLoc = locFilter === "semua" || (j.room ?? "") === locFilter;
      return matchSearch && matchLoc;
    });
  }, [source, search, locFilter]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        gregorianDate={new Date().toISOString()}
        title={heading || "Jadwal Hari Ini"}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <SchoolSidebarNav palette={palette} />

          <div className="flex-1 space-y-6">
            {/* Search & Filter */}
            <SectionCard palette={palette} className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Cari judul, waktu, atau lokasi…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 w-full rounded-2xl px-3 text-sm"
                    style={{
                      background: palette.white1,
                      color: palette.black1,
                      border: `1px solid ${palette.silver1}`,
                    }}
                  />
                </div>

                {lokasiOptions.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Badge palette={palette} variant="outline">
                      Lokasi
                    </Badge>
                    <select
                      value={locFilter}
                      onChange={(e) => setLocFilter(e.target.value as any)}
                      className="h-10 rounded-xl px-3 text-sm outline-none"
                      style={{
                        background: palette.white1,
                        color: palette.black1,
                        border: `1px solid ${palette.silver1}`,
                      }}
                    >
                      {lokasiOptions.map((o) => (
                        <option key={o} value={o}>
                          {o === "semua" ? "Semua" : o}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Jadwal List */}
            <div className="grid gap-3">
              {filtered.length === 0 ? (
                <SectionCard palette={palette} className="p-6 text-center">
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Tidak ada jadwal hari ini.
                  </div>
                </SectionCard>
              ) : (
                filtered.map((j, idx) => (
                  <SectionCard
                    key={`${j.title}-${j.time}-${idx}`}
                    palette={palette}
                    className="p-3 md:p-4"
                    style={{ background: palette.white1 }}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <h2 className="font-semibold">{j.title}</h2>
                        <Badge variant="white1" palette={palette}>
                          {j.time}
                        </Badge>
                      </div>

                      <div
                        className="flex flex-wrap gap-3 text-sm"
                        style={{ color: palette.black2 }}
                      >
                        {j.room && (
                          <span className="flex items-center gap-1">
                            <MapPin size={16} /> {j.room}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={16} />{" "}
                          {isTime(j.time) ? "Terjadwal" : j.time}
                        </span>
                      </div>
                    </div>
                  </SectionCard>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
