// // src/pages/sekolahislamku/teacher/ClassMateri.tsx
// import { useMemo, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import useHtmlDarkMode from "@/hooks/useHTMLThema";
// import { pickTheme } from "@/constants/thema";
// // + NEW imports
// import Swal from "sweetalert2";
// import "sweetalert2/dist/sweetalert2.min.css";
// import { useQueryClient } from "@tanstack/react-query";

// import {
//   SectionCard,
//   Badge,
//   Btn,
//   type Palette,
// } from "@/pages/sekolahislamku/components/ui/Primitives";
// import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
// import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

// import {
//   BookOpen,
//   FileText,
//   CalendarDays,
//   Download,
//   ArrowLeft,
//   Plus,
//   Search,
//   Filter,
//   ChevronRight,
// } from "lucide-react";
// import ModalAddClassMateri from "./ModalAddClassMateri";
// import ModalEditClassMateri, {
//   EditClassMaterialInput,
// } from "./ModalEditClassMateri";

// /* ====== Helpers tanggal ====== */
// const atLocalNoon = (d: Date) => {
//   const x = new Date(d);
//   x.setHours(12, 0, 0, 0);
//   return x;
// };
// const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();

// const dateLong = (iso?: string) =>
//   iso
//     ? new Date(iso).toLocaleDateString("id-ID", {
//         weekday: "long",
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       })
//     : "-";

// const hijriLong = (iso: string) =>
//   new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
//     weekday: "long",
//     day: "2-digit",
//     month: "long",
//     year: "numeric",
//   });

// /* ====== Types ====== */
// type NextSession = {
//   dateISO: string;
//   time: string;
//   title: string;
//   room?: string;
// };

// type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

// type TeacherClassSummary = {
//   id: string;
//   name: string;
//   room?: string;
//   homeroom: string;
//   assistants?: string[];
//   studentsCount: number;
//   todayAttendance: Record<AttendanceStatus, number>;
//   nextSession?: NextSession;
//   materialsCount: number;
//   assignmentsCount: number;
//   academicTerm: string;
//   cohortYear: number;
// };

// type MaterialType = "pdf" | "doc" | "ppt" | "link" | "video";

// type ClassMaterial = {
//   id: string;
//   title: string;
//   description?: string;
//   type: MaterialType;
//   createdAt: string; // ISO
//   updatedAt?: string; // ISO
//   attachments?: { name: string; url?: string }[];
//   author?: string;
// };

// /* ====== Query Keys ====== */
// const QK = {
//   CLASSES: ["teacher-classes-list"] as const,
//   MATERIALS: (classId: string) => ["teacher-class-materials", classId] as const,
// };

// /* ====== Dummy fetch ====== */
// async function fetchTeacherClasses(): Promise<TeacherClassSummary[]> {
//   const now = new Date();
//   const mk = (d: Date, addDay = 0) => {
//     const x = new Date(d);
//     x.setDate(x.getDate() + addDay);
//     return x.toISOString();
//   };
//   return Promise.resolve([
//     {
//       id: "tpa-a",
//       name: "TPA A",
//       room: "Aula 1",
//       homeroom: "Ustadz Abdullah",
//       assistants: ["Ustadzah Amina"],
//       studentsCount: 22,
//       todayAttendance: { hadir: 18, online: 1, sakit: 1, izin: 1, alpa: 1 },
//       nextSession: {
//         dateISO: mk(now, 0),
//         time: "07:30",
//         title: "Tahsin — Tajwid & Makhraj",
//         room: "Aula 1",
//       },
//       materialsCount: 12,
//       assignmentsCount: 4,
//       academicTerm: "2025/2026 — Ganjil",
//       cohortYear: 2025,
//     },
//     {
//       id: "tpa-b",
//       name: "TPA B",
//       room: "R. Tahfiz",
//       homeroom: "Ustadz Salman",
//       assistants: ["Ustadzah Maryam"],
//       studentsCount: 20,
//       todayAttendance: { hadir: 15, online: 2, sakit: 1, izin: 1, alpa: 1 },
//       nextSession: {
//         dateISO: mk(now, 1),
//         time: "09:30",
//         title: "Hafalan Juz 30",
//         room: "R. Tahfiz",
//       },
//       materialsCount: 9,
//       assignmentsCount: 3,
//       academicTerm: "2025/2026 — Ganjil",
//       cohortYear: 2025,
//     },
//   ]);
// }

// async function fetchMaterialsByClass(
//   classId: string
// ): Promise<ClassMaterial[]> {
//   const now = new Date().toISOString();
//   const yesterday = new Date(Date.now() - 864e5).toISOString();
//   const base: Record<string, ClassMaterial[]> = {
//     "tpa-a": [
//       {
//         id: "m-001",
//         title: "Mad Thabi'i — Ringkasan & Contoh",
//         description:
//           "Materi pokok tentang mad thabi'i: definisi, cara membaca, dan contoh.",
//         type: "pdf",
//         createdAt: yesterday,
//         attachments: [{ name: "mad-thabii.pdf" }],
//         author: "Ustadz Abdullah",
//       },
//       {
//         id: "m-002",
//         title: "Video Makharijul Huruf (Ringkas)",
//         type: "video",
//         createdAt: now,
//         attachments: [
//           { name: "YouTube Link", url: "https://youtu.be/dQw4w9WgXcQ" },
//         ],
//         author: "Ustadzah Amina",
//       },
//       {
//         id: "m-003",
//         title: "Latihan Tajwid: Idgham",
//         description: "Kumpulan soal latihan idgham bighunnah & bilaghunnah.",
//         type: "doc",
//         createdAt: now,
//         attachments: [{ name: "latihan-idgham.docx" }],
//         author: "Ustadz Abdullah",
//       },
//     ],
//     "tpa-b": [
//       {
//         id: "m-101",
//         title: "Hafalan Juz 30 — Target Minggu Ini",
//         type: "ppt",
//         createdAt: yesterday,
//         attachments: [{ name: "target-pekan.pptx" }],
//         author: "Ustadz Salman",
//       },
//     ],
//   };
//   return Promise.resolve(base[classId] ?? []);
// }

