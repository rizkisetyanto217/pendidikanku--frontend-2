import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

type BookEdit = {
  books_id: string;
  books_title: string;
  books_author?: string | null;
  books_desc?: string | null;
  books_url?: string | null;
  books_image_url?: string | null;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  palette: Palette;
  book?: BookEdit | null;
  onClose: () => void;
  onSuccess: (id?: string) => void;
};

export default function BookModal({
  open,
  mode,
  palette,
  book,
  onClose,
  onSuccess,
}: Props) {
  const qc = useQueryClient();
  const isEdit = mode === "edit";

  // form
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

  // ===== Fake API (pakai localStorage) =====
  function fakeSaveBook(newBook: BookEdit) {
    const raw = localStorage.getItem("dummy_books") || "[]";
    const arr: BookEdit[] = JSON.parse(raw);

    if (isEdit) {
      const idx = arr.findIndex((b) => b.books_id === newBook.books_id);
      if (idx >= 0) arr[idx] = newBook;
    } else {
      arr.push(newBook);
    }

    localStorage.setItem("dummy_books", JSON.stringify(arr));
    return newBook;
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const newBook: BookEdit = {
        books_id: isEdit ? book!.books_id : `dummy-${Date.now()}`,
        books_title: title,
        books_author: author,
        books_desc: desc,
        books_url: url,
        books_image_url: preview, // simpan preview base64/URL
      };

      // simpan ke fake storage
      return fakeSaveBook(newBook);
    },
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ["books-list"] });
      onSuccess(res?.books_id);
    },
    onError: (err: any) => {
      alert(err?.message || "Gagal menyimpan buku (fake).");
    },
  });

 if (!open) return null;

 return (
   <div
     className="fixed inset-0 z-[70] flex items-center justify-center p-3"
     style={{ background: "rgba(0,0,0,.45)" }}
     onClick={() => !mutation.isPending && onClose()}
   >
     <SectionCard
       palette={palette}
       className="w-[min(760px,96vw)] rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden"
       onClick={(e) => e.stopPropagation()}
     >
       {/* Header */}
       <div
         className="flex items-center justify-between p-4 md:p-6 border-b"
         style={{ borderColor: palette.silver1 }}
       >
         <div className="text-base md:text-lg font-semibold">
           {isEdit ? "Edit Buku (Fake)" : "Tambah Buku (Fake)"}
         </div>
         <button
           className="opacity-70 hover:opacity-100"
           onClick={() => !mutation.isPending && onClose()}
         >
           <X size={18} />
         </button>
       </div>

       {/* Content scrollable */}
       <div className="flex-1 overflow-y-auto p-4 md:p-6">
         <div className="grid md:grid-cols-12 gap-4">
           {/* Preview & File */}
           <div className="md:col-span-4">
             <div className="w-full aspect-[3/4] rounded-xl overflow-hidden grid place-items-center bg-gray-100">
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

           {/* Form */}
           <div className="md:col-span-8 grid gap-3">
             <label className="grid gap-1 text-sm">
               <span>Judul *</span>
               <input
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 className="px-3 py-2 rounded-lg border bg-transparent"
                 placeholder="cth. Matematika Kelas 7"
               />
             </label>

             <div className="grid md:grid-cols-2 gap-3">
               <label className="grid gap-1 text-sm">
                 <span>Penulis</span>
                 <input
                   value={author}
                   onChange={(e) => setAuthor(e.target.value)}
                   className="px-3 py-2 rounded-lg border bg-transparent"
                 />
               </label>
               <label className="grid gap-1 text-sm">
                 <span>URL</span>
                 <input
                   value={url}
                   onChange={(e) => setUrl(e.target.value)}
                   className="px-3 py-2 rounded-lg border bg-transparent"
                 />
               </label>
             </div>

             <label className="grid gap-1 text-sm">
               <span>Deskripsi</span>
               <textarea
                 value={desc}
                 onChange={(e) => setDesc(e.target.value)}
                 className="px-3 py-2 rounded-lg border bg-transparent min-h-[84px]"
               />
             </label>
           </div>
         </div>
       </div>

       {/* Actions (sticky bottom) */}
       <div
         className="p-4 md:p-6 border-t flex justify-end gap-2"
         style={{ borderColor: palette.silver1 }}
       >
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
             mutation.mutate();
           }}
         >
           Simpan
         </Btn>
       </div>
     </SectionCard>
   </div>
 );

}
