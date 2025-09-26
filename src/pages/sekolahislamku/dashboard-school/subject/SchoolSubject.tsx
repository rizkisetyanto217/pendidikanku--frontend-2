// src/pages/sekolahislamku/pages/academic/SchoolSubject.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// Theme & utils
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import axios from "@/lib/axios";

// UI
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
  LibraryBig,
  Filter as FilterIcon,
  RefreshCcw,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
} from "lucide-react";

/* ================= Types ================= */
export type SubjectStatus = "active" | "inactive";
export type SubjectRow = {
  id: string;
  code: string;
  name: string;
  level?: string;
  hours_per_week?: number;
  teacher_name?: string;
  status: SubjectStatus;
};
type ApiSubjectsResp = {
  list: SubjectRow[];
  levels?: string[];
};

/* ================== Utils ================== */
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

/* ================= Modal Form ================= */
function SubjectFormModal({
  open,
  palette,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  palette: Palette;
  onClose: () => void;
  initial?: SubjectRow | null;
  onSave: (v: SubjectRow) => void;
}) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState<SubjectRow>({
    id: "",
    code: "",
    name: "",
    level: "",
    hours_per_week: 0,
    teacher_name: "",
    status: "active",
  });

  useEffect(() => {
    if (initial) setForm(initial);
    else
      setForm({
        id: "",
        code: "",
        name: "",
        level: "",
        hours_per_week: 0,
        teacher_name: "",
        status: "active",
      });
  }, [initial, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.35)" }}
    >
      <SectionCard
        palette={palette}
        className="w-full max-w-lg flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">
            {isEdit ? "Edit Mapel" : "Tambah Mapel"}
          </h3>
          <button onClick={onClose} className="p-1">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-h-[70vh]">
          <Field
            label="Kode"
            value={form.code}
            onChange={(v) => setForm({ ...form, code: v })}
          />
          <Field
            label="Nama Mapel"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
          />
          <Field
            label="Level"
            value={form.level || ""}
            onChange={(v) => setForm({ ...form, level: v })}
          />
          <Field
            label="Jam / Minggu"
            type="number"
            value={String(form.hours_per_week ?? 0)}
            onChange={(v) => setForm({ ...form, hours_per_week: Number(v) })}
          />
          <Field
            label="Pengampu"
            value={form.teacher_name || ""}
            onChange={(v) => setForm({ ...form, teacher_name: v })}
          />

          {/* Status */}
          <div>
            <label className="text-xs">Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as SubjectStatus })
              }
              className="w-full rounded-lg border px-2 py-2 text-sm"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 flex items-center justify-end gap-2 border-t">
          <Btn palette={palette} variant="ghost" onClick={onClose}>
            Batal
          </Btn>
          <Btn
            palette={palette}
            onClick={() =>
              onSave({
                ...form,
                id: isEdit ? form.id : `sub-${Date.now()}`,
              })
            }
          >
            {isEdit ? "Simpan" : "Tambah"}
          </Btn>
        </div>
      </SectionCard>
    </div>
  );
}

/* ================= Modal Detail ================= */
function SubjectDetailModal({
  open,
  palette,
  subject,
  onClose,
}: {
  open: boolean;
  palette: Palette;
  subject: SubjectRow | null;
  onClose: () => void;
}) {
  if (!open || !subject) return null;
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.35)" }}
    >
      <SectionCard
        palette={palette}
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Detail Mapel</h3>
          <button onClick={onClose} className="p-1">
            <X size={18} />
          </button>
        </div>
        <div className="px-4 py-4 space-y-2 text-sm">
          <InfoRow label="Kode" value={subject.code} />
          <InfoRow label="Nama" value={subject.name} />
          <InfoRow label="Level" value={subject.level ?? "-"} />
          <InfoRow label="Jam/Minggu" value={subject.hours_per_week ?? "-"} />
          <InfoRow label="Pengampu" value={subject.teacher_name ?? "-"} />
          <InfoRow
            label="Status"
            value={subject.status === "active" ? "Aktif" : "Nonaktif"}
          />
        </div>
      </SectionCard>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b py-1 text-sm">
      <span className="opacity-70">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
    </div>
  );
}

