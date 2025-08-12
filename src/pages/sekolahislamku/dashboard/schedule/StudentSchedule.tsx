// src/pages/sekolahislamku/schedule/ParentSchedulePage.tsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ArrowLeft } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

/* ================= Types ================= */
type ScheduleItem = {
  id: string;
  time: string; // "07:30"
  title: string; // "Tahsin Kelas"
  room?: string; // "Aula 1"
  teacher?: string; // "Ust. Ali"
  type?: "class" | "exam" | "event";
  note?: string;
};

type DaySchedule = {
  date: string; // ISO
  items: ScheduleItem[];
};

type WeekSchedule = {
  selected: DaySchedule;
  nextDays: DaySchedule[]; // 3-5 hari ke depan
};

/* =============== Helpers =============== */
const idDate = (d: Date) =>
  d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const toISODate = (d: Date) => d.toISOString().slice(0, 10); // yyyy-mm-dd

const parseMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/* =============== Fake API =============== */
async function fetchSchedule(selectedISO: string): Promise<WeekSchedule> {
  // Seed jadwal harian konsisten dengan widget Home
  const baseToday: ScheduleItem[] = [
    {
      id: "1",
      time: "07:30",
      title: "Tahsin Kelas",
      room: "Aula 1",
      teacher: "Ust. Rahmat",
      type: "class",
    },
    {
      id: "2",
      time: "09:30",
      title: "Hafalan Juz 30",
      room: "R. Tahfiz",
      teacher: "Ust.ah Siti",
      type: "class",
    },
  ];

  const selected = new Date(selectedISO);
  const add = (n: number) => {
    const d = new Date(selected);
    d.setDate(d.getDate() + n);
    return d;
  };

  // Contoh variasi untuk hari-hari berikutnya
  const make = (date: Date, items: ScheduleItem[]): DaySchedule => ({
    date: date.toISOString(),
    items: items.sort((a, b) => parseMinutes(a.time) - parseMinutes(b.time)),
  });

  const selectedDay = make(selected, baseToday);

  const nextDays: DaySchedule[] = [
    make(add(1), [
      {
        id: "3",
        time: "07:15",
        title: "Doa & Tilawah Pagi",
        room: "Masjid",
        teacher: "Semua Guru",
        type: "event",
      },
      {
        id: "4",
        time: "08:00",
        title: "Tahfiz Setoran",
        room: "R. Tahfiz",
        teacher: "Ust.ah Siti",
        type: "class",
      },
    ]),
    make(add(2), [
      {
        id: "5",
        time: "07:30",
        title: "Fiqih Ibadah",
        room: "Aula 2",
        teacher: "Ust. Ali",
        type: "class",
      },
      {
        id: "6",
        time: "10:00",
        title: "Evaluasi Tajwid",
        room: "Aula 1",
        teacher: "Ust. Rahmat",
        type: "exam",
      },
    ]),
    make(add(3), [
      {
        id: "7",
        time: "07:20",
        title: "Adab Majelis",
        room: "Aula 1",
        teacher: "Ust. Farid",
        type: "class",
      },
    ]),
  ];

  return Promise.resolve({ selected: selectedDay, nextDays });
}

/* =============== Small bits =============== */
function TypeBadge({
  t,
  palette,
}: {
  t?: ScheduleItem["type"];
  palette: Palette;
}) {
  if (t === "exam")
    return (
      <Badge variant="warning" palette={palette} className="h-6">
        Ujian
      </Badge>
    );
  if (t === "event")
    return (
      <Badge variant="info" palette={palette} className="h-6">
        Kegiatan
      </Badge>
    );
  return (
    <Badge variant="secondary" palette={palette} className="h-6">
      Kelas
    </Badge>
  );
}

