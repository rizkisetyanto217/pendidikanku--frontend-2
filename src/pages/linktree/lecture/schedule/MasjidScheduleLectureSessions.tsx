import React, { useState } from "react";
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

interface Kajian {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_start_time: string;
  lecture_session_teacher_name: string;
  lecture_title: string;
  lecture_session_image_url: string;
}

export default function MasjidScheduleLecture() {
  const { slug } = useParams<{ slug: string }>();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const [tab, setTab] = useState("mendatang");

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

  const dummyRutin: Kajian[] = [
    {
      lecture_session_id: "rutin-1",
      lecture_session_title: "Kajian Rutin Tafsir Al-Qur'an",
      lecture_session_start_time: new Date().toISOString(),
      lecture_session_teacher_name: "Ustadz Dummy",
      lecture_title: "Tafsir Harian",
      lecture_session_image_url: "/placeholder.jpg",
    },
  ];

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
      <div className="flex gap-3 p-3">
        <img
          src={kajian.lecture_session_image_url}
          alt={kajian.lecture_session_title}
          className="w-36 h-36 object-cover rounded"
        />
        <div className="flex-1 text-sm">
          <p className="text-xs font-semibold" style={{ color: theme.primary }}>
            {kajian.lecture_title}
          </p>
          <p
            className="font-semibold line-clamp-2"
            style={{ color: theme.black1 }}
          >
            {kajian.lecture_session_title}
          </p>
          <p style={{ color: theme.silver2 }}>
            {kajian.lecture_session_teacher_name}
          </p>
          <p className="text-xs" style={{ color: theme.silver2 }}>
            <FormattedDate value={kajian.lecture_session_start_time} />
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PublicNavbar masjidName="Jadwal Kajian" />

      <div className="pt-20 px-4 space-y-4">
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
          <div className="space-y-4">{dummyRutin.map(renderCard)}</div>
        </TabsContent>
      </div>

      <BottomNavbar />
    </>
  );
}