/* ================== Page ================== */
const SchoolSubject: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const gregorianISO = toLocalNoonISO(new Date());

  // State modal
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState<SubjectRow | null>(null);
  const [detailData, setDetailData] = useState<SubjectRow | null>(null);
  const [rows, setRows] = useState<SubjectRow[]>([]);

  // Dummy load
  const subjectsQ = useQuery<ApiSubjectsResp>({
    queryKey: ["subjects"],
    queryFn: async () => {
      const dummy: ApiSubjectsResp = {
        list: [
          { id: "1", code: "SBJ01", name: "Matematika", status: "active" },
          {
            id: "2",
            code: "SBJ02",
            name: "Bahasa Indonesia",
            status: "inactive",
          },
        ],
      };
      return dummy;
    },
  });

  useEffect(() => {
    if (subjectsQ.data) {
      setRows(subjectsQ.data.list);
    }
  }, [subjectsQ.data]);

  // Handlers
  const handleSave = (subject: SubjectRow) => {
    setRows((prev) => {
      const exists = prev.find((x) => x.id === subject.id);
      if (exists) return prev.map((x) => (x.id === subject.id ? subject : x));
      return [...prev, subject];
    });
    setOpenForm(false);
    setEditData(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Yakin hapus mapel ini?")) return;
    setRows((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="min-h-screen w-full" style={{ background: palette.white2 }}>
      <ParentTopBar
        palette={palette}
        title="Mata Pelajaran"
        gregorianDate={gregorianISO}
        hijriDate={hijriLong(gregorianISO)}
        dateFmt={dateLong}
        showBack
      />

      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <section className="flex-1 flex flex-col space-y-6">
            {/* Toolbar */}

            <div className=" flex items-center justify-between">
              <div className="  md:flex hidden items-center gap-3">
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="cursor-pointer" size={20} />
                </Btn>

                <h1 className="font-semibold text-lg">Daftar Pelajaran</h1>
              </div>
              <Btn
                palette={palette}
                size="sm"
                className="gap-1"
                onClick={() => setOpenForm(true)}
              >
                <Plus size={16} /> Tambah
              </Btn>
            </div>

            {/* Table */}
            <SectionCard palette={palette}>
              <div className="overflow-x-auto px-4 pb-4">
                <table className="w-full text-sm min-w-[820px]">
                  <thead style={{ color: palette.silver2 }}>
                    <tr
                      className="border-b"
                      style={{ borderColor: palette.silver1 }}
                    >
                      <th className="py-2 pr-3">Kode</th>
                      <th className="py-2 pr-3">Nama</th>
                      <th className="py-2 pr-3">Level</th>
                      <th className="py-2 pr-3">Jam/Minggu</th>
                      <th className="py-2 pr-3">Pengampu</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b"
                        style={{ borderColor: palette.silver1 }}
                      >
                        <td className="py-2 pr-3">{r.code}</td>
                        <td className="py-2 pr-3">{r.name}</td>
                        <td className="py-2 pr-3">{r.level}</td>
                        <td className="py-2 pr-3">{r.hours_per_week}</td>
                        <td className="py-2 pr-3">{r.teacher_name}</td>
                        <td className="py-2 pr-3">
                          <Badge
                            palette={palette}
                            variant={
                              r.status === "active" ? "success" : "outline"
                            }
                          >
                            {r.status === "active" ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Btn
                              palette={palette}
                              size="sm"
                              variant="outline"
                              onClick={() => setDetailData(r)}
                            >
                              <Eye size={14} />
                            </Btn>
                            <Btn
                              palette={palette}
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditData(r);
                                setOpenForm(true);
                              }}
                            >
                              <Pencil size={14} />
                            </Btn>
                            <Btn
                              palette={palette}
                              size="sm"
                              variant="quaternary"
                              onClick={() => handleDelete(r.id)}
                            >
                              <Trash2 size={14} />
                            </Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-6 text-center text-silver-500"
                        >
                          Tidak ada data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </section>
        </div>
      </main>

      {/* Modals */}
      <SubjectFormModal
        open={openForm}
        palette={palette}
        onClose={() => {
          setOpenForm(false);
          setEditData(null);
        }}
        initial={editData}
        onSave={handleSave}
      />
      <SubjectDetailModal
        open={!!detailData}
        palette={palette}
        subject={detailData}
        onClose={() => setDetailData(null)}
      />
    </div>
  );
};

export default SchoolSubject;
