// // src/pages/sekolahislamku/announcements/AnnouncementsPage.tsx
// import { useMemo, useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { NavLink } from "react-router-dom";
// import { colors } from "@/constants/colorsThema";
// import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
// import axios from "@/lib/axios";

// import {
//   SectionCard,
//   Badge,
//   Btn,
//   type Palette,
// } from "@/pages/sekolahislamku/components/ui/Primitives";

// import SchoolSidebarNav from "@/pages/sekolahislamku/components/home/SchoolSideBarNav";
// import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";

// import {
//   Megaphone,
//   Plus,
//   Search,
//   Filter,
//   AlertTriangle,
//   CalendarClock,
//   Send,
//   X,
//   CheckCircle2,
//   PauseCircle,
//   Trash2,
//   Eye,
//   Users,
// } from "lucide-react";

// /* ================= Types ================ */
// export type Audience = "all" | "students" | "teachers";
// export type AnnouncementStatus =
//   | "draft"
//   | "scheduled"
//   | "published"
//   | "archived";

// export interface AnnouncementItem {
//   id: string;
//   title: string;
//   content?: string;
//   audience: Audience;
//   status: AnnouncementStatus;
//   created_at: string; // ISO
//   scheduled_at?: string; // ISO
//   published_at?: string; // ISO
// }

// /* =============== Helpers =============== */
// const dateFmt = (iso?: string) =>
//   iso
//     ? new Date(iso).toLocaleString("id-ID", {
//         day: "2-digit",
//         month: "long",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       })
//     : "-";

// /* =============== Main Page =============== */
// export default function SchoolAnnouncement() {
//   const { isDark } = useHtmlDarkMode();
//   const theme: Palette = isDark ? colors.dark : colors.light;
//   const qc = useQueryClient();

//   // filters
//   const [q, setQ] = useState("");
//   const [aud, setAud] = useState<Audience | "semua">("semua");
//   const [status, setStatus] = useState<AnnouncementStatus | "semua">("semua");

//   // new form state
//   const [showNew, setShowNew] = useState(false);
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [audience, setAudience] = useState<Audience>("all");
//   const [scheduleType, setScheduleType] = useState<"now" | "later">("now");
//   const [scheduleAt, setScheduleAt] = useState<string>(""); // ISO date-time input "YYYY-MM-DDTHH:mm"

//   // ====== Query announcements
//   const listQuery = useQuery({
//     queryKey: ["announcements", { q, aud, status }],
//     queryFn: async () => {
//       const params: Record<string, string> = {};
//       if (q) params.q = q;
//       if (aud !== "semua") params.audience = aud;
//       if (status !== "semua") params.status = status;
//       const res = await axios.get("/api/a/announcements", { params });
//       return res.data as { list: AnnouncementItem[]; total: number };
//     },
//   });

//   const items = listQuery.data?.list ?? [];

//   const stats = useMemo(() => {
//     const total = listQuery.data?.total ?? items.length;
//     const published = items.filter((i) => i.status === "published").length;
//     const scheduled = items.filter((i) => i.status === "scheduled").length;
//     const draft = items.filter((i) => i.status === "draft").length;
//     return { total, published, scheduled, draft };
//   }, [listQuery.data, items]);

//   // ====== Mutations
//   const createMutation = useMutation({
//     mutationFn: async () => {
//       const payload: any = { title, content, audience };
//       if (scheduleType === "later" && scheduleAt)
//         payload.scheduled_at = scheduleAt;
//       return axios.post("/api/a/announcements", payload);
//     },
//     onSuccess: () => {
//       setShowNew(false);
//       setTitle("");
//       setContent("");
//       setAudience("all");
//       setScheduleType("now");
//       setScheduleAt("");
//       qc.invalidateQueries({ queryKey: ["announcements"] });
//     },
//   });

//   const publishMutation = useMutation({
//     mutationFn: async (id: string) =>
//       axios.post(`/api/a/announcements/${id}/publish`),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
//   });

//   const unpublishMutation = useMutation({
//     mutationFn: async (id: string) =>
//       axios.post(`/api/a/announcements/${id}/unpublish`),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async (id: string) =>
//       axios.delete(`/api/a/announcements/${id}`),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
//   });

//   return (
//     <>
//       <ParentTopBar palette={theme} title="Pengumuman" />
//       <div className="lg:flex lg:items-start lg:gap-4 lg:p-4 lg:pt-6">
//         {/* Sidebar kiri */}
//         <SchoolSidebarNav palette={theme} className="hidden lg:block" />

