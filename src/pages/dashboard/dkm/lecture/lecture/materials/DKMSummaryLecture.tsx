import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import axios from "@/lib/axios";
import SimpleTable from "@/components/common/main/SimpleTable";
import { ExternalLink } from "lucide-react";

interface Summary {
  lecture_sessions_material_id: string;
  lecture_sessions_material_title: string;
  lecture_sessions_material_summary: string;
  lecture_sessions_material_created_at: string;
  lecture_sessions_material_lecture_session_id: string; // ✅ tambahkan field ini
}

export default function DKMSummaryLecture() {
  const { id } = useParams(); // lecture_id
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading, isError } = useQuery<Summary[]>({
    queryKey: ["lecture-sessions-summary", id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-materials/filter?lecture_id=${id}&type=summary`
      );
      return res.data.data;
    },
    enabled: !!id,
  });

  const columns = ["No", "Judul", "Deskripsi", "Status", "Aksi"];

  const rows =
    data?.map((item, index) => [
      index + 1,
      item.lecture_sessions_material_title,
      item.lecture_sessions_material_summary || "-",
      <span
        key={`status-${item.lecture_sessions_material_id}`}
        className="px-2 py-1 text-xs rounded-full font-semibold"
        style={{
          backgroundColor: "#DEF7EC",
          color: "#03543F",
        }}
      >
        Aktif
      </span>,
      <button
        key={`btn-${item.lecture_sessions_material_id}`}
        className="p-1"
        onClick={(e) => {
          e.stopPropagation();
          const sessionId = item.lecture_sessions_material_lecture_session_id;
          if (sessionId) {
            navigate(`/dkm/kajian/kajian-detail/${sessionId}/ringkasan`, {
              state: { from: location.pathname },
            });
          } else {
            alert("ID sesi kajian tidak ditemukan.");
          }
        }}
      >
        <ExternalLink size={16} style={{ color: theme.black1 }} />
      </button>,
    ]) || [];

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Ringkasan Kajian"
        backTo={`/dkm/tema/tema-detail/${id}`}
      />

      {isLoading ? (
        <p className="text-sm text-gray-500">Memuat data ringkasan...</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Gagal memuat data ringkasan.</p>
      ) : (
        <SimpleTable
          columns={columns}
          rows={rows}
          emptyText="Belum ada ringkasan kajian tersedia."
        />
      )}
    </div>
  );
}
