import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/common/main/Tabs";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useNavigate } from "react-router-dom";

const dataKajian = [
  {
    title: "Aqidah Bagian ke-1",
    teacher: "Ustadz Abdullah",
    date: "4 Maret 2025, Pukul 10.00 WIB",
    status: "Hadir Online",
    progress: "Materi & Soal : 90",
    statusColor: "bg-green-100 text-green-800",
    progressColor: "bg-green-100 text-green-800",
  },
  {
    title: "Aqidah Bagian ke-2",
    teacher: "Ustadz Abdullah",
    date: "4 Maret 2025, Pukul 10.00 WIB",
    status: "Hadir Langsung",
    progress: "Soal Belum Dikerjakan",
    statusColor: "bg-blue-100 text-blue-800",
    progressColor: "bg-red-100 text-red-800",
  },
];

export default function MasjidLectureMaterial() {
  const [tab, setTab] = useState("kajian");
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();

  return (
    <div className="pt-4">
      <PageHeaderUser
        title="Kajian Detail"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { label: "Kajian", value: "kajian" },
          { label: "Navigasi", value: "navigasi" },
        ]}
      />

      {/* Daftar Kajian */}
      <TabsContent value="kajian" current={tab}>
        <div className="space-y-4 mt-4">
          {dataKajian.map((k, i) => (
            <div
              key={i}
              className="p-4 rounded-lg shadow"
              style={{ backgroundColor: theme.white1 }}
            >
              <h3 className="font-semibold" style={{ color: theme.black1 }}>
                {k.title}
              </h3>
              <p className="text-sm" style={{ color: theme.silver2 }}>
                {k.teacher}
              </p>
              <p className="text-xs pb-2" style={{ color: theme.silver2 }}>
                {k.date}
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className={`px-2 py-1 rounded ${k.statusColor}`}>
                  {k.status}
                </span>
                <span className={`px-2 py-1 rounded ${k.progressColor}`}>
                  {k.progress}
                </span>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      {/* Navigasi Utama Kajian */}
      <TabsContent value="navigasi" current={tab}>
        <div
          className="rounded-lg p-4 shadow"
          style={{ backgroundColor: theme.white1 }}
        >
          <h2
            className="text-base font-semibold mb-2"
            style={{ color: theme.black1 }}
          >
            Informasi Tema Kajian
          </h2>
          <ul
            className="text-sm space-y-1 mb-4"
            style={{ color: theme.silver2 }}
          >
            <li>📖 Materi: Kitab Fiqh Syafi'i Matan Abu Syuja'</li>
            <li>👤 Pengajar: Ustadz Budi Hariadi</li>
            <li>🕒 Jadwal: Tiap Sabtu pukul 20.00 WIB</li>
            <li>📅 Mulai: 24 Mei 2024 – Sekarang</li>
            <li>📍 Lokasi: Masjid At-Taqwa, Ciracas</li>
            <li className="italic text-red-500">Sertifikat belum tersedia</li>
          </ul>

          <h2
            className="text-base font-semibold mb-2"
            style={{ color: theme.black1 }}
          >
            Navigasi Utama
          </h2>
          <div className="space-y-2">
            {[
              "Informasi",
              "Video Pembelajaran",
              "Latihan Soal",
              "Materi Lengkap",
              "Ringkasan",
              "Tanya Jawab",
              "Masukan dan Saran",
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded border cursor-pointer hover:bg-opacity-80 transition"
                style={{
                  backgroundColor: theme.white2,
                  border: `1px solid ${theme.silver1}`,
                  color: theme.black1,
                }}
              >
                <span>{item}</span>
                <span style={{ color: theme.silver4 }}>›</span>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    </div>
  );
}
