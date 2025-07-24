import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useParams, useNavigate } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import SimpleTable from "@/components/common/main/SimpleTable";
import FormattedDate from "@/constants/formattedDate";
import { ExternalLink } from "lucide-react";

interface DocumentAsset {
  lecture_sessions_asset_id: string;
  lecture_sessions_asset_title: string;
  lecture_sessions_asset_file_url: string;
  lecture_sessions_asset_file_type_label: string;
  lecture_sessions_asset_created_at: string;
  lecture_sessions_asset_lecture_session_id: string;
}

export default function DKMDocumentLecture() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const { id: lecture_id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery<DocumentAsset[]>({
    queryKey: ["lecture-documents", lecture_id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-assets/filter?lecture_id=${lecture_id}&file_type=3,4,5,6`
      );
      return res.data;
    },
    enabled: !!lecture_id,
    staleTime: 5 * 60 * 1000,
  });

  const columns = ["No", "Judul", "Tipe", "Tanggal", "Aksi"];
  const rows =
    data?.map((item, index) => [
      index + 1,
      item.lecture_sessions_asset_title,
      item.lecture_sessions_asset_file_type_label,
      <FormattedDate
        key={item.lecture_sessions_asset_id}
        value={item.lecture_sessions_asset_created_at}
      />,
      <button
        key={item.lecture_sessions_asset_id + "_action"}
        onClick={(e) => {
          e.stopPropagation();
          navigate(
            `/dkm/kajian/kajian-detail/${item.lecture_sessions_asset_lecture_session_id}/dokumen`,
            {
              state: { from: location.pathname },
            }
          );
        }}
        className="p-1"
      >
        <ExternalLink size={16} style={{ color: theme.black1 }} />
      </button>,
    ]) || [];

  const handleRowClick = (index: number) => {
    const selected = data?.[index];
    if (!selected) return;
    navigate(
      `/dkm/kajian/kajian-detail/${selected.lecture_sessions_asset_lecture_session_id}/dokumen`
    );
  };

  return (
    <div className="p-4 pb-24">
      <PageHeader title="Dokumen Kajian" onBackClick={() => navigate(-1)} />

      {isLoading ? (
        <p className="text-sm text-gray-500">Memuat data dokumen...</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Gagal memuat data dokumen.</p>
      ) : (
        <SimpleTable
          columns={columns}
          rows={rows}
          onRowClick={handleRowClick}
          emptyText="Belum ada dokumen tersedia."
        />
      )}
    </div>
  );
}
