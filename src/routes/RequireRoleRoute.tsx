import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "@/lib/axios";

type Props = {
  allowedRoles: string[];
};

export default function RequireRoleRoute({ allowedRoles }: Props) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api
      .get("/api/auth/me")
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
        Memuat akses...
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
