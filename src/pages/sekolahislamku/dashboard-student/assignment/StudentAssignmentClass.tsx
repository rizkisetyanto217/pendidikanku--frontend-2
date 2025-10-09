// src/pages/sekolahislamku/pages/student/StudentAssignment.tsx
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
  Search,
  Filter,
  CalendarDays,
  Clock,
  Eye,
  Send,
  Paperclip,
  CheckCircle,
} from "lucide-react";

/* ===== Helpers ===== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/* ===== Types ===== */
type AssignmentStatus = "belum" | "terkumpul" | "dinilai";
type Assignment = {
  id: string;
  subject: "tahsin" | "tahfidz" | "fiqih";
  title: string;
  description?: string;
  dueAt: string; // ISO
  points?: number;
  status: AssignmentStatus;
  submittedAt?: string;
  grade?: number;
  attachmentName?: string;
};

const SUBJECT_LABEL: Record<Assignment["subject"], string> = {
  tahsin: "Tahsin",
  tahfidz: "Tahfidz",
  fiqih: "Fiqih",
};

/* ===== Dummy data: seluruh tugas siswa lintas mapel ===== */
const DUMMY_ALL: Assignment[] = [
  // Tahsin
  {
    id: "tahsin-1",
    subject: "tahsin",
    title: "Latihan Mad Thabi'i",
    description: "Kerjakan 10 soal pilihan ganda tentang mad thabi'i.",
    dueAt: new Date(Date.now() + 2 * 864e5).toISOString(),
    points: 100,
    status: "belum",
  },
  {
    id: "tahsin-2",
    subject: "tahsin",
    title: "Ringkasan Hukum Nun Sukun",
    description: "Tuliskan ringkasan 1 halaman.",
    dueAt: new Date(Date.now() - 2 * 864e5).toISOString(),
    points: 100,
    status: "dinilai",
    submittedAt: new Date(Date.now() - 3 * 864e5).toISOString(),
    grade: 88,
    attachmentName: "ringkasan-nun-sukun.pdf",
  },

  // Tahfidz
  {
    id: "tahfidz-1",
    subject: "tahfidz",
    title: "Setoran An-Naba’ 1–10",
    description: "Setor hafalan ayat 1–10.",
    dueAt: new Date(Date.now() + 864e5).toISOString(),
    points: 100,
    status: "terkumpul",
    submittedAt: new Date().toISOString(),
    attachmentName: "setoran-1-10.mp3",
  },
  {
    id: "tahfidz-2",
    subject: "tahfidz",
    title: "Muraja’ah Audio 11–20",
    description: "Unggah audio muraja’ah.",
    dueAt: new Date(Date.now() - 864e5).toISOString(),
    points: 100,
    status: "belum",
  },

  // Fiqih
  {
    id: "fiqih-1",
    subject: "fiqih",
    title: "Rangkuman Thaharah",
    description: "Rangkum bab najis & cara menyucikannya.",
    dueAt: new Date(Date.now() + 3 * 864e5).toISOString(),
    points: 100,
    status: "belum",
  },
  {
    id: "fiqih-2",
    subject: "fiqih",
    title: "Latihan Soal Wudhu",
    description: "10 soal tentang rukun & sunnah wudhu.",
    dueAt: new Date(Date.now() + 2 * 864e5).toISOString(),
    points: 100,
    status: "dinilai",
    submittedAt: new Date(Date.now() - 864e5).toISOString(),
    grade: 92,
    attachmentName: "jawaban-wudhu.pdf",
  },
];

