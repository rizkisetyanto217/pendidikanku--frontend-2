// src/pages/sekolahislamku/dashboard-school/books/SchoolBooks.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { useEffectiveMasjidId } from "@/hooks/useEffectiveMasjidId";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  X,
} from "lucide-react";

import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";
import SchoolSidebarNav from "@/pages/sekolahislamku/components/home/SchoolSideBarNav";

// Tabel & Aksi
import SimpleTable from "@/components/common/main/SimpleTable";
import ActionEditDelete from "@/components/common/main/MainActionEditDelete";

/* ============== Types API Baru ============== */
export type SectionLite = {
  class_sections_id: string;
  class_sections_name: string;
  class_sections_slug?: string | null;
  class_sections_code?: string | null;
  class_sections_capacity?: number | null;
  class_sections_is_active: boolean;
};

export type UsageItem = {
  class_subject_books_id: string;
  class_subjects_id: string;
  subjects_id: string;
  classes_id: string;
  sections: SectionLite[];
};

export type BookAPI = {
  books_id: string;
  books_masjid_id: string;
  books_title: string;
  books_author?: string | null;
  books_desc?: string | null;
  books_url?: string | null;
  books_image_url?: string | null;
  books_slug?: string | null;
  usages: UsageItem[];
};

export type BooksResponse = {
  data: BookAPI[];
  pagination: { limit: number; offset: number; total: number };
};

