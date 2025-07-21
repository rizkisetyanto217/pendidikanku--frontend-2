import React, { useState } from "react";
import LectureMaterialMonthList from "@/components/pages/lecture/LectureMonthList";
import LectureMaterialList from "@/components/pages/lecture/LectureMaterialList";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/common/main/Tabs";

type LectureMaterialItem = {
  id: string;
  title: string;
  teacher: string;
  masjidName: string;
  location: string;
  time: string;
  status: "tersedia" | "proses";
  lectureId: string; // id tema
};

const monthData = [
  { month: "Januari", total: 12 },
  { month: "Februari", total: 12 },
  { month: "Maret", total: 12 },
];

const lectureThemes = [
  { id: "tema-1", name: "Tauhid" },
  { id: "tema-2", name: "Akhlaq" },
  { id: "tema-3", name: "Fiqih" },
];

const materialData: LectureMaterialItem[] = [
  {
    id: "1",
    title: "Mengenal Allah Sang Pencipta",
    teacher: "Ustadz Ahmad",
    masjidName: "Masjid Al-Furqan",
    location: "Depok",
    time: "1 Januari 2025, 08:00 WIB",
    status: "tersedia",
    lectureId: "tema-1",
  },
  {
    id: "2",
    title: "Adab kepada Orang Tua",
    teacher: "Ustadzah Salma",
    masjidName: "Masjid Nurul Huda",
    location: "Bandung",
    time: "15 Januari 2025, 10:00 WIB",
    status: "tersedia",
    lectureId: "tema-2",
  },
  {
    id: "3",
    title: "Hukum Wudhu dan Shalat",
    teacher: "Ustadz Fajar",
    masjidName: "Masjid As-Salam",
    location: "Bekasi",
    time: "20 Februari 2025, 13:00 WIB",
    status: "proses",
    lectureId: "tema-3",
  },
];

export default function MasjidLectureMaterial() {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [tab, setTab] = useState("tanggal");
  const [selectedTheme, setSelectedTheme] = useState<string>("");

  const navigate = useNavigate();

  const filteredByTheme = materialData.filter(
    (item) => selectedTheme === "" || item.lectureId === selectedTheme
  );

  return (
    <div className="p-4 space-y-4 pb-20">
      <PageHeaderUser
        title="Soal & Materi Kajian"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { label: "Terbaru", value: "terbaru" },
          { label: "Tema", value: "tema" },
          { label: "Tanggal", value: "tanggal" },
        ]}
      />

      <TabsContent value="terbaru" current={tab}>
        <LectureMaterialList data={materialData} />
      </TabsContent>

      <TabsContent value="tanggal" current={tab}>
        {selectedMonth ? (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedMonth(null)}
              className="text-sm text-primary font-medium"
            >
              ← Kembali ke daftar bulan
            </button>
            <h2 className="text-base font-semibold">Bulan {selectedMonth}</h2>
            <LectureMaterialList data={materialData} />
          </div>
        ) : (
          <LectureMaterialMonthList
            data={monthData}
            onSelectMonth={setSelectedMonth}
          />
        )}
      </TabsContent>

      <TabsContent value="tema" current={tab}>
        <div className="space-y-3">
          <label htmlFor="tema" className="text-sm font-medium">
            Pilih Tema Kajian
          </label>
          <select
            id="tema"
            className="border border-gray-300 rounded px-3 py-2 w-full dark:bg-gray-800 dark:text-white"
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
          >
            <option value="">Semua Tema</option>
            {lectureThemes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>

          <LectureMaterialList data={filteredByTheme} />
        </div>
      </TabsContent>
    </div>
  );
}