const StudentAssignment: React.FC = () => {
  const { slug, subject } = useParams<{ slug: string; subject?: string }>();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName, isDark);

  // Support 2 rute: /:slug/murid/tugas (tanpa subject) dan /.../my-class/:subject/tugas
  const defaultSubject = (subject as Assignment["subject"]) || "all";
  const [subjectFilter, setSubjectFilter] = useState<
    "all" | Assignment["subject"]
  >(
    defaultSubject === "tahsin" ||
      defaultSubject === "tahfidz" ||
      defaultSubject === "fiqih"
      ? defaultSubject
      : "all"
  );

  const [list, setList] = useState<Assignment[]>(DUMMY_ALL);

  // search & filter
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | AssignmentStatus>("belum"); // default seperti screenshot

  const isOverdue = (a: Assignment) =>
    new Date(a.dueAt).getTime() < Date.now() && a.status === "belum";

  const bySubject = useMemo(
    () =>
      list.filter((a) =>
        subjectFilter === "all" ? true : a.subject === subjectFilter
      ),
    [list, subjectFilter]
  );

  const counts = useMemo(() => {
    const total = bySubject.length;
    const belum = bySubject.filter((x) => x.status === "belum").length;
    const terkumpul = bySubject.filter((x) => x.status === "terkumpul").length;
    const dinilai = bySubject.filter((x) => x.status === "dinilai").length;
    return { total, belum, terkumpul, dinilai };
  }, [bySubject]);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    return bySubject
      .filter((a) => (status === "all" ? true : a.status === status))
      .filter(
        (a) =>
          !key ||
          a.title.toLowerCase().includes(key) ||
          (a.description ?? "").toLowerCase().includes(key)
      )
      .sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt));
  }, [bySubject, q, status]);

  // Actions (dummy)
  const handleSubmit = (a: Assignment) => {
    const now = new Date().toISOString();
    setList((old) =>
      old.map((x) =>
        x.id === a.id
          ? {
              ...x,
              status: "terkumpul",
              submittedAt: now,
              attachmentName: x.attachmentName || "tugas-dikumpulkan.pdf",
            }
          : x
      )
    );
    alert(`Tugas "${a.title}" sudah dikumpulkan!`);
  };

  const handleView = (a: Assignment) => {
    const detail = [
      `Mapel: ${SUBJECT_LABEL[a.subject]}`,
      `Judul: ${a.title}`,
      a.description ? `Deskripsi: ${a.description}` : "",
      `Jatuh tempo: ${dateLong(a.dueAt)}`,
      `Status: ${a.status}`,
      a.submittedAt ? `Dikumpulkan: ${dateLong(a.submittedAt)}` : "",
      typeof a.grade === "number" ? `Nilai: ${a.grade}` : "",
      a.attachmentName ? `Lampiran: ${a.attachmentName}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    alert(detail);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={
          subjectFilter === "all"
            ? "Daftar Tugas"
            : `Tugas — ${SUBJECT_LABEL[subjectFilter]}`
        }
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
            {/* Back + title */}
            <div className="md:flex hidden gap-3 items-center">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={20} />
              </Btn>
              <h1 className="textlg font-semibold">Daftar Tugas</h1>
            </div>

            {/* Ringkasan */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 flex flex-wrap gap-3 items-center">
                <div className="text-sm">
                  Total: <b>{counts.total}</b>
                </div>
                <Badge palette={palette} variant="outline" className="h-6">
                  Belum: {counts.belum}
                </Badge>
                <Badge palette={palette} variant="secondary" className="h-6">
                  Terkumpul: {counts.terkumpul}
                </Badge>
                <Badge palette={palette} variant="success" className="h-6">
                  Dinilai: {counts.dinilai}
                </Badge>
              </div>
            </SectionCard>

            {/* Controls */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Cari */}
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
                    placeholder="Cari tugas…"
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: palette.black1 }}
                  />
                </div>

                {/* Filter status */}
                <div
                  className="flex items-center gap-2 rounded-xl border px-3 h-10"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <Filter size={16} />
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "all" | AssignmentStatus)
                    }
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: palette.black1 }}
                  >
                    <option value="belum">Belum dikumpulkan</option>
                    <option value="terkumpul">Terkumpul</option>
                    <option value="dinilai">Dinilai</option>
                    <option value="all">Semua status</option>
                  </select>
                </div>

                {/* Filter mapel (opsional, tampil selalu) */}
                <div
                  className="flex items-center gap-2 rounded-xl border px-3 h-10"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <Filter size={16} />
                  <select
                    value={subjectFilter}
                    onChange={(e) =>
                      setSubjectFilter(
                        e.target.value as "all" | Assignment["subject"]
                      )
                    }
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: palette.black1 }}
                  >
                    <option value="all">Semua mapel</option>
                    <option value="tahsin">Tahsin</option>
                    <option value="tahfidz">Tahfidz</option>
                    <option value="fiqih">Fiqih</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* List tugas */}
            <div className="grid gap-3">
              {filtered.map((a) => (
                <SectionCard key={a.id} palette={palette} className="p-0">
                  <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-base md:text-lg font-semibold">
                            {a.title}
                          </div>
                          {/* Mapel */}
                          <Badge
                            palette={palette}
                            variant="outline"
                            className="h-6"
                          >
                            {SUBJECT_LABEL[a.subject]}
                          </Badge>
                          {/* Status */}
                          <Badge
                            palette={palette}
                            variant={
                              a.status === "dinilai"
                                ? "success"
                                : a.status === "terkumpul"
                                  ? "secondary"
                                  : isOverdue(a)
                                    ? "warning"
                                    : "outline"
                            }
                            className="h-6"
                          >
                            {a.status === "belum" &&
                              (isOverdue(a) ? "Terlambat" : "Belum")}
                            {a.status === "terkumpul" && "Terkumpul"}
                            {a.status === "dinilai" && "Dinilai"}
                          </Badge>
                          {typeof a.grade === "number" && (
                            <Badge
                              palette={palette}
                              variant="info"
                              className="h-6"
                            >
                              Nilai: {a.grade}
                            </Badge>
                          )}
                        </div>

                        {a.description && (
                          <p
                            className="text-sm mt-1"
                            style={{ color: palette.black2 }}
                          >
                            {a.description}
                          </p>
                        )}

                        <div
                          className="mt-2 flex flex-wrap items-center gap-3 text-sm"
                          style={{ color: palette.black2 }}
                        >
                          <CalendarDays size={14} />
                          <span>Jatuh tempo: {dateLong(a.dueAt)}</span>
                          {a.submittedAt && (
                            <>
                              <span>•</span>
                              <Clock size={14} />
                              <span>
                                Dikumpulkan: {dateLong(a.submittedAt)}
                              </span>
                            </>
                          )}
                          {a.attachmentName && (
                            <>
                              <span>•</span>
                              <Paperclip size={14} />
                              <span>{a.attachmentName}</span>
                            </>
                          )}
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
                      Aksi
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Btn
                        palette={palette}
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(a)}
                      >
                        <Eye size={16} className="mr-1" />
                        Lihat
                      </Btn>

                      {a.status === "belum" && (
                        <Btn
                          palette={palette}
                          size="sm"
                          onClick={() => handleSubmit(a)}
                        >
                          <Send size={16} className="mr-1" />
                          Kumpulkan
                        </Btn>
                      )}

                      {a.status === "terkumpul" && (
                        <Badge
                          palette={palette}
                          variant="secondary"
                          className="h-6 flex items-center gap-1"
                        >
                          <CheckCircle size={14} />
                          Menunggu penilaian
                        </Badge>
                      )}

                      {a.status === "dinilai" && (
                        <Badge
                          palette={palette}
                          variant="success"
                          className="h-6 flex items-center gap-1"
                        >
                          <CheckCircle size={14} />
                          Selesai
                        </Badge>
                      )}
                    </div>
                  </div>
                </SectionCard>
              ))}

              {filtered.length === 0 && (
                <SectionCard palette={palette}>
                  <div
                    className="p-6 text-sm text-center"
                    style={{ color: palette.silver2 }}
                  >
                    Tidak ada tugas yang cocok.
                  </div>
                </SectionCard>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentAssignment;
