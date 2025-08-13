// src/pages/sekolahislamku/student/announcements/AnnouncementDetailPage.tsx
import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import ParentTopBar from "../../components/home/StudentTopBar";
import ParentSidebarNav from "../../components/home/StudentSideBarNav";

import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import {
  Bell,
  ArrowLeft,
  Paperclip,
  ExternalLink,
  User,
  Users,
  Check,
} from "lucide-react";

/* ===== Types ===== */
type AnnType = "info" | "warning" | "success";
type AnnStatus = "draft" | "published" | "scheduled";
type Audience = "siswa" | "guru" | "semua";
interface Attachment {
  id?: string;
  name: string;
  url: string;
}
interface AnnouncementDetail {
  id: string;
  title: string;
  body: string;
  date: string; // ISO
  type?: AnnType;
  status?: AnnStatus;
  audience?: Audience;
  authorName?: string;
  attachments?: Attachment[];
}
interface AnnouncementLite {
  id: string;
  title: string;
  date: string;
  type?: AnnType;
}

/* ===== Helpers ===== */
const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/* ===== DUMMY DATA ===== */
const now = new Date();
const addDays = (d: number) => new Date(now.getTime() + d * 86400000);

const DUMMY_ANNOUNCEMENTS: AnnouncementDetail[] = [
  {
    id: "a1",
    title: "Ujian Tahfiz Pekan Depan",
    date: addDays(0).toISOString(),
    type: "info",
    status: "published",
    audience: "siswa",
    authorName: "Ust. Fulan",
    body: "Assalamu’alaikum.\n\nPekan depan akan diadakan ujian tahfiz Juz 30. Mohon orang tua mendampingi muraja’ah di rumah, fokus pada surat Al-Balad s.d. Asy-Syams.\n\nJazakumullahu khairan.",
    attachments: [
      {
        id: "f1",
        name: "Panduan Ujian.pdf",
        url: "#",
      },
    ],
  },
  {
    id: "a2",
    title: "Pengumpulan Infaq Jumat",
    date: addDays(2).toISOString(),
    type: "success",
    status: "published",
    audience: "semua",
    authorName: "Panitia",
    body: "Infaq Jumat kembali dibuka. Silakan titipkan melalui anak masing-masing. Semoga Allah membalas kebaikan antum semua.",
  },
  {
    id: "a3",
    title: "Perubahan Jadwal Ekstrakurikuler",
    date: addDays(4).toISOString(),
    type: "warning",
    status: "scheduled",
    audience: "siswa",
    authorName: "Bag. Kesiswaan",
    body: "Ekstrakurikuler pramuka dipindah ke hari Sabtu pukul 07.00. Mohon menyesuaikan.",
  },
  {
    id: "a4",
    title: "Rapat Orang Tua Wali",
    date: addDays(-3).toISOString(),
    type: "info",
    status: "published",
    audience: "siswa",
    authorName: "Kurikulum",
    body: "Rapat orang tua wali kelas insyaAllah dilaksanakan pekan ini. Detail akan menyusul pada grup kelas masing-masing.",
  },
];

/* Dummy fetcher */
async function fetchAnnouncementDummy(id?: string) {
  const detail =
    DUMMY_ANNOUNCEMENTS.find((a) => a.id === id) ?? DUMMY_ANNOUNCEMENTS[0];
  const related = DUMMY_ANNOUNCEMENTS.filter((a) => a.id !== detail.id).slice(
    0,
    5
  );
  return Promise.resolve({
    detail,
    related,
    hijriDate: "16 Muharram 1447 H",
    gregorianDate: new Date().toISOString(),
  });
}

