// src/pages/sekolahislamku/pengumuman/AllAnnouncementTeacher.tsx
import React, { useState, useMemo } from "react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";


import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

// Types dan Interfaces
type PriorityLevel = "Rendah" | "Sedang" | "Tinggi" | "Urgent";
type CategoryType = "Tahfidz" | "Tahsin" | "Kajian" | "Umum";
type StatusType = "Aktif" | "Berakhir" | "Draft";

interface Pengumuman {
  id: number;
  judul: string;
  konten: string;
  kategori: CategoryType;
  prioritas: PriorityLevel;
  status: StatusType;
  tanggalPublish: string;
  tanggalBerakhir?: string;
  penulis: string;
  target: string[];
  lampiran?: string[];
  views: number;
  isPinned: boolean;
  tags: string[];
}

interface FilterOptions {
  kategori: string;
  prioritas: string;
  status: string;
  searchQuery: string;
}

// Komponen untuk Priority Badge
interface PriorityBadgeProps {
  prioritas: PriorityLevel;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ prioritas }) => {
  const getPriorityStyle = (): string => {
    switch (prioritas) {
      case "Urgent":
        return "bg-red-100 text-red-800 border-red-300 animate-pulse";
      case "Tinggi":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Sedang":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Rendah":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getIcon = (): string => {
    switch (prioritas) {
      case "Urgent":
        return "🚨";
      case "Tinggi":
        return "⚠️";
      case "Sedang":
        return "📌";
      case "Rendah":
        return "📝";
      default:
        return "📝";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityStyle()}`}
    >
      <span>{getIcon()}</span>
      {prioritas}
    </span>
  );
};

// Komponen untuk Category Badge
interface CategoryBadgeProps {
  kategori: CategoryType;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ kategori }) => {
  const getCategoryStyle = (): string => {
    switch (kategori) {
      case "Tahfidz":
        return "bg-green-100 text-green-800 border-green-300";
      case "Tahsin":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Kajian":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Umum":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getIcon = (): string => {
    switch (kategori) {
      case "Tahfidz":
        return "📖";
      case "Tahsin":
        return "🎵";
      case "Kajian":
        return "🕌";
      case "Umum":
        return "📢";
      default:
        return "📢";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getCategoryStyle()}`}
    >
      <span>{getIcon()}</span>
      {kategori}
    </span>
  );
};

// Komponen untuk Status Badge
interface StatusBadgeProps {
  status: StatusType;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyle = (): string => {
    switch (status) {
      case "Aktif":
        return "bg-green-100 text-green-800 border-green-300";
      case "Berakhir":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "Draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle()}`}
    >
      {status}
    </span>
  );
};

// Komponen untuk Pengumuman Card
interface PengumumanCardProps {
  pengumuman: Pengumuman;
  palette: Palette;
  onDetailClick: (pengumuman: Pengumuman) => void;
}

const PengumumanCard: React.FC<PengumumanCardProps> = ({
  pengumuman,
  palette,
  onDetailClick,
}) => {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateContent = (
    content: string,
    maxLength: number = 150
  ): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const isExpiringSoon = (): boolean => {
    if (!pengumuman.tanggalBerakhir) return false;
    const expireDate = new Date(pengumuman.tanggalBerakhir);
    const now = new Date();
    const diffTime = expireDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  return (
    <SectionCard
      palette={palette}
      className={`p-0 overflow-hidden transition-all duration-200 hover:shadow-lg ${
        pengumuman.isPinned ? "ring-2 ring-blue-200 bg-blue-50/50" : ""
      }`}
    >
      <div className="p-5">
        {/* Header dengan Pin dan Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {pengumuman.isPinned && (
              <div className="text-blue-600">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 3a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 14.846 4.632 17 6.414 17H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l2-4A1 1 0 0016 9H6.28l-.22-.89A1 1 0 005 8H4a1 1 0 01-1-1V3z" />
                </svg>
              </div>
            )}
            <CategoryBadge kategori={pengumuman.kategori} />
            <PriorityBadge prioritas={pengumuman.prioritas} />
            <StatusBadge status={pengumuman.status} />
          </div>
          {isExpiringSoon() && (
            <div className="text-orange-600 text-xs font-medium px-2 py-1 bg-orange-100 rounded">
              Akan berakhir
            </div>
          )}
        </div>

        {/* Judul */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold mb-1 line-clamp-2 ">
            {pengumuman.judul}
          </h3>
          <div className="flex items-center gap-4 text-sm opacity-70">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{pengumuman.penulis}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{formatDate(pengumuman.tanggalPublish)}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{pengumuman.views} views</span>
            </div>
          </div>
        </div>

        {/* Konten */}
        <div className="mb-4">
          <p className="text-sm leading-relaxed opacity-90">
            {truncateContent(pengumuman.konten)}
          </p>
        </div>

        {/* Target dan Tags */}
        <div className="space-y-3 mb-4">
          <div>
            <p className="text-xs font-semibold opacity-60 mb-1">
              TARGET PESERTA
            </p>
            <div className="flex flex-wrap gap-1">
              {pengumuman.target.map((target, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    background: palette.white1,
                    border: `1px solid ${palette.silver1}`,
                    color: palette.black1,
                  }}
                >
                  {target}
                </span>
              ))}
            </div>
          </div>

          {pengumuman.tags.length > 0 && (
            <div>
              <p className="text-xs font-semibold opacity-60 mb-1">TAGS</p>
              <div className="flex flex-wrap gap-1">
                {pengumuman.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lampiran */}
        {pengumuman.lampiran && pengumuman.lampiran.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold opacity-60 mb-2">LAMPIRAN</p>
            <div className="flex flex-wrap gap-2">
              {pengumuman.lampiran.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                  style={{
                    background: palette.white1,
                    border: `1px solid ${palette.silver1}`,
                  }}
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{file}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer dengan berakhir dan aksi */}
        <div
          className="flex items-center justify-between pt-4 border-t"
          style={{ borderColor: palette.silver1 }}
        >
          <div className="text-xs opacity-60">
            {pengumuman.tanggalBerakhir && (
              <span>Berakhir: {formatDate(pengumuman.tanggalBerakhir)}</span>
            )}
          </div>
          <button
            onClick={() => onDetailClick(pengumuman)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:opacity-80"
            style={{
              background: palette.black1,
              color: palette.white1,
            }}
          >
            Baca Selengkapnya
          </button>
        </div>
      </div>
    </SectionCard>
  );
};

// Komponen untuk Search dan Filter
interface SearchFilterProps {
  palette: Palette;
  filters: FilterOptions;
  onFiltersChange: (filters: Partial<FilterOptions>) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  palette,
  filters,
  onFiltersChange,
}) => {
  return (
    <SectionCard palette={palette} className="p-4">
      <div className="space-y-4">
        {/* Search Bar */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari pengumuman..."
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                background: palette.white1,
                borderColor: palette.silver1,
                color: palette.black1,
              }}
            />
          </div>
        </div>

        {/* Filter Options */}
        <div className="flex flex-col md:flex-row gap-3">
          <select
            value={filters.kategori}
            onChange={(e) => onFiltersChange({ kategori: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              background: palette.white1,
              borderColor: palette.silver1,
              color: palette.black1,
            }}
          >
            <option value="">Semua Kategori</option>
            <option value="Tahfidz">📖 Tahfidz</option>
            <option value="Tahsin">🎵 Tahsin</option>
            <option value="Kajian">🕌 Kajian</option>
            <option value="Umum">📢 Umum</option>
          </select>

          <select
            value={filters.prioritas}
            onChange={(e) => onFiltersChange({ prioritas: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              background: palette.white1,
              borderColor: palette.silver1,
              color: palette.black1,
            }}
          >
            <option value="">Semua Prioritas</option>
            <option value="Urgent">🚨 Urgent</option>
            <option value="Tinggi">⚠️ Tinggi</option>
            <option value="Sedang">📌 Sedang</option>
            <option value="Rendah">📝 Rendah</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ status: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              background: palette.white1,
              borderColor: palette.silver1,
              color: palette.black1,
            }}
          >
            <option value="">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Berakhir">Berakhir</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>
    </SectionCard>
  );
};

// Komponen utama
const AllAnnouncementTeacher: React.FC = () => {
  const { isDark } = useHtmlDarkMode();
  const palette = (isDark ? colors.dark : colors.light) as Palette;

  const [filters, setFilters] = useState<FilterOptions>({
    kategori: "",
    prioritas: "",
    status: "",
    searchQuery: "",
  });

  // Data pengumuman sample
  const pengumumanList: Pengumuman[] = [
    {
      id: 1,
      judul: "Perubahan Jadwal Tahfidz Kelas 5-6",
      konten:
        "Assalamu'alaikum warahmatullahi wabarakatuh. Dengan ini kami informasikan bahwa terdapat perubahan jadwal tahfidz untuk kelas 5-6. Mulai hari Senin, 19 Agustus 2025, jadwal tahfidz akan dimulai pukul 07:00 WIB. Perubahan ini dilakukan untuk memberikan waktu persiapan yang lebih optimal bagi siswa. Mohon untuk semua wali murid dan siswa dapat menyesuaikan jadwal kehadiran.",
      kategori: "Tahfidz",
      prioritas: "Tinggi",
      status: "Aktif",
      tanggalPublish: "2025-08-15",
      tanggalBerakhir: "2025-08-30",
      penulis: "Ustadz Ahmad Fauzi",
      target: ["Kelas 5", "Kelas 6", "Wali Murid"],
      lampiran: ["Jadwal_Baru_Tahfidz.pdf"],
      views: 245,
      isPinned: true,
      tags: ["jadwal", "perubahan", "penting"],
    },
    {
      id: 2,
      judul: "Pendaftaran Kelas Tahsin Intensif",
      konten:
        "Dibuka pendaftaran kelas tahsin intensif untuk memperbaiki bacaan Al-Qur'an. Program ini khusus untuk siswa yang ingin meningkatkan kualitas tajwid dan kelancaran membaca. Kelas akan dimulai tanggal 25 Agustus 2025 dengan durasi 2 bulan. Tempat terbatas hanya untuk 20 siswa per kelas.",
      kategori: "Tahsin",
      prioritas: "Sedang",
      status: "Aktif",
      tanggalPublish: "2025-08-14",
      tanggalBerakhir: "2025-08-23",
      penulis: "Ustadzah Fatimah",
      target: ["Kelas 4-6", "Yang Berminat"],
      lampiran: ["Form_Pendaftaran_Tahsin.pdf", "Syarat_Ketentuan.pdf"],
      views: 189,
      isPinned: false,
      tags: ["pendaftaran", "tahsin", "intensif"],
    },
    {
      id: 3,
      judul: "Kajian Bulanan: Akhlak dalam Menuntut Ilmu",
      konten:
        "Kajian bulanan bulan Agustus akan membahas tema 'Akhlak dalam Menuntut Ilmu' yang akan dibawakan oleh Ustadz Dr. Muhammad Syafii. Kajian ini wajib diikuti oleh seluruh siswa kelas 5-6 dan terbuka untuk wali murid yang berkenan hadir. Acara akan dilaksanakan di aula utama sekolah.",
      kategori: "Kajian",
      prioritas: "Sedang",
      status: "Aktif",
      tanggalPublish: "2025-08-13",
      tanggalBerakhir: "2025-08-25",
      penulis: "Panitia Kajian",
      target: ["Kelas 5-6", "Wali Murid", "Guru"],
      views: 156,
      isPinned: false,
      tags: ["kajian", "akhlak", "bulanan"],
    },
    {
      id: 4,
      judul: "URGENT: Perbaikan Sistem Audio Masjid",
      konten:
        "Mohon perhatian seluruh civitas akademika. Sistem audio masjid sedang dalam perbaikan hari ini hingga besok. Kegiatan shalat berjamaah dan kajian sementara akan dipindahkan ke aula utama. Mohon maaf atas ketidaknyamanan ini.",
      kategori: "Umum",
      prioritas: "Urgent",
      status: "Aktif",
      tanggalPublish: "2025-08-15",
      tanggalBerakhir: "2025-08-17",
      penulis: "Bagian Sarana Prasarana",
      target: ["Semua"],
      views: 432,
      isPinned: true,
      tags: ["urgent", "masjid", "perbaikan"],
    },
    {
      id: 5,
      judul: "Hasil Evaluasi Tahfidz Semester Genap",
      konten:
        "Alhamdulillah, hasil evaluasi tahfidz semester genap telah selesai. Secara keseluruhan, 95% siswa berhasil mencapai target hafalan yang ditetapkan. Laporan detail dapat diakses melalui portal orang tua atau diminta langsung ke wali kelas masing-masing.",
      kategori: "Tahfidz",
      prioritas: "Rendah",
      status: "Berakhir",
      tanggalPublish: "2025-07-25",
      tanggalBerakhir: "2025-08-10",
      penulis: "Tim Evaluasi Tahfidz",
      target: ["Semua Kelas", "Wali Murid"],
      lampiran: ["Laporan_Evaluasi_Tahfidz.pdf"],
      views: 312,
      isPinned: false,
      tags: ["evaluasi", "hasil", "semester"],
    },
    {
      id: 6,
      judul: "Workshop Metode Mengajar Tahfidz Modern",
      konten:
        "Akan dilaksanakan workshop metode mengajar tahfidz modern untuk para ustadz dan ustadzah. Workshop ini menghadirkan narasumber dari Pondok Pesantren Al-Qur'an terkemuka. Peserta akan mendapat sertifikat dan materi pelatihan lengkap.",
      kategori: "Tahfidz",
      prioritas: "Sedang",
      status: "Aktif",
      tanggalPublish: "2025-08-12",
      tanggalBerakhir: "2025-08-28",
      penulis: "Bagian Pengembangan SDM",
      target: ["Guru Tahfidz", "Staff Akademik"],
      lampiran: ["Rundown_Workshop.pdf"],
      views: 87,
      isPinned: false,
      tags: ["workshop", "guru", "metode"],
    },
  ];

  // Filter dan search logic
  const filteredPengumuman = useMemo(() => {
    return pengumumanList
      .filter((pengumuman) => {
        const matchesKategori =
          !filters.kategori || pengumuman.kategori === filters.kategori;
        const matchesPrioritas =
          !filters.prioritas || pengumuman.prioritas === filters.prioritas;
        const matchesStatus =
          !filters.status || pengumuman.status === filters.status;
        const matchesSearch =
          !filters.searchQuery ||
          pengumuman.judul
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase()) ||
          pengumuman.konten
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase()) ||
          pengumuman.tags.some((tag) =>
            tag.toLowerCase().includes(filters.searchQuery.toLowerCase())
          );

        return (
          matchesKategori && matchesPrioritas && matchesStatus && matchesSearch
        );
      })
      .sort((a, b) => {
        // Sort: pinned first, then by priority, then by date
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        const priorityOrder = { Urgent: 4, Tinggi: 3, Sedang: 2, Rendah: 1 };
        const aPriority = priorityOrder[a.prioritas] || 0;
        const bPriority = priorityOrder[b.prioritas] || 0;

        if (aPriority !== bPriority) return bPriority - aPriority;

        return (
          new Date(b.tanggalPublish).getTime() -
          new Date(a.tanggalPublish).getTime()
        );
      });
  }, [pengumumanList, filters]);

  const handleFiltersChange = (newFilters: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleDetailClick = (pengumuman: Pengumuman) => {
    console.log("Detail pengumuman:", pengumuman);
    // Navigate to detail page or open modal
  };

  const currentDate = new Date().toISOString();

  // Statistics
  const stats = useMemo(() => {
    return {
      total: pengumumanList.length,
      aktif: pengumumanList.filter((p) => p.status === "Aktif").length,
      tahfidz: pengumumanList.filter((p) => p.kategori === "Tahfidz").length,
      tahsin: pengumumanList.filter((p) => p.kategori === "Tahsin").length,
      kajian: pengumumanList.filter((p) => p.kategori === "Kajian").length,
      urgent: pengumumanList.filter((p) => p.prioritas === "Urgent").length,
    };
  }, [pengumumanList]);

  return (
    <div
      className="min-h-screen w-full transition-colors duration-200"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top Bar */}
      <ParentTopBar
        palette={palette}
        gregorianDate={currentDate}
        title="Semua Pengumuman"
      />

      {/* Content + Sidebar */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          {/* Sidebar kiri */}
          <div className="lg:w-64 mb-6 lg:mb-0">
            <ParentSidebar palette={palette} />
          </div>

          {/* Konten utama */}
          <div className="flex-1 space-y-6">
            {/* Header Section */}
            <SectionCard palette={palette} className="p-6">
              <div className="text-left">
                <h1 className="text-2xl font-bold mb-2">Semua Pengumuman</h1>
                <p className="opacity-70 mb-6">
                  Informasi terbaru seputar kegiatan Tahfidz, Tahsin, dan Kajian
                </p>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  <div
                    className="text-left p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.total}
                    </p>
                    <p className="text-xs opacity-70">Total</p>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-green-600">
                      {stats.aktif}
                    </p>
                    <p className="text-xs opacity-70">Aktif</p>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-emerald-600">
                      {stats.tahfidz}
                    </p>
                    <p className="text-xs opacity-70">Tahfidz</p>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-cyan-600">
                      {stats.tahsin}
                    </p>
                    <p className="text-xs opacity-70">Tahsin</p>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.kajian}
                    </p>
                    <p className="text-xs opacity-70">Kajian</p>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-red-600">
                      {stats.urgent}
                    </p>
                    <p className="text-xs opacity-70">Urgent</p>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Search and Filter */}
            <SearchFilter
              palette={palette}
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />

            {/* Results Info */}
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-70">
                Menampilkan {filteredPengumuman.length} dari{" "}
                {pengumumanList.length} pengumuman
              </p>
              {(filters.kategori ||
                filters.prioritas ||
                filters.status ||
                filters.searchQuery) && (
                <button
                  onClick={() =>
                    setFilters({
                      kategori: "",
                      prioritas: "",
                      status: "",
                      searchQuery: "",
                    })
                  }
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {/* Pengumuman List */}
            <div className="space-y-4">
              {filteredPengumuman.length > 0 ? (
                filteredPengumuman.map((pengumuman) => (
                  <PengumumanCard
                    key={pengumuman.id}
                    pengumuman={pengumuman}
                    palette={palette}
                    onDetailClick={handleDetailClick}
                  />
                ))
              ) : (
                <SectionCard palette={palette} className="p-12 text-center">
                  <div className="opacity-60">
                    <svg
                      className="w-16 h-16 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold mb-2">
                      Tidak Ada Pengumuman
                    </h3>
                    <p className="text-sm">
                      Tidak ada pengumuman yang sesuai dengan filter yang
                      dipilih.
                    </p>
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Load More Button (if needed) */}
            {filteredPengumuman.length > 10 && (
              <div className="text-center">
                <button
                  className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                  style={{
                    background: palette.white1,
                    border: `2px solid ${palette.silver1}`,
                    color: palette.black1,
                  }}
                >
                  Muat Lebih Banyak
                </button>
              </div>
            )}

            {/* Quick Actions Panel */}
            <SectionCard palette={palette} className="p-4">
              <h3 className="font-semibold mb-3">Aksi Cepat</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  className="p-3 rounded-lg text-left transition-colors duration-200 hover:opacity-80"
                  style={{
                    background: palette.white1,
                    border: `1px solid ${palette.silver1}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-green-600">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Arsip Pengumuman</p>
                      <p className="text-xs opacity-60">
                        Lihat pengumuman lama
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  className="p-3 rounded-lg text-left transition-colors duration-200 hover:opacity-80"
                  style={{
                    background: palette.white1,
                    border: `1px solid ${palette.silver1}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Kategori Favorit</p>
                      <p className="text-xs opacity-60">Atur preferensi</p>
                    </div>
                  </div>
                </button>

                <button
                  className="p-3 rounded-lg text-left transition-colors duration-200 hover:opacity-80"
                  style={{
                    background: palette.white1,
                    border: `1px solid ${palette.silver1}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-purple-600">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Hubungi Admin</p>
                      <p className="text-xs opacity-60">Ada pertanyaan?</p>
                    </div>
                  </div>
                </button>
              </div>
            </SectionCard>

            {/* Info Panel */}
            <SectionCard palette={palette} className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-500 mt-1">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Informasi Penting</h3>
                  <p className="text-sm opacity-70 leading-relaxed">
                    Pastikan Anda selalu memeriksa pengumuman terbaru setiap
                    hari. Pengumuman dengan prioritas "Urgent" memerlukan
                    perhatian segera. Untuk mendapatkan notifikasi pengumuman
                    langsung ke WhatsApp atau email, silakan hubungi bagian
                    administrasi.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AllAnnouncementTeacher;
