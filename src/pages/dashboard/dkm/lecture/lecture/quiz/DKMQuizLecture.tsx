import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useParams, useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import SimpleTable from "@/components/common/main/SimpleTable";
import FormattedDate from "@/constants/formattedDate";
import { ExternalLink } from "lucide-react";

interface LectureQuiz {
  lecture_sessions_quiz_id: string;
  lecture_sessions_quiz_title: string;
  lecture_sessions_quiz_description: string;
  lecture_sessions_quiz_lecture_session_id: string;
  lecture_sessions_quiz_created_at: string;
}

export default function DKMQuizLecture() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const { id: lecture_id } = useParams();

  const { data, isLoading, isError } = useQuery<LectureQuiz[]>({
    queryKey: ["lecture-quiz", lecture_id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-quiz/by-lecture/${lecture_id}`
      );
      console.log("📡 Quiz data:", res.data);
      return res.data.data;
    },
    enabled: !!lecture_id,
    staleTime: 5 * 60 * 1000,
  });

  const columns = ["No", "Judul Quiz", "Deskripsi", "Tanggal Buat", "Aksi"];

  const rows =
    data?.map((quiz, index) => [
      index + 1,
      quiz.lecture_sessions_quiz_title,
      quiz.lecture_sessions_quiz_description || "-",
      <FormattedDate
        key={quiz.lecture_sessions_quiz_id}
        value={quiz.lecture_sessions_quiz_created_at}
      />,
      <button
        key={`btn-${quiz.lecture_sessions_quiz_id}`}
        onClick={(e) => {
          e.stopPropagation();
          navigate(
            `/dkm/kajian/kajian-detail/${quiz.lecture_sessions_quiz_lecture_session_id}/latihan-soal`,
            {
              state: { from: location.pathname },
            }
          );
        }}
        className="flex items-center gap-1 text-sm underline"
        style={{ color: theme.primary }}
      >
        <ExternalLink size={16} style={{ color: theme.black1 }} />{" "}
      </button>,
    ]) || [];

  const handleRowClick = (index: number) => {
    const selected = data?.[index];
    if (!selected) return;
    navigate(
      `/dkm/kajian/kajian-detail/${selected.lecture_sessions_quiz_lecture_session_id}/latihan-soal`
    );
  };

  return (
    <div className="pb-24">
      <PageHeader title="Daftar Quiz Kajian" onBackClick={() => navigate(-1)} />

      {isLoading ? (
        <p className="text-sm text-gray-500">Memuat data quiz...</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Gagal memuat data quiz.</p>
      ) : (
        <SimpleTable
          columns={columns}
          rows={rows}
          onRowClick={handleRowClick}
          emptyText="Belum ada quiz tersedia."
        />
      )}
    </div>
  );
}
