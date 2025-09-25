// src/pages/sekolahislamku/students/StudentsPage.tsx
/* ================= Imports ================= */
import { useState, useMemo } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "../../components/home/ParentSideBar";

import TambahSiswa from "./modal/AddStudent";
import UploadFileSiswa from "./modal/UploadFileStudent";

import {
  UserPlus,
  ChevronRight,
  Upload,
  AlertTriangle,
  Mail,
  Phone,
  ArrowLeft,
  Eye,
  Edit3,
  Trash2,
  X,
} from "lucide-react";

/* ================= Types ================= */
export interface StudentItem {
  id: string;
  nis?: string;
  name: string;
  class_name?: string;
  gender?: "L" | "P";
  parent_name?: string;
  phone?: string;
  email?: string;
  status: "aktif" | "nonaktif" | "alumni";
}
type SchoolStudentProps = {
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
};

/* ================= Helpers ================= */
const genderLabel = (g?: "L" | "P") =>
  g === "L" ? "Laki-laki" : g === "P" ? "Perempuan" : "-";

const hijriWithWeekday = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/* ================= Dummy Data ================= */
const DUMMY_STUDENTS: StudentItem[] = [
  {
    id: "s1",
    nis: "202301",
    name: "Ahmad Fauzi",
    class_name: "1A",
    gender: "L",
    parent_name: "Bapak Fauzan",
    phone: "081234567890",
    email: "ahmad.fauzi@example.com",
    status: "aktif",
  },
  {
    id: "s2",
    nis: "202302",
    name: "Siti Nurhaliza",
    class_name: "1B",
    gender: "P",
    parent_name: "Ibu Rahma",
    phone: "081298765432",
    email: "siti.nurhaliza@example.com",
    status: "aktif",
  },
];

