// src/pages/sekolahislamku/announcements/ParentAnnouncementsPage.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bell, ArrowLeft, Download, Plus } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

/* ========= Types ========= */
type AnnType = "info" | "warning" | "success";
type Announcement = {
  id: string;
  title: string;
  date: string; // ISO
  body: string;
  type: AnnType;
  attachmentName?: string;
};

/* ======== Helpers ======== */
const dateLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/* ======== Fake API ======== */
async function fetchAnnouncements({
  q,
  type,
}: {
  q: string;
  type: AnnType | "all";
}): Promise<Announcement[]> {
  const base: Announcement[] = [
    {
      id: "a1",
      title: "Ujian Tahfiz Pekan Depan",
      date: new Date().toISOString(),
      body: "Mohon dampingi anak dalam muraja'ah surat Al-Balad s.d. Asy-Syams.",
      type: "info",
      attachmentName: "Panduan-Ujian.pdf",
    },
    {
      id: "a2",
      title: "Peringatan Keterlambatan Pembayaran",
      date: new Date(Date.now() - 864e5).toISOString(),
      body: "Tagihan SPP bulan ini jatuh tempo 17 Agustus. Mohon segera diselesaikan.",
      type: "warning",
    },
    {
      id: "a3",
      title: "Syukuran Khatam Iqra",
      date: new Date(Date.now() - 2 * 864e5).toISOString(),
      body: "Alhamdulillah beberapa santri telah khatam Iqra. Acara syukuran pada Jumat pagi.",
      type: "success",
      attachmentName: "Rundown-Acara.docx",
    },
  ];

  let list = base;
  if (type !== "all") list = list.filter((x) => x.type === type);
  if (q.trim()) {
    const qq = q.toLowerCase();
    list = list.filter(
      (x) =>
        x.title.toLowerCase().includes(qq) || x.body.toLowerCase().includes(qq)
    );
  }
  // sort terbaru
  list = list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return Promise.resolve(list);
}

/* ======== Page ======== */
export default function StudentAnnouncement() {
  const { isDark } = useHtmlDarkMode();
  const palette = (isDark ? colors.dark : colors.light) as Palette;

  const [q, setQ] = useState("");
  const [tab, setTab] = useState<AnnType | "all">("all");

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["parent-announcements", q, tab],
    queryFn: () => fetchAnnouncements({ q, type: tab }),
    staleTime: 30_000,
  });

  const tabs: { key: AnnType | "all"; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "info", label: "Info" },
    { key: "warning", label: "Peringatan" },
    { key: "success", label: "Sukacita" },
  ];

  const typeToVariant: Record<AnnType, "info" | "warning" | "success"> = {
    info: "info",
    warning: "warning",
    success: "success",
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top Bar */}
      <div
        className="sticky top-0 z-40 border-b"
        style={{
          background: `${palette.white1}E6`,
          borderColor: palette.silver1,
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link to="/student">
              <Btn size="sm" variant="outline" palette={palette}>
                <ArrowLeft size={16} /> Kembali
              </Btn>
            </Link>
            <div className="pl-1">
              <div className="text-sm" style={{ color: palette.silver2 }}>
                Pengumuman
              </div>
              <div className="font-semibold">
                {isFetching ? "Memuat…" : "Lihat semua"}
              </div>
            </div>
          </div>
          <Bell size={18} color={palette.quaternary} />
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Filter */}
        <SectionCard palette={palette} className="p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari pengumuman…"
                className="h-10 w-full rounded-2xl px-3 text-sm"
                style={{
                  background: palette.white1,
                  color: palette.black1,
                  border: `1px solid ${palette.silver1}`,
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <Btn
                  key={t.key}
                  size="sm"
                  variant={tab === t.key ? "secondary" : "outline"}
                  palette={palette}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </Btn>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* List */}
        <div className="grid gap-3">
          {isLoading && (
            <div className="text-sm" style={{ color: palette.silver2 }}>
              Memuat…
            </div>
          )}

          {(data ?? []).map((a) => (
            <SectionCard
              key={a.id}
              palette={palette}
              className="p-3 md:p-4"
              style={{ background: palette.white1 }}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs" style={{ color: palette.silver2 }}>
                    {dateLong(a.date)}
                  </div>
                  <p className="text-sm mt-1" style={{ color: palette.black2 }}>
                    {a.body}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={typeToVariant[a.type]} palette={palette}>
                      {a.type}
                    </Badge>
                    {a.attachmentName && (
                      <Badge variant="outline" palette={palette}>
                        {a.attachmentName}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions — mobile: di bawah; desktop: kanan */}
                <div className="flex flex-col sm:flex-row gap-2 md:ml-4 mt-2 md:mt-0">
                  {a.attachmentName && (
                    <Btn size="sm" variant="outline" palette={palette}>
                      <Download className="mr-2" size={16} />
                      Lampiran
                    </Btn>
                  )}
                  <Btn size="sm" variant="secondary" palette={palette}>
                    <Plus className="mr-2" size={16} />
                    Ingatkan
                  </Btn>
                </div>
              </div>
            </SectionCard>
          ))}

          {(data?.length ?? 0) === 0 && !isLoading && (
            <SectionCard palette={palette} className="p-6 text-center">
              <div className="text-sm" style={{ color: palette.silver2 }}>
                Tidak ada pengumuman yang cocok.
              </div>
            </SectionCard>
          )}
        </div>
      </main>
    </div>
  );
}