//         {/* Konten kanan */}
//         <main className="flex-1 mx-auto max-w-6xl px-4 py-6 space-y-5">
//           {/* Header + actions */}
//           <div className="flex items-start justify-between flex-wrap gap-3">
//             <div className="flex items-center gap-3">
//               <div
//                 className="h-10 w-10 rounded-xl grid place-items-center"
//                 style={{ background: theme.white3, color: theme.quaternary }}
//               >
//                 <Megaphone size={20} />
//               </div>
//               <div>
//                 <h1
//                   className="text-xl font-semibold"
//                   style={{ color: theme.quaternary }}
//                 >
//                   Pengumuman
//                 </h1>
//                 <p className="text-sm" style={{ color: theme.secondary }}>
//                   Kelola pengumuman sekolah untuk siswa/guru.
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <Btn
//                 palette={theme}
//                 size="sm"
//                 variant="default"
//                 className="flex items-center gap-2"
//                 onClick={() => setShowNew(true)}
//               >
//                 <Plus size={16} /> Pengumuman Baru
//               </Btn>
//             </div>
//           </div>

//           {/* Snapshot */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
//             <SectionCard palette={theme} className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm" style={{ color: theme.secondary }}>
//                     Total
//                   </p>
//                   <p
//                     className="text-2xl font-semibold"
//                     style={{ color: theme.quaternary }}
//                   >
//                     {stats.total}
//                   </p>
//                 </div>
//                 <Users />
//               </div>
//             </SectionCard>
//             <SectionCard palette={theme} className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm" style={{ color: theme.secondary }}>
//                     Published
//                   </p>
//                   <p
//                     className="text-2xl font-semibold"
//                     style={{ color: theme.quaternary }}
//                   >
//                     {stats.published}
//                   </p>
//                 </div>
//                 <Badge variant="success" palette={theme}>
//                   OK
//                 </Badge>
//               </div>
//             </SectionCard>
//             <SectionCard palette={theme} className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm" style={{ color: theme.secondary }}>
//                     Scheduled
//                   </p>
//                   <p
//                     className="text-2xl font-semibold"
//                     style={{ color: theme.quaternary }}
//                   >
//                     {stats.scheduled}
//                   </p>
//                 </div>
//                 <CalendarClock />
//               </div>
//             </SectionCard>
//             <SectionCard palette={theme} className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm" style={{ color: theme.secondary }}>
//                     Draft
//                   </p>
//                   <p
//                     className="text-2xl font-semibold"
//                     style={{ color: theme.quaternary }}
//                   >
//                     {stats.draft}
//                   </p>
//                 </div>
//                 <Badge variant="outline" palette={theme}>
//                   Draft
//                 </Badge>
//               </div>
//             </SectionCard>
//           </div>

//           {/* Filter bar */}
//           <SectionCard palette={theme} className="p-4">
//             <div className="flex flex-col md:flex-row md:items-center gap-3">
//               <div
//                 className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2 border"
//                 style={{ borderColor: theme.white3, background: theme.white1 }}
//               >
//                 <Search size={16} />
//                 <input
//                   value={q}
//                   onChange={(e) => setQ(e.target.value)}
//                   placeholder="Cari judul/konten…"
//                   className="w-full bg-transparent outline-none"
//                   style={{ color: theme.quaternary }}
//                 />
//               </div>

//               <div className="flex items-center gap-2">
//                 <div
//                   className="rounded-xl border px-3 py-2"
//                   style={{
//                     borderColor: theme.white3,
//                     background: theme.white1,
//                     color: theme.quaternary,
//                   }}
//                 >
//                   <div className="text-xs" style={{ color: theme.secondary }}>
//                     Audiens
//                   </div>
//                   <select
//                     value={aud}
//                     onChange={(e) => setAud(e.target.value as any)}
//                     className="bg-transparent outline-none"
//                   >
//                     <option value="semua">Semua</option>
//                     <option value="all">Semua (Siswa+Guru)</option>
//                     <option value="students">Siswa</option>
//                     <option value="teachers">Guru</option>
//                   </select>
//                 </div>

//                 <div
//                   className="rounded-xl border px-3 py-2"
//                   style={{
//                     borderColor: theme.white3,
//                     background: theme.white1,
//                     color: theme.quaternary,
//                   }}
//                 >
//                   <div className="text-xs" style={{ color: theme.secondary }}>
//                     Status
//                   </div>
//                   <select
//                     value={status}
//                     onChange={(e) => setStatus(e.target.value as any)}
//                     className="bg-transparent outline-none"
//                   >
//                     <option value="semua">Semua</option>
//                     <option value="published">Published</option>
//                     <option value="scheduled">Scheduled</option>
//                     <option value="draft">Draft</option>
//                     <option value="archived">Archived</option>
//                   </select>
//                 </div>

//                 <Btn
//                   size="sm"
//                   className="flex items-center gap-2"
//                   onClick={() => listQuery.refetch()}
//                   palette={theme}
//                 >
//                   <Filter size={16} /> Terapkan
//                 </Btn>
//               </div>
//             </div>
//           </SectionCard>

