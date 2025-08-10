import React, { useMemo, useState } from "react";
import { Tabs } from "@/components/common/main/Tabs";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import BottomNavbar from "@/components/common/public/ButtonNavbar";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import "swiper/css";
import {
  BookOpen,
  User,
  CalendarDays,
  CalendarCheck,
  MapPin,
  Calculator,
  Book,
  XCircle,
} from "lucide-react";
import LectureMaterialList from "@/components/pages/lecture/LectureMaterialList"; // ⬅️ sesuaikan path import kamu
import { LectureMaterialItem } from "@/pages/linktree/lecture/material/lecture-sessions/main/types/lectureSessions";
import ShareBCLectureButton from "@/components/common/public/ShareBCLectureButton";

/* ---------------- Types ---------------- */
interface Teacher {
  id: string;
  name: string;
}
interface Lecture {
  lecture_id: string;
  lecture_slug: string;
  lecture_title: string;
  lecture_description: string;
  lecture_image_url: string;
  lecture_is_certificate_generated: boolean;
  lecture_teachers: Teacher[];
}
interface SessionAPI {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_slug: string;
  lecture_session_description: string;
  lecture_session_image_url: string;
  lecture_session_start_time: string;
  lecture_session_end_time: string;
  lecture_session_place: string;
  lecture_title?: string;
  user_grade_result?: number | null;
  user_attendance_status?: number | null;
}
interface SessionsBuckets {
  lecture: Lecture;
  upcoming: SessionAPI[];
  finished: SessionAPI[];
}

/* ---------------- Helpers ---------------- */
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

function toLectureItem(
  s: SessionAPI,
  teacherNames: string,
  isFinished: boolean,
  meta: { lectureId?: string; masjidName?: string } = {}
): LectureMaterialItem {
  return {
    id: s.lecture_session_id || s.lecture_session_slug,
    lecture_session_slug: s.lecture_session_slug,
    imageUrl: s.lecture_session_image_url,
    title: s.lecture_session_title,
    teacher: teacherNames,
    time: fmtTime(s.lecture_session_start_time),

    // ✅ fields yang sebelumnya hilang
    location: s.lecture_session_place || "-",
    lectureId: meta.lectureId ?? "",
    masjidName: meta.masjidName ?? "",

    // opsional
    attendanceStatus:
      typeof s.user_attendance_status === "number"
        ? s.user_attendance_status
        : undefined,
    gradeResult:
      typeof s.user_grade_result === "number" ? s.user_grade_result : undefined,
    status: isFinished ? "tersedia" : "proses",
  };
}

