// src/pages/sekolahislamku/dashboard-teacher/class/components/AllTodaySchedule.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import { CalendarDays, Plus } from "lucide-react";
import TeacherTopBar from "@/pages/sekolahislamku/components/home/TeacherTopBar";
import TeacherSidebarNav from "@/pages/sekolahislamku/components/home/TeacherSideBarNav";
import {
  fetchTeacherHome,
  type TodayClass,
} from "../../class/teacher";
import TambahJadwal from "../../components/dashboard/TambahJadwal";

type ScheduleItem = { id?: string; time: string; title: string; room?: string };

export default function AllTodaySchedule() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = (isDark ? colors.dark : colors.light) as Palette;

  const qc = useQueryClient();

  // Ambil data yang sama dengan dashboard (shared cache)
  const { data } = useQuery({
    queryKey: ["teacher-home"],
    queryFn: fetchTeacherHome,
    staleTime: 60_000,
  });

  // Jadikan data API → bentuk kartu
  const baseItems: ScheduleItem[] = useMemo(() => {
    const today = data?.todayClasses ?? [];
    return today.map((c) => ({
      id: c.id,
      time: c.time,
      title: `${c.className} — ${c.subject}`,
      room: c.room,
    }));
  }, [data?.todayClasses]);

  // State lokal agar bisa nambah item tanpa reload
  const [items, setItems] = useState<ScheduleItem[]>(baseItems);
  useEffect(() => setItems(baseItems), [baseItems]);

  // Modal tambah
  const [showTambahJadwal, setShowTambahJadwal] = useState(false);

  // Ketika submit modal
  const handleAddSchedule = (item: {
    time: string;
    title: string;
    room?: string;
  }) => {
    // Update list lokal (urut berdasarkan waktu)
    setItems((prev) =>
      [...prev, item].sort((a, b) => a.time.localeCompare(b.time))
    );

    // (Opsional tapi bagus) Update cache "teacher-home" agar halaman lain ikut sinkron
    qc.setQueryData(["teacher-home"], (prev: any) => {
      if (!prev) return prev;
      // Pecah "TPA A — Tahsin" → className & subject
      const [classNameRaw = "", subjectRaw = ""] = item.title.split(" — ");
      const newTc: TodayClass = {
        id: `temp-${Date.now()}`,
        time: item.time,
        className: classNameRaw || "Kelas",
        subject: subjectRaw || "Pelajaran",
        room: item.room,
        status: "upcoming",
        studentCount: undefined,
      };
      const next = {
        ...prev,
        todayClasses: [...(prev.todayClasses ?? []), newTc].sort(
          (a: TodayClass, b: TodayClass) => a.time.localeCompare(b.time)
        ),
      };
      return next;
    });

    setShowTambahJadwal(false);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Jika halaman ini sudah dibungkus StudentLayout, TopBar/Sidebar bisa dihapus */}
      <TeacherTopBar palette={palette} title="Semua Jadwal Hari Ini" />

      {/* Modal: Tambah Jadwal */}
      <TambahJadwal
        open={showTambahJadwal}
        onClose={() => setShowTambahJadwal(false)}
        palette={palette}
        onSubmit={handleAddSchedule}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <aside className="lg:w-64 mb-6 lg:mb-0 lg:sticky lg:top-16 shrink-0">
            <TeacherSidebarNav palette={palette} />
          </aside>

          <div className="flex-1 min-w-0 space-y-4">
            {/* Header actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <CalendarDays size={20} color={palette.primary} />
                <span>Jadwal Hari Ini</span>
              </div>
              <div className="flex gap-2">
                <Link to="../jadwal">
                  <Btn palette={palette} size="sm" variant="ghost">
                    Kembali ke Jadwal
                  </Btn>
                </Link>
                {/* Ubah: buka modal, bukan navigate */}
                <Btn
                  palette={palette}
                  size="sm"
                  onClick={() => setShowTambahJadwal(true)}
                >
                  <Plus size={16} className="mr-1" /> Tambah Jadwal
                </Btn>
              </div>
            </div>

            {/* List */}
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
                    Belum ada jadwal untuk hari ini.
                  </div>
                ) : (
                  items.map((s) => (
                    <div
                      key={s.id ?? `${s.time}-${s.title}`}
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
