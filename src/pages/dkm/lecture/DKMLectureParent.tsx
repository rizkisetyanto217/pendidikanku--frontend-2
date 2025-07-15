import { Outlet, useLocation } from "react-router-dom";
import { BookOpen, Star } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import DashboardSidebar, {
  SidebarMenuItem,
} from "@/components/common/navigation/SidebarMenu";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";

interface TokenPayload {
  masjid_admin_ids: string[];
}

export default function DKMLectureParent() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const location = useLocation();

  const sidebarMenus: SidebarMenuItem[] = [
    { name: "Terbaru", icon: <BookOpen />, to: "/dkm/kajian" },
    { name: "Tema", icon: <Star />, to: "/dkm/tema" },
  ];

  const token = sessionStorage.getItem("token");
  const masjidId = token
    ? jwtDecode<TokenPayload>(token).masjid_admin_ids?.[0]
    : null;

  const { isLoading } = useQuery({
    queryKey: ["masjid", masjidId],
    queryFn: async () => {
      const res = await axios.get(`/public/masjids/verified/${masjidId}`);
      return res.data.data;
    },
    enabled: !!masjidId,
    staleTime: 0,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-64 shrink-0">
        <DashboardSidebar menus={sidebarMenus} title="Kajian" />
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
