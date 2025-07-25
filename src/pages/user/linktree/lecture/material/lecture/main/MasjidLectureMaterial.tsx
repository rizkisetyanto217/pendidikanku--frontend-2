import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/common/main/Tabs";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

// =====================
// ✅ Interface lokal
// =====================
interface Teacher {
  id: string;
  name: string;
}

interface Lecture {
  lecture_id: string;
  lecture_title: string;
  lecture_description: string;
  lecture_image_url: string;
  lecture_is_certificate_generated: boolean;
  lecture_teachers: Teacher[];
}

export default function MasjidLectureMaterial() {
  const [tab, setTab] = useState("navigasi");
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    data: lecture,
    isLoading,
    isError,
  } = useQuery<Lecture>({
    queryKey: ["lecture-theme", id],
    queryFn: async () => {
      const res = await axios.get(`/public/lectures/${id}`);
      return res.data?.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="pt-4 max-w-2xl mx-auto">
      <PageHeaderUser
        title="Tema Kajian Detail"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { label: "Navigasi", value: "navigasi" },
          { label: "Kajian", value: "kajian" },
        ]}
      />

      {/* Daftar Kajian */}
      <TabsContent value="kajian" current={tab}>
        <div className="space-y-4 mt-4">
          <p className="text-sm text-silver-500">
            Daftar sesi kajian menyusul...
          </p>
        </div>
      </TabsContent>

      {/* Navigasi Utama Kajian */}
      <TabsContent value="navigasi" current={tab}>
        <div
          className="rounded-lg p-4 shadow mt-4"
          style={{ backgroundColor: theme.white1 }}
        >
          <h2
            className="text-base font-semibold mb-2"
            style={{ color: theme.black1 }}
          >
            Informasi Tema Kajian
          </h2>

          {isLoading ? (
            <p className="text-sm text-silver-400">Memuat informasi...</p>
          ) : isError || !lecture ? (
            <p className="text-red-500 text-sm">Gagal memuat data.</p>
          ) : (
            <ul
              className="text-sm space-y-1 mb-4"
              style={{ color: theme.silver2 }}
            >
              <li>📖 Materi: {lecture.lecture_title}</li>
              <li>
                👤 Pengajar:{" "}
                {lecture.lecture_teachers
                  .map((t: Teacher) => t.name)
                  .join(", ") || "-"}
              </li>
              <li>
                📝 Deskripsi:{" "}
                {lecture.lecture_description || "Belum ada deskripsi."}
              </li>
              <li>
                📷 Gambar:
                <a
                  href={lecture.lecture_image_url}
                  className="text-blue-500 ml-1 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Lihat
                </a>
              </li>
              <li className="italic text-red-500">
                {lecture.lecture_is_certificate_generated
                  ? "Sertifikat tersedia"
                  : "Sertifikat belum tersedia"}
              </li>
            </ul>
          )}

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
