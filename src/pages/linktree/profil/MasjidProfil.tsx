import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import ShimmerImage from "@/components/common/main/ShimmerImage";
import BottomNavbar from "@/components/common/public/ButtonNavbar";
import {
  Landmark,
  BookOpen,
  Users,
  ClipboardList,
  ChevronRight,
  Megaphone,
} from "lucide-react";
import { useMemo } from "react";
import parse from "html-react-parser";
import cleanTranscriptHTML from "@/constants/cleanTransciptHTML";
import { limitWords } from "@/constants/limitWords";

type ProfileItem = {
  masjid_profile_teacher_dkm_id: string;
  masjid_profile_teacher_dkm_masjid_id: string;
  masjid_profile_teacher_dkm_name: string;
  masjid_profile_teacher_dkm_role: string;
  masjid_profile_teacher_dkm_description?: string;
  masjid_profile_teacher_dkm_message?: string;
  masjid_profile_teacher_dkm_image_url?: string;
  masjid_profile_teacher_dkm_created_at: string;
};

type MasjidProfileDetail = {
  masjid_profile_id: string;
  masjid_profile_description?: string;
  masjid_profile_founded_year?: number;
  masjid_profile_masjid_id: string;
  masjid_profile_logo_url?: string;
  masjid_profile_stamp_url?: string;
  masjid_profile_ttd_ketua_dkm_url?: string;
  masjid_profile_created_at: string;
};

