import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useOutletContext } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { ExternalLink, Trash2 } from "lucide-react";

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
  const session = useOutletContext<any>();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const {
    data: documents = [],
    isLoading,
    isError,
  } = useQuery<LectureSessionsAsset[]>({
    queryKey: ["lecture-sessions-documents", session?.lecture_session_id],
    queryFn: async () => {
      const res = await axios.get(
        `/api/a/lecture-sessions-assets/filter?lecture_session_id=${session?.lecture_session_id}&file_type=3,4,5,6`
      );
      return res.data;
    },
    enabled: !!session?.lecture_session_id,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Dokumen" onBackClick={() => history.back()} />

      <div className="overflow-x-auto rounded-2xl shadow-sm">
        <table
          className="w-full text-sm border"
          style={{ backgroundColor: theme.white1 }}
        >
          <thead
            className="text-left"
            style={{ backgroundColor: theme.success2 }}
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
                  {isLoading ? "Memuat dokumen..." : "Gagal memuat dokumen."}
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
                  <td className="px-4 py-2 font-medium text-sky-700">
                    {doc.lecture_sessions_asset_title}
                  </td>
                  <td className="px-4 py-2 truncate max-w-[250px]">
                    <a
                      href={doc.lecture_sessions_asset_file_url}
                      className="text-blue-600 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {doc.lecture_sessions_asset_file_url}
                    </a>
                  </td>
                  <td className="px-4 py-2">
                    <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {doc.lecture_sessions_asset_file_type_label}
                    </span>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <a
                      href={doc.lecture_sessions_asset_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Lihat"
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      title="Hapus"
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => {
                        if (confirm("Yakin ingin menghapus dokumen ini?")) {
                          console.log("Hapus", doc.lecture_sessions_asset_id);
                          // TODO: Tambahkan fungsi hapus
                        }
                      }}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-right">
        <button
          className="px-5 py-2 rounded-lg font-semibold"
          style={{ backgroundColor: theme.primary, color: theme.white1 }}
        >
          + Tambah Dokumen
        </button>
      </div>
    </div>
  );
}
