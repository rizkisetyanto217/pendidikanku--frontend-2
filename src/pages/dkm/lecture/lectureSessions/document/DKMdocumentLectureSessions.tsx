import { useOutletContext } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  FileText,
  CheckCircle,
  File,
  ExternalLink,
  Trash2,
} from "lucide-react";

// Dummy data contoh (gantikan nanti dengan API)
const documents = [
  {
    id: "1",
    title: "Hukum Pembagian Jatah Anak",
    description: "Penjelasan mengenai materi fiqih mawaris",
    format: "DOC",
    status: "Aktif",
  },
  {
    id: "2",
    title: "Kerja bakti persiapan Idul Adha (1)",
    description: "Penjelasan mengenai materi fiqih mawaris",
    format: "DOC",
    status: "Aktif",
  },
  {
    id: "3",
    title: "Kerja bakti persiapan Idul Adha (2)",
    description: "Penjelasan mengenai materi fiqih mawaris",
    format: "PDF",
    status: "Aktif",
  },
];

export default function DKMDocumentLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const session = useOutletContext<any>();

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
              <th className="px-4 py-2">Deskripsi</th>
              <th className="px-4 py-2">Format</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, index) => (
              <tr
                key={doc.id}
                className="border-t"
                style={{ borderColor: theme.silver1 }}
              >
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2 font-medium text-sky-700">
                  {doc.title}
                </td>
                <td className="px-4 py-2">{doc.description}</td>
                <td className="px-4 py-2">
                  <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {doc.format}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    {doc.status}
                  </span>
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    title="Lihat"
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ExternalLink size={16} />
                  </button>
                  <button
                    title="Hapus"
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
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
