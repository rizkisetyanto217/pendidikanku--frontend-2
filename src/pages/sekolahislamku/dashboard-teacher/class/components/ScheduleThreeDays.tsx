// src/pages/sekolahislamku/teacher/ScheduleThreeDays.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import TeacherTopBar from "@/pages/sekolahislamku/components/home/TeacherTopBar";
import TeacherSidebarNav from "@/pages/sekolahislamku/components/home/TeacherSideBarNav";
import { CalendarDays } from "lucide-react";
import { fetchTeacherHome } from "../../class/teacher"; // sesuaikan path API-mu

type Item = { time: string; title: string; room?: string; dateISO?: string };

const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const fmtShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    : "-";

export default function ScheduleThreeDays() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = (isDark ? colors.dark : colors.light) as Palette;

  const location = useLocation();
  const preload = (location.state as any)?.items as Item[] | undefined;

  const { data } = useQuery({
    queryKey: ["teacher-home"],
    queryFn: fetchTeacherHome,
    staleTime: 60_000,
  });

  const baseItems = useMemo<Item[]>(() => {
    if (Array.isArray(preload) && preload.length) {
      return preload;
    }
    // fallback: ambil dari upcomingClasses 3 hari ke depan (hari ini s/d +2)
    const upcoming = (data as any)?.upcomingClasses ?? [];
    const start = startOfDay(new Date());
    const end = startOfDay(addDays(new Date(), 2));

    const within3 = Array.isArray(upcoming)
      ? upcoming.filter((c: any) => {
          if (!c?.dateISO) return false;
          const d = startOfDay(new Date(c.dateISO));
          return d >= start && d <= end;
        })
      : [];

    const src = within3.length ? within3 : (data?.todayClasses ?? []);
    return src
      .slice()
      .sort((a: any, b: any) => {
        const ad =
          new Date(a.dateISO ?? start).getTime() -
          new Date(b.dateISO ?? start).getTime();
        if (ad !== 0) return ad;
        return a.time.localeCompare(b.time);
      })
      .map((c: any) => ({
        time: c.time,
        title: `${c.className} — ${c.subject}`,
        dateISO: c.dateISO,
        room: c.dateISO ? `${fmtShort(c.dateISO)} • ${c.room ?? "-"}` : c.room,
      }));
  }, [preload, data?.todayClasses, (data as any)?.upcomingClasses]);

  const [items, setItems] = useState<Item[]>(baseItems);
  useEffect(() => setItems(baseItems), [baseItems]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <TeacherTopBar palette={palette} title="Jadwal 3 Hari Kedepan" />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <aside className="lg:w-64 mb-6 lg:mb-0 lg:sticky lg:top-16 shrink-0">
            <TeacherSidebarNav palette={palette} />
          </aside>

          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <CalendarDays size={20} color={palette.primary} />
                <span>Semua Jadwal 3 Hari Kedepan</span>
              </div>
              <Link to="../jadwal">
                <Btn palette={palette} size="sm" variant="ghost">
                  Kembali
                </Btn>
              </Link>
            </div>

            <SectionCard palette={palette}>
              <div
                className="divide-y"
                style={{ borderColor: palette.silver1 }}
              >
                {items.length === 0 ? (
                  <div
                    className="p-5 text-sm text-center"
                    style={{ color: palette.silver2 }}
                  >
                    Belum ada jadwal untuk 3 hari ke depan.
                  </div>
                ) : (
                  items.map((s, idx) => (
                    <div
                      key={`${s.time}-${s.title}-${idx}`}
                      className="p-4 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{s.title}</div>
                        <div
                          className="text-sm mt-1"
                          style={{ color: palette.silver2 }}
                        >
                          {s.time} {s.room && `• ${s.room}`}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Btn palette={palette} size="sm" variant="white1">
                          Detail
                        </Btn>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