// /* ====== Komponen Utama ====== */
// export default function ClassMateri() {
//   const { id = "" } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const { isDark, themeName } = useHtmlDarkMode();
//   const palette: Palette = pickTheme(themeName, isDark);
//   const qc = useQueryClient();
//   // kelas
//   const { data: classes = [] } = useQuery({
//     queryKey: QK.CLASSES,
//     queryFn: fetchTeacherClasses,
//     staleTime: 5 * 60_000,
//   });

//   const cls = useMemo(() => classes.find((c) => c.id === id), [classes, id]);

//   // materi
//   const { data: materials = [], isFetching } = useQuery({
//     queryKey: QK.MATERIALS(id),
//     queryFn: () => fetchMaterialsByClass(id),
//     enabled: !!id,
//     staleTime: 2 * 60_000,
//   });

//   // filter & search
//   const [q, setQ] = useState("");
//   const [type, setType] = useState<"all" | MaterialType>("all");

//   const filtered = useMemo(() => {
//     let list = materials;
//     if (type !== "all") list = list.filter((m) => m.type === type);
//     const qq = q.trim().toLowerCase();
//     if (qq) {
//       list = list.filter(
//         (m) =>
//           m.title.toLowerCase().includes(qq) ||
//           (m.description ?? "").toLowerCase().includes(qq)
//       );
//     }
//     return [...list].sort(
//       (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
//     );
//   }, [materials, q, type]);

//   const todayISO = toLocalNoonISO(new Date());

//   /* ====== Actions ====== */
//   const handleDownload = (m: ClassMaterial) => {
//     const att = m.attachments?.[0];
//     if (!att) {
//       alert("Materi ini belum memiliki lampiran untuk diunduh.");
//       return;
//     }
//     if (att.url) {
//       // buka di tab baru (biar aman CORS dan file besar)
//       window.open(att.url, "_blank", "noopener,noreferrer");
//       return;
//     }
//     // fallback: buat file dummy agar tetap ada UX unduh
//     const blob = new Blob(
//       [
//         `Materi: ${m.title}\n\nTidak ada URL file sebenarnya. Ini contoh placeholder untuk "${att.name}".`,
//       ],
//       { type: "text/plain;charset=utf-8" }
//     );
//     const a = document.createElement("a");
//     a.href = URL.createObjectURL(blob);
//     a.download = att.name || `${m.title}.txt`;
//     document.body.appendChild(a);
//     a.click();
//     URL.revokeObjectURL(a.href);
//     a.remove();
//   };
//   const [openModal, setOpenModal] = useState(false);
//   // ... di atas sudah ada: const qc = useQueryClient();

//   const handleAddMateri = async (payload: any) => {
//     try {
//       // Normalisasi payload minimal
//       const nowISO = new Date().toISOString();
//       const newItem: ClassMaterial = {
//         id: `m-${Date.now()}`, // id dummy unik
//         title: payload?.title ?? "Materi tanpa judul",
//         description: payload?.description ?? "",
//         type: (payload?.type as MaterialType) ?? "pdf",
//         createdAt: nowISO,
//         updatedAt: undefined,
//         attachments: Array.isArray(payload?.attachments)
//           ? payload.attachments
//           : payload?.attachment
//             ? [payload.attachment]
//             : [],
//         author: payload?.author ?? cls?.homeroom ?? "Guru",
//       };

//       // 1) Optimistic update: sisipkan ke list materi kelas aktif
//       qc.setQueryData<ClassMaterial[]>(QK.MATERIALS(id), (old = []) => [
//         newItem,
//         ...old,
//       ]);

//       // 2) (Opsional) Update count materi di list kelas
//       qc.setQueryData<TeacherClassSummary[]>(QK.CLASSES, (old = []) =>
//         old.map((c) =>
//           c.id === id
//             ? { ...c, materialsCount: (c.materialsCount ?? 0) + 1 }
//             : c
//         )
//       );

//       // 3) Tutup modal + toast sukses bertema
//       setOpenModal(false);
//       await Swal.fire({
//         title: "Materi ditambahkan",
//         text: "Materi baru berhasil ditambahkan.",
//         icon: "success",
//         timer: 1400,
//         showConfirmButton: false,
//         background: palette.white1,
//         color: palette.black1,
//       });

//       // Catatan:
//       // Tidak perlu invalidateQuery karena kita belum pakai API.
//       // Kalau nanti sudah ada API, tinggal panggil mutate + invalidate.
//     } catch (e) {
//       await Swal.fire({
//         title: "Gagal menambahkan",
//         text: "Terjadi kesalahan saat menambahkan materi.",
//         icon: "error",
//         background: palette.white1,
//         color: palette.black1,
//         confirmButtonColor: (palette as any).destructive ?? "#ef4444",
//       });
//     }
//   };

//   // state dekete
//   const handleDelete = async (m: ClassMaterial) => {
//     const res = await Swal.fire({
//       title: "Hapus materi?",
//       text: `"${m.title}" akan dihapus. Tindakan ini tidak bisa dibatalkan.`,
//       icon: "warning",
//       showCancelButton: true,
//       reverseButtons: true,
//       confirmButtonText: "Ya, hapus",
//       cancelButtonText: "Batal",
//       // ⬇️ tema dari palette
//       background: palette.white1,
//       color: palette.black1,
//       confirmButtonColor: (palette as any).destructive ?? "#ef4444", // fallback merah
//       cancelButtonColor: palette.primary,
//     });

//     if (!res.isConfirmed) return;

//     try {
//       // TODO: panggil API hapus, misal:
//       // await api.delete(`/classes/${id}/materials/${m.id}`);

//       // Optimistic update cache list materi
//       qc.setQueryData<ClassMaterial[]>(QK.MATERIALS(id), (old = []) =>
//         old.filter((x) => x.id !== m.id)
//       );

//       await Swal.fire({
//         title: "Terhapus",
//         text: "Materi berhasil dihapus.",
//         icon: "success",
//         timer: 1400,
//         showConfirmButton: false,
//         background: palette.white1,
//         color: palette.black1,
//       });
//     } catch (e) {
//       await Swal.fire({
//         title: "Gagal menghapus",
//         text: "Terjadi kesalahan saat menghapus materi.",
//         icon: "error",
//         background: palette.white1,
//         color: palette.black1,
//         confirmButtonColor: (palette as any).destructive ?? "#ef4444",
//       });
//     }
//   };
//   // state editclass materi
//   const [openEdit, setOpenEdit] = useState(false);
//   const [editingItem, setEditingItem] = useState<ClassMaterial | null>(null);
//   const handleEditMateri = async (payload: EditClassMaterialInput) => {
//     try {
//       const nowISO = new Date().toISOString();

