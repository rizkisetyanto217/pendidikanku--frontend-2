// src/pages/sekolahislamku/school/SchoolProfile.tsx
import React, { useEffect, useMemo, useState } from "react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useNavigate } from "react-router-dom";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import {
  Building2,
  Award,
  MapPin,
  Phone,
  Mail,
  Globe,
  UserCog,
  ExternalLink,
  Navigation,
  Image as ImageIcon,
  X,
  ArrowLeft,
} from "lucide-react";

/* ================= Helpers ================= */
const topbarDateFmt = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

const toLocalNoonISO = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x.toISOString();
};

const fullAddress = (p?: SchoolProfileForm["address"]) => {
  if (!p) return "-";
  const parts = [
    p.line,
    p.village,
    p.district,
    p.city,
    p.province,
    p.postal,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "-";
};

const isoToYmd = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");
const ymdToIsoUTC = (ymd: string | null | undefined) =>
  ymd ? new Date(`${ymd}T00:00:00.000Z`).toISOString() : null;

/* ================= Types ================= */
export type SchoolProfileForm = {
  name: string;
  npsn?: string | null;
  accreditation?: "A" | "B" | "C" | "-" | "" | null;
  foundedAt?: string | null; // ISO

  address?: {
    line?: string | null;
    village?: string | null;
    district?: string | null;
    city?: string | null;
    province?: string | null;
    postal?: string | null;
  };

  contact?: {
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  };

  headmaster?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  };

  vision?: string | null;
  mission?: string[] | null;
  logoUrl?: string | null;

  mapEmbedUrl?: string | null;
  gallery?: Array<{ id: string; url: string; caption?: string }>;
};
type SchoolProfileProps = {
  showBack?: boolean; // default: false
  backTo?: string; // optional: kalau diisi, navigate ke path ini, kalau tidak pakai nav(-1)
  backLabel?: string; // teks tombol
};