/* ================= Modals ================= */
function StudentDetailModal({
  open,
  onClose,
  student,
  palette,
}: {
  open: boolean;
  onClose: () => void;
  student: StudentItem | null;
  palette: Palette;
}) {
  if (!open || !student) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center"
      style={{ background: "rgba(0,0,0,.35)" }}
      onClick={onClose}
    >
      <div
        className="w-[min(480px,95vw)] rounded-2xl shadow-xl p-5"
        onClick={(e) => e.stopPropagation()}
        style={{ background: palette.white1, color: palette.black1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Detail Siswa</h3>
          <button
            className="p-1 rounded-lg"
            onClick={onClose}
            style={{ color: palette.silver2 }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Nama:</strong> {student.name}
          </div>
          <div>
            <strong>NIS:</strong> {student.nis ?? "-"}
          </div>
          <div>
            <strong>Kelas:</strong> {student.class_name ?? "-"}
          </div>
          <div>
            <strong>JK:</strong> {genderLabel(student.gender)}
          </div>
          <div>
            <strong>Orang Tua:</strong> {student.parent_name ?? "-"}
          </div>
          <div>
            <strong>Kontak:</strong> {student.phone ?? "-"} |{" "}
            {student.email ?? "-"}
          </div>
          <div>
            <Badge
              palette={palette}
              variant={
                student.status === "aktif"
                  ? "success"
                  : student.status === "nonaktif"
                    ? "warning"
                    : "info"
              }
            >
              {student.status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentEditModal({
  open,
  onClose,
  onSave,
  palette,
  student,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (s: StudentItem) => void;
  palette: Palette;
  student: StudentItem | null;
}) {
  const [form, setForm] = useState<StudentItem>(
    student ?? {
      id: "",
      nis: "",
      name: "",
      class_name: "",
      gender: "L",
      parent_name: "",
      phone: "",
      email: "",
      status: "aktif",
    }
  );

  useMemo(() => {
    if (student) setForm(student);
  }, [student]);

  if (!open) return null;

  const handleSave = () => {
    if (!form.name) return;
    onSave(form);
    onClose();
  };

  const set = <K extends keyof StudentItem>(k: K, v: StudentItem[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center"
      style={{ background: "rgba(0,0,0,.35)" }}
      onClick={onClose}
    >
      <div
        className="w-[min(500px,95vw)] rounded-2xl shadow-xl p-5"
        onClick={(e) => e.stopPropagation()}
        style={{ background: palette.white1, color: palette.black1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Edit Siswa</h3>
          <button
            className="p-1 rounded-lg"
            onClick={onClose}
            style={{ color: palette.silver2 }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="grid gap-3 text-sm">
          <input
            placeholder="Nama"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="border px-3 py-2 rounded-lg"
            style={{ borderColor: palette.silver1 }}
          />
          <input
            placeholder="NIS"
            value={form.nis}
            onChange={(e) => set("nis", e.target.value)}
            className="border px-3 py-2 rounded-lg"
            style={{ borderColor: palette.silver1 }}
          />
          <input
            placeholder="Kelas"
            value={form.class_name}
            onChange={(e) => set("class_name", e.target.value)}
            className="border px-3 py-2 rounded-lg"
            style={{ borderColor: palette.silver1 }}
          />
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as any)}
            className="border px-3 py-2 rounded-lg"
            style={{ borderColor: palette.silver1 }}
          >
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
            <option value="alumni">Alumni</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Btn palette={palette} variant="ghost" onClick={onClose}>
            Batal
          </Btn>
          <Btn palette={palette} onClick={handleSave}>
            Simpan
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ================= Main Component ================= */
const StudentsPage: React.FC<SchoolStudentProps> = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  const [openAdd, setOpenAdd] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [students, setStudents] = useState<StudentItem[]>(DUMMY_STUDENTS);
  const [detail, setDetail] = useState<StudentItem | null>(null);
  const [edit, setEdit] = useState<StudentItem | null>(null);

  const handleDelete = (s: StudentItem) => {
    if (!confirm(`Hapus siswa ${s.name}?`)) return;
    setStudents((prev) => prev.filter((x) => x.id !== s.id));
  };

  const handleSaveEdit = (s: StudentItem) => {
    setStudents((prev) => prev.map((x) => (x.id === s.id ? { ...s } : x)));
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Modals */}
      <TambahSiswa
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        palette={palette}
        classes={["1A", "1B", "2A"]}
      />
      <UploadFileSiswa
        open={openImport}
        onClose={() => setOpenImport(false)}
        palette={palette}
      />

      <StudentDetailModal
        open={!!detail}
        onClose={() => setDetail(null)}
        student={detail}
        palette={palette}
      />
      <StudentEditModal
        open={!!edit}
        onClose={() => setEdit(null)}
        student={edit}
        onSave={handleSaveEdit}
        palette={palette}
      />

      {/* Topbar */}
      <ParentTopBar
        palette={palette}
        title="Siswa"
        hijriDate={hijriWithWeekday(new Date().toISOString())}
        showBack={true}
      />

      {/* Layout */}
      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Content */}
          <section className="flex-1 flex flex-col space-y-6 min-w-0">
            <div className="flex items-center justify-between">
              <div className="  md:flex hidden items-center gap-3">
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="cursor-pointer" size={20} />
                </Btn>

                <h1 className="font-semibold text-lg">Data Siswa</h1>
              </div>
              <div className="flex gap-2">
                <Btn
                  onClick={() => setOpenImport(true)}
                  size="sm"
                  palette={palette}
                  variant="outline"
                  className="flex items-center gap-1.5 text-xs sm:text-sm"
                >
                  <Upload size={14} /> Import CSV
                </Btn>
                <Btn
                  onClick={() => setOpenAdd(true)}
                  size="sm"
                  palette={palette}
                  className="flex items-center gap-1.5 text-xs sm:text-sm"
                >
                  <UserPlus size={14} /> Tambah Siswa
                </Btn>
              </div>
            </div>

            {/* Table */}
            <SectionCard palette={palette}>
              <div className="overflow-x-auto">
                <table className="min-w-[800px] w-full text-sm border-collapse">
                  <thead style={{ color: palette.silver2 }}>
                    <tr
                      className="border-b"
                      style={{ borderColor: palette.silver1 }}
                    >
                      <th className="py-3 px-4 text-left">NIS</th>
                      <th className="py-3 px-4 text-left">Nama</th>
                      <th className="py-3 px-4 text-left">Kelas</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b hover:bg-black/5 transition-colors"
                        style={{ borderColor: palette.silver1 }}
                      >
                        <td className="py-3 px-4">{s.nis}</td>
                        <td className="py-3 px-4">{s.name}</td>
                        <td className="py-3 px-4">{s.class_name}</td>
                        <td className="py-3 px-4">
                          <Badge
                            palette={palette}
                            variant={
                              s.status === "aktif"
                                ? "success"
                                : s.status === "nonaktif"
                                  ? "warning"
                                  : "info"
                            }
                          >
                            {s.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Btn
                              size="sm"
                              variant="ghost"
                              palette={palette}
                              onClick={() => setDetail(s)}
                            >
                              <Eye size={16} />
                            </Btn>
                            <Btn
                              size="sm"
                              variant="ghost"
                              palette={palette}
                              onClick={() => setEdit(s)}
                            >
                              <Edit3 size={16} />
                            </Btn>
                            <Btn
                              size="sm"
                              variant="ghost"
                              palette={palette}
                              onClick={() => handleDelete(s)}
                            >
                              <Trash2 size={16} />
                            </Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentsPage;
