import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import ShimmerImage from "@/components/common/main/ShimmerImage";
import { FileText, MapPin, BarChartHorizontal } from "lucide-react"; // ✅ lucide icons

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

interface UserProgress {
  grade_result?: number;
  total_completed_sessions?: number;
  is_registered?: boolean;
  has_paid?: boolean;
  paid_amount?: number | null;
  payment_time?: string | null;
}

export default function MasjidInformationLecture() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { slug: masjidSlug, lecture_slug } = useParams<{
    slug: string;
    lecture_slug: string;
  }>();

  const { data, isLoading, isError } = useQuery<{
    lecture: Omit<Lecture, "lecture_teachers">;
    lecture_teachers: Teacher[];
    user_progress?: UserProgress;
  }>({
    queryKey: ["lecture-by-slug", lecture_slug],
    queryFn: async () => {
      const res = await axios.get(`/public/lectures/by-slug/${lecture_slug}`);
      return res.data?.data;
    },
    enabled: !!lecture_slug,
    staleTime: 5 * 60 * 1000,
  });

  const lecture: Lecture | undefined = data
    ? { ...data.lecture, lecture_teachers: data.lecture_teachers || [] }
    : undefined;

  const userProgress = data?.user_progress;

  return (
    <>
      <PageHeaderUser
        title="Tema Kajian"
        onBackClick={() =>
          navigate(`/masjid/${masjidSlug}/tema/${lecture_slug}`)
        }
      />

      <div className="lg:p-4">
        {isLoading ? (
          <p className="text-sm text-silver-400">Memuat data...</p>
        ) : isError || !lecture ? (
          <p className="text-red-500 text-sm">Gagal memuat data tema kajian.</p>
        ) : (
          <div
            className="rounded-xl overflow-hidden shadow-lg flex flex-col lg:flex-row"
            style={{
              backgroundColor: theme.white2,
              borderColor: theme.silver2,
            }}
          >
            {/* Gambar */}
            {lecture.lecture_image_url && (
              <div className="lg:w-1/2 w-full">
                <ShimmerImage
                  src={lecture.lecture_image_url}
                  alt="Gambar Materi"
                  className="w-full object-cover h-full"
                  style={{ aspectRatio: "4 / 5", maxHeight: "540px" }}
                  shimmerClassName="rounded-none"
                />
              </div>
            )}

            {/* Konten */}
            <div className="p-4 space-y-4 lg:w-1/2">
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

              {/* Deskripsi dengan ikon */}
              <div
                className="flex items-start gap-2 text-sm"
                style={{ color: theme.black2 }}
              >
                <FileText className="w-4 h-4 mt-1" />
                <div>
                  <strong>Deskripsi:</strong>
                  <p className="mt-1 whitespace-pre-wrap">
                    {lecture.lecture_description || "-"}
                  </p>
                </div>
              </div>

              {/* Lokasi dengan ikon */}
              <div
                className="flex items-start gap-2 text-sm"
                style={{ color: theme.black2 }}
              >
                <MapPin className="w-4 h-4 mt-1" />
                <p>
                  <strong>Lokasi:</strong> Masjid At-Taqwa, Ciracas
                </p>
              </div>

              {/* Progress dengan ikon */}
              {userProgress && (
                <div className="pt-2 border-t border-gray-300 dark:border-zinc-600">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChartHorizontal
                      className="w-4 h-4"
                      style={{ color: theme.black2 }}
                    />
                    <p
                      className="text-sm font-semibold"
                      style={{ color: theme.black2 }}
                    >
                      Progress Belajar:
                    </p>
                  </div>
                  <ul
                    className="text-sm list-disc ml-5"
                    style={{ color: theme.black2 }}
                  >
                    <li>Nilai Akhir: {userProgress.grade_result ?? "-"}</li>
                    <li>
                      Sesi Selesai: {userProgress.total_completed_sessions ?? 0}
                    </li>
                    <li>
                      Terdaftar: {userProgress.is_registered ? "Ya" : "Belum"}
                    </li>
                    <li>
                      Pembayaran: {userProgress.has_paid ? "Lunas" : "Belum"}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
