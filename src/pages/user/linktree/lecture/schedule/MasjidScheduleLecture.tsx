import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useNavigate, useParams } from "react-router-dom";
import { colors } from "@/constants/colorsThema";
import FormattedDate from "@/constants/formattedDate";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

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

  const { data: kajianList, isLoading } = useQuery<Kajian[]>({
    queryKey: ["kajianList", slug],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-u/mendatang/${slug}`
      );
      console.log("📦 Data kajian terbaru dari endpoint:", res.data);
      return res.data?.data ?? [];
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  console.log("🎯 Hasil kajianList (dipakai untuk render):", kajianList);

  if (isLoading) return <p className="p-4">Memuat jadwal kajian...</p>;
  if (!kajianList || kajianList.length === 0)
    return <p className="p-4">Belum ada jadwal kajian.</p>;

  return (
    <div className="pb-20">
      <PageHeaderUser
        title="Jadwal Kajian"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <div className="space-y-4">
        {kajianList.map((kajian) => (
          <div
            key={kajian.lecture_session_id}
            onClick={() =>
              navigate(`/masjid/${slug}/kajian/${kajian.lecture_session_id}`)
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
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1 text-sm">
                <p
                  className="text-xs font-semibold"
                  style={{ color: theme.primary }}
                >
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
        ))}
      </div>
    </div>
  );
}
