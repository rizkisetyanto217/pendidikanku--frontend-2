import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/common/main/Tabs";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import FormattedDate from "@/constants/formattedDate";

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

interface LectureSession {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_description: string;
  lecture_session_image_url: string;
  lecture_session_start_time: string;
  lecture_session_place: string;
  UserName: string;
}

export default function MasjidLectureMaterial() {
  const [tab, setTab] = useState("navigasi");
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { id, slug } = useParams<{ id: string; slug: string }>();

  // 🔁 Dapatkan data tema kajian
  const {
    data: lecture,
    isLoading: loadingLecture,
    isError: errorLecture,
  } = useQuery<Lecture>({
    queryKey: ["lecture-theme", id],
    queryFn: async () => {
      const res = await axios.get(`/public/lectures/${id}`);
      return res.data?.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  // 🔁 Dapatkan daftar sesi kajian
  const {
    data: sessions,
    isLoading: loadingSessions,
    isError: errorSessions,
  } = useQuery<LectureSession[]>({
    queryKey: ["lecture-sessions", id],
    queryFn: async () => {
      const res = await axios.get(`/public/lectures/${id}/lecture-sessions`);
      return res.data?.data ?? [];
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
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

      {/* ====================== */}
      {/* 📘 Daftar Sesi Kajian */}
      {/* ====================== */}
      <TabsContent value="kajian" current={tab}>
        <div className="space-y-4 mt-4">
          {loadingSessions ? (
            <p className="text-sm text-silver-400">Memuat sesi kajian...</p>
          ) : errorSessions ? (
            <p className="text-red-500 text-sm">Gagal memuat daftar sesi.</p>
          ) : sessions && sessions.length > 0 ? (
            sessions.map((sesi) => (
              <div
                key={sesi.lecture_session_id}
                onClick={() =>
                  navigate(
                    `/masjid/${slug}/soal-materi/${sesi.lecture_session_id}`,
                    {
                      state: { fromTab: tab, lectureId: id },
                    }
                  )
                }
                className="p-4 rounded-lg shadow cursor-pointer hover:opacity-90 transition"
                style={{ backgroundColor: theme.white1 }}
              >
                <h3 className="font-semibold" style={{ color: theme.black1 }}>
                  {sesi.lecture_session_title}
                </h3>
                <p className="text-sm" style={{ color: theme.silver2 }}>
                  {sesi.UserName}
                </p>
                <p className="text-xs pb-2" style={{ color: theme.silver2 }}>
                  <FormattedDate value={sesi.lecture_session_start_time} />
                </p>
                <p className="text-sm" style={{ color: theme.silver2 }}>
                  📍 {sesi.lecture_session_place || "-"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-silver-500">Belum ada sesi tersedia.</p>
          )}
        </div>
      </TabsContent>

      {/* ====================== */}
      {/* 🧭 Navigasi Utama     */}
      {/* ====================== */}
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

          {loadingLecture ? (
            <p className="text-sm text-silver-400">Memuat informasi...</p>
          ) : errorLecture || !lecture ? (
            <p className="text-red-500 text-sm">Gagal memuat data.</p>
          ) : (
            <div
              className="rounded-lg shadow"
              style={{ backgroundColor: theme.white1 }}
            >
              <div
                className="text-sm space-y-1"
                style={{ color: theme.silver2 }}
              >
                <p>
                  📘 <strong style={{ color: theme.black1 }}>Materi:</strong>{" "}
                  {lecture.lecture_title}
                </p>
                <p>
                  👤 <strong style={{ color: theme.black1 }}>Pengajar:</strong>{" "}
                  {lecture.lecture_teachers.map((t) => t.name).join(", ") ||
                    "-"}
                </p>
                <p>
                  📅 <strong style={{ color: theme.black1 }}>Jadwal:</strong>{" "}
                  {lecture.lecture_description || "-"}
                </p>
                <p>
                  📆 <strong style={{ color: theme.black1 }}>Mulai:</strong> 24
                  Mei 2024 – Sekarang
                </p>
                <p>
                  📍 <strong style={{ color: theme.black1 }}>Lokasi:</strong>{" "}
                  Masjid At-Taqwa, Ciracas
                </p>
              </div>

              {!lecture.lecture_is_certificate_generated && (
                <p
                  className="mt-2 text-sm italic"
                  style={{ color: theme.error1 }}
                >
                  Sertifikat belum tersedia
                </p>
              )}
            </div>
          )}

          <h2
            className="text-base mt-5 font-semibold mb-2"
            style={{ color: theme.black1 }}
          >
            Navigasi Utama
          </h2>

          <div className="space-y-2">
            {[
              // hanya masukkan item Sertifikat jika tersedia
              ...(lecture?.lecture_is_certificate_generated
                ? [
                    {
                      label: "Sertifikat",
                      path: "ujian",
                      highlight: true,
                    },
                  ]
                : []),
              { label: "Informasi", path: "informasi" },
              { label: "Video Audio", path: "video-audio" },
              { label: "Latihan Soal", path: "latihan-soal" },
              { label: "Materi Lengkap", path: "materi-lengkap" },
              { label: "Ringkasan", path: "ringkasan" },
              { label: "Tanya Jawab", path: "tanya-jawab" },
              { label: "Masukan dan Saran", path: "masukan-saran" },
              { label: "Dokumen", path: "dokumen" },
            ].map((item) => {
              const isSertifikat = item.label === "Sertifikat";
              const isAvailable = item.highlight;

              return (
                <div
                  key={item.label}
                  onClick={() =>
                    navigate(`/masjid/${slug}/tema/${id}/${item.path}`)
                  }
                  className="flex items-center justify-between p-3 rounded-md border cursor-pointer hover:bg-opacity-90 transition"
                  style={{
                    backgroundColor:
                      isSertifikat && isAvailable
                        ? theme.success1
                        : theme.white3,
                    border: `1px solid ${
                      isSertifikat && isAvailable
                        ? theme.success1
                        : theme.silver1
                    }`,
                    color:
                      isSertifikat && isAvailable
                        ? theme.specialColor
                        : theme.black1,
                  }}
                >
                  <div className="flex items-center space-x-2">
                    {isSertifikat && isAvailable && <span>🎉</span>}
                    <span>{item.label}</span>
                  </div>
                  {isSertifikat && isAvailable ? (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: theme.success1,
                        color: theme.white1,
                      }}
                    >
                      Tersedia
                    </span>
                  ) : (
                    <span style={{ color: theme.silver4 }}>›</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </TabsContent>
    </div>
  );
}