/* ===== Page ===== */
export default function StudentDetailAnnouncement() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["student-ann-detail", id],
    queryFn: () => fetchAnnouncementDummy(id),
  });

  const ann = data?.detail;
  const related = useMemo(
    () => (data?.related ?? []).filter((r) => r.id !== ann?.id).slice(0, 5),
    [data, ann?.id]
  );

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Pengumuman"
        gregorianDate={data?.gregorianDate}
        hijriDate={data?.hijriDate}
        dateFmt={dateFmt}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebarNav palette={palette} />

          <div className="flex-1 space-y-4">
            {/* Back / loading / error */}
            <div className="flex items-center justify-between">
              <Btn
                variant="outline"
                size="sm"
                palette={palette}
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={16} /> Kembali
              </Btn>
              {isError && (
                <Btn
                  variant="destructive"
                  size="sm"
                  palette={palette}
                  onClick={() => refetch()}
                >
                  Coba lagi
                </Btn>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Kiri: konten */}
              <SectionCard
                palette={palette}
                className="lg:col-span-8 p-4 md:p-6"
              >
                {isLoading ? (
                  <div style={{ color: palette.silver2 }}>Memuat detail…</div>
                ) : !ann ? (
                  <div style={{ color: palette.silver2 }}>
                    Pengumuman tidak ditemukan.
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h1 className="text-xl font-semibold flex items-center gap-2">
                          <Bell size={20} color={palette.quaternary} />
                          <span className="truncate">{ann.title}</span>
                        </h1>
                        <div
                          className="mt-1 flex flex-wrap items-center gap-2 text-xs"
                          style={{ color: palette.silver2 }}
                        >
                          <span>{dateFmt(ann.date)}</span>
                          {ann.authorName && (
                            <span className="inline-flex items-center gap-1">
                              • <User size={12} /> {ann.authorName}
                            </span>
                          )}
                          {ann.audience && (
                            <span className="inline-flex items-center gap-1">
                              • <Users size={12} />{" "}
                              {ann.audience === "semua"
                                ? "Semua"
                                : ann.audience === "siswa"
                                  ? "Siswa"
                                  : "Guru"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {ann.type && (
                          <Badge
                            palette={palette}
                            variant={
                              ann.type === "warning"
                                ? "warning"
                                : ann.type === "success"
                                  ? "success"
                                  : "info"
                            }
                          >
                            {ann.type}
                          </Badge>
                        )}
                        {ann.status && (
                          <Badge
                            palette={palette}
                            variant={
                              ann.status === "published"
                                ? "success"
                                : ann.status === "scheduled"
                                  ? "info"
                                  : "outline"
                            }
                          >
                            {ann.status}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Lampiran */}
                    {ann.attachments && ann.attachments.length > 0 && (
                      <div className="mt-4">
                        <div
                          className="text-xs mb-2"
                          style={{ color: palette.silver2 }}
                        >
                          Lampiran
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ann.attachments.map((f) => (
                            <a
                              key={f.id ?? f.url}
                              href={f.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Btn
                                palette={palette}
                                variant="white1"
                                size="sm"
                                className="inline-flex items-center"
                              >
                                <Paperclip size={14} className="mr-1" />
                                {f.name}
                                <ExternalLink size={14} className="ml-1" />
                              </Btn>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Body */}
                    <div
                      className="mt-5 text-sm leading-6 whitespace-pre-wrap"
                      style={{ color: palette.black1 }}
                    >
                      {ann.body}
                    </div>
                  </>
                )}
              </SectionCard>

              {/* Kanan: pengumuman lain */}
              <SectionCard
                palette={palette}
                className="lg:col-span-4 p-4 md:p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Pengumuman Lainnya</div>
                  <Link to="/student/pengumuman">
                    <Btn size="sm" variant="ghost" palette={palette}>
                      Lihat semua
                    </Btn>
                  </Link>
                </div>

                {isLoading ? (
                  <div style={{ color: palette.silver2 }}>Memuat…</div>
                ) : related.length === 0 ? (
                  <div style={{ color: palette.silver2 }}>
                    Tidak ada pengumuman lain.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {related.map((r) => (
                      <li key={r.id}>
                        <Link
                          to={`/student/pengumuman/${r.id}`}
                          className="block rounded-xl border p-3"
                          style={{
                            borderColor: palette.silver1,
                            background: palette.white2,
                          }}
                        >
                          <div className="font-medium truncate">{r.title}</div>
                          <div
                            className="text-xs mt-1"
                            style={{ color: palette.silver2 }}
                          >
                            {dateFmt(r.date)}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