//       // 1) Optimistic replace item berdasarkan id
//       qc.setQueryData<ClassMaterial[]>(QK.MATERIALS(id), (old = []) =>
//         old.map((m) =>
//           m.id === payload.id
//             ? {
//                 ...m,
//                 title: payload.title,
//                 description: payload.description,
//                 type: payload.type as any,
//                 attachments: payload.attachments ?? [],
//                 author: payload.author ?? m.author,
//                 updatedAt: nowISO,
//               }
//             : m
//         )
//       );

//       setOpenEdit(false);
//       setEditingItem(null);

//       await Swal.fire({
//         title: "Perubahan disimpan",
//         text: "Materi berhasil diperbarui.",
//         icon: "success",
//         timer: 1400,
//         showConfirmButton: false,
//         background: palette.white1,
//         color: palette.black1,
//       });
//     } catch (e) {
//       await Swal.fire({
//         title: "Gagal menyimpan",
//         text: "Terjadi kesalahan saat menyimpan perubahan.",
//         icon: "error",
//         background: palette.white1,
//         color: palette.black1,
//         confirmButtonColor: (palette as any).destructive ?? "#ef4444",
//       });
//     }
//   };

//   return (
//     <div
//       className="min-h-screen w-full"
//       style={{ background: palette.white2, color: palette.black1 }}
//     >
//       <ParentTopBar
//         palette={palette}
//         title={cls ? `Materi: ${cls.name}` : "Materi Kelas"}
//         gregorianDate={todayISO}
//         hijriDate={hijriLong(todayISO)}
//         dateFmt={dateLong}
//         showBack
//       />

//       <ModalAddClassMateri
//         open={openModal}
//         onClose={() => setOpenModal(false)}
//         onSubmit={handleAddMateri}
//         palette={palette}
//       />
//       <ModalEditClassMateri
//         open={openEdit}
//         onClose={() => {
//           setOpenEdit(false);
//           setEditingItem(null);
//         }}
//         onSubmit={handleEditMateri}
//         palette={palette}
//         initial={
//           editingItem
//             ? {
//                 id: editingItem.id,
//                 title: editingItem.title,
//                 description: editingItem.description,
//                 type: editingItem.type as any,
//                 attachments: editingItem.attachments ?? [],
//                 author: editingItem.author,
//               }
//             : undefined
//         }
//       />

//       <main className="w-full px-4 md:px-6  md:py-8">
//         <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
//           {/* Sidebar */}
//           <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
//             <ParentSidebar palette={palette} />
//           </aside>

//           <div className="flex-1 flex flex-col space-y-6 min-w-0">
//             {/* back */}
//             <div className="md:flex hidden gap-3 items-center ">
//               <Btn
//                 palette={palette}
//                 variant="ghost"

//                 onClick={() => navigate(-1)}
//                 className="gap-1 "
//               >
//                 <ArrowLeft size={20} />
//               </Btn>
//               <h1 className="textlg font-semibold">Materi</h1>
//             </div>

//             {/* header ringkas */}
//             <SectionCard palette={palette}>
//               <div className="p-4 md:p-5 flex items-start justify-between gap-4">
//                 <div className="min-w-0">
//                   <div className="text-lg md:text-xl font-semibold">
//                     {cls?.name ?? "—"}
//                   </div>
//                   <div
//                     className="mt-1 flex flex-wrap items-center gap-2 text-sm"
//                     style={{ color: palette.black2 }}
//                   >
//                     <Badge variant="outline" palette={palette}>
//                       <h1 style={{ color: palette.black2 }}>
//                         {" "}
//                         {cls?.room ?? "-"}
//                       </h1>
//                     </Badge>
//                     <span>Wali Kelas: {cls?.homeroom ?? "-"}</span>
//                     <span>• {cls?.academicTerm ?? "-"}</span>
//                     <span>• Angkatan {cls?.cohortYear ?? "-"}</span>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <Btn
//                     palette={palette}
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => setOpenModal(true)}
//                   >
//                     <Plus size={16} className="mr-1" />

//                   </Btn>
//                 </div>
//               </div>
//             </SectionCard>

//             {/* controls */}
//             <SectionCard palette={palette}>
//               <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
//                 <div
//                   className="flex items-center gap-2 rounded-xl border px-3 h-10"
//                   style={{
//                     borderColor: palette.silver1,
//                     background: palette.white1,
//                   }}
//                 >
//                   <Search size={16} />
//                   <input
//                     value={q}
//                     onChange={(e) => setQ(e.target.value)}
//                     placeholder="Cari materi…"
//                     className="bg-transparent outline-none text-sm w-full"
//                     style={{ color: palette.black1 }}
//                   />
//                 </div>

//                 <div
//                   className="flex items-center gap-2 rounded-xl border px-3 h-10"
//                   style={{
//                     borderColor: palette.silver1,
//                     background: palette.white1,
//                   }}
//                 >
//                   <Filter size={16} />
//                   <select
//                     value={type}
//                     onChange={(e) => setType(e.target.value as any)}
//                     className="bg-transparent outline-none text-sm w-full"
//                     style={{ color: palette.black1 }}
//                   >
//                     <option value="all">Semua tipe</option>
//                     <option value="pdf">PDF</option>
//                     <option value="doc">Dokumen</option>
//                     <option value="ppt">Presentasi</option>
//                     <option value="video">Video</option>
//                     <option value="link">Tautan</option>
//                   </select>
//                 </div>
//               </div>
//             </SectionCard>

//             {/* list materi */}
//             <div className="grid gap-3">
//               {isFetching && filtered.length === 0 && (
//                 <SectionCard palette={palette}>
//                   <div
//                     className="p-6 text-sm"
//                     style={{ color: palette.silver2 }}
//                   >
//                     Memuat materi…
//                   </div>
//                 </SectionCard>
//               )}

