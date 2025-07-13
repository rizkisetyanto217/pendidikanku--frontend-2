import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "@/lib/axios";
import { BuildingIcon, UserIcon } from "lucide-react";
import DashboardSidebar, {
  SidebarMenuItem,
} from "@/components/common/navigation/SidebarMenu";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { Link, Outlet, useLocation } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";

interface TokenPayload {
  masjid_admin_ids: string[];
  role: string;
  user_name: string;
}

interface Masjid {
  masjid_id: string;
  masjid_name: string;
  masjid_bio_short: string;
  masjid_location: string;
  masjid_latitude: number;
  masjid_longitude: number;
  masjid_image_url: string;
  masjid_slug: string;
  masjid_instagram_url: string;
  masjid_whatsapp_url: string;
  masjid_youtube_url: string;
}

export default function ProfilMasjid() {
  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const location = useLocation();
  const isEditing = location.pathname.includes("edit-sosmed");

  const menus: SidebarMenuItem[] = [
    { name: "Masjid", icon: <BuildingIcon />, to: "/dkm/profil-masjid" },
    { name: "DKM & Pengajar", icon: <UserIcon />, to: "/dkm/profil-dkm" },
  ];

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const masjidId = decoded.masjid_admin_ids?.[0];
      if (!masjidId) return;

      axios
        .get(`/public/masjids/verified/${masjidId}`)
        .then((res) => {
          setMasjid(res.data.data);
        })
        .catch((err) => console.error("Gagal ambil data masjid:", err));
    } catch (err) {
      console.error("Token tidak valid:", err);
    }
  }, []);

  if (!masjid) return <div>Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0">
        <DashboardSidebar menus={menus} title="Profil" />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div
          className="p-6 rounded-xl shadow-sm space-y-6"
          style={{ backgroundColor: theme.white1, color: theme.black1 }}
        >
          {isEditing ? (
            <Outlet />
          ) : (
            <>
              <PageHeader title="Profil Masjid" />

              {/* Info Utama */}
              <div className="flex flex-col md:flex-row gap-4">
                <img
                  src={masjid.masjid_image_url}
                  alt={masjid.masjid_name}
                  className="w-full md:w-60 h-40 object-cover rounded-md"
                />
                <div className="flex-1 space-y-1">
                  <h2
                    className="text-lg font-bold"
                    style={{ color: theme.primary }}
                  >
                    {masjid.masjid_name}
                  </h2>
                  <p className="text-sm" style={{ color: theme.silver2 }}>
                    {masjid.masjid_bio_short}
                  </p>
                  <p
                    className="text-sm font-medium"
                    style={{ color: theme.black1 }}
                  >
                    {masjid.masjid_location}
                  </p>
                  <div className="flex gap-4 text-sm mt-2">
                    <span className="font-medium">300 Postingan</span>
                    <span className="font-medium">300 Pengikut</span>
                  </div>
                </div>
              </div>

              {/* Sosial Media */}
              <div>
                <h3 className="text-sm font-semibold mb-1">Sosial Media</h3>
                <div className="flex items-center gap-2">
                  {masjid.masjid_instagram_url && (
                    <a href={masjid.masjid_instagram_url} target="_blank">
                      <img
                        src="/icons/instagram.svg"
                        alt="Instagram"
                        className="w-8 h-8"
                      />
                    </a>
                  )}
                  {masjid.masjid_whatsapp_url && (
                    <a href={masjid.masjid_whatsapp_url} target="_blank">
                      <img
                        src="/icons/whatsapp.svg"
                        alt="WhatsApp"
                        className="w-8 h-8"
                      />
                    </a>
                  )}
                  {masjid.masjid_youtube_url && (
                    <a href={masjid.masjid_youtube_url} target="_blank">
                      <img
                        src="/icons/youtube.svg"
                        alt="Youtube"
                        className="w-8 h-8"
                      />
                    </a>
                  )}
                  <Link
                    to="edit-sosmed"
                    state={{
                      instagram: masjid.masjid_instagram_url,
                      whatsapp: masjid.masjid_whatsapp_url,
                      youtube: masjid.masjid_youtube_url,
                    }}
                  >
                    <button
                      className="ml-2 text-sm px-3 py-1 rounded font-medium transition"
                      style={{
                        backgroundColor: theme.primary2,
                        color: theme.primary,
                      }}
                    >
                      + Edit
                    </button>
                  </Link>
                </div>
              </div>

              {/* Latar Belakang */}
              <section>
                <h3 className="text-sm font-bold mb-1">Latar Belakang</h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: theme.black2 }}
                >
                  (Isi sesuai kebutuhan backend nanti)
                </p>
              </section>

              {/* Tujuan */}
              <section>
                <h3 className="text-sm font-bold mb-1">Tujuan</h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: theme.black2 }}
                >
                  (Isi sesuai kebutuhan backend nanti)
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
