import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Building2 } from "lucide-react";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

/* ===================== Types ===================== */
export type SchoolProfileForm = {
  name: string;
  npsn?: string | null;
  accreditation?: "A" | "B" | "C" | "-" | "" | null;
  foundedAt?: string | null;
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
};

type Props = {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  initial: SchoolProfileForm;
  onSubmit: (v: SchoolProfileForm) => void | Promise<void>;
  saving?: boolean;
  error?: string | null;
};

/* ===================== Utils ===================== */
const toInputDate = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");
const strToLines = (s: string) =>
  s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
const linesToStr = (arr?: string[] | null) =>
  arr?.length ? arr.join("\n") : "";

/* ===================== Small UI ===================== */
const BlockTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="font-semibold text-base opacity-90 mb-3">{children}</div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-sm font-medium">{children}</label>
);

const FieldWrap = ({ children }: { children: React.ReactNode }) => (
  <div className="grid gap-2">{children}</div>
);

function FieldText({
  label,
  value,
  onChange,
  palette,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  palette: Palette;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  required?: boolean;
}) {
  return (
    <FieldWrap>
      <FieldLabel>
        {label} {required ? <span className="text-red-500">*</span> : null}
      </FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border outline-none focus:ring-2 transition-all"
        style={{
          paddingLeft: "1rem",
          paddingRight: "1rem",
          paddingTop: ".625rem",
          paddingBottom: ".625rem",
          borderColor: palette.silver1,
          background: palette.white2,
        }}
      />
    </FieldWrap>
  );
}

