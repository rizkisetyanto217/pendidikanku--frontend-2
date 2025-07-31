import PageHeader from "@/components/common/home/PageHeaderDashboard";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "@/lib/axios";
import { useEffect, useState } from "react";
import RichEditor from "@/components/common/main/RichEditor";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function DKMAddEditSummaryLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { id: lecture_session_id } = useParams();
  const { state } = useLocation();
  const from = state?.from || -1;

  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  // 🔑 Ambil masjid_id dari cookie (admin_ids)
  const { user, isLoading: userLoading } = useCurrentUser();
  const masjid_id = user?.masjid_admin_ids?.[0];

  // 🔍 Ambil ringkasan jika ada
  const { data: materialData, isLoading: materialLoading } = useQuery({
    queryKey: ["lecture-session-summary", lecture_session_id],
    queryFn: async () => {
      const url = `/public/lecture-sessions-materials/filter?lecture_session_id=${lecture_session_id}&type=summary`;
      const res = await axios.get(url);
      return res.data?.data?.[0] ?? null;
    },
    enabled: !!lecture_session_id,
  });

  // console.log("📦 Material Data:", masjid_id)

  // 📝 Set initial content saat edit
  useEffect(() => {
    if (materialData?.lecture_sessions_material_summary) {
      setContent(materialData.lecture_sessions_material_summary);
    }
  }, [materialData]);

  // 💾 Simpan (create / update)
  const mutation = useMutation({
    mutationFn: async () => {
      if (!masjid_id || !lecture_session_id) {
        throw new Error("Masjid ID atau Sesi Kajian belum tersedia.");
      }

      const payload = {
        lecture_sessions_material_summary: content,
        lecture_sessions_material_lecture_session_id: lecture_session_id,
        lecture_sessions_material_masjid_id: masjid_id,
      };

      if (materialData?.lecture_sessions_material_id) {
        return axios.put(
          `/api/a/lecture-sessions-materials/${materialData.lecture_sessions_material_id}`,
          payload
        );
      }

      return axios.post(`/api/a/lecture-sessions-materials`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lecture-session-summary", lecture_session_id],
      });
      navigate(-1);
    },
    onError: (err: any) => {
      console.error("❌ Gagal simpan ringkasan:");
      console.error("🔴 Error Message:", err?.message);
      console.error("🔴 Status:", err?.response?.status);
      console.error("🔴 Response Data:", err?.response?.data);
    },
  });

  // ⏳ Loading state
  if (userLoading || materialLoading) return <div>Memuat data...</div>;
  if (!masjid_id)
    return <div className="text-red-500">Masjid ID tidak ditemukan.</div>;

  return (
    <div className="space-y-4">
      <PageHeader
        title={materialData ? "Edit Ringkasan" : "Tambah Ringkasan"}
        onBackClick={() =>
          typeof from === "string" ? navigate(from) : navigate(-1)
        }
      />

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
  );
}
