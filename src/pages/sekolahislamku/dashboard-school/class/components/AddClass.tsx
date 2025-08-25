import React, { useEffect, useMemo, useState } from "react";
import { X, Save, Plus } from "lucide-react";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

// NOTE: Samakan dengan bentuk yang dipakai di SchoolClasses
export type ClassStatus = "active" | "inactive";
export type ClassRow = {
  id: string;
  code: string;
  name: string;
  grade: string;
  homeroom: string;
  studentCount: number;
  schedule: "Pagi" | "Sore";
  status: ClassStatus;
};

export function generateClassId(code: string) {
  const slug = code.toLowerCase().replace(/\s+/g, "-");
  return `c-${slug}-${Date.now()}`;
}

function saveNewClassToLocalStorage(row: ClassRow) {
  const key = "sis_extras_classes";
  const prev = JSON.parse(localStorage.getItem(key) || "[]");
  prev.push(row);
  localStorage.setItem(key, JSON.stringify(prev));
}

export default function AddClass({
  open,
  onClose,
  palette,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  onCreated?: (row: ClassRow) => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("1");
  const [homeroom, setHomeroom] = useState("");
  const [studentCount, setStudentCount] = useState<number | "">("");
  const [schedule, setSchedule] = useState<"Pagi" | "Sore">("Pagi");
  const [status, setStatus] = useState<ClassStatus>("active");

  // Autofill nama dari code/grade jika kosong
  useEffect(() => {
    if (!name && code) setName(`Kelas ${code}`);
  }, [code, name]);

  const isValid = useMemo(() => {
    return (
      code.trim().length > 0 &&
      name.trim().length > 0 &&
      grade.trim().length > 0 &&
      homeroom.trim().length > 0 &&
      typeof studentCount === "number" &&
      studentCount > 0
    );
  }, [code, name, grade, homeroom, studentCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const row: ClassRow = {
      id: generateClassId(code),
      code: code.trim(),
      name: name.trim(),
      grade: grade.trim(),
      homeroom: homeroom.trim(),
      studentCount: Number(studentCount),
      schedule,
      status,
    };

    // Persist sementara ke localStorage supaya muncul di daftar
    saveNewClassToLocalStorage(row);

    onCreated?.(row);
    onClose();

    // reset form
    setCode("");
    setName("");
    setGrade("1");
    setHomeroom("");
    setStudentCount("");
    setSchedule("Pagi");
    setStatus("active");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-xl mx-4">
        <SectionCard palette={palette}>
          <form onSubmit={handleSubmit} className="p-4 md:p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Tambah Kelas</div>
                <div className="text-xs" style={{ color: palette.silver2 }}>
                  Lengkapi informasi kelas di bawah ini.
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg"
                style={{ background: palette.white2, color: palette.silver2 }}
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs" style={{ color: palette.silver2 }}>
                  Kode
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Mis. 3A"
                  className="w-full rounded-lg border px-3 py-2 bg-transparent"
                  style={{ borderColor: palette.silver1 }}
                  required
                />
              </div>
              <div>
                <label className="text-xs" style={{ color: palette.silver2 }}>
                  Nama Kelas
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mis. Kelas 3A"
                  className="w-full rounded-lg border px-3 py-2 bg-transparent"
                  style={{ borderColor: palette.silver1 }}
                  required
                />
              </div>

              <div>
                <label className="text-xs" style={{ color: palette.silver2 }}>
                  Tingkat
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 bg-transparent"
                  style={{ borderColor: palette.silver1 }}
                  required
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const g = String(i + 1);
                    return (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs" style={{ color: palette.silver2 }}>
                  Wali Kelas
                </label>
                <input
                  value={homeroom}
                  onChange={(e) => setHomeroom(e.target.value)}
                  placeholder="Mis. Ust. Ahmad"
                  className="w-full rounded-lg border px-3 py-2 bg-transparent"
                  style={{ borderColor: palette.silver1 }}
                  required
                />
              </div>

              <div>
                <label className="text-xs" style={{ color: palette.silver2 }}>
                  Jumlah Siswa
                </label>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={String(studentCount)}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "") return setStudentCount("");
                    const n = Number(v);
                    if (!Number.isNaN(n)) setStudentCount(n);
                  }}
                  placeholder="Mis. 30"
                  className="w-full rounded-lg border px-3 py-2 bg-transparent"
                  style={{ borderColor: palette.silver1 }}
                  required
                />
              </div>

              <div>
                <label className="text-xs" style={{ color: palette.silver2 }}>
                  Shift
                </label>
                <select
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value as any)}
                  className="w-full rounded-lg border px-3 py-2 bg-transparent"
                  style={{ borderColor: palette.silver1 }}
                >
                  <option value="Pagi">Pagi</option>
                  <option value="Sore">Sore</option>
                </select>
              </div>

              <div>
                <label className="text-xs" style={{ color: palette.silver2 }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ClassStatus)}
                  className="w-full rounded-lg border px-3 py-2 bg-transparent"
                  style={{ borderColor: palette.silver1 }}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Btn
                type="button"
                palette={palette}
                variant="quaternary"
                onClick={onClose}
              >
                Batalkan
              </Btn>
              <Btn palette={palette} disabled={!isValid}>
                <Save size={16} className="mr-2" /> Simpan
              </Btn>
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