/* ---------------- Component ---------------- */
export default function MasjidLectureMaterial() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { lecture_slug = "", slug = "" } = useParams<{
    lecture_slug: string;
    slug: string;
  }>();
  const { data: currentUser } = useCurrentUser();
  const [swiperInstance, setSwiperInstance] = useState<SwiperCore>();
  const [tab, setTab] = useState<"navigasi" | "kajian">("navigasi");

  /* ---------- Lecture (tetap) ---------- */
  const {
    data: lectureWrap,
    isLoading: loadingLecture,
    isError: errorLecture,
  } = useQuery<{
    lecture: Lecture;
    user_progress: {
      grade_result?: number;
      total_completed_sessions?: number;
    } | null;
  }>({
    queryKey: ["lecture-theme", lecture_slug, currentUser?.id],
    queryFn: async () => {
      const headers = currentUser?.id ? { "X-User-Id": currentUser.id } : {};
      const res = await axios.get(`/public/lectures/by-slug/${lecture_slug}`, {
        headers,
      });
      return res.data?.data;
    },
    enabled: !!lecture_slug,
    staleTime: 5 * 60 * 1000,
  });

  const lecture = lectureWrap?.lecture;
  const userProgress = lectureWrap?.user_progress;
  const teacherNames =
    Array.isArray(lecture?.lecture_teachers) && lecture!.lecture_teachers.length
      ? [...new Set(lecture!.lecture_teachers.map((t) => t.name))].join(", ")
      : "-";

  /* ---------- Sessions buckets ---------- */
  const {
    data: buckets,
    isLoading: loadingBuckets,
    isError: errorBuckets,
  } = useQuery<SessionsBuckets>({
    queryKey: ["lecture-sessions-all", lecture_slug, currentUser?.id],
    queryFn: async () => {
      const headers = currentUser?.id ? { "X-User-Id": currentUser.id } : {};
      const res = await axios.get(
        `/public/lecture-sessions-u/by-lecture-slug/${lecture_slug}/all`,
        {
          headers,
        }
      );
      return res.data;
    },
    enabled: !!lecture_slug,
    staleTime: 5 * 60 * 1000,
  });

  const upcomingItems: LectureMaterialItem[] = useMemo(() => {
    const list = buckets?.upcoming ?? [];
    return list.map((s) => toLectureItem(s, teacherNames, false));
  }, [buckets?.upcoming, teacherNames]);

  const finishedItems: LectureMaterialItem[] = useMemo(() => {
    const list = buckets?.finished ?? [];
    return list.map((s) => toLectureItem(s, teacherNames, true));
  }, [buckets?.finished, teacherNames]);

  /* ---------- UI ---------- */
  return (
    <>
      <PageHeaderUser
        title="Tema Kajian Detail"
        onBackClick={() => navigate(`/masjid/${slug}/soal-materi?tab=tema`)}
      />

      <Tabs
        value={tab}
        onChange={(val) => {
          const v = val as "navigasi" | "kajian";
          setTab(v);
          if (v === "navigasi") swiperInstance?.slideTo(0);
          else swiperInstance?.slideTo(1);
        }}
        tabs={[
          { label: "Navigasi", value: "navigasi" },
          { label: "Kajian", value: "kajian" },
        ]}
      />

      <Swiper
        onSwiper={setSwiperInstance}
        onSlideChange={(sw) =>
          setTab(sw.activeIndex === 0 ? "navigasi" : "kajian")
        }
        initialSlide={tab === "kajian" ? 1 : 0}
        spaceBetween={50}
        slidesPerView={1}
      >
        {/* ======= Navigasi ======= */}
        <SwiperSlide>
          <div
            className="rounded-lg p-4 shadow mt-4"
            style={{ backgroundColor: theme.white1 }}
          >
            <h2
              className="text-base font-semibold mb-2"
              style={{ color: theme.black1 }}
            >
              Informasi Tema Kajian
            </h2>

            {loadingLecture ? (
              <p className="text-sm" style={{ color: theme.silver2 }}>
                Memuat informasi...
              </p>
            ) : errorLecture || !lecture ? (
              <p className="text-red-500 text-sm">Gagal memuat data.</p>
            ) : (
              <div
                className="rounded-lg"
                style={{ backgroundColor: theme.white1 }}
              >
                <div
                  className="text-base space-y-2"
                  style={{ color: theme.black2 }}
                >
                  <div className="flex items-start gap-2">
                    <BookOpen
                      size={18}
                      style={{ color: theme.black1, marginTop: 2 }}
                    />
                    <p>
                      <strong style={{ color: theme.black1 }}>Materi:</strong>{" "}
                      {lecture.lecture_title}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <User
                      size={18}
                      style={{ color: theme.black1, marginTop: 2 }}
                    />
                    <p>
                      <strong style={{ color: theme.black1 }}>Pengajar:</strong>{" "}
                      {teacherNames}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CalendarDays
                      size={18}
                      style={{ color: theme.black1, marginTop: 2 }}
                    />
                    <p>
                      <strong style={{ color: theme.black1 }}>Jadwal:</strong>{" "}
                      {lecture.lecture_description || "-"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CalendarCheck
                      size={18}
                      style={{ color: theme.black1, marginTop: 2 }}
                    />
                    <p>
                      <strong style={{ color: theme.black1 }}>Mulai:</strong> 24
                      Mei 2024 – Sekarang
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={18}
                      style={{ color: theme.black1, marginTop: 2 }}
                    />
                    <p>
                      <strong style={{ color: theme.black1 }}>Lokasi:</strong>{" "}
                      Masjid At‑Taqwa, Ciracas
                    </p>
                  </div>

                  {!!userProgress && (
                    <>
                      <div className="flex items-start gap-2">
                        <Calculator
                          size={18}
                          style={{ color: theme.black1, marginTop: 2 }}
                        />
                        <p>
                          <strong style={{ color: theme.black1 }}>
                            Nilai Akhir:
                          </strong>{" "}
                          {userProgress.grade_result ?? "-"}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Book
                          size={18}
                          style={{ color: theme.black1, marginTop: 2 }}
                        />
                        <p>
                          <strong style={{ color: theme.black1 }}>
                            Sesi Selesai:
                          </strong>{" "}
                          {userProgress.total_completed_sessions ?? 0}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {!lecture.lecture_is_certificate_generated && (
                  <div
                    className="flex items-center gap-2 mt-2 text-sm italic"
                    style={{ color: theme.error1 }}
                  >
                    <XCircle size={16} />
                    <span>Sertifikat belum tersedia</span>
                  </div>
                )}
                {/* tombol share pojok kanan */}
                <div className="absolute top-3 right-3">
                  <ShareBCLectureButton
                    variant="ghost"
                    buttonLabel="Bagikan"
                    lectureTitle={lecture?.lecture_title || "Tema Kajian"}
                    teacherNames={teacherNames}
                    // otomatis pilih sesi terdekat dari upcoming
                    sessions={(buckets?.upcoming || []).map((s) => ({
                      startTime: s.lecture_session_start_time,
                      place: s.lecture_session_place,
                    }))}
                    // atau bisa langsung nextDateIso jika sudah ada:
                    // nextDateIso={someIso}
                    url={`${window.location.origin}/masjid/${slug}/tema/${lecture_slug}`}
                  />
                </div>
              </div>
            )}

            <h2
              className="text-base mt-5 font-semibold mb-2"
              style={{ color: theme.black1 }}
            >
              Navigasi Utama
            </h2>

            <div className="space-y-2">
              {[
                ...(lecture?.lecture_is_certificate_generated
                  ? [{ label: "Sertifikat", path: "ujian", highlight: true }]
                  : []),
                { label: "Informasi", path: "informasi" },
                { label: "Video Audio", path: "video-audio" },
                { label: "Latihan Soal", path: "latihan-soal" },
                { label: "Ringkasan", path: "ringkasan" },
                { label: "Tanya Jawab", path: "tanya-jawab" },
                { label: "Masukan dan Saran", path: "masukan-saran" },
                { label: "Dokumen", path: "dokumen" },
              ].map((item) => {
                const isSertifikat = item.label === "Sertifikat";
                const isAvailable = item.highlight;
                return (
                  <div
                    key={item.label}
                    onClick={() =>
                      navigate(
                        `/masjid/${slug}/tema/${lecture_slug}/${item.path}`
                      )
                    }
                    className="flex items-center justify-between p-3 rounded-md border cursor-pointer hover:bg-opacity-90 transition"
                    style={{
                      backgroundColor:
                        isSertifikat && isAvailable
                          ? theme.success1
                          : theme.white3,
                      border: `1px solid ${
                        isSertifikat && isAvailable
                          ? theme.success1
                          : theme.silver1
                      }`,
                      color:
                        isSertifikat && isAvailable
                          ? theme.specialColor
                          : theme.black1,
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      {isSertifikat && isAvailable && <span>🎉</span>}
                      <span>{item.label}</span>
                    </div>
                    {isSertifikat && isAvailable ? (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: theme.success1,
                          color: theme.white1,
                        }}
                      >
                        Tersedia
                      </span>
                    ) : (
                      <span style={{ color: theme.silver4 }}>›</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </SwiperSlide>

        {/* ======= Sesi Kajian (upcoming & finished) ======= */}
        <SwiperSlide>
          <div className="pb-24 space-y-4 mt-4">
            {loadingBuckets ? (
              <p className="text-sm" style={{ color: theme.silver2 }}>
                Memuat sesi kajian...
              </p>
            ) : errorBuckets ? (
              <p className="text-sm text-red-500">Gagal memuat daftar sesi.</p>
            ) : !upcomingItems.length && !finishedItems.length ? (
              <p className="text-sm" style={{ color: theme.silver2 }}>
                Belum ada sesi.
              </p>
            ) : (
              <>
                {!!upcomingItems.length && (
                  <section>
                    <h4
                      className="text-sm font-semibold mb-2"
                      style={{ color: theme.black1 }}
                    >
                      Mendatang
                    </h4>
                    <LectureMaterialList data={upcomingItems} />
                  </section>
                )}

                {!!upcomingItems.length && !!finishedItems.length && (
                  <div
                    className="h-px my-2"
                    style={{ backgroundColor: theme.silver1 }}
                  />
                )}

                {!!finishedItems.length && (
                  <section>
                    <h4
                      className="text-sm font-semibold mb-2"
                      style={{ color: theme.black1 }}
                    >
                      Selesai
                    </h4>
                    <LectureMaterialList data={finishedItems} />
                  </section>
                )}
              </>
            )}
          </div>
        </SwiperSlide>
      </Swiper>

      <BottomNavbar />
    </>
  );
}
