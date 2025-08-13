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

/* ================= Types ================ */
type AStatus = "published" | "draft" | "scheduled";
type AType = "info" | "warning" | "success";

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

  return Promise.resolve({
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
  });
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
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              <SectionCard palette={palette} className="lg:col-span-8">
                <div className="p-4 md:p-5">
                  <div className="font-medium mb-3 flex items-center gap-2">
                    <Filter size={16} /> Filter & Aksi
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {/* Search */}
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
                        placeholder="Cari pengumuman…"
                        className="bg-transparent outline-none text-sm flex-1"
                        style={{ color: palette.black1 }}
                      />
                    </div>

                    {/* Kelas/Audience */}
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm"
                        style={{ color: palette.silver2 }}
                      >
                        Audience
                      </span>
                      <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="h-10 rounded-xl border px-3 text-sm"
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

                    {/* Status */}
                    <div className="flex items-center gap-1">
                      {(
                        ["all", "published", "draft", "scheduled"] as const
                      ).map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatus(s)}
                          className="px-3 h-10 rounded-xl border text-sm"
                          style={{
                            background:
                              status === s ? palette.primary2 : palette.white1,
                            color:
                              status === s ? palette.primary : palette.black1,
                            borderColor:
                              status === s ? palette.primary : palette.silver1,
                          }}
                        >
                          {s === "all"
                            ? "Semua"
                            : s === "published"
                              ? "Terbit"
                              : s === "draft"
                                ? "Draft"
                                : "Terjadwal"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Btn
                      palette={palette}
                      onClick={() => setShowComposer((v) => !v)}
                    >
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

                  {/* Composer (simple) */}
                  {showComposer && (
                    <div
                      className="mt-4 rounded-xl border p-3"
                      style={{
                        borderColor: palette.silver1,
                        background: palette.white1,
                      }}
                    >
                      <div className="grid gap-2">
                        <input
                          className="h-10 rounded-lg border px-3 text-sm"
                          placeholder="Judul pengumuman"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          style={{
                            background: "transparent",
                            color: palette.black1,
                            borderColor: palette.silver1,
                          }}
                        />
                        <div className="flex gap-2">
                          <select
                            className="h-10 rounded-lg border px-3 text-sm"
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
                            className="h-10 rounded-lg border px-3 text-sm"
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
                        <div className="flex gap-2">
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

              <SectionCard palette={palette} className="lg:col-span-4">
                <div className="p-4 md:p-5">
                  <div className="font-medium mb-3 flex items-center gap-2">
                    <Megaphone size={16} /> Ringkasan
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <StatPill
                      palette={palette}
                      label="Total"
                      value={data?.summary.total ?? 0}
                    />
                    <StatPill
                      palette={palette}
                      label="Terbit"
                      value={data?.summary.published ?? 0}
                    />
                    <StatPill
                      palette={palette}
                      label="Draft"
                      value={data?.summary.draft ?? 0}
                    />
                    <StatPill
                      palette={palette}
                      label="Terjadwal"
                      value={data?.summary.scheduled ?? 0}
                    />
                  </div>
                </div>
              </SectionCard>
            </section>

            {/* ===== List + Detail ===== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* List */}
              <SectionCard palette={palette} className="lg:col-span-6">
                <div className="p-4 md:p-5">
                  <div className="font-medium mb-2 flex items-center gap-2">
                    <Megaphone size={16} /> Daftar Pengumuman
                  </div>

                  <div className="space-y-3">
                    {itemsFiltered.map((a) => {
                      const isActive = (selected?.id ?? "") === a.id;
                      return (
                        <button
                          key={a.id}
                          onClick={() => setSelectedId(a.id)}
                          className="w-full text-left"
                        >
                          <div
                            className="p-3 rounded-xl border transition-all"
                            style={{
                              borderColor: isActive
                                ? palette.primary
                                : palette.silver1,
                              boxShadow: isActive
                                ? `0 0 0 1px ${palette.primary} inset`
                                : "none",
                              background: palette.white1,
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="font-medium truncate">
                                  {a.title}
                                </div>
                                <div
                                  className="text-xs mt-0.5"
                                  style={{ color: palette.silver2 }}
                                >
                                  <CalendarDays
                                    className="inline mr-1"
                                    size={14}
                                  />
                                  {a.status === "scheduled"
                                    ? "jadwal"
                                    : "terbit"}{" "}
                                  {dateShort(a.date)} • {a.audience}
                                </div>
                              </div>
                              <div className="shrink-0 flex gap-2">
                                {a.pinned ? (
                                  <Badge palette={palette} variant="success">
                                    Pinned
                                  </Badge>
                                ) : null}
                                <Badge
                                  palette={palette}
                                  variant={
                                    a.type === "warning"
                                      ? "warning"
                                      : a.type === "success"
                                        ? "success"
                                        : "info"
                                  }
                                >
                                  {a.type}
                                </Badge>
                              </div>
                            </div>

                            <div className="mt-2 flex gap-2">
                              <Badge palette={palette} variant="outline">
                                {a.status === "published" ? (
                                  <Eye size={14} className="mr-1" />
                                ) : a.status === "draft" ? (
                                  <EyeOff size={14} className="mr-1" />
                                ) : (
                                  <Clock size={14} className="mr-1" />
                                )}
                                {a.status === "published"
                                  ? "Terbit"
                                  : a.status === "draft"
                                    ? "Draft"
                                    : "Terjadwal"}
                              </Badge>
                              <Badge palette={palette} variant="outline">
                                <Users className="mr-1" size={14} />{" "}
                                {a.audience}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {itemsFiltered.length === 0 && (
                      <div
                        className="text-sm"
                        style={{ color: palette.silver2 }}
                      >
                        Tidak ada pengumuman sesuai filter.
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>

              {/* Detail */}
              <SectionCard palette={palette} className="lg:col-span-6">
                <div className="p-4 md:p-5">
                  {selected ? (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-base">
                            {selected.title}
                          </div>
                          <div
                            className="text-xs mt-0.5"
                            style={{ color: palette.silver2 }}
                          >
                            <CalendarDays className="inline mr-1" size={14} />
                            {selected.status === "scheduled"
                              ? "Terjadwal"
                              : "Terbit"}{" "}
                            {dateLong(selected.date)} • oleh {selected.author}
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-wrap gap-2 justify-end">
                          <Badge
                            palette={palette}
                            variant={
                              selected.type === "warning"
                                ? "warning"
                                : selected.type === "success"
                                  ? "success"
                                  : "info"
                            }
                          >
                            {selected.type}
                          </Badge>
                          <Badge palette={palette} variant="outline">
                            <Users size={14} className="mr-1" />
                            {selected.audience}
                          </Badge>
                        </div>
                      </div>

                      <div
                        className="mt-3 rounded-xl border p-3 text-sm leading-relaxed"
                        style={{
                          borderColor: palette.silver1,
                          background: palette.white1,
                        }}
                      >
                        {selected.body}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Btn
                          palette={palette}
                          onClick={() =>
                            alert(
                              selected.status === "published"
                                ? "Sembunyikan (ubah ke draft)"
                                : "Terbitkan sekarang"
                            )
                          }
                        >
                          {selected.status === "published" ? (
                            <EyeOff className="mr-2" size={16} />
                          ) : (
                            <Eye className="mr-2" size={16} />
                          )}
                          {selected.status === "published"
                            ? "Sembunyikan"
                            : "Terbitkan"}
                        </Btn>
                        <Btn
                          palette={palette}
                          variant="secondary"
                          onClick={() => alert("Edit pengumuman")}
                        >
                          <Edit3 className="mr-2" size={16} /> Edit
                        </Btn>
                        <Btn
                          palette={palette}
                          variant="outline"
                          onClick={() =>
                            alert(selected.pinned ? "Lepas pin" : "Pin ke atas")
                          }
                        >
                          {selected.pinned ? (
                            <PinOff className="mr-2" size={16} />
                          ) : (
                            <Pin className="mr-2" size={16} />
                          )}
                          {selected.pinned ? "Lepas Pin" : "Pin"}
                        </Btn>
                        <Btn
                          palette={palette}
                          variant="destructive"
                          onClick={() => alert("Hapus pengumuman")}
                        >
                          <Trash2 className="mr-2" size={16} /> Hapus
                        </Btn>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm" style={{ color: palette.silver2 }}>
                      Pilih salah satu pengumuman di daftar.
                    </div>
                  )}
                </div>
              </SectionCard>
            </section>

            {isLoading && (
              <div className="text-sm" style={{ color: palette.silver2 }}>
                Memuat data…
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* =============== Small UI helper =============== */
function StatPill({
  palette,
  label,
  value,
}: {
  palette: Palette;
  label: string;
  value: number | string;
}) {
  return (
    <div
      className="p-3 rounded-xl border"
      style={{ borderColor: palette.silver1, background: palette.white1 }}
    >
      <div className="text-xs" style={{ color: palette.silver2 }}>
        {label}
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
