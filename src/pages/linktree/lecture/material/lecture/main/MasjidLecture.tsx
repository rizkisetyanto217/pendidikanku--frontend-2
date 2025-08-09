import React, { useMemo, useState } from "react";
import { Tabs, TabsContent } from "@/components/common/main/Tabs";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import FormattedDate from "@/constants/formattedDate";
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

/* ---------------- Component ---------------- */
export default function MasjidLectureMaterial() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { lecture_slug, slug } = useParams<{
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

  /* ---------- Sessions buckets (baru) ---------- */
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
        { headers }
      );
      return res.data;
    },
    enabled: !!lecture_slug,
    staleTime: 5 * 60 * 1000,
  });

  const upcoming = buckets?.upcoming ?? [];
  const finished = buckets?.finished ?? [];

  /* ---------- Render helpers ---------- */
  const SessionCard = (s: SessionAPI) => (
    <div
      key={
        s.lecture_session_id ||
        `${s.lecture_session_slug}-${s.lecture_session_start_time}`
      }
      onClick={() =>
        navigate(`/masjid/${slug}/soal-materi/${s.lecture_session_slug}`, {
          state: { fromTab: tab, lectureSlug: lecture_slug },
        })
      }
      className="p-4 rounded-lg shadow cursor-pointer hover:opacity-90 transition"
      style={{ backgroundColor: theme.white1 }}
    >
      <h3 className="font-semibold" style={{ color: theme.black1 }}>
        {s.lecture_session_title}
      </h3>

      <div
        className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
        style={{ color: theme.silver2 }}
      >
        <FormattedDate value={s.lecture_session_start_time} />
        <span>•</span>
        <span>📍 {s.lecture_session_place || "-"}</span>
        {typeof s.user_attendance_status === "number" && (
          <>
            <span>•</span>
            <span>
              Hadir: {s.user_attendance_status === 1 ? "Ya" : "Tidak"}
            </span>
          </>
        )}
        {typeof s.user_grade_result === "number" && (
          <>
            <span>•</span>
            <span>Nilai: {s.user_grade_result}</span>
          </>
        )}
      </div>
    </div>
  );

  const SessionsAll = () => {
    if (loadingBuckets) {
      return (
        <p className="text-sm" style={{ color: theme.silver2 }}>
          Memuat sesi kajian...
        </p>
      );
    }
    if (errorBuckets) {
      return <p className="text-sm text-red-500">Gagal memuat daftar sesi.</p>;
    }
    if (!upcoming.length && !finished.length) {
      return (
        <p className="text-sm" style={{ color: theme.silver2 }}>
          Belum ada sesi.
        </p>
      );
    }

    return (
      <div className="space-y-5">
        {!!upcoming.length && (
          <section>
            <h4
              className="text-sm font-semibold mb-2"
              style={{ color: theme.black1 }}
            >
              Mendatang
            </h4>
            <div className="space-y-3">{upcoming.map(SessionCard)}</div>
          </section>
        )}

        {!!upcoming.length && !!finished.length && (
          <div
            className="h-px my-1"
            style={{ backgroundColor: theme.silver1 }}
          />
        )}

        {!!finished.length && (
          <section>
            <h4
              className="text-sm font-semibold mb-2"
              style={{ color: theme.black1 }}
            >
              Selesai
            </h4>
            <div className="space-y-3">{finished.map(SessionCard)}</div>
          </section>
        )}
      </div>
    );
  };

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
                      {Array.isArray(lecture?.lecture_teachers) &&
                      lecture.lecture_teachers.length
                        ? [
                            ...new Set(
                              lecture.lecture_teachers.map((t) => t.name)
                            ),
                          ].join(", ")
                        : "-"}
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
                      border: `1px solid ${isSertifikat && isAvailable ? theme.success1 : theme.silver1}`,
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
          <div className="px-4 pb-24 space-y-4 mt-4">
            {/* Tanpa sub-tab, langsung render semuanya */}
            <SessionsAll />
          </div>
        </SwiperSlide>
      </Swiper>

      <BottomNavbar />
    </>
  );
}