export default function MasjidProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  // Profil masjid (umum)
  const { data: masjid, isLoading } = useQuery({
    queryKey: ["masjid-profile", slug],
    queryFn: async () => {
      const res = await axios.get(`/public/masjids/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });

  // Detail profil lembaga masjid (description, created_at, founded_year)
  const {
    data: masjidProfile,
    isLoading: loadingProfile,
    isError: errorProfile,
  } = useQuery({
    queryKey: ["masjid-profile-detail-by-slug", slug],
    queryFn: async () => {
      const res = await axios.get(`/public/masjid-profiles/by-slug/${slug}`);
      return res.data.data as MasjidProfileDetail;
    },
    enabled: !!slug,
    staleTime: 60_000,
  });

  // Greetings (DKM & Pengajar)
  const {
    data: profiles,
    isLoading: loadingGreetings,
    isError: errorGreetings,
  } = useQuery({
    queryKey: ["masjid-profile-teacher-dkm", slug],
    queryFn: async () => {
      const res = await axios.get(
        `/public/masjid-profile-teacher-dkm/by-masjid-slug/${slug}`
      );
      return (res.data?.data || []) as ProfileItem[];
    },
    enabled: !!slug,
    staleTime: 60_000,
  });

  const visibleGreetings = useMemo(
    () =>
      (profiles || [])
        .filter((p) => !!p.masjid_profile_teacher_dkm_message)
        .slice(0, 3)
        .map((p) => ({
          name: p.masjid_profile_teacher_dkm_name,
          role: p.masjid_profile_teacher_dkm_role,
          message: p.masjid_profile_teacher_dkm_message as string,
        })),
    [profiles]
  );

  // Format "Bulan YYYY" (id-ID)
  const didirikanText = useMemo(() => {
    const year = masjidProfile?.masjid_profile_founded_year;
    if (!year) return null;
    return `Didirikan tahun ${year}`;
  }, [masjidProfile?.masjid_profile_founded_year]);

  // Bersihkan & render deskripsi HTML
  const cleanedDesc = useMemo(
    () =>
      masjidProfile?.masjid_profile_description
        ? cleanTranscriptHTML(masjidProfile.masjid_profile_description)
        : "",
    [masjidProfile?.masjid_profile_description]
  );

  if (isLoading || !masjid) return <div>Loading...</div>;

  return (
    <>
      <PageHeaderUser
        title="Profil Masjid"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <div className="rounded-xl overflow-hidden pb-20">
        {/* Gambar Masjid */}
        <ShimmerImage
          src={masjid.masjid_image_url || ""}
          alt={`Foto ${masjid.masjid_name}`}
          className="w-full h-48 md:h-64 object-cover"
          shimmerClassName="rounded-none"
        />

        {/* Informasi Umum */}
        <div
          className="py-4 md:p-5 space-y-2 text-base"
          style={{ color: themeColors.black1 }}
        >
          <h1
            className="text-xl md:text-2xl font-semibold flex items-center gap-2"
            style={{ color: themeColors.primary }}
          >
            <Landmark size={20} style={{ color: themeColors.primary }} />
            <span>{masjid.masjid_name}</span>
          </h1>
          <p className="text-base" style={{ color: themeColors.silver2 }}>
            Dikelola oleh DKM Masjid untuk umat muslim
          </p>
          <p
            className="text-base font-medium"
            style={{ color: themeColors.black2 }}
          >
            {masjid.masjid_location}
          </p>
          <p className="text-base" style={{ color: themeColors.silver2 }}>
            {loadingProfile
              ? "Memuat tahun didirikan…"
              : errorProfile
                ? "—"
                : didirikanText || "—"}
          </p>
        </div>

        {/* Profil Lembaga */}
        <div
          className="border-t-[5px] py-4 md:p-5 space-y-2 text-base"
          style={{ borderColor: themeColors.white3 }}
        >
          <h2
            className="text-lg font-semibold flex items-center gap-2"
            style={{ color: themeColors.quaternary }}
          >
            <BookOpen size={18} />
            <span>Profil Lembaga</span>
          </h2>

          <div
            className="text-base leading-relaxed"
            style={{ color: themeColors.black2 }}
          >
            {loadingProfile ? (
              <span>Memuat deskripsi…</span>
            ) : cleanedDesc ? (
              <span>{limitWords(cleanedDesc, 50)}</span>
            ) : (
              "Masjid ini didirikan dengan tujuan menjadi tempat ibadah dan pusat kegiatan umat Islam di lingkungan sekitarnya."
            )}
          </div>

          <button
            onClick={() => navigate("detail")}
            className="mt-2 px-4 py-2 text-base rounded hover:opacity-80 border flex items-center gap-2"
            style={{
              borderColor: themeColors.quaternary,
              color: themeColors.quaternary,
            }}
          >
            <span>Profil Lengkap</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Pengurus & Pengajar */}
        <div
          className="border-t-[5px] py-4 md:p-5 space-y-2 text-base"
          style={{ borderColor: themeColors.white3 }}
        >
          <h2
            className="text-lg font-semibold flex items-center gap-2"
            style={{ color: themeColors.primary }}
          >
            <Users size={18} />
            <span>Pengurus & Pengajar</span>
          </h2>
          <p className="text-base" style={{ color: themeColors.black2 }}>
            Pengurus dan Pengajar berasal dari masyarakat setempat yang memiliki
            tujuan memajukan Masjid.
          </p>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => navigate("dkm-pengajar")}
              className="w-full flex justify-between items-center p-3 rounded hover:opacity-80 text-base"
              style={{
                backgroundColor: themeColors.white2,
                borderColor: themeColors.white3,
                borderWidth: 1,
                color: themeColors.black1,
              }}
            >
              <span className="flex items-center gap-2">
                <ClipboardList size={18} />
                <span>Profil Pengurus Masjid dan Pengajar</span>
              </span>
              <ChevronRight size={18} style={{ color: themeColors.silver2 }} />
            </button>
          </div>
        </div>

        {/* Sambutan & Donasi */}
        <div
          className="border-t-[5px] py-4 md:p-5 space-y-3 text-base"
          style={{ borderColor: themeColors.white3 }}
        >
          <h2
            className="flex items-center gap-2 text-lg font-semibold"
            style={{ color: themeColors.quaternary }}
          >
            <Megaphone size={18} />
            <span>Sambutan dan Motivasi</span>
          </h2>
          <p className="text-base" style={{ color: themeColors.black2 }}>
            Tulisan dari pengurus, pengajar dan jamaah{" "}
            <strong>{masjid.masjid_name}</strong>
          </p>

          {loadingGreetings ? (
            <p className="text-sm" style={{ color: themeColors.silver2 }}>
              Memuat sambutan…
            </p>
          ) : errorGreetings ? (
            <p className="text-sm text-red-500">Gagal memuat sambutan.</p>
          ) : visibleGreetings.length > 0 ? (
            visibleGreetings.map((greet, i) => (
              <div
                key={i}
                className="p-3 rounded-lg text-base space-y-1"
                style={{
                  backgroundColor: themeColors.white2,
                  borderColor: themeColors.white3,
                  borderWidth: 1,
                }}
              >
                <p
                  className="font-semibold"
                  style={{ color: themeColors.black1 }}
                >
                  {greet.name}
                </p>
                <p className="text-base" style={{ color: themeColors.silver2 }}>
                  {greet.role}
                </p>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: themeColors.black2 }}
                >
                  {greet.message}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm" style={{ color: themeColors.silver2 }}>
              Belum ada sambutan.
            </p>
          )}

          <button
            onClick={() => navigate("sambutan")}
            className="w-full text-base rounded px-4 py-2 font-medium flex justify-between items-center border hover:opacity-80"
            style={{
              borderColor: themeColors.quaternary,
              color: themeColors.quaternary,
            }}
          >
            <span>Selengkapnya</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Bottom Navigation */}
        <BottomNavbar />
      </div>
    </>
  );
}