/* =============== Page =============== */
export default function StudentSchedule() {
  const { isDark } = useHtmlDarkMode();
  const palette = (isDark ? colors.dark : colors.light) as Palette;

  const [dateStr, setDateStr] = useState<string>(() => toISODate(new Date()));

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["parent-schedule", dateStr],
    queryFn: () => fetchSchedule(dateStr),
    staleTime: 60_000,
  });

  const selectedPretty = useMemo(
    () => (data ? idDate(new Date(data.selected.date)) : "—"),
    [data]
  );

  const onToday = () => {
    const today = toISODate(new Date());
    setDateStr(today);
    // react-query auto refetch by key change; panggil refetch opsional
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top bar */}
      <div
        className="sticky top-0 z-40 border-b"
        style={{
          background: `${palette.white1}E6`,
          borderColor: palette.silver1,
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link to="/student">
              <Btn size="sm" variant="outline" palette={palette}>
                <ArrowLeft size={16} /> Kembali
              </Btn>
            </Link>
            <div className="pl-1">
              <div className="text-sm" style={{ color: palette.silver2 }}>
                Jadwal
              </div>
              <div className="font-semibold">{selectedPretty}</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <CalendarDays size={16} />
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="h-9 rounded-xl px-3 text-sm"
              style={{
                background: palette.white1,
                color: palette.black1,
                border: `1px solid ${palette.silver1}`,
              }}
            />
            <Btn
              size="sm"
              variant="secondary"
              palette={palette}
              onClick={onToday}
            >
              Hari ini
            </Btn>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Filter (mobile) */}
        <SectionCard palette={palette} className="p-3 md:hidden">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} color={palette.quaternary} />
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="h-9 flex-1 rounded-xl px-3 text-sm"
              style={{
                background: palette.white1,
                color: palette.black1,
                border: `1px solid ${palette.silver1}`,
              }}
            />
            <Btn
              size="sm"
              variant="secondary"
              palette={palette}
              onClick={onToday}
            >
              Hari ini
            </Btn>
          </div>
        </SectionCard>

        {/* Jadwal hari terpilih */}
        <SectionCard palette={palette}>
          <div className="p-4 md:p-5 pb-2">
            <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
              <CalendarDays size={20} color={palette.quaternary} /> Jadwal{" "}
              {selectedPretty}
            </h3>
            {(isLoading || isFetching) && (
              <div className="mt-2 text-sm" style={{ color: palette.silver2 }}>
                Memuat…
              </div>
            )}
          </div>

          <div className="p-4 md:p-5 pt-2 space-y-3">
            {data && data.selected.items.length === 0 && (
              <div
                className="rounded-xl border p-4 text-sm"
                style={{
                  borderColor: palette.silver1,
                  background: palette.white2,
                  color: palette.silver2,
                }}
              >
                Tidak ada jadwal pada tanggal ini.
              </div>
            )}

            {(data?.selected.items ?? []).map((s) => (
              <SectionCard
                key={s.id}
                palette={palette}
                className="p-3 flex items-center justify-between"
                style={{ background: palette.white2 }}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{s.title}</div>
                  <div
                    className="text-xs mt-0.5 truncate"
                    style={{ color: palette.silver2 }}
                  >
                    {s.room ?? "-"} {s.teacher ? `• ${s.teacher}` : ""}
                  </div>
                  {s.note && (
                    <div
                      className="text-xs mt-1"
                      style={{ color: palette.black2 }}
                    >
                      {s.note}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <TypeBadge t={s.type} palette={palette} />
                  <Badge variant="outline" palette={palette}>
                    {s.time}
                  </Badge>
                </div>
              </SectionCard>
            ))}
          </div>
        </SectionCard>

        {/* Sekilas minggu ini */}
        {data && data.nextDays.length > 0 && (
          <SectionCard palette={palette}>
            <div className="p-4 md:p-5 pb-2">
              <h3 className="text-base font-semibold tracking-tight">
                Minggu Ini
              </h3>
            </div>
            <div className="p-4 md:p-5 pt-2 grid gap-3">
              {data.nextDays.map((d) => (
                <div
                  key={d.date}
                  className="rounded-2xl border"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white2,
                  }}
                >
                  <div
                    className="px-3 py-2 text-sm font-medium"
                    style={{ borderBottom: `1px solid ${palette.silver1}` }}
                  >
                    {idDate(new Date(d.date))}
                  </div>
                  <div className="p-3 grid gap-2">
                    {d.items.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-xl border px-3 py-2"
                        style={{
                          borderColor: palette.silver1,
                          background: palette.white1,
                        }}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {s.title}
                          </div>
                          <div
                            className="text-xs mt-0.5 truncate"
                            style={{ color: palette.silver2 }}
                          >
                            {s.room ?? "-"} {s.teacher ? `• ${s.teacher}` : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <TypeBadge t={s.type} palette={palette} />
                          <Badge variant="outline" palette={palette}>
                            {s.time}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </main>
    </div>
  );
}
