import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useNavigate, useParams } from "react-router-dom";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

interface Material {
  lecture_sessions_material_id: string;
  lecture_sessions_material_summary: string;
  lecture_sessions_material_transcript_full: string;
  lecture_sessions_material_created_at: string;
}

interface LectureSession {
  lecture_session_id: string;
  lecture_session_title: string;
  materials: Material[];
}

const fetchSummaries = async (lectureId: string) => {
  const res = await axios.get(
    `/public/lecture-sessions-materials/filter-by-lecture-id?lecture_id=${lectureId}&type=summary`
  );
  return res.data;
};

export default function MasjidSummaryLecture() {
  const { slug = "", id = "" } = useParams();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<{
    data: LectureSession[];
    message: string;
  }>({
    queryKey: ["lectureSummaries", id],
    queryFn: () => fetchSummaries(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const renderSessionCard = (session: LectureSession) => (
    <div
      key={session.lecture_session_id}
      className="rounded-xl p-4 border shadow-sm space-y-2"
      style={{
        borderColor: theme.silver2,
        backgroundColor: theme.white2,
      }}
      onClick={() =>
        navigate(
          `/masjid/${slug}/soal-materi/${session.lecture_session_id}/ringkasan`,
          { state: { from: location.pathname + location.search } } // ⬅️ kirim URL sekarang
        )
      }
    >
      <h3 className="text-md font-bold" style={{ color: theme.primary }}>
        {session.lecture_session_title.trim()}
      </h3>

      {session.materials.length > 0 ? (
        session.materials.map((mat) => (
          <div
            key={mat.lecture_sessions_material_id}
            className="text-sm leading-relaxed whitespace-pre-wrap mt-1"
            style={{ color: theme.black2 }}
          >
            {mat.lecture_sessions_material_summary.trim()}
          </div>
        ))
      ) : (
        <p className="text-sm italic" style={{ color: theme.silver2 }}>
          Belum ada ringkasan untuk sesi ini.
        </p>
      )}
    </div>
  );

  return (
    <>
      <PageHeaderUser
        title="Tema Kajian Ringkasan"
        onBackClick={() => navigate(`/masjid/${slug}/tema/${id}`)}
      />

      <div className="space-y-4 p-4 max-w-3xl mx-auto">
        {isLoading ? (
          <p style={{ color: theme.silver2 }}>Memuat ringkasan kajian...</p>
        ) : data?.data?.length ? (
          data.data.map(renderSessionCard)
        ) : (
          <p style={{ color: theme.silver2 }}>
            Belum ada sesi kajian yang memiliki ringkasan.
          </p>
        )}
      </div>
    </>
  );
}
