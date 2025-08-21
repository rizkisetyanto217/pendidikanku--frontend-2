import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { X } from "lucide-react";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import { colors } from "@/constants/colorsThema";

/* ===== helper debounce ===== */
function useDebounce<T>(value: T, delay = 350) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* ===== types ===== */
type BookEdit = {
  books_id: string;
  books_title: string;
  books_author?: string | null;
  books_desc?: string | null;
  books_url?: string | null;
  books_image_url?: string | null;
};

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

type Props = {
  open: boolean;
  mode: "create" | "edit";
  palette: Palette;
  book?: BookEdit | null; // wajib saat edit
  onClose: () => void;
  onSuccess: (id?: string) => void; // dipanggil saat sukses
  showBindingOnEdit?: boolean; // default false
};

export default function BookModal({
  open,
  mode,
  palette,
  book,
  onClose,
  onSuccess,
  showBindingOnEdit = false,
}: Props) {
  const qc = useQueryClient();
  const isEdit = mode === "edit";

  // form buku
  const [title, setTitle] = useState(book?.books_title ?? "");
  const [author, setAuthor] = useState(book?.books_author ?? "");
  const [desc, setDesc] = useState(book?.books_desc ?? "");
  const [url, setUrl] = useState(book?.books_url ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    book?.books_image_url ?? null
  );

  useEffect(() => {
    if (!open) return;
    setTitle(book?.books_title ?? "");
    setAuthor(book?.books_author ?? "");
    setDesc(book?.books_desc ?? "");
    setUrl(book?.books_url ?? "");
    setPreview(book?.books_image_url ?? null);
    setFile(null);
  }, [book?.books_id, open]);

  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  // binding opsional (aktif hanya saat create / jika diizinkan saat edit)
  const bindingEnabledByMode = !isEdit || showBindingOnEdit;
  const [bindEnabled, setBindEnabled] = useState(false);
  const [classQuery, setClassQuery] = useState("");
  const debouncedQ = useDebounce(classQuery, 400);
  const [selectedClassSubjectId, setSelectedClassSubjectId] = useState("");
  const [bindDesc, setBindDesc] = useState("");
  const [bindActive, setBindActive] = useState(true);

  useEffect(() => {
    if (!open) {
      setBindEnabled(false);
      setClassQuery("");
      setSelectedClassSubjectId("");
      setBindDesc("");
      setBindActive(true);
    }
  }, [open]);

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
    enabled:
      open &&
      bindingEnabledByMode &&
      bindEnabled &&
      debouncedQ.trim().length >= 2,
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

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        if (!book) return;
        const fd = new FormData();
        fd.set("books_title", title);
        fd.set("books_author", author || "");
        fd.set("books_desc", desc || "");
        fd.set("books_url", url || "");
        if (file) fd.set("books_image_url", file);
        await axios.put(`/api/a/books/${book.books_id}`, fd, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        return { id: book.books_id };
      } else {
        const fd = new FormData();
        fd.set("books_title", title);
        if (author) fd.set("books_author", author);
        if (desc) fd.set("books_desc", desc);
        if (url) fd.set("books_url", url);
        if (file) fd.set("books_image_url", file);
        const createRes = await axios.post("/api/a/books", fd, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        const newBookId: string =
          createRes?.data?.data?.books_id ?? createRes?.data?.books_id;

        if (bindEnabled && selectedClassSubjectId) {
          try {
            await axios.post(
              "/api/a/class-subject-books",
              {
                class_subject_books_class_subject_id: selectedClassSubjectId,
                class_subject_books_book_id: newBookId,
                class_subject_books_description: bindDesc || undefined,
                class_subject_books_is_active: bindActive,
                is_active: bindActive,
              },
              { withCredentials: true }
            );
          } catch (e: any) {
            throw new Error(
              e?.response?.data?.message ||
                "Buku dibuat, tapi gagal mengaitkan ke kelas/mapel."
            );
          }
        }

        return { id: newBookId };
      }
    },
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ["books-list"] });
      onSuccess(res?.id);
    },
    onError: (err: any) => {
      alert(
        err?.message || err?.response?.data?.message || "Gagal menyimpan buku."
      );
    },
  });

  if (!open) return null;

  const canClose = !mutation.isPending;

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center p-3"
      style={{ background: "rgba(0,0,0,.45)" }}
      onClick={() => canClose && onClose()}
    >
      <SectionCard
        palette={palette}
        className="w-[min(760px,96vw)] p-4 md:p-6 rounded-2xl shadow-xl"
      >
        <div onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-base md:text-lg font-semibold">
              {isEdit ? "Edit Buku" : "Tambah Buku"}
            </div>
            <button
              className="opacity-70 hover:opacity-100"
              onClick={() => canClose && onClose()}
              aria-label="Tutup"
            >
              <X size={18} />
            </button>
          </div>

          {/* Grid Form */}
          <div className="grid md:grid-cols-12 gap-4">
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
                    value={author ?? ""}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="px-3 py-2 rounded-lg border bg-transparent"
                    placeholder="cth. Budi Santoso"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>URL (opsional)</span>
                  <input
                    value={url ?? ""}
                    onChange={(e) => setUrl(e.target.value)}
                    className="px-3 py-2 rounded-lg border bg-transparent"
                    placeholder="https://penerbit-cerdas.id/..."
                  />
                </label>
              </div>

              <label className="grid gap-1 text-sm">
                <span>Deskripsi</span>
                <textarea
                  value={desc ?? ""}
                  onChange={(e) => setDesc(e.target.value)}
                  className="px-3 py-2 rounded-lg border bg-transparent min-h-[84px]"
                  placeholder="Edisi / catatan lain…"
                />
              </label>

              {bindingEnabledByMode && (
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
                          {debouncedQ && (
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
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center justify-end gap-2">
            <Btn
              palette={palette}
              variant="ghost"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Batal
            </Btn>
            <Btn
              palette={palette}
              loading={mutation.isPending}
              onClick={() => {
                if (!title.trim()) return alert("Judul wajib diisi.");
                if (!isEdit && bindEnabled && !selectedClassSubjectId) {
                  const ok = confirm(
                    "Belum memilih Kelas — Mapel. Lanjutkan tanpa mengaitkan?"
                  );
                  if (!ok) return;
                }
                mutation.mutate();
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