//           {/* Form: Pengumuman Baru */}
//           {showNew && (
//             <SectionCard palette={theme} className="p-4">
//               <div className="flex items-center justify-between mb-3">
//                 <div className="flex items-center gap-2">
//                   <Megaphone size={18} />
//                   <div className="font-medium">Buat Pengumuman</div>
//                 </div>
//                 <button
//                   onClick={() => setShowNew(false)}
//                   className="text-sm"
//                   style={{ color: theme.secondary }}
//                 >
//                   <X className="inline mr-1" size={14} /> Tutup
//                 </button>
//               </div>

//               <div className="grid gap-3">
//                 <div>
//                   <div
//                     className="text-xs mb-1"
//                     style={{ color: theme.secondary }}
//                   >
//                     Judul
//                   </div>
//                   <input
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     className="w-full rounded-xl px-3 py-2 border bg-transparent outline-none"
//                     style={{
//                       borderColor: theme.white3,
//                       color: theme.quaternary,
//                     }}
//                     placeholder="Contoh: Perubahan Jadwal UTS"
//                   />
//                 </div>
//                 <div>
//                   <div
//                     className="text-xs mb-1"
//                     style={{ color: theme.secondary }}
//                   >
//                     Isi
//                   </div>
//                   <textarea
//                     value={content}
//                     onChange={(e) => setContent(e.target.value)}
//                     rows={5}
//                     className="w-full rounded-xl px-3 py-2 border bg-transparent outline-none"
//                     style={{
//                       borderColor: theme.white3,
//                       color: theme.quaternary,
//                     }}
//                     placeholder="Tulis isi pengumuman di sini…"
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                   <div
//                     className="rounded-xl border px-3 py-2"
//                     style={{
//                       borderColor: theme.white3,
//                       background: theme.white1,
//                       color: theme.quaternary,
//                     }}
//                   >
//                     <div className="text-xs" style={{ color: theme.secondary }}>
//                       Audiens
//                     </div>
//                     <select
//                       value={audience}
//                       onChange={(e) => setAudience(e.target.value as Audience)}
//                       className="bg-transparent outline-none"
//                     >
//                       <option value="all">Semua</option>
//                       <option value="students">Siswa</option>
//                       <option value="teachers">Guru</option>
//                     </select>
//                   </div>

//                   <div
//                     className="rounded-xl border px-3 py-2"
//                     style={{
//                       borderColor: theme.white3,
//                       background: theme.white1,
//                       color: theme.quaternary,
//                     }}
//                   >
//                     <div className="text-xs" style={{ color: theme.secondary }}>
//                       Jadwalkan
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <label
//                         className="inline-flex items-center gap-1 text-sm"
//                         style={{ color: theme.quaternary }}
//                       >
//                         <input
//                           type="radio"
//                           name="sched"
//                           checked={scheduleType === "now"}
//                           onChange={() => setScheduleType("now")}
//                         />
//                         Kirim sekarang
//                       </label>
//                       <label
//                         className="inline-flex items-center gap-1 text-sm"
//                         style={{ color: theme.quaternary }}
//                       >
//                         <input
//                           type="radio"
//                           name="sched"
//                           checked={scheduleType === "later"}
//                           onChange={() => setScheduleType("later")}
//                         />
//                         Jadwalkan
//                       </label>
//                     </div>
//                   </div>

//                   {scheduleType === "later" && (
//                     <div
//                       className="rounded-xl border px-3 py-2"
//                       style={{
//                         borderColor: theme.white3,
//                         background: theme.white1,
//                         color: theme.quaternary,
//                       }}
//                     >
//                       <div
//                         className="text-xs"
//                         style={{ color: theme.secondary }}
//                       >
//                         Waktu Kirim
//                       </div>
//                       <input
//                         type="datetime-local"
//                         value={scheduleAt}
//                         onChange={(e) => setScheduleAt(e.target.value)}
//                         className="bg-transparent outline-none"
//                       />
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <Btn
//                     palette={theme}
//                     variant="default"
//                     className="flex items-center gap-2"
//                     onClick={() => createMutation.mutate()}
//                     disabled={
//                       !title ||
//                       !content ||
//                       (scheduleType === "later" && !scheduleAt)
//                     }
//                   >
//                     <Send size={16} /> Kirim
//                   </Btn>
//                   <Btn
//                     palette={theme}
//                     variant="outline"
//                     onClick={() => setShowNew(false)}
//                   >
//                     Batal
//                   </Btn>
//                   {createMutation.isError && (
//                     <div
//                       className="text-sm flex items-center gap-1"
//                       style={{ color: theme.warning1 }}
//                     >
//                       <AlertTriangle size={14} /> Gagal mengirim.
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </SectionCard>
//           )}

