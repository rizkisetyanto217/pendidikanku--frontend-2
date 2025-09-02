// src/pages/sekolahislamku/schedule/ParentSchedulePage.tsx
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, GraduationCap } from "lucide-react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "../../components/home/ParentTopBar";
import ParentSidebar from "../../components/home/ParentSideBar";

/* ================= Types ================= */
type ClassItem = {
  class_id: string;
  class_masjid_id: string;
  class_name: string;
  class_slug: string;
  class_description: string;
  class_level: string;
  class_image_url?: string;
  class_fee_monthly_idr: number;
  class_is_active: boolean;
  class_created_at: string;
};

type ClassesResponse = {
  message: string;
  data: ClassItem[];
};

type ScheduleItem = {
  id: string;
  time: string;
  title: string;
  room?: string;
  teacher?: string;
  type?: "class" | "exam" | "event";
  note?: string;
  description?: string;
  class_id?: string;
  class_info?: ClassItem;
};

type DaySchedule = {
  date: string;
  items: ScheduleItem[];
};

type WeekSchedule = {
  selected: DaySchedule;
  nextDays: DaySchedule[];
};

/* =============== Helpers =============== */
const idDate = (d: Date) =>
  d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const toISODate = (d: Date) => d.toISOString().slice(0, 10);

const parseMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

// 👉 aman timezone: pakai “siang lokal” utk display/hijriah
const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};
const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();
const hijriWithWeekday = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/* =============== API Functions =============== */
async function fetchClasses(): Promise<ClassesResponse> {
  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  if (!token) {
    throw new Error("Unauthorized - Token tidak ditemukan. Silakan login.");
  }

  const response = await fetch(
    "https://masjidkubackend4-production.up.railway.app/api/a/classes",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Unauthorized - Silakan login kembali.");
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

async function fetchSchedule(
  selectedISO: string,
  classes: ClassItem[] = []
): Promise<WeekSchedule> {
  const classMap = new Map(classes.map((c) => [c.class_id, c]));

  // filter kelas aktif (sementara pakai created_at ≤ selectedISO)
  const filtered = classes.filter((cls) => {
    const created = new Date(cls.class_created_at).toISOString().slice(0, 10);
    return created <= selectedISO;
  });

  const items: ScheduleItem[] = filtered.map((cls) => ({
    id: cls.class_id,
    time: "07:30",
    title: cls.class_name,
    room: "Kelas offline",
    teacher: "-",
    type: "class",
    description: cls.class_description,
    class_id: cls.class_id,
    class_info: classMap.get(cls.class_id),
  }));

  const make = (date: Date, items: ScheduleItem[]): DaySchedule => ({
    date: date.toISOString(),
    items: items.sort((a, b) => parseMinutes(a.time) - parseMinutes(b.time)),
  });

  const selected = new Date(selectedISO);

  return {
    selected: make(selected, items),
    nextDays: [],
  };
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

function ClassLevelBadge({
  level,
  palette,
}: {
  level?: string;
  palette: Palette;
}) {
  if (!level) return null;
  return (
    <Badge
      variant={
        level === "Dasar"
          ? "success"
          : level === "Menengah"
          ? "warning"
          : "info"
      }
      palette={palette}
      className="h-6"
    >
      {level}
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
        <div className="p-4 md:p-5 space-y-3">
          <div className="text-sm">
            <span className="font-medium">Tempat:</span> {item.room ?? "-"}
          </div>
          <div className="text-sm">
            <span className="font-medium">Pengajar:</span> {item.teacher ?? "-"}
          </div>
          {item.class_info && (
            <>
              <div
                className="pt-2 mt-2 border-t"
                style={{ borderColor: palette.silver1 }}
              />
              <div className="text-xs" style={{ color: palette.silver2 }}>
                Informasi Kelas
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} color={palette.quaternary} />
                  <span className="text-sm font-medium">
                    {item.class_info.class_name}
                  </span>
                  <ClassLevelBadge
                    level={item.class_info.class_level}
                    palette={palette}
                  />
                </div>
                <div className="text-sm">
                  {item.class_info.class_description}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Biaya:</span>{" "}
                  {formatCurrency(item.class_info.class_fee_monthly_idr)}/bulan
                </div>
              </div>
            </>
          )}
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
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const [dateStr, setDateStr] = useState<string>(() => toISODate(new Date()));
  const [active, setActive] = useState<ActiveEntry>(null);

  const {
    data: classesData,
    isLoading: isLoadingClasses,
    error: classesError,
  } = useQuery({
    queryKey: ["classes"],
    queryFn: fetchClasses,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const {
    data: scheduleData,
    isLoading: isLoadingSchedule,
    isFetching,
  } = useQuery({
    queryKey: ["parent-schedule", dateStr, classesData?.data],
    queryFn: () => fetchSchedule(dateStr, classesData?.data || []),
    staleTime: 60_000,
    enabled: !!classesData,
  });

  const selectedPretty = useMemo(
    () => (scheduleData ? idDate(new Date(scheduleData.selected.date)) : "—"),
    [scheduleData]
  );

  const onToday = () => setDateStr(toISODate(new Date()));
  const isLoading = isLoadingClasses || isLoadingSchedule;

  // ISO aman untuk TopBar + hijriah (siang lokal)
  const qISO = toLocalNoonISO(new Date());

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Jadwal"
        gregorianDate={qISO}
        hijriDate={hijriWithWeekday(qISO)} 
      />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />
          <div className="flex-1 space-y-6">
            {classesError && (
              <SectionCard palette={palette}>
                <div className="p-4 text-center">
                  <div className="text-red-500 text-sm font-medium">
                    {classesError instanceof Error
                      ? classesError.message
                      : "Gagal memuat data kelas"}
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Filter */}
            <SectionCard palette={palette} className="p-3">
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
                {classesData && (
                  <div
                    className="ml-auto text-xs"
                    style={{ color: palette.silver2 }}
                  >
                    {classesData.data.length} kelas tersedia
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Jadwal */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2">
                <h3 className="text-base font-semibold flex items-center gap-2">
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
              <div className="p-4 space-y-3">
                {scheduleData?.selected.items?.length === 0 && (
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
                {scheduleData?.selected.items?.map((s) => (
                  <SectionCard
                    key={s.id}
                    palette={palette}
                    className="p-0"
                    style={{ background: palette.white2 }}
                  >
                    <button
                      onClick={() =>
                        setActive({
                          dateISO: scheduleData!.selected.date,
                          item: s,
                        })
                      }
                      className="w-full p-3 flex items-center justify-between text-left rounded-2xl"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-sm font-medium truncate">
                            {s.title}
                          </div>
                          {s.class_info && (
                            <ClassLevelBadge
                              level={s.class_info.class_level}
                              palette={palette}
                            />
                          )}
                        </div>
                        <div
                          className="text-xs truncate"
                          style={{ color: palette.silver2 }}
                        >
                          {s.class_info?.class_description ?? "-"}
                        </div>
                        <div
                          className="text-xs truncate"
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
                    </button>
                  </SectionCard>
                ))}
              </div>
            </SectionCard>

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
