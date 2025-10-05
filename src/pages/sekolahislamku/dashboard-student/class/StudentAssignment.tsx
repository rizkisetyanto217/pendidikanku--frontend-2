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
  FileText,
  CalendarDays,
  Upload,
  Download,
  Eye,
  Undo2,
  Search,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

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

/* ===== Meta kelas (opsional untuk header) ===== */
const CLASS_META: Record<
  string,
  { name: string; room?: string; homeroom?: string }
> = {
  "tpa-a": { name: "TPA A", room: "Aula 1", homeroom: "Ustadz Abdullah" },
  "tpa-b": { name: "TPA B", room: "R. Tahfiz", homeroom: "Ustadz Salman" },
};

/* ===== Dummy tugas per kelas ===== */
type Assignment = {
  id: string;
  title: string;
  desc?: string;
  createdAt: string;
  dueAt?: string;
  attachments?: { name: string; url?: string }[];
  status: "belum" | "terkumpul" | "dinilai";
  submittedAt?: string;
  score?: number;
  feedback?: string;
};

const nowISO = new Date().toISOString();
const plusDays = (n: number) => new Date(Date.now() + n * 864e5).toISOString();
const minusDays = (n: number) => new Date(Date.now() - n * 864e5).toISOString();

const ASSIGNMENTS_BY_CLASS: Record<string, Assignment[]> = {
  "tpa-a": [
    {
      id: "a-001",
      title: "Latihan Tajwid — Mad Thabi'i",
      desc: "Kerjakan 10 soal pilihan ganda tentang mad thabi'i.",
      createdAt: minusDays(1),
      dueAt: plusDays(1),
      attachments: [{ name: "latihan-mad-thabii.pdf" }],
      status: "belum",
    },
    {
      id: "a-002",
      title: "Praktek Bacaan — Makharijul Huruf",
      desc: "Rekam suara membaca 5 contoh huruf dengan makhraj yang benar.",
      createdAt: nowISO,
      dueAt: plusDays(3),
      status: "terkumpul",
      submittedAt: nowISO,
    },
    {
      id: "a-003",
      title: "Rangkuman Idgham",
      desc: "Buat rangkuman satu halaman tentang Idgham.",
      createdAt: minusDays(3),
      dueAt: minusDays(1),
      status: "dinilai",
      submittedAt: minusDays(2),
      score: 88,
      feedback: "Sudah bagus, tambahkan contoh tambahan.",
    },
  ],
  "tpa-b": [
    {
      id: "a-101",
      title: "Target Hafalan — Juz 30",
      desc: "Setor hafalan An-Naba' ayat 1—20.",
      createdAt: minusDays(2),
      dueAt: plusDays(2),
      status: "belum",
      attachments: [{ name: "target-hafalan.docx" }],
    },
  ],
};

