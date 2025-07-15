// src/components/common/SidebarLink.tsx
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

interface SidebarLinkProps {
  text: string;
  icon?: React.ReactNode;
  to: string;
  isHorizontal?: boolean;
  onClick?: () => void;
  activeBasePath?: string | string[]; // ✅ bisa 1 atau banyak path
}

export function SidebarLink({
  text,
  icon,
  to,
  isHorizontal = false,
  onClick,
  activeBasePath,
}: SidebarLinkProps) {
  const location = useLocation();
  const paths = Array.isArray(activeBasePath)
    ? activeBasePath
    : [activeBasePath ?? to];
  const active = paths.some((path) =>
    path === "/dkm"
      ? location.pathname === "/dkm"
      : location.pathname.startsWith(path)
  );

  return (
    <Link
      to={to}
      onClick={onClick}
      className={clsx(
        isHorizontal
          ? "flex items-center space-x-2 px-3 py-2 w-full rounded-md text-sm font-medium transition-all"
          : "flex flex-col items-center justify-center py-4 px-2 rounded-[24px] transition-all",
        active
          ? "bg-teal-600 text-white"
          : "text-gray-500 hover:bg-teal-200 dark:text-gray-300 dark:hover:bg-teal-700"
      )}
    >
      {icon && <div className="text-xl">{icon}</div>}
      <span>{text}</span>
    </Link>
  );
}