//               {filtered.map((m) => (
//                 <SectionCard
//                   key={m.id}
//                   palette={palette}
//                   className="p-0 hover:shadow-sm transition-shadow"
//                   style={{ background: palette.white1 }}
//                 >
//                   {/* Body */}
//                   <div className="p-4 md:p-5">
//                     <div className="flex items-start justify-between gap-4">
//                       <div className="min-w-0">
//                         <div className="flex items-center gap-2">
//                           <div className="text-base font-semibold truncate">
//                             <h1 style={{ color: palette.black2 }}>{m.title}</h1>
//                           </div>
//                           <Badge
//                             palette={palette}
//                             variant={
//                               m.type === "pdf"
//                                 ? "secondary"
//                                 : m.type === "doc"
//                                   ? "info"
//                                   : m.type === "ppt"
//                                     ? "warning"
//                                     : m.type === "video"
//                                       ? "success"
//                                       : "outline"
//                             }
//                             className="h-6"
//                           >
//                             {m.type.toUpperCase()}
//                           </Badge>
//                         </div>

//                         {m.description && (
//                           <p
//                             className="text-sm mt-1 line-clamp-2"
//                             style={{ color: palette.black2 }}
//                           >
//                             {m.description}
//                           </p>
//                         )}

//                         <div
//                           className="mt-2 flex flex-wrap items-center gap-2 text-sm"
//                           style={{ color: palette.black2 }}
//                         >
//                           <CalendarDays size={14} />
//                           <span>Dibuat: {dateLong(m.createdAt)}</span>
//                           {m.updatedAt && (
//                             <span>• Diperbarui: {dateLong(m.updatedAt)}</span>
//                           )}
//                           {m.author && <span>• Oleh {m.author}</span>}
//                           {m.attachments?.length ? (
//                             <>
//                               <span>•</span>
//                               <span>{m.attachments.length} lampiran</span>
//                             </>
//                           ) : null}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Footer actions (⬅️ bagian baru, di bawah kartu) */}
//                   <div
//                     className="px-4 md:px-5 pb-4 md:pb-5 pt-3 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
//                     style={{ borderColor: palette.silver1 }}
//                   >
//                     <div className="text-sm" style={{ color: palette.black2 }}>
//                       Aksi cepat untuk materi ini
//                     </div>
//                     <div className="flex gap-2">
//                       <Btn
//                         palette={palette}
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleDownload(m)}
//                       >
//                         <Download size={16} className="mr-1" />
//                         Unduh
//                       </Btn>

//                       <Btn
//                         palette={palette}
//                         size="sm"
//                         onClick={() => {
//                           setEditingItem(m);
//                           setOpenEdit(true);
//                         }}
//                       >
//                         Edit
//                       </Btn>

//                       <Btn
//                         palette={palette}
//                         size="sm"
//                         variant="destructive"
//                         onClick={() => handleDelete(m)}
//                       >
//                         Hapus
//                       </Btn>
//                     </div>
//                   </div>
//                 </SectionCard>
//               ))}

//               {filtered.length === 0 && !isFetching && (
//                 <SectionCard palette={palette}>
//                   <div
//                     className="p-6 text-sm text-center"
//                     style={{ color: palette.silver2 }}
//                   >
//                     Belum ada materi untuk kelas ini.
//                   </div>
//                 </SectionCard>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// src/pages/sekolahislamku/teacher/ClassMateri.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { pickTheme } from "@/constants/thema";
// + NEW imports
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useQueryClient } from "@tanstack/react-query";

import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

import {
  CalendarDays,
  Download,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  MapPin,
  GraduationCap,
  ClipboardList,
  Timer,
  BarChart2,
  Pencil,
  Trash2,
  Trash,
  Eye,
} from "lucide-react";

/* ====== Helpers tanggal ====== */
const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};
const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

const hijriLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

/* ====== Types ====== */
type NextSession = {
  dateISO: string;
  time: string;
  title: string;
  room?: string;
};

type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

type TeacherClassSummary = {
  id: string;
  name: string;
  room?: string;
  homeroom: string;
  assistants?: string[];
  studentsCount: number;
  todayAttendance: Record<AttendanceStatus, number>;
  nextSession?: NextSession;
  materialsCount: number;
  assignmentsCount: number;
  academicTerm: string;
  cohortYear: number;
};

type MaterialType = "pdf" | "doc" | "ppt" | "link" | "video";

type ClassMaterial = {
  id: string;
  title: string;
  description?: string;
  type: MaterialType;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
  attachments?: { name: string; url?: string }[];
  author?: string;
};

/* ====== NEW: Quiz Types ====== */
type Quiz = {
  id: string;
  title: string;
  description?: string;
  createdAt: string; // ISO
  dueAt?: string; // ISO
  durationMin?: number;
  totalQuestions: number;
  attempts: number;
  avgScore?: number; // 0-100
  published: boolean;
  author?: string;
};

/* ====== Query Keys ====== */
const QK = {
  CLASSES: ["teacher-classes-list"] as const,
  MATERIALS: (classId: string) => ["teacher-class-materials", classId] as const,
  QUIZZES: (classId: string) => ["teacher-class-quizzes", classId] as const, // NEW
};

/* ====== Dummy fetch ====== */
async function fetchTeacherClasses(): Promise<TeacherClassSummary[]> {
  const now = new Date();
  const mk = (d: Date, addDay = 0) => {
    const x = new Date(d);
    x.setDate(x.getDate() + addDay);
    return x.toISOString();
  };
  return Promise.resolve([
    {
      id: "tpa-a",
      name: "TPA A",
      room: "Aula 1",
      homeroom: "Ustadz Abdullah",
      assistants: ["Ustadzah Amina"],
      studentsCount: 22,
      todayAttendance: { hadir: 18, online: 1, sakit: 1, izin: 1, alpa: 1 },
      nextSession: {
        dateISO: mk(now, 0),
        time: "07:30",
        title: "Tahsin — Tajwid & Makhraj",
        room: "Aula 1",
      },
      materialsCount: 12,
      assignmentsCount: 4,
      academicTerm: "2025/2026 — Ganjil",
      cohortYear: 2025,
    },
    {
      id: "tpa-b",
      name: "TPA B",
      room: "R. Tahfiz",
      homeroom: "Ustadz Salman",
      assistants: ["Ustadzah Maryam"],
      studentsCount: 20,
      todayAttendance: { hadir: 15, online: 2, sakit: 1, izin: 1, alpa: 1 },
      nextSession: {
        dateISO: mk(now, 1),
        time: "09:30",
        title: "Hafalan Juz 30",
        room: "R. Tahfiz",
      },
      materialsCount: 9,
      assignmentsCount: 3,
      academicTerm: "2025/2026 — Ganjil",
      cohortYear: 2025,
    },
  ]);
}

