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
    <>
      <ParentTopBar
        palette={palette}
        title="Detail Guru"
        hijriDate={hijriWithWeekday(new Date().toISOString())}
      />
      <div className="lg:flex lg:gap-4 lg:p-4 lg:pt-6">
        <ParentSidebar palette={palette} className="hidden lg:block" />
        <main className="flex-1 mx-auto max-w-4xl px-3 sm:px-4 space-y-6">
          <Btn
            palette={palette}
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 mt-6 md:mt-0"
          >
            <ArrowLeft size={20} />
          </Btn>

          <SectionCard palette={palette} className="p-6 space-y-5">
            {teacher ? (
              <>
                <div className="text-xl font-semibold">{teacher.name}</div>
                <div className="text-sm text-gray-500">
                  {teacher.subject ?? "-"}
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
        </main>
      </div>
    </>
  );
};

export default DetailTeacher;
