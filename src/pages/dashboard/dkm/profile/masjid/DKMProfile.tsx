import { useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import axios from "@/lib/axios";
import { BuildingIcon, UserIcon } from "lucide-react";
import DashboardSidebar, {
  SidebarMenuItem,
} from "@/components/common/navigation/SidebarMenu";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { Link, Outlet, useLocation } from "react-router-dom";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import CommonButton from "@/components/common/main/CommonButton";

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

interface MasjidProfile {
  masjid_profile_story: string;
  masjid_profile_visi: string;
  masjid_profile_misi: string;
  masjid_profile_other: string;
  masjid_profile_founded_year: number;
  masjid_profile_stamp_url: string;
  masjid_profile_logo_url: string;
  masjid_profile_ttd_ketua_dkm_url: string;
}

function getMasjidIdFromToken(): string | null {
  const token = sessionStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.masjid_admin_ids?.[0] || null;
  } catch {
    return null;
  }
}

export default function ProfilMasjid() {
  const masjidId = getMasjidIdFromToken();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const location = useLocation();
  const isEditing =
    location.pathname.includes("edit-sosmed") ||
    location.pathname.includes("edit-profil-masjid") ||
    location.pathname.includes("edit-masjid");

  const { data: masjid, isLoading: isLoadingMasjid } = useQuery<Masjid>({
    queryKey: ["masjid", masjidId],
    queryFn: async () => {
      console.log("[QUERY] Fetching MASJID:", masjidId);
      const res = await axios.get(`/public/masjids/verified/${masjidId}`);
      console.log("[RESPONSE] Masjid:", res.data.data);
      return res.data.data;
    },
    enabled: !!masjidId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 0, // 👈 biar dianggap "tidak fresh" dan fetch ulang tiap buka
  });

  const { data: profile, isLoading: isLoadingProfile } =
    useQuery<MasjidProfile>({
      queryKey: ["masjid-profile", masjidId],
      queryFn: async () => {
        console.log("[QUERY] Fetching MASJID PROFILE:", masjidId);
        const res = await axios.get(`/public/masjid-profiles/${masjidId}`);
        console.log("[RESPONSE] Profile:", res.data.data);
        return res.data.data;
      },
      enabled: !!masjidId,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: 0,
    });

  if (isLoadingMasjid || !masjid) return <div>Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-4">
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
                <h3 className="text-sm font-bold mb-1">Tahun Didirikan</h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: theme.black2 }}
                >
                  {profile?.masjid_profile_founded_year || "(Belum tersedia)"}
                </p>
              </section>

              {/* Latar Belakang */}
              <section>
                <h3 className="text-sm font-bold mb-1">Latar Belakang</h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: theme.black2 }}
                >
                  {profile?.masjid_profile_story || "(Belum tersedia)"}
                </p>
              </section>

              {/* Tujuan */}
              <section>
                <h3 className="text-sm font-bold mb-1">Visi</h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: theme.black2 }}
                >
                  {profile?.masjid_profile_visi || "(Visi belum tersedia)"}
                </p>
              </section>
              <section>
                <h3 className="text-sm font-bold mb-1">Misi</h3>
                <p
                  className="text-sm leading-relaxed mt-2"
                  style={{ color: theme.black2 }}
                >
                  {profile?.masjid_profile_misi || "(Misi belum tersedia)"}
                </p>
              </section>
              <section>
                <h3 className="text-sm font-bold mb-1">Lainnya</h3>
                <p
                  className="text-sm leading-relaxed mt-2"
                  style={{ color: theme.black2 }}
                >
                  {profile?.masjid_profile_other || ""}
                </p>
              </section>
              {/* Logo, Stempel, TTD Ketua DKM */}
              <section className="mt-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold mb-2">Stempel</p>
                    <img
                      src={
                        profile?.masjid_profile_stamp_url || "/placeholder.png"
                      }
                      alt="Stempel"
                      className="w-48 h-32 object-cover rounded-md border"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold mb-2">Logo</p>
                    <img
                      src={
                        profile?.masjid_profile_logo_url || "/placeholder.png"
                      }
                      alt="Logo"
                      className="w-48 h-32 object-cover rounded-md border"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold mb-2">
                      Tanda Tangan Ketua DKM
                    </p>
                    <img
                      src={
                        profile?.masjid_profile_ttd_ketua_dkm_url ||
                        "/placeholder.png"
                      }
                      alt="TTD Ketua DKM"
                      className="w-48 h-32 object-cover rounded-md border"
                    />
                  </div>
                </div>
                {/* Normal Button Action at bottom of content */}
                <div
                  className="mt-6 pt-4 flex justify-end gap-4 border-t"
                  style={{ borderColor: theme.silver1 }}
                >
                  <CommonButton
                    to="/dkm/profil-masjid/edit-profil-masjid"
                    text="Edit Profil Masjid"
                    variant="outline"
                  />
                  <CommonButton
                    to="/dkm/profil-masjid/edit-masjid"
                    text="Edit Masjid"
                    variant="solid"
                  />
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
