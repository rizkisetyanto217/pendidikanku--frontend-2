// src/pages/sekolahislamku/attendance/AttendanceManagement.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Btn,
  type Palette,
  Badge,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

type StudentRow = {
  id: string;
  name: string;
  status: AttendanceStatus;
};

const dummyStudents: StudentRow[] = [
  { id: "s1", name: "Ahmad", status: "hadir" },
  { id: "s2", name: "Fatimah", status: "izin" },
  { id: "s3", name: "Hasan", status: "online" },
  { id: "s4", name: "Aisyah", status: "sakit" },
];

export default function AttendanceManagement() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { className?: string } };

  const { isDark } = useHtmlDarkMode();
  const palette: Palette = (isDark ? colors.dark : colors.light) as Palette;

  const [students, setStudents] = useState<StudentRow[]>(dummyStudents);

  const handleChange = (id: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const handleSave = () => {
    console.log("Absen disimpan:", students);
    alert("Data kehadiran berhasil disimpan (lihat console)");
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Topbar */}
      <ParentTopBar
        palette={palette}
        title={`Kelola Absensi ${state?.className ?? ""}`}
        gregorianDate={new Date().toISOString()}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 mb-6 lg:mb-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Konten */}
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 font-semibold text-lg">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center rounded-full p-1 hover:opacity-80"
              >
                <ArrowLeft size={20} />
              </button>
              <span>Manajemen Kehadiran</span>
            </div>

            {/* Tabel Absensi */}
            <SectionCard palette={palette} className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{ borderBottom: `1px solid ${palette.silver1}` }}
                    className="text-left"
                  >
                    <th className="py-2">Nama Siswa</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr
                      key={s.id}
                      style={{ borderBottom: `1px solid ${palette.silver1}` }}
                    >
                      <td className="py-2">{s.name}</td>
                      <td className="py-2">
                        <select
                          value={s.status}
                          onChange={(e) =>
                            handleChange(
                              s.id,
                              e.target.value as AttendanceStatus
                            )
                          }
                          className="h-8 rounded-lg px-2 border outline-none"
                          style={{
                            background: palette.white1,
                            color: palette.black1,
                            borderColor: palette.silver1,
                          }}
                        >
                          {["hadir", "online", "sakit", "izin", "alpa"].map(
                            (opt) => (
                              <option key={opt} value={opt}>
                                {opt.toUpperCase()}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex justify-end">
                <Btn palette={palette} onClick={handleSave}>
                  Simpan Absensi
                </Btn>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
