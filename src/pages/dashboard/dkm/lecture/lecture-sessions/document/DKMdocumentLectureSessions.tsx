import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { ExternalLink, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ActionEditDelete from "@/components/common/main/MainActionEditDelete";
import toast from "react-hot-toast";

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
        `/api/a/lecture-sessions-assets/filter?lecture_session_id=${lecture_session_id}&file_type=3,4,5,6`
      );
      console.log("✅ Dokumen berhasil diambil:", res.data);
      return res.data;
    },
    select: (data) => (Array.isArray(data) ? data : []),
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
      console.error("❌ Gagal menghapus dokumen:", error);
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
        className="overflow-x-auto rounded-2xl shadow-sm"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        <table className="w-full text-sm">
          <thead
            className="text-left"
            style={{ backgroundColor: theme.success2, color: theme.black1 }}
          >
            <tr>
              <th className="px-4 py-2">No</th>
              <th className="px-4 py-2">Judul</th>
              <th className="px-4 py-2">URL</th>
              <th className="px-4 py-2">Format</th>
              <th className="px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading || isError ? (
              <tr>
                <td colSpan={5} className="px-4 py-2 text-center">
                  {isLoading ? "Memuat dokumen..." : "❌ Gagal memuat dokumen."}
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-2 text-center">
                  Belum ada dokumen.
                </td>
              </tr>
            ) : (
              documents.map((doc, index) => (
                <tr
                  key={doc.lecture_sessions_asset_id}
                  className="border-t"
                  style={{ borderColor: theme.silver1 }}
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td
                    className="px-4 py-2 font-medium truncate"
                    style={{ color: theme.quaternary }}
                  >
                    {doc.lecture_sessions_asset_title}
                  </td>
                  <td className="px-4 py-2 truncate max-w-[250px]">
                    <a
                      href={doc.lecture_sessions_asset_file_url}
                      className="underline"
                      style={{ color: theme.primary }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {doc.lecture_sessions_asset_file_url}
                    </a>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: theme.primary2,
                        color: theme.primary,
                      }}
                    >
                      {doc.lecture_sessions_asset_file_type_label}
                    </span>
                  </td>
                  <td className="px-4 py-2 space-x-2 flex items-center gap-2">
                

                    <ActionEditDelete
                      showEdit={true}
                      onDelete={() => handleDelete(doc)}
                      onEdit={() =>
                        navigate(
                          `/dkm/kajian/kajian-detail/${lecture_session_id}/dokumen/tambah-edit/${doc.lecture_sessions_asset_id}`
                        )
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
