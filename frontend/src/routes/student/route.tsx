import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/student")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/student/login") return;
    const token = localStorage.getItem("student_token");
    if (!token) {
      navigate({ to: "/student/login", search: { redirect: location.pathname } });
    }
  }, [navigate, location.pathname]);

  return (
    <div className="min-h-screen font-dm-sans overflow-auto">
      <Outlet />
    </div>
  );
}
