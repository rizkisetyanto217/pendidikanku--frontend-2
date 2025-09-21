// src/pages/sekolahislamku/dashboard-school/books/SchoolBookDetail.tsx
import React, { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

import { BookOpen, ArrowLeft, ExternalLink, ImageOff } from "lucide-react";

/* ================= Types ================= */
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

type BookDetailResp = { data: BookAPI; message?: string };

/* ============ Dummy Data ============ */
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
];

/* ============ Helpers ============ */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

/* ============ API ============ */
async function fetchBookDetail(id: string): Promise<BookAPI | null> {
  try {
    const r = await axios.get<BookDetailResp>(`/api/a/books/${id}`);
    return r.data?.data ?? null;
  } catch {
    return null;
  }
}

/* ============ Page ============ */
export default function SchoolBookDetail() {
  const { slug = "", id = "" } = useParams<{ slug: string; id: string }>();
  const base = slug ? `/${encodeURIComponent(slug)}` : "";
  const navigate = useNavigate();

  const { isDark, themeName } = useHtmlDarkMode();
  const palette = pickTheme(themeName as ThemeName, isDark);

  const q = useQuery({
    queryKey: ["book-detail", id],
    enabled: !!id,
    queryFn: () => fetchBookDetail(id),
    staleTime: 60_000,
  });

  const book =
    q.data ?? DUMMY_BOOKS.find((b) => b.books_id === id || b.books_slug === id);

  const sectionsFlat = useMemo(
    () => (book?.usages ?? []).flatMap((u) => u.sections || []),
    [book?.usages]
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Buku"
        gregorianDate={new Date().toISOString()}
        dateFmt={dateLong}
      />

      <main className="mx-auto px-6 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-2">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main */}
          <section className="lg:col-span-10 space-y-6 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={18} />
              </Btn>
              <div>
                <h1 className="text-lg md:text-xl font-semibold">
                  {book?.books_title ??
                    (q.isLoading ? "Memuat…" : "Buku tidak ditemukan")}
                </h1>
                <p className="text-sm" style={{ color: palette.silver2 }}>
                  {book?.books_author ?? "—"}
                </p>
              </div>
            </div>

            {/* Detail Buku */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Cover */}
                <div className="md:col-span-4">
                  <div
                    className="w-full aspect-[3/4] rounded-xl overflow-hidden grid place-items-center border"
                    style={{ borderColor: palette.silver1 }}
                  >
                    {book?.books_image_url ? (
                      <img
                        src={book.books_image_url}
                        alt={book.books_title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-xs opacity-70">
                        <ImageOff size={18} />
                        <span>Tidak ada cover</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="md:col-span-8 space-y-4">
                  <InfoBlock
                    label="Judul"
                    value={book?.books_title ?? "—"}
                    palette={palette}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InfoBlock
                      label="Penulis"
                      value={book?.books_author ?? "—"}
                      palette={palette}
                    />
                    <InfoBlock
                      label="Slug"
                      value={
                        book?.books_slug ?? book?.books_id.slice(0, 8) ?? "—"
                      }
                      palette={palette}
                    />
                  </div>
                  {book?.books_url && (
                    <a
                      href={book.books_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm underline"
                      style={{ color: palette.primary }}
                    >
                      <ExternalLink size={14} /> Kunjungi URL Buku
                    </a>
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

            {/* Pemakaian */}
            <SectionCard palette={palette}>
              <div
                className="p-4 md:p-5 border-b font-medium flex items-center gap-2"
                style={{ borderColor: palette.silver1 }}
              >
                <BookOpen size={18} /> Dipakai di Kelas/Section
              </div>
              <div className="p-4 md:p-6">
                {!book ? (
                  <p className="text-sm" style={{ color: palette.silver2 }}>
                    {q.isLoading ? "Memuat…" : "Buku tidak ditemukan."}
                  </p>
                ) : sectionsFlat.length === 0 ? (
                  <p className="text-sm" style={{ color: palette.silver2 }}>
                    Belum terhubung ke kelas/section.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {sectionsFlat.map((s) => (
                      <Link
                        key={s.class_sections_id}
                        to={`${base}/sekolah/classes/${s.class_sections_id}`}
                        className="px-3 py-1 rounded-full text-xs border"
                        style={{
                          borderColor: palette.silver1,
                          color: palette.quaternary,
                        }}
                      >
                        {s.class_sections_name}
                        {s.class_sections_code && ` (${s.class_sections_code})`}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ============ Small UI ============ */
function InfoBlock({
  label,
  value,
  palette,
}: {
  label: string;
  value: React.ReactNode;
  palette: Palette;
}) {
  return (
    <div>
      <div className="text-xs mb-1" style={{ color: palette.silver2 }}>
        {label}
      </div>
      <div className="font-medium text-sm">{value}</div>
    </div>
  );
}
