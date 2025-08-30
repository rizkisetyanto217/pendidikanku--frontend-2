import PageHeader from "@/components/common/home/PageHeaderDashboard";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "@/lib/axios";
import { useEffect, useState } from "react";
import RichEditor from "@/components/common/main/RichEditor";

export default function DKMAddEditFullTransciptLectureSessions() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: lecture_session_id } = useParams();
  const { state: session } = useLocation();
  const [content, setContent] = useState("");

  const { data: materialData, isLoading } = useQuery({
    queryKey: ["lecture-session-transcript", lecture_session_id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-materials/filter?lecture_session_id=${lecture_session_id}&type=transcript`
      );
      return res?.data?.data?.[0] ?? null;
    },
    enabled: !!lecture_session_id,
  });

  useEffect(() => {
    if (materialData?.lecture_sessions_material_transcript_full) {
      setContent(materialData.lecture_sessions_material_transcript_full);
    }
  }, [materialData]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        lecture_sessions_material_type: "transcript",
        lecture_sessions_material_transcript_full: content,
        lecture_sessions_material_lecture_session_id: lecture_session_id,
      };

      if (materialData?.lecture_sessions_material_id) {
        return axios.put(
          `/api/a/lecture-sessions-materials/${materialData.lecture_sessions_material_id}`,
          payload
        );
      } else {
        return axios.post(`/api/a/lecture-sessions-materials`, payload);
      }
    },
    onSuccess: () => {
      if (lecture_session_id) {
        queryClient.invalidateQueries({
          queryKey: ["lecture-session-transcript", lecture_session_id],
        });
      }
      navigate(-1);
    },
    onError: (err) => {
      console.error("❌ Gagal simpan transcript:", err);
    },
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title={materialData ? "Edit Materi Lengkap" : "Tambah Materi Lengkap"}
        onBackClick={() => history.back()}
      />

      <div
        className="p-4 rounded-2xl shadow-sm"
        style={{ backgroundColor: theme.white1 }}
      >
        <RichEditor
          value={content}
          onChange={setContent}
          placeholder="Tulis materi kajian secara lengkap..."
          label="Materi Lengkap"
        />

        <div className="mt-6 text-right">
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="px-6 py-2 rounded-lg font-semibold"
            style={{
              backgroundColor: theme.primary,
              color: theme.white1,
              opacity: mutation.isPending ? 0.6 : 1,
            }}
          >
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
