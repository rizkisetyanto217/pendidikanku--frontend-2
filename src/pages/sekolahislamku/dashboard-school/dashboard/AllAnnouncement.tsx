// src/pages/sekolahislamku/pengumuman/AllAnnouncement.tsx
import React, { useState, useMemo, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import Swal from "sweetalert2";
import axios from "@/lib/axios";
import InputField from "@/components/common/main/InputField";

/* ================= Types ================= */
type PriorityLevel = "Rendah" | "Sedang" | "Tinggi" | "Urgent";
type CategoryType = "Tahfidz" | "Tahsin" | "Kajian" | "Umum";
type StatusType = "Aktif" | "Berakhir" | "Draft";

interface Pengumuman {
  id: number;
  judul: string;
  konten: string;
  kategori: CategoryType;
  prioritas: PriorityLevel;
  status: StatusType;
  tanggalPublish: string;
  tanggalBerakhir?: string;
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

/* =============== Badges kecil =============== */
const PriorityBadge: React.FC<{ prioritas: PriorityLevel }> = ({
  prioritas,
}) => {
  const style =
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
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${style}`}
    >
      <span>{icon}</span>
      {prioritas}
    </span>
  );
};

const CategoryBadge: React.FC<{ kategori: CategoryType }> = ({ kategori }) => {
  const style =
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
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${style}`}
    >
      <span>{icon}</span>
      {kategori}
    </span>
  );
};

