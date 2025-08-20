// src/pages/sekolahislamku/pages/books/SchoolDetailBook.tsx
import React, { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { useEffectiveMasjidId } from "@/hooks/useEffectiveMasjidId";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import {
  BookOpen,
  ExternalLink,
  ArrowLeft,
  ImageOff,
  Link as LinkIc,
} from "lucide-react";
import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";
import SchoolSidebarNav from "@/pages/sekolahislamku/components/home/SchoolSideBarNav";

/* ===================== Types (sesuai API) ===================== */
export type BookAPI = {
  books_id: string;
  books_masjid_id: string;
  books_title: string;
  books_author?: string | null;
  books_url?: string | null;
  books_image_url?: string | null;
  books_slug?: string | null;
};

export type ClassSectionLite = {
  class_sections_id: string;
  class_sections_name: string;
  class_sections_slug?: string | null;
  class_sections_code?: string | null;
  class_sections_capacity?: number | null;
  class_sections_is_active?: boolean | null;
};

export type ClassSubjectBookAPI = {
  class_subject_books_id: string;
  class_subject_books_masjid_id: string;
  class_subject_books_class_subject_id: string;
  class_subject_books_book_id: string;
  class_subject_books_is_active: boolean;
  class_subject_books_created_at: string;
  class_subject_books_updated_at?: string | null;
  book?: BookAPI | null;
  section?: ClassSectionLite | null; // ← dari API detail
};

export type ClassSubjectBooksResponse = {
  data: ClassSubjectBookAPI[];
  pagination: { limit: number; offset: number; total: number };
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

/* ===================== Helpers ===================== */
const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s.trim()
  );

/* ===================== Fetchers ===================== */
async function fetchByCSBId(id: string) {
  const r = await axios.get<{ data: ClassSubjectBookAPI }>(
    `/api/a/class-subject-books/${id}`,
    { withCredentials: true }
  );
  const csb = r.data?.data;
  if (!csb || !csb.book) throw new Error("Buku tidak ditemukan");
  return {
    book: csb.book as BookAPI,
    bindings: [csb] as ClassSubjectBookAPI[],
  };
}

async function fetchByBookSlugOrFallback(slugOrId: string) {
  // 1) coba by-slug
  try {
    const r = await axios.get<{ data?: BookAPI }>(
      `/api/u/books/by-slug/${slugOrId}`,
      { withCredentials: true }
    );
    const book = (r.data?.data as BookAPI) || (r as any)?.data;
    if (book && book.books_id) {
      // 2) kumpulkan semua binding CSB untuk buku tsb
      const r2 = await axios.get<ClassSubjectBooksResponse>(
        "/api/u/class-subject-books",
        { withCredentials: true, params: { limit: 200, offset: 0 } }
      );
      const all = r2.data?.data ?? [];
      const bindings = all.filter((x) => x.book?.books_id === book.books_id);
      return { book, bindings };
    }
  } catch {
    // abaikan → lanjut fallback
  }

  // 3) fallback: tarik list dan cari yang matching id/slug
  const r2 = await axios.get<ClassSubjectBooksResponse>(
    "/api/u/class-subject-books",
    { withCredentials: true, params: { limit: 200, offset: 0 } }
  );
  const all = r2.data?.data ?? [];
  const first = all.find(
    (x) => x.book?.books_slug === slugOrId || x.book?.books_id === slugOrId
  );
  const book = first?.book ?? null;
  if (!book) throw new Error("Buku tidak ditemukan");
  const bindings = all.filter((x) => x.book?.books_id === book.books_id);
  return { book, bindings };
}

async function fetchBookDetailSmart(slugOrId: string) {
  if (isUUID(slugOrId)) {
    // Asumsikan ini ID class_subject_books → ambil detail dari API
    try {
      return await fetchByCSBId(slugOrId);
    } catch {
      // kalau gagal, fallback ke mode slug
      return await fetchByBookSlugOrFallback(slugOrId);
    }
  }
  // Param bukan UUID → perlakukan sebagai slug buku
  return await fetchByBookSlugOrFallback(slugOrId);
}

/* ===================== Page ===================== */
export default function SchoolDetailBook() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const nav = useNavigate();

  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;
  useEffectiveMasjidId();

  const q = useQuery({
    queryKey: ["book-detail", id],
    queryFn: () => fetchBookDetailSmart(id),
    enabled: !!id,
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
    retry: 1,
  });

  const b = q.data?.book;
  const bindings = q.data?.bindings ?? [];
  const activeCount = useMemo(
    () =>
      (bindings || []).filter((x) => x.class_subject_books_is_active).length,
    [bindings]
  );

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top bar */}
      <ParentTopBar
        palette={palette}
        title="Detail Buku"
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
                  <div className="text-lg font-semibold">Detail Buku</div>
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Informasi buku & keterkaitannya dengan mapel.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Btn palette={palette} variant="ghost" onClick={() => nav(-1)}>
                  <ArrowLeft size={16} /> Kembali
                </Btn>
                <Btn
                  palette={palette}
                  variant="outline"
                  onClick={() =>
                    navigator.clipboard.writeText(window.location.href)
                  }
                  disabled={q.isLoading}
                  title="Salin tautan"
                >
                  <LinkIc size={14} /> Salin URL
                </Btn>
                {b?.books_url && (
                  <a
                    href={b.books_url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <Btn palette={palette} variant="default">
                      <ExternalLink size={14} /> Buka Tautan
                    </Btn>
                  </a>
                )}
              </div>
            </section>

            {/* Detail Card */}
            <SectionCard palette={palette} className="overflow-hidden">
              <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Cover */}
                <div className="md:col-span-4">
                  <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 grid place-items-center">
                    {b?.books_image_url ? (
                      <img
                        src={b.books_image_url}
                        alt={b?.books_title || "Book cover"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full opacity-60">
                        <ImageOff size={24} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="md:col-span-8 min-w-0">
                  <h2 className="text-lg md:text-2xl font-semibold leading-tight mb-2">
                    {b?.books_title ?? "(Tanpa judul)"}
                  </h2>
                  <div
                    className="text-sm mb-3"
                    style={{ color: palette.silver2 }}
                  >
                    {b?.books_author || "-"}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge palette={palette} variant="outline">
                      ID: {b?.books_id}
                    </Badge>
                    {!!b?.books_slug && (
                      <Badge palette={palette} variant="outline">
                        /{b.books_slug}
                      </Badge>
                    )}
                    <Badge
                      palette={palette}
                      variant={activeCount > 0 ? "success" : "outline"}
                    >
                      Dipakai di {activeCount} mapel aktif
                    </Badge>
                  </div>

                  {b?.books_url ? (
                    <p className="text-sm break-words">
                      Sumber:{" "}
                      <a
                        href={b.books_url}
                        className="underline"
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {b.books_url}
                      </a>
                    </p>
                  ) : (
                    <p className="text-sm opacity-70">
                      Tidak ada tautan sumber.
                    </p>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Bindings */}
            <div>
              <h3 className="text-sm font-semibold mb-2">
                Mapel yang menggunakan buku ini
              </h3>

              {q.isLoading && <div className="text-sm opacity-70">Memuat…</div>}

              {!q.isLoading && (bindings?.length ?? 0) === 0 && (
                <SectionCard palette={palette}>
                  <div className="p-4 text-sm">
                    Belum ada data keterkaitan buku dengan mapel.
                  </div>
                </SectionCard>
              )}

              {(bindings?.length ?? 0) > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bindings!.map((csb) => (
                    <SectionCard
                      key={csb.class_subject_books_id}
                      palette={palette}
                    >
                      <div className="p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="font-medium">Class Subject</div>
                            <div className="text-xs opacity-70">
                              {csb.class_subject_books_class_subject_id}
                            </div>
                            {/* Section dari API detail */}
                            {csb.section && (
                              <div className="mt-1 text-xs">
                                Kelas: {csb.section.class_sections_name}
                                {csb.section.class_sections_code
                                  ? ` (${csb.section.class_sections_code})`
                                  : ""}
                              </div>
                            )}
                          </div>
                          <Badge
                            palette={palette}
                            variant={
                              csb.class_subject_books_is_active
                                ? "success"
                                : "outline"
                            }
                          >
                            {csb.class_subject_books_is_active
                              ? "Aktif"
                              : "Nonaktif"}
                          </Badge>
                        </div>
                        <div className="mt-2 text-[11px] opacity-70">
                          CSB ID: {csb.class_subject_books_id}
                        </div>
                      </div>
                    </SectionCard>
                  ))}
                </div>
              )}
            </div>

            {/* Footer nav */}
            <div>
              <Link
                to="/buku"
                className="text-sm"
                style={{ color: palette.primary }}
              >
                ← Kembali ke daftar buku
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
