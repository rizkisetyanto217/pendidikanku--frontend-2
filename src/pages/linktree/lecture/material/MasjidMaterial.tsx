import React, { useEffect, useState, useRef } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LectureMaterialMonthList from "@/components/pages/lecture/LectureMonthList";
import LectureMaterialList from "@/components/pages/lecture/LectureMaterialList";
import { Tabs, TabsContent } from "@/components/common/main/Tabs";
import BottomNavbar from "@/components/common/public/ButtonNavbar";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import axios from "@/lib/axios";
import FormattedDate from "@/constants/formattedDate";
import { LectureMaterialItem } from "@/pages/linktree/lecture/material/lecture-sessions/main/types/lectureSessions";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import LectureThemeCard from "@/components/pages/lecture/LectureTheme";

interface LectureSessionAPIItem {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_slug: string;
  lecture_session_teacher_name: string;
  lecture_session_start_time: string;
  lecture_session_place: string;
  lecture_session_image_url: string;
  lecture_session_approved_by_dkm_at: string | null;
  lecture_session_lecture_id: string;
  lecture_title: string;
  user_grade_result?: number;
  user_attendance_status?: number;
}

interface LectureTheme {
  lecture_slug: string;
  lecture_title: string;
  total_lecture_sessions: number;
}

type MonthSummary = {
  month: string;
  total: number; // bukan _total
};

export default function MasjidMaterial() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const { data: currentUser } = useCurrentUser();

  const urlTab = searchParams.get("tab");
  const stateTab = location.state?.from?.tab;
  const defaultTab = urlTab || stateTab || "terbaru";

  const [tab, setTab] = useState<string>(defaultTab);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const swiperRef = useRef<any>(null);

  const { data: kajianList = [], isLoading: loadingKajian } = useQuery<
    LectureSessionAPIItem[]
  >({
    queryKey: ["kajianListBySlug", slug, currentUser?.id],
    queryFn: async () => {
      const headers = currentUser?.id ? { "X-User-Id": currentUser.id } : {};
      const res = await axios.get(
        `/public/lecture-sessions-u/soal-materi/${slug}`,
        { headers }
      );
      console.log("📦 Data sesi kajian:", res.data);
      return res.data?.data ?? [];
    },
    enabled: !!slug,
  });

  const { data: lectureThemes = [], isLoading: loadingThemes } = useQuery<
    LectureTheme[]
  >({
    queryKey: ["lectureThemesBySlug", slug],

    queryFn: async () => {
      const res = await axios.get(`/public/lectures/by-masjid-slug/${slug}`);
      return res.data?.data ?? [];
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: monthData = [] } = useQuery<MonthSummary[]>({
    queryKey: ["lectureMonthData", slug],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-u/by-masjid-slug/${slug}/group-by-month`
      );
      const rawData = res.data?.data ?? {};
      return Object.entries(rawData).map(([month, sessions]) => {
        const m = month as string;
        const s = sessions as any[];

        return {
          month: m,
          total: s.length, // ✅ ini akan cocok dengan tipe `MonthSummary` di komponen `LectureMaterialMonthList`
        };
      });
    },
    enabled: !!slug && tab === "tanggal",
  });

  const mappedMaterial: LectureMaterialItem[] = kajianList.map((item) => ({
    id: item.lecture_session_id,
    title: item.lecture_session_title,
    teacher: item.lecture_session_teacher_name,
    masjidName: "",
    location: item.lecture_session_place,
    time: (
      <FormattedDate value={item.lecture_session_start_time} fullMonth />
    ) as unknown as string,
    lecture_session_slug: item.lecture_session_slug,
    status: item.lecture_session_approved_by_dkm_at ? "tersedia" : "proses",
    lectureId: item.lecture_session_lecture_id,
    gradeResult: item.user_grade_result,
    attendanceStatus: item.user_attendance_status,
    imageUrl: item.lecture_session_image_url,
  }));

  if (!slug) return null;

  return (
    <>
      <PublicNavbar masjidName="Materi Kajian" />
      <div
        className="sticky top-16 z-40"
        style={{ backgroundColor: theme.white1 }}
      >
        <div
          className="flex justify-around border-b"
          style={{ borderColor: theme.silver1 }}
        >
          {["terbaru", "tema", "tanggal"].map((val) => (
            <button
              key={val}
              onClick={() => {
                setTab(val);
                setSearchParams({ tab: val });
                const tabValues = ["terbaru", "tema", "tanggal"];
                const newIndex = tabValues.indexOf(val);
                if (swiperRef.current && newIndex !== -1) {
                  swiperRef.current.slideTo(newIndex);
                }
              }}
              className="py-3 text-sm font-medium"
              style={{
                color: tab === val ? theme.primary : theme.silver2,
                borderBottom:
                  tab === val ? `2px solid ${theme.primary}` : "none",
              }}
            >
              {val.charAt(0).toUpperCase() + val.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-16 pb-20">
        <Swiper
          className="!h-auto"
          spaceBetween={10}
          slidesPerView={1}
          onSlideChange={(swiper) => {
            const tabValues = ["terbaru", "tema", "tanggal"];
            const newTab = tabValues[swiper.activeIndex] || "terbaru";
            setTab(newTab);
            setSearchParams({ tab: newTab });
            if (newTab === "tanggal") setSelectedMonth(null);
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            const tabValues = ["terbaru", "tema", "tanggal"];
            const startIndex = tabValues.indexOf(tab);
            if (startIndex !== -1) swiper.slideTo(startIndex, 0);
          }}
        >
          <SwiperSlide>
            <div
              style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
            >
              {loadingKajian ? (
                <p className="p-4">Memuat data...</p>
              ) : (
                <LectureMaterialList data={mappedMaterial} />
              )}
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div
              className="space-y-3"
              style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
            >
              {loadingThemes ? (
                <p>Memuat tema kajian...</p>
              ) : (
                lectureThemes.map((themeItem) => (
                  <LectureThemeCard
                    key={themeItem.lecture_slug}
                    slug={slug}
                    lecture_slug={themeItem.lecture_slug}
                    lecture_title={themeItem.lecture_title}
                    total_lecture_sessions={themeItem.total_lecture_sessions}
                  />
                ))
              )}
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div
              style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
            >
              {selectedMonth ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedMonth(null)}
                    className="text-sm font-medium"
                    style={{ color: theme.primary }}
                  >
                    ← Kembali ke daftar bulan
                  </button>
                  <h2 className="text-base font-medium">
                    Bulan {selectedMonth}
                  </h2>
                  <LectureMaterialList data={mappedMaterial} />
                </div>
              ) : (
                <LectureMaterialMonthList
                  data={monthData}
                  onSelectMonth={(month) =>
                    navigate(`/masjid/${slug}/materi-bulan/${month}`)
                  }
                />
              )}
            </div>
          </SwiperSlide>
        </Swiper>

        <BottomNavbar />
      </div>
    </>
  );
}
