import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRightIcon } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { SubjectCard } from "./(exam)/-components/student-card";
import Button from "@/components/button";
import CardLayout from "./(exam)/-components/card-layout";
import { useExamHook } from "@/hooks/useExamHook";
import { useConfirmModal } from "@/lib/confirm-modal";

export const Route = createFileRoute("/student/select-subject")({
  component: RouteComponent,
});

function RouteComponent() {
  const { selectSubject, getSubjects, availableSubjects, selectedSubjectIds } = useExamHook();
  const confirmModal = useConfirmModal();

  const [selectedIds, setSelectedIds] = useState<string[]>(selectedSubjectIds && selectedSubjectIds.length > 0 ? selectedSubjectIds : []);

  useEffect(() => {
    getSubjects();
  }, [getSubjects]);

  useEffect(() => {
    if (availableSubjects.length > 0 && selectedIds.length === 0) {
      const storeSelected = selectedSubjectIds || [];
      if (storeSelected.length > 0) {
        setSelectedIds(storeSelected);
      } else {
        const compulsoryIds = availableSubjects
          .filter(s => s.isCompulsory)
          .map(s => s.id);
        
        // Fallback to "eng" if no compulsory subjects defined yet in DB
        const initial = compulsoryIds.length > 0 ? compulsoryIds : ["eng"];
        setSelectedIds(initial);
        selectSubject(initial);
      }
    }
  }, [availableSubjects, selectedSubjectIds, selectSubject]);

  const toggleSubject = (id: string) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : prev.length >= 4
          ? prev
          : [...prev, id];

      // Sync with store
      selectSubject(next);
      return next;
    });
  };

  const compulsoryCount = availableSubjects.filter(s => s.isCompulsory).length || 1;
  const additionalNeeded = 4 - compulsoryCount;
  const currentAdditional = Math.max(0, selectedIds.length - compulsoryCount);
  const progressPercent = (currentAdditional / additionalNeeded) * 100;

  console.log(availableSubjects)
  return (
    <div className=" ">
      <Navbar />

      {/* main  */}
      <div className="py-48">
        <main className="max-w-[80%] mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-center space-y-4"
          >
            <h1 className="text-[24px] font-bold text-neutral-800 leading-[1.3]  -tracking-[0.2px]">
              Choose Your Examination Subjects
            </h1>
            <p className="text-[15px] text-neutral-500 ">
              Select 3 additional subjects to complete your examination bundle
            </p>
          </motion.div>

          {/* Alert Banner */}
          <CardLayout icon="/icons/pin.png">
            {availableSubjects.some(s => s.isCompulsory) ? (
              <>
                <p>
                  <span className="font-bold ">
                    {availableSubjects.filter(s => s.isCompulsory).map(s => s.name).join(", ")} is compulsory
                  </span>{" "}
                  and has been pre-selected.
                </p>
                <p>
                  Please choose{" "}
                  <span className="font-bold ">
                    {4 - availableSubjects.filter(s => s.isCompulsory).length} additional subjects
                  </span> from the
                  list below.
                </p>
              </>
            ) : (
              <p>
                Please choose <span className="font-bold ">4 subjects</span> from the list below.
              </p>
            )}
          </CardLayout>
        </main>
        {/* subject cards  */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-4/5 mx-auto">
          {availableSubjects.map((subject, idx) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              isSelected={selectedIds.includes(subject.id)}
              maxReached={selectedIds.length === 4}
              onToggle={toggleSubject}
              index={idx}
            />
          ))}
        </div>

        {/* Bottom Bar */}
        <footer className="fixed bottom-0 left-0 right-0 py-5 w-full bg-white shadow-neutral-400 border-t border-neutral-200 flex items-center justify-center  z-50">
          <div className="w-4/5 flex mx-auto items-center justify-between">
            <div className="flex items-center text-[14px]">
              <span className="text-neutral-500">Selected:</span>
              <span className="text-neutral-600 font-bold ml-1">
                {currentAdditional}/{additionalNeeded}
              </span>
            </div>

            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="hidden md:block w-200 h-4.25 translate-x-2 bg-neutral-300 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="h-full bg-primary-500 rounded-full"
                />
              </motion.div>

              <Button
                variant="secondary"
                size="medium"
                disabled={selectedIds.length !== 4}
                className="z-50 min-w-[256px] min-h-14.5 text-[18px] shadow-none! justify-center mx-auto"
                onClick={() => confirmModal.open()}
              >
                Confirm Subjects <ArrowRightIcon size={18} />
              </Button>
            </div>
          </div>
        </footer>

        {/* <div className="border w-2777.5 overflow-x-scroll flex h-48 ">
        <div className="w-4xl border"></div>
        <div className="w-4xl border"></div>
        <div className="w-4xl border"></div>
      </div> */}
      </div>
    </div>
  );
}
