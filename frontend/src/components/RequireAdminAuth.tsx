import { Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAdminAuthStore } from "@/store/admin-auth";

interface RequireAdminAuthProps {
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const RequireAdminAuth = ({ redirectTo = "/admin/login", fallback }: RequireAdminAuthProps) => {
  const { isAdminAuthenticated, checkAuth } = useAdminAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAdminAuthenticated) {
    if (fallback) return fallback;
    navigate({ to: redirectTo, search: { redirect: location.pathname } });
    return null;
  }

  return <Outlet />;
};

export default RequireAdminAuth;