// src/pages/sekolahislamku/tryout/TryoutUjianTahfiz.tsx
import React, { useState } from 'react';
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";
import SchoolSidebarNav from "@/pages/sekolahislamku/components/home/SchoolSideBarNav";

// Interface untuk data tryout
interface TryoutTahfiz {
  id: number;
  judul: string;
  tanggal: string;
  waktu: string;
  deskripsi: string;
  status: 'Akan Datang' | 'Berlangsung' | 'Selesai' | 'Dibatalkan';
  jenisTryout: 'Internal' | 'Eksternal' | 'Ujian Resmi';
  targetPeserta: string;
  materiTahfiz: string[];
  pengawas: string[];
  lokasi: string;
  durasi: string;
  maxPeserta?: number;
  jumlahPendaftar?: number;
}

// Komponen untuk status badge
interface StatusBadgeProps {
  status: TryoutTahfiz['status'];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'Akan Datang':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Berlangsung':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Selesai':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Dibatalkan':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle()}`}
    >
      {status}
    </span>
  );
};

// Komponen untuk jenis tryout badge
interface JenisBadgeProps {
  jenis: TryoutTahfiz['jenisTryout'];
}

const JenisBadge: React.FC<JenisBadgeProps> = ({ jenis }) => {
  const getJenisStyle = () => {
    switch (jenis) {
      case 'Internal':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Eksternal':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Ujian Resmi':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium border ${getJenisStyle()}`}
    >
      {jenis}
    </span>
  );
};

// Komponen untuk card tryout
interface TryoutCardProps {
  tryout: TryoutTahfiz;
  palette: Palette;
  onDetailClick: (tryout: TryoutTahfiz) => void;
}

const TryoutCard: React.FC<TryoutCardProps> = ({ tryout, palette, onDetailClick }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <SectionCard palette={palette} className="p-0 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-2">
              <JenisBadge jenis={tryout.jenisTryout} />
              <StatusBadge status={tryout.status} />
            </div>
            <h3 className="text-lg font-semibold mb-1">{tryout.judul}</h3>
            <div className="flex gap-4 text-sm opacity-70">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>{formatDate(tryout.tanggal)}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>{tryout.waktu}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-sm leading-relaxed opacity-90">
            {tryout.deskripsi}
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: palette.silver1 }}>
            <div>
              <p className="text-xs font-semibold opacity-60 mb-1">TARGET PESERTA</p>
              <p className="text-sm">{tryout.targetPeserta}</p>
            </div>
            <div>
              <p className="text-xs font-semibold opacity-60 mb-1">LOKASI</p>
              <p className="text-sm">{tryout.lokasi}</p>
            </div>
            <div>
              <p className="text-xs font-semibold opacity-60 mb-1">DURASI</p>
              <p className="text-sm">{tryout.durasi}</p>
            </div>
            <div>
              <p className="text-xs font-semibold opacity-60 mb-1">PENDAFTAR</p>
              <p className="text-sm">
                {tryout.jumlahPendaftar || 0}/{tryout.maxPeserta || '∞'} peserta
              </p>
            </div>
          </div>

          {/* Materi Tahfiz */}
          <div>
            <p className="text-xs font-semibold opacity-60 mb-2">MATERI TAHFIZ</p>
            <div className="flex flex-wrap gap-1">
              {tryout.materiTahfiz.map((materi, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded text-xs"
                  style={{ 
                    background: palette.white1, 
                    border: `1px solid ${palette.silver1}`,
                    color: palette.black1
                  }}
                >
                  {materi}
                </span>
              ))}
            </div>
          </div>

          {/* Pengawas */}
          <div>
            <p className="text-xs font-semibold opacity-60 mb-2">PENGAWAS</p>
            <div className="text-sm">
              {tryout.pengawas.join(', ')}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: palette.silver1 }}>
          <div className="flex items-center gap-2 text-xs opacity-60">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>ID: {tryout.id.toString().padStart(4, '0')}</span>
          </div>
          <button
            onClick={() => onDetailClick(tryout)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:opacity-80"
            style={{ 
              background: palette.black1, 
              color: palette.white1 
            }}
          >
            Lihat Detail
          </button>
        </div>
      </div>
    </SectionCard>
  );
};

// Komponen untuk filter
interface FilterBarProps {
  palette: Palette;
  statusFilter: string;
  jenisFilter: string;
  onStatusChange: (status: string) => void;
  onJenisChange: (jenis: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  palette, 
  statusFilter, 
  jenisFilter, 
  onStatusChange, 
  onJenisChange 
}) => {
  return (
    <SectionCard palette={palette} className="p-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <h3 className="font-semibold text-sm">Filter Tryout:</h3>
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ 
              background: palette.white1, 
              borderColor: palette.silver1,
              color: palette.black1
            }}
          >
            <option value="">Semua Status</option>
            <option value="Akan Datang">Akan Datang</option>
            <option value="Berlangsung">Berlangsung</option>
            <option value="Selesai">Selesai</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
          
          <select
            value={jenisFilter}
            onChange={(e) => onJenisChange(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ 
              background: palette.white1, 
              borderColor: palette.silver1,
              color: palette.black1
            }}
          >
            <option value="">Semua Jenis</option>
            <option value="Internal">Internal</option>
            <option value="Eksternal">Eksternal</option>
            <option value="Ujian Resmi">Ujian Resmi</option>
          </select>
        </div>
      </div>
    </SectionCard>
  );
};

// Komponen utama
const TryoutUjianTahfiz: React.FC = () => {
  const { isDark } = useHtmlDarkMode();
  const palette = (isDark ? colors.dark : colors.light) as Palette;
  
  const [statusFilter, setStatusFilter] = useState('');
  const [jenisFilter, setJenisFilter] = useState('');

  // Data tryout
  const tryoutList: TryoutTahfiz[] = [
    {
      id: 1,
      judul: "Tryout Ujian Tahfiz Semester Ganjil",
      tanggal: "2025-08-22",
      waktu: "08:00 - 12:00 WIB",
      deskripsi: "Tryout internal Kamis depan. Mohon guru menyiapkan rubrik penilaian untuk evaluasi kemampuan tahfiz siswa semester ini.",
      status: "Akan Datang",
      jenisTryout: "Internal",
      targetPeserta: "Kelas 4-6 SD",
      materiTahfiz: ["Juz 30", "Surah Al-Mulk", "Surah Yasin"],
      pengawas: ["Ustadz Ahmad", "Ustadzah Fatimah", "Ustadz Yusuf"],
      lokasi: "Aula Utama",
      durasi: "4 jam",
      maxPeserta: 50,
      jumlahPendaftar: 35
    },
    {
      id: 2,
      judul: "Ujian Tahfiz Bulanan - September",
      tanggal: "2025-09-15",
      waktu: "09:00 - 11:00 WIB",
      deskripsi: "Ujian rutin bulanan untuk mengukur progress hafalan siswa. Meliputi evaluasi kelancaran, tajwid, dan makhorijul huruf.",
      status: "Akan Datang",
      jenisTryout: "Ujian Resmi",
      targetPeserta: "Semua Tingkat",
      materiTahfiz: ["Sesuai Target Bulanan", "Muroja'ah"],
      pengawas: ["Ustadz Mahmud", "Ustadzah Khadijah"],
      lokasi: "Ruang Kelas Masing-masing",
      durasi: "2 jam",
      maxPeserta: 150,
      jumlahPendaftar: 142
    },
    {
      id: 3,
      judul: "Tryout Persiapan Musabaqah",
      tanggal: "2025-08-30",
      waktu: "07:30 - 10:30 WIB",
      deskripsi: "Persiapan khusus untuk siswa yang akan mengikuti Musabaqah Tilawatil Quran tingkat kota. Fokus pada teknik dan mental bertanding.",
      status: "Akan Datang",
      jenisTryout: "Eksternal",
      targetPeserta: "Tim Musabaqah",
      materiTahfiz: ["Juz 1-5", "Tilawah", "Tahfiz 5 Juz"],
      pengawas: ["Ustadz Hafiz", "Qori Abdullah"],
      lokasi: "Masjid Sekolah",
      durasi: "3 jam",
      maxPeserta: 15,
      jumlahPendaftar: 12
    },
    {
      id: 4,
      judul: "Evaluasi Tahfiz Semester Genap",
      tanggal: "2025-07-20",
      waktu: "08:00 - 15:00 WIB",
      deskripsi: "Evaluasi komprehensif tahfiz untuk semester genap yang telah berlalu. Hasil akan menjadi dasar penentuan level tahfiz semester depan.",
      status: "Selesai",
      jenisTryout: "Ujian Resmi",
      targetPeserta: "Kelas 1-6 SD",
      materiTahfiz: ["Juz 30", "Juz 29", "Surah Pilihan"],
      pengawas: ["Ustadz Ali", "Ustadzah Maryam", "Ustadz Umar"],
      lokasi: "Gedung Utama",
      durasi: "7 jam (bertahap)",
      maxPeserta: 200,
      jumlahPendaftar: 185
    }
  ];

  // Filter data
  const filteredTryout = tryoutList.filter(tryout => {
    if (statusFilter && tryout.status !== statusFilter) return false;
    if (jenisFilter && tryout.jenisTryout !== jenisFilter) return false;
    return true;
  });

  const handleDetailClick = (tryout: TryoutTahfiz) => {
    console.log('Detail tryout:', tryout);
    // Navigate to detail page or open modal
  };

  const currentDate = new Date().toISOString();

  return (
    <div
      className="min-h-screen w-full transition-colors duration-200"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top Bar */}
      <ParentTopBar
        palette={palette}
        gregorianDate={currentDate}
        title="Tryout Ujian Tahfiz"
      />

      {/* Content + Sidebar */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          {/* Sidebar kiri */}
          <div className="lg:w-64 mb-6 lg:mb-0">
            <SchoolSidebarNav palette={palette} />
          </div>

          {/* Konten utama */}
          <div className="flex-1 space-y-6">
            {/* Header Section */}
            <SectionCard palette={palette} className="p-6">
              <div className="text-stsrt">
                <h1 className="text-2xl font-bold mb-2">Tryout Ujian Tahfiz</h1>
                <p className="opacity-70 mb-4">
                  Lihat semua jadwal tryout dan ujian tahfiz yang akan datang
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 rounded-lg" style={{ background: palette.white1 }}>
                    <p className="text-2xl font-bold text-blue-600">{tryoutList.filter(t => t.status === 'Akan Datang').length}</p>
                    <p className="text-sm opacity-70">Akan Datang</p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: palette.white1 }}>
                    <p className="text-2xl font-bold text-green-600">{tryoutList.filter(t => t.status === 'Berlangsung').length}</p>
                    <p className="text-sm opacity-70">Berlangsung</p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: palette.white1 }}>
                    <p className="text-2xl font-bold text-gray-600">{tryoutList.filter(t => t.status === 'Selesai').length}</p>
                    <p className="text-sm opacity-70">Selesai</p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: palette.white1 }}>
                    <p className="text-2xl font-bold text-purple-600">{tryoutList.length}</p>
                    <p className="text-sm opacity-70">Total Tryout</p>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Filter Bar */}
            <FilterBar
              palette={palette}
              statusFilter={statusFilter}
              jenisFilter={jenisFilter}
              onStatusChange={setStatusFilter}
              onJenisChange={setJenisFilter}
            />

            {/* Tryout List */}
            <div className="space-y-4">
              {filteredTryout.length > 0 ? (
                filteredTryout.map((tryout) => (
                  <TryoutCard
                    key={tryout.id}
                    tryout={tryout}
                    palette={palette}
                    onDetailClick={handleDetailClick}
                  />
                ))
              ) : (
                <SectionCard palette={palette} className="p-12 text-center">
                  <div className="opacity-60">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold mb-2">Tidak Ada Tryout</h3>
                    <p className="text-sm">
                      Tidak ada tryout yang sesuai dengan filter yang dipilih.
                    </p>
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Info Panel */}
            <SectionCard palette={palette} className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-green-500 mt-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Informasi Tryout</h3>
                  <p className="text-sm opacity-70 leading-relaxed">
                    Semua siswa wajib mengikuti tryout sesuai jadwal yang telah ditentukan. 
                    Untuk informasi lebih lanjut, silakan hubungi guru tahfiz atau bagian akademik.
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

export default TryoutUjianTahfiz;