//           {/* List */}
//           <SectionCard palette={theme} className="p-2 md:p-4">
//             <div className="overflow-auto">
//               <table className="min-w-[900px] w-full">
//                 <thead>
//                   <tr
//                     className="text-left text-sm"
//                     style={{ color: theme.secondary }}
//                   >
//                     <th className="py-3">Judul</th>
//                     <th>Audiens</th>
//                     <th>Jadwal</th>
//                     <th>Status</th>
//                     <th>Dibuat</th>
//                     <th className="text-right pr-2">Aksi</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {listQuery.isLoading && (
//                     <tr>
//                       <td
//                         colSpan={6}
//                         className="py-8 text-center"
//                         style={{ color: theme.secondary }}
//                       >
//                         Memuat data…
//                       </td>
//                     </tr>
//                   )}

//                   {listQuery.isError && (
//                     <tr>
//                       <td colSpan={6} className="py-8">
//                         <div
//                           className="flex items-center gap-2 justify-center text-sm"
//                           style={{ color: theme.warning1 }}
//                         >
//                           <AlertTriangle size={16} /> Terjadi kesalahan.
//                           <button
//                             className="underline"
//                             onClick={() => listQuery.refetch()}
//                           >
//                             Coba lagi
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   )}

//                   {!listQuery.isLoading && items.length === 0 && (
//                     <tr>
//                       <td
//                         colSpan={6}
//                         className="py-10 text-center"
//                         style={{ color: theme.secondary }}
//                       >
//                         Belum ada pengumuman.
//                       </td>
//                     </tr>
//                   )}

//                   {items.map((a) => (
//                     <tr
//                       key={a.id}
//                       className="border-top border-t"
//                       style={{ borderColor: theme.white3 }}
//                     >
//                       <td className="py-3 align-top">
//                         <div
//                           className="font-medium"
//                           style={{ color: theme.quaternary }}
//                         >
//                           {a.title}
//                         </div>
//                         {a.content && (
//                           <div
//                             className="text-xs line-clamp-2"
//                             style={{ color: theme.secondary }}
//                           >
//                             {a.content}
//                           </div>
//                         )}
//                       </td>
//                       <td
//                         className="py-3 align-top"
//                         style={{ color: theme.quaternary }}
//                       >
//                         {a.audience === "all"
//                           ? "Semua"
//                           : a.audience === "students"
//                             ? "Siswa"
//                             : "Guru"}
//                       </td>
//                       <td
//                         className="py-3 align-top"
//                         style={{ color: theme.quaternary }}
//                       >
//                         {a.scheduled_at ? dateFmt(a.scheduled_at) : "-"}
//                       </td>
//                       <td className="py-3 align-top">
//                         {a.status === "published" && (
//                           <Badge variant="success" palette={theme}>
//                             Published
//                           </Badge>
//                         )}
//                         {a.status === "scheduled" && (
//                           <Badge variant="info" palette={theme}>
//                             Scheduled
//                           </Badge>
//                         )}
//                         {a.status === "draft" && (
//                           <Badge variant="outline" palette={theme}>
//                             Draft
//                           </Badge>
//                         )}
//                         {a.status === "archived" && (
//                           <Badge variant="secondary" palette={theme}>
//                             Archived
//                           </Badge>
//                         )}
//                       </td>
//                       <td
//                         className="py-3 align-top"
//                         style={{ color: theme.quaternary }}
//                       >
//                         {dateFmt(a.created_at)}
//                       </td>
//                       <td className="py-3 align-top">
//                         <div className="flex items-center gap-2 justify-end">
//                           <NavLink
//                             to={`/sekolah/pengumuman/${a.id}`}
//                             className="text-sm underline"
//                           >
//                             {" "}
//                             <Eye size={14} className="inline" /> Lihat{" "}
//                           </NavLink>
//                           {a.status !== "published" ? (
//                             <Btn
//                               size="sm"
//                               palette={theme}
//                               className="flex items-center gap-1"
//                               onClick={() => publishMutation.mutate(a.id)}
//                             >
//                               <CheckCircle2 size={14} /> Publish
//                             </Btn>
//                           ) : (
//                             <Btn
//                               size="sm"
//                               palette={theme}
//                               variant="secondary"
//                               className="flex items-center gap-1"
//                               onClick={() => unpublishMutation.mutate(a.id)}
//                             >
//                               <PauseCircle size={14} /> Unpublish
//                             </Btn>
//                           )}
//                           <Btn
//                             size="sm"
//                             palette={theme}
//                             variant="destructive"
//                             className="flex items-center gap-1"
//                             onClick={() => deleteMutation.mutate(a.id)}
//                           >
//                             <Trash2 size={14} /> Hapus
//                           </Btn>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Footer state */}
//             <div
//               className="mt-3 text-xs flex items-center justify-between"
//               style={{ color: theme.secondary }}
//             >
//               <div>
//                 {listQuery.isFetching
//                   ? "Memuat ulang…"
//                   : `Menampilkan ${items.length} pengumuman`}
//               </div>
//               <button className="underline" onClick={() => listQuery.refetch()}>
//                 Refresh
//               </button>
//             </div>
//           </SectionCard>
//         </main>
//       </div>
//     </>
//   );
// }

