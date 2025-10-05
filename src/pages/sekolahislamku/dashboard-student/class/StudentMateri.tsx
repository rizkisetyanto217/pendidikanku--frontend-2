// src/pages/sekolahislamku/pages/student/StudentMateri.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { pickTheme } from "@/constants/thema";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import {
  ArrowLeft,
  CalendarDays,
  BookOpen,
  Download,
  Search,
} from "lucide-react";

/* ===== Utils ===== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

type MaterialType = "pdf" | "doc" | "ppt" | "video" | "link";
type Material = {
  id: string;
  title: string;
  desc?: string;
  type: MaterialType;
  createdAt: string;
  author?: string;
  attachments?: { name: string; url?: string }[];
};

/* ===== Meta kelas (opsional, untuk judul) ===== */
const CLASS_META: Record<
  string,
  { name: string; room?: string; homeroom?: string }
> = {
  "tpa-a": { name: "TPA A", room: "Aula 1", homeroom: "Ustadz Abdullah" },
  "tpa-b": { name: "TPA B", room: "R. Tahfiz", homeroom: "Ustadz Salman" },
};

/* ===== Dummy materi per kelas (key by id dari MyClass) ===== */
const MATERIALS_BY_CLASS: Record<string, Material[]> = {
  "tpa-a": [
    {
      id: "m-001",
      title: "Mad Thabi'i — Ringkasan & Contoh",
      desc: "Definisi, cara membaca, dan contoh bacaan mad thabi'i.",
      type: "pdf",
      createdAt: new Date(Date.now() - 864e5).toISOString(),
      author: "Ustadz Abdullah",
      attachments: [{ name: "mad-thabii.pdf" }],
    },
    {
      id: "m-002",
      title: "Video: Makharijul Huruf (Ringkas)",
      desc: "Ringkasan tempat keluarnya huruf hijaiyah.",
      type: "video",
      createdAt: new Date().toISOString(),
      author: "Ustadzah Amina",
      attachments: [{ name: "YouTube", url: "https://youtu.be/dQw4w9WgXcQ" }],
    },
  ],
  "tpa-b": [
    {
      id: "m-101",
      title: "Target Hafalan Juz 30 (Pekan Ini)",
      desc: "Daftar ayat & target hafalan mingguan.",
      type: "ppt",
      createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
      author: "Ustadz Salman",
      attachments: [{ name: "target-hafalan.pptx" }],
    },
  ],
};

const StudentMateri: React.FC = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName, isDark);

  const classMeta = CLASS_META[id ?? ""] ?? { name: id ?? "-" };
  const allMaterials = MATERIALS_BY_CLASS[id ?? ""] ?? [];

  /* Search/filter */
  const [q, setQ] = useState("");
  const materials = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return allMaterials;
    return allMaterials.filter(
      (m) =>
        m.title.toLowerCase().includes(key) ||
        (m.desc ?? "").toLowerCase().includes(key) ||
        (m.author ?? "").toLowerCase().includes(key)
    );
  }, [q, allMaterials]);

  const goBackToList = () =>
    navigate(`/${slug}/murid/menu-utama/my-class`, { replace: false });

  const handleDownload = (m: Material) => {
    const att = m.attachments?.[0];
    if (!att) {
      alert("Belum ada lampiran untuk materi ini.");
      return;
    }
    if (att.url) {
      window.open(att.url, "_blank", "noopener,noreferrer");
      return;
    }
    // Fallback: buat file dummy agar UX unduh tetap ada
    const blob = new Blob(
      [
        `Materi: ${m.title}\n\nIni adalah placeholder untuk lampiran "${att.name}".`,
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

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={`Materi — ${classMeta.name}`}
        gregorianDate={new Date().toISOString()}
        dateFmt={dateLong}
        showBack
      />

      <main className="w-full px-4 md:px-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Content */}
          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Back inline */}
            <div className="md:flex hidden gap-3 items-center">
              <Btn palette={palette} variant="ghost" onClick={goBackToList}>
                <ArrowLeft size={20} />
              </Btn>
              <h1 className="textlg font-semibold">Materi Kelas</h1>
            </div>

            {/* Header + Search */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} style={{ color: palette.primary }} />
                  <div>
                    <div className="font-semibold">Daftar Materi</div>
                    <div className="text-sm" style={{ color: palette.black2 }}>
                      {classMeta.room ? `${classMeta.room} • ` : ""}
                      {classMeta.homeroom ? `Wali: ${classMeta.homeroom}` : ""}
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 rounded-xl border px-3 h-10 w-full md:w-80"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <Search size={16} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari judul/penjelasan/penulis…"
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: palette.black1 }}
                  />
                </div>
              </div>
            </SectionCard>

            {/* List materi */}
            <div className="grid gap-3">
              {materials.map((m) => (
                <SectionCard key={m.id} palette={palette} className="p-0">
                  <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div
                            className="text-base font-semibold"
                            style={{ color: palette.black2 }}
                          >
                            {m.title}
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

                        {m.desc && (
                          <p
                            className="text-sm mt-1"
                            style={{ color: palette.black2 }}
                          >
                            {m.desc}
                          </p>
                        )}

                        <div
                          className="mt-2 flex flex-wrap items-center gap-2 text-sm"
                          style={{ color: palette.black2 }}
                        >
                          <CalendarDays size={14} />
                          <span>Dibuat: {dateLong(m.createdAt)}</span>
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

                  <div
                    className="px-4 md:px-5 pb-4 md:pb-5 pt-3 border-t flex items-center justify-between"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <div className="text-sm" style={{ color: palette.black2 }}>
                      Aksi
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
                    </div>
                  </div>
                </SectionCard>
              ))}

              {materials.length === 0 && (
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

            {/* Tombol kembali (mobile) */}
            <div className="md:hidden">
              <Btn palette={palette} variant="outline" onClick={goBackToList}>
                <ArrowLeft size={16} className="mr-1" /> Kembali ke Kelas
              </Btn>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentMateri;
