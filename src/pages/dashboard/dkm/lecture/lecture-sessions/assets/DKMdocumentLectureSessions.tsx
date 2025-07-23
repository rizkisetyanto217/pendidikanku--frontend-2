import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useNavigate, useParams } from "react-router-dom";
import ActionEditDelete from "@/components/common/main/MainActionEditDelete";
import toast from "react-hot-toast";
import SimpleTable from "@/components/common/main/SimpleTable";

interface LectureSessionsAsset {
  lecture_sessions_asset_id: string;
  lecture_sessions_asset_title: string;
  lecture_sessions_asset_file_url: string;
  lecture_sessions_asset_file_type: number;
  lecture_sessions_asset_file_type_label: string;
  lecture_sessions_asset_lecture_session_id: string;
  lecture_sessions_asset_masjid_id: string;
  lecture_sessions_asset_created_at: string;
}

export default function DKMDocumentLectureSessions() {
  const { id: lecture_session_id } = useParams();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();

  const {
    data: documents = [],
    isLoading,
    isError,
  } = useQuery<LectureSessionsAsset[]>({
    queryKey: ["lecture-sessions-documents", lecture_session_id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-assets/filter?lecture_session_id=${lecture_session_id}&file_type=3,4,5,6`
      );
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!lecture_session_id,
  });

  const handleDelete = async (doc: LectureSessionsAsset) => {
    const konfirmasi = confirm("Yakin ingin menghapus dokumen ini?");
    if (!konfirmasi) return;

    try {
      await axios.delete(
        `/api/a/lecture-sessions-assets/${doc.lecture_sessions_asset_id}`
      );
      toast.success("Dokumen berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus dokumen");
    }
  };

  const handleAdd = () => {
    navigate(
      `/dkm/kajian/kajian-detail/${lecture_session_id}/dokumen/tambah-edit`
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Dokumen" onBackClick={() => history.back()} />

      <div
        className="rounded-2xl shadow-sm p-2"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        <SimpleTable
          columns={["No", "Judul", "URL", "Format", "Aksi"]}
          rows={
            isLoading || isError
              ? []
              : documents.map((doc, index) => [
                  index + 1,
                  doc.lecture_sessions_asset_title,
                  <a
                    key={doc.lecture_sessions_asset_id}
                    href={doc.lecture_sessions_asset_file_url}
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: theme.primary }}
                  >
                    {doc.lecture_sessions_asset_file_url}
                  </a>,
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: theme.primary2,
                      color: theme.primary,
                    }}
                  >
                    {doc.lecture_sessions_asset_file_type_label}
                  </span>,
                  <ActionEditDelete
                    showEdit={true}
                    onDelete={() => handleDelete(doc)}
                    onEdit={() =>
                      navigate(
                        `/dkm/kajian/kajian-detail/${lecture_session_id}/dokumen/tambah-edit/${doc.lecture_sessions_asset_id}`
                      )
                    }
                  />,
                ])
          }
          emptyText={
            isLoading
              ? "Memuat dokumen..."
              : isError
                ? "❌ Gagal memuat dokumen."
                : "Belum ada dokumen."
          }
        />
      </div>

      <div className="text-right">
        <button
          onClick={handleAdd}
          className="px-5 py-2 rounded-lg font-semibold"
          style={{ backgroundColor: theme.primary, color: theme.white1 }}
        >
          + Tambah Dokumen
        </button>
      </div>
    </div>
  );
}
