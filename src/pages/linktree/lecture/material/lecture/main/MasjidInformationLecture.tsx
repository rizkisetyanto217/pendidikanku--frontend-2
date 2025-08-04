import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import ShimmerImage from "@/components/common/main/ShimmerImage";

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
        onBackClick={() => navigate(`/masjid/${slug}/tema/${id}`)}
      />

      <div className="lg:p-4">
        {isLoading ? (
          <p className="text-sm text-silver-400">Memuat data...</p>
        ) : isError || !lecture ? (
          <p className="text-red-500 text-sm">Gagal memuat data tema kajian.</p>
        ) : (
          <div
            className="rounded-xl overflow-hidden shadow-lg"
            style={{
              backgroundColor: theme.white2,
              borderColor: theme.silver2,
            }}
          >
            {lecture.lecture_image_url && (
              <ShimmerImage
                src={lecture.lecture_image_url}
                alt="Gambar Materi"
                className="w-full object-cover"
                style={{ aspectRatio: "4 / 5", maxHeight: "540px" }}
                shimmerClassName="rounded-md"
              />
            )}

            <div className="p-4 space-y-4">
              <h2
                className="text-xl font-semibold"
                style={{ color: theme.primary }}
              >
                {lecture.lecture_title}
              </h2>

              {lecture.lecture_teachers?.length > 0 && (
                <p className="text-sm" style={{ color: theme.black2 }}>
                  <strong>Pengajar:</strong>{" "}
                  {[
                    ...new Set(lecture.lecture_teachers.map((t) => t.name)),
                  ].join(", ")}
                </p>
              )}

              <p className="text-sm" style={{ color: theme.black2 }}>
                <strong>Jadwal:</strong> {lecture.lecture_description || "-"}
              </p>

              <p className="text-sm" style={{ color: theme.black2 }}>
                <strong>Lokasi:</strong> Masjid At-Taqwa, Ciracas
              </p>

              <div className="text-sm" style={{ color: theme.black2 }}>
                <strong>Deskripsi:</strong>
                <p className="mt-1 whitespace-pre-wrap">
                  {lecture.lecture_description || "-"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
