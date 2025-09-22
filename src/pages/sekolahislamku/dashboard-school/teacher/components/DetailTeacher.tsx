/* ================= Imports ================= */
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import { ArrowLeft, Mail, Phone } from "lucide-react";

/* ================= Types ================= */
interface TeacherItem {
  id: string;
  nip?: string;
  name: string;
  subject?: string;
  gender?: "L" | "P";
  phone?: string;
  email?: string;
  status?: "aktif" | "nonaktif" | "alumni";
}

/* ================= Dummy Data ================= */
const DUMMY_TEACHERS: TeacherItem[] = [
  {
    id: "1",
    nip: "19800101",
    name: "Ahmad Fauzi",
    subject: "Matematika",
    gender: "L",
    phone: "081234567890",
    email: "ahmad.fauzi@example.com",
    status: "aktif",
  },
  {
    id: "2",
    nip: "19800202",
    name: "Siti Nurhaliza",
    subject: "Bahasa Indonesia",
    gender: "P",
    phone: "081298765432",
    email: "siti.nurhaliza@example.com",
    status: "aktif",
  },
];

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

/* ================= Component ================= */
const DetailTeacher: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const masjidId = useMemo(() => {
    const u: any = user || {};
    return u.masjid_id || u.lembaga_id || u?.masjid?.id || u?.lembaga?.id || "";
  }, [user]);

  const { data: resp } = useQuery({
    queryKey: ["masjid-teachers", masjidId],
    enabled: !!masjidId,
    queryFn: async () => {
      const res = await axios.get("/api/a/masjid-teachers/by-masjid", {
        params: masjidId ? { masjid_id: masjidId } : undefined,
      });
      return res.data;
    },
  });

  const teachersFromApi: TeacherItem[] =
    resp?.data?.teachers?.map((t: any) => ({
      id: t.masjid_teachers_id,
      nip: t.nip ?? "N/A",
      name: t.user_name,
      subject: t.subject ?? "Umum",
      gender: t.gender,
      phone: t.phone,
      email: t.email,
      status: t.status,
    })) ?? [];

  const teachers =
    teachersFromApi.length > 0 ? teachersFromApi : DUMMY_TEACHERS;
  const teacher = teachers.find((t) => t.id === id);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Guru"
        hijriDate={hijriWithWeekday(new Date().toISOString())}
      />

      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 hidden lg:block">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Content */}
          <section className="flex-1 min-w-0 space-y-6">
            <div className="mx-auto  flex items-center gap-3">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="cursor-pointer" size={20} />
              </Btn>

              <h1 className="font-semibold text-lg">Detail Guru</h1>
            </div>

            <SectionCard palette={palette} className="p-6 space-y-5">
              {teacher ? (
                <>
                  <div>
                    <h1 className="text-xl font-semibold">{teacher.name}</h1>
                    <p className="text-sm text-gray-500">
                      {teacher.subject ?? "-"}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">NIP</div>
                      <div>{teacher.nip ?? "-"}</div>
                    </div>
                    <div>
                      <div className="font-medium">Gender</div>
                      <div>{genderLabel(teacher.gender)}</div>
                    </div>
                    <div>
                      <div className="font-medium">Kontak</div>
                      <div className="flex gap-3 mt-1">
                        {teacher.phone && (
                          <a
                            href={`tel:${teacher.phone}`}
                            className="flex items-center gap-1 hover:underline"
                            style={{ color: palette.primary }}
                          >
                            <Phone size={14} /> {teacher.phone}
                          </a>
                        )}
                        {teacher.email && (
                          <a
                            href={`mailto:${teacher.email}`}
                            className="flex items-center gap-1 hover:underline"
                            style={{ color: palette.primary }}
                          >
                            <Mail size={14} /> Email
                          </a>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Status</div>
                      <Badge
                        palette={palette}
                        variant={
                          teacher.status === "aktif"
                            ? "success"
                            : teacher.status === "nonaktif"
                              ? "warning"
                              : "info"
                        }
                      >
                        {teacher.status ?? "-"}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">
                  Data guru tidak ditemukan.
                </div>
              )}
            </SectionCard>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DetailTeacher;
