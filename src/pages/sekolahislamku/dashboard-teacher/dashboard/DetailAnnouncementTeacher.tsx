// src/pages/sekolahislamku/pengumuman/DetailAnnouncementTeacher.tsx
import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import { ArrowLeft } from "lucide-react";
import type { Pengumuman } from "./AllAnnouncementTeacher";

// import badge komponen yg sama
import {
  CategoryType,
  PriorityLevel,
  StatusType,
} from "./AllAnnouncementTeacher";

// === Badge helper (boleh ekstrak ke file utils) ===
const PriorityBadge = ({ prioritas }: { prioritas: PriorityLevel }) => {
  const cls =
    prioritas === "Urgent"
      ? "bg-red-100 text-red-800 border-red-300 animate-pulse"
      : prioritas === "Tinggi"
        ? "bg-orange-100 text-orange-800 border-orange-300"
        : prioritas === "Sedang"
          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
          : "bg-green-100 text-green-800 border-green-300";
  const icon =
    prioritas === "Urgent"
      ? "🚨"
      : prioritas === "Tinggi"
        ? "⚠️"
        : prioritas === "Sedang"
          ? "📌"
          : "📝";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${cls}`}
    >
      <span>{icon}</span>
      {prioritas}
    </span>
  );
};
const CategoryBadge = ({ kategori }: { kategori: CategoryType }) => {
  const cls =
    kategori === "Tahfidz"
      ? "bg-green-100 text-green-800 border-green-300"
      : kategori === "Tahsin"
        ? "bg-blue-100 text-blue-800 border-blue-300"
        : kategori === "Kajian"
          ? "bg-purple-100 text-purple-800 border-purple-300"
          : "bg-gray-100 text-gray-800 border-gray-300";
  const icon =
    kategori === "Tahfidz"
      ? "📖"
      : kategori === "Tahsin"
        ? "🎵"
        : kategori === "Kajian"
          ? "🕌"
          : "📢";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${cls}`}
    >
      <span>{icon}</span>
      {kategori}
    </span>
  );
};
const StatusBadge = ({ status }: { status: StatusType }) => {
  const cls =
    status === "Aktif"
      ? "bg-green-100 text-green-800 border-green-300"
      : status === "Draft"
        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
        : "bg-gray-100 text-gray-800 border-gray-300";
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium border ${cls}`}
    >
      {status}
    </span>
  );
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const DetailAnnouncementTeacher: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const location = useLocation() as {
    state?: { pengumuman?: Pengumuman; classId?: string };
  };
  const navigate = useNavigate();

  const pengumuman = location.state?.pengumuman;

  if (!pengumuman) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Data pengumuman tidak ditemukan.</p>
        <Btn palette={palette} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Btn>
      </div>
    );
  }

  const currentDate = new Date().toISOString();
  const { id } = useParams();

  return (
    <div
      className="min-h-screen w-full transition-colors duration-200"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        gregorianDate={currentDate}
        title="Detail Pengumuman"
        showBack
      />

      <main className="w-full px-4 md:px-6  md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Konten utama */}
          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Header & tombol tambah */}
            <div className="md:flex hidden gap-3 items-center">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
                className="gap-1"
              >
                <ArrowLeft size={20} />
              </Btn>
              <h1 className="textlg font-semibold">Pengaturan</h1>
            </div>

            <SectionCard palette={palette} className="p-6 space-y-6">
              {/* Header badges */}
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge kategori={pengumuman.kategori} />
                <PriorityBadge prioritas={pengumuman.prioritas} />
                <StatusBadge status={pengumuman.status} />
                {pengumuman.isPinned && (
                  <span className="text-blue-600 text-xs font-semibold">
                    📌 Disematkan
                  </span>
                )}
              </div>

              {/* Judul */}
              <h1 className="text-2xl font-bold">{pengumuman.judul}</h1>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-sm opacity-70">
                <span>✍️ {pengumuman.penulis}</span>
                <span>📅 {fmtDate(pengumuman.tanggalPublish)}</span>
                {pengumuman.tanggalBerakhir && (
                  <span>
                    ⏳ Berakhir: {fmtDate(pengumuman.tanggalBerakhir)}
                  </span>
                )}
                <span>👁️ {pengumuman.views} views</span>
              </div>

              {/* Konten full */}
              <div className="prose max-w-none text-base leading-relaxed">
                {pengumuman.konten}
              </div>

              {/* Target */}
              {pengumuman.target.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-1">Target Peserta</h3>
                  <div className="flex flex-wrap gap-2">
                    {pengumuman.target.map((t, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded text-xs"
                        style={{
                          background: palette.white1,
                          border: `1px solid ${palette.silver1}`,
                          color: palette.black1,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {pengumuman.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-1">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {pengumuman.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Lampiran */}
              {pengumuman.lampiran && pengumuman.lampiran.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-1">Lampiran</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {pengumuman.lampiran.map((f, i) => (
                      <li key={i} className="underline text-blue-600">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailAnnouncementTeacher;
