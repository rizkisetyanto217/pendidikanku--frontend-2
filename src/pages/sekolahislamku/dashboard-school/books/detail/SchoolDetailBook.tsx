// src/pages/sekolahislamku/dashboard-school/books/SchoolBookDetail.tsx
import React, { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";
import SchoolSidebarNav from "@/pages/sekolahislamku/components/home/SchoolSideBarNav";
import { BookOpen, ArrowLeft, ExternalLink, ImageOff } from "lucide-react";

/* ==================== Types (ikuti payload API detail) ==================== */
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
export type BookDetail = {
  books_id: string;
  books_masjid_id: string;
  books_title: string;
  books_author?: string | null;
  books_desc?: string | null;
  books_url?: string | null;
  books_image_url?: string | null;
  books_slug?: string | null;
  usages?: UsageItem[]; // <- bisa undefined/[]
};
type BookDetailResp = { data: BookDetail; message?: string };

/* ==================== Helpers ==================== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

/* ==================== Fetcher ==================== */
async function fetchBookDetail(id: string): Promise<BookDetail | null> {
  const r = await axios.get<BookDetailResp>(`/api/a/books/${id}`, {
    withCredentials: true,
  });
  console.log("📥 Mengambil detail buku:", r.data);
  // fallback kalau backend suatu saat mengembalikan langsung objek
  const d: any = r.data;
  return d?.data ?? d ?? null;
}

/* ==================== Page ==================== */
export default function SchoolBookDetail() {
  const { slug = "", id = "" } = useParams<{ slug: string; id: string }>();
  const base = slug ? `/${encodeURIComponent(slug)}` : "";
  const nav = useNavigate();

  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  const q = useQuery({
    queryKey: ["book-detail", id],
    enabled: !!id,
    queryFn: () => fetchBookDetail(id),
    staleTime: 60_000,
  });

  const book = q.data ?? undefined;
  const sectionsFlat = useMemo<SectionLite[]>(() => {
    const usages = book?.usages ?? [];
    return usages.flatMap((u) => u.sections || []);
  }, [book?.usages]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Buku Pelajaran"
        gregorianDate={new Date().toISOString()}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <SchoolSidebarNav palette={palette} />

          <div className="flex-1 space-y-6 min-w-0 lg:p-4">
            {/* Header + Back */}
            <section className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Btn
                  palette={palette}
                  variant="outline"
                  onClick={() => nav(-1)}
                >
                  <ArrowLeft className="mr-2" size={16} />
                  Kembali
                </Btn>
                <div className="ml-2">
                  <div className="text-lg font-semibold">
                    {book?.books_title ??
                      (q.isLoading ? "Memuat…" : "Tidak ditemukan")}
                  </div>
                  <div className="text-xs" style={{ color: palette.silver2 }}>
                    {book?.books_author || "—"}
                  </div>
                </div>
              </div>
            </section>

            {/* Detail buku */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Cover */}
                <div className="md:col-span-4">
                  <div
                    className="w-full aspect-[3/4] rounded-xl overflow-hidden grid place-items-center"
                    style={{ background: palette.white1 }}
                  >
                    {book?.books_image_url ? (
                      <img
                        src={book.books_image_url}
                        alt={book.books_title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="opacity-60 text-xs flex items-center gap-2">
                        <ImageOff size={16} /> Tidak ada cover
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="md:col-span-8 grid gap-3">
                  <div>
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      Judul
                    </div>
                    <div className="font-medium">
                      {book?.books_title ?? "—"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div
                        className="text-xs"
                        style={{ color: palette.silver2 }}
                      >
                        Penulis
                      </div>
                      <div className="font-medium">
                        {book?.books_author ?? "—"}
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-xs"
                        style={{ color: palette.silver2 }}
                      >
                        Slug
                      </div>
                      <div className="font-medium">
                        {book?.books_slug ||
                          (book ? book.books_id.slice(0, 8) : "—")}
                      </div>
                    </div>
                  </div>

                  {book?.books_url && (
                    <div>
                      <a
                        href={book.books_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-sm underline"
                        style={{ color: palette.primary }}
                      >
                        <ExternalLink size={14} /> Kunjungi URL Buku
                      </a>
                    </div>
                  )}

                  {book?.books_desc && (
                    <div>
                      <div
                        className="text-xs mb-1"
                        style={{ color: palette.silver2 }}
                      >
                        Deskripsi
                      </div>
                      <p className="text-sm leading-relaxed">
                        {book.books_desc}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Pemakaian (usages) */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 font-medium flex items-center gap-2">
                <BookOpen size={18} /> Dipakai di Kelas/Section
              </div>

              <div className="px-4 md:px-5 pb-4">
                {!book ? (
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    {q.isLoading ? "Memuat…" : "Buku tidak ditemukan."}
                  </div>
                ) : (book.usages?.length ?? 0) === 0 ? (
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Belum terhubung ke kelas/section.
                  </div>
                ) : sectionsFlat.length === 0 ? (
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Tidak ada section terdaftar pada keterkaitan.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {sectionsFlat.map((s) => (
                      <Link
                        key={s.class_sections_id}
                        to={`${base}/sekolah/classes/${s.class_sections_id}`}
                        className="px-2 py-[2px] rounded-full text-[11px] border"
                        style={{
                          borderColor: palette.silver1,
                          background: isDark
                            ? colors.dark.white2
                            : colors.light.white2,
                          color: palette.quaternary,
                        }}
                        title={s.class_sections_slug ?? s.class_sections_name}
                      >
                        {s.class_sections_name}
                        {s.class_sections_code
                          ? ` (${s.class_sections_code})`
                          : ""}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