/* ============== Helpers ============== */
const yyyyMmDdLocal = (d = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

/* ============== Data Hook: ambil dari /api/a/books ============== */
function useBooksList(params: { limit: number; offset: number }) {
  const { limit, offset } = params;
  return useQuery<BooksResponse>({
    queryKey: ["books-list", { limit, offset }],
    queryFn: async () => {
      const r = await axios.get<BooksResponse>("/api/a/books", {
        withCredentials: true,
        params: { limit, offset },
      });
      return r.data;
    },
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
    retry: 1,
  });
}

/* ===== Helper: debounce value untuk pencarian kelas ===== */
function useDebounce<T>(value: T, delay = 350) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* ============== Modal: Tambah Buku (multipart + optional binding) ============== */
type ClassesSearchItem = {
  class_id: string;
  class_name: string;
  class_slug: string;
  class_is_active: boolean;
  subjects: {
    subjects_id: string;
    subjects_name: string;
    class_subjects_id: string;
  }[];
};
type ClassesSearchResponse = {
  data: ClassesSearchItem[];
  pagination: { limit: number; offset: number; total: number };
};

function AddBookModal({
  open,
  onClose,
  onCreated,
  palette,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  palette: Palette;
}) {
  const qc = useQueryClient();

  // —— form buku
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // —— optional binding
  const [bindEnabled, setBindEnabled] = useState(false);
  const [classQuery, setClassQuery] = useState("");
  const debouncedQ = useDebounce(classQuery, 400);
  const [selectedClassSubjectId, setSelectedClassSubjectId] = useState("");
  const [bindDesc, setBindDesc] = useState("");
  const [bindActive, setBindActive] = useState(true);

  useEffect(() => {
    if (!file) return setPreview(null);
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  // —— search kelas/mapel
  const classesQ = useQuery<ClassesSearchResponse>({
    queryKey: ["classes-search", debouncedQ],
    queryFn: async () => {
      const r = await axios.get<ClassesSearchResponse>(
        "/api/a/classes/search",
        {
          withCredentials: true,
          params: { q: debouncedQ, limit: 20 },
        }
      );
      return r.data;
    },
    enabled: open && bindEnabled && debouncedQ.trim().length >= 2,
    staleTime: 30_000,
  });

  const options = useMemo(() => {
    const rows = classesQ.data?.data ?? [];
    return rows.flatMap((c) =>
      (c.subjects || []).map((s) => ({
        id: s.class_subjects_id,
        label: `${c.class_name} — ${s.subjects_name}`,
      }))
    );
  }, [classesQ.data?.data]);

  // —— create: buku (+ optional binding)
  const createMutation = useMutation({
    mutationFn: async () => {
      // 1) buat buku
      const fd = new FormData();
      fd.set("books_title", title);
      if (author) fd.set("books_author", author);
      if (desc) fd.set("books_desc", desc);
      if (url) fd.set("books_url", url);
      if (file) fd.set("books_image_url", file); // field file sesuai API
      const createRes = await axios.post("/api/a/books", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newBookId: string =
        createRes?.data?.data?.books_id ?? createRes?.data?.books_id;

      // 2) optional: binding ke class_subject
      if (bindEnabled && selectedClassSubjectId) {
        try {
          await axios.post(
            "/api/a/class-subject-books",
            {
              class_subject_books_class_subject_id: selectedClassSubjectId,
              class_subject_books_book_id: newBookId,
              class_subject_books_description: bindDesc || undefined,
              class_subject_books_is_active: bindActive,
              is_active: bindActive, // kalau API terima alias
            },
            { withCredentials: true }
          );
        } catch (e: any) {
          // Buku sudah dibuat, tapi binding gagal — beritahu user secara jelas
          throw new Error(
            e?.response?.data?.message ||
              "Buku dibuat, tapi gagal mengaitkan ke kelas/mapel."
          );
        }
      }

      return newBookId;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["books-list"] });
      // reset form
      setTitle("");
      setAuthor("");
      setDesc("");
      setUrl("");
      setFile(null);
      setBindEnabled(false);
      setClassQuery("");
      setSelectedClassSubjectId("");
      setBindDesc("");
      setBindActive(true);
      onCreated();
    },
    onError: (err: any) => {
      alert(
        err?.message || err?.response?.data?.message || "Gagal menambah buku."
      );
    },
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center p-3"
      style={{ background: "rgba(0,0,0,.45)" }}
      onClick={() => !createMutation.isPending && onClose()}
    >
      <SectionCard
        palette={palette}
        className="w-[min(760px,96vw)] p-4 md:p-6 rounded-2xl shadow-xl"
      >
        <div onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-base md:text-lg font-semibold">
              Tambah Buku
            </div>
            <button
              className="opacity-70 hover:opacity-100"
              onClick={() => !createMutation.isPending && onClose()}
              aria-label="Tutup"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form grid */}
          <div className="grid md:grid-cols-12 gap-4">
            {/* Cover */}
            <div className="md:col-span-4">
              <div
                className="w-full aspect-[3/4] rounded-xl overflow-hidden grid place-items-center"
                style={{ background: "#f3f4f6" }}
              >
                {preview ? (
                  <img
                    src={preview}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <span className="text-xs opacity-60">Preview cover</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="mt-3 block w-full text-sm"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {/* Fields */}
            <div className="md:col-span-8 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span>
                  Judul <span className="text-red-500">*</span>
                </span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3 py-2 rounded-lg border bg-transparent"
                  placeholder="cth. Matematika Kelas 7"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="grid gap-1 text-sm">
                  <span>Penulis</span>
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="px-3 py-2 rounded-lg border bg-transparent"
                    placeholder="cth. Budi Santoso"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>URL (opsional)</span>
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="px-3 py-2 rounded-lg border bg-transparent"
                    placeholder="https://penerbit-cerdas.id/..."
                  />
                </label>
              </div>

              <label className="grid gap-1 text-sm">
                <span>Deskripsi</span>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="px-3 py-2 rounded-lg border bg-transparent min-h-[84px]"
                  placeholder="Edisi / catatan lain…"
                />
              </label>

              {/* —— OPTIONAL BINDING —— */}
              <div
                className="mt-2 pt-3 border-t"
                style={{ borderColor: colors.light.silver1 }}
              >
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={bindEnabled}
                    onChange={(e) => setBindEnabled(e.target.checked)}
                  />
                  Hubungkan ke Kelas / Mapel (opsional)
                </label>

                {bindEnabled && (
                  <div className="mt-3 grid gap-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <label className="grid gap-1 text-sm">
                        <span>Cari kelas (min. 2 huruf)</span>
                        <input
                          value={classQuery}
                          onChange={(e) => setClassQuery(e.target.value)}
                          className="px-3 py-2 rounded-lg border bg-transparent"
                          placeholder='cth. "Level 1"'
                        />
                      </label>

                      <label className="grid gap-1 text-sm">
                        <span>Pilih Kelas — Mapel</span>
                        <select
                          value={selectedClassSubjectId}
                          onChange={(e) =>
                            setSelectedClassSubjectId(e.target.value)
                          }
                          className="px-3 py-2 rounded-lg border bg-transparent"
                          disabled={!options.length && !!debouncedQ}
                        >
                          <option value="">— Pilih —</option>
                          {options.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        {bindEnabled && debouncedQ && (
                          <div className="text-[11px] opacity-60 mt-1">
                            {classesQ.isFetching
                              ? "Mencari…"
                              : `${options.length} opsi ditemukan`}
                          </div>
                        )}
                      </label>
                    </div>

                    <label className="grid gap-1 text-sm">
                      <span>Deskripsi keterkaitan (opsional)</span>
                      <textarea
                        value={bindDesc}
                        onChange={(e) => setBindDesc(e.target.value)}
                        className="px-3 py-2 rounded-lg border bg-transparent min-h-[72px]"
                        placeholder="Buku wajib untuk semester ganjil…"
                      />
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={bindActive}
                        onChange={(e) => setBindActive(e.target.checked)}
                      />
                      Tandai keterkaitan sebagai aktif
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center justify-end gap-2">
            <Btn
              palette={palette}
              variant="ghost"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Batal
            </Btn>
            <Btn
              palette={palette}
              loading={createMutation.isPending}
              onClick={() => {
                if (!title.trim()) return alert("Judul wajib diisi.");
                if (bindEnabled && !selectedClassSubjectId) {
                  const ok = confirm(
                    "Belum memilih Kelas — Mapel. Lanjutkan tanpa mengaitkan?"
                  );
                  if (!ok) return;
                }
                createMutation.mutate();
              }}
            >
              Simpan
            </Btn>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ============== Modal: Edit Buku (multipart PUT) ============== */
function EditBookModal({
  open,
  onClose,
  onUpdated,
  palette,
  book,
}: {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  palette: Palette;
  book: BookAPI | null;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(book?.books_title ?? "");
  const [author, setAuthor] = useState(book?.books_author ?? "");
  const [desc, setDesc] = useState(book?.books_desc ?? "");
  const [url, setUrl] = useState(book?.books_url ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    book?.books_image_url ?? null
  );

  useEffect(() => {
    setTitle(book?.books_title ?? "");
    setAuthor(book?.books_author ?? "");
    setDesc(book?.books_desc ?? "");
    setUrl(book?.books_url ?? "");
    setPreview(book?.books_image_url ?? null);
    setFile(null);
  }, [book?.books_id]);

  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!book) return;
      const fd = new FormData();
      fd.set("books_title", title);
      fd.set("books_author", author || "");
      fd.set("books_desc", desc || "");
      fd.set("books_url", url || "");
      if (file) fd.set("books_image_url", file);
      const r = await axios.put(`/api/a/books/${book.books_id}`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return r.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["books-list"] });
      onUpdated();
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "Gagal memperbarui buku.");
    },
  });

  if (!open || !book) return null;
  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center p-3"
      style={{ background: "rgba(0,0,0,.45)" }}
      onClick={() => !updateMutation.isPending && onClose()}
    >
      <SectionCard
        palette={palette}
        className="w-[min(640px,96vw)] p-4 md:p-6 rounded-2xl shadow-xl"
      >
        <div onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-base md:text-lg font-semibold">Edit Buku</div>
            <button
              className="opacity-70 hover:opacity-100"
              onClick={() => !updateMutation.isPending && onClose()}
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <div
                className="w-full aspect-[3/4] rounded-xl overflow-hidden grid place-items-center"
                style={{ background: "#f3f4f6" }}
              >
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs opacity-60">Preview cover</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="mt-3 block w-full text-sm"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="md:col-span-8 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span>
                  Judul <span className="text-red-500">*</span>
                </span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3 py-2 rounded-lg border bg-transparent"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Penulis</span>
                <input
                  value={author ?? ""}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="px-3 py-2 rounded-lg border bg-transparent"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Deskripsi</span>
                <textarea
                  value={desc ?? ""}
                  onChange={(e) => setDesc(e.target.value)}
                  className="px-3 py-2 rounded-lg border bg-transparent min-h-[84px]"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>URL (opsional)</span>
                <input
                  value={url ?? ""}
                  onChange={(e) => setUrl(e.target.value)}
                  className="px-3 py-2 rounded-lg border bg-transparent"
                />
              </label>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <Btn
              palette={palette}
              variant="ghost"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Batal
            </Btn>
            <Btn
              palette={palette}
              loading={updateMutation.isPending}
              onClick={() => {
                if (!title.trim()) return alert("Judul wajib diisi.");
                updateMutation.mutate();
              }}
            >
              Simpan
            </Btn>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ============== Page ============== */
export default function SchoolBooks() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;
  useEffectiveMasjidId();

  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const [q, setQ] = useState(sp.get("q") || "");

  const limit = Math.min(Math.max(Number(sp.get("limit") || 20), 1), 200);
  const offset = Math.max(Number(sp.get("offset") || 0), 0);

  const booksQ = useBooksList({ limit, offset });

  // modals
  const [openAddBook, setOpenAddBook] = useState(false);
  const [openAddBinding, setOpenAddBinding] = useState(false);
  const [presetBookId, setPresetBookId] = useState<string | undefined>();
  const [editBook, setEditBook] = useState<BookAPI | null>(null);

  // delete book mutation (by id)
  const qc = useQueryClient();
  const deleteBook = useMutation({
    mutationFn: async (bookId: string) => {
      const r = await axios.delete(`/api/a/books/${bookId}`, {
        withCredentials: true,
      });
      return r.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["books-list"] });
    },
    onError: (err: any) => {
      alert(
        err?.response?.data?.message ??
          "Gagal menghapus buku. Pastikan tidak ada keterkaitan aktif."
      );
    },
  });

  // filter client-side
  const items = useMemo(() => {
    const src = booksQ.data?.data ?? [];
    const text = q.trim().toLowerCase();
    if (!text) return src;
    return src.filter((b) =>
      [b.books_title, b.books_author, b.books_slug]
        .filter(Boolean)
        .join("\n")
        .toLowerCase()
        .includes(text)
    );
  }, [booksQ.data?.data, q]);

  const total = booksQ.data?.pagination?.total ?? 0;
  const showing = items.length;

  const onPage = (dir: -1 | 1) => {
    const nextOffset = Math.max(offset + dir * limit, 0);
    setSp(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.set("limit", String(limit));
        p.set("offset", String(nextOffset));
        return p;
      },
      { replace: true }
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Build rows for SimpleTable
  const rows = useMemo(() => {
    return items.map((b, idx): React.ReactNode[] => {
      const cover = b.books_image_url ? (
        <img
          src={b.books_image_url}
          alt={b.books_title}
          className="w-10 h-14 object-cover rounded-md bg-gray-100"
          loading="lazy"
        />
      ) : (
        <span className="w-10 h-14 grid place-items-center rounded-md bg-gray-100">
          <ImageOff size={16} />
        </span>
      );

      const titleBlock = (
        <div className="min-w-0">
          <div className="font-medium">{b.books_title || "(Tanpa judul)"}</div>
          <div className="text-xs opacity-70">{b.books_author || "-"}</div>
          {!!b.books_desc && (
            <div className="text-[11px] opacity-60 mt-1 line-clamp-2">
              {b.books_desc}
            </div>
          )}
          {b.books_url && (
            <a
              href={b.books_url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs underline mt-1"
              style={{ color: palette.primary }}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={14} /> Kunjungi
            </a>
          )}
        </div>
      );

      const sectionsFlat = b.usages.flatMap((u) => u.sections ?? []);
      const dipakaiDi =
        sectionsFlat.length === 0 ? (
          <span className="opacity-60 text-xs">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {sectionsFlat.map((s) => (
              <span
                key={s.class_sections_id}
                className="px-2 py-[2px] rounded-full text-[11px] border"
                style={{
                  borderColor: palette.silver1,
                  background: isDark ? colors.dark.white2 : colors.light.white2,
                }}
                title={s.class_sections_slug ?? s.class_sections_name}
              >
                {s.class_sections_name}
                {s.class_sections_code ? ` (${s.class_sections_code})` : ""}
              </span>
            ))}
          </div>
        );

      const slugId = b.books_slug ? `/${b.books_slug}` : b.books_id.slice(0, 8);

      const actions = (
        <ActionEditDelete
          onEdit={() => setEditBook(b)}
          onDelete={() => {
            if (deleteBook.isPending) return;
            const ok = confirm(
              `Hapus buku ini?\nJudul: ${b.books_title ?? "-"}`
            );
            if (!ok) return;
            deleteBook.mutate(b.books_id);
          }}
        />
      );

      return [
        String(offset + idx + 1), // No
        cover,
        titleBlock, // kolom ini akan digabung dengan No di mobile
        dipakaiDi,
        <span className="text-xs opacity-70">{slugId}</span>,
        actions,
      ];
    });
  }, [items, palette, offset, isDark, deleteBook.isPending]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Buku Pelajaran"
        gregorianDate={new Date().toISOString()}
        hijriDate={undefined}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <SchoolSidebarNav palette={palette} />

          <div className="flex-1 space-y-6 min-w-0 lg:p-4">
            {/* Header */}
            <section className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className="h-10 w-10 grid place-items-center rounded-xl"
                  style={{
                    background: palette.primary2,
                    color: palette.primary,
                  }}
                >
                  <BookOpen size={18} />
                </span>
                <div>
                  <div className="text-lg font-semibold">Buku Pelajaran</div>
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Sumber buku dan pemakaiannya di kelas/section.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Btn palette={palette} onClick={() => setOpenAddBook(true)}>
                  + Buku
                </Btn>
              </div>
            </section>

            {/* Toolbar */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 font-medium">Filter</div>
              <div className="px-4 md:px-5 pb-4 grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-2">
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.silver2 }}
                  >
                    Pencarian
                  </div>
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-2 top-1/2 -translate-y-1/2 opacity-60"
                    />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Cari judul/penulis/slug…"
                      className="pl-7 pr-3 py-2 rounded-lg text-sm border w-full bg-transparent"
                      style={{ borderColor: palette.silver1 }}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Ringkasan */}
            <div className="text-xs px-1" style={{ color: palette.silver2 }}>
              {yyyyMmDdLocal()} •{" "}
              {booksQ.isFetching ? "memuat…" : `${total} total`}
            </div>

            {/* TABEL */}
            <SimpleTable
              columns={[
                "No",
                "Cover",
                "Judul & Penulis",
                "Dipakai di (Section)",
                "Slug/ID",
                "Aksi",
              ]}
              rows={rows}
              onRowClick={(i) => {
                const b = items[i];
                // buka detail jika ada usage pertama; kalau tidak, tetap boleh arahkan ke halaman detail buku-mu
                const firstCSB = b.usages[0]?.class_subject_books_id;
                useNavigate(); // NOTE: jangan panggil hook di sini — kita pakai 'nav' di luar
              }}
              emptyText={booksQ.isLoading ? "Memuat…" : "Belum ada buku."}
            />

            {/* Pagination */}
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs" style={{ color: palette.silver2 }}>
                Menampilkan {showing} dari {total}
              </div>
              <div className="flex items-center gap-2">
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={() => onPage(-1)}
                  disabled={offset <= 0 || booksQ.isFetching}
                >
                  <ChevronLeft size={16} /> Prev
                </Btn>
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={() => onPage(1)}
                  disabled={offset + limit >= total || booksQ.isFetching}
                >
                  Next <ChevronRight size={16} />
                </Btn>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddBookModal
        open={openAddBook}
        onClose={() => setOpenAddBook(false)}
        palette={palette}
        onCreated={() => {
          setOpenAddBook(false);
          booksQ.refetch();
        }}
      />
      <EditBookModal
        open={!!editBook}
        onClose={() => setEditBook(null)}
        palette={palette}
        book={editBook}
        onUpdated={() => {
          setEditBook(null);
          booksQ.refetch();
        }}
      />
    </div>
  );
}
