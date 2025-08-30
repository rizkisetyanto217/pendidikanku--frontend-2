// MasjidFullTransciptLecture.tsx

import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
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

export default function MasjidFullTransciptLecture() {
  const { slug = "", id = "" } = useParams();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<{
    data: LectureSession[];
    message: string;
  }>({
    queryKey: ["lectureTranscripts", id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-materials/filter-by-lecture-id?lecture_id=${id}&type=transcript`
      );
      return res.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <>
      <PageHeaderUser
        title="Tema Kajian Full Transkrip"
        onBackClick={() => {
          navigate(`/masjid/${slug}/tema/${id}`);
        }}
      />
      <div className="space-y-4 p-4 max-w-3xl mx-auto">
        {isLoading ? (
          <p style={{ color: theme.silver2 }}>Memuat data transkrip...</p>
        ) : (
          data?.data.map((session) => (
            <div
              key={session.lecture_session_id}
              className="rounded-xl p-4 border shadow-sm space-y-2"
              style={{
                borderColor: theme.silver2,
                backgroundColor: theme.white2,
              }}
              onClick={() =>
                navigate(
                  `/masjid/${slug}/soal-materi/${session.lecture_session_id}/materi-lengkap`,
                  { state: { from: location.pathname + location.search } } // ⬅️ kirim URL sekarang
                )
              }
            >
              <h3
                className="text-lg font-bold"
                style={{ color: theme.primary }}
              >
                {session.lecture_session_title.trim()}
              </h3>

              {session.materials.map((mat) => (
                <div
                  key={mat.lecture_sessions_material_id}
                  className="space-y-1 mt-2"
                >
                  <div
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: theme.black2 }}
                  >
                    {mat.lecture_sessions_material_transcript_full
                      ? mat.lecture_sessions_material_transcript_full
                      : "Belum ada transkrip lengkap untuk sesi ini."}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </>
  );
}
