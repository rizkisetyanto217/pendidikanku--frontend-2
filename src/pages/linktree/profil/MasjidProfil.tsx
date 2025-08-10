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

export default function MasjidProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const { data: masjid, isLoading } = useQuery({
    queryKey: ["masjid-profile", slug],
    queryFn: async () => {
      const res = await axios.get(`/public/masjids/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });

  const greetings = [
    {
      name: "Muhammad",
      role: "Pengajar",
      message:
        "Semoga Allah ta’ala mudahkan kita dalam menuntut ilmu agama. Allah ta’ala berikan kemudahan bagi kita semua terutama bagi orang-orang yang sedang kesulitan agar dilancarkan usahanya.",
    },
    {
      name: "Budi",
      role: "Ketua DKM",
      message:
        "Semoga Allah ta’ala mudahkan kita dalam menuntut ilmu agama. Allah ta’ala berikan kemudahan bagi kita semua terutama bagi orang-orang yang sedang kesulitan agar dilancarkan usahanya.",
    },
  ];

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
            Bergabung pada April 2025
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
          <p className="text-base" style={{ color: themeColors.black2 }}>
            {masjid.masjid_profile_story ||
              "Masjid ini didirikan dengan tujuan menjadi tempat ibadah dan pusat kegiatan umat Islam di lingkungan sekitarnya."}
          </p>
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

          {greetings.map((greet, i) => (
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
              <p className="text-base" style={{ color: themeColors.black2 }}>
                {greet.message}
              </p>
            </div>
          ))}

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

          {/* 
          <button
            onClick={() => navigate(`/masjid/${slug}/donasi`)}
            className="w-full py-3 rounded font-semibold hover:opacity-90 text-base"
            style={{ backgroundColor: themeColors.primary, color: themeColors.white1 }}
          >
            Donasi
          </button> 
          */}
        </div>

        {/* Bottom Navigation */}
        <BottomNavbar />
      </div>
    </>
  );
}
