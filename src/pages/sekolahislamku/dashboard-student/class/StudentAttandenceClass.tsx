// src/pages/sekolahislamku/pages/student/StudentAttandenceClass.tsx
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
  CalendarDays,
  CheckCircle2,
  Stethoscope,
  CalendarX,
} from "lucide-react";

/* ===== Helpers ===== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/* ===== Dummy mapping kelas (sesuai MyClass) ===== */
const CLASS_INFO: Record<
  string,
  { name: string; room?: string; homeroom?: string }
> = {
  tahsin: { name: "Tahsin", room: "Aula 1", homeroom: "Ustadz Abdullah" },
  tahfidz: { name: "Tahfidz", room: "R. Tahfiz", homeroom: "Ustadz Salman" },
};

type Status = "hadir" | "izin" | "sakit";

const StudentAttandenceClass: React.FC = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName, isDark);

  const cls = useMemo(
    () => CLASS_INFO[id ?? ""] ?? { name: id ?? "Kelas" },
    [id]
  );

  const [status, setStatus] = useState<Status | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  const todayISO = new Date().toISOString();

  const handlePick = (s: Status) => {
    setStatus(s);
    setSubmittedAt(new Date().toISOString());
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={`Kehadiran • ${cls.name}`}
        gregorianDate={todayISO}
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
            {/* Back + title */}
            <div className="md:flex hidden gap-3 items-center">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={20} />
              </Btn>
              <h1 className="textlg font-semibold">Kehadiran Kelas</h1>
            </div>

            {/* Info kelas */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lg md:text-xl font-semibold">
                    {cls.name}
                  </div>
                  <div
                    className="mt-1 flex flex-wrap items-center gap-2 text-sm"
                    style={{ color: palette.black2 }}
                  >
                    {cls.room && (
                      <Badge palette={palette} variant="outline">
                        {cls.room}
                      </Badge>
                    )}
                    {cls.homeroom && <span>Wali Kelas: {cls.homeroom}</span>}
                  </div>

                  <div
                    className="mt-2 flex flex-wrap items-center gap-2 text-sm"
                    style={{ color: palette.black2 }}
                  >
                    <CalendarDays size={14} />
                    <span>Hari ini: {dateLong(todayISO)}</span>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Pilihan status */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 space-y-4">
                <div className="font-semibold">Pilih status kehadiran:</div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Btn
                    palette={palette}
                    onClick={() => handlePick("hadir")}
                    className="w-full h-12 justify-center"
                  >
                    <CheckCircle2 size={18} className="mr-2" />
                    Hadir
                  </Btn>

                  <Btn
                    palette={palette}
                    variant="outline"
                    onClick={() => handlePick("izin")}
                    className="w-full h-12 justify-center"
                  >
                    <CalendarX size={18} className="mr-2" />
                    Izin
                  </Btn>

                  <Btn
                    palette={palette}
                    variant="outline"
                    onClick={() => handlePick("sakit")}
                    className="w-full h-12 justify-center"
                  >
                    <Stethoscope size={18} className="mr-2" />
                    Sakit
                  </Btn>
                </div>

                {/* Notifikasi ringkas */}
                {status && (
                  <div
                    className="mt-3 rounded-xl border px-4 py-3 text-sm"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white1,
                    }}
                  >
                    <span className="font-medium">Terkirim!</span> Status
                    kehadiran kamu untuk{" "}
                    <span className="font-medium">{cls.name}</span> hari ini
                    tercatat sebagai{" "}
                    <Badge
                      palette={palette}
                      variant={
                        status === "hadir"
                          ? "success"
                          : status === "izin"
                            ? "warning"
                            : "info"
                      }
                      className="ml-1"
                    >
                      {status.toUpperCase()}
                    </Badge>
                    {submittedAt && (
                      <span style={{ color: palette.black2 }}>
                        {" "}
                        •{" "}
                        {new Date(submittedAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Ringkasan singkat */}
            <SectionCard palette={palette}>
              <div
                className="p-4 md:p-5 text-sm"
                style={{ color: palette.black2 }}
              >
                <div className="font-semibold mb-2">Catatan</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Pilihan yang kamu klik langsung tersimpan (dummy/local).
                  </li>
                  <li>Jika salah pilih, klik tombol lain untuk memperbarui.</li>
                  <li>Admin/guru bisa melihat status ini pada sistem guru.</li>
                </ul>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentAttandenceClass;
