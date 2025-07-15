import {
  BookOpen,
  FileText,
  Home,
  PlayCircle,
  StickyNote,
  Video,
} from "lucide-react";

export default function DKMDetailLecture() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        <button className="text-teal-600 hover:text-teal-800">←</button>
        Kajian Terbaru
      </div>

      {/* Kartu Kajian */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex flex-col lg:flex-row gap-4">
        {/* Gambar */}
        <img
          src="/mock/kajian.jpg"
          alt="Poster Kajian"
          className="w-full lg:w-40 h-40 object-cover rounded-md"
        />

        {/* Konten */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-teal-700">
            Fiqh Waris | Hukum Pembagian Jatah Anak
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            2 Juni 2024 Pukul 20.00 WIB / Aula utama Masjid
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 font-medium">
            Ustadz Abdullah, MA
          </p>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry...
          </p>

          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-500 dark:text-gray-300">
              👤 40 peserta
            </span>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-semibold">
              Soal & Materi tersedia
            </span>
          </div>
        </div>
      </div>

      {/* Navigasi Utama */}
      <div>
        <h4 className="text-base font-semibold mb-3 text-gray-800 dark:text-white">
          Navigasi Utama
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: <Home size={24} />, label: "Informasi" },
            { icon: <Video size={24} />, label: "Video Pembelajaran" },
            { icon: <BookOpen size={24} />, label: "Latihan Soal" },
            { icon: <FileText size={24} />, label: "Materi Lengkap" },
            { icon: <StickyNote size={24} />, label: "Ringkasan" },
            { icon: <PlayCircle size={24} />, label: "Dokumentasi" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-teal-200 dark:border-teal-700 bg-white dark:bg-gray-800 hover:shadow transition"
            >
              <div className="text-teal-600 dark:text-teal-300">
                {item.icon}
              </div>
              <span className="text-sm mt-2 text-gray-700 dark:text-gray-200">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
