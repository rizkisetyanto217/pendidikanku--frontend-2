// src/pages/sekolahislamku/pages/academic/AttendanceDetail.tsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// Theme & utils
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

// UI
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

// Icons
import { Check, X, Save, RefreshCcw, ArrowLeft } from "lucide-react";

/* ========== Types ========== */
type AttendanceDetail = {
  user_attendance_masjid_id: string;
  user_attendance_session_id: string;
  user_attendance_masjid_student_id: string;

  user_attendance_status: "present" | "absent" | "excused" | "late";
  user_attendance_type_id?: string | null;

  user_attendance_desc: string;
  user_attendance_score: number;
  user_attendance_is_passed: boolean;

  user_attendance_user_note?: string;
  user_attendance_teacher_note?: string;
};

/* ========== Dummy API ========== */
let dummyData: AttendanceDetail = {
  user_attendance_masjid_id: "747d6c09-1370-46c2-8268-6b7345a2d325",
  user_attendance_session_id: "0f4b7f8a-0b21-4f36-9d0f-8a7d6a4c1c9e",
  user_attendance_masjid_student_id: "a3d9f6b2-4d2b-4a1f-9d2e-2d7c0f7e1a11",

  user_attendance_status: "present",
  user_attendance_type_id: "5a2f3b74-0e5a-4c1a-9f1c-0c9f7a3b2d10",

  user_attendance_desc: "Menyetor hafalan Al-Mulk 1-10",
  user_attendance_score: 85.5,
  user_attendance_is_passed: true,

  user_attendance_user_note: "Alhamdulillah lancar",
  user_attendance_teacher_note: "Tajwid sudah baik, perbaiki mad wajib",
};

const fakeApi = {
  async get(): Promise<AttendanceDetail> {
    await new Promise((r) => setTimeout(r, 400));
    return { ...dummyData };
  },
  async save(payload: AttendanceDetail): Promise<AttendanceDetail> {
    await new Promise((r) => setTimeout(r, 600));
    dummyData = { ...payload };
    return { ...dummyData };
  },
};

/* ========== Page ========== */
const AttendanceDetailPage: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["attendance-detail"],
    queryFn: () => fakeApi.get(),
  });

  const saveMut = useMutation({
    mutationFn: (payload: AttendanceDetail) => fakeApi.save(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance-detail"] });
      alert("Data berhasil disimpan ✅");
    },
  });

  const [form, setForm] = useState<AttendanceDetail | null>(null);
  const data = form ?? q.data;

  const set = (k: keyof AttendanceDetail, v: any) =>
    setForm((s) => ({ ...(s || (q.data as any)), [k]: v }));

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Kehadiran Santri"
        gregorianDate={new Date().toISOString()}
        hijriDate={new Date().toLocaleDateString("id-ID-u-ca-islamic-umalqura")}
        dateFmt={(iso) => new Date(iso || "").toLocaleDateString("id-ID")}
      />

      <main className="mx-auto max-w-6xl px-4 md:py-6 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Content */}
          <section className="lg:col-span-9 space-y-6">
            <Btn
              palette={palette}
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-1"
            >
              <ArrowLeft size={20} /> 
            </Btn>
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">Form Kehadiran</div>
                </div>

                {!data ? (
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Memuat data…
                  </div>
                ) : (
                  <>
                    <SelectField
                      label="Status"
                      value={data.user_attendance_status}
                      options={[
                        { value: "present", label: "Hadir" },
                        { value: "absent", label: "Absen" },
                        { value: "excused", label: "Izin" },
                        { value: "late", label: "Terlambat" },
                      ]}
                      onChange={(v) => set("user_attendance_status", v)}
                    />

                    <InputField
                      label="Deskripsi"
                      value={data.user_attendance_desc}
                      onChange={(v) => set("user_attendance_desc", v)}
                    />

                    <InputField
                      label="Nilai"
                      type="number"
                      value={String(data.user_attendance_score)}
                      onChange={(v) =>
                        set("user_attendance_score", parseFloat(v))
                      }
                    />

                    <ToggleField
                      label="Lulus"
                      value={data.user_attendance_is_passed}
                      onChange={(v) => set("user_attendance_is_passed", v)}
                    />

                    <InputField
                      label="Catatan Santri"
                      value={data.user_attendance_user_note || ""}
                      onChange={(v) => set("user_attendance_user_note", v)}
                    />

                    <InputField
                      label="Catatan Ustadz"
                      value={data.user_attendance_teacher_note || ""}
                      onChange={(v) => set("user_attendance_teacher_note", v)}
                    />

                    <div className="flex justify-end gap-2 pt-4">
                      <Btn
                        palette={palette}
                        variant="ghost"
                        onClick={() => setForm(null)}
                      >
                        <X size={16} /> Batal
                      </Btn>
                      <Btn
                        palette={palette}
                        onClick={() => data && saveMut.mutate(data)}
                        className="gap-1"
                      >
                        <Save size={16} /> Simpan
                      </Btn>
                    </div>
                  </>
                )}
              </div>
            </SectionCard>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AttendanceDetailPage;

/* ========== Small helpers ========== */
function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-xs mb-1 text-gray-500">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded-lg border px-3 bg-transparent text-sm"
      />
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-xs mb-1 text-gray-500">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded-lg border px-3 bg-transparent text-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