const StudentAssignment: React.FC = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName, isDark);

  const classMeta = CLASS_META[id ?? ""] ?? { name: id ?? "-" };
  const [items, setItems] = useState<Assignment[]>(
    ASSIGNMENTS_BY_CLASS[id ?? ""] ?? []
  );

  /* Search & filter status */
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Assignment["status"]>("all");

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    let list = items;
    if (status !== "all") list = list.filter((i) => i.status === status);
    if (key) {
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(key) ||
          (i.desc ?? "").toLowerCase().includes(key)
      );
    }
    return [...list].sort(
      (a, b) =>
        +new Date(a.dueAt ?? a.createdAt) - +new Date(b.dueAt ?? b.createdAt)
    );
  }, [items, q, status]);

  const goBackToMyClass = () =>
    navigate(`/${slug}/murid/menu-utama/my-class`, { replace: false });

  const handleDownload = (asg: Assignment) => {
    const att = asg.attachments?.[0];
    if (!att) {
      alert("Tidak ada lampiran untuk tugas ini.");
      return;
    }
    if (att.url) {
      window.open(att.url, "_blank", "noopener,noreferrer");
      return;
    }
    // Fallback: file dummy
    const blob = new Blob(
      [`Tugas: ${asg.title}\n\nIni placeholder lampiran "${att.name}".`],
      { type: "text/plain;charset=utf-8" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = att.name || `${asg.title}.txt`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
  };

  const handleSubmit = async (asg: Assignment) => {
    const res = await Swal.fire({
      title: "Kumpulkan Tugas",
      html: `
        <input type="file" id="file-submission" class="swal2-file" />
        <textarea id="note" class="swal2-textarea" placeholder="Catatan (opsional)"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: "Kumpulkan",
      cancelButtonText: "Batal",
      background: palette.white1,
      color: palette.black1,
      confirmButtonColor: palette.primary,
      preConfirm: () => {
        const f = (
          document.getElementById("file-submission") as HTMLInputElement
        )?.files;
        if (!f || f.length === 0) {
          Swal.showValidationMessage("Silakan pilih file terlebih dahulu.");
          return;
        }
        return true;
      },
    });
    if (!res.isConfirmed) return;

    setItems((prev) =>
      prev.map((x) =>
        x.id === asg.id
          ? { ...x, status: "terkumpul", submittedAt: new Date().toISOString() }
          : x
      )
    );

    await Swal.fire({
      title: "Terkumpul!",
      icon: "success",
      timer: 1200,
      showConfirmButton: false,
      background: palette.white1,
      color: palette.black1,
    });
  };

  const handleUnsubmit = async (asg: Assignment) => {
    const ok = await Swal.fire({
      title: "Batalkan pengumpulan?",
      text: "Kamu bisa mengunggah ulang sebelum tenggat.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, batalkan",
      cancelButtonText: "Batal",
      background: palette.white1,
      color: palette.black1,
      confirmButtonColor: palette.primary,
    });
    if (!ok.isConfirmed) return;

    setItems((prev) =>
      prev.map((x) =>
        x.id === asg.id ? { ...x, status: "belum", submittedAt: undefined } : x
      )
    );
  };

  const handleView = async (asg: Assignment) => {
    await Swal.fire({
      title: asg.title,
      html: `
        <div style="text-align:left">
          <p><strong>Deskripsi:</strong> ${asg.desc ?? "-"}</p>
          <p><strong>Dibuat:</strong> ${dateLong(asg.createdAt)}</p>
          <p><strong>Tenggat:</strong> ${dateLong(asg.dueAt)}</p>
          <p><strong>Status:</strong> ${asg.status}</p>
          ${
            asg.status !== "belum"
              ? `<p><strong>Dikumpulkan:</strong> ${dateLong(asg.submittedAt)}</p>`
              : ""
          }
          ${
            typeof asg.score === "number"
              ? `<p><strong>Nilai:</strong> ${asg.score}</p>`
              : ""
          }
          ${asg.feedback ? `<p><strong>Umpan balik:</strong> ${asg.feedback}</p>` : ""}
        </div>
      `,
      icon: "info",
      confirmButtonText: "Tutup",
      background: palette.white1,
      color: palette.black1,
      confirmButtonColor: palette.primary,
    });
  };

  const badgeForStatus = (s: Assignment["status"]) =>
    s === "belum" ? "warning" : s === "terkumpul" ? "info" : "success";

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={`Tugas — ${classMeta.name}`}
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
              <Btn palette={palette} variant="ghost" onClick={goBackToMyClass}>
                <ArrowLeft size={20} />
              </Btn>
              <h1 className="textlg font-semibold">Daftar Tugas</h1>
            </div>

            {/* Filter/Search */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div
                  className="flex items-center gap-2 rounded-xl border px-3 h-10 w-full md:w-96"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <Search size={16} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari judul / deskripsi…"
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: palette.black1 }}
                  />
                </div>
                <div
                  className="flex items-center gap-2 rounded-xl border px-3 h-10 w-full md:w-64"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <Clock size={16} />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: palette.black1 }}
                  >
                    <option value="all">Semua status</option>
                    <option value="belum">Belum dikumpulkan</option>
                    <option value="terkumpul">Terkumpul</option>
                    <option value="dinilai">Dinilai</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* List tugas */}
            <div className="grid gap-3">
              {filtered.map((asg) => (
                <SectionCard key={asg.id} palette={palette} className="p-0">
                  <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div
                            className="text-base md:text-lg font-semibold"
                            style={{ color: palette.black2 }}
                          >
                            {asg.title}
                          </div>
                          <Badge
                            palette={palette}
                            variant={badgeForStatus(asg.status)}
                            className="h-6"
                          >
                            {asg.status === "belum"
                              ? "Belum"
                              : asg.status === "terkumpul"
                                ? "Terkumpul"
                                : "Dinilai"}
                          </Badge>
                          {typeof asg.score === "number" && (
                            <Badge
                              palette={palette}
                              variant="secondary"
                              className="h-6"
                            >
                              Nilai: {asg.score}
                            </Badge>
                          )}
                        </div>

                        {asg.desc && (
                          <p
                            className="text-sm mt-1"
                            style={{ color: palette.black2 }}
                          >
                            {asg.desc}
                          </p>
                        )}

                        <div
                          className="mt-2 flex flex-wrap items-center gap-3 text-sm"
                          style={{ color: palette.black2 }}
                        >
                          <CalendarDays size={14} />
                          <span>Tenggat: {dateLong(asg.dueAt)}</span>
                          {asg.submittedAt && (
                            <>
                              <CheckCircle2 size={14} />
                              <span>
                                Dikumpulkan: {dateLong(asg.submittedAt)}
                              </span>
                            </>
                          )}
                          {asg.attachments?.length ? (
                            <span>• {asg.attachments.length} lampiran</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="px-4 md:px-5 pb-4 md:pb-5 pt-3 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <div className="text-sm" style={{ color: palette.black2 }}>
                      Aksi
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {asg.attachments?.length ? (
                        <Btn
                          palette={palette}
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(asg)}
                        >
                          <Download size={16} className="mr-1" />
                          Unduh
                        </Btn>
                      ) : null}

                      <Btn
                        palette={palette}
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(asg)}
                      >
                        <Eye size={16} className="mr-1" />
                        Lihat
                      </Btn>

                      {asg.status === "belum" && (
                        <Btn
                          palette={palette}
                          size="sm"
                          onClick={() => handleSubmit(asg)}
                        >
                          <Upload size={16} className="mr-1" />
                          Kumpulkan
                        </Btn>
                      )}

                      {asg.status === "terkumpul" && (
                        <Btn
                          palette={palette}
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUnsubmit(asg)}
                        >
                          <Undo2 size={16} className="mr-1" />
                          Batalkan
                        </Btn>
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
                    Belum ada tugas yang cocok.
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Back (mobile) */}
            <div className="md:hidden">
              <Btn
                palette={palette}
                variant="outline"
                onClick={goBackToMyClass}
              >
                <ArrowLeft size={16} className="mr-1" /> Kembali ke Kelas
              </Btn>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentAssignment;
