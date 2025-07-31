import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

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

      <div
        className="rounded-xl overflow-hidden "
        // style={{ backgroundColor: themeColors.white1 }}
      >
        {/* Gambar Masjid */}
        <img
          src={masjid.masjid_image_url || "/assets/placeholder/masjid.jpg"}
          alt={`Foto ${masjid.masjid_name}`}
          className="w-full h-48 md:h-64 object-cover"
        />

        {/* Informasi Umum */}
        <div
          className="py-4 md:p-5 space-y-2"
          style={{ color: themeColors.black1 }}
        >
          <h1 style={{ color: themeColors.primary }}>
            🏛️ {masjid.masjid_name}
          </h1>
          <p style={{ color: themeColors.silver2 }}>
            Dikelola oleh DKM Masjid untuk umat muslim
          </p>
          <p style={{ color: themeColors.black2, fontWeight: 500 }}>
            {masjid.masjid_location}
          </p>
          <p style={{ color: themeColors.silver2, fontSize: 12 }}>
            Bergabung pada April 2025
          </p>
        </div>

        {/* Profil Lembaga */}
        <div
          className="border-t-[5px] py-4 md:p-5 space-y-2"
          style={{ borderColor: themeColors.white3 }}
        >
          <h2 style={{ color: themeColors.quaternary }}>📘 Profil Lembaga</h2>
          <p style={{ color: themeColors.black2, fontSize: 14 }}>
            {masjid.masjid_profile_story ||
              "Masjid ini didirikan dengan tujuan menjadi tempat ibadah dan pusat kegiatan umat Islam di lingkungan sekitarnya."}
          </p>
          <button
            onClick={() => navigate("detail")}
            style={{
              borderColor: themeColors.quaternary,
              color: themeColors.quaternary,
            }}
            className="mt-2 px-4 py-2 text-sm rounded hover:opacity-80 border"
          >
            Profil Lengkap
          </button>
        </div>

        {/* Pengurus & Pengajar */}
        <div
          className="border-t-[5px] py-4 md:p-5 space-y-2"
          style={{ borderColor: themeColors.white3 }}
        >
          <h2 style={{ color: themeColors.primary }}>📄 Pengurus & Pengajar</h2>
          <p style={{ color: themeColors.black2, fontSize: 14 }}>
            Pengurus dan Pengajar berasal dari masyarakat setempat yang memiliki
            tujuan memajukan Masjid.
          </p>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => navigate("dkm-pengajar")}
              className="w-full flex justify-between items-center p-3 rounded hover:opacity-80"
              style={{
                backgroundColor: themeColors.white2,
                borderColor: themeColors.white3,
                borderWidth: 1,
                color: themeColors.black1,
              }}
            >
              <span className="flex items-center space-x-2">
                <span>📋</span>
                <span>Profil Pengurus Masjid dan Pengajar</span>
              </span>
              <span>›</span>
            </button>
          </div>
        </div>

        {/* Sambutan & Donasi */}
        <div
          className="border-t-[5px] py-4 md:p-5 space-y-3"
          style={{ borderColor: themeColors.white3 }}
        >
          <h2
            className="flex items-center space-x-2"
            style={{ color: themeColors.quaternary }}
          >
            <span>🧑‍🤝‍🧑</span>
            <span>Sambutan dan Motivasi</span>
          </h2>
          <p style={{ color: themeColors.black2, fontSize: 14 }}>
            Tulisan dari pengurus, pengajar dan jamaah{" "}
            <strong>{masjid.masjid_name}</strong>
          </p>

          {greetings.map((greet, i) => (
            <div
              key={i}
              className="p-3 rounded-lg text-sm space-y-1"
              style={{
                backgroundColor: themeColors.white2,
                borderColor: themeColors.white3,
                borderWidth: 1,
              }}
            >
              <p style={{ color: themeColors.black1, fontWeight: 600 }}>
                {greet.name}
              </p>
              <p style={{ color: themeColors.silver2, fontSize: 12 }}>
                {greet.role}
              </p>
              <p style={{ color: themeColors.black2 }}>{greet.message}</p>
            </div>
          ))}

          <button
            onClick={() => navigate("sambutan")}
            style={{
              borderColor: themeColors.quaternary,
              color: themeColors.quaternary,
            }}
            className="w-full text-sm rounded px-4 py-2 font-medium flex justify-between items-center border hover:opacity-80"
          >
            <span>Selengkapnya</span>
            <span>›</span>
          </button>

          <button
            onClick={() => navigate(`/masjid/${slug}/donasi`)}
            style={{
              backgroundColor: themeColors.primary,
              color: themeColors.white1,
            }}
            className="w-full py-3 rounded font-semibold hover:opacity-90"
          >
            Donasi
          </button>
        </div>
      </div>
    </>
  );
}