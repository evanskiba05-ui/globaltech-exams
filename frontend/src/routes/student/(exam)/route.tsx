import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { useExamHook } from "@/hooks/useExamHook";
import { useEffect, useMemo } from "react";
import { SidebarComponent } from "@/components/sidebar";

export const Route = createFileRoute("/student/(exam)")({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    getSubjects,
    currentSubject,
  } = useExamHook();

  // Memoize so Navbar props only change when the subject actually changes,
  // not every second when timeLeft ticks and causes useExamHook to re-run.
  const navTitle = useMemo(() => currentSubject?.name, [currentSubject]);
  const navIcon = useMemo(() => currentSubject?.icon, [currentSubject]);

  useEffect(() => {
    getSubjects();
  }, [getSubjects]);

  return (
    <div className="h-screen font-dm-sans overflow-hidden">
      <Navbar
        hasStepper={false}
        hasTimer={true}
        title={navTitle}
        icon={navIcon}
      />
      <div className="flex h-[calc(100vh-80px)] mt-20 overflow-hidden">
        <SidebarComponent />
        <div className="flex-1 overflow-y-auto min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

