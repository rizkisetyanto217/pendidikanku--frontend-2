// src/pages/sekolahislamku/TeacherDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { Users } from "lucide-react";
import { useMatch, useParams } from "react-router-dom";

import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import TeacherSidebarNav from "../components/home/TeacherSideBarNav";
import TeacherTopBar from "../components/home/TeacherTopBar";

import TodayScheduleCard from "@/pages/sekolahislamku/components/card/TodayScheduleCard";
import AnnouncementsList from "@/pages/sekolahislamku/components/card/AnnouncementsListCard";
import ListJadwal from "./schedule/modal/ListJadwal";
import TambahJadwal from "./components/dashboard/TambahJadwal";
import TeacherAddEditAnnouncement, {
  type TeacherAnnouncementForm,
} from "./announcement/TeacherAddEditAnnouncement";

// 🔁 API bersama
import {
  fetchTeacherHome,
  TEACHER_HOME_QK,
  type Announcement,
} from "../../../pages/sekolahislamku/dashboard-teacher/class/teacher";

/* ================= Helpers ================ */
const fmtLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const fmtShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    : "-";

/* ================= Types (UI lokal) ================ */
type ScheduleItem = {
  time: string;
  title: string;
  room?: string;
  slug?: string;
};

/* ================= Page ================= */
export default function TeacherDashboard() {
  // URL awareness (optional, untuk compose path jika diperlukan)
  const params = useParams<{ slug?: string }>();
  const match = useMatch("/:slug/*");
  const slug = params.slug ?? match?.params.slug ?? "";
  const withSlug = (p: string) => (slug ? `/${slug}/${p}` : `/${p}`);

  // Thema
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  // Query data utama (API bersama)
  const { data, isLoading } = useQuery({
    queryKey: TEACHER_HOME_QK,
    queryFn: fetchTeacherHome,
    staleTime: 60_000,
  });

  /* -------- Jadwal Hari Ini (map dari API) -------- */
  const scheduleItems = useMemo<ScheduleItem[]>(
    () =>
      (data?.todayClasses ?? []).map((c) => ({
        time: c.time,
        title: `${c.className} — ${c.subject}`,
        room: c.room,
      })),
    [data?.todayClasses]
  );

  /* -------- Daftar Jadwal (list terpisah) --------
     Tetap mock lokal agar berbeda dari "hari ini".
     Nanti bisa diganti ke endpoint list jadwal. */
  const [listScheduleItems, setListScheduleItems] = useState<ScheduleItem[]>(
    []
  );
  useEffect(() => {
    const daftar: ScheduleItem[] = [
      { time: "10:30", title: "TPA C — Fiqih Ibadah", room: "R. 2" },
      { time: "13:00", title: "TPA D — Tahfiz Juz 29", room: "Aula 2" },
      { time: "15:30", title: "TPA A — Mentoring Guru", room: "R. Meeting" },
    ];
    // Jangan duplikasi dengan jadwal hari ini
    const todayKeys = new Set(scheduleItems.map((t) => `${t.time}|${t.title}`));
    setListScheduleItems(
      daftar.filter((d) => !todayKeys.has(`${d.time}|${d.title}`))
    );
  }, [scheduleItems]);

  /* -------- Pengumuman (seed dari API, lalu local mutate) -------- */
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [announceInitial, setAnnounceInitial] =
    useState<TeacherAnnouncementForm | null>(null);
  const [announceSaving, setAnnounceSaving] = useState(false);
  const [announceError, setAnnounceError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setAnnouncements(data?.announcements ?? []);
  }, [data?.announcements]);

  const handleSubmitAnnouncement = async (form: TeacherAnnouncementForm) => {
    try {
      setAnnounceSaving(true);
      setAnnounceError(null);

      if (form.id) {
        // EDIT (sementara local)
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === form.id
              ? { ...a, title: form.title, date: form.date, body: form.body }
              : a
          )
        );
        // TODO: await axios.put(`/api/u/announcements/${form.id}`, payload)
      } else {
        // ADD (sementara local)
        const id = `temp-${Date.now()}`;
        setAnnouncements((prev) => [
          {
            id,
            title: form.title,
            date: form.date,
            body: form.body,
            type: "info",
          },
          ...prev,
        ]);
        // TODO: await axios.post(`/api/u/announcements`, payload)
      }

      setAnnounceOpen(false);
      setAnnounceInitial(null);
    } catch (e: any) {
      setAnnounceError(
        e?.response?.data?.message ?? "Gagal menyimpan pengumuman."
      );
    } finally {
      setAnnounceSaving(false);
    }
  };

  const handleDeleteAnnouncement = async (a: Announcement) => {
    const res = await Swal.fire({
      title: "Hapus pengumuman?",
      text: `“${a.title}” akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
      confirmButtonColor: palette.error1,
      cancelButtonColor: palette.silver2,
      focusCancel: true,
    });
    if (!res.isConfirmed) return;

    try {
      setDeletingId(a.id);

      Swal.fire({
        title: "Menghapus…",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        showConfirmButton: false,
        background: palette.white1,
      });

      // TODO: await axios.delete(`/api/u/announcements/${a.id}`)
      setAnnouncements((prev) => prev.filter((x) => x.id !== a.id));

      await Swal.fire({
        title: "Terhapus",
        text: "Pengumuman berhasil dihapus.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
        background: palette.white1,
      });
    } finally {
      setDeletingId(null);
    }
  };

  /* -------- Modal: Tambah Jadwal -------- */
  const [showTambahJadwal, setShowTambahJadwal] = useState(false);

  /* -------- Kelas yang dikelola (diambil dari todayClasses) -------- */
  type ManagedClass = {
    id: string;
    name: string;
    students?: number;
    lastSubject?: string;
  };
  const managedClasses = useMemo<ManagedClass[]>(() => {
    const map = new Map<string, ManagedClass>();
    (data?.todayClasses ?? []).forEach((c) => {
      const key = c.className;
      if (!map.has(key)) {
        map.set(key, {
          id: key.toLowerCase().replace(/\s+/g, "-"),
          name: key,
          students: c.studentCount,
          lastSubject: c.subject,
        });
      }
    });
    return Array.from(map.values());
  }, [data?.todayClasses]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Topbar */}
      <TeacherTopBar
        palette={palette}
        title="Dashboard Pengajar"
        gregorianDate={data?.gregorianDate}
        hijriDate={data?.hijriDate}
        dateFmt={fmtLong}
      />

      {/* Modal: Tambah Jadwal */}
      <TambahJadwal
        open={showTambahJadwal}
        onClose={() => setShowTambahJadwal(false)}
        palette={palette}
        onSubmit={(item) => {
          // Tambah ke dua list supaya demo terasa realtime (lokal)
          // Nanti ganti ke POST lalu invalidateQueries(TEACHER_HOME_QK)
          setListScheduleItems((prev) =>
            [...prev, item].sort((a, b) => a.time.localeCompare(b.time))
          );
        }}
      />

      {/* Modal: Tambah/Edit Pengumuman */}
      <TeacherAddEditAnnouncement
        palette={palette}
        open={announceOpen}
        onClose={() => {
          setAnnounceOpen(false);
          setAnnounceInitial(null);
        }}
        initial={announceInitial}
        onSubmit={handleSubmitAnnouncement}
        saving={announceSaving}
        error={announceError}
      />

      {/* Content + Sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <TeacherSidebarNav palette={palette} />

          {/* Main */}
          <div className="flex-1 space-y-6">
            {/* ===== Row 1 ===== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Jadwal Hari Ini */}
              <div className="lg:col-span-6">
                <TodayScheduleCard
                  palette={palette}
                  items={scheduleItems}
                  seeAllPath="all-today-schedule" // ✅ konsisten ke halaman list
                  addLabel="Tambah Jadwal"
                  onAdd={() => setShowTambahJadwal(true)}
                />
              </div>

              {/* Kelas yang Saya Kelola */}
              <div className="lg:col-span-6">
                <SectionCard palette={palette}>
                  <div className="p-4 md:p-5 pb-2 font-medium flex items-center gap-2">
                    <Users size={16} color={palette.quaternary} />
                    Kelas yang Saya Kelola
                  </div>
                  <div className="px-4 md:px-5 pb-4 grid gap-2">
                    {managedClasses.length > 0 ? (
                      managedClasses.map((c) => (
                        <MyClassItem
                          key={c.id}
                          name={c.name}
                          students={c.students}
                          lastSubject={c.lastSubject}
                          palette={palette}
                        />
                      ))
                    ) : (
                      <div
                        className="text-sm"
                        style={{ color: palette.silver2 }}
                      >
                        Belum ada kelas terdaftar.
                      </div>
                    )}
                  </div>
                </SectionCard>
              </div>
            </section>

            {/* ===== Row 2: Daftar Jadwal ===== */}
            <section>
              <ListJadwal
                palette={palette}
                items={listScheduleItems}
                title="Daftar Jadwal"
                onAdd={() => setShowTambahJadwal(true)}
              />
            </section>

            {/* ===== Row 3: Pengumuman ===== */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Pengumuman</h3>
                <Btn
                  palette={palette}
                  size="sm"
                  onClick={() => {
                    setAnnounceInitial(null);
                    setAnnounceOpen(true);
                  }}
                >
                  Tambah Pengumuman
                </Btn>
              </div>

              <AnnouncementsList
                palette={palette}
                items={announcements}
                dateFmt={fmtLong}
                seeAllPath="all-announcement-teacher"
                getDetailHref={(a) => `/guru/pengumuman/detail/${a.id}`}
                showActions
                canAdd={false}
                onEdit={(a) => {
                  setAnnounceInitial({
                    id: a.id,
                    title: a.title,
                    date: a.date,
                    body: a.body,
                  });
                  setAnnounceOpen(true);
                }}
                onDelete={handleDeleteAnnouncement}
                deletingId={deletingId}
              />
            </section>

            {isLoading && (
              <div className="text-sm" style={{ color: palette.silver2 }}>
                Memuat data dashboard…
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= Small UI helpers ================= */
function MyClassItem({
  name,
  students,
  lastSubject,
  palette,
}: {
  name: string;
  students?: number;
  lastSubject?: string;
  palette: Palette;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-xl border px-3 py-2"
      style={{ borderColor: palette.silver1, background: palette.white2 }}
    >
      <div className="min-w-0">
        <div className="font-medium truncate">{name}</div>
        <div className="text-xs truncate" style={{ color: palette.silver2 }}>
          {typeof students === "number" ? `${students} siswa` : "—"}{" "}
          {lastSubject ? `• ${lastSubject}` : ""}
        </div>
      </div>
      <Btn
        palette={palette}
        size="sm"
        variant="ghost"
        onClick={() => alert(`Kelola ${name}`)}
      >
        Kelola
      </Btn>
    </div>
  );
}
