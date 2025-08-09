import React, { useState } from "react";
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

// =====================
// ✅ Interface lokal
// =====================
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

interface LectureSession {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_slug: string;
  lecture_session_description: string;
  lecture_session_image_url: string;

  lecture_session_start_time: string;
  lecture_session_place: string;
  UserName: string;
}

export default function MasjidLectureMaterial() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { lecture_slug, slug } = useParams<{
    lecture_slug: string;
    slug: string;
  }>();
  const { data: currentUser } = useCurrentUser();
  const location = useLocation();
  const [swiperInstance, setSwiperInstance] = useState<SwiperCore>();
  const [tab, setTab] = useState("navigasi"); // nilai: "navigasi" atau "kajian"

  // 🔁 Dapatkan data tema kajian
  // 🔁 Dapatkan data tema kajian
  const {
    data: lectureData,
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
      console.log("📦 Data tema kajian:", res.data);
      return res.data?.data;
    },
    enabled: !!lecture_slug,
    staleTime: 5 * 60 * 1000,
  });

  const lecture = lectureData?.lecture;
  const userProgress = lectureData?.user_progress;

  const {
    data: sessions,
    isLoading: loadingSessions,
    isError: errorSessions,
  } = useQuery<LectureSession[]>({
    queryKey: ["lecture-sessions", lecture_slug],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lectures/${lecture_slug}/lecture-sessions-by-slug`
      );
      return res.data?.data ?? [];
    },
    enabled: !!lecture_slug,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <>
      <PageHeaderUser
        title="Tema Kajian Detail"
        onBackClick={() => {
          navigate(`/masjid/${slug}/soal-materi?tab=tema`);
        }}
      />
      <Tabs
        value={tab}
        onChange={(val) => {
          setTab(val);
          if (val === "navigasi") {
            swiperInstance?.slideTo(0);
          } else if (val === "kajian") {
            swiperInstance?.slideTo(1);
          }
        }}
        tabs={[
          { label: "Navigasi", value: "navigasi" },
          { label: "Kajian", value: "kajian" },
        ]}
      />

      {/* // Ganti TabsContent => SwiperSlide */}
      <Swiper
        onSwiper={setSwiperInstance}
        onSlideChange={(swiper) => {
          const newTab = swiper.activeIndex === 0 ? "navigasi" : "kajian";
          setTab(newTab);
        }}
        initialSlide={tab === "kajian" ? 1 : 0}
        spaceBetween={50}
        slidesPerView={1}
      >
        {/* =============== 🧭 Navigasi Utama =============== */}
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
              <p className="text-sm text-silver-400">Memuat informasi...</p>
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
                      lecture.lecture_teachers.length > 0
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
                      Masjid At-Taqwa, Ciracas
                    </p>
                  </div>

                  {userProgress && (
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
                // { label: "Materi Lengkap", path: "materi-lengkap" },
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

        {/* =============== 📘 Sesi Kajian =============== */}
        <SwiperSlide>
          <div className="fpx-4 pb-24 space-y-4 mt-4">
            {loadingSessions ? (
              <p className="text-sm text-silver-400">Memuat sesi kajian...</p>
            ) : errorSessions ? (
              <p className="text-red-500 text-sm">Gagal memuat daftar sesi.</p>
            ) : sessions && sessions.length > 0 ? (
              sessions.map((sesi) => (
                <div
                  key={sesi.lecture_session_id}
                  onClick={() =>
                    navigate(
                      `/masjid/${slug}/soal-materi/${sesi.lecture_session_slug}`,
                      {
                        state: { fromTab: tab, lectureSlug: lecture_slug },
                      }
                    )
                  }
                  className="p-4 rounded-lg shadow cursor-pointer hover:opacity-90 transition"
                  style={{ backgroundColor: theme.white1 }}
                >
                  <h3 className="font-semibold" style={{ color: theme.black1 }}>
                    {sesi.lecture_session_title}
                  </h3>
                  <p className="text-sm" style={{ color: theme.silver2 }}>
                    {sesi.UserName}
                  </p>
                  <p className="text-xs pb-2" style={{ color: theme.silver2 }}>
                    <FormattedDate value={sesi.lecture_session_start_time} />
                  </p>
                  <p className="text-sm" style={{ color: theme.silver2 }}>
                    📍 {sesi.lecture_session_place || "-"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-silver-500">
                Belum ada sesi tersedia.
              </p>
            )}
          </div>
        </SwiperSlide>
      </Swiper>
      {/* Bottom Navigation */}
      <BottomNavbar />
    </>
  );
}
