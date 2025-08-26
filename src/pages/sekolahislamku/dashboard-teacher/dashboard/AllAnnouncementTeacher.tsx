import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import { ArrowLeft } from "lucide-react";

// ⬇️ tipe API: sumber dari AnnouncementsList (TeacherDashboard)
import type { Announcement as ApiAnnouncement } from "../class/teacher";

/* ===================== Types (UI) ===================== */
export type PriorityLevel = "Rendah" | "Sedang" | "Tinggi" | "Urgent";
export type CategoryType = "Tahfidz" | "Tahsin" | "Kajian" | "Umum";
export type StatusType = "Aktif" | "Berakhir" | "Draft";

export interface Pengumuman {
  id: number | string;
  judul: string;
  konten: string;
  kategori: CategoryType;
  prioritas: PriorityLevel;
  status: StatusType;
  tanggalPublish: string; // ISO
  tanggalBerakhir?: string; // ISO
  penulis: string;
  target: string[];
  lampiran?: string[];
  views: number;
  isPinned: boolean;
  tags: string[];
}

interface FilterOptions {
  kategori: string;
  prioritas: string;
  status: string;
  searchQuery: string;
}

/* ===================== Mappers & Guards ===================== */
function isApiAnnouncement(x: any): x is ApiAnnouncement {
  return x && typeof x === "object" && "title" in x && "date" in x;
}

/** Pemetaan sederhana dari API ➜ UI dengan default aman */
function mapApiToUI(a: ApiAnnouncement): Pengumuman {
  const prioritas: PriorityLevel =
    a.type === "warning"
      ? "Tinggi"
      : a.type === "success"
        ? "Rendah"
        : "Sedang";
  return {
    id: a.id,
    judul: a.title,
    konten: a.body,
    kategori: "Umum",
    prioritas,
    status: "Aktif",
    tanggalPublish: a.date,
    penulis: "Admin",
    target: [],
    lampiran: [],
    views: 0,
    isPinned: false,
    tags: [],
  };
}

function normalizeList(
  list: Array<ApiAnnouncement | Pengumuman>
): Pengumuman[] {
  return list.map((x) =>
    isApiAnnouncement(x) ? mapApiToUI(x) : (x as Pengumuman)
  );
}

/* ===================== Badges ===================== */
function PriorityBadge({ prioritas }: { prioritas: PriorityLevel }) {
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
}

function CategoryBadge({ kategori }: { kategori: CategoryType }) {
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
}

function StatusBadge({ status }: { status: StatusType }) {
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
}

/* ===================== Utils ===================== */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const truncate = (s: string, n = 150) =>
  s.length <= n ? s : s.slice(0, n) + "...";

