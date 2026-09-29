import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import { useAdminAuthStore } from "@/store/admin-auth";
import { useNavigate } from "@tanstack/react-router";
import { getUserInitials } from "@/lib/helper";
import { useLocation } from "@tanstack/react-router";
import { MdMenuOpen } from "react-icons/md";
import { PiExamFill, PiPowerBold, PiUsersFill } from "react-icons/pi";
import { FaQuestion } from "react-icons/fa";
import { LuClipboardPenLine } from "react-icons/lu";
import { IoMdSettings } from "react-icons/io";
import { RiMenuUnfold3Line, RiDashboardFill } from "react-icons/ri";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { admin, adminLogout } = useAdminAuthStore();
  const navigate = useNavigate();
  const {pathname} = useLocation();

  const navItems = [
    { id: "dashboard", icon: RiDashboardFill, label: "Dashboard", active: pathname === "/admin/dashboard", path:"/admin/dashboard" },
    { id: "students", icon: PiUsersFill, label: "Students", active: pathname === "/admin/dashboard/students", path:"/admin/dashboard/students" },
    { id: "questions", icon: FaQuestion, label: "Questions", iconColor: "#f87171", active: pathname === "/admin/dashboard/questions", path:"/admin/dashboard/questions" },
    { id: "exams", icon: PiExamFill, label: "Exams", iconColor: "#fbbf24", active: pathname === "/admin/dashboard/exams", path:"/admin/dashboard/exams" },
    { id: "results", icon: LuClipboardPenLine, label: "Results", active: pathname === "/admin/dashboard/results", path:"/admin/dashboard/results" },
    { id: "settings", icon: IoMdSettings, label: "Settings", active: pathname === "/admin/dashboard/settings", path:"/admin/dashboard/settings" },
  ];

  const handleLogout = () => {
    adminLogout();
    navigate({ to: "/admin/login" });
  };



  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 90 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-screen bg-primary-450 flex flex-col fixed left-0 top-0 overflow-hidden z-20"
    >
      {/* Sidebar Header */}
      <div className={`h-[64px] flex items-center justify-between ${isCollapsed ? "mx-auto" : "px-4"} pt-25 shrink-0`}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white opacity-70 hover:opacity-100 transition-opacity cursor-pointer ml-auto "
        >
          {isCollapsed ? <RiMenuUnfold3Line  className="size-8"/> : <MdMenuOpen className="size-8"/>}
        </button>
      </div>

      {/* Profile Block */}
      <div className={`px-4 py-5 flex items-center gap-3 overflow-hidden ${isCollapsed ? "mx-auto" : ""}`}>
        <div className="w-12 h-12 bg-secondary-400 rounded-full flex items-center justify-center shrink-0 font-bold text-white font-inter text-[16px]">
          {getUserInitials(admin?.full_name) || "SA"}
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col whitespace-nowrap min-w-0"
          >
            <span className="text-[15px] font-semibold text-white font-inter truncate">
              {admin?.full_name || "Super Admin"}
            </span>
            <span className="text-[12px] text-secondary-300 font-inter truncate">
              {admin?.email || "admin@globaltech.ng"}
            </span>
          </motion.div>
        )}
      </div>

      <div className="px-4 mb-4">
        <div className="h-[1px] bg-primary-400 w-full" />
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col px-3 overflow-y-auto no-scrollbar">
        {!isCollapsed && (
          <p className="text-[14px] font-bold text-primary-300 font-inter uppercase tracking-[0.12em] px-4 pt-4 pb-2">
            MAIN MENU
          </p>
        )}
        <nav className={`flex flex-col gap-1 ${isCollapsed ? "mx-auto" : "ml-5 mr-2"} font-dm-sans text-[18px] mt-4 space-y-5`}>
          {navItems.map((item) => (
            <div
            onClick={() => navigate({to:item.path})}
              key={item.id}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all group relative ${
                item.active ? "bg-secondary-500 text-white" : "text-primary-200 hover:bg-white/8"
              } `}
            >
           
                <item.icon 
                  size={24} 
                  style={{ color: item.iconColor && !item.active ? item.iconColor : "currentColor" }}
                  className="shrink-0"
                />
              {!isCollapsed && (
                <span className=" font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
              {item.active && !isCollapsed && (
                <motion.div 
                  layoutId="active-dot"
                  className="absolute right-3 w-2 h-2 rounded-full bg-accent-500 animate-pulse"
                />
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className={`mt-auto `}>
        <div className="px-4 py-2">
          <div className="h-[1px] bg-[#2a4d7a] w-full" />
        </div>
        <button 
          onClick={handleLogout}
          className={`flex items-center gap-3 px-6 py-4 w-full text-error-500 hover:text-error-500/80 transition-colors cursor-pointer  mb-4 ${isCollapsed ? "" : "ml-5 mr-2"}`}
        >
          <PiPowerBold size={20} strokeWidth={2} className={`shrink-0 ${isCollapsed ? "mx-auto" : ""}`} />
          {!isCollapsed && (
            <span className="text-[15px] font-medium font-inter">Sign Out</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
