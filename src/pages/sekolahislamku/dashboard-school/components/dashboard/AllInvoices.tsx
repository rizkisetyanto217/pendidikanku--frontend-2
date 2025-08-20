// src/pages/sekolahislamku/tagihan/AllInvoices.tsx
import React from "react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";
import SchoolSidebarNav from "@/pages/sekolahislamku/components/home/SchoolSideBarNav";

// Interface untuk data tagihan
interface Tagihan {
  id: number;
  nama: string;
  jumlah: number;
  status?: "Lunas" | "Belum Lunas";
  tanggalJatuhTempo?: string;
}

// Komponen untuk baris tabel tagihan
interface TagihanRowProps {
  tagihan: Tagihan;
  index: number;
  palette: Palette;
}

const TagihanRow: React.FC<TagihanRowProps> = ({ tagihan, index, palette }) => (
  <tr
    style={{
      background: index % 2 === 0 ? palette.white1 : palette.white2,
    }}
  >
    <td
      className="p-3 border text-center"
      style={{ borderColor: palette.silver1 }}
    >
      {index + 1}
    </td>
    <td
      className="p-3 border font-medium"
      style={{ borderColor: palette.silver1 }}
    >
      {tagihan.nama}
    </td>
    <td
      className="p-3 border text-right font-semibold"
      style={{ borderColor: palette.silver1 }}
    >
      Rp {tagihan.jumlah.toLocaleString("id-ID")}
    </td>
    <td
      className="p-3 border text-center"
      style={{ borderColor: palette.silver1 }}
    >
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          tagihan.status === "Lunas"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {tagihan.status || "Belum Lunas"}
      </span>
    </td>
    <td
      className="p-3 border text-center"
      style={{ borderColor: palette.silver1 }}
    >
      {tagihan.tanggalJatuhTempo || "-"}
    </td>
  </tr>
);

// Komponen untuk header tabel
interface TableHeaderProps {
  palette: Palette;
}

const TableHeader: React.FC<TableHeaderProps> = ({ palette }) => (
  <thead>
    <tr
      style={{
        background: palette.white1,
        borderBottom: `2px solid ${palette.silver1}`,
      }}
    >
      <th
        className="p-3 text-center border font-semibold"
        style={{ borderColor: palette.silver1 }}
      >
        No
      </th>
      <th
        className="p-3 text-left border font-semibold"
        style={{ borderColor: palette.silver1 }}
      >
        Nama Tagihan
      </th>
      <th
        className="p-3 text-right border font-semibold"
        style={{ borderColor: palette.silver1 }}
      >
        Jumlah
      </th>
      <th
        className="p-3 text-center border font-semibold"
        style={{ borderColor: palette.silver1 }}
      >
        Status
      </th>
      <th
        className="p-3 text-center border font-semibold"
        style={{ borderColor: palette.silver1 }}
      >
        Jatuh Tempo
      </th>
    </tr>
  </thead>
);

// Komponen untuk menampilkan total tagihan
interface TotalTagihanProps {
  tagihanList: Tagihan[];
  palette: Palette;
}

const TotalTagihan: React.FC<TotalTagihanProps> = ({
  tagihanList,
  palette,
}) => {
  const totalBelumLunas = tagihanList
    .filter((tagihan) => tagihan.status !== "Lunas")
    .reduce((total, tagihan) => total + tagihan.jumlah, 0);

  const totalSemua = tagihanList.reduce(
    (total, tagihan) => total + tagihan.jumlah,
    0
  );

  return (
    <SectionCard palette={palette} className="p-4">
      <h3 className="text-lg font-semibold mb-3">Ringkasan Tagihan</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          className="text-start p-3 rounded-lg"
          style={{ background: palette.white1 }}
        >
          <p className="text-sm opacity-70">Total Tagihan</p>
          <p className="text-xl font-bold">
            Rp {totalSemua.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="text-center p-3 rounded-lg bg-red-50">
          <p className="text-sm text-red-600">Belum Lunas</p>
          <p className="text-xl font-bold text-red-700">
            Rp {totalBelumLunas.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="text-center p-3 rounded-lg">
          <p className="text-sm opacity-70">Jumlah Tagihan</p>
          <p className="text-xl font-bold">{tagihanList.length} item</p>
        </div>
      </div>
    </SectionCard>
  );
};


// Komponen utama
const AllInvoices: React.FC = () => {
  const { isDark } = useHtmlDarkMode();
  const palette = (isDark ? colors.dark : colors.light) as Palette;

  // Data tagihan dengan informasi yang lebih lengkap
  const tagihanList: Tagihan[] = [
    {
      id: 1,
      nama: "SPP Bulan Agustus 2024",
      jumlah: 150000,
      status: "Belum Lunas",
      tanggalJatuhTempo: "31 Agustus 2024",
    },
    {
      id: 2,
      nama: "TPA Bulan Agustus 2024",
      jumlah: 100000,
      status: "Belum Lunas",
      tanggalJatuhTempo: "31 Agustus 2024",
    },
    {
      id: 3,
      nama: "Uang Kegiatan Semester",
      jumlah: 50000,
      status: "Lunas",
      tanggalJatuhTempo: "15 Juli 2024",
    },
    {
      id: 4,
      nama: "Buku Paket Semester Ganjil",
      jumlah: 75000,
      status: "Belum Lunas",
      tanggalJatuhTempo: "30 September 2024",
    },
  ];

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
        title="Semua Tagihan"
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
            {/* Ringkasan Tagihan */}
            <TotalTagihan tagihanList={tagihanList} palette={palette} />

            {/* Tabel Tagihan */}
            <SectionCard palette={palette} className="p-0 overflow-hidden">
              <div
                className="p-4 border-b"
                style={{ borderColor: palette.silver1 }}
              >
                <h2 className="text-xl font-semibold">Daftar Tagihan</h2>
                <p className="text-sm opacity-70 mt-1">
                  Berikut adalah daftar semua tagihan sekolah
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <TableHeader palette={palette} />
                  <tbody>
                    {tagihanList.length > 0 ? (
                      tagihanList.map((tagihan, index) => (
                        <TagihanRow
                          key={tagihan.id}
                          tagihan={tagihan}
                          index={index}
                          palette={palette}
                        />
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-8 text-center opacity-60"
                          style={{ borderColor: palette.silver1 }}
                        >
                          Tidak ada tagihan yang ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {/* Informasi Tambahan */}
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
                  <h3 className="font-semibold mb-1">Informasi Pembayaran</h3>
                  <p className="text-sm opacity-70 leading-relaxed">
                    Untuk melakukan pembayaran, silakan hubungi bagian keuangan
                    sekolah atau gunakan aplikasi pembayaran yang tersedia.
                    Pastikan untuk menyimpan bukti pembayaran sebagai arsip.
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

export default AllInvoices;
