import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/** Role yang diizinkan */
export type RoleName = "dkm" | "teacher" | "student" | "admin" | "user";

interface Props {
  allowedRoles: RoleName[];
}

/**
 * RequireRoleRoute — Proteksi halaman berdasarkan role
 * memakai data dari React Query (useCurrentUser)
 */
export default function RequireRoleRoute({ allowedRoles }: Props) {
  const { user, role, isLoading, isLoggedIn } = useCurrentUser();
  const location = useLocation();

  // === Loading State ===
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600 dark:text-gray-300">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-3" />
        <p>Memuat akses pengguna...</p>
      </div>
    );
  }

  // === Belum login ===
  if (!isLoggedIn || !user) {
    console.warn("[RequireRoleRoute] User belum login.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // === Cek role user ===
  // === Cek role user ===
  const allowedRoleList: RoleName[] = [
    "dkm",
    "teacher",
    "student",
    "admin",
    "user",
  ];
  const effectiveRole: RoleName = allowedRoleList.includes(role as RoleName)
    ? (role as RoleName)
    : "user";

  const hasAccess = allowedRoles.includes(effectiveRole);

  if (!hasAccess) {
    console.warn("[RequireRoleRoute] Akses ditolak:", {
      userRole: effectiveRole,
      allowedRoles,
    });
    return <Navigate to="/unauthorized" replace />;
  }

  // === Akses diizinkan ===
  return <Outlet />;
}
