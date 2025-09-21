// src/pages/sekolahislamku/dashboard-school/books/SchoolBooks.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import axios from "@/lib/axios";
import { useEffectiveMasjidId } from "@/hooks/useEffectiveMasjidId";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
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
  ArrowLeft,
} from "lucide-react";

import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import SimpleTable from "@/components/common/main/SimpleTable";
import ActionEditDelete from "@/components/common/main/MainActionEditDelete";
import BookModal from "./components/BookModal";
import ParentSidebar from "../../components/home/ParentSideBar";

/* ============== Types API ============== */
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

type SchoolBooksProps = {
  showBack?: boolean; // default: false
  backTo?: string; // optional: kalau diisi, navigate ke path ini, kalau tidak pakai nav(-1)
  backLabel?: string; // teks tombol
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

// --- timezone-safe helpers (pakai “siang lokal”)
const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};

const hijriWithWeekday = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/* ============== Data Hook: /api/a/books ============== */
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

/* ============== Dummy Data ============== */
const DUMMY_BOOKS: BookAPI[] = [
  {
    books_id: "dummy-1",
    books_masjid_id: "masjid-1",
    books_title: "Matematika Dasar",
    books_author: "Ahmad Fauzi",
    books_desc: "Buku dasar untuk memahami konsep matematika SD.",
    books_url: "https://contoh.com/matematika-dasar",
    books_image_url: null,
    books_slug: "matematika-dasar",
    usages: [
      {
        class_subject_books_id: "csb-1",
        class_subjects_id: "sub-1",
        subjects_id: "mat-1",
        classes_id: "cls-1",
        sections: [
          {
            class_sections_id: "sec-1",
            class_sections_name: "Kelas 1A",
            class_sections_slug: "kelas-1a",
            class_sections_code: "1A",
            class_sections_capacity: 30,
            class_sections_is_active: true,
          },
        ],
      },
    ],
  },
  {
    books_id: "dummy-2",
    books_masjid_id: "masjid-1",
    books_title: "Bahasa Indonesia",
    books_author: "Siti Nurhaliza",
    books_desc: "Panduan belajar Bahasa Indonesia dengan mudah.",
    books_url: "https://contoh.com/bahasa-indonesia",
    books_image_url: null,
    books_slug: "bahasa-indonesia",
    usages: [],
  },
  {
    books_id: "dummy-3",
    books_masjid_id: "masjid-1",
    books_title: "IPA Terapan",
    books_author: "Budi Santoso",
    books_desc: "Eksperimen IPA untuk siswa SMP.",
    books_url: null,
    books_image_url: null,
    books_slug: "ipa-terapan",
    usages: [],
  },
];

/* ============== Skeletons ============== */
function CardSkeleton({ palette }: { palette: Palette }) {
  return (
    <div
      className="rounded-xl border p-4 animate-pulse"
      style={{ borderColor: palette.silver1, background: palette.white1 }}
    >
      <div className="flex gap-3">
        <div
          className="w-10 h-14 rounded-md"
          style={{ background: palette.white2 }}
        />
        <div className="flex-1 space-y-2">
          <div
            className="h-4 w-2/3 rounded"
            style={{ background: palette.white2 }}
          />
          <div
            className="h-3 w-1/2 rounded"
            style={{ background: palette.white2 }}
          />
          <div
            className="h-3 w-full rounded"
            style={{ background: palette.white2 }}
          />
        </div>
      </div>
    </div>
  );
}

