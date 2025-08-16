// src/pages/sekolahislamku/teacher/TeacherAnnouncements.tsx
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";

import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";
import TeacherSidebarNav from "@/pages/sekolahislamku/components/home/TeacherSideBarNav";

import {
  Megaphone,
  Filter,
  Search,
  Plus,
  CalendarDays,
  Users,
  Pin,
  PinOff,
  Edit3,
  Trash2,
  Share2,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react";
import TeacherTopBar from "../../components/home/TeacherTopBar";
import AnnouncementsListCard from "../../components/card/AnnouncementsListCard";

/* ================= Types ================ */
/* ================= Types ================ */
type AStatus = "published" | "draft" | "scheduled";
type AType = "info" | "warning" | "success";

type Announcement = {
  id: string;
  title: string;
  date: string; // ISO
  body: string;
  type: AType;
};

type AnnouncementItem = {
  id: string;
  title: string;
  date: string; // ISO publish/schedule date
  body: string;
  type: AType;
  status: AStatus;
  audience: string; // "Semua", "TPA A", ...
  author: string;
  pinned?: boolean;
};

type AnnPayload = {
  gregorianDate: string;
  hijriDate: string;
  classes: string[];
  summary: {
    total: number;
    published: number;
    draft: number;
    scheduled: number;
  };
  items: AnnouncementItem[];
  /** ditambah agar dipakai AnnouncementsListCard */
  announcements: Announcement[];
};

/* ============ Fake API (replace with axios) ============ */
async function fetchTeacherAnnouncements(): Promise<AnnPayload> {
  const now = new Date();
  const iso = now.toISOString();
  const tomorrow = new Date(now.getTime() + 864e5).toISOString();

  const items: AnnouncementItem[] = [
    {
      id: "n1",
      title: "Tryout Ujian Tahfiz Kamis",
      date: iso,
      body: "Tryout internal Kamis, mohon hadir 10 menit lebih awal.",
      type: "info",
      status: "published",
      audience: "Semua",
      author: "Admin",
      pinned: true,
    },
    {
      id: "n2",
      title: "Rapat Kurikulum",
      date: iso,
      body: "Rapat pekan depan. Draft silabus ada di folder bersama.",
      type: "success",
      status: "published",
      audience: "TPA A",
      author: "Ustadz Abdullah",
    },
    {
      id: "n3",
      title: "Pengumpulan Seragam Gelombang 2",
      date: tomorrow,
      body: "Jadwal pengumpulan seragam gelombang 2 hari Jumat.",
      type: "warning",
      status: "scheduled",
      audience: "TPA B",
      author: "TU",
    },
    {
      id: "n4",
      title: "Catatan Kebersihan Kelas",
      date: iso,
      body: "Mohon evaluasi kebersihan kelas setiap akhir sesi.",
      type: "info",
      status: "draft",
      audience: "TPA A",
      author: "Ustadzah Amina",
    },
  ];

  // ✅ definisikan dan pakai di return
  const announcements: Announcement[] = [
    {
      id: "a1",
      title: "Tryout Ujian Tahfiz",
      date: iso,
      body: "Tryout internal hari Kamis. Mohon siapkan rubrik penilaian makhraj & tajwid.",
      type: "info",
    },
    {
      id: "a2",
      title: "Rapat Kurikulum",
      date: iso,
      body: "Rapat kurikulum pekan depan. Draft silabus sudah di folder bersama.",
      type: "success",
    },
  ];

  return {
    gregorianDate: iso,
    hijriDate: "16 Muharram 1447 H",
    classes: ["TPA A", "TPA B"],
    summary: {
      total: items.length,
      published: items.filter((i) => i.status === "published").length,
      draft: items.filter((i) => i.status === "draft").length,
      scheduled: items.filter((i) => i.status === "scheduled").length,
    },
    items,
    announcements, // ⬅️ ditambahkan
  };
}

/* ================= Helpers ================ */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";
const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    : "-";

/* ================= Page ================= */
export default function TeacherAnnouncements() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  const { data, isLoading } = useQuery({
    queryKey: ["teacher-announcements"],
    queryFn: fetchTeacherAnnouncements,
    staleTime: 60_000,
  });

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | AStatus>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);

  const itemsFiltered = useMemo(() => {
    let items = data?.items ?? [];
    if (classFilter !== "all")
      items = items.filter(
        (i) => i.audience === classFilter || i.audience === "Semua"
      );
    if (status !== "all") items = items.filter((i) => i.status === status);
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(qq) ||
          i.body.toLowerCase().includes(qq)
      );
    }
    // pinned first
    items = [...items].sort((a, b) => Number(b.pinned) - Number(a.pinned));
    return items;
  }, [data?.items, classFilter, status, q]);

  const selected =
    itemsFiltered.find((i) => i.id === selectedId) || itemsFiltered[0] || null;

  /* ====== Composer state (simple) ====== */
  const [newTitle, setNewTitle] = useState("");
  const [newAudience, setNewAudience] = useState<string>("Semua");
  const [newType, setNewType] = useState<AType>("info");
  const [newBody, setNewBody] = useState("");

  const resetComposer = () => {
    setNewTitle("");
    setNewAudience("Semua");
    setNewType("info");
    setNewBody("");
  };

  // --- tambahkan helper ini di sekitar blok hooks (setelah itemsFiltered) ---
  const announcementsFiltered = useMemo(() => {
    return (itemsFiltered ?? []).map((i) => ({
      id: i.id,
      title: i.title,
      date: i.date,
      body: i.body,
      type: i.type,
    }));
  }, [itemsFiltered]);

  // ...import & kode kamu...

  type DraftAnnouncement = {
    id?: string;
    title: string;
    date: string; // ISO
    body: string;
    type: AType;
    audience: string;
    status: Exclude<AStatus, "scheduled">; // kita pakai published|draft saja
    pinned: boolean;
  };

  function isoToInput(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  function inputToIso(v: string) {
    if (!v) return new Date().toISOString();
    // asumsikan zona lokal, pakai tengah hari agar aman
    const d = new Date(`${v}T12:00:00`);
    return d.toISOString();
  }

  // ===== Modal state =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [draft, setDraft] = useState<DraftAnnouncement>({
    title: "",
    date: new Date().toISOString(),
    body: "",
    type: "info",
    audience: "Semua",
    status: "draft",
    pinned: false,
  });

  function openCreate() {
    setModalMode("create");
    setDraft({
      title: "",
      date: new Date().toISOString(),
      body: "",
      type: "info",
      audience: "Semua",
      status: "draft",
      pinned: false,
    });
    setIsModalOpen(true);
  }

  function openEdit(a: {
    id: string;
    title: string;
    date: string;
    body: string;
    type?: AType;
  }) {
    const full = (data?.items ?? []).find((i) => i.id === a.id);
    setModalMode("edit");
    setDraft({
      id: a.id,
      title: a.title,
      date: a.date,
      body: a.body,
      type: a.type ?? "info", // fallback saat undefined
      audience: full?.audience ?? "Semua",
      status: (full?.status as "published" | "draft") ?? "draft",
      pinned: Boolean(full?.pinned),
    });
    setIsModalOpen(true);
  }

  function handleSave() {
    // Dummy save — kamu bisa ganti dengan call API
    const payload = { ...draft };
    alert(
      `${modalMode === "create" ? "Create" : "Edit"} (dummy):\n` +
        JSON.stringify(payload, null, 2)
    );
    setIsModalOpen(false);
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <TeacherTopBar
        palette={palette}
        title="Pengumuman"
        gregorianDate={data?.gregorianDate}
        hijriDate={data?.hijriDate}
        dateFmt={(iso) => dateLong(iso)}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          {/* Sidebar */}
          <TeacherSidebarNav palette={palette} />

          {/* Main */}
          <div className="flex-1 space-y-6">
            {/* ===== Filter & Actions + Summary ===== */}
            {/* ===== Filter & Aksi (desktop-optimized) ===== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              <SectionCard palette={palette} className="lg:col-span-12">
                <div className="p-4 md:p-5">
                  {/* Top bar: title left, actions right (desktop) */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Filter size={16} />
                      <span>Filter & Aksi</span>
                    </div>

                    {/* Actions stick to the right on desktop */}
                    <div className="flex gap-2 self-start lg:self-auto">
                      <Btn palette={palette} onClick={openCreate}>
                        <Plus className="mr-2" size={16} />
                        Buat Pengumuman
                      </Btn>

                      <Btn
                        palette={palette}
                        variant="secondary"
                        onClick={() => alert("Export pengumuman")}
                      >
                        <Share2 className="mr-2" size={16} />
                        Export
                      </Btn>
                    </div>
                  </div>

                  {/* Controls grid:
          desktop: search 5/12, audience 3/12, status 4/12 (kanan) */}
                  <div className="mt-4 grid gap-3 lg:grid-cols-12">
                    {/* Search (lg: span 5) */}
                    <label
                      className="flex items-center gap-2 rounded-xl border px-3 h-11 lg:col-span-5"
                      style={{
                        borderColor: palette.silver1,
                        background: palette.white1,
                        color: palette.black1,
                      }}
                    >
                      <Search size={16} />
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Cari pengumuman…"
                        className="bg-transparent outline-none text-sm flex-1 placeholder:opacity-70"
                        style={{ color: palette.black1 }}
                      />
                    </label>

                    {/* Audience (lg: span 3) */}
                    <div className="flex items-center justify-between lg:justify-start gap-3 lg:col-span-3">
                      <div
                        className="shrink-0 text-xs md:text-sm"
                        style={{ color: palette.silver2 }}
                      >
                        Audience
                      </div>
                      <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="h-11 rounded-xl border px-3 text-sm w-full lg:w-[220px]"
                        style={{
                          background: palette.white1,
                          color: palette.black1,
                          borderColor: palette.silver1,
                        }}
                      >
                        <option value="all">Semua</option>
                        {(data?.classes ?? []).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status segmented (lg: span 4, right aligned) */}
                    <div className="lg:col-span-4 flex lg:justify-end">
                      <div
                        className="inline-flex rounded-xl overflow-hidden border whitespace-nowrap"
                        style={{
                          borderColor: palette.silver1,
                          background: palette.white1,
                        }}
                        role="tablist"
                        aria-label="Status"
                      >
                        {(["all", "published", "draft"] as const).map((s) => {
                          const active = status === s;
                          return (
                            <button
                              key={s}
                              onClick={() => setStatus(s)}
                              role="tab"
                              aria-selected={active}
                              className="px-4 h-11 text-sm transition-colors border-r last:border-r-0"
                              style={{
                                background: active
                                  ? palette.primary2
                                  : "transparent",
                                color: active
                                  ? palette.primary
                                  : palette.black1,
                                borderColor: palette.silver1,
                              }}
                            >
                              {s === "all"
                                ? "Semua"
                                : s === "published"
                                  ? "Terbit"
                                  : "Draft"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Composer (UI only) */}
                  {showComposer && (
                    <div
                      className="mt-4 rounded-xl border p-3 md:p-4"
                      style={{
                        borderColor: palette.silver1,
                        background: palette.white1,
                      }}
                    >
                      <div className="grid gap-3">
                        <input
                          className="h-11 rounded-lg border px-3 text-sm"
                          placeholder="Judul pengumuman"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          style={{
                            background: "transparent",
                            color: palette.black1,
                            borderColor: palette.silver1,
                          }}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <select
                            className="h-11 rounded-lg border px-3 text-sm"
                            value={newAudience}
                            onChange={(e) => setNewAudience(e.target.value)}
                            style={{
                              background: "transparent",
                              color: palette.black1,
                              borderColor: palette.silver1,
                            }}
                          >
                            <option>Semua</option>
                            {(data?.classes ?? []).map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                          <select
                            className="h-11 rounded-lg border px-3 text-sm"
                            value={newType}
                            onChange={(e) =>
                              setNewType(e.target.value as AType)
                            }
                            style={{
                              background: "transparent",
                              color: palette.black1,
                              borderColor: palette.silver1,
                            }}
                          >
                            <option value="info">Info</option>
                            <option value="success">Sukses</option>
                            <option value="warning">Peringatan</option>
                          </select>
                        </div>
                        <textarea
                          rows={4}
                          className="rounded-lg border p-3 text-sm"
                          placeholder="Tulis isi pengumuman…"
                          value={newBody}
                          onChange={(e) => setNewBody(e.target.value)}
                          style={{
                            background: "transparent",
                            color: palette.black1,
                            borderColor: palette.silver1,
                          }}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Btn
                            palette={palette}
                            onClick={() => {
                              alert("Publish pengumuman");
                              resetComposer();
                              setShowComposer(false);
                            }}
                          >
                            Publikasikan
                          </Btn>
                          <Btn
                            palette={palette}
                            variant="secondary"
                            onClick={() => {
                              alert("Simpan sebagai draft");
                              resetComposer();
                              setShowComposer(false);
                            }}
                          >
                            Simpan Draft
                          </Btn>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            </section>

            {/* ================= Row 3 ================= */}
            <section>
              <AnnouncementsListCard
                palette={palette}
                items={announcementsFiltered}
                dateFmt={dateShort}
                seeAllPath="/guru/pengumuman"
                getDetailHref={(a) => `/guru/pengumuman/detail/${a.id}`}
                onEdit={openEdit}
                onDelete={(a) => {
                  // ✅ handler hapus milikmu: panggil API lalu refresh query
                  if (confirm(`Yakin hapus "${a.title}"?`)) {
                    // TODO: await api.delete(a.id);
                    alert(`(mock) terhapus: ${a.title}`);
                    // contoh refresh: queryClient.invalidateQueries({queryKey:["teacher-announcements"]})
                  }
                }}
              />
            </section>
            {isLoading && (
              <div className="text-sm" style={{ color: palette.silver2 }}>
                Memuat data…
              </div>
            )}
          </div>
        </div>
      </main>
      {/* ===== Modal Create/Edit Announcement ===== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.35)" }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-2xl rounded-2xl border shadow-xl"
            style={{
              background: palette.white1,
              borderColor: palette.silver1,
              color: palette.black1,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: palette.silver1 }}
            >
              <h3 className="text-base font-semibold">
                {modalMode === "create" ? "Buat Pengumuman" : "Edit Pengumuman"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-sm rounded-lg px-3 h-9"
                style={{
                  background: palette.white2,
                  color: palette.black1,
                  border: `1px solid ${palette.silver1}`,
                }}
              >
                Tutup
              </button>
            </div>

            {/* Body / Form */}
            <div className="px-5 py-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm" style={{ color: palette.silver2 }}>
                    Judul
                  </label>
                  <input
                    className="h-10 rounded-lg border px-3 text-sm w-full"
                    value={draft.title}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, title: e.target.value }))
                    }
                    placeholder="Judul pengumuman"
                    style={{
                      background: "transparent",
                      color: palette.black1,
                      borderColor: palette.silver1,
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm" style={{ color: palette.silver2 }}>
                    Tanggal
                  </label>
                  <input
                    type="date"
                    className="h-10 rounded-lg border px-3 text-sm w-full"
                    value={isoToInput(draft.date)}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        date: inputToIso(e.target.value),
                      }))
                    }
                    style={{
                      background: "transparent",
                      color: palette.black1,
                      borderColor: palette.silver1,
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-sm" style={{ color: palette.silver2 }}>
                    Audience
                  </label>
                  <select
                    className="h-10 rounded-lg border px-3 text-sm w-full"
                    value={draft.audience}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, audience: e.target.value }))
                    }
                    style={{
                      background: "transparent",
                      color: palette.black1,
                      borderColor: palette.silver1,
                    }}
                  >
                    <option>Semua</option>
                    {(data?.classes ?? []).map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm" style={{ color: palette.silver2 }}>
                    Tipe
                  </label>
                  <select
                    className="h-10 rounded-lg border px-3 text-sm w-full"
                    value={draft.type}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, type: e.target.value as AType }))
                    }
                    style={{
                      background: "transparent",
                      color: palette.black1,
                      borderColor: palette.silver1,
                    }}
                  >
                    <option value="info">Info</option>
                    <option value="success">Sukses</option>
                    <option value="warning">Peringatan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm" style={{ color: palette.silver2 }}>
                    Status
                  </label>
                  <select
                    className="h-10 rounded-lg border px-3 text-sm w-full"
                    value={draft.status}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        status: e.target.value as DraftAnnouncement["status"],
                      }))
                    }
                    style={{
                      background: "transparent",
                      color: palette.black1,
                      borderColor: palette.silver1,
                    }}
                  >
                    <option value="published">Terbit</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="pinned"
                  type="checkbox"
                  checked={draft.pinned}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, pinned: e.target.checked }))
                  }
                />
                <label htmlFor="pinned" className="text-sm">
                  Pinned
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-sm" style={{ color: palette.silver2 }}>
                  Isi Pengumuman
                </label>
                <textarea
                  rows={5}
                  className="rounded-lg border p-3 text-sm w-full"
                  placeholder="Tulis isi pengumuman…"
                  value={draft.body}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, body: e.target.value }))
                  }
                  style={{
                    background: "transparent",
                    color: palette.black1,
                    borderColor: palette.silver1,
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-5 py-4 border-t flex justify-end gap-2"
              style={{ borderColor: palette.silver1 }}
            >
              <Btn
                palette={palette}
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Btn>
              <Btn
                palette={palette}
                onClick={handleSave}
                style={{
                  background: palette.primary,
                  color: palette.white1,
                  borderColor: palette.primary,
                }}
              >
                {modalMode === "create"
                  ? "Simpan & Publikasikan"
                  : "Simpan Perubahan"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
