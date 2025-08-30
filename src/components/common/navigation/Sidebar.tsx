import { SidebarLink } from "./SidebarLink";
import clsx from "clsx";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

export interface SidebarItem {
  text: string;
  icon?: React.ReactNode;
  to?: string;
  children?: SidebarItem[];
  activeBasePath?: string | string[];
}

interface SidebarProps {
  items: SidebarItem[];
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  items,
  isMobile = false,
  isOpen,
  onClose,
}: SidebarProps) {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  if (isMobile && !isOpen) return null;

  const sidebarContent = (
    <aside
      className={clsx(
        "py-8 flex flex-col items-center space-y-6",
        isMobile ? "w-64 h-full animate-slide-in-left" : "w-28"
      )}
      style={{ backgroundColor: theme.primary2 }}
      onClick={(e) => isMobile && e.stopPropagation()}
    >
      <h1 className="text-xl font-bold" style={{ color: theme.quaternary }}>
        Masjid
      </h1>

      {items.map((item) => (
        <SidebarLink
          key={item.to}
          text={item.text}
          icon={item.icon}
          to={item.to!}
          activeBasePath={item.activeBasePath}
        />
      ))}
    </aside>
  );

  return sidebarContent;
}