/* ============== Page ============== */
const SchoolBooks: React.FC<SchoolBooksProps> = ({
  showBack = false,
  backTo,
  backLabel = "Kembali",
}) => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const navigate = useNavigate();
  useEffectiveMasjidId();

  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const [q, setQ] = useState(sp.get("q") || "");

  const limit = Math.min(Math.max(Number(sp.get("limit") || 20), 1), 200);
  const offset = Math.max(Number(sp.get("offset") || 0), 0);

  const booksQ = useBooksList({ limit, offset });

  // —— modal gabungan
  const [bookModal, setBookModal] = useState<{
    mode: "create" | "edit";
    book?: BookAPI | null;
  } | null>(null);

  // slug base
  const { slug = "" } = useParams<{ slug: string }>();
  const base = slug ? `/${encodeURIComponent(slug)}` : "";

  // delete
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

  // filter client-side dengan fallback dummy
  const items = useMemo(() => {
    const src =
      booksQ.data?.data && booksQ.data.data.length > 0
        ? booksQ.data.data
        : DUMMY_BOOKS;

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
        if (q) p.set("q", q);
        return p;
      },
      { replace: true }
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // table rows (md+)
  const rows = useMemo(() => {
    return items.map((b, idx): React.ReactNode[] => {
      const cover = b.books_image_url ? (
        <img
          src={b.books_image_url}
          alt={b.books_title}
          className="w-10 h-14 object-cover rounded-md"
          loading="lazy"
          style={{ background: palette.white2 }}
        />
      ) : (
        <span
          className="w-10 h-14 grid place-items-center rounded-md"
          style={{ background: palette.white2 }}
        >
          <ImageOff size={16} />
        </span>
      );

      const titleBlock = (
        <div className="min-w-0">
          <div className="font-medium truncate">
            {b.books_title || "(Tanpa judul)"}
          </div>
          <div className="text-xs opacity-70 truncate">
            {b.books_author || "-"}
          </div>
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
                  background: isDark ? palette.white2 : palette.white2,
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
        <div onClick={(e) => e.stopPropagation()}>
          <ActionEditDelete
            onEdit={() => setBookModal({ mode: "edit", book: b })}
            onDelete={() => {
              if (deleteBook.isPending) return;
              const ok = confirm(
                `Hapus buku ini?\nJudul: ${b.books_title ?? "-"}`
              );
              if (!ok) return;
              deleteBook.mutate(b.books_id);
            }}
          />
        </div>
      );

      return [
        String(offset + idx + 1),
        cover,
        titleBlock,
        dipakaiDi,
        <span className="text-xs opacity-70">{slugId}</span>,
        actions,
      ];
    });
  }, [items, palette, offset, isDark, deleteBook.isPending]);

  // mobile cards (<md)
  const MobileCards = () => (
    <div className="grid grid-cols-1 gap-3">
      {items.map((b) => {
        const sectionsFlat = b.usages.flatMap((u) => u.sections ?? []);
        return (
          <div
            key={b.books_id}
            className="rounded-xl border p-3 flex gap-3"
            style={{ borderColor: palette.silver1, background: palette.white1 }}
            onClick={() => {
              const qs = sp.toString();
              nav(
                `${base}/sekolah/buku/detail/${b.books_id}${qs ? `?${qs}` : ""}`
              );
            }}
          >
            <div className="shrink-0">
              {b.books_image_url ? (
                <img
                  src={b.books_image_url}
                  alt={b.books_title}
                  className="w-12 h-16 object-cover rounded-md"
                  style={{ background: palette.white2 }}
                  loading="lazy"
                />
              ) : (
                <span
                  className="w-12 h-16 grid place-items-center rounded-md"
                  style={{ background: palette.white2 }}
                >
                  <ImageOff size={16} />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">
                {b.books_title || "(Tanpa judul)"}
              </div>
              <div className="text-xs opacity-70 truncate">
                {b.books_author || "-"}
              </div>
              {!!b.books_desc && (
                <div className="text-[11px] opacity-60 mt-1 line-clamp-2">
                  {b.books_desc}
                </div>
              )}
              {sectionsFlat.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {sectionsFlat.slice(0, 4).map((s) => (
                    <span
                      key={s.class_sections_id}
                      className="px-2 py-[2px] rounded-full text-[11px] border"
                      style={{
                        borderColor: palette.silver1,
                        background: isDark ? palette.white2 : palette.white2,
                      }}
                    >
                      {s.class_sections_name}
                    </span>
                  ))}
                  {sectionsFlat.length > 4 && (
                    <span className="text-[11px] opacity-60">
                      +{sectionsFlat.length - 4} lagi
                    </span>
                  )}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                {b.books_url && (
                  <a
                    href={b.books_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-xs underline"
                    style={{ color: palette.primary }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={14} /> Kunjungi
                  </a>
                )}
                <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                  <ActionEditDelete
                    onEdit={() => setBookModal({ mode: "edit", book: b })}
                    onDelete={() => {
                      if (deleteBook.isPending) return;
                      const ok = confirm(
                        `Hapus buku ini?\nJudul: ${b.books_title ?? "-"}`
                      );
                      if (!ok) return;
                      deleteBook.mutate(b.books_id);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Buku Pelajaran"
        gregorianDate={new Date().toISOString()}
        hijriDate={hijriWithWeekday(new Date().toISOString())}
        dateFmt={dateLong}
      />

      <main className="mx-auto  px-7 md:py-8  ">
        <div className="lg:flex lg:items-start lg:gap-6">
          {/* Sidebar kiri (sticky di desktop) */}
          <aside className="lg:w-64 mb-6 lg:mb-0 lg:sticky lg:top-16 shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Konten utama */}
          <div className="flex-1 space-y-5 md:space-x-8">
            {/* Header */}

            <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2  ">
              <div className="flex items-center gap-4 md:-mt-2 md:mx-8">
                {showBack && (
                  <Btn
                    palette={palette}
                    variant="ghost"
                    onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                    className="w-auto  gap-2"
                    aria-label={backLabel}
                    title={backLabel}
                  >
                    <ArrowLeft size={20} />
                  </Btn>
                )}
                <h1 className="text-lg font-semibold  ">Buku Pelajaran</h1>
              </div>

              <div className="flex items-center gap-2 mt-2 ">
                <Btn
                  palette={palette}
                  onClick={() => setBookModal({ mode: "create" })}
                  className="px-4"
                >
                  + Buku
                </Btn>
              </div>
            </section>

            {/* Toolbar */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-3 pb-3 font-medium">Filter</div>
              <div className="px-4 md:px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2">
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.black2 }}
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
            <div className="text-xs px-1" style={{ color: palette.black2 }}>
              {yyyyMmDdLocal()} •{" "}
              {booksQ.isFetching ? "memuat…" : `${total} total`}
            </div>

            {/* List: Mobile Cards vs Desktop Table */}
            {/* Mobile */}
            <div className="md:hidden">
              {booksQ.isLoading ? (
                <div className="grid grid-cols-1 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={i} palette={palette} />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <SectionCard palette={palette} className="p-10 text-center">
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    {q
                      ? "Tidak ada hasil untuk pencarianmu."
                      : "Belum ada buku."}
                  </div>
                </SectionCard>
              ) : (
                <MobileCards />
              )}
            </div>

            {/* Desktop */}
            <div className="hidden md:block " style={{ color: palette.black2 }}>
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
                onRowClick={(rowIndex) => {
                  const book = items[rowIndex];
                  if (!book) return;
                  const qs = sp.toString();
                  nav(
                    `${base}/sekolah/buku/detail/${book.books_id}${
                      qs ? `?${qs}` : ""
                    }`
                  );
                }}
                emptyText={booksQ.isLoading ? "Memuat…" : "Belum ada buku."}
              />
            </div>

            {/* Pagination */}
            <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs" style={{ color: palette.black2 }}>
                Menampilkan {showing} dari {total}
              </div>
              <div className="flex items-center gap-2">
                <Btn
                  palette={palette}
                  variant="default"
                  onClick={() => onPage(-1)}
                  disabled={offset <= 0 || booksQ.isFetching}
                >
                  <ChevronLeft size={16} /> Prev
                </Btn>
                <Btn
                  palette={palette}
                  variant="default"
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

      {/* Modal gabungan */}
      <BookModal
        open={!!bookModal}
        mode={bookModal?.mode ?? "create"}
        book={bookModal?.book ?? null}
        palette={palette}
        onClose={() => setBookModal(null)}
        onSuccess={() => {
          setBookModal(null);
          booksQ.refetch();
        }}
      />
    </div>
  );
};

export default SchoolBooks;
