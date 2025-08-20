// src/pages/sekolahislamku/jadwal/AllSchedule.tsx
import { useState } from "react";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import  ParentTopBar  from "@/pages/sekolahislamku/components/home/StudentTopBar";
import SchoolSidebarNav from "@/pages/sekolahislamku/components/home/SchoolSideBarNav";


interface JadwalItem {
  id: string;
  namaKelas: string;
  waktu: string;
  hari: string;
  tanggal: string;
  ustadz: string;
  lokasi: string;
  materi?: string;
  status: "aktif" | "dibatalkan" | "selesai";
  jenis: "mengaji" | "hafalan" | "fiqih" | "akhlaq" | "tahsin";
}

const mockJadwalList: JadwalItem[] = [
  {
    id: "1",
    namaKelas: "Kelas Tahfidz A",
    waktu: "08:00 - 09:30",
    hari: "Senin",
    tanggal: "2025-08-18",
    ustadz: "Ustadz Ahmad",
    lokasi: "Ruang A1",
    materi: "Surah Al-Baqarah ayat 1-10",
    status: "aktif",
    jenis: "hafalan",
  },
  {
    id: "2",
    namaKelas: "Kelas Mengaji B",
    waktu: "10:00 - 11:30",
    hari: "Selasa",
    tanggal: "2025-08-19",
    ustadz: "Ustadz Mahmud",
    lokasi: "Ruang B2",
    materi: "Tajwid dan Makharijul Huruf",
    status: "aktif",
    jenis: "mengaji",
  },
  {
    id: "3",
    namaKelas: "Kelas Fiqih C",
    waktu: "14:00 - 15:30",
    hari: "Rabu",
    tanggal: "2025-08-20",
    ustadz: "Ustadz Yusuf",
    lokasi: "Ruang C3",
    materi: "Thaharah dan Shalat",
    status: "selesai",
    jenis: "fiqih",
  },
];

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export default function AllSchedule() {
  const { isDark } = useHtmlDarkMode();
  const palette = (isDark ? colors.dark : colors.light) as Palette;

  const [filter, setFilter] = useState<
    "semua" | "aktif" | "selesai" | "dibatalkan"
  >("semua");
  const [search, setSearch] = useState("");

  const filtered = mockJadwalList.filter((j) => {
    const matchFilter = filter === "semua" || j.status === filter;
    const matchSearch =
      j.namaKelas.toLowerCase().includes(search.toLowerCase()) ||
      j.ustadz.toLowerCase().includes(search.toLowerCase()) ||
      j.materi?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getStatusText = (status: JadwalItem["status"]) => {
    if (status === "aktif") return "Aktif";
    if (status === "selesai") return "Selesai";
    if (status === "dibatalkan") return "Dibatalkan";
    return "-";
  };

  const getJenisColor = (jenis: JadwalItem["jenis"]) => {
    const colorsMap: Record<string, string> = {
      mengaji: "bg-blue-100 text-blue-800",
      hafalan: "bg-green-100 text-green-800",
      fiqih: "bg-purple-100 text-purple-800",
      akhlaq: "bg-amber-100 text-amber-800",
      tahsin: "bg-pink-100 text-pink-800",
    };
    return colorsMap[jenis] || "bg-gray-100 text-gray-800";
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top Bar */}
      <ParentTopBar
        palette={palette}
        gregorianDate={new Date().toISOString()}
        title="Semua Jadwal"
      />

      {/* Content + Sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          {/* Sidebar kiri */}
          <SchoolSidebarNav palette={palette} />

          {/* Konten utama */}
          <div className="flex-1 space-y-6">
            {/* Search & Filter */}
            <SectionCard palette={palette} className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Cari kelas, ustadz, materi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 w-full rounded-2xl px-3 text-sm"
                    style={{
                      background: palette.white1,
                      color: palette.black1,
                      border: `1px solid ${palette.silver1}`,
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {["semua", "aktif", "selesai", "dibatalkan"].map((f) => (
                    <Btn
                      key={f}
                      size="sm"
                      variant={filter === f ? "secondary" : "outline"}
                      palette={palette}
                      onClick={() => setFilter(f as any)}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Btn>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* Jadwal List */}
            <div className="grid gap-3">
              {filtered.length === 0 ? (
                <SectionCard palette={palette} className="p-6 text-center">
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Tidak ada jadwal ditemukan.
                  </div>
                </SectionCard>
              ) : (
                filtered.map((j) => (
                  <SectionCard
                    key={j.id}
                    palette={palette}
                    className="p-3 md:p-4"
                    style={{ background: palette.white1 }}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <h2 className="font-semibold">{j.namaKelas}</h2>
                        <Badge
                          variant="outline"
                          palette={palette}
                          className={getJenisColor(j.jenis)}
                        >
                          {j.jenis}
                        </Badge>
                      </div>
                      <div
                        className="flex flex-wrap gap-3 text-sm"
                        style={{ color: palette.black2 }}
                      >
                        <span className="flex items-center gap-1">
                          <Calendar size={16} /> {formatTanggal(j.tanggal)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={16} /> {j.waktu}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={16} /> {j.ustadz}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={16} /> {j.lokasi}
                        </span>
                        <span className="font-medium">
                          {getStatusText(j.status)}
                        </span>
                      </div>
                      {j.materi && (
                        <p
                          className="text-sm mt-1"
                          style={{ color: palette.black2 }}
                        >
                          Materi: {j.materi}
                        </p>
                      )}
                    </div>
                  </SectionCard>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