/* ================= Page ================= */
const SchoolProfile: React.FC<SchoolProfileProps> = ({
  showBack = false,
  backTo,
  backLabel = "Kembali",
}) => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const navigate = useNavigate();
  const handleBack = () => {
    if (backTo) navigate(backTo);
    else navigate(-1);
  };

  // ------ DATA DUMMY disimpan di state ------
  const [data, setData] = useState<SchoolProfileForm>({
    name: "Sekolah Islamku",
    npsn: "20251234",
    accreditation: "A",
    foundedAt: "2010-07-01T00:00:00.000Z",
    address: {
      line: "Jl. Cendekia No. 10",
      village: "Mekarjaya",
      district: "Cibeunying",
      city: "Bandung",
      province: "Jawa Barat",
      postal: "40111",
    },
    contact: {
      phone: "0812-3456-7890",
      email: "info@sekolahislamku.sch.id",
      website: "https://sekolahislamku.sch.id",
    },
    headmaster: {
      name: "Ust. Ahmad Fulan, S.Pd",
      phone: "0812-1111-2222",
      email: "ahmad@sekolahislamku.sch.id",
    },
    vision:
      "Mewujudkan generasi berakhlak mulia, berilmu, dan berdaya saing global.",
    mission: [
      "Pendidikan berlandaskan Al-Qur'an dan Sunnah.",
      "Mengembangkan karakter berakhlak mulia.",
    ],
    logoUrl: null,
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.1804!2d110.370!3d-7.867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNTInMDAuMCJTIDExMMKwMjInMTIuMCJF!5e0!3m2!1sen!2sid!4v1690000000000",
    gallery: [
      {
        id: "g1",
        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop",
        caption: "Perpustakaan",
      },
      {
        id: "g2",
        url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop",
        caption: "Lapangan",
      },
      {
        id: "g3",
        url: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop",
        caption: "Kelas",
      },
    ],
  });

  const [editOpen, setEditOpen] = useState(false);

  const nowISO = toLocalNoonISO(new Date());
  const foundedYear = useMemo(() => {
    if (!data?.foundedAt) return "-";
    const d = new Date(data.foundedAt);
    return Number.isNaN(d.getTime()) ? "-" : d.getFullYear();
  }, [data?.foundedAt]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Profil Sekolah"
        gregorianDate={nowISO}
        dateFmt={topbarDateFmt}
      />

      <main className="mx-auto  px-7 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6">
          {/* Sidebar - hidden on mobile, show on tablet+ */}
          <aside className="hidden lg:block lg:col-span-2">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main Content */}
          <section className="lg:col-span-10 space-y-5 md:space-y-6 min-w-0">
            {/* Header Section */}
            <div className="flex gap-3 items-center">
              {showBack && (
                <Btn
                  palette={palette}
                  onClick={handleBack}
                  className="cursor-pointer self-start"
                  variant="ghost"
                >
                  <ArrowLeft size={20} />
                </Btn>
              )}
              <h1 className="font-semibold text-lg md:text-xl">
                Identitas Sekolah
              </h1>
            </div>

            {/* Header Card - Responsive Layout */}
            <SectionCard palette={palette} className="overflow-hidden ">
              <div className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Logo */}
                  <div
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl grid place-items-center overflow-hidden border shrink-0 mx-auto sm:mx-0"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white1,
                    }}
                  >
                    {data?.logoUrl ? (
                      <img
                        src={data.logoUrl}
                        alt="Logo Sekolah"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 size={28} style={{ color: palette.black1 }} />
                    )}
                  </div>

                  {/* Info Sekolah */}
                  <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left">
                    {/* Nama Sekolah */}
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-tight">
                      {data?.name ?? "Sekolah"}
                    </h1>

                    {/* Badges - Stack on mobile, row on tablet+ */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center sm:justify-start">
                      {data?.accreditation && (
                        <Badge palette={palette} variant="success">
                          Akreditasi {data.accreditation}
                        </Badge>
                      )}
                      <Badge palette={palette} variant="outline">
                        Berdiri {foundedYear}
                      </Badge>
                    </div>

                    {/* NPSN & Alamat */}
                    <div className="space-y-2">
                      {data?.npsn && (
                        <div className="flex justify-center sm:justify-start">
                          <Badge palette={palette} variant="outline">
                            <span style={{ color: palette.black2 }}>
                              NPSN: {data.npsn}
                            </span>
                          </Badge>
                        </div>
                      )}
                      <div
                        className="text-sm flex items-start justify-center sm:justify-start gap-1"
                        style={{ color: palette.black2 }}
                      >
                        <MapPin size={14} className="mt-0.5 shrink-0" />
                        <span className="text-center sm:text-left leading-relaxed">
                          {fullAddress(data?.address)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Kontak & Kepala Sekolah - Stack on mobile */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <SectionCard palette={palette} className="p-4 md:p-6">
                <div className="font-semibold mb-4 flex items-center gap-2">
                  <Phone size={18} />
                  Kontak Sekolah
                </div>
                <div
                  className="space-y-3 text-sm"
                  style={{ color: palette.black2 }}
                >
                  <InfoRow
                    palette={palette}
                    icon={<Phone size={16} />}
                    label="Telepon"
                    value={data?.contact?.phone ?? "-"}
                  />
                  <InfoRow
                    palette={palette}
                    icon={<Mail size={16} />}
                    label="Email"
                    value={data?.contact?.email ?? "-"}
                  />
                  <InfoRow
                    palette={palette}
                    icon={<Globe size={16} />}
                    label="Website"
                    value={
                      data?.contact?.website ? (
                        <a
                          href={data.contact.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 underline break-all"
                          style={{ color: palette.primary }}
                        >
                          {data.contact.website}{" "}
                          <ExternalLink size={12} className="shrink-0" />
                        </a>
                      ) : (
                        "-"
                      )
                    }
                  />
                </div>
              </SectionCard>

              <SectionCard palette={palette} className="p-4 md:p-6">
                <div className="font-semibold mb-4 flex items-center gap-2">
                  <Award size={18} />
                  Kepala Sekolah
                </div>
                <div
                  className="space-y-3 text-sm"
                  style={{ color: palette.black2 }}
                >
                  <InfoRow
                    icon={<UserCog size={16} />}
                    label="Nama"
                    palette={palette}
                    value={data?.headmaster?.name ?? "-"}
                  />
                  <InfoRow
                    palette={palette}
                    icon={<Phone size={16} />}
                    label="Kontak"
                    value={data?.headmaster?.phone ?? "-"}
                  />
                  <InfoRow
                    palette={palette}
                    icon={<Mail size={16} />}
                    label="Email"
                    value={data?.headmaster?.email ?? "-"}
                  />
                </div>
              </SectionCard>
            </section>

            {/* Visi & Misi - Stack on mobile */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <SectionCard palette={palette} className="p-4 md:p-6">
                <div className="font-semibold mb-4">Visi</div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: palette.black2 }}
                >
                  {data?.vision ?? "-"}
                </p>
              </SectionCard>

              <SectionCard palette={palette} className="p-4 md:p-6">
                <div className="font-semibold mb-4">Misi</div>
                {data?.mission?.length ? (
                  <ul
                    className="list-disc pl-5 space-y-2 text-sm leading-relaxed"
                    style={{ color: palette.black2 }}
                  >
                    {data.mission.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm" style={{ color: palette.black2 }}>
                    -
                  </div>
                )}
              </SectionCard>
            </section>

            {/* Peta & Galeri - Stack on mobile */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <SectionCard palette={palette} className="p-4 md:p-6">
                <div className="font-semibold mb-4 flex items-center gap-2">
                  <Navigation size={18} />
                  Lokasi
                </div>
                {data?.mapEmbedUrl ? (
                  <div
                    className="rounded-xl overflow-hidden border"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <iframe
                      src={data.mapEmbedUrl}
                      title="Peta Sekolah"
                      width="100%"
                      height="220"
                      className="md:h-64"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <EmptyBlock
                    palette={palette}
                    icon={<Navigation />}
                    text="Belum ada peta."
                  />
                )}
              </SectionCard>

              <SectionCard palette={palette} className="p-4 md:p-6">
                <div className="font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon size={18} />
                  Galeri
                </div>
                {data?.gallery && data.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 md:gap-3">
                    {data.gallery.slice(0, 6).map((g) => (
                      <figure
                        key={g.id}
                        className="rounded-lg overflow-hidden border"
                        style={{ borderColor: palette.black2 }}
                      >
                        <img
                          src={g.url}
                          alt={g.caption ?? "Foto"}
                          className="w-full h-24 sm:h-32 lg:h-28 object-cover"
                          loading="lazy"
                        />
                        {g.caption && (
                          <figcaption
                            className="px-2 py-1 text-xs truncate"
                            style={{ color: palette.black2 }}
                            title={g.caption}
                          >
                            {g.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                ) : (
                  <EmptyBlock
                    palette={palette}
                    icon={<ImageIcon />}
                    text="Belum ada foto."
                  />
                )}
              </SectionCard>
            </section>

            {/* Actions - Responsive button */}
            <div className="flex items-center justify-center sm:justify-end">
              <Btn
                palette={palette}
                variant="outline"
                onClick={() => setEditOpen(true)}
                className="w-full sm:w-auto"
              >
                Edit Profil
              </Btn>
            </div>
          </section>
        </div>
      </main>

      {/* ===== Modal Edit Profil ===== */}
      <ModalEditProfilSchool
        open={editOpen}
        onClose={() => setEditOpen(false)}
        palette={palette}
        initial={data}
        onSubmit={(v) => {
          // di sini nanti ganti ke PUT API; untuk sekarang update state lokal
          setData(v);
          setEditOpen(false);
        }}
      />
    </div>
  );
};

export default SchoolProfile;

/* =============== Small UI =============== */
function InfoRow({
  icon,
  label,
  palette,
  value,
}: {
  palette: Palette;
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1" style={{ color: palette.black2 }}>
        <div className="text-xs opacity-90 mb-1">
          <p style={{ color: palette.black2 }}>{label}</p>
        </div>
        <div className="text-sm break-words leading-relaxed">{value}</div>
      </div>
    </div>
  );
}

function EmptyBlock({
  palette,
  icon,
  text,
}: {
  palette: Palette;
  icon?: React.ReactNode;
  text: string;
}) {
  return (
    <div
      className="rounded-xl border p-6 text-sm flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left"
      style={{ borderColor: palette.silver1, color: palette.black2 }}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}

/* =========================================================
   ModalEditProfilSchool - REFACTORED with better mobile responsiveness
   ========================================================= */
function ModalEditProfilSchool({
  open,
  onClose,
  palette,
  initial,
  onSubmit,
  saving = false,
  error = null,
}: {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  initial: SchoolProfileForm;
  onSubmit: (v: SchoolProfileForm) => void | Promise<void>;
  saving?: boolean;
  error?: string | null;
}) {
  const [form, setForm] = useState<SchoolProfileForm>(initial);
  const [missionText, setMissionText] = useState(
    (initial.mission ?? []).join("\n")
  );

  useEffect(() => {
    if (!open) return;
    setForm(initial);
    setMissionText((initial.mission ?? []).join("\n"));

    // lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, initial]);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSubmit = !!form.name && !saving;

  const set = <K extends keyof SchoolProfileForm>(
    k: K,
    v: SchoolProfileForm[K]
  ) => setForm((s) => ({ ...s, [k]: v }));

  const setAddr = <K extends keyof NonNullable<SchoolProfileForm["address"]>>(
    k: K,
    v: NonNullable<SchoolProfileForm["address"]>[K]
  ) => setForm((s) => ({ ...s, address: { ...(s.address ?? {}), [k]: v } }));

  const setContact = <
    K extends keyof NonNullable<SchoolProfileForm["contact"]>,
  >(
    k: K,
    v: NonNullable<SchoolProfileForm["contact"]>[K]
  ) => setForm((s) => ({ ...s, contact: { ...(s.contact ?? {}), [k]: v } }));

  const setHead = <
    K extends keyof NonNullable<SchoolProfileForm["headmaster"]>,
  >(
    k: K,
    v: NonNullable<SchoolProfileForm["headmaster"]>[K]
  ) =>
    setForm((s) => ({ ...s, headmaster: { ...(s.headmaster ?? {}), [k]: v } }));

  const missionsFromText = (s: string) =>
    s
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4"
      style={{ background: "rgba(0,0,0,.4)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <SectionCard
        palette={palette}
        className="w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl shadow-2xl flex flex-col mx-2 sm:mx-4"
        style={{ background: palette.white1, color: palette.black1 }}
      >
        {/* Header */}
        <div
          className="px-4 sm:px-6 py-4 flex items-center justify-between border-b shrink-0"
          style={{ borderColor: palette.silver1 }}
        >
          <div className="flex items-center gap-3">
            <Building2 size={20} color={palette.quaternary} />
            <h2 className="text-lg sm:text-xl font-semibold">
              Edit Profil Sekolah
            </h2>
          </div>
          <button
            aria-label="Tutup"
            onClick={onClose}
            className="h-10 w-10 grid place-items-center rounded-full hover:bg-black hover:bg-opacity-5 transition-colors"
            style={{
              border: `1px solid ${palette.silver1}`,
              background: palette.white2,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="space-y-6 sm:space-y-8">
            {!!error && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{ background: palette.error2, color: palette.error1 }}
              >
                {error}
              </div>
            )}

            {/* Identitas Sekolah */}
            <section>
              <BlockTitle title="Identitas Sekolah" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldText
                  label="Nama Sekolah"
                  value={form.name}
                  onChange={(v) => set("name", v)}
                  palette={palette}
                  required
                />
                <FieldText
                  label="NPSN"
                  value={form.npsn ?? ""}
                  onChange={(v) => set("npsn", v)}
                  palette={palette}
                />
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Akreditasi</label>
                  <select
                    value={form.accreditation ?? ""}
                    onChange={(e) =>
                      set("accreditation", (e.target.value || null) as any)
                    }
                    className="w-full rounded-xl px-3 py-2.5 border outline-none focus:ring-2 focus:ring-opacity-20 transition-all"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white2,
                    }}
                  >
                    <option value="">—</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="-">-</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Tanggal Berdiri</label>
                  <input
                    type="date"
                    value={isoToYmd(form.foundedAt)}
                    onChange={(e) =>
                      set("foundedAt", ymdToIsoUTC(e.target.value))
                    }
                    className="w-full rounded-xl px-3 py-2.5 border outline-none focus:ring-2 focus:ring-opacity-20 transition-all"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white2,
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Alamat */}
            <section>
              <BlockTitle title="Alamat" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FieldText
                    label="Alamat"
                    value={form.address?.line ?? ""}
                    onChange={(v) => setAddr("line", v)}
                    palette={palette}
                  />
                </div>
                <FieldText
                  label="Kelurahan / Desa"
                  value={form.address?.village ?? ""}
                  onChange={(v) => setAddr("village", v)}
                  palette={palette}
                />
                <FieldText
                  label="Kecamatan"
                  value={form.address?.district ?? ""}
                  onChange={(v) => setAddr("district", v)}
                  palette={palette}
                />
                <FieldText
                  label="Kota / Kabupaten"
                  value={form.address?.city ?? ""}
                  onChange={(v) => setAddr("city", v)}
                  palette={palette}
                />
                <FieldText
                  label="Provinsi"
                  value={form.address?.province ?? ""}
                  onChange={(v) => setAddr("province", v)}
                  palette={palette}
                />
                <FieldText
                  label="Kode Pos"
                  value={form.address?.postal ?? ""}
                  onChange={(v) => setAddr("postal", v)}
                  palette={palette}
                />
              </div>
            </section>

            {/* Kontak */}
            <section>
              <BlockTitle title="Kontak" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldText
                  label="Telepon"
                  value={form.contact?.phone ?? ""}
                  onChange={(v) => setContact("phone", v)}
                  palette={palette}
                />
                <FieldText
                  label="Email"
                  value={form.contact?.email ?? ""}
                  onChange={(v) => setContact("email", v)}
                  palette={palette}
                />
                <div className="sm:col-span-2">
                  <FieldText
                    label="Website"
                    value={form.contact?.website ?? ""}
                    onChange={(v) => setContact("website", v)}
                    palette={palette}
                    placeholder="https://…"
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldText
                    label="URL Logo (opsional)"
                    value={form.logoUrl ?? ""}
                    onChange={(v) => set("logoUrl", v)}
                    palette={palette}
                  />
                </div>
              </div>
            </section>

            {/* Kepala Sekolah */}
            <section>
              <BlockTitle title="Kepala Sekolah" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FieldText
                    label="Nama"
                    value={form.headmaster?.name ?? ""}
                    onChange={(v) => setHead("name", v)}
                    palette={palette}
                  />
                </div>
                <FieldText
                  label="Telepon"
                  value={form.headmaster?.phone ?? ""}
                  onChange={(v) => setHead("phone", v)}
                  palette={palette}
                />
                <FieldText
                  label="Email"
                  value={form.headmaster?.email ?? ""}
                  onChange={(v) => setHead("email", v)}
                  palette={palette}
                />
              </div>
            </section>

            {/* Visi & Misi */}
            <section>
              <BlockTitle title="Visi & Misi" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Visi</label>
                  <textarea
                    rows={5}
                    value={form.vision ?? ""}
                    onChange={(e) => set("vision", e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 border outline-none focus:ring-2 focus:ring-opacity-20 transition-all resize-none"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white2,
                    }}
                    placeholder="Tulis visi sekolah…"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Misi (satu baris satu poin)
                  </label>
                  <textarea
                    rows={5}
                    value={missionText}
                    onChange={(e) => setMissionText(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 border outline-none focus:ring-2 focus:ring-opacity-20 transition-all resize-none"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white2,
                    }}
                    placeholder={"Tulis misi 1\nTulis misi 2\n…"}
                  />
                </div>
              </div>
            </section>

            <div className="h-4" />
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t shrink-0"
          style={{ borderColor: palette.silver1 }}
        >
          <Btn
            palette={palette}
            variant="ghost"
            onClick={onClose}
            disabled={saving}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Batal
          </Btn>
          <Btn
            palette={palette}
            disabled={!canSubmit}
            onClick={() =>
              onSubmit({
                ...form,
                // normalisasi nilai kosong agar konsisten
                npsn: form.npsn?.trim() || null,
                vision: (form.vision?.trim() || null) as string | null,
                mission: missionsFromText(missionText),
              })
            }
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </Btn>
        </div>
      </SectionCard>
    </div>
  );
}

/* ---- sub-komponen kecil untuk modal ---- */
function FieldText({
  label,
  value,
  onChange,
  palette,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  palette: Palette;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-3 py-2.5 border outline-none focus:ring-2 focus:ring-opacity-20 transition-all"
        style={{ borderColor: palette.silver1, background: palette.white2 }}
      />
    </div>
  );
}

function BlockTitle({ title }: { title: string }) {
  return <div className="font-semibold text-base opacity-90 mb-4">{title}</div>;
}