// src/pages/sekolahislamku/announcements/AnnouncementsPage.tsx
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import axios from "@/lib/axios";

import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import SchoolSidebarNav from "@/pages/sekolahislamku/components/home/SchoolSideBarNav";
import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";

import {
  Megaphone,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CalendarClock,
  Send,
  X,
  CheckCircle2,
  PauseCircle,
  Trash2,
  Eye,
  Users,
  MoreVertical,
  Edit,
} from "lucide-react";

/* ================= Types ================ */
export type Audience = "all" | "students" | "teachers";
export type AnnouncementStatus = "draft" | "scheduled" | "published" | "archived";

export interface AnnouncementItem {
  id: string;
  title: string;
  content?: string;
  audience: Audience;
  status: AnnouncementStatus;
  created_at: string;
  scheduled_at?: string;
  published_at?: string;
}

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: AnnouncementItem | null;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onDelete: (id: string) => void;
  theme: Palette;
}

/* =============== Components =============== */
const ActionModal = ({
  isOpen,
  onClose,
  announcement,
  onPublish,
  onUnpublish,
  onDelete,
  theme
}: ActionModalProps) => {
  if (!isOpen || !announcement) return null;

  const handleAction = (action: string) => {
    switch (action) {
      case 'publish':
        onPublish(announcement.id);
        break;
      case 'unpublish':
        onUnpublish(announcement.id);
        break;
      case 'delete':
        if (confirm('Yakin ingin menghapus pengumuman ini?')) {
          onDelete(announcement.id);
        }
        break;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative shadow-2xl"
        style={{ backgroundColor: theme.white1, borderColor: theme.white3 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-opacity-10 transition-colors"
          style={{ color: theme.secondary, backgroundColor: theme.white3 }}
        >
          <X size={18} />
        </button>

        {/* Modal header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2" style={{ color: theme.quaternary }}>
            Aksi Pengumuman
          </h3>
          <p className="text-sm line-clamp-2" style={{ color: theme.secondary }}>
            {announcement.title}
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleAction('view')}
            className="w-full flex items-center gap-3 p-3 text-left rounded-xl transition-all duration-200 hover:bg-opacity-50"
            style={{ 
              backgroundColor: theme.white3,
              color: theme.quaternary 
            }}
          >
            <div className="p-2 rounded-lg" style={{ backgroundColor: theme.primary, color: 'white' }}>
              <Eye size={16} />
            </div>
            <div>
              <div className="font-medium">Lihat Detail</div>
              <div className="text-sm" style={{ color: theme.secondary }}>
                Buka halaman detail pengumuman
              </div>
            </div>
          </button>

          {announcement.status !== "published" ? (
            <button
              onClick={() => handleAction('publish')}
              className="w-full flex items-center gap-3 p-3 text-left rounded-xl transition-all duration-200 hover:bg-opacity-50"
              style={{ 
                backgroundColor: theme.white3,
                color: theme.quaternary 
              }}
            >
              <div className="p-2 rounded-lg bg-green-600">
                <CheckCircle2 size={16} className="text-white" />
              </div>
              <div>
                <div className="font-medium">Publish</div>
                <div className="text-sm" style={{ color: theme.secondary }}>
                  Terbitkan pengumuman ini
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => handleAction('unpublish')}
              className="w-full flex items-center gap-3 p-3 text-left rounded-xl transition-all duration-200 hover:bg-opacity-50"
              style={{ 
                backgroundColor: theme.white3,
                color: theme.quaternary 
              }}
            >
              <div className="p-2 rounded-lg bg-orange-500">
                <PauseCircle size={16} className="text-white" />
              </div>
              <div>
                <div className="font-medium">Unpublish</div>
                <div className="text-sm" style={{ color: theme.secondary }}>
                  Batalkan publikasi pengumuman
                </div>
              </div>
            </button>
          )}

          <button
            onClick={() => handleAction('delete')}
            className="w-full flex items-center gap-3 p-3 text-left rounded-xl transition-all duration-200 hover:bg-opacity-50"
            style={{ 
              backgroundColor: theme.white3,
              color: theme.quaternary 
            }}
          >
            <div className="p-2 rounded-lg bg-red-600">
              <Trash2 size={16} className="text-white" />
            </div>
            <div>
              <div className="font-medium">Hapus</div>
              <div className="text-sm" style={{ color: theme.secondary }}>
                Hapus pengumuman secara permanen
              </div>
            </div>
          </button>
        </div>

        {/* Modal footer */}
        <div className="mt-6 pt-4 border-t" style={{ borderColor: theme.white3 }}>
          <button
            onClick={onClose}
            className="w-full py-2 text-center rounded-lg transition-colors"
            style={{ 
              color: theme.secondary,
              backgroundColor: theme.white3
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

/* =============== Helpers =============== */
const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const getAudienceLabel = (audience: Audience) => {
  switch (audience) {
    case "all": return "Semua";
    case "students": return "Siswa";
    case "teachers": return "Guru";
    default: return audience;
  }
};

/* =============== Main Component =============== */
export default function SchoolAnnouncement() {
  const { isDark } = useHtmlDarkMode();
  const theme: Palette = isDark ? colors.dark : colors.light;
  const qc = useQueryClient();

  // State management
  const [filters, setFilters] = useState({
    q: "",
    audience: "semua" as Audience | "semua",
    status: "semua" as AnnouncementStatus | "semua"
  });

  const [newForm, setNewForm] = useState({
    show: false,
    title: "",
    content: "",
    audience: "all" as Audience,
    scheduleType: "now" as "now" | "later",
    scheduleAt: ""
  });

  const [actionModal, setActionModal] = useState({
    show: false,
    announcement: null as AnnouncementItem | null
  });

  // Queries
  const listQuery = useQuery({
    queryKey: ["announcements", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.q) params.q = filters.q;
      if (filters.audience !== "semua") params.audience = filters.audience;
      if (filters.status !== "semua") params.status = filters.status;
      
      const res = await axios.get("/api/a/announcements", { params });
      return res.data as { list: AnnouncementItem[]; total: number };
    },
  });

  const items = listQuery.data?.list ?? [];

  const stats = useMemo(() => {
    const total = listQuery.data?.total ?? items.length;
    const published = items.filter((i) => i.status === "published").length;
    const scheduled = items.filter((i) => i.status === "scheduled").length;
    const draft = items.filter((i) => i.status === "draft").length;
    return { total, published, scheduled, draft };
  }, [listQuery.data, items]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: any = { 
        title: newForm.title, 
        content: newForm.content, 
        audience: newForm.audience 
      };
      if (newForm.scheduleType === "later" && newForm.scheduleAt) {
        payload.scheduled_at = newForm.scheduleAt;
      }
      return axios.post("/api/a/announcements", payload);
    },
    onSuccess: () => {
      setNewForm({
        show: false,
        title: "",
        content: "",
        audience: "all",
        scheduleType: "now",
        scheduleAt: ""
      });
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => axios.post(`/api/a/announcements/${id}/publish`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });

  const unpublishMutation = useMutation({
    mutationFn: async (id: string) => axios.post(`/api/a/announcements/${id}/unpublish`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => axios.delete(`/api/a/announcements/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });

  // Event handlers
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleNewFormChange = (key: keyof typeof newForm, value: any) => {
    setNewForm(prev => ({ ...prev, [key]: value }));
  };

  const openActionModal = (announcement: AnnouncementItem) => {
    setActionModal({ show: true, announcement });
  };

  const closeActionModal = () => {
    setActionModal({ show: false, announcement: null });
  };

  return (
    <>
      <ParentTopBar palette={theme} title="Pengumuman" />
      
      <div className="lg:flex lg:items-start lg:gap-4 lg:p-4 lg:pt-6">
        {/* Sidebar */}
        <SchoolSidebarNav palette={theme} className="hidden lg:block" />

        {/* Main Content */}
        <main className="flex-1 mx-auto max-w-6xl px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-xl grid place-items-center"
                style={{ background: theme.white3, color: theme.quaternary }}
              >
                <Megaphone size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: theme.quaternary }}>
                  Pengumuman Sekolah
                </h1>
                <p className="text-sm" style={{ color: theme.secondary }}>
                  Kelola dan publikasikan pengumuman untuk siswa dan guru
                </p>
              </div>
            </div>

            <Btn
              palette={theme}
              variant="default"
              className="flex items-center gap-2"
              onClick={() => handleNewFormChange('show', true)}
            >
              <Plus size={18} /> Buat Pengumuman
            </Btn>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SectionCard palette={theme} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: theme.secondary }}>Total</p>
                  <p className="text-2xl font-bold" style={{ color: theme.quaternary }}>
                    {stats.total}
                  </p>
                </div>
                <Users className="opacity-60" style={{ color: theme.secondary }} />
              </div>
            </SectionCard>

            <SectionCard palette={theme} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: theme.secondary }}>Published</p>
                  <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                </div>
                <CheckCircle2 className="opacity-60 text-green-600" />
              </div>
            </SectionCard>

            <SectionCard palette={theme} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: theme.secondary }}>Scheduled</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                </div>
                <CalendarClock className="opacity-60 text-blue-600" />
              </div>
            </SectionCard>

            <SectionCard palette={theme} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: theme.secondary }}>Draft</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.draft}</p>
                </div>
                <Edit className="opacity-60 text-orange-600" />
              </div>
            </SectionCard>
          </div>

          {/* Filters */}
          <SectionCard palette={theme} className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="flex-1">
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3 border"
                  style={{ borderColor: theme.white3, background: theme.white1 }}
                >
                  <Search size={18} style={{ color: theme.secondary }} />
                  <input
                    value={filters.q}
                    onChange={(e) => handleFilterChange('q', e.target.value)}
                    placeholder="Cari pengumuman..."
                    className="w-full bg-transparent outline-none"
                    style={{ color: theme.quaternary }}
                  />
                </div>
              </div>

              {/* Filter dropdowns */}
              <div className="flex gap-3 ">
                <select
                  value={filters.audience}
                  onChange={(e) => handleFilterChange('audience', e.target.value)}
                  className="px-4 py-3 rounded-xl border bg-transparent outline-none"
                  style={{
                    borderColor: theme.white3,
                    backgroundColor: theme.white1,
                    color: theme.quaternary,
                  }}
                >
                  <option value="semua">Semua Audiens</option>
                  <option value="all">Semua (Siswa+Guru)</option>
                  <option value="students">Siswa</option>
                  <option value="teachers">Guru</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-4 py-3 rounded-xl border bg-transparent outline-none"
                  style={{
                    borderColor: theme.white3,
                    backgroundColor: theme.white1,
                    color: theme.quaternary,
                  }}
                >
                  <option value="semua">Semua Status</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* Create Form */}
          {newForm.show && (
            <SectionCard palette={theme} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold" style={{ color: theme.quaternary }}>
                  Buat Pengumuman Baru
                </h3>
                <button
                  onClick={() => handleNewFormChange('show', false)}
                  className="p-2 rounded-full transition-colors"
                  style={{ color: theme.secondary, backgroundColor: theme.white3 }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.secondary }}>
                    Judul Pengumuman
                  </label>
                  <input
                    value={newForm.title}
                    onChange={(e) => handleNewFormChange('title', e.target.value)}
                    className="w-full rounded-xl px-4 py-3 border bg-transparent outline-none"
                    style={{ borderColor: theme.white3, color: theme.quaternary }}
                    placeholder="Masukkan judul pengumuman..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.secondary }}>
                    Isi Pengumuman
                  </label>
                  <textarea
                    value={newForm.content}
                    onChange={(e) => handleNewFormChange('content', e.target.value)}
                    rows={6}
                    className="w-full rounded-xl px-4 py-3 border bg-transparent outline-none resize-none"
                    style={{ borderColor: theme.white3, color: theme.quaternary }}
                    placeholder="Tulis isi pengumuman di sini..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.secondary }}>
                      Audiens
                    </label>
                    <select
                      value={newForm.audience}
                      onChange={(e) => handleNewFormChange('audience', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border bg-transparent outline-none"
                      style={{ borderColor: theme.white3, color: theme.quaternary }}
                    >
                      <option value="all">Semua (Siswa & Guru)</option>
                      <option value="students">Siswa Saja</option>
                      <option value="teachers">Guru Saja</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.secondary }}>
                      Jadwal Publikasi
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="schedule"
                          checked={newForm.scheduleType === "now"}
                          onChange={() => handleNewFormChange('scheduleType', 'now')}
                          className="text-blue-600"
                        />
                        <span style={{ color: theme.quaternary }}>Sekarang</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="schedule"
                          checked={newForm.scheduleType === "later"}
                          onChange={() => handleNewFormChange('scheduleType', 'later')}
                          className="text-blue-600"
                        />
                        <span style={{ color: theme.quaternary }}>Jadwalkan</span>
                      </label>
                    </div>
                  </div>
                </div>

                {newForm.scheduleType === "later" && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.secondary }}>
                      Waktu Publikasi
                    </label>
                    <input
                      type="datetime-local"
                      value={newForm.scheduleAt}
                      onChange={(e) => handleNewFormChange('scheduleAt', e.target.value)}
                      className="px-4 py-3 rounded-xl border bg-transparent outline-none"
                      style={{ borderColor: theme.white3, color: theme.quaternary }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Btn
                    palette={theme}
                    variant="default"
                    className="flex items-center gap-2"
                    onClick={() => createMutation.mutate()}
                    disabled={!newForm.title || !newForm.content || (newForm.scheduleType === "later" && !newForm.scheduleAt)}
                  >
                    <Send size={16} /> 
                    {newForm.scheduleType === "now" ? "Publikasikan" : "Jadwalkan"}
                  </Btn>
                  
                  <Btn
                    palette={theme}
                    variant="outline"
                    onClick={() => handleNewFormChange('show', false)}
                  >
                    Batal
                  </Btn>

                  {createMutation.isError && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle size={16} />
                      <span className="text-sm">Gagal membuat pengumuman</span>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          )}

          {/* Announcements List */}
          <SectionCard palette={theme} className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left border-b" style={{ borderColor: theme.white3 }}>
                    <th className="pb-3 font-medium" style={{ color: theme.secondary }}>Judul</th>
                    <th className="pb-3 font-medium" style={{ color: theme.secondary }}>Audiens</th>
                    <th className="pb-3 font-medium" style={{ color: theme.secondary }}>Status</th>
                    <th className="pb-3 font-medium" style={{ color: theme.secondary }}>Dijadwalkan</th>
                    <th className="pb-3 font-medium" style={{ color: theme.secondary }}>Dibuat</th>
                    <th className="pb-3 font-medium text-right" style={{ color: theme.secondary }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {listQuery.isLoading && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center" style={{ color: theme.secondary }}>
                        Memuat data pengumuman...
                      </td>
                    </tr>
                  )}

                  {listQuery.isError && (
                    <tr>
                      <td colSpan={6} className="py-12">
                        <div className="text-center space-y-2">
                          <div className="flex items-center justify-center gap-2 text-red-600">
                            <AlertTriangle size={20} />
                            <span>Terjadi kesalahan saat memuat data</span>
                          </div>
                          <button
                            onClick={() => listQuery.refetch()}
                            className="text-sm underline"
                            style={{ color: theme.primary }}
                          >
                            Coba lagi
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!listQuery.isLoading && items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center" style={{ color: theme.secondary }}>
                        Belum ada pengumuman. Buat pengumuman pertama Anda!
                      </td>
                    </tr>
                  )}

                  {items.map((announcement) => (
                    <tr key={announcement.id} className="border-b" style={{ borderColor: theme.white3 }}>
                      <td className="py-4">
                        <div>
                          <div className="font-medium mb-1" style={{ color: theme.quaternary }}>
                            {announcement.title}
                          </div>
                          {announcement.content && (
                            <div className="text-sm line-clamp-2" style={{ color: theme.secondary }}>
                              {announcement.content.substring(0, 100)}
                              {announcement.content.length > 100 && '...'}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4" style={{ color: theme.quaternary }}>
                        {getAudienceLabel(announcement.audience)}
                      </td>
                      
                      <td className="py-4">
                        {announcement.status === "published" && (
                          <Badge variant="success" palette={theme}>Published</Badge>
                        )}
                        {announcement.status === "scheduled" && (
                          <Badge variant="info" palette={theme}>Scheduled</Badge>
                        )}
                        {announcement.status === "draft" && (
                          <Badge variant="outline" palette={theme}>Draft</Badge>
                        )}
                        {announcement.status === "archived" && (
                          <Badge variant="secondary" palette={theme}>Archived</Badge>
                        )}
                      </td>
                      
                      <td className="py-4 text-sm" style={{ color: theme.quaternary }}>
                        {formatDate(announcement.scheduled_at)}
                      </td>
                      
                      <td className="py-4 text-sm" style={{ color: theme.quaternary }}>
                        {formatDate(announcement.created_at)}
                      </td>
                      
                      <td className="py-4 text-right">
                        <button
                          onClick={() => openActionModal(announcement)}
                          className="p-2 rounded-full transition-colors hover:bg-opacity-50"
                          style={{ backgroundColor: theme.white3, color: theme.secondary }}
                        >
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: theme.white3 }}>
              <div className="text-sm" style={{ color: theme.secondary }}>
                {listQuery.isFetching ? "Memperbarui..." : `Menampilkan ${items.length} pengumuman`}
              </div>
              <button
                onClick={() => listQuery.refetch()}
                className="text-sm underline"
                style={{ color: theme.primary }}
              >
                Refresh
              </button>
            </div>
          </SectionCard>
        </main>
      </div>

      {/* Action Modal */}
      <ActionModal
        isOpen={actionModal.show}
        onClose={closeActionModal}
        announcement={actionModal.announcement}
        onPublish={publishMutation.mutate}
        onUnpublish={unpublishMutation.mutate}
        onDelete={deleteMutation.mutate}
        theme={theme}
      />
    </>
  );
}