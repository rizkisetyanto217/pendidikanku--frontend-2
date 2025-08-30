import { Outlet, useLocation } from "react-router-dom";
import { Users, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import DashboardSidebar, {
  SidebarMenuItem,
} from "@/components/common/navigation/SidebarMenu";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function DKMProfilMasjidParent() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const location = useLocation();

  const { user, isLoggedIn, isLoading: isUserLoading } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0];

  const sidebarMenus: SidebarMenuItem[] = [
    {
      name: "Profil Masjid",
      icon: <Building2 />,
      to: "/dkm/profil-masjid",
    },
    { name: "DKM & Pengajar", icon: <Users />, to: "/dkm/profil-dkm" },
  ];

  const { isLoading: isMasjidLoading } = useQuery({
    queryKey: ["masjid", masjidId],
    queryFn: async () => {
      const res = await axios.get(`/public/masjids/verified/${masjidId}`, {
        withCredentials: true, // ⬅️ untuk kirim cookie jika perlu
      });
      return res.data.data;
    },
    enabled: !!masjidId && isLoggedIn && !isUserLoading,
    staleTime: 0,
  });

  if (isUserLoading || isMasjidLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-64 shrink-0">
        <DashboardSidebar menus={sidebarMenus} title="Profil" />
      </div>

      <div className="flex-1">
        <div
          className="p-6 rounded-xl shadow-sm"
          style={{ backgroundColor: theme.white1, color: theme.black1 }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
