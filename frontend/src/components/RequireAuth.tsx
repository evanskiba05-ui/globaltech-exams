import { Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

interface RequireAuthProps {
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const RequireAuth = ({ redirectTo = "/student/login", fallback }: RequireAuthProps) => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAuthenticated) {
    if (fallback) return fallback;
    navigate({ to: redirectTo, search: { redirect: location.pathname } });
    return null;
  }

  return <Outlet />;
};

export default RequireAuth;