import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Button from "./button";
import type { Subject } from "@/lib/d-types";
import CardLayout from "@/routes/student/(exam)/-components/card-layout";
import { useExamHook } from "@/hooks/useExamHook";

const dotColors = [
  {
    dotColor: "#2563eb",
  },
  { dotColor: "#a855f7" },
  { dotColor: "#ef4444" },
  { dotColor: "#f59e0b" },
];

interface ConfirmModalProps {
  idx: string[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const ConfirmSubjectModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  idx,
  onConfirm,
  isSubmitting = false,
}) => {
  
  const {
    getAllResults,
    getResultsBySubject,
    availableSubjects
  } = useExamHook()

  const SELECTED_SUBJECTS: Subject[] = availableSubjects.filter((subj) =>
    idx.includes(subj.id),
  );

  const totalQuestions = SELECTED_SUBJECTS.reduce(
    (acc, sum) => acc + sum.questions,
    0,
  );

  const currentResult = getResultsBySubject()
  const allResults = getAllResults()
  const content = isSubmitting ? (
    <p>
      ⚠️
      <span>You have </span>
      <span className="font-bold">
        {allResults.remaining} {" "}
      </span>
      <span>
        unanswered questions. These will 
        <br />
        score zero.
      </span>
    </p>
  ) : (
    <p>
      ⚠️
      <span>Once you begin, you </span>
      <span className="font-bold">
        cannot change your subjects.
      </span>
      <br />
      <span>
        Ensure your selection is correct before proceeding.
      </span>
    </p>
  );
  return (
    <>
      <div>
        {isOpen && (
          <div className="fixed overflow-hidden inset-0 z-50 flex items-center justify-center font-dm-sans">
            {/* Backdrop Overlay */}
            <div
              onClick={onClose}
              className="absolute inset-0 bg-primary-600/50 backdrop-blur-[2px]" // rgba(...)
            />

            {/* Modal Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                            duration: 0.2,
                            scale: { type: "spring", visualDuration: 0.2, bounce: 0.5 },
                        }}
              className="relative w-2/4 flex flex-col justify-center items-center max-w-[95vw] bg-neutral-100 rounded-[18px]  overflow-hidden"
            >
              {/* 1. Modal Header Strip */}
              <div className={`h-17 ${isSubmitting ? "bg-error-500" : "bg-primary-500"} flex items-center w-full justify-center gap-3 px-6`}>
                <span className="text-[28px]" role="img" aria-label="book">
                  {isSubmitting ? "⚠️" : "📖"}
                </span>
                <h2 className="text-[22px] font-bold text-white tracking-[-0.2px] leading-[1.3]">
                  {isSubmitting ? "Submit Examination" : "Confirm Your Subject Selection"}
                </h2>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-7 md:px-10 md:py-8 flex flex-col">
                {isSubmitting && (
                  <>
                  <div className="flex items-center justify-between mb-1 text-[16px] font-semibold  text-neutral-600 ">
                <span className=" w-1/2 tracking-[1.5px] uppercase">SUBJECT</span>
                <span className=" w-1/3   tracking-[1.5px] uppercase text-center">ANSWERED</span>
                <span className=" w-1/3   tracking-[1.5px] uppercase text-right">REMAINING</span>
              </div>
              <div className="w-full h-[1px] bg-neutral-500 my-4" />
                  </>
                )}
                {/* 3. Subject List */}
                <div className="flex flex-col gap-5">
                  {SELECTED_SUBJECTS.map((subject, index) => {
                    const currentResultSubject = currentResult.find((s: any) => s.slug === subject.slug);
                    const answeredCount = currentResultSubject
                      ? (currentResultSubject.correct ?? 0) + (currentResultSubject.wrong ?? 0)
                      : 0;
                    return (
                      <motion.div key={subject.id} className="flex items-center justify-between w-full">
                      <div className="flex items-center w-1/2  ">
                        <div
                          className="w-3 h-3 rounded-full mr-4 shrink-0"
                          style={{ backgroundColor: dotColors[index].dotColor }}
                        />
                        <span className="text-[18px] md:text-[20px] font-bold text-[#1e293b] leading-[1.3] tracking-[-0.1px]">
                          {subject.name}
                        </span>
                        {subject.isCompulsory && (
                          <span
                            className="ml-2 text-[16px] text-accent-500"
                            role="img"
                            aria-label="lock"
                          >
                            🔒
                          </span>
                        )}
                      </div>

                     {isSubmitting && (
                     <div className="flex font-bold w-1/2 justify-between">
                      <div className="text-[14px] md:text-[16px] text-center text-success-500 w-1/3  font-normal text-[#94a3b8] leading-[1.3]">
                      {answeredCount}
                      </div>
                      <div className="text-[14px] w-1/3 text-center text-error-500  md:text-[16px] font-normal  leading-[1.3]">
                        {currentResultSubject?.unanswered ?? subject.questions}
                      </div>
                      </div>
                     )}
                     {!isSubmitting && (
                      <div className="text-[14px] w-1/3 text-center  md:text-[16px] font-normal text-[#94a3b8] leading-[1.3]">
                        {subject.questions} Questions
                      </div>
                     )}
                    </motion.div>
                    )
                  })}
                </div>

                {/* 4. Total Questions Row */}
               {!isSubmitting && (
                 <motion.div className="mt-6 w-full h-15 bg-[#dde3f0] rounded-xl px-6 flex items-center justify-between">
                  <span className="text-[16px] font-semibold text-primary-500">
                    Total Questions
                  </span>
                  <span className="text-[18px] font-bold text-[#1e293b]">
                    {totalQuestions} Questions.&nbsp;&nbsp;2Hours
                  </span>
                </motion.div>
               )}

                {/* 5. Warning Alert Box */}
                <CardLayout>
                 {content}
                </CardLayout>

                {/* 6. Button Row */}
                <div className=" flex flex-col md:flex-row items-center justify-between">
                  {/* Go Back Button (30%) */}
                  <Button
                    onClick={onClose}
                    variant="bordered"
                    size="medium"
                    className=" h-[52px] text-white rounded-[12px] flex items-center justify-center gap-2 transition-all duration-150 hover:border-[#94a3b8] hover:text-[#64748b] active:scale-[0.98]"
                  >
                    <ArrowLeft
                      className="w-[16px] h-[16px] text-[#94a3b8]"
                      strokeWidth={2}
                    />
                    <span className="text-[16px] font-[500] text-[#94a3b8]">
                      {isSubmitting ? "Continue Reviewing" : "Go Back"}                    </span>
                  </Button>

                  {/* Begin Exam Button (65%) */}
                  <Button
                    variant={isSubmitting ? "error" : "secondary"}
                    size="medium"
                    className="shadow-none! "
                    onClick={onConfirm}
                  >
                    {isSubmitting ? "✅ Yes Submit Now" : "Begin Examination"}
                    {!isSubmitting && <ArrowRight />}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};
