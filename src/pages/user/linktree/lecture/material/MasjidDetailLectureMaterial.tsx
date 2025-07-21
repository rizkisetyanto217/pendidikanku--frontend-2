import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import React from "react";
import { useNavigate } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

export default function MasjidDetailLectureMaterial() {
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const info = {
    materi: "Bab 5 - Wudhu dengan sempurna (Pertemuan ke-5)",
    ustadz: "Ustadz Budi Hariadi",
    jadwal: "Tiap sabtu pukul 20.00 WIB",
    tempat: "Masjid Jami' At-Taqwa",
  };

  const menuItems = [
    { label: "Informasi", icon: "🏠" },
    { label: "Video", icon: "🎥" },
    { label: "Latihan Soal", icon: "📘" },
    { label: "Materi Lengkap", icon: "📖" },
    { label: "Ringkasan", icon: "📝" },
    { label: "Dokumen", icon: "📂" },
    { label: "Tanya Jawab", icon: "🙋" },
    { label: "Masukan", icon: "📋" },
    { label: "Ajukan Pertanyaan", icon: "❓" },
    { label: "Catatan Peserta", icon: "🗒️" },
  ];

  return (
    <div
      className="p-4 pb-20 space-y-4"
    >
      <PageHeaderUser
        title="Soal & Materi Kajian"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      {/* Informasi Kajian */}
      <div
        className="p-4 rounded-lg space-y-2 text-sm"

      >
        <div>
          📘 <strong>Materi:</strong> {info.materi}
        </div>
        <div>
          👤 <strong>Pengajar:</strong> {info.ustadz}
        </div>
        <div>
          📅 <strong>Jadwal:</strong> {info.jadwal}
        </div>
        <div>
          📍 <strong>Tempat:</strong> {info.tempat}
        </div>
      </div>

      {/* Navigasi Utama */}
      <div>
        <h2
          className="text-base font-semibold mb-2"
          style={{ color: themeColors.quaternary }}
        >
          Navigasi Utama
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center text-center text-sm p-3 rounded-md"
              style={{
                backgroundColor: themeColors.white3,
                color: themeColors.black1,
              }}
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
