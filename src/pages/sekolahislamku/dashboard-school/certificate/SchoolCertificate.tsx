import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "@/lib/axios";

// Theme & utils
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

// UI primitives & layout
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

// Icons
import {
  Award,
  Users,
  CalendarRange,
  GraduationCap,
  ArrowLeft,
  Eye,
  Download,
  Printer,
  Filter as FilterIcon,
  RefreshCcw,
  Settings2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

/* ================= Helpers ================= */
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
const dateOnly = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("id-ID") : "-";

/* ================= Types ================= */
type ClassCard = {
  id: string;
  name: string;
  academic_year: string;
  issue_date: string;
  student_count: number;
};
type FinalScoreRow = {
  id: string;
  student_name: string;
  final_score: number;
  published?: boolean;
};
type ApiClassList = { list: ClassCard[] };
type ApiClassFinals = {
  class: ClassCard;
  certificate_type: "Kelulusan" | "Kenaikan Kelas";
  recipients: FinalScoreRow[];
};

/* ===== nomor sertifikat (dummy generator) ===== */
const genCertNo = (cls: ClassCard, idx: number) => {
  const yy = String(new Date(cls.issue_date).getFullYear()).slice(2);
  return `${yy}-${cls.name}-${String(idx + 1).padStart(3, "0")}`;
};

const PASS = 75; // ambang kelulusan default

/* ================= ENDPOINTS (pastikan sesuai backend) =================
- GET  /api/a/certificate/classes?month=YYYY-MM
- GET  /api/a/certificate/classes/:classId/finals
- POST /api/a/certificates/publish       { class_id, student_id }
- POST /api/a/certificates/revoke        { class_id, student_id }
- POST /api/a/certificates/publish-bulk  { class_id, student_ids: [] }
- POST /api/a/certificates/revoke-bulk   { class_id, student_ids: [] }
- GET  /api/a/certificates/:classId/:studentId/pdf
- GET  /api/a/certificates/:classId/:studentId/print
- GET  /api/a/certificates/class/:classId/pdf
======================================================================= */

/** Icon-only button helper */
function IconBtn({
  title,
  onClick,
  disabled,
  palette,
  children,
}: {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  palette: Palette;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className="h-9 w-9 grid place-items-center rounded-lg border transition"
      style={{
        borderColor: palette.silver1,
        color: palette.quaternary,
        background: "transparent",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

const SchoolCertificate: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const gregorianISO = toLocalNoonISO(new Date());

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [month, setMonth] = useState<string>(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}`;
  });

  // Banner feedback sederhana
  const [banner, setBanner] = useState<string | null>(null);
  const showBanner = (msg: string) => {
    setBanner(msg);
    setTimeout(() => setBanner(null), 2500);
  };

  /* ================= QUERIES ================= */
  const classesQ = useQuery({
    queryKey: ["certificate-classes", month],
    queryFn: async (): Promise<ApiClassList> => {
      // const { data } = await axios.get("/api/a/certificate/classes", { params: { month } });
      // return data;
      const base = new Date();
      base.setDate(5);
      const y = base.getFullYear();
      const AY = `${y}/${y + 1}`;
      const list: ClassCard[] = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(base);
        d.setMonth(base.getMonth() - i);
        return {
          id: `C-${i + 1}`,
          name: `${i + 1}${["A", "B"][i % 2]}`,
          academic_year: AY,
          issue_date: d.toISOString(),
          student_count: 20 + (i % 6),
        };
      });
      return { list };
    },
    staleTime: 60_000,
  });

  const classDetailQ = useQuery({
    queryKey: ["certificate-class-detail", selectedClassId],
    enabled: !!selectedClassId,
    queryFn: async (): Promise<ApiClassFinals> => {
      // const { data } = await axios.get(`/api/a/certificate/classes/${selectedClassId}/finals`);
      // return data;
      const cls =
        classesQ.data?.list.find((c) => c.id === selectedClassId) ??
        ({
          id: selectedClassId!,
          name: "1A",
          academic_year: "2025/2026",
          issue_date: new Date().toISOString(),
          student_count: 0,
        } as ClassCard);

      const recipients: FinalScoreRow[] = Array.from({ length: 24 }).map(
        (_, i) => ({
          id: `${cls.id}-S-${i + 1}`,
          student_name: `Siswa ${i + 1}`,
          final_score: 60 + ((i * 7) % 41),
          published: i % 4 !== 0,
        })
      );
      const certificate_type: "Kelulusan" | "Kenaikan Kelas" =
        Number(cls.name.replace(/\D/g, "")) >= 6
          ? "Kelulusan"
          : "Kenaikan Kelas";
      return { class: cls, recipients, certificate_type };
    },
    staleTime: 60_000,
  });

  const classList = classesQ.data?.list ?? [];
  const selectedClass = classDetailQ.data?.class ?? null;
  const recipients = classDetailQ.data?.recipients ?? [];
  const certType = classDetailQ.data?.certificate_type ?? "Kenaikan Kelas";

  /* ================= SELECTION ================= */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  useEffect(() => setSelectedIds(new Set()), [selectedClassId]);

  const allChecked =
    recipients.length > 0 && selectedIds.size === recipients.length;
  const someChecked =
    selectedIds.size > 0 && selectedIds.size < recipients.length;
  const toggleAll = () => {
    if (allChecked) setSelectedIds(new Set());
    else setSelectedIds(new Set(recipients.map((r) => r.id)));
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  /* ================= MUTATIONS (with optimistic update) ================= */
  const patchCache = (ids: string[], published: boolean) => {
    qc.setQueryData<ApiClassFinals>(
      ["certificate-class-detail", selectedClassId],
      (old) => {
        if (!old) return old as any;
        return {
          ...old,
          recipients: old.recipients.map((r) =>
            ids.includes(r.id) ? { ...r, published } : r
          ),
        };
      }
    );
  };

  const publishOneMut = useMutation({
    mutationFn: async ({
      class_id,
      student_id,
    }: {
      class_id: string;
      student_id: string;
    }) => axios.post("/api/a/certificates/publish", { class_id, student_id }),
    onMutate: async (vars) => {
      await qc.cancelQueries({
        queryKey: ["certificate-class-detail", selectedClassId],
      });
      patchCache([vars.student_id], true);
    },
    onError: (_e, vars) => {
      patchCache([vars.student_id], false);
      showBanner("Gagal menerbitkan sertifikat.");
    },
    onSuccess: () => showBanner("Sertifikat diterbitkan."),
  });

  const revokeOneMut = useMutation({
    mutationFn: async ({
      class_id,
      student_id,
    }: {
      class_id: string;
      student_id: string;
    }) => axios.post("/api/a/certificates/revoke", { class_id, student_id }),
    onMutate: async (vars) => {
      await qc.cancelQueries({
        queryKey: ["certificate-class-detail", selectedClassId],
      });
      patchCache([vars.student_id], false);
    },
    onError: (_e, vars) => {
      patchCache([vars.student_id], true);
      showBanner("Gagal mencabut sertifikat.");
    },
    onSuccess: () => showBanner("Sertifikat dicabut."),
  });

  const publishBulkMut = useMutation({
    mutationFn: async ({
      class_id,
      student_ids,
    }: {
      class_id: string;
      student_ids: string[];
    }) =>
      axios.post("/api/a/certificates/publish-bulk", { class_id, student_ids }),
    onMutate: async (vars) => {
      await qc.cancelQueries({
        queryKey: ["certificate-class-detail", selectedClassId],
      });
      patchCache(vars.student_ids, true);
    },
    onError: (_e, vars) => {
      patchCache(vars.student_ids, false);
      showBanner("Gagal menerbitkan sebagian/semua sertifikat.");
    },
    onSuccess: () => {
      showBanner("Sertifikat berhasil diterbitkan (bulk).");
      setSelectedIds(new Set());
    },
  });

  const revokeBulkMut = useMutation({
    mutationFn: async ({
      class_id,
      student_ids,
    }: {
      class_id: string;
      student_ids: string[];
    }) =>
      axios.post("/api/a/certificates/revoke-bulk", { class_id, student_ids }),
    onMutate: async (vars) => {
      await qc.cancelQueries({
        queryKey: ["certificate-class-detail", selectedClassId],
      });
      patchCache(vars.student_ids, false);
    },
    onError: (_e, vars) => {
      patchCache(vars.student_ids, true);
      showBanner("Gagal mencabut sebagian/semua sertifikat.");
    },
    onSuccess: () => {
      showBanner("Sertifikat berhasil dicabut (bulk).");
      setSelectedIds(new Set());
    },
  });

  /* ================= FILE ACTIONS ================= */
  const openInNewTab = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const exportClass = () => {
    if (!selectedClass) return;
    openInNewTab(`/api/a/certificates/class/${selectedClass.id}/pdf`);
  };
  const exportOnePdf = (studentId: string) => {
    if (!selectedClass) return;
    openInNewTab(`/api/a/certificates/${selectedClass.id}/${studentId}/pdf`);
  };
  const printOne = (studentId: string) => {
    if (!selectedClass) return;
    openInNewTab(`/api/a/certificates/${selectedClass.id}/${studentId}/print`);
  };
  const viewOne = (studentId: string) => {
    if (!selectedClass) return;
    openInNewTab(`/api/a/certificates/${selectedClass.id}/${studentId}`);
  };

  /* ================= DERIVED ================= */
  const totalRecipients = useMemo(
    () => classList.reduce((a, b) => a + (b.student_count || 0), 0),
    [classList]
  );

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Sertifikat"
        gregorianDate={gregorianISO}
        hijriDate={hijriLong(gregorianISO)}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main */}
          <section className="lg:col-span-9 space-y-6 min-w-0">
            {/* Banner */}
            {!!banner && (
              <div
                className="rounded-lg px-4 py-2 text-sm"
                style={{ background: palette.primary2, color: palette.primary }}
              >
                {banner}
              </div>
            )}

            {/* Header */}
            <section className="flex items-start gap-6">
              <span className="h-10 w-10 grid place-items-center rounded-xl">
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                </Btn>
              </span>

              <div className="min-w-0">
                <div className="text-lg font-semibold">
                  {selectedClass
                    ? `Sertifikat • ${selectedClass.name}`
                    : "Sertifikat"}
                </div>
                <div className="text-sm" style={{ color: palette.black2 }}>
                  {selectedClass
                    ? `Jenis: ${certType} • Tahun Ajaran ${selectedClass.academic_year} • Terbit ${dateOnly(
                        selectedClass.issue_date
                      )}`
                    : "Sertifikat dikelompokkan per kelas. Pilih kelas untuk melihat daftar siswa beserta nilai akhirnya."}
                </div>
              </div>

              {selectedClass && (
                <div className="ml-auto">
                  <Btn
                    palette={palette}
                    variant="ghost"
                    onClick={() => setSelectedClassId(null)}
                    className="inline-flex items-center gap-2"
                  >
                    <ArrowLeft size={16} /> Kembali
                  </Btn>
                </div>
              )}
            </section>

            {/* Filter (kelas grid) */}
            {!selectedClass && (
              <SectionCard palette={palette}>
                <div className="p-4 md:p-5 pb-2 font-medium flex items-center gap-2">
                  <FilterIcon size={18} /> Filter
                </div>
                <div className="px-4 md:px-5 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div
                      className="text-xs mb-1"
                      style={{ color: palette.black2 }}
                    >
                      Bulan Terbit
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full h-11 rounded-lg border px-3 bg-transparent text-sm"
                        style={{
                          borderColor: palette.silver1,
                          color: palette.black1,
                        }}
                      />
                      <Btn
                        palette={palette}
                        variant="outline"
                        size="sm"
                        onClick={() => classesQ.refetch()}
                      >
                        <RefreshCcw size={16} />
                      </Btn>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* View 1: grid kelas */}
            {!selectedClass && (
              <>
                <section
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3"
                  style={{ color: palette.black2 }}
                >
                  <KpiTile
                    palette={palette}
                    label="Total Kelas"
                    value={classList.length}
                    icon={<GraduationCap size={18} />}
                  />
                  <KpiTile
                    palette={palette}
                    label="Total Siswa Tersertifikasi"
                    value={totalRecipients}
                    icon={<Users size={18} />}
                  />
                </section>

                <SectionCard palette={palette}>
                  <div className="p-4 md:p-5 pb-2 font-medium flex items-center gap-2">
                    <GraduationCap size={18} /> Daftar Kelas
                  </div>

                  <div className="px-4 md:px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                    {classList.map((c) => (
                      <button
                        key={c.id}
                        className="rounded-xl border text-left p-4 hover:-translate-y-0.5 transition"
                        style={{
                          borderColor: palette.silver1,
                          background: palette.white1,
                        }}
                        onClick={() => setSelectedClassId(c.id)}
                        aria-label={`Lihat nilai akhir kelas ${c.name}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-10 w-10 grid place-items-center rounded-xl"
                            style={{
                              background: palette.primary2,
                              color: palette.primary,
                            }}
                          >
                            <Users size={18} />
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold truncate">
                              {c.name}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: palette.black2 }}
                            >
                              Tahun Ajaran {c.academic_year}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-sm">
                          <div
                            className="inline-flex items-center gap-1"
                            style={{ color: palette.black2 }}
                          >
                            <CalendarRange size={14} /> Terbit{" "}
                            {dateOnly(c.issue_date)}
                          </div>
                          <Badge palette={palette} variant="outline">
                            {c.student_count} murid
                          </Badge>
                        </div>
                      </button>
                    ))}

                    {classList.length === 0 && (
                      <div
                        className="text-sm"
                        style={{ color: palette.silver2 }}
                      >
                        Tidak ada kelas.
                      </div>
                    )}
                  </div>
                </SectionCard>
              </>
            )}

            {/* View 2: daftar nilai akhir per kelas */}
            {selectedClass && (
              <SectionCard palette={palette}>
                <div className="p-4 md:p-5 pb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">
                    Nilai Akhir — Kelas {selectedClass.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <IconBtn
                      title="Pengaturan"
                      palette={palette}
                      onClick={() => {
                        /* buka modal setting */
                      }}
                    >
                      <Settings2 size={18} />
                    </IconBtn>
                    <IconBtn
                      title="Export kelas (PDF)"
                      palette={palette}
                      onClick={exportClass}
                    >
                      <Download size={18} />
                    </IconBtn>
                    {selectedIds.size > 0 && (
                      <>
                        <IconBtn
                          title={`Terbitkan ${selectedIds.size} siswa`}
                          palette={palette}
                          onClick={() =>
                            publishBulkMut.mutate({
                              class_id: selectedClass.id,
                              student_ids: Array.from(selectedIds),
                            })
                          }
                          disabled={publishBulkMut.isPending}
                        >
                          <CheckCircle2 size={18} />
                        </IconBtn>
                        <IconBtn
                          title={`Cabut ${selectedIds.size} siswa`}
                          palette={palette}
                          onClick={() =>
                            revokeBulkMut.mutate({
                              class_id: selectedClass.id,
                              student_ids: Array.from(selectedIds),
                            })
                          }
                          disabled={revokeBulkMut.isPending}
                        >
                          <XCircle size={18} />
                        </IconBtn>
                      </>
                    )}
                  </div>
                </div>

                <div className="px-4 md:px-5 pb-4 overflow-x-auto">
                  <table className="w-full text-sm min-w-[1060px]">
                    <thead
                      className="text-left"
                      style={{ color: palette.black2 }}
                    >
                      <tr
                        className="border-b"
                        style={{ borderColor: palette.silver1 }}
                      >
                        <th className="py-2 pr-3 w-10">
                          <input
                            type="checkbox"
                            aria-label="Pilih semua"
                            checked={allChecked}
                            ref={(el) => {
                              if (el) el.indeterminate = someChecked;
                            }}
                            onChange={toggleAll}
                          />
                        </th>
                        <th className="py-2 pr-4 w-12">No.</th>
                        <th className="py-2 pr-4">No. Sertifikat</th>
                        <th className="py-2 pr-4">Nama Siswa</th>
                        <th className="py-2 pr-4">Nilai Akhir</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-2 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y"
                      style={{ borderColor: palette.silver1 }}
                    >
                      {classDetailQ.isLoading ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center"
                            style={{ color: palette.silver2 }}
                          >
                            Memuat data…
                          </td>
                        </tr>
                      ) : recipients.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center"
                            style={{ color: palette.silver2 }}
                          >
                            Belum ada data nilai.
                          </td>
                        </tr>
                      ) : (
                        recipients.map((r, i) => {
                          const lulus = r.final_score >= PASS;
                          const noSertif = genCertNo(selectedClass, i);
                          const checked = selectedIds.has(r.id);
                          return (
                            <tr key={r.id}>
                              <td className="py-3 pr-3 align-middle">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleOne(r.id)}
                                  aria-label={`pilih ${r.student_name}`}
                                />
                              </td>
                              <td className="py-3 pr-4 align-middle">
                                {i + 1}
                              </td>
                              <td className="py-3 pr-4 align-middle font-mono">
                                {noSertif}
                              </td>
                              <td className="py-3 pr-4 align-middle font-medium">
                                {r.student_name}
                              </td>
                              <td className="py-3 pr-4 align-middle">
                                {r.final_score}
                              </td>
                              <td className="py-3 pr-4 align-middle">
                                <div className="flex items-center gap-2">
                                  {/* <Badge
                                    palette={palette}
                                    variant={lulus ? "success" : "outline"}
                                  >
                                    {lulus ? "Lulus" : "Belum"}
                                  </Badge> */}
                                  {r.published ? (
                                    <Badge palette={palette} variant="success">
                                      Terbit
                                    </Badge>
                                  ) : (
                                    <Badge palette={palette} variant="warning">
                                      Draft
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 pr-2 align-middle">
                                <div className="flex justify-end gap-1.5">
                                  {/* publish / revoke (ikon saja) */}
                                  {r.published ? (
                                    <IconBtn
                                      title="Cabut sertifikat"
                                      palette={palette}
                                      onClick={() =>
                                        revokeOneMut.mutate({
                                          class_id: selectedClass.id,
                                          student_id: r.id,
                                        })
                                      }
                                      disabled={revokeOneMut.isPending}
                                    >
                                      <XCircle
                                        size={18}
                                        style={{ color: palette.error1 }}
                                      />
                                    </IconBtn>
                                  ) : (
                                    <IconBtn
                                      title="Terbitkan sertifikat"
                                      palette={palette}
                                      onClick={() =>
                                        publishOneMut.mutate({
                                          class_id: selectedClass.id,
                                          student_id: r.id,
                                        })
                                      }
                                      disabled={publishOneMut.isPending}
                                    >
                                      <CheckCircle2
                                        size={18}
                                        style={{ color: palette.success1 }}
                                      />
                                    </IconBtn>
                                  )}

                                  {/* view / print / pdf (ikon saja) */}
                                  <IconBtn
                                    title="Lihat"
                                    palette={palette}
                                    onClick={() =>
                                      navigate(
                                        `detail/${selectedClass.id}/${r.id}`
                                      )
                                    }
                                  >
                                    <Eye
                                      size={18}
                                      style={{ color: palette.primary }}
                                    />
                                  </IconBtn>
                                  {/* <IconBtn
                                    title="Cetak"
                                    palette={palette}
                                    onClick={() => printOne(r.id)}
                                  >
                                    <Printer
                                      size={18}
                                      style={{ color: palette.primary }}
                                    />
                                  </IconBtn>
                                  <IconBtn
                                    title="Unduh PDF"
                                    palette={palette}
                                    onClick={() => exportOnePdf(r.id)}
                                  >
                                    <Download
                                      size={18}
                                      style={{ color: palette.primary }}
                                    />
                                  </IconBtn> */}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  <div
                    className="pt-3 text-xs flex items-center justify-between"
                    style={{ color: palette.silver2 }}
                  >
                    <div>
                      Menampilkan {recipients.length} siswa • Jenis Sertifikat:{" "}
                      {certType} • Ambang Lulus: {PASS}
                    </div>
                    {selectedIds.size > 0 && (
                      <div>{selectedIds.size} dipilih</div>
                    )}
                  </div>
                </div>
              </SectionCard>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default SchoolCertificate;

/* ================= Small UI helpers ================= */
function KpiTile({
  palette,
  label,
  value,
  icon,
  tone,
}: {
  palette: Palette;
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  tone?: "success" | "warning" | "danger";
}) {
  const toneBg =
    tone === "success"
      ? "#DCFCE7"
      : tone === "warning"
        ? "#FEF3C7"
        : tone === "danger"
          ? "#FEE2E2"
          : undefined;
  return (
    <SectionCard palette={palette}>
      <div className="p-4 md:p-5 flex items-center gap-3">
        <span
          className="h-10 w-10 grid place-items-center rounded-xl"
          style={{
            background: toneBg ?? palette.primary2,
            color: palette.primary,
          }}
        >
          {icon ?? <Award size={18} />}
        </span>
        <div>
          <div className="text-xs" style={{ color: palette.black2 }}>
            {label}
          </div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
    </SectionCard>
  );
}
