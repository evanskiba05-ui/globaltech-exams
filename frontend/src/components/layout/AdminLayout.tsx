import { Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import { useAdminAuthStore } from "@/store/admin-auth";

const AUTH_ROUTES = ["/admin/login", "/admin/reset-password"];

export const AdminLayout = () => {
  const { pathname } = useLocation();
  const { isAdminAuthenticated } = useAdminAuthStore();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isAuthRoute) {
    return <Outlet />;
  }

  if (!isAdminAuthenticated) {
    navigate({ to: "/admin/login" });
    return null;
  }

  return (
    <div className="h-screen bg-neutral-100 overflow-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <div className="flex flex-col h-full w-full overflow-x-hidden">
        <TopHeader />

        <motion.main
          className="flex-1 overflow-y-auto pr-5 bg-neutral-100 mt-8 pb-12 font-syne no-scrollbar min-w-0"
          animate={{ marginLeft: isSidebarCollapsed ? 110 : 280 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;
