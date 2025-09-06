// src/pages/sekolahislamku/pengumuman/AllAnnouncementTeacher.tsx
import React, { useMemo, useState, useEffect } from "react";
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
import Swal from "sweetalert2";
// import axios from "@/lib/axios"; // aktifkan bila sambung ke backend

// ========== Types ==========
import type { Announcement as ApiAnnouncement } from "../class/types/teacher";
import InputField from "@/components/common/main/InputField";

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

// ========== Mappers ==========
function isApiAnnouncement(x: any): x is ApiAnnouncement {
  return x && typeof x === "object" && "title" in x && "date" in x;
}
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

// ========== Badges ==========
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

// ========== Utils ==========
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
const truncate = (s: string, n = 150) =>
  s.length <= n ? s : s.slice(0, n) + "...";

// ========== Modal (scrollable + footer sticky) ==========
type AnnouncementModalProps = {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  title: string;
  defaultValue?: Partial<Pengumuman>;
  onSubmit: (
    p: Omit<Pengumuman, "id" | "views"> & {
      id?: number | string;
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
        isPinned,
        tags: tags
          .split(",")
          .map((s) => s.trim().replace(/^#/, ""))
          .filter(Boolean),
        views: defaultValue?.views ?? 0,
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
      role="dialog"
      aria-modal
    >
      <div
        className="w-full max-w-3xl rounded-2xl"
        style={{
          background: palette.white2,
          color: palette.black1,
          border: `1px solid ${palette.silver1}`,
        }}
      >
        <form
          onSubmit={submit}
          className="flex flex-col max-h-[90vh] rounded-xl"
        >
          {/* header */}
          <div
            className="sticky top-0 z-10 p-4 border-b rounded-xl"
            style={{ background: palette.white2, borderColor: palette.silver1 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{title}</h3>
              <Btn
                type="button"
                variant="white1"
                palette={palette}
                onClick={onClose}
              >
                Tutup
              </Btn>
            </div>
          </div>

          {/* body (scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 [-webkit-overflow-scrolling:touch]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputField
                  label="Judul"
                  name="judul"
                  value={judul}
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
                  onChange={(e) => setTarget(e.currentTarget.value)}
                />
              </div>
              <div className="md:col-span-2">
                <InputField
                  label="Tags (pisahkan dengan koma)"
                  name="tags"
                  value={tags}
                  onChange={(e) => setTags(e.currentTarget.value)}
                />
              </div>
              <div className="md:col-span-2">
                <InputField
                  label="Lampiran (pisahkan dengan koma)"
                  name="lampiran"
                  value={lampiran}
                  onChange={(e) => setLampiran(e.currentTarget.value)}
                />
              </div>
            </div>
          </div>

          {/* footer (sticky) */}
          <div
            className="sticky bottom-0 z-10 p-4 border-t flex justify-end gap-2
                          pb-[env(safe-area-inset-bottom)] bg-clip-padding"
            style={{ background: palette.white2, borderColor: palette.silver1 }}
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
        </form>
      </div>
    </div>
  );
};

// ========== Card dengan aksi ==========
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
  const expSoon = (() => {
    if (!pengumuman.tanggalBerakhir) return false;
    const end = new Date(pengumuman.tanggalBerakhir).getTime();
    const days = Math.ceil((end - Date.now()) / 86400000);
    return days <= 7 && days > 0;
  })();

  return (
    <SectionCard
      palette={palette}
      className={`p-0 overflow-hidden transition-all duration-200 hover:shadow-lg ${
        pengumuman.isPinned ? "ring-2 ring-blue-200 bg-blue-50/50" : ""
      }`}
    >
      <div className="p-5">
        {/* header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {pengumuman.isPinned && (
              <div className="text-blue-600" aria-label="Pinned">
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

        {/* meta */}
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

        {/* konten ringkas */}
        <p className="text-sm leading-relaxed opacity-90 mb-4">
          {truncate(pengumuman.konten)}
        </p>

        {/* target & tags */}
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

        {/* lampiran */}
        {!!pengumuman.lampiran?.length && (
          <div className="mb-4">
            <p className="text-xs font-semibold opacity-60 mb-2">LAMPIRAN</p>
            <div className="flex flex-wrap gap-2">
              {pengumuman.lampiran!.map((file, i) => (
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
        )}

        {/* footer actions */}
        <div
          className="flex items-center justify-between pt-4 border-t"
          style={{ borderColor: palette.silver1 }}
        >
          <div className="text-xs opacity-60">
            {pengumuman.tanggalBerakhir && (
              <span>Berakhir: {fmtDate(pengumuman.tanggalBerakhir)}</span>
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
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:opacity-80"
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

// ========== Filter ==========
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

// ========== Halaman ==========
export default function AllAnnouncementTeacher({
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
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const location = useLocation() as {
    state?: { announcements?: ApiAnnouncement[] };
  };
  const navigate = useNavigate();

  // sumber awal → normalize
  const initialList = useMemo<Pengumuman[]>(
    () =>
      normalizeList((items as any[]) ?? location.state?.announcements ?? []),
    [items, location.state?.announcements]
  );

  // state lokal supaya bisa Add/Edit/Delete
  const [data, setData] = useState<Pengumuman[]>(initialList);
  useEffect(() => setData(initialList), [initialList]);

  const [filters, setFilters] = useState<FilterOptions>({
    kategori: "",
    prioritas: "",
    status: "",
    searchQuery: "",
  });

  // Modal
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState<Pengumuman | null>(null);

  // Handlers: Add / Edit / Delete
  const handleAdd = async (
    p: Omit<Pengumuman, "id" | "views"> & {
      id?: number | string;
      views?: number;
    }
  ) => {
    // const res = await axios.post<{data:Pengumuman}>("/api/a/announcements", p); const created = res.data.data;
    const created: Pengumuman = {
      ...(p as any),
      id: p.id ?? Date.now(),
      views: p.views ?? 0,
    };
    setData((prev) => [created, ...prev]);
    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "Pengumuman ditambahkan.",
      timer: 1400,
      showConfirmButton: false,
    });
  };
  const openEditByItem = (item: Pengumuman) => {
    setSelected(item);
    setOpenEdit(true);
  };
  const handleEdit = async (
    p: Omit<Pengumuman, "id" | "views"> & {
      id?: number | string;
      views?: number;
    }
  ) => {
    if (!selected) return;
    const id = selected.id;
    // const res = await axios.put<{data:Pengumuman}>(`/api/a/announcements/${id}`, p); const updated = res.data.data;
    const updated: Pengumuman = { ...(p as any), id, views: selected.views };
    setData((prev) => prev.map((x) => (x.id === id ? updated : x)));
    Swal.fire({
      icon: "success",
      title: "Tersimpan",
      text: "Pengumuman diperbarui.",
      timer: 1200,
      showConfirmButton: false,
    });
  };
  const handleDelete = async (item: Pengumuman) => {
    const res = await Swal.fire({
      title: "Hapus pengumuman?",
      text: `"${item.judul}" akan dihapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
    });
    if (!res.isConfirmed) return;
    try {
      // await axios.delete(`/api/a/announcements/${item.id}`);
      setData((prev) => prev.filter((x) => x.id !== item.id));
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

  // Filter & sort
  const filtered = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();
    const priorityOrder: Record<PriorityLevel, number> = {
      Urgent: 4,
      Tinggi: 3,
      Sedang: 2,
      Rendah: 1,
    };
    return (data ?? [])
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
        return +new Date(b.tanggalPublish) - +new Date(a.tanggalPublish);
      });
  }, [data, filters]);

  const stats = useMemo(
    () => ({
      total: data.length,
      aktif: data.filter((p) => p.status === "Aktif").length,
      tahfidz: data.filter((p) => p.kategori === "Tahfidz").length,
      tahsin: data.filter((p) => p.kategori === "Tahsin").length,
      kajian: data.filter((p) => p.kategori === "Kajian").length,
      urgent: data.filter((p) => p.prioritas === "Urgent").length,
    }),
    [data]
  );

  const handleDetailClick = (p: Pengumuman) => {
    if (onOpenDetail) return onOpenDetail(p);
    navigate(`detail/${p.id}`, {
      state: { pengumuman: p, classId },
    });
  };

  const currentDate = new Date().toISOString();

  // state detail
  const { slug } = useParams();

  return (
    <div
      className="min-h-screen w-full transition-colors duration-200"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        gregorianDate={currentDate}
        title={title}
      />

      {/* Modals */}
      <AnnouncementModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        palette={palette}
        title="Tambah Pengumuman"
        onSubmit={handleAdd}
      />
      <AnnouncementModal
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelected(null);
        }}
        palette={palette}
        title={`Edit Pengumuman${selected ? `: ${selected.judul}` : ""}`}
        defaultValue={selected ?? undefined}
        onSubmit={handleEdit}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          <div className="lg:w-64 mb-6 lg:mb-0">
            <ParentSidebar palette={palette} />
          </div>

          <div className="flex-1 space-y-4">
            {/* Header & tombol tambah */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 hover:bg-opacity-10 hover:bg-black"
              style={{ color: palette.black1 }}
            >
              <ArrowLeft size={24} className="font-bold" />
              <span className=" font-semibold text-md">Kembali</span>
            </button>

            {/* Stats */}
            <SectionCard palette={palette} className="p-6">
              <div className="text-left">
                <h1 className="text-2xl font-bold mb-2">
                  {title}
                  {classId ? (
                    <span className="text-base font-normal opacity-80">
                      {" "}
                      • {classId}
                    </span>
                  ) : null}
                </h1>
                <p className="opacity-80 mb-6">
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
                    <p className="text-xs opacity-90">Total</p>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-green-600">
                      {stats.aktif}
                    </p>
                    <p className="text-xs opacity-90">Aktif</p>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-emerald-600">
                      {stats.tahfidz}
                    </p>
                    <p className="text-xs opacity-990">Tahfidz</p>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-cyan-600">
                      {stats.tahsin}
                    </p>
                    <p className="text-xs opacity-90">Tahsin</p>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.kajian}
                    </p>
                    <p className="text-xs opacity-90">Kajian</p>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg"
                    style={{ background: palette.white1 }}
                  >
                    <p className="text-2xl font-bold text-red-600">
                      {stats.urgent}
                    </p>
                    <p className="text-xs opacity-90">Urgent</p>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Filter */}
            <SearchFilter
              palette={palette}
              filters={filters}
              onChange={(patch) => setFilters((p) => ({ ...p, ...patch }))}
            />

            {/* Info hasil */}
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-90">
                Menampilkan {filtered.length} dari {data.length} pengumuman
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
                    onEdit={openEditByItem}
                    onDelete={handleDelete}
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

            {/* Optional Load more */}
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
          </div>
        </div>
      </main>
    </div>
  );
}
