import { SidebarLink } from "./SidebarLink";
import clsx from "clsx";

export interface SidebarItem {
  text: string;
  icon?: React.ReactNode;
  to?: string;
  children?: SidebarItem[]; // untuk submenu
  activeBasePath?: string | string[]; // ✅ support array
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
  if (isMobile && !isOpen) return null;

  const sidebarContent = (
    <aside
      className={clsx(
        "py-8 flex flex-col items-center space-y-6",
        isMobile ? "w-64 h-full animate-slide-in-left" : "w-28",
        "bg-teal-100 dark:bg-teal-900"
      )}
      onClick={(e) => isMobile && e.stopPropagation()} // cegah close saat klik sidebar
    >
      <h1 className="text-xs font-bold text-blue-900 dark:text-blue-200">
        MasjidKu
      </h1>
      {items.map((item) => (
        <SidebarLink
          key={item.to}
          text={item.text}
          icon={item.icon}
          to={item.to!}
          activeBasePath={item.activeBasePath} // ✅ pass prop
        />
      ))}
    </aside>
  );

  return sidebarContent;
}