async function fetchMaterialsByClass(
  classId: string
): Promise<ClassMaterial[]> {
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 864e5).toISOString();
  const base: Record<string, ClassMaterial[]> = {
    "tpa-a": [
      {
        id: "m-001",
        title: "Mad Thabi'i — Ringkasan & Contoh",
        description:
          "Materi pokok tentang mad thabi'i: definisi, cara membaca, dan contoh.",
        type: "pdf",
        createdAt: yesterday,
        attachments: [{ name: "mad-thabii.pdf" }],
        author: "Ustadz Abdullah",
      },
      {
        id: "m-002",
        title: "Video Makharijul Huruf (Ringkas)",
        type: "video",
        createdAt: now,
        attachments: [
          { name: "YouTube Link", url: "https://youtu.be/dQw4w9WgXcQ" },
        ],
        author: "Ustadzah Amina",
      },
      {
        id: "m-003",
        title: "Latihan Tajwid: Idgham",
        description: "Kumpulan soal latihan idgham bighunnah & bilaghunnah.",
        type: "doc",
        createdAt: now,
        attachments: [{ name: "latihan-idgham.docx" }],
        author: "Ustadz Abdullah",
      },
    ],
    "tpa-b": [
      {
        id: "m-101",
        title: "Hafalan Juz 30 — Target Minggu Ini",
        type: "ppt",
        createdAt: yesterday,
        attachments: [{ name: "target-pekan.pptx" }],
        author: "Ustadz Salman",
      },
    ],
  };
  return Promise.resolve(base[classId] ?? []);
}

/* ====== NEW: Dummy fetch quizzes ====== */
async function fetchQuizzesByClass(classId: string): Promise<Quiz[]> {
  const now = new Date();
  const inDays = (n: number) =>
    toLocalNoonISO(new Date(now.getTime() + n * 864e5));
  const base: Record<string, Quiz[]> = {
    "tpa-a": [
      {
        id: "q-001",
        title: "Kuis Tajwid Dasar",
        description: "Huruf mad, panjang bacaan, dan contoh.",
        createdAt: toLocalNoonISO(now),
        dueAt: inDays(1),
        durationMin: 15,
        totalQuestions: 10,
        attempts: 12,
        avgScore: 78,
        published: true,
        author: "Ustadz Abdullah",
      },
      {
        id: "q-002",
        title: "Makharijul Huruf",
        description: "Tempat keluarnya huruf hijaiyah.",
        createdAt: toLocalNoonISO(now),
        dueAt: inDays(3),
        durationMin: 20,
        totalQuestions: 12,
        attempts: 0,
        avgScore: 0,
        published: false,
        author: "Ustadzah Amina",
      },
    ],
    "tpa-b": [
      {
        id: "q-101",
        title: "Hafalan Juz 30 (Mingguan)",
        description: "An-Naba' s/d An-Nazi'at.",
        createdAt: toLocalNoonISO(now),
        dueAt: inDays(2),
        durationMin: 25,
        totalQuestions: 15,
        attempts: 7,
        avgScore: 84,
        published: true,
        author: "Ustadz Salman",
      },
    ],
  };
  return Promise.resolve(base[classId] ?? []);
}

/* ====== Komponen Utama ====== */
export default function ClassMateri() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName, isDark);
  const qc = useQueryClient();

  // kelas
  const { data: classes = [] } = useQuery({
    queryKey: QK.CLASSES,
    queryFn: fetchTeacherClasses,
    staleTime: 5 * 60_000,
  });

  const cls = useMemo(() => classes.find((c) => c.id === id), [classes, id]);

  // materi
  const { data: materials = [], isFetching } = useQuery({
    queryKey: QK.MATERIALS(id),
    queryFn: () => fetchMaterialsByClass(id),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });

  // NEW: quizzes
  const { data: quizzes = [], isFetching: isFetchingQuiz } = useQuery({
    queryKey: QK.QUIZZES(id),
    queryFn: () => fetchQuizzesByClass(id),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });

  // filter & search
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | MaterialType>("all");

  const filtered = useMemo(() => {
    let list = materials;
    if (type !== "all") list = list.filter((m) => m.type === type);
    const qq = q.trim().toLowerCase();
    if (qq) {
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(qq) ||
          (m.description ?? "").toLowerCase().includes(qq)
      );
    }
    return [...list].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );
  }, [materials, q, type]);

  const todayISO = toLocalNoonISO(new Date());
