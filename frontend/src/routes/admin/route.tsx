import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const PUBLIC_ROUTES = ["/admin/login", "/admin/reset-password"];
    if (PUBLIC_ROUTES.includes(location.pathname)) return;
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate({ to: "/admin/login" });
    }
  }, [navigate, location.pathname]);

  return <Outlet />;
}
