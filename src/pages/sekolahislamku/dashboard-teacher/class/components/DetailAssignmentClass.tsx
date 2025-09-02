import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { pickTheme, ThemeName } from "@/constants/thema";

import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

import { ArrowLeft, CalendarDays, ClipboardList, Users } from "lucide-react";

// ⬇️ Pakai sumber yang sama dengan halaman list
import {
  QK,
  fetchAssignmentsByClass,
  type Assignment,
} from "../types/assignments";

/* ========= Helpers tanggal ========= */
const dateLong = (isoStr?: string) =>
  isoStr
    ? new Date(isoStr).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

/* ========= Page ========= */
export default function DetailAssignmentClass() {
  const { id: classId = "", assignmentId = "" } = useParams<{
    id: string;
    assignmentId: string;
  }>();
  const navigate = useNavigate();

  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  // Ambil list tugas via query & cache yg sama
  const { data: assignments = [], isFetching } = useQuery({
    queryKey: QK.ASSIGNMENTS(classId),
    queryFn: () => fetchAssignmentsByClass(classId),
    enabled: !!classId,
    staleTime: 2 * 60_000,
  });

  // Pilih item
  const assignment: Assignment | undefined = useMemo(
    () => assignments.find((a) => a.id === assignmentId),
    [assignments, assignmentId]
  );

  const hijriToday = useMemo(
    () =>
      new Date().toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    []
  );

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Tugas"
        gregorianDate={new Date().toISOString()}
        hijriDate={hijriToday}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />

          <div className="flex-1 space-y-6">
            {/* Back */}
            <Btn
              palette={palette}
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} className="mr-1" />
              Kembali
            </Btn>

            <SectionCard palette={palette} className="p-5 space-y-4">
              {isFetching && (
                <div className="text-sm" style={{ color: palette.silver2 }}>
                  Memuat detail tugas…
                </div>
              )}

              {!isFetching && assignment && (
                <>
                  <div>
                    <h2 className="text-xl font-semibold mb-1">
                      {assignment.title}
                    </h2>
                    <p className="text-sm" style={{ color: palette.silver2 }}>
                      {assignment.author ? (
                        <>Oleh {assignment.author} • </>
                      ) : null}
                      Dibuat {dateLong(assignment.createdAt)}
                    </p>
                  </div>

                  {assignment.description && (
                    <p className="text-sm" style={{ color: palette.black2 }}>
                      {assignment.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3 text-sm">
                    {assignment.dueDate && (
                      <Badge palette={palette} variant="secondary">
                        <CalendarDays size={14} className="mr-1" />
                        Batas: {dateLong(assignment.dueDate)}
                      </Badge>
                    )}
                    {(assignment.totalSubmissions ?? 0) > 0 && (
                      <Badge palette={palette} variant="outline">
                        <Users size={14} className="mr-1" />
                        {assignment.totalSubmissions} Pengumpulan
                      </Badge>
                    )}
                    {typeof assignment.graded === "number" && (
                      <Badge palette={palette} variant="success">
                        <ClipboardList size={14} className="mr-1" />
                        {assignment.graded} Dinilai
                      </Badge>
                    )}
                  </div>
                </>
              )}

              {!isFetching && !assignment && (
                <p className="text-sm" style={{ color: palette.silver2 }}>
                  Tugas tidak ditemukan untuk kelas ini.
                </p>
              )}
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
