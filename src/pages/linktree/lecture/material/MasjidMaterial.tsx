import React, { useEffect, useState } from "react";
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

interface LectureSessionAPIItem {
  lecture_session_id: string;
  lecture_session_title: string;
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

interface LectureMaterialItem {
  id: string;
  title: string;
  teacher: string;
  masjidName: string;
  location: string;
  time: string;
  status: "tersedia" | "proses";
  lectureId: string;
  gradeResult?: number;
  attendanceStatus?: number;
}

interface LectureTheme {
  lecture_id: string;
  lecture_title: string;
  lecture_total_sessions: number;
}

const monthData = [
  { month: "Januari", total: 12 },
  { month: "Februari", total: 12 },
  { month: "Maret", total: 12 },
];

export default function MasjidMaterial() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const { data: currentUser } = useCurrentUser();

  // ✅ Ambil tab dari URL atau state, default: 'terbaru'
  const urlTab = searchParams.get("tab");
  const stateTab = location.state?.from?.tab;
  const defaultTab = urlTab || stateTab || "terbaru";

  const [tab, setTab] = useState<string>(defaultTab);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  useEffect(() => {
    console.log("📍 Tab aktif:", tab);
  }, [tab]);

  const handleTabChange = (val: string) => {
    console.log("🔄 Tab diubah ke:", val);
    setTab(val);
    setSearchParams({ tab: val });
    if (val === "tanggal") setSelectedMonth(null);
  };

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
      console.log("📦 Data kajian:", res.data);
      return res.data?.data ?? [];
    },
    enabled: !!slug,
  });

  const { data: lectureThemes = [], isLoading: loadingThemes } = useQuery<
    LectureTheme[]
  >({
    queryKey: ["lectureThemesBySlug", slug],
    queryFn: async () => {
      const res = await axios.get(`/public/lectures/slug/${slug}`);
      console.log("📦 Data tema kajian:", res.data);
      return res.data?.data ?? [];
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const mappedMaterial: LectureMaterialItem[] = kajianList.map((item) => ({
    id: item.lecture_session_id,
    title: item.lecture_session_title,
    teacher: item.lecture_session_teacher_name,
    masjidName: "",
    location: item.lecture_session_place,
    time: new Date(item.lecture_session_start_time).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    }),
    status: item.lecture_session_approved_by_dkm_at ? "tersedia" : "proses",
    lectureId: item.lecture_session_lecture_id,
    gradeResult: item.user_grade_result,
    attendanceStatus: item.user_attendance_status,
  }));

  if (!slug) return null;

  return (
    <>
      <PublicNavbar masjidName="Materi Kajian" />
      <div className="mt-16">
        <Tabs
          value={tab}
          onChange={handleTabChange}
          tabs={[
            { label: "Terbaru", value: "terbaru" },
            { label: "Tema", value: "tema" },
            { label: "Tanggal", value: "tanggal" },
          ]}
        />

        {/* 📘 Tab Terbaru */}
        <TabsContent value="terbaru" current={tab}>
          {loadingKajian ? (
            <p>Memuat data...</p>
          ) : (
            <LectureMaterialList data={mappedMaterial} />
          )}
        </TabsContent>

        {/* 📅 Tab Tanggal */}
        <TabsContent value="tanggal" current={tab}>
          {selectedMonth ? (
            <div className="space-y-3">
              <button
                onClick={() => setSelectedMonth(null)}
                className="text-sm font-medium"
                style={{ color: theme.primary }}
              >
                ← Kembali ke daftar bulan
              </button>
              <h2 className="text-base font-medium">Bulan {selectedMonth}</h2>
              <LectureMaterialList data={mappedMaterial} />
            </div>
          ) : (
            <LectureMaterialMonthList
              data={monthData}
              onSelectMonth={(month) => {
                console.log("📆 Bulan dipilih:", month);
                setSelectedMonth(month);
              }}
            />
          )}
        </TabsContent>

        {/* 🧭 Tab Tema */}
        <TabsContent value="tema" current={tab}>
          <div className="space-y-3">
            {loadingThemes ? (
              <p>Memuat tema kajian...</p>
            ) : (
              lectureThemes.map((themeItem) => (
                <div
                  key={themeItem.lecture_id}
                  onClick={() => {
                    console.log("➡️ Navigasi ke tema:", themeItem.lecture_id);
                    navigate(`/masjid/${slug}/tema/${themeItem.lecture_id}`, {
                      state: {
                        from: {
                          slug,
                          tab,
                        },
                      },
                    });
                  }}
                  className="p-4 rounded-lg cursor-pointer hover:opacity-90"
                  style={{
                    backgroundColor: theme.white1,
                    border: `1px solid ${theme.silver1}`,
                  }}
                >
                  <h3 className="text-base font-medium">
                    {themeItem.lecture_title}
                  </h3>
                  <p className="text-sm" style={{ color: theme.silver2 }}>
                    Total {themeItem.lecture_total_sessions} kajian
                  </p>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <BottomNavbar />
      </div>
    </>
  );
}
