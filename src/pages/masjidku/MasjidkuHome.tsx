// Tampilan bersih seperti Linktree: Public Masjidku
import { useParams } from "react-router-dom";
import { useState } from "react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import BottomNavbar from "@/components/common/public/ButtonNavbar";
import CartLink from "@/components/common/main/CardLink";
import ShimmerImage from "@/components/common/main/ShimmerImage";
import SocialMediaModal from "@/components/pages/home/SocialMediaModal";

export default function MasjidkuHome() {
  const { slug } = useParams();
  const [showSocialModal, setShowSocialModal] = useState(false);
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const masjid = {
    masjid_name: "Masjid Baitussalam",
    masjid_location: "Jakarta Selatan",
    masjid_image_url: "/default-masjid.jpg",
    masjid_instagram_url: "https://instagram.com/masjidbaitussalam",
    masjid_whatsapp_url: "https://wa.me/6281234567890",
    masjid_youtube_url: "https://youtube.com/@masjidbaitussalam",
  };

  return (
    <>
      <PublicNavbar masjidName={masjid.masjid_name} />
      <div className="w-full max-w-2xl mx-auto min-h-screen pt-16 pb-28 px-4">
        <div className="flex flex-col items-center text-center">
          <ShimmerImage
            src={masjid.masjid_image_url}
            alt="Foto Masjid"
            className="w-32 h-32 rounded-full object-cover border-2 border-white mb-4"
          />
          <h1 className="text-xl font-semibold" style={{ color: theme.black1 }}>
            {masjid.masjid_name}
          </h1>
          <p className="text-sm mt-1 mb-2" style={{ color: theme.black2 }}>
            {masjid.masjid_location}
          </p>

          <div className="flex gap-3 my-2">
            <a
              href={masjid.masjid_whatsapp_url}
              target="_blank"
              rel="noreferrer"
            >
              <ShimmerImage src="/icons/whatsapp.svg" className="w-6 h-6" />
            </a>
            <a
              href={masjid.masjid_instagram_url}
              target="_blank"
              rel="noreferrer"
            >
              <ShimmerImage src="/icons/instagram.svg" className="w-6 h-6" />
            </a>
            <a
              href={masjid.masjid_youtube_url}
              target="_blank"
              rel="noreferrer"
            >
              <ShimmerImage src="/icons/youtube.svg" className="w-6 h-6" />
            </a>
          </div>

          <div className="w-full mt-6 space-y-3">
            <CartLink
              label="Profil Masjid"
              icon="📍"
              href={`/masjid/${slug}/profil`}
            />
            <CartLink
              label="Jadwal Kajian"
              icon="📚"
              href={`/masjid/${slug}/jadwal-kajian`}
            />
            <CartLink
              label="Grup & Sosial Media"
              icon="🌐"
              onClick={() => setShowSocialModal(true)}
            />
            <CartLink
              label="Donasi untuk Masjid"
              icon="💳"
              href={`/masjid/${slug}/donasi`}
            />
            <CartLink
              label="Soal & Materi Kajian"
              icon="📝"
              href={`/masjid/${slug}/soal-materi`}
            />
            <CartLink
              label="Sambutan & Motivasi"
              icon="📣"
              href={`/masjid/${slug}/motivasi`}
            />
            <CartLink
              label="Aktivitas Saya"
              icon="🧾"
              href={`/masjid/${slug}/aktivitas`}
            />
          </div>
        </div>

        <SocialMediaModal
          show={showSocialModal}
          onClose={() => setShowSocialModal(false)}
          data={{
            instagram: masjid.masjid_instagram_url,
            whatsapp: masjid.masjid_whatsapp_url,
            youtube: masjid.masjid_youtube_url,
          }}
        />

      </div>
    </>
  );
}
