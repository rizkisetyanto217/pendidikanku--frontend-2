import PageHeader from "@/components/common/home/PageHeaderDashboard";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "@/lib/axios";
import { useEffect, useState } from "react";
import RichEditor from "@/components/common/main/RichEditor";

export default function DKMAddEditSummaryLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { id: lecture_session_id } = useParams();
  const { state: session } = useLocation();
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  // Ambil data summary jika ada
  const { data: materialData, isLoading } = useQuery({
    queryKey: ["lecture-session-summary", lecture_session_id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-materials/filter?lecture_session_id=${lecture_session_id}&type=summary`
      );
      return res?.data?.data?.[0] ?? null;
    },
    enabled: !!lecture_session_id,
  });

  // Isi konten awal jika sedang edit
  useEffect(() => {
    if (materialData?.lecture_sessions_material_summary) {
      setContent(materialData.lecture_sessions_material_summary);
    }
  }, [materialData]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        lecture_sessions_material_type: "summary",
        lecture_sessions_material_summary: content,
        lecture_sessions_material_lecture_session_id: lecture_session_id,
      };

      if (materialData?.lecture_sessions_material_id) {
        // Edit (PUT)
        return axios.put(
          `/api/a/lecture-sessions-materials/${materialData.lecture_sessions_material_id}`,
          payload
        );
      } else {
        // Tambah baru (POST)
        return axios.post(`/api/a/lecture-sessions-materials`, payload);
      }
    },
    onSuccess: () => {
      if (lecture_session_id) {
        queryClient.invalidateQueries({
          queryKey: ["lecture-session-summary", lecture_session_id],
        });
      }
      navigate(-1);
    },

    onError: (err) => {
      console.error("❌ Gagal simpan ringkasan:", err);
    },
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title={materialData ? "Edit Ringkasan" : "Tambah Ringkasan"}
        onBackClick={() => history.back()}
      />

      <div
        className="p-4 rounded-2xl shadow-sm"
        style={{ backgroundColor: theme.white1 }}
      >
        <RichEditor
          value={content}
          onChange={setContent}
          placeholder="Tulis ringkasan kajian di sini..."
          label="Ringkasan Kajian"
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
