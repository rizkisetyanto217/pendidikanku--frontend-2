import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
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
} from "lucide-react";

import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";
import SchoolSidebarNav from "@/pages/sekolahislamku/components/home/SchoolSideBarNav";
import SimpleTable from "@/components/common/main/SimpleTable";
import ActionEditDelete from "@/components/common/main/MainActionEditDelete";
import BookModal from "./components/BookModal"; // <-- komponen baru

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

  // rows
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
                <Btn
                  palette={palette}
                  onClick={() => setBookModal({ mode: "create" })}
                >
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
              onRowClick={(rowIndex) => {
                const book = items[rowIndex];
                if (!book) return;
                const qs = sp.toString();
                nav(
                  `${base}/sekolah/buku/detail/${book.books_id}${qs ? `?${qs}` : ""}`
                );
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
        // showBindingOnEdit // aktifkan kalau ingin binding juga saat edit
      />
    </div>
  );
}