const { slug, id: classId } = useParams<{ slug: string; id: string }>();


  /* ====== Actions: Materials ====== */
  const handleDownload = (m: ClassMaterial) => {
    const att = m.attachments?.[0];
    if (!att) {
      alert("Materi ini belum memiliki lampiran untuk diunduh.");
      return;
    }
    if (att.url) {
      window.open(att.url, "_blank", "noopener,noreferrer");
      return;
    }
    const blob = new Blob(
      [
        `Materi: ${m.title}\n\nTidak ada URL file sebenarnya. Ini contoh placeholder untuk "${att.name}".`,
      ],
      { type: "text/plain;charset=utf-8" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = att.name || `${m.title}.txt`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
  };

  /* ====== NEW: Actions - Quizzes ====== */
  const handleAddQuiz = async () => {
    const { value: payload, isConfirmed } = await Swal.fire({
      title: "Tambah Quiz",
      html: `
        <input id="quiz-title" class="swal2-input" placeholder="Judul quiz" />
        <textarea id="quiz-desc" class="swal2-textarea" placeholder="Deskripsi (opsional)"></textarea>
        <input id="quiz-due" type="datetime-local" class="swal2-input" />
        <input id="quiz-duration" type="number" min="1" class="swal2-input" placeholder="Durasi (menit)" />
        <input id="quiz-questions" type="number" min="1" class="swal2-input" placeholder="Jumlah soal" />
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      background: palette.white1,
      color: palette.black1,
      confirmButtonColor: palette.primary,
      preConfirm: () => {
        const title = (
          document.getElementById("quiz-title") as HTMLInputElement
        )?.value.trim();
        const description = (
          document.getElementById("quiz-desc") as HTMLTextAreaElement
        )?.value.trim();
        const dueRaw = (document.getElementById("quiz-due") as HTMLInputElement)
          ?.value;
        const durationMin = parseInt(
          (document.getElementById("quiz-duration") as HTMLInputElement)
            ?.value || "0",
          10
        );
        const totalQuestions = parseInt(
          (document.getElementById("quiz-questions") as HTMLInputElement)
            ?.value || "0",
          10
        );
        if (!title) {
          Swal.showValidationMessage("Judul wajib diisi");
          return;
        }
        if (!totalQuestions || totalQuestions <= 0) {
          Swal.showValidationMessage("Jumlah soal harus lebih dari 0");
          return;
        }
        return {
          title,
          description,
          dueAt: dueRaw ? new Date(dueRaw).toISOString() : undefined,
          durationMin: durationMin > 0 ? durationMin : undefined,
          totalQuestions,
        };
      },
    });

    if (!isConfirmed || !payload) return;

    const nowISO = new Date().toISOString();
    const newQuiz: Quiz = {
      id: `q-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      createdAt: nowISO,
      dueAt: payload.dueAt,
      durationMin: payload.durationMin,
      totalQuestions: payload.totalQuestions,
      attempts: 0,
      avgScore: 0,
      published: false,
      author: cls?.homeroom ?? "Guru",
    };

    qc.setQueryData<Quiz[]>(QK.QUIZZES(id), (old = []) => [newQuiz, ...old]);

    await Swal.fire({
      title: "Quiz ditambahkan",
      icon: "success",
      timer: 1200,
      showConfirmButton: false,
      background: palette.white1,
      color: palette.black1,
    });
  };

  const handleEditQuiz = async (qz: Quiz) => {
    const { value: payload, isConfirmed } = await Swal.fire({
      title: "Edit Quiz",
      html: `
        <input id="quiz-title" class="swal2-input" placeholder="Judul quiz" value="${qz.title.replace(/"/g, "&quot;")}" />
        <textarea id="quiz-desc" class="swal2-textarea" placeholder="Deskripsi (opsional)">${qz.description ?? ""}</textarea>
        <input id="quiz-due" type="datetime-local" class="swal2-input" value="${
          qz.dueAt ? new Date(qz.dueAt).toISOString().slice(0, 16) : ""
        }" />
        <input id="quiz-duration" type="number" min="1" class="swal2-input" placeholder="Durasi (menit)" value="${
          qz.durationMin ?? ""
        }" />
        <input id="quiz-questions" type="number" min="1" class="swal2-input" placeholder="Jumlah soal" value="${
          qz.totalQuestions
        }" />
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      background: palette.white1,
      color: palette.black1,
      confirmButtonColor: palette.primary,
      preConfirm: () => {
        const title = (
          document.getElementById("quiz-title") as HTMLInputElement
        )?.value.trim();
        const description = (
          document.getElementById("quiz-desc") as HTMLTextAreaElement
        )?.value.trim();
        const dueRaw = (document.getElementById("quiz-due") as HTMLInputElement)
          ?.value;
        const durationMin = parseInt(
          (document.getElementById("quiz-duration") as HTMLInputElement)
            ?.value || "0",
          10
        );
        const totalQuestions = parseInt(
          (document.getElementById("quiz-questions") as HTMLInputElement)
            ?.value || "0",
          10
        );
        if (!title) {
          Swal.showValidationMessage("Judul wajib diisi");
          return;
        }
        if (!totalQuestions || totalQuestions <= 0) {
          Swal.showValidationMessage("Jumlah soal harus lebih dari 0");
          return;
        }
        return {
          title,
          description,
          dueAt: dueRaw ? new Date(dueRaw).toISOString() : undefined,
          durationMin: durationMin > 0 ? durationMin : undefined,
          totalQuestions,
        };
      },
    });

    if (!isConfirmed || !payload) return;

    qc.setQueryData<Quiz[]>(QK.QUIZZES(id), (old = []) =>
      old.map((x) =>
        x.id === qz.id
          ? {
              ...x,
              ...payload,
            }
          : x
      )
    );

    await Swal.fire({
      title: "Perubahan disimpan",
      icon: "success",
      timer: 1200,
      showConfirmButton: false,
      background: palette.white1,
      color: palette.black1,
    });
  };

  const handleTogglePublish = async (qz: Quiz) => {
    if (!qz.published) {
      const ok = await Swal.fire({
        title: "Publikasikan quiz?",
        text: "Siswa akan dapat mengakses quiz ini.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Publikasikan",
        cancelButtonText: "Batal",
        background: palette.white1,
        color: palette.black1,
        confirmButtonColor: palette.primary,
      });
      if (!ok.isConfirmed) return;
    }

    qc.setQueryData<Quiz[]>(QK.QUIZZES(id), (old = []) =>
      old.map((x) => (x.id === qz.id ? { ...x, published: !x.published } : x))
    );
  };

  const handleDeleteQuiz = async (qz: Quiz) => {
    const res = await Swal.fire({
      title: "Hapus quiz?",
      text: `"${qz.title}" akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
      background: palette.white1,
      color: palette.black1,
      confirmButtonColor: (palette as any).destructive ?? "#ef4444",
      cancelButtonColor: palette.primary,
    });
    if (!res.isConfirmed) return;

    qc.setQueryData<Quiz[]>(QK.QUIZZES(id), (old = []) =>
      old.filter((x) => x.id !== qz.id)
    );

    await Swal.fire({
      title: "Terhapus",
      icon: "success",
      timer: 1000,
      showConfirmButton: false,
      background: palette.white1,
      color: palette.black1,
    });
  };

  const handleViewResults = async (qz: Quiz) => {
    await Swal.fire({
      title: "Ringkasan Hasil",
      html: `
        <div style="text-align:left">
          <p><strong>${qz.title}</strong></p>
          <p>Upaya (attempts): ${qz.attempts}</p>
          <p>Rata-rata nilai: ${qz.avgScore ?? 0}</p>
          <p>Jumlah soal: ${qz.totalQuestions}</p>
          <p>Jatuh tempo: ${dateLong(qz.dueAt)}</p>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Tutup",
      background: palette.white1,
      color: palette.black1,
      confirmButtonColor: palette.primary,
    });
  };

  /* ====== Actions: Materials (delete/edit/add) dari contoh awal ====== */
  const [openModal, setOpenModal] = useState(false);
  const handleAddMateri = async (payload: any) => {
    try {
      const nowISO = new Date().toISOString();
      const newItem: ClassMaterial = {
        id: `m-${Date.now()}`,
        title: payload?.title ?? "Materi tanpa judul",
        description: payload?.description ?? "",
        type: (payload?.type as MaterialType) ?? "pdf",
        createdAt: nowISO,
        updatedAt: undefined,
        attachments: Array.isArray(payload?.attachments)
          ? payload.attachments
          : payload?.attachment
            ? [payload.attachment]
            : [],
        author: payload?.author ?? cls?.homeroom ?? "Guru",
      };

      qc.setQueryData<ClassMaterial[]>(QK.MATERIALS(id), (old = []) => [
        newItem,
        ...old,
      ]);

      qc.setQueryData<TeacherClassSummary[]>(QK.CLASSES, (old = []) =>
        old.map((c) =>
          c.id === id
            ? { ...c, materialsCount: (c.materialsCount ?? 0) + 1 }
            : c
        )
      );

      setOpenModal(false);
      await Swal.fire({
        title: "Materi ditambahkan",
        text: "Materi baru berhasil ditambahkan.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
        background: palette.white1,
        color: palette.black1,
      });
    } catch (e) {
      await Swal.fire({
        title: "Gagal menambahkan",
        text: "Terjadi kesalahan saat menambahkan materi.",
        icon: "error",
        background: palette.white1,
        color: palette.black1,
        confirmButtonColor: (palette as any).destructive ?? "#ef4444",
      });
    }
  };

  const [openEdit, setOpenEdit] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassMaterial | null>(null);
  const handleEditMateri = async (payload: any) => {
    try {
      const nowISO = new Date().toISOString();

      qc.setQueryData<ClassMaterial[]>(QK.MATERIALS(id), (old = []) =>
        old.map((m) =>
          m.id === payload.id
            ? {
                ...m,
                title: payload.title,
                description: payload.description,
                type: payload.type as any,
                attachments: payload.attachments ?? [],
                author: payload.author ?? m.author,
                updatedAt: nowISO,
              }
            : m
        )
      );

      setOpenEdit(false);
      setEditingItem(null);

      await Swal.fire({
        title: "Perubahan disimpan",
        text: "Materi berhasil diperbarui.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
        background: palette.white1,
        color: palette.black1,
      });
    } catch (e) {
      await Swal.fire({
        title: "Gagal menyimpan",
        text: "Terjadi kesalahan saat menyimpan perubahan.",
        icon: "error",
        background: palette.white1,
        color: palette.black1,
        confirmButtonColor: (palette as any).destructive ?? "#ef4444",
      });
    }
  };

  const handleDelete = async (m: ClassMaterial) => {
    const res = await Swal.fire({
      title: "Hapus materi?",
      text: `"${m.title}" akan dihapus. Tindakan ini tidak bisa dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      background: palette.white1,
      color: palette.black1,
      confirmButtonColor: (palette as any).destructive ?? "#ef4444",
      cancelButtonColor: palette.primary,
    });

    if (!res.isConfirmed) return;

    qc.setQueryData<ClassMaterial[]>(QK.MATERIALS(id), (old = []) =>
      old.filter((x) => x.id !== m.id)
    );

    await Swal.fire({
      title: "Terhapus",
      text: "Materi berhasil dihapus.",
      icon: "success",
      timer: 1400,
      showConfirmButton: false,
      background: palette.white1,
      color: palette.black1,
    });
  };

  // Lazy import modal supaya contoh tetap jalan tanpa definisi komponen
  // (Jika kamu sudah punya ModalAddClassMateri & ModalEditClassMateri asli, hapus komentar di bawah)
  const ModalAddClassMateri = (_: any) => null as any;
  const ModalEditClassMateri = (_: any) => null as any;

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={cls ? `Materi: ${cls.name}` : "Materi Kelas"}
        gregorianDate={todayISO}
        hijriDate={hijriLong(todayISO)}
        dateFmt={dateLong}
        showBack
      />

      {/* Jika kamu sudah punya komponen modals ini, hapus 2 deklarasi dummy di atas dan uncomment 2 komponen di bawah */}
      {/* <ModalAddClassMateri
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleAddMateri}
        palette={palette}
      />
      <ModalEditClassMateri
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setEditingItem(null);
        }}
        onSubmit={handleEditMateri}
        palette={palette}
        initial={
          editingItem
            ? {
                id: editingItem.id,
                title: editingItem.title,
                description: editingItem.description,
                type: editingItem.type as any,
                attachments: editingItem.attachments ?? [],
                author: editingItem.author,
              }
            : undefined
        }
      /> */}

      <main className="w-full px-4 md:px-6  md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* back */}
            <div className="md:flex hidden gap-3 items-center ">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
                className="gap-1 "
              >
                <ArrowLeft size={20} />
              </Btn>
              <h1 className="textlg font-semibold">Materi</h1>
            </div>

            {/* header ringkas */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lg md:text-xl font-semibold">
                    {cls?.name ?? "—"}
                  </div>
                  <div
                    className="mt-1 flex flex-wrap items-center gap-2 text-sm"
                    style={{ color: palette.black2 }}
                  >
                    <Badge variant="outline" palette={palette}>
                      <span style={{ color: palette.black2 }}>
                        {cls?.room ?? "-"}
                      </span>
                    </Badge>
                    <span>Wali Kelas: {cls?.homeroom ?? "-"}</span>
                    <span>• {cls?.academicTerm ?? "-"}</span>
                    <span>• Angkatan {cls?.cohortYear ?? "-"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Btn
                    palette={palette}
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpenModal(true)}
                  >
                    <Plus size={16} className="mr-1" />
                    Tambah Materi
                  </Btn>
                </div>
              </div>
            </SectionCard>

            {/* controls */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div
                  className="flex items-center gap-2 rounded-xl border px-3 h-10"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <Search size={16} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari materi…"
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: palette.black1 }}
                  />
                </div>

                <div
                  className="flex items-center gap-2 rounded-xl border px-3 h-10"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <Filter size={16} />
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: palette.black1 }}
                  >
                    <option value="all">Semua tipe</option>
                    <option value="pdf">PDF</option>
                    <option value="doc">Dokumen</option>
                    <option value="ppt">Presentasi</option>
                    <option value="video">Video</option>
                    <option value="link">Tautan</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* list materi */}
            <div className="grid gap-3">
              {isFetching && filtered.length === 0 && (
                <SectionCard palette={palette}>
                  <div
                    className="p-6 text-sm"
                    style={{ color: palette.silver2 }}
                  >
                    Memuat materi…
                  </div>
                </SectionCard>
              )}

              {filtered.map((m) => (
                <SectionCard
                  key={m.id}
                  palette={palette}
                  className="p-0 hover:shadow-sm transition-shadow"
                  style={{ background: palette.white1 }}
                >
                  {/* Body */}
                  <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-base font-semibold truncate">
                            <span style={{ color: palette.black2 }}>
                              {m.title}
                            </span>
                          </div>
                          <Badge
                            palette={palette}
                            variant={
                              m.type === "pdf"
                                ? "secondary"
                                : m.type === "doc"
                                  ? "info"
                                  : m.type === "ppt"
                                    ? "warning"
                                    : m.type === "video"
                                      ? "success"
                                      : "outline"
                            }
                            className="h-6"
                          >
                            {m.type.toUpperCase()}
                          </Badge>
                        </div>

                        {m.description && (
                          <p
                            className="text-sm mt-1 line-clamp-2"
                            style={{ color: palette.black2 }}
                          >
                            {m.description}
                          </p>
                        )}

                        <div
                          className="mt-2 flex flex-wrap items-center gap-2 text-sm"
                          style={{ color: palette.black2 }}
                        >
                          <CalendarDays size={14} />
                          <span>Dibuat: {dateLong(m.createdAt)}</span>
                          {m.updatedAt && (
                            <span>• Diperbarui: {dateLong(m.updatedAt)}</span>
                          )}
                          {m.author && <span>• Oleh {m.author}</span>}
                          {m.attachments?.length ? (
                            <>
                              <span>•</span>
                              <span>{m.attachments.length} lampiran</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div
                    className="px-4 md:px-5 pb-4 md:pb-5 pt-3 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <div className="text-sm" style={{ color: palette.black2 }}>
                      Aksi cepat untuk materi ini
                    </div>
                    <div className="flex gap-2">
                      <Btn
                        palette={palette}
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(m)}
                      >
                        <Download size={16} className="mr-1" />
                      </Btn>

                      <Btn
                        palette={palette}
                        size="sm"
                        onClick={() => {
                          setEditingItem(m);
                          setOpenEdit(true);
                        }}
                      >
                        <Pencil className="mr-1" size={16} />
                      </Btn>

                      <Btn
                        palette={palette}
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(m)}
                      >
                        <Trash2 className="mr-1" size={16} />
                      </Btn>
                    </div>
                  </div>
                </SectionCard>
              ))}

              {filtered.length === 0 && !isFetching && (
                <SectionCard palette={palette}>
                  <div
                    className="p-6 text-sm text-center"
                    style={{ color: palette.silver2 }}
                  >
                    Belum ada materi untuk kelas ini.
                  </div>
                </SectionCard>
              )}
            </div>

            {/* ===================== */}
            {/* NEW: SECTION QUIZ     */}
            {/* ===================== */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList
                      size={18}
                      style={{ color: palette.primary }}
                    />
                    <h2
                      className="font-semibold"
                      style={{ color: palette.black1 }}
                    >
                      Quiz Kelas
                    </h2>
                  </div>
                  <Btn palette={palette} size="sm" onClick={handleAddQuiz}>
                    <Plus />
                  </Btn>
                </div>

                {isFetchingQuiz && (
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Memuat quiz…
                  </div>
                )}

                {!isFetchingQuiz && quizzes.length === 0 && (
                  <div
                    className="text-sm text-center"
                    style={{ color: palette.silver2 }}
                  >
                    Belum ada quiz untuk kelas ini.
                  </div>
                )}

                <div className="grid gap-3">
                  {quizzes.map((qz) => (
                    <SectionCard key={qz.id} palette={palette} className="p-0">
                      <div className="p-4 md:p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="font-semibold text-base"
                                style={{ color: palette.black2 }}
                              >
                                {qz.title}
                              </span>
                              <Badge
                                palette={palette}
                                variant={qz.published ? "success" : "outline"}
                                className="h-6"
                              >
                                {qz.published ? "Terpublikasi" : "Draft"}
                              </Badge>
                            </div>

                            {qz.description && (
                              <p
                                className="text-sm mt-1"
                                style={{ color: palette.black2 }}
                              >
                                {qz.description}
                              </p>
                            )}

                            <div
                              className="mt-2 flex flex-wrap items-center gap-3 text-sm"
                              style={{ color: palette.black2 }}
                            >
                              <Timer size={14} />
                              <span>{qz.durationMin ?? 0} menit</span>
                              <span>• {qz.totalQuestions} soal</span>
                              <span>• Deadline: {dateLong(qz.dueAt)}</span>
                              <span>• Attempt: {qz.attempts}</span>
                              <span>• Rata-rata: {qz.avgScore ?? 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="px-4 md:px-5 pb-4 md:pb-5 pt-3 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        style={{ borderColor: palette.silver1 }}
                      >
                        <div
                          className="text-sm"
                          style={{ color: palette.black2 }}
                        >
                          Aksi quiz
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Btn
                            palette={palette}
                            size="sm"
                            variant="outline"
                            onClick={() => handleTogglePublish(qz)}
                          >
                            {qz.published ? "Tarik Publikasi" : "Publikasikan"}
                          </Btn>
                          <Btn
                            palette={palette}
                            size="sm"
                            onClick={() =>
                              navigate(`/${slug}/guru/quizClass/${qz.id}`)
                            }
                          >
                            <Eye size={16} className="mr-1" />
                          </Btn>
                          <Btn
                            palette={palette}
                            size="sm"
                            onClick={() => handleEditQuiz(qz)}
                          >
                            <Pencil size={16} className="mr-1" />
                          </Btn>
                          <Btn
                            palette={palette}
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewResults(qz)}
                          >
                            <BarChart2 size={16} className="mr-1" />
                          </Btn>
                          <Btn
                            palette={palette}
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteQuiz(qz)}
                          >
                            <Trash2 size={16} className="mr-1" />
                          </Btn>
                        </div>
                      </div>
                    </SectionCard>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
