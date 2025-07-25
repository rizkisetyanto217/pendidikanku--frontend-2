import React, { useState } from "react";
import LectureMaterialMonthList from "@/components/pages/lecture/LectureMonthList";
import LectureMaterialList from "@/components/pages/lecture/LectureMaterialList";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/common/main/Tabs";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

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
  const [tab, setTab] = useState("terbaru");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const navigate = useNavigate();
  const { slug } = useParams();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const handleTabChange = (val: string) => {
    setTab(val);
    if (val === "tanggal") setSelectedMonth(null);
  };

  const { data: kajianList = [], isLoading: loadingKajian } = useQuery<
    LectureSessionAPIItem[]
  >({
    queryKey: ["kajianListBySlug", slug],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-u/soal-materi/${slug}`
      );
      return res.data?.data ?? [];
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: lectureThemes = [], isLoading: loadingThemes } = useQuery<
    LectureTheme[]
  >({
    queryKey: ["lectureThemesBySlug", slug],
    queryFn: async () => {
      const res = await axios.get(`/public/lectures/slug/${slug}`);
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
  }));

  if (!slug) return null;

  return (
    <div
      className="pt-4 space-y-4 pb-20"
      // style={{ backgroundColor: theme.white1, color: theme.black1 }}
    >
      <PageHeaderUser
        title="Soal & Materi Kajian ini"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <Tabs
        value={tab}
        onChange={handleTabChange}
        tabs={[
          { label: "Terbaru", value: "terbaru" },
          { label: "Tema", value: "tema" },
          { label: "Tanggal", value: "tanggal" },
        ]}
      />

      <TabsContent value="terbaru" current={tab}>
        {loadingKajian ? (
          <p>Memuat data...</p>
        ) : (
          <LectureMaterialList data={mappedMaterial} />
        )}
      </TabsContent>

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
            <h2 className="text-base font-semibold">Bulan {selectedMonth}</h2>
            <LectureMaterialList data={mappedMaterial} />
          </div>
        ) : (
          <LectureMaterialMonthList
            data={monthData}
            onSelectMonth={setSelectedMonth}
          />
        )}
      </TabsContent>

      <TabsContent value="tema" current={tab}>
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Tema Kajian</h2>
          {loadingThemes ? (
            <p>Memuat tema kajian...</p>
          ) : (
            <div className="space-y-3">
              {lectureThemes.map((themeItem) => (
                <div
                  key={themeItem.lecture_id}
                  onClick={() =>
                    navigate(`/masjid/${slug}/tema/${themeItem.lecture_id}`)
                  }
                  className="p-4 rounded-lg cursor-pointer hover:opacity-90"
                  style={{
                    backgroundColor: theme.white1,
                    border: `1px solid ${theme.silver1}`,
                  }}
                >
                  <h3 className="text-base font-semibold">
                    {themeItem.lecture_title}
                  </h3>
                  <p className="text-sm" style={{ color: theme.silver2 }}>
                    Total {themeItem.lecture_total_sessions} kajian
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>
    </div>
  );
}