function FieldTextarea({
  label,
  value,
  onChange,
  palette,
  rows = 5,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  palette: Palette;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <FieldWrap>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border outline-none focus:ring-2 transition-all resize-none 
        "
        style={{
          paddingLeft: "1rem",
          paddingRight: "1rem",
          paddingTop: ".625rem",
          paddingBottom: ".625rem",
          borderColor: palette.silver1,
          background: palette.white2,
        }}
        placeholder={placeholder}
      />
    </FieldWrap>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  palette,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  palette: Palette;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">{label}</label>

      {/* wrapper untuk arrow & spacing */}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          // Padding kiri/kanan BESAR supaya tidak mepet
          className="w-full rounded-xl border outline-none focus:ring-2 transition-all pl-4 pr-12 py-2.5 min-h-[44px] appearance-none"
          style={{
            borderColor: palette.silver1,
            background: palette.white2,
          }}
        >
          {children}
        </select>

        {/* Arrow custom absolut, tidak ikut mengurangi padding select */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm"
          style={{ color: palette.silver2 }}
        >
          ▼
        </span>
      </div>
    </div>
  );
}


/* ===================== Modal ===================== */
export default function ModalEditProfilSchool({
  open,
  onClose,
  palette,
  initial,
  onSubmit,
  saving = false,
  error = null,
}: Props) {
  const [form, setForm] = useState<SchoolProfileForm>(initial);
  const [missionText, setMissionText] = useState(linesToStr(initial.mission));
  const canSubmit = useMemo(() => !!form.name && !saving, [form.name, saving]);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(initial);
    setMissionText(linesToStr(initial.mission));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.4)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="school-edit-title"
    >
      <SectionCard
        palette={palette}
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col"
        style={{ background: palette.white1, color: palette.black1 }}
      >
        {/* Header (sticky) */}
        <div
          className="px-6 py-4 flex items-center justify-between border-b shrink-0"
          style={{ borderColor: palette.silver1, background: palette.white1 }}
        >
          <div className="flex items-center gap-3">
            <Building2 size={20} color={palette.quaternary} />
            <h2 id="school-edit-title" className="text-lg font-semibold">
              Edit Profil Sekolah
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            aria-label="Tutup"
            onClick={onClose}
            className="h-10 w-10 grid place-items-center rounded-full hover:bg-opacity-10 hover:bg-black transition-colors"
            style={{
              border: `1px solid ${palette.silver1}`,
              background: palette.white2,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div
          className="flex-1 overflow-y-auto px-6 py-6"
          style={{ scrollBehavior: "smooth" }}
        >
          <div className="space-y-8">
            {!!error && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{ background: palette.error2, color: palette.error1 }}
              >
                {error}
              </div>
            )}

            {/* Identitas */}
            <section>
              <BlockTitle>Identitas Sekolah</BlockTitle>
              <div className="grid md:grid-cols-2 gap-4">
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
                <FieldSelect
                  label="Akreditasi"
                  value={form.accreditation ?? ""}
                  onChange={(v) => set("accreditation", (v || null) as any)}
                  palette={palette}
                >
                  <option value="">—</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="-">-</option>
                </FieldSelect>
                <FieldText
                  label="Tahun Berdiri"
                  value={toInputDate(form.foundedAt)}
                  onChange={(v) => set("foundedAt", v)}
                  palette={palette}
                  type="date"
                />
              </div>
            </section>

            {/* Alamat */}
            <section>
              <BlockTitle>Alamat</BlockTitle>
              <div className="grid md:grid-cols-2 gap-4">
                <FieldText
                  label="Alamat"
                  value={form.address?.line ?? ""}
                  onChange={(v) => setAddr("line", v)}
                  palette={palette}
                />
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
              <BlockTitle>Kontak</BlockTitle>
              <div className="grid md:grid-cols-2 gap-4">
                <FieldText
                  label="Telepon"
                  value={form.contact?.phone ?? ""}
                  onChange={(v) => setContact("phone", v)}
                  palette={palette}
                />
                <FieldText
                  label="Email"
                  type="email"
                  value={form.contact?.email ?? ""}
                  onChange={(v) => setContact("email", v)}
                  palette={palette}
                />
                <FieldText
                  label="Website"
                  value={form.contact?.website ?? ""}
                  onChange={(v) => setContact("website", v)}
                  palette={palette}
                  placeholder="https://…"
                />
                <FieldText
                  label="URL Logo (opsional)"
                  value={form.logoUrl ?? ""}
                  onChange={(v) => set("logoUrl", v)}
                  palette={palette}
                />
              </div>
            </section>

            {/* Kepala Sekolah */}
            <section>
              <BlockTitle>Kepala Sekolah</BlockTitle>
              <div className="grid md:grid-cols-2 gap-4">
                <FieldText
                  label="Nama"
                  value={form.headmaster?.name ?? ""}
                  onChange={(v) => setHead("name", v)}
                  palette={palette}
                />
                <FieldText
                  label="Telepon"
                  value={form.headmaster?.phone ?? ""}
                  onChange={(v) => setHead("phone", v)}
                  palette={palette}
                />
                <FieldText
                  label="Email"
                  type="email"
                  value={form.headmaster?.email ?? ""}
                  onChange={(v) => setHead("email", v)}
                  palette={palette}
                />
              </div>
            </section>

            {/* Visi & Misi */}
            <section>
              <BlockTitle>Visi & Misi</BlockTitle>
              <div className="grid md:grid-cols-2 gap-4">
                <FieldTextarea
                  label="Visi"
                  value={form.vision ?? ""}
                  onChange={(v) => set("vision", v)}
                  palette={palette}
                  placeholder="Tulis visi sekolah…"
                />
                <FieldTextarea
                  label="Misi (satu baris satu poin)"
                  value={missionText}
                  onChange={setMissionText}
                  palette={palette}
                  placeholder={"Tulis misi 1\nTulis misi 2\n…"}
                />
              </div>
            </section>
          </div>
        </div>

        {/* Footer (sticky) */}
        <div
          className="px-6 py-4 flex items-center justify-end gap-3 border-t shrink-0"
          style={{ borderColor: palette.silver1, background: palette.white1 }}
        >
          <Btn
            palette={palette}
            variant="ghost"
            onClick={onClose}
            disabled={saving}
            className="px-6"
          >
            Batal
          </Btn>
          <Btn
            palette={palette}
            disabled={!canSubmit}
            onClick={() =>
              onSubmit({
                ...form,
                mission: strToLines(missionText),
              })
            }
            className="px-6"
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </Btn>
        </div>
      </SectionCard>
    </div>
  );
}
