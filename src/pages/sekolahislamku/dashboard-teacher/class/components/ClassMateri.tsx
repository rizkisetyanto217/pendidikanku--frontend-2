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
  BookOpen,
  FileText,
  CalendarDays,
  Download,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  ChevronRight,
} from "lucide-react";
import ModalAddClassMateri from "./ModalAddClassMateri";
import ModalEditClassMateri, { EditClassMaterialInput } from "./ModalEditClassMateri";

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

/* ====== Query Keys ====== */
const QK = {
  CLASSES: ["teacher-classes-list"] as const,
  MATERIALS: (classId: string) => ["teacher-class-materials", classId] as const,
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

  /* ====== Actions ====== */
  const handleDownload = (m: ClassMaterial) => {
    const att = m.attachments?.[0];
    if (!att) {
      alert("Materi ini belum memiliki lampiran untuk diunduh.");
      return;
    }
    if (att.url) {
      // buka di tab baru (biar aman CORS dan file besar)
      window.open(att.url, "_blank", "noopener,noreferrer");
      return;
    }
    // fallback: buat file dummy agar tetap ada UX unduh
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
  const [openModal, setOpenModal] = useState(false);
  // ... di atas sudah ada: const qc = useQueryClient();

  const handleAddMateri = async (payload: any) => {
    try {
      // Normalisasi payload minimal
      const nowISO = new Date().toISOString();
      const newItem: ClassMaterial = {
        id: `m-${Date.now()}`, // id dummy unik
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

      // 1) Optimistic update: sisipkan ke list materi kelas aktif
      qc.setQueryData<ClassMaterial[]>(QK.MATERIALS(id), (old = []) => [
        newItem,
        ...old,
      ]);

      // 2) (Opsional) Update count materi di list kelas
      qc.setQueryData<TeacherClassSummary[]>(QK.CLASSES, (old = []) =>
        old.map((c) =>
          c.id === id
            ? { ...c, materialsCount: (c.materialsCount ?? 0) + 1 }
            : c
        )
      );

      // 3) Tutup modal + toast sukses bertema
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

      // Catatan:
      // Tidak perlu invalidateQuery karena kita belum pakai API.
      // Kalau nanti sudah ada API, tinggal panggil mutate + invalidate.
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

  // state dekete
  const handleDelete = async (m: ClassMaterial) => {
    const res = await Swal.fire({
      title: "Hapus materi?",
      text: `"${m.title}" akan dihapus. Tindakan ini tidak bisa dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      // ⬇️ tema dari palette
      background: palette.white1,
      color: palette.black1,
      confirmButtonColor: (palette as any).destructive ?? "#ef4444", // fallback merah
      cancelButtonColor: palette.primary,
    });

    if (!res.isConfirmed) return;

    try {
      // TODO: panggil API hapus, misal:
      // await api.delete(`/classes/${id}/materials/${m.id}`);

      // Optimistic update cache list materi
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
    } catch (e) {
      await Swal.fire({
        title: "Gagal menghapus",
        text: "Terjadi kesalahan saat menghapus materi.",
        icon: "error",
        background: palette.white1,
        color: palette.black1,
        confirmButtonColor: (palette as any).destructive ?? "#ef4444",
      });
    }
  };
  // state editclass materi
  const [openEdit, setOpenEdit] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassMaterial | null>(null);
const handleEditMateri = async (payload: EditClassMaterialInput) => {
  try {
    const nowISO = new Date().toISOString();

    // 1) Optimistic replace item berdasarkan id
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
      />

      <ModalAddClassMateri
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
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />

          <div className="flex-1 min-w-0 space-y-6">
            {/* back */}
            <Btn
              palette={palette}
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} className="mr-1" />
              Kembali
            </Btn>

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
                      <h1 style={{ color: palette.black2 }}>
                        {" "}
                        {cls?.room ?? "-"}
                      </h1>
                    </Badge>
                    <span>Wali Kelas: {cls?.homeroom ?? "-"}</span>
                    <span>• {cls?.academicTerm ?? "-"}</span>
                    <span>• Angkatan {cls?.cohortYear ?? "-"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Btn
                    palette={palette}
                    variant="secondary"
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
                            <h1 style={{ color: palette.black2 }}>{m.title}</h1>
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
                          className="mt-2 flex flex-wrap items-center gap-2 text-xs"
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

                  {/* Footer actions (⬅️ bagian baru, di bawah kartu) */}
                  <div
                    className="px-4 md:px-5 pb-4 md:pb-5 pt-3 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <div className="text-xs" style={{ color: palette.black2 }}>
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
                        Unduh
                      </Btn>

                      <Btn
                        palette={palette}
                        size="sm"
                        onClick={() => {
                          setEditingItem(m);
                          setOpenEdit(true);
                        }}
                      >
                        Edit
                      </Btn>

                      <Btn
                        palette={palette}
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(m)}
                      >
                        Hapus
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
          </div>
        </div>
      </main>
    </div>
  );
}
