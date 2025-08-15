// src/pages/sekolahislamku/schedule/ParentSchedulePage.tsx
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentSidebarNav from "../../components/home/StudentSideBarNav";
import ParentTopBar from "../../components/home/StudentTopBar";
// redux
import { fetchClasses } from "../../../../reducer/classes";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { calculateProvidedBy } from '../../../../../node_modules/@reduxjs/toolkit/src/query/endpointDefinitions';





/* ================= Types ================= */
type ScheduleItem = {
  id: string;
  time: string; // "07:30"
  title: string; // "Tahsin Kelas"
  room?: string; // "Aula 1"
  teacher?: string; // "Ust. Ali"
  type?: "class" | "exam" | "event";
  note?: string;
  description?: string;
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
  const baseToday: ScheduleItem[] = [
    {
      id: "1",
      time: "07:30",
      title: "Tahsin Kelas",
      room: "Aula 1",
      teacher: "Ust. Rahmat",
      type: "class",
      description:
        "Fokus pada makhraj huruf dan panjang pendek bacaan. Sesi baca bergilir 5 menit per siswa.",
    },
    {
      id: "2",
      time: "09:30",
      title: "Hafalan Juz 30",
      room: "R. Tahfiz",
      teacher: "Ust.ah Siti",
      type: "class",
      description:
        "Setoran An-Naba 1–10. Persiapan ujian pekan depan, mohon siswa membawa mushaf masing-masing.",
    },
  ];

  const selected = new Date(selectedISO);
  const add = (n: number) => {
    const d = new Date(selected);
    d.setDate(d.getDate() + n);
    return d;
  };

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
        description: "Pembukaan hari dengan doa bersama dan tilawah juz amma.",
      },
      {
        id: "4",
        time: "08:00",
        title: "Tahfiz Setoran",
        room: "R. Tahfiz",
        teacher: "Ust.ah Siti",
        type: "class",
        description: "Setoran hafalan harian. Target 5 ayat per siswa.",
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
        description: "Materi wudhu dan tayamum, sesi tanya jawab di akhir.",
      },
      {
        id: "6",
        time: "10:00",
        title: "Evaluasi Tajwid",
        room: "Aula 1",
        teacher: "Ust. Rahmat",
        type: "exam",
        description: "Ujian lisan: makhraj dan sifat huruf. Persiapkan mushaf.",
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
        description: "Adab duduk, mendengar, dan bertanya di majelis ilmu.",
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

/* ===== Modal Detail Jadwal ===== */
type ActiveEntry = { dateISO: string; item: ScheduleItem } | null;

function ScheduleDetailModal({
  open,
  onClose,
  entry,
  palette,
}: {
  open: boolean;
  onClose: () => void;
  entry: ActiveEntry;
  palette: Palette;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !entry) return null;
  const { item, dateISO } = entry;
  const prettyDate = idDate(new Date(dateISO));

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.35)" }}
    >
      <div
        className="mx-auto mt-16 w-[92%] max-w-lg rounded-2xl shadow-lg"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: palette.white1,
          color: palette.black1,
          border: `1px solid ${palette.silver1}`,
        }}
      >
        <div
          className="p-4 md:p-5 border-b"
          style={{ borderColor: palette.silver1 }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-base font-semibold truncate">
                {item.title}
              </div>
              <div
                className="mt-1 flex flex-wrap items-center gap-2 text-xs"
                style={{ color: palette.silver2 }}
              >
                <span>{prettyDate}</span>
                <span>• {item.time}</span>
                {item.type && (
                  <>
                    <span>•</span>
                    <TypeBadge t={item.type} palette={palette} />
                  </>
                )}
              </div>
            </div>
            <Btn
              variant="outline"
              size="sm"
              palette={palette}
              onClick={onClose}
            >
              Tutup
            </Btn>
          </div>
        </div>

        <div className="p-4 md:p-5 space-y-2">
          <div className="text-sm">
            <span className="font-medium">Tempat:</span>{" "}
            <span style={{ color: palette.black2 }}>{item.room ?? "-"}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Pengajar:</span>{" "}
            <span style={{ color: palette.black2 }}>{item.teacher ?? "-"}</span>
          </div>
          {item.note && (
            <div className="text-sm">
              <span className="font-medium">Catatan:</span>{" "}
              <span style={{ color: palette.black2 }}>{item.note}</span>
            </div>
          )}

          {/* ---- NEW: Deskripsi panjang ---- */}
          <div
            className="pt-3 mt-1 border-t"
            style={{ borderColor: palette.silver1 }}
          />
          <div className="text-xs" style={{ color: palette.silver2 }}>
            Deskripsi
          </div>
          <div
            className="text-sm whitespace-pre-wrap"
            style={{ color: palette.black2 }}
          >
            {item.description && item.description.trim().length > 0
              ? item.description
              : "-"}
          </div>
          {/* ---- END NEW ---- */}
        </div>

        <div className="p-4 md:p-5 pt-0 flex items-center justify-end gap-2">
          <Btn palette={palette} variant="white1" size="sm" onClick={onClose}>
            Mengerti
          </Btn>
          <Btn palette={palette} variant="default" size="sm" onClick={onClose}>
            OK
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* =============== Page =============== */
export default function StudentSchedule() {
    const dispatch = useDispatch();
const {data: classes} = useSelector((state  : RootState) => state.classes);
console.log(classes);




  const { isDark } = useHtmlDarkMode();
  const palette = (isDark ? colors.dark : colors.light) as Palette;

  const [dateStr, setDateStr] = useState<string>(() => toISODate(new Date()));
  const [active, setActive] = useState<ActiveEntry>(null);

  const { data, isLoading, isFetching } = useQuery({
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
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top Bar */}
      <ParentTopBar
        palette={palette}
        gregorianDate={new Date().toISOString()}
        title="Jadwal"
      />

      {/* Content + Sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          {/* Sidebar kiri (sticky di desktop) */}
          <ParentSidebarNav palette={palette} />

          {/* Konten utama */}
          <div className="flex-1 space-y-6">
            {/* Filter (desktop) */}
            <SectionCard palette={palette} className="p-3 hidden md:block">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} color={palette.quaternary} />
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="h-9 w-48 rounded-xl px-3 text-sm"
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
                  <div
                    className="mt-2 text-sm"
                    style={{ color: palette.silver2 }}
                  >
                    Memuat…
                  </div>
                )}
              </div>

              <div className="p-4 md:p-0 md:px-5 md:pb-5 pt-2 space-y-3">
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
                    className="p-0"
                    style={{ background: palette.white2 }}
                  >
                    <button
                      onClick={() =>
                        setActive({ dateISO: data!.selected.date, item: s })
                      }
                      className="w-full p-3 flex items-center justify-between text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2"
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
                    </button>
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
                <div className="p-4 md:p-0 md:px-5 pt-2 grid gap-3">
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
                          <button
                            key={s.id}
                            onClick={() =>
                              setActive({ dateISO: d.date, item: s })
                            }
                            className="flex items-center justify-between rounded-xl border px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2"
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
                                {s.room ?? "-"}{" "}
                                {s.teacher ? `• ${s.teacher}` : ""}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <TypeBadge t={s.type} palette={palette} />
                              <Badge variant="outline" palette={palette}>
                                {s.time}
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Modal */}
            <ScheduleDetailModal
              open={!!active}
              onClose={() => setActive(null)}
              entry={active}
              palette={palette}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
