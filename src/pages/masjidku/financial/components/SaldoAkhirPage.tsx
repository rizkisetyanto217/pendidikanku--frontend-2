import React, { useState, useMemo } from "react";

export default function SaldoAkhirPage() {
  // Data dummy
  const dummyData = [
    {
      id: 1,
      tanggal: "2025-08-01",
      keterangan: "Saldo awal bulan",
      jumlah: 5000000,
    },
    {
      id: 2,
      tanggal: "2025-08-05",
      keterangan: "Pemasukan donasi",
      jumlah: 1500000,
    },
    {
      id: 3,
      tanggal: "2025-08-10",
      keterangan: "Pengeluaran operasional",
      jumlah: -500000,
    },
  ];

  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    return dummyData.filter(
      (item) =>
        item.keterangan.toLowerCase().includes(search.toLowerCase()) ||
        item.tanggal.includes(search)
    );
  }, [search, dummyData]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Saldo Akhir</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Cari berdasarkan keterangan atau tanggal..."
        className="border border-gray-300 rounded-lg p-3 w-full mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border-b font-semibold">Tanggal</th>
              <th className="p-3 border-b font-semibold">Keterangan</th>
              <th className="p-3 border-b font-semibold text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 border-b">{item.tanggal}</td>
                  <td className="p-3 border-b">{item.keterangan}</td>
                  <td
                    className={`p-3 border-b text-right font-medium ${
                      item.jumlah < 0 ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {item.jumlah.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="text-center p-6 text-gray-500 italic"
                >
                  Tidak ada data yang cocok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