/* ===================== Card ===================== */
function PengumumanCard({
  pengumuman,
  palette,
  onDetailClick,
}: {
  pengumuman: Pengumuman;
  palette: Palette;
  onDetailClick: (p: Pengumuman) => void;
}) {
  const expSoon = (() => {
    if (!pengumuman.tanggalBerakhir) return false;
    const end = new Date(pengumuman.tanggalBerakhir).getTime();
    const days = Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 7 && days > 0;
  })();

  return (
    <SectionCard
      palette={palette}
      className={`p-0 overflow-hidden transition-all duration-200 hover:shadow-lg ${pengumuman.isPinned ? "ring-2 ring-blue-200 bg-blue-50/50" : ""}`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {pengumuman.isPinned && (
              <div className="text-blue-600" aria-label="Pinned">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 3a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 14.846 4.632 17 6.414 17H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l2-4A1 1 0 0016 9H6.28l-.22-.89A1 1 0 005 8H4a1 1 0 01-1-1V3z" />
                </svg>
              </div>
            )}
            <CategoryBadge kategori={pengumuman.kategori} />
            <PriorityBadge prioritas={pengumuman.prioritas} />
            <StatusBadge status={pengumuman.status} />
          </div>
          {expSoon && (
            <div className="text-orange-600 text-xs font-medium px-2 py-1 bg-orange-100 rounded">
              Akan berakhir
            </div>
          )}
        </div>

        {/* Title & meta */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold mb-1 line-clamp-2">
            {pengumuman.judul}
          </h3>
          <div className="flex items-center gap-4 text-sm opacity-70">
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{pengumuman.penulis}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{fmtDate(pengumuman.tanggalPublish)}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{pengumuman.views} views</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-sm leading-relaxed opacity-90">
            {truncate(pengumuman.konten)}
          </p>
        </div>

        {/* Target & Tags */}
        <div className="space-y-3 mb-4">
          <div>
            <p className="text-xs font-semibold opacity-60 mb-1">
              TARGET PESERTA
            </p>
            <div className="flex flex-wrap gap-1">
              {pengumuman.target.map((t, i) => (
                <span
                  key={`${t}-${i}`}
                  className="px-2 py-1 rounded text-xs"
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

          {pengumuman.tags.length > 0 && (
            <div>
              <p className="text-xs font-semibold opacity-60 mb-1">TAGS</p>
              <div className="flex flex-wrap gap-1">
                {pengumuman.tags.map((tag, i) => (
                  <span
                    key={`${tag}-${i}`}
                    className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Attachments */}
        {pengumuman.lampiran?.length ? (
          <div className="mb-4">
            <p className="text-xs font-semibold opacity-60 mb-2">LAMPIRAN</p>
            <div className="flex flex-wrap gap-2">
              {pengumuman.lampiran.map((file, i) => (
                <div
                  key={`${file}-${i}`}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                  style={{
                    background: palette.white1,
                    border: `1px solid ${palette.silver1}`,
                  }}
                >
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{file}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-4 border-t"
          style={{ borderColor: palette.silver1 }}
        >
          <div className="text-xs opacity-60">
            {pengumuman.tanggalBerakhir && (
              <span>Berakhir: {fmtDate(pengumuman.tanggalBerakhir)}</span>
            )}
          </div>
          <button
            onClick={() => onDetailClick(pengumuman)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:opacity-80"
            style={{ background: palette.black1, color: palette.white1 }}
          >
            Baca Selengkapnya
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

/* ===================== Filter ===================== */
function SearchFilter({
  palette,
  filters,
  onChange,
}: {
  palette: Palette;
  filters: FilterOptions;
  onChange: (patch: Partial<FilterOptions>) => void;
}) {
  return (
    <SectionCard palette={palette} className="p-4">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari pengumuman…"
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              background: palette.white1,
              borderColor: palette.silver1,
              color: palette.black1,
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <select
            value={filters.kategori}
            onChange={(e) => onChange({ kategori: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              background: palette.white1,
              borderColor: palette.silver1,
              color: palette.black1,
            }}
          >
            <option value="">Semua Kategori</option>
            <option value="Tahfidz">📖 Tahfidz</option>
            <option value="Tahsin">🎵 Tahsin</option>
            <option value="Kajian">🕌 Kajian</option>
            <option value="Umum">📢 Umum</option>
          </select>

          <select
            value={filters.prioritas}
            onChange={(e) => onChange({ prioritas: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              background: palette.white1,
              borderColor: palette.silver1,
              color: palette.black1,
            }}
          >
            <option value="">Semua Prioritas</option>
            <option value="Urgent">🚨 Urgent</option>
            <option value="Tinggi">⚠️ Tinggi</option>
            <option value="Sedang">📌 Sedang</option>
            <option value="Rendah">📝 Rendah</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              background: palette.white1,
              borderColor: palette.silver1,
              color: palette.black1,
            }}
          >
            <option value="">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Berakhir">Berakhir</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>
    </SectionCard>
  );
}

/* ===================== Back Button ===================== */
function BackButton({
  palette,
  label = "Kembali",
}: {
  palette: Palette;
  label?: string;
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition"
      style={{
        background: palette.white1,
        border: `1px solid ${palette.silver1}`,
      }}
      aria-label="Kembali"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden xs:inline">{label}</span>
    </button>
  );
}

/* ===================== Page =====================
Sumber data (prioritas):
1. props.items (boleh UI-rich Pengumuman[] atau ApiAnnouncement[])
2. router state: location.state?.announcements (ApiAnnouncement[] dari AnnouncementsList)
   Tidak ada fetching di sini.
*/
export default function AllAnnouncementTeacher({
  // NOTE: props.items bisa berisi Pengumuman[] ATAU ApiAnnouncement[] (auto-normalize)
  items,
  classId,
  title = "Semua Pengumuman",
  onOpenDetail,
}: {
  items?: Array<Pengumuman | ApiAnnouncement>;
  classId?: string;
  title?: string;
  onOpenDetail?: (p: Pengumuman) => void;
}) {
  const { isDark } = useHtmlDarkMode();
  const palette = (isDark ? colors.dark : colors.light) as Palette;

  const location = useLocation() as {
    state?: { announcements?: ApiAnnouncement[] };
  };
  const navigate = useNavigate();

  // Ambil sumber data, lalu normalize jadi Pengumuman[]
  const list = useMemo<Pengumuman[]>(
    () =>
      normalizeList((items as any[]) ?? location.state?.announcements ?? []),
    [items, location.state?.announcements]
  );

  const [filters, setFilters] = useState<FilterOptions>({
    kategori: "",
    prioritas: "",
    status: "",
    searchQuery: "",
  });

  const filtered = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();
    const priorityOrder: Record<PriorityLevel, number> = {
      Urgent: 4,
      Tinggi: 3,
      Sedang: 2,
      Rendah: 1,
    };

    return (list ?? [])
      .filter((p) => {
        const byKategori =
          !filters.kategori ||
          p.kategori === (filters.kategori as CategoryType);
        const byPrior =
          !filters.prioritas ||
          p.prioritas === (filters.prioritas as PriorityLevel);
        const byStatus =
          !filters.status || p.status === (filters.status as StatusType);
        const bySearch =
          !q ||
          p.judul.toLowerCase().includes(q) ||
          p.konten.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q));
        return byKategori && byPrior && byStatus && bySearch;
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        const pa = priorityOrder[a.prioritas] ?? 0;
        const pb = priorityOrder[b.prioritas] ?? 0;
        if (pa !== pb) return pb - pa;
        return (
          new Date(b.tanggalPublish).getTime() -
          new Date(a.tanggalPublish).getTime()
        );
      });
  }, [list, filters]);

  const stats = useMemo(() => {
    const total = list.length;
    const aktif = list.filter((p) => p.status === "Aktif").length;
    const tahfidz = list.filter((p) => p.kategori === "Tahfidz").length;
    const tahsin = list.filter((p) => p.kategori === "Tahsin").length;
    const kajian = list.filter((p) => p.kategori === "Kajian").length;
    const urgent = list.filter((p) => p.prioritas === "Urgent").length;
    return { total, aktif, tahfidz, tahsin, kajian, urgent };
  }, [list]);

  const handleDetailClick = (p: Pengumuman) => {
    if (onOpenDetail) return onOpenDetail(p);
    // default: route ke detail
    navigate(`/guru/pengumuman/detail/${p.id}`, {
      state: { pengumuman: p, classId },
    });
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
        title={title}
      />

      {/* Content + Sidebar */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          {/* Sidebar kiri */}
          <div className="lg:w-64 mb-6 lg:mb-0">
            <ParentSidebar palette={palette} />
          </div>

          {/* Konten utama */}
          <div className="flex-1 space-y-4">
            {/* Header & Stats */}
            <ArrowLeft size={22}  className=" cursor-pointer"  onClick={() => navigate(-1)}/>
            <SectionCard palette={palette} className="p-6">
              <div className="text-left">
                {/* Back Arrow dipindah ke atas (di header) */}
                

                <h1 className="text-2xl font-bold mb-2">
                  {title}
                  {classId ? (
                    <span className="text-base font-normal opacity-70">
                      {" "}
                      • {classId}
                    </span>
                  ) : null}
                </h1>
                <p className="opacity-70 mb-6">
                  Informasi terbaru seputar kegiatan Tahfidz, Tahsin, dan Kajian
                </p>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  <div
                    className="text-left p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.total}
                    </p>
                    <p className="text-xs opacity-70">Total</p>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-green-600">
                      {stats.aktif}
                    </p>
                    <p className="text-xs opacity-70">Aktif</p>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-emerald-600">
                      {stats.tahfidz}
                    </p>
                    <p className="text-xs opacity-70">Tahfidz</p>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-cyan-600">
                      {stats.tahsin}
                    </p>
                    <p className="text-xs opacity-70">Tahsin</p>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.kajian}
                    </p>
                    <p className="text-xs opacity-70">Kajian</p>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-red-600">
                      {stats.urgent}
                    </p>
                    <p className="text-xs opacity-70">Urgent</p>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Search & Filter */}
            <SearchFilter
              palette={palette}
              filters={filters}
              onChange={(patch) => setFilters((p) => ({ ...p, ...patch }))}
            />

            {/* Hasil */}
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-70">
                Menampilkan {filtered.length} dari {list.length} pengumuman
              </p>
              {(filters.kategori ||
                filters.prioritas ||
                filters.status ||
                filters.searchQuery) && (
                <button
                  onClick={() =>
                    setFilters({
                      kategori: "",
                      prioritas: "",
                      status: "",
                      searchQuery: "",
                    })
                  }
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {/* List */}
            <div className="space-y-4">
              {filtered.length ? (
                filtered.map((p) => (
                  <PengumumanCard
                    key={p.id}
                    pengumuman={p}
                    palette={palette}
                    onDetailClick={handleDetailClick}
                  />
                ))
              ) : (
                <SectionCard palette={palette} className="p-12 text-center">
                  <div className="opacity-60">
                    <svg
                      className="w-16 h-16 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold mb-2">
                      Tidak Ada Pengumuman
                    </h3>
                    <p className="text-sm">
                      Tidak ada pengumuman yang sesuai dengan filter yang
                      dipilih.
                    </p>
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Load more (opsional) */}
            {filtered.length > 10 && (
              <div className="text-center">
                <button
                  className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                  style={{
                    background: palette.white1,
                    border: `2px solid ${palette.silver1}`,
                    color: palette.black1,
                  }}
                >
                  Muat Lebih Banyak
                </button>
              </div>
            )}

            {/* Quick actions */}
            <SectionCard palette={palette} className="p-4">
              <h3 className="font-semibold mb-3">Aksi Cepat</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  className="p-3 rounded-lg text-left transition-colors duration-200 hover:opacity-80"
                  style={{
                    background: palette.white1,
                    border: `1px solid ${palette.silver1}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-green-600">
                      <svg
                        className="w-6 h-6"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Arsip Pengumuman</p>
                      <p className="text-xs opacity-60">
                        Lihat pengumuman lama
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  className="p-3 rounded-lg text-left transition-colors duration-200 hover:opacity-80"
                  style={{
                    background: palette.white1,
                    border: `1px solid ${palette.silver1}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">
                      <svg
                        className="w-6 h-6"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 001 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Kategori Favorit</p>
                      <p className="text-xs opacity-60">Atur preferensi</p>
                    </div>
                  </div>
                </button>

                <button
                  className="p-3 rounded-lg text-left transition-colors duration-200 hover:opacity-80"
                  style={{
                    background: palette.white1,
                    border: `1px solid ${palette.silver1}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-purple-600">
                      <svg
                        className="w-6 h-6"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Hubungi Admin</p>
                      <p className="text-xs opacity-60">Ada pertanyaan?</p>
                    </div>
                  </div>
                </button>
              </div>
            </SectionCard>

            {/* Info */}
            <SectionCard palette={palette} className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-500 mt-1">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Informasi Penting</h3>
                  <p className="text-sm opacity-70 leading-relaxed">
                    Pastikan Anda selalu memeriksa pengumuman terbaru setiap
                    hari. Pengumuman dengan prioritas "Urgent" memerlukan
                    perhatian segera. Untuk notifikasi ke WhatsApp/email,
                    silakan hubungi administrasi.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
