import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

interface Teacher {
  id: string;
  name: string;
}

interface Lecture {
  lecture_id: string;
  lecture_title: string;
  lecture_description: string;
  lecture_image_url: string;
  lecture_teachers: Teacher[];
}

export default function MasjidInformationLecture() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { id, slug } = useParams<{ id: string; slug: string }>();

  const { data, isLoading, isError } = useQuery<{ lecture: Lecture }>({
    queryKey: ["lecture-theme-detail", id],
    queryFn: async () => {
      const res = await axios.get(`/public/lectures/${id}`);
      return res.data?.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const lecture = data?.lecture;

  return (
    <>
      <PageHeaderUser
        title="Tema Kajian Detail"
        onBackClick={() => {
          navigate(`/masjid/${slug}/tema/${id}`);
        }}
      />
      <div className="pt-4">
        {isLoading ? (
          <p className="text-sm text-silver-400">Memuat data...</p>
        ) : isError || !lecture ? (
          <p className="text-red-500 text-sm">Gagal memuat data tema kajian.</p>
        ) : (
          <div className="space-y-4">
            {lecture.lecture_image_url && (
              <img
                src={lecture.lecture_image_url}
                alt="Gambar Materi"
                className="w-full rounded-lg object-cover h-48"
              />
            )}

            <h2 className="text-xl font-semibold">{lecture.lecture_title}</h2>

            {Array.isArray(lecture.lecture_teachers) &&
              lecture.lecture_teachers.length > 0 && (
                <p className="text-sm" style={{ color: theme.silver2 }}>
                  <strong>Pengajar:</strong>{" "}
                  {[
                    ...new Set(lecture.lecture_teachers.map((t) => t.name)),
                  ].join(", ")}
                </p>
              )}

            <p className="text-sm" style={{ color: theme.silver2 }}>
              <strong>Jadwal:</strong> {lecture.lecture_description || "-"}
            </p>

            <p className="text-sm" style={{ color: theme.silver2 }}>
              <strong>Lokasi:</strong> Masjid At-Taqwa, Ciracas
            </p>

            <div className="text-sm" style={{ color: theme.silver2 }}>
              <strong>Deskripsi:</strong>
              <p className="mt-1 whitespace-pre-wrap">
                {lecture.lecture_description || "-"}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
