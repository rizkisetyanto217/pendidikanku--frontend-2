import { useParams } from "react-router-dom";
import { useState } from "react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import CartLink from "@/components/common/main/CardLink";
import ShimmerImage from "@/components/common/main/ShimmerImage";
import SocialMediaModal from "@/components/pages/home/SocialMediaModal";

// ✅ import icon dari lucide-react
import { MapPin, BookOpen, CreditCard, FileText, Phone } from "lucide-react";
import SholatScheduleCard from "@/components/pages/home/SholatSchedule";
import MasjidkuHomePrayerCard from "@/components/pages/home/MasjidkuHomePrayerCard";

export default function MasjidkuHome() {
  const { slug } = useParams();
  const [showSocialModal, setShowSocialModal] = useState(false);
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const masjid = {
    masjid_name: "MasjidKu",
    masjid_location:
      "Lembaga untuk Digitalisasi Masjid dan Lembaga Islam Indonesia",
    masjid_image_url: "/images/Gambar-Masjid.jpeg", // ✅ ambil dari public/images
    masjid_instagram_url: "https://instagram.com/masjidbaitussalam",
    masjid_whatsapp_url: "https://wa.me/6281234567890",
    masjid_youtube_url: "https://youtube.com/@masjidbaitussalam",
  };

  return (
    <>
      <PublicNavbar masjidName="MasjidKu ini" showLogin={false} />

      <div className="pt-20"></div>
      <MasjidkuHomePrayerCard location="DKI Jakarta" slug={slug || ""} />
      <div className="w-full max-w-2xl mx-auto min-h-screen pb-28 pt-8">
        <div className="flex flex-col items-center text-center">
          <ShimmerImage
            src="/image/Gambar-Masjid.jpeg"
            alt="Foto Masjid"
            className="w-32 h-32 rounded-full object-cover mb-4"
          />

          <h1 className="text-xl font-semibold" style={{ color: theme.black1 }}>
            {masjid.masjid_name}
          </h1>
          <p className="text-sm mt-1 mb-2" style={{ color: theme.black2 }}>
            {masjid.masjid_location}
          </p>

          <div className="w-full mt-6 space-y-3">
            <CartLink
              label="Profil Kami"
              icon={<MapPin size={18} />}
              href="/profil" // ✅ dari /masjid/:slug/profil → /profil
            />
            <CartLink
              label="Masjid yang telah bekerjasama"
              icon={<BookOpen size={18} />}
              href="/masjid" // ✅ dari /masjid/:slug/jadwal-kajian → /masjid
            />
            <CartLink
              label="Ikut Program Digitalisasi 100 Masjid"
              icon={<CreditCard size={18} />}
              href="/program" // ✅ dari /masjid/:slug/donasi → /program
            />
            <CartLink
              label="Laporan Keuangan"
              icon={<FileText size={18} />}
              href="/finansial" // ✅ dari /masjid/:slug/donasi → /finansial
            />
            <CartLink
              label="Kontak Kami"
              icon={<Phone size={18} />}
              onClick={() => setShowSocialModal(true)} // ✅ tetap modal
            />
          </div>
        </div>
      </div>
    </>
  );
}
