// src/pages/sekolahislamku/pages/academic/DetailCertificate.tsx
import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

// Theme & utils
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

// UI primitives & layout
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

// Icons
import { Award, ArrowLeft, Printer, Download } from "lucide-react";

/* ============== Helpers ============== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

const hijriLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/** Generator nomor sertifikat fallback ketika API tidak menyediakan */
const genCertNo = (
  issueISO: string | undefined,
  className: string,
  idx: number
) => {
  const yy = issueISO
    ? String(new Date(issueISO).getFullYear()).slice(2)
    : "00";
  return `${yy}-${className}-${String(idx + 1).padStart(3, "0")}`;
};

/* ============== Types (sinkron dgn list page) ============== */
type ClassCard = {
  id: string;
  name: string;
  academic_year: string;
  issue_date: string;
  student_count: number;
};

type FinalScoreRow = {
  id: string; // studentId (unik di kelas)
  student_name: string;
  final_score: number;
  published?: boolean;
};

type ApiClassFinals = {
  class: ClassCard;
  certificate_type: "Kelulusan" | "Kenaikan Kelas";
  recipients: FinalScoreRow[];
};

type CertificateDetail = {
  id: string; // studentId
  number: string;
  type: "Kelulusan" | "Kenaikan Kelas" | string;
  student_name: string;
  class_name: string;
  academic_year: string;
  issue_date: string;
  status: "draft" | "published" | "expired";
  score: number;
};

/* ============== Component ============== */
const DetailCertificate: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { classId = "", studentId = "" } = useParams<{
    classId: string;
    studentId: string;
  }>();

  // ---- Ambil dari CACHE dulu (hasil halaman SchoolCertificate) ----
  const cached = qc.getQueryData<ApiClassFinals>([
    "certificate-class-detail",
    classId,
  ]);

  const cachedRow = useMemo(() => {
    if (!cached) return null;
    const idx = cached.recipients.findIndex((r) => r.id === studentId);
    if (idx < 0) return null;
    const r = cached.recipients[idx];
    const number =
      // fallback lokal (anda bisa ganti jika backend sudah menyediakan nomor)
      genCertNo(cached.class.issue_date, cached.class.name, idx);
    const status: "draft" | "published" | "expired" = r.published
      ? "published"
      : "draft";
    const detail: CertificateDetail = {
      id: r.id,
      number,
      type: cached.certificate_type,
      student_name: r.student_name,
      class_name: cached.class.name,
      academic_year: cached.class.academic_year,
      issue_date: cached.class.issue_date,
      status,
      score: r.final_score,
    };
    return detail;
  }, [cached, classId, studentId]);

  // ---- Query ke API (fallback / refresh) ----
  const certQ = useQuery({
    queryKey: ["certificate-detail", classId, studentId],
    queryFn: async (): Promise<CertificateDetail> => {
      const { data } = await axios.get(
        `/api/a/certificates/${classId}/${studentId}`
      );
      return data as CertificateDetail;
    },
    // tampilkan data cache sebagai initialData agar UI instan
    initialData: cachedRow ?? undefined,
    // tetap fetch untuk sync; jika gagal kita akan tampilkan soft error di bawah
    staleTime: 0,
    enabled: !!classId && !!studentId,
    // opsional: kurangi kebisingan error otomatis
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const detail = certQ.data;
  const gIso = useMemo(() => new Date().toISOString(), []);

  const exportPdf = () => {
    if (!classId || !studentId) return;
    window.open(`/api/a/certificates/${classId}/${studentId}/pdf`, "_blank");
  };

  const printCert = () => {
    if (!classId || !studentId) return;
    window.open(`/api/a/certificates/${classId}/${studentId}/print`, "_blank");
  };

  // ====== Render guards: jangan timpa data dengan layar error kalau refetch gagal ======
  const showHardError = certQ.isError && !detail; // benar2 tidak ada data
  const showSoftError = certQ.isError && !!detail; // ada data, tapi refresh gagal

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Sertifikat"
        gregorianDate={gIso}
        hijriDate={hijriLong(gIso)}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main */}
          <section className="lg:col-span-9 space-y-6">
            <SectionCard palette={palette}>
              <div
                className="p-4 md:p-5 flex items-center gap-3 border-b"
                style={{ borderColor: palette.silver1 }}
              >
                <span
                  className="h-10 w-10 grid place-items-center rounded-xl"
                  style={{
                    background: palette.primary2,
                    color: palette.primary,
                  }}
                >
                  <Award size={18} />
                </span>
                <div className="flex-1">
                  <div className="text-lg font-semibold">Detail Sertifikat</div>
                  <div className="text-sm" style={{ color: palette.black2 }}>
                    Informasi lengkap sertifikat siswa
                  </div>
                </div>
                <Btn
                  palette={palette}
                  variant="ghost"
                  className="gap-1"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft size={16} /> Kembali
                </Btn>
              </div>

              {/* Loading & Error */}
              {certQ.isLoading && !detail ? (
                <div
                  className="p-6 text-center"
                  style={{ color: palette.silver2 }}
                >
                  Memuat data…
                </div>
              ) : showHardError ? (
                <div
                  className="p-6 text-center text-sm"
                  style={{ color: palette.warning1 }}
                >
                  Gagal memuat data. Coba ulang.
                </div>
              ) : !detail ? (
                <div
                  className="p-6 text-center"
                  style={{ color: palette.silver2 }}
                >
                  Data tidak ditemukan.
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {/* Soft states */}
                  {certQ.isFetching && (
                    <div
                      className="text-xs"
                      style={{ color: palette.silver2 }}
                      role="status"
                    >
                      Menyegarkan data dari server…
                    </div>
                  )}
                  {showSoftError && (
                    <div
                      className="text-xs"
                      style={{ color: palette.warning1 }}
                      role="alert"
                    >
                      Gagal menyegarkan. Menampilkan data terakhir yang
                      tersedia.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">No. Sertifikat</div>
                      <div>{detail.number}</div>
                    </div>
                    <div>
                      <div className="font-medium">Jenis</div>
                      <div>{detail.type}</div>
                    </div>
                    <div>
                      <div className="font-medium">Nama Siswa</div>
                      <div>{detail.student_name}</div>
                    </div>
                    <div>
                      <div className="font-medium">Kelas</div>
                      <div>{detail.class_name}</div>
                    </div>
                    <div>
                      <div className="font-medium">Tahun Ajaran</div>
                      <div>{detail.academic_year}</div>
                    </div>
                    <div>
                      <div className="font-medium">Tanggal Terbit</div>
                      <div>{dateLong(detail.issue_date)}</div>
                    </div>
                    <div>
                      <div className="font-medium">Nilai Akhir</div>
                      <div>{detail.score}</div>
                    </div>
                    <div>
                      <div className="font-medium">Status</div>
                      <Badge
                        palette={palette}
                        variant={
                          detail.status === "published"
                            ? "success"
                            : detail.status === "expired"
                              ? "warning"
                              : "outline"
                        }
                      >
                        {detail.status === "published"
                          ? "Terbit"
                          : detail.status === "draft"
                            ? "Draft"
                            : "Kedaluwarsa"}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Btn
                      palette={palette}
                      onClick={printCert}
                      className="gap-1"
                    >
                      <Printer size={16} /> Cetak
                    </Btn>
                    <Btn
                      palette={palette}
                      onClick={exportPdf}
                      className="gap-1"
                    >
                      <Download size={16} /> PDF
                    </Btn>
                  </div>
                </div>
              )}
            </SectionCard>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DetailCertificate;
