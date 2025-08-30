import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useNavigate, useParams } from "react-router-dom";
import { colors } from "@/constants/colorsThema";
import FormattedDate from "@/constants/formattedDate";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import QRCodeLink from "@/components/common/main/QRCodeLink";
import BottomNavbar from "@/components/common/public/ButtonNavbar";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import { Tabs, TabsContent } from "@/components/common/main/Tabs";
import { useSearchParams } from "react-router-dom";
import ShimmerImage from "@/components/common/main/ShimmerImage";

interface Kajian {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_start_time: string;
  lecture_session_teacher_name: string;
  lecture_title: string;
  lecture_session_image_url: string;
}

interface JadwalRutin {
  lecture_schedules_id: string;
  lecture_schedules_title: string;
  lecture_schedules_start_time: string;
  lecture_schedules_place: string;
  lecture_schedules_day_of_week: number;
  lecture_schedules_notes: string;
  lecture: {
    lecture_title: string;
    lecture_image_url?: string;
  };
}

export default function MasjidScheduleLecture() {
  const { slug } = useParams<{ slug: string }>();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "mendatang";
  const [tab, setTab] = useState(tabParam);

  const { data: kajianList, isLoading } = useQuery<Kajian[]>({
    queryKey: ["kajianList", slug],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-u/mendatang/${slug}`
      );
      return res.data?.data ?? [];
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // update URL when tab changes
  useEffect(() => {
    setSearchParams({ tab });
  }, [tab, setSearchParams]);

  const { data: jadwalRutin = [], isLoading: loadingRutin } = useQuery<
    JadwalRutin[]
  >({
    queryKey: ["jadwalRutin", slug],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-schedules/by-masjid/${slug}`
      );
      return res.data ?? [];
    },
    enabled: !!slug && tab === "rutin",
    staleTime: 5 * 60 * 1000,
  });

  const getNamaHari = (day: number) => {
    const hari = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    return hari[day] || "-";
  };

  const renderCardRutin = (item: JadwalRutin) => (
    <div
      key={item.lecture_schedules_id}
      className="border rounded-xl overflow-hidden shadow-sm"
      style={{
        borderColor: theme.silver1,
        backgroundColor: theme.white1,
      }}
    >
      <div className="flex gap-3">
        <ShimmerImage
          src={
            item.lecture?.lecture_image_url
              ? decodeURIComponent(item.lecture.lecture_image_url)
              : undefined
          }
          alt={item.lecture_schedules_title}
          className="w-36 h-36 object-cover rounded-l-xl"
          shimmerClassName="rounded-l-xl"
        />
        <div className="flex-1 text-sm p-2">
          <p className="text-xs font-semibold" style={{ color: theme.primary }}>
            {item.lecture?.lecture_title}
          </p>
          <p
            className="font-semibold line-clamp-2 pt-2"
            style={{ color: theme.black1 }}
          >
            {item.lecture_schedules_title}
          </p>
          <p className="text-xs pt-2" style={{ color: theme.silver2 }}>
            {getNamaHari(item.lecture_schedules_day_of_week)} –{" "}
            {item.lecture_schedules_start_time?.slice(0, 5)} WIB
          </p>
          <p className="text-xs pt-1" style={{ color: theme.silver2 }}>
            {item.lecture_schedules_place}
          </p>
        </div>
      </div>
    </div>
  );

  const renderCard = (kajian: Kajian) => (
    <div
      key={kajian.lecture_session_id}
      onClick={() =>
        navigate(`/masjid/${slug}/jadwal-kajian/${kajian.lecture_session_id}`)
      }
      className="border rounded-xl overflow-hidden shadow-sm cursor-pointer transition hover:scale-[1.01]"
      style={{
        borderColor: theme.silver1,
        backgroundColor: theme.white1,
      }}
    >
      <div className="flex gap-3">
        <ShimmerImage
          src={kajian.lecture_session_image_url || undefined}
          alt={kajian.lecture_session_title}
          className="w-36 h-36 object-cover rounded-l-xl"
          shimmerClassName="rounded-l-xl"
        />
        <div className="flex-1 text-sm p-2">
          <p className="text-xs font-semibold" style={{ color: theme.primary }}>
            {kajian.lecture_title}
          </p>
          <p
            className="font-semibold line-clamp-2 pt-2"
            style={{ color: theme.black1 }}
          >
            {kajian.lecture_session_title}
          </p>
          <p style={{ color: theme.silver2 }} className="pt-2">
            {kajian.lecture_session_teacher_name}
          </p>
          <p className="text-xs pt-1" style={{ color: theme.silver2 }}>
            <FormattedDate value={kajian.lecture_session_start_time} />
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PageHeaderUser title="Jadwal Kajian" backTo={`/masjid/${slug}`} />

      <div className="">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { label: "Kajian Mendatang", value: "mendatang" },
            { label: "Kajian Rutin", value: "rutin" },
          ]}
        />

        <TabsContent value="mendatang" current={tab}>
          {isLoading ? (
            <p className="p-4">Memuat jadwal kajian...</p>
          ) : kajianList && kajianList.length > 0 ? (
            <div className="space-y-4">{kajianList.map(renderCard)}</div>
          ) : (
            <p className="p-4">Belum ada jadwal kajian.</p>
          )}
        </TabsContent>

        <TabsContent value="rutin" current={tab}>
          {loadingRutin ? (
            <p className="p-4">Memuat jadwal rutin...</p>
          ) : jadwalRutin && jadwalRutin.length > 0 ? (
            <div className="space-y-4">{jadwalRutin.map(renderCardRutin)}</div>
          ) : (
            <p className="p-4">Belum ada jadwal rutin tersedia.</p>
          )}
        </TabsContent>
      </div>

      <BottomNavbar />
    </>
  );
}