const StatusBadge: React.FC<{ status: StatusType }> = ({ status }) => {
  const style =
    status === "Aktif"
      ? "bg-green-100 text-green-800 border-green-300"
      : status === "Draft"
        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
        : "bg-gray-100 text-gray-800 border-gray-300";
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium border ${style}`}
    >
      {status}
    </span>
  );
};

/* =============== Modal Add/Edit =============== */
type AnnouncementModalProps = {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  title: string;
  defaultValue?: Partial<Pengumuman>;
  onSubmit: (
    payload: Omit<Pengumuman, "id" | "views"> & {
      id?: number;
      views?: number;
    }
  ) => Promise<void> | void;
};

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  open,
  onClose,
  palette,
  title,
  defaultValue,
  onSubmit,
}) => {
  const [judul, setJudul] = useState(defaultValue?.judul ?? "");
  const [konten, setKonten] = useState(defaultValue?.konten ?? "");
  const [kategori, setKategori] = useState<CategoryType>(
    (defaultValue?.kategori as CategoryType) ?? "Umum"
  );
  const [prioritas, setPrioritas] = useState<PriorityLevel>(
    (defaultValue?.prioritas as PriorityLevel) ?? "Rendah"
  );
  const [status, setStatus] = useState<StatusType>(
    (defaultValue?.status as StatusType) ?? "Draft"
  );
  const [tanggalPublish, setTanggalPublish] = useState<string>(
    defaultValue?.tanggalPublish
      ? defaultValue.tanggalPublish.slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [tanggalBerakhir, setTanggalBerakhir] = useState<string>(
    defaultValue?.tanggalBerakhir
      ? defaultValue.tanggalBerakhir.slice(0, 10)
      : ""
  );
  const [penulis, setPenulis] = useState(defaultValue?.penulis ?? "");
  const [target, setTarget] = useState((defaultValue?.target ?? []).join(", "));
  const [tags, setTags] = useState((defaultValue?.tags ?? []).join(", "));
  const [isPinned, setIsPinned] = useState<boolean>(
    defaultValue?.isPinned ?? false
  );
  const [lampiran, setLampiran] = useState(
    (defaultValue?.lampiran ?? []).join(", ")
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setJudul(defaultValue?.judul ?? "");
    setKonten(defaultValue?.konten ?? "");
    setKategori((defaultValue?.kategori as CategoryType) ?? "Umum");
    setPrioritas((defaultValue?.prioritas as PriorityLevel) ?? "Rendah");
    setStatus((defaultValue?.status as StatusType) ?? "Draft");
    setTanggalPublish(
      defaultValue?.tanggalPublish
        ? defaultValue.tanggalPublish.slice(0, 10)
        : new Date().toISOString().slice(0, 10)
    );
    setTanggalBerakhir(
      defaultValue?.tanggalBerakhir
        ? defaultValue.tanggalBerakhir.slice(0, 10)
        : ""
    );
    setPenulis(defaultValue?.penulis ?? "");
    setTarget((defaultValue?.target ?? []).join(", "));
    setTags((defaultValue?.tags ?? []).join(", "));
    setIsPinned(defaultValue?.isPinned ?? false);
    setLampiran((defaultValue?.lampiran ?? []).join(", "));
  }, [open, defaultValue]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !konten) {
      Swal.fire({
        icon: "warning",
        title: "Lengkapi data",
        text: "Judul dan konten wajib diisi.",
      });
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        id: defaultValue?.id,
        judul,
        konten,
        kategori,
        prioritas,
        status,
        tanggalPublish: new Date(tanggalPublish).toISOString(),
        tanggalBerakhir: tanggalBerakhir
          ? new Date(tanggalBerakhir).toISOString()
          : undefined,
        penulis,
        target: target
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        lampiran: lampiran
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        views: defaultValue?.views ?? 0,
        isPinned,
        tags: tags
          .split(",")
          .map((s) => s.trim().replace(/^#/, ""))
          .filter(Boolean),
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      aria-modal
      role="dialog"
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] rounded-2xl"
        style={{
          background: palette.white2,
          color: palette.black1,
          border: `1px solid ${palette.silver1}`,
        }}
      >
        {/* HEADER (sticky top) */}
        <div
          className="sticky top-0 z-10 p-4 border-b rounded-xl"
          style={{ background: palette.white2, borderColor: palette.silver1 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Btn variant="white1" palette={palette} onClick={onClose}>
              Tutup
            </Btn>
          </div>
        </div>

        {/* FORM membungkus body + footer agar submit tetap jalan */}
        <form
          onSubmit={submit}
          className="flex flex-col max-h-[calc(90vh-64px)]"
        >
          {/* BODY (scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 [-webkit-overflow-scrolling:touch]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputField
                  label="Judul"
                  name="judul"
                  value={judul}
                  placeholder="Judul pengumuman"
                  onChange={(e) => setJudul(e.currentTarget.value)}
                />
              </div>

              <div className="md:col-span-2">
                <InputField
                  label="Konten"
                  name="konten"
                  as="textarea"
                  rows={5}
                  value={konten}
                  placeholder="Isi pengumuman…"
                  onChange={(e) =>
                    setKonten((e.target as HTMLTextAreaElement).value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Kategori
                </label>
                <select
                  className="w-full text-sm px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  style={{
                    background: palette.white1,
                    borderColor: palette.silver1,
                    color: palette.black1,
                  }}
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as CategoryType)}
                >
                  <option value="Umum">Umum</option>
                  <option value="Tahfidz">Tahfidz</option>
                  <option value="Tahsin">Tahsin</option>
                  <option value="Kajian">Kajian</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Prioritas
                </label>
                <select
                  className="w-full text-sm px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  style={{
                    background: palette.white1,
                    borderColor: palette.silver1,
                    color: palette.black1,
                  }}
                  value={prioritas}
                  onChange={(e) =>
                    setPrioritas(e.target.value as PriorityLevel)
                  }
                >
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="w-full text-sm px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  style={{
                    background: palette.white1,
                    borderColor: palette.silver1,
                    color: palette.black1,
                  }}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusType)}
                >
                  <option value="Draft">Draft</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Berakhir">Berakhir</option>
                </select>
              </div>

              <InputField
                label="Tanggal Publish"
                name="tanggalPublish"
                type="date"
                value={tanggalPublish}
                onChange={(e) => setTanggalPublish(e.currentTarget.value)}
              />

              <InputField
                label="Tanggal Berakhir"
                name="tanggalBerakhir"
                type="date"
                value={tanggalBerakhir}
                onChange={(e) => setTanggalBerakhir(e.currentTarget.value)}
              />

              <InputField
                label="Penulis"
                name="penulis"
                value={penulis}
                placeholder="Nama penulis"
                onChange={(e) => setPenulis(e.currentTarget.value)}
              />

              <div className="flex items-center gap-2 mt-6">
                <input
                  id="isPinned"
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                />
                <label htmlFor="isPinned" className="text-sm">
                  Sematkan (Pinned)
                </label>
              </div>

              <div className="md:col-span-2">
                <InputField
                  label="Target (pisahkan dengan koma)"
                  name="target"
                  value={target}
                  placeholder="Contoh: Wali Murid, Santri Kelas 7"
                  onChange={(e) => setTarget(e.currentTarget.value)}
                />
              </div>

              <div className="md:col-span-2">
                <InputField
                  label="Tags (pisahkan dengan koma)"
                  name="tags"
                  value={tags}
                  placeholder="contoh: ujian, tahfidz"
                  onChange={(e) => setTags(e.currentTarget.value)}
                />
              </div>

              <div className="md:col-span-2">
                <InputField
                  label="Lampiran (opsional, pisahkan dengan koma atau unggah file)"
                  name="lampiran"
                  value={lampiran}
                  placeholder="file1.pdf, link-gdrive, ..."
                  onChange={(e) => setLampiran(e.currentTarget.value)}
                />
              </div>
            </div>

            {/* FOOTER (sticky bottom, SELALU kelihatan) */}
            <div
              className="sticky bottom-0 z-10 p-4 border-t flex justify-end gap-2
                   pb-[env(safe-area-inset-bottom)] bg-clip-padding"
              style={{
                background: palette.white2,
                borderColor: palette.silver1,
                boxShadow: "0 -4px 10px rgba(0,0,0,0.04)",
              }}
            >
              <Btn
                type="button"
                variant="white1"
                palette={palette}
                onClick={onClose}
              >
                Batal
              </Btn>
              <Btn type="submit" palette={palette} disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Btn>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =============== Card Pengumuman (dengan Aksi) =============== */
function PengumumanCard({
  pengumuman,
  palette,
  onDetailClick,
  onEdit,
  onDelete,
}: {
  pengumuman: Pengumuman;
  palette: Palette;
  onDetailClick: (p: Pengumuman) => void;
  onEdit: (p: Pengumuman) => void;
  onDelete: (p: Pengumuman) => void;
}) {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const truncate = (s: string, n = 150) =>
    s.length <= n ? s : s.slice(0, n) + "…";

  const expSoon = (() => {
    if (!pengumuman.tanggalBerakhir) return false;
    const diffDays = Math.ceil(
      (+new Date(pengumuman.tanggalBerakhir) - +new Date()) / 86400000
    );
    return diffDays <= 7 && diffDays > 0;
  })();

  return (
    <SectionCard
      palette={palette}
      className={`p-0 overflow-hidden transition-all duration-200 hover:shadow-lg ${
        pengumuman.isPinned ? "ring-2 ring-blue-200 bg-blue-50/50" : ""
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {pengumuman.isPinned && (
              <div className="text-blue-600" title="Disematkan">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 3a1 1 0 000 2h1.22l.305 1.222.01.042 1.358 5.43-.893.892C3.74 14.846 4.632 17 6.414 17H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l2-4A1 1 0 0016 9H6.28l-.22-.89A1 1 0 005 8H4a1 1 0 01-1-1V3z" />
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

        {/* Judul & meta */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold mb-1 line-clamp-2">
            {pengumuman.judul}
          </h3>
          <div className="flex items-center gap-4 text-sm opacity-70 flex-wrap">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{pengumuman.penulis}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{formatDate(pengumuman.tanggalPublish)}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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

        {/* Konten */}
        <p className="text-sm leading-relaxed opacity-90 mb-4">
          {truncate(pengumuman.konten)}
        </p>

        {/* Target & tags */}
        <div className="space-y-3 mb-4">
          <div>
            <p className="text-xs font-semibold opacity-60 mb-1">
              TARGET PESERTA
            </p>
            <div className="flex flex-wrap gap-1">
              {pengumuman.target.map((t, i) => (
                <span
                  key={i}
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
                    key={i}
                    className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lampiran */}
        {pengumuman.lampiran?.length ? (
          <div className="mb-4">
            <p className="text-xs font-semibold opacity-60 mb-2">LAMPIRAN</p>
            <div className="flex flex-wrap gap-2">
              {pengumuman.lampiran.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                  style={{
                    background: palette.white1,
                    border: `1px solid ${palette.silver1}`,
                  }}
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Footer: aksi */}
        <div
          className="flex items-center justify-between pt-4 border-t"
          style={{ borderColor: palette.silver1 }}
        >
          <div className="text-xs opacity-60">
            {pengumuman.tanggalBerakhir && (
              <span>Berakhir: {formatDate(pengumuman.tanggalBerakhir)}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Btn
              size="sm"
              variant="white1"
              palette={palette}
              onClick={() => onEdit(pengumuman)}
            >
              Edit
            </Btn>
            <Btn
              size="sm"
              variant="destructive"
              palette={palette}
              onClick={() => onDelete(pengumuman)}
            >
              Hapus
            </Btn>
            <button
              onClick={() => onDetailClick(pengumuman)}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:opacity-80"
              style={{ background: palette.black1, color: palette.white1 }}
            >
              Baca Selengkapnya
            </button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/* =============== Search & Filter card =============== */
function SearchFilter({
  palette,
  filters,
  onFiltersChange,
}: {
  palette: Palette;
  filters: FilterOptions;
  onFiltersChange: (f: Partial<FilterOptions>) => void;
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
              stroke="currentColor"
              viewBox="0 0 24 24"
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
            onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm border focus:outline-none"
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
            onChange={(e) => onFiltersChange({ kategori: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm border outline-none"
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
            onChange={(e) => onFiltersChange({ prioritas: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm border outline-none"
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
            onChange={(e) => onFiltersChange({ status: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm border outline-none"
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

/* =================== Main Page =================== */
const AllAnnouncement: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FilterOptions>({
    kategori: "",
    prioritas: "",
    status: "",
    searchQuery: "",
  });

  // --- Sample data (silakan ganti dengan data asli)
  const pengumumanList: Pengumuman[] = [
    // ... (data contohmu tetap sama persis) ...
  ];

  // State lokal untuk Add/Edit/Delete
  const [items, setItems] = useState<Pengumuman[]>(pengumumanList);

  // Jika pengumumanList dari luar berubah (mis: fetch), sinkronkan
  useEffect(
    () => setItems(pengumumanList),
    [
      /* tambahkan dep kalau sumbernya berubah */
    ]
  );

  const filteredPengumuman = useMemo(() => {
    return items
      .filter((p) => {
        const matchKat =
          !filters.kategori ||
          p.kategori === (filters.kategori as CategoryType);
        const matchPri =
          !filters.prioritas ||
          p.prioritas === (filters.prioritas as PriorityLevel);
        const matchSta =
          !filters.status || p.status === (filters.status as StatusType);
        const q = filters.searchQuery.toLowerCase();
        const matchQ =
          !q ||
          p.judul.toLowerCase().includes(q) ||
          p.konten.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q));
        return matchKat && matchPri && matchSta && matchQ;
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        const order: Record<PriorityLevel, number> = {
          Urgent: 4,
          Tinggi: 3,
          Sedang: 2,
          Rendah: 1,
        };
        if (order[a.prioritas] !== order[b.prioritas])
          return order[b.prioritas] - order[a.prioritas];
        return +new Date(b.tanggalPublish) - +new Date(a.tanggalPublish);
      });
  }, [items, filters]);

  const handleFiltersChange = (f: Partial<FilterOptions>) =>
    setFilters((prev) => ({ ...prev, ...f }));
  const handleDetailClick = (p: Pengumuman) =>
    console.log("Detail pengumuman:", p);

  const currentDate = new Date().toISOString();

  const stats = useMemo(
    () => ({
      total: items.length,
      aktif: items.filter((p) => p.status === "Aktif").length,
      tahfidz: items.filter((p) => p.kategori === "Tahfidz").length,
      tahsin: items.filter((p) => p.kategori === "Tahsin").length,
      kajian: items.filter((p) => p.kategori === "Kajian").length,
      urgent: items.filter((p) => p.prioritas === "Urgent").length,
    }),
    [items]
  );

  /* ========== Add / Edit / Delete Handlers ========== */
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState<Pengumuman | null>(null);

  const handleAddAnnouncement = async (
    payload: Omit<Pengumuman, "id" | "views"> & { id?: number; views?: number }
  ) => {
    // API nyata:
    // const res = await axios.post<{ data: Pengumuman }>("/api/a/announcements", payload, { withCredentials: true });
    // const created = res.data.data;

    // Fallback lokal:
    const created: Pengumuman = {
      ...(payload as Pengumuman),
      id: payload.id ?? Date.now(),
      views: payload.views ?? 0,
    };
    setItems((prev) => [created, ...prev]);
    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "Pengumuman ditambahkan.",
      timer: 1400,
      showConfirmButton: false,
    });
  };

  const openEditAnnouncement = (p: Pengumuman) => {
    setSelected(p);
    setOpenEdit(true);
  };

  const handleEditAnnouncement = async (
    payload: Omit<Pengumuman, "id" | "views"> & { id?: number; views?: number }
  ) => {
    if (!selected) return;
    const id = selected.id;

    // API nyata:
    // const res = await axios.put<{ data: Pengumuman }>(`/api/a/announcements/${id}`, payload, { withCredentials: true });
    // const updated = res.data.data;

    // Fallback lokal:
    const updated: Pengumuman = {
      ...(payload as Pengumuman),
      id,
      views: selected.views,
    };

    setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
    Swal.fire({
      icon: "success",
      title: "Tersimpan",
      text: "Pengumuman diperbarui.",
      timer: 1200,
      showConfirmButton: false,
    });
  };

  const handleDeleteAnnouncement = async (p: Pengumuman) => {
    const res = await Swal.fire({
      title: "Hapus pengumuman?",
      text: `"${p.judul}" akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
    });
    if (!res.isConfirmed) return;

    try {
      // API nyata:
      // await axios.delete(`/api/a/announcements/${p.id}`, { withCredentials: true });

      setItems((prev) => prev.filter((x) => x.id !== p.id));
      Swal.fire({
        icon: "success",
        title: "Terhapus",
        text: "Pengumuman telah dihapus.",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus",
        text: e?.message ?? "Terjadi kesalahan.",
      });
    }
  };

  return (
    <div
      className="min-h-screen w-full transition-colors duration-200"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top Bar */}
      <ParentTopBar
        palette={palette}
        gregorianDate={currentDate}
        title="Semua Pengumuman"
      />

      {/* Modal Add */}
      <AnnouncementModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        palette={palette}
        title="Tambah Pengumuman"
        onSubmit={handleAddAnnouncement}
      />
      {/* Modal Edit */}
      <AnnouncementModal
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelected(null);
        }}
        palette={palette}
        title={`Edit Pengumuman${selected ? `: ${selected.judul}` : ""}`}
        defaultValue={selected ?? undefined}
        onSubmit={handleEditAnnouncement}
      />

      {/* Content + Sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6 ">
        <div className="lg:flex lg:items-start lg:gap-4">
          {/* Sidebar kiri */}
          <ParentSidebar palette={palette} />

          {/* Konten utama */}
          <div className="flex-1 space-y-5 px-4">
            {/* Header + Add Button */}

            <div className="flex items-start justify-between gap-6">
              <div className="text-left flex items-center gap-3">
                <div className="flex items-center">
                  <Btn
                    palette={palette}
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 mb-2"
                  >
                    <ArrowLeft size={20} />
                  </Btn>
                </div>
                <div>
                  <h1 className="text-lg font-semibold mb-2">
                    Semua Pengumuman
                  </h1>
                </div>
              </div>
              <Btn palette={palette} onClick={() => setOpenAdd(true)}>
                Tambah Pengumuman
              </Btn>
            </div>

            {/* Search & Filter */}
            <SearchFilter
              palette={palette}
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />

            {/* Result info */}
            <div className="flex items-center justify-between">
              <p
                className="text-sm opacity-90"
                style={{ color: palette.black2 }}
              >
                Menampilkan {filteredPengumuman.length} dari {items.length}{" "}
                pengumuman
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
              {filteredPengumuman.length ? (
                filteredPengumuman.map((p) => (
                  <PengumumanCard
                    key={p.id}
                    pengumuman={p}
                    palette={palette}
                    onDetailClick={handleDetailClick}
                    onEdit={openEditAnnouncement}
                    onDelete={handleDeleteAnnouncement}
                  />
                ))
              ) : (
                <SectionCard palette={palette} className="p-12 text-center">
                  <div className="opacity-60">
                    <svg
                      className="w-16 h-16 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: palette.black2 }}
                    >
                      Tidak Ada Pengumuman
                    </h3>
                    <p className="text-sm" style={{ color: palette.black2 }}>
                      Tidak ada pengumuman yang sesuai dengan filter yang
                      dipilih.
                    </p>
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Quick Actions (opsional) */}
            <SectionCard palette={palette} className="p-4">
              <h3 className="font-semibold mb-3">Aksi Cepat</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  className="p-3 rounded-lg text-left transition-colors duration-200 hover:opacity-80"
                  style={{
                    color: palette.black2,
                    background: palette.white1,
                    border: `1px solid ${palette.silver1}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-green-600">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div style={{ color: palette.black2 }}>
                      <p
                        className="font-medium text-sm"
                        style={{ color: palette.black2 }}
                      >
                        Arsip Pengumuman
                      </p>
                      <p
                        className="text-xs opacity-90"
                        style={{ color: palette.black2 }}
                      >
                        Lihat pengumuman lama
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  className="p-3 rounded-lg text-left transition-colors duration-200 hover:opacity-90"
                  style={{
                    background: palette.white1,
                    border: `1px solid ${palette.silver1}`,
                  }}
                >
                  <div
                    className="flex items-center gap-3"
                    style={{ color: palette.black2 }}
                  >
                    <div className="text-blue-600">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 001 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    </div>
                    <div>
                      <p
                        className="font-medium text-sm"
                        style={{ color: palette.black2 }}
                      >
                        Kategori Favorit
                      </p>
                      <p
                        className="text-xs opacity-90"
                        style={{ color: palette.black2 }}
                      >
                        Atur preferensi
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
                    <div className="text-purple-600">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
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
                      <p
                        className="text-xs opacity-90"
                        style={{ color: palette.black2 }}
                      >
                        Ada pertanyaan?
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </SectionCard>

            {/* Info Panel */}
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
                  <h3 className="font-semibold mb-1">Informasi Penting</h3>
                  <p className="text-sm opacity-70 leading-relaxed">
                    Pastikan Anda selalu memeriksa pengumuman terbaru setiap
                    hari. Pengumuman dengan prioritas "Urgent" memerlukan
                    perhatian segera. Untuk notifikasi lewat WhatsApp/email,
                    hubungi administrasi.
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

export default AllAnnouncement;
