import React from "react";
import { Bell, ChevronRight } from "lucide-react";
import { useLocation } from "@tanstack/react-router";
import dayjs from "dayjs";
import Logo from "@/components/logo";

const breadcrumbLabels: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/dashboard/students": "Students Management",
  "/admin/dashboard/questions": "Questions Management",
  "/admin/dashboard/exams": "Exams Management",
  "/admin/dashboard/results": "Results",
  "/admin/dashboard/settings": "Settings",
};

const TopHeader: React.FC = () => {
  const { pathname } = useLocation();
  const currentLabel = breadcrumbLabels[pathname] || "Dashboard";

  return (
    <header className=" bg-primary-450  flex w-full items-center font-dm-sans justify-between px-6 py-4 shrink-0 relative z-1000">
      <div className="flex items-center gap-20">
        <div className="flex items-center gap-6">
          <div className="size-10">
            <Logo variant="small" />
          </div>
          <div className="flex flex-col">
            <span className="text-primary-100 text-[22px] font-semibold leading-tight">
              GlobalTech CBT
            </span>
            <span className="text-primary-200 text-[18px] leading-tight">
              Admin Portal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 font-inter text-[14px]">
          <span className="text-primary-200 text-[18px] font-normal">
            Admin
          </span>
          <ChevronRight size={14} className="text-secondary-300" />
          <span className="text-white font-semi-bold text-[20px]">
            {currentLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center text-white hover:bg-white/25 transition-colors cursor-pointer group">
          <Bell size={20} strokeWidth={2} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error-500 rounded-full border-2 border-secondary-700 group-hover:scale-110 transition-transform pulse-animation"></span>
        </button>
        <span className="text-primary-200 font-dm-sans font-semibold text-[20px]">
          {dayjs().format("DD MMM YYYY")}
        </span>
      </div>
    </header>
  );
};

export default TopHeader;
