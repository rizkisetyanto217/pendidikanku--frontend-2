import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/PageHeader";

export default function MasjidProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();

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
      <PageHeader
        title="Profil Masjid"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      {/* Kontainer utama */}
      <div className="rounded-xl overflow-hidden shadow bg-white">
        {/* 🏞️ Foto Masjid */}
        <img
          src={masjid.masjid_image_url || "/assets/placeholder/masjid.jpg"}
          alt={`Foto ${masjid.masjid_name}`}
          className="w-full h-48 md:h-64 object-cover"
        />

        {/* 🏛️ Info Masjid */}
        <div className="p-4 md:p-5 space-y-2">
          <h1 className="text-xl font-bold text-emerald-700">
            🏛️ {masjid.masjid_name}
          </h1>
          <p className="text-gray-700 text-sm md:text-base">
            Dikelola oleh DKM Masjid untuk umat muslim
          </p>
          <p className="text-gray-800 text-sm md:text-base font-medium">
            {masjid.masjid_location}
          </p>
          <p className="text-gray-500 text-xs">Bergabung pada April 2025</p>
        </div>

        {/* 📘 Profil Lembaga */}
        <div className="border-t-[5px] border-[#dfdfdf] p-4 md:p-5 space-y-2">
          <h2 className="text-base md:text-lg font-semibold text-sky-700">
            📘 Profil Lembaga
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {masjid.masjid_profile_story ||
              "Masjid ini didirikan dengan tujuan menjadi tempat ibadah dan pusat kegiatan umat Islam di lingkungan sekitarnya."}
          </p>
          <button
            onClick={() => navigate("detail")}
            className="mt-2 px-4 py-2 text-sm border border-sky-600 text-sky-600 rounded hover:bg-sky-50"
          >
            Profil Lengkap
          </button>
        </div>

        {/* 📄 Pengurus & Pengajar */}
        <div className="border-t-[5px] border-[#dfdfdf] p-4 md:p-5 space-y-2">
          <h2 className="text-base md:text-lg font-semibold text-emerald-700">
            📄 Pengurus & Pengajar
          </h2>
          <p className="text-sm text-gray-700">
            Pengurus dan Pengajar berasal dari masyarakat setempat yang memiliki
            tujuan memajukan Masjid.
          </p>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => navigate("dkm-pengajar")}
              className="w-full flex justify-between items-center p-3 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100"
            >
              <span className="flex items-center space-x-2">
                <span>📋</span>
                <span>Profil Pengurus Masjid dan Pengajar</span>
              </span>
              <span>›</span>
            </button>
          </div>
        </div>

        {/* 🧑‍🤝‍🧑 Sambutan dan Motivasi */}
        <div className="border-t-[5px] border-[#dfdfdf] p-4 md:p-5 space-y-3">
          <h2 className="text-base md:text-lg font-semibold text-sky-700 flex items-center space-x-2">
            <span>🧑‍🤝‍🧑</span>
            <span>Sambutan dan Motivasi</span>
          </h2>
          <p className="text-sm text-gray-700">
            Tulisan dari pengurus, pengajar dan jamaah{" "}
            <strong>{masjid.masjid_name}</strong>
          </p>

          {greetings.map((greet, i) => (
            <div
              key={i}
              className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm space-y-1"
            >
              <p className="font-semibold text-gray-800">{greet.name}</p>
              <p className="text-xs text-gray-500">{greet.role}</p>
              <p className="text-gray-700 text-sm leading-relaxed">
                {greet.message}
              </p>
            </div>
          ))}

          <button
            onClick={() => navigate("sambutan")}
            className="w-full text-sm border border-sky-500 text-sky-600 rounded px-4 py-2 font-medium flex justify-between items-center hover:bg-sky-50"
          >
            <span>Selengkapnya</span>
            <span>›</span>
          </button>

          <button
            onClick={() => navigate(`/masjid/${slug}/donasi`)}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded font-semibold"
          >
            Donasi
          </button>
        </div>
      </div>
    </>
  );
}
