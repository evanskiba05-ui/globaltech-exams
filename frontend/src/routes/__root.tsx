import { createRootRoute, Outlet, useNavigate, useLocation, useBlocker } from "@tanstack/react-router";
import { ConfirmSubjectModal } from "@/components/modal";
import { useEffect, useState } from "react";
import { useExamHook } from "@/hooks/useExamHook";
import { useExamStore } from "@/store/exam";
import { AlertWrapper } from "@/wrapper/alert-wrapper";
import { ConfirmModalCtx } from "@/lib/confirm-modal";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmModal = {
    isOpen: confirmOpen,
    open: () => setConfirmOpen(true),
    close: () => setConfirmOpen(false),
  };
  const {
    selectSubject,
    selectedSubjectIds: selectedIds,
    startExam,
    submitExam,
    fetchExamResult,
    timeLeft,
    examStarted,
    examSubmitted,
  } = useExamHook();

  const tickTimer = useExamStore((state) => state.tickTimer);

  const router = useNavigate();
  const location = useLocation();
  const isSubmittingRoute = location.pathname.includes("/exam");

  useEffect(() => {
    if (confirmOpen && isSubmittingRoute) {
      fetchExamResult();
    }
  }, [confirmOpen, isSubmittingRoute, fetchExamResult]);

  useEffect(() => {
    if (examStarted && !examSubmitted) {
      const interval = setInterval(tickTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [examStarted, examSubmitted, tickTimer]);

  useEffect(() => {
    if (timeLeft === 0 && examStarted && !examSubmitted) {
      submitExam();
    }
  }, [timeLeft, examStarted, examSubmitted, submitExam]);

  useBlocker({
    shouldBlockFn: ({ next }) => {
      if (!examStarted || examSubmitted) return false;
      const allowedPaths = ["/student/exam-questions", "/student/subject-result", "/student/overall-result"];
      return !allowedPaths.some((path) => next.pathname.startsWith(path));
    },
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (examStarted && !examSubmitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [examStarted, examSubmitted]);

  return (
    <div className="h-screen w-screen overflow-y-scroll no-scrollbar">
        <ConfirmModalCtx.Provider value={confirmModal}>
        <Outlet />

        <AlertWrapper />
        
        {confirmModal.isOpen && (
          <ConfirmSubjectModal
            isOpen={confirmModal.isOpen}
            onClose={confirmModal.close}
            idx={selectedIds}
            isSubmitting={isSubmittingRoute}
            onConfirm={async () => {
              confirmModal.close();
              if (isSubmittingRoute) {
                await submitExam();
                router({ to: "/student/subject-result" });
              } else {
                selectSubject(selectedIds);
                await startExam(selectedIds);
                router({ to: "/student/exam-questions" });
              }
            }}
          />
        )}
        </ConfirmModalCtx.Provider>
    </div>
  );
}
