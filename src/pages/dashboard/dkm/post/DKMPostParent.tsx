import { Outlet, useLocation } from "react-router-dom";
import { BookOpen, Star } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import DashboardSidebar, {
  SidebarMenuItem,
} from "@/components/common/navigation/SidebarMenu";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

interface TokenPayload {
  masjid_admin_ids: string[];
}

export default function DKMPostParent() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const location = useLocation();

  const sidebarMenus: SidebarMenuItem[] = [
    { name: "Terbaru", icon: <BookOpen />, to: "/dkm/post" },
    { name: "Tema", icon: <Star />, to: "/dkm/post-tema" },
  ];

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
