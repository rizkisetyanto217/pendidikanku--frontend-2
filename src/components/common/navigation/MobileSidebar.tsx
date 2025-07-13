import { useEffect, useState } from "react";
import { SidebarItem } from "@/components/common/navigation/Sidebar";
import { SidebarLink } from "./SidebarLink";
import clsx from "clsx";
import { useLocation } from "react-router-dom";
import SidebarSubLink from "./SidebarSubLink";

interface MobileSidebarProps {
  items: SidebarItem[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({
  items,
  isOpen,
  onClose,
}: MobileSidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const location = useLocation();

  // Reset + expand menu sesuai path saat sidebar dibuka
  useEffect(() => {
    if (!isOpen) return;

    const matchedParents = items
      .filter((item) =>
        item.children?.some((child) => location.pathname.startsWith(child.to!))
      )
      .map((item) => item.text);

    setExpandedMenus(matchedParents);
  }, [isOpen, items, location.pathname]);

  const toggleExpand = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50" />

      {/* Sidebar */}
      <aside
        className={clsx(
          "relative z-50 w-64 h-full py-8 px-4 animate-slide-in-left",
          "bg-teal-100 dark:bg-teal-900 flex flex-col space-y-4"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-sm font-bold text-blue-900 dark:text-blue-200 text-center mb-4">
          MasjidKu
        </h1>

        {items.map((item) =>
          item.children ? (
            <ExpandableMenu
              key={item.text}
              item={item}
              isExpanded={expandedMenus.includes(item.text)}
              toggleExpand={toggleExpand}
              onClose={onClose}
            />
          ) : (
            <SidebarLink
              key={item.to}
              text={item.text}
              icon={item.icon}
              to={item.to!}
              isHorizontal
              onClick={onClose}
            />
          )
        )}
      </aside>
    </div>
  );
}

interface ExpandableMenuProps {
  item: SidebarItem;
  isExpanded: boolean;
  toggleExpand: (label: string) => void;
  onClose: () => void;
}

function ExpandableMenu({
  item,
  isExpanded,
  toggleExpand,
  onClose,
}: ExpandableMenuProps) {
  const location = useLocation();
  const isChildActive = item.children?.some((child) =>
    location.pathname.startsWith(child.to!)
  );

  return (
    <div className="w-full">
      <button
        onClick={() => toggleExpand(item.text)}
        className={clsx(
          "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md",
          isChildActive
            ? "bg-teal-600 text-white"
            : " text-teal-900 dark:text-white"
        )}
      >
        <div className="flex items-center space-x-2">
          {item.icon && <span className="text-lg">{item.icon}</span>}
          <span>{item.text}</span>
        </div>
        <span>{isExpanded ? "▾" : "▸"}</span>
      </button>

      {isExpanded && (
        <div className="ml-6 mt-2 space-y-2">
          {item.children?.map((child) => (
            <SidebarSubLink
              key={child.to}
              text={child.text}
              icon={child.icon}
              to={child.to!}
              onClick={onClose} // ⬅️ ini dia
            />
          ))}
        </div>
      )}
    </div>
  );
}
