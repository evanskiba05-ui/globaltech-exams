import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { useExamHook } from "@/hooks/useExamHook";
import { useExamStore } from "@/store/exam";
import { useConfirmModal } from "@/lib/confirm-modal";

export const SidebarComponent = () => {
  const {
    selectedSubjects,
    currentSubjectId,
    setCurrentSubject,
    questions,
    jumpToQuestion,
    currentIndex,
    answers,
  } = useExamHook();
  
  const subjectState = useExamStore((state) => state.subjectState);
  const confirmModal = useConfirmModal();

  return (
    <aside className="w-[460px] h-full bg-primary-450 flex flex-col px-5 pt-6 pb-8 shrink-0">
      <div className="flex flex-col gap-1">
        {selectedSubjects.map((sub: any, idx: number) => {
          const isActive = currentSubjectId === sub.id;
          const subState = subjectState[sub.id];
          const answeredCount = subState ? Object.keys(subState.answers).length : 0;
          const totalQuestions = sub.questions;

          const progress =
            totalQuestions > 0
              ? (answeredCount / totalQuestions) * 100
              : 0;

          const Icon = sub.icon;

          return (
            <motion.div
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0.7,
                borderLeftColor: isActive ? sub.color : "transparent",
              }}
              key={idx}
              onClick={() => {
                setCurrentSubject(sub.id);
              }}
              className={`cursor-pointer px-5 py-2 rounded-xl flex flex-col justify-center ${isActive ? `bg-neutral-500/30 border-l-[6px] ` : ``}`}
            >
              <div
                className={`h-[52px] flex items-center justify-between  transition-colors `}
              >
                <div className="flex items-center">
                  <span
                    className={isActive ? "text-white" : "text-neutral-400"}
                    style={{ color: isActive ? "#fff" : sub.color }}
                  >
                    {typeof Icon === "string" ? (
                      <img src={Icon} alt={sub.name} className="w-5 h-5" />
                    ) : Icon ? (
                      <Icon size={18} />
                    ) : null}
                  </span>
                  <span className="ml-2 text-[16px] font-bold text-white">
                    {sub.name}
                  </span>
                </div>
                <span
                  className={`text-[13px] font-normal ${isActive ? `text-white` : `text-neutral-400`}`}
                >
                  {answeredCount}/{totalQuestions}
                </span>
              </div>
              <div className="w-full h-1 bg-neutral-400 rounded-full mt-1 mb-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full rounded-full "
                  style={{ backgroundColor: sub.color }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 mb-3">
        <span className="text-[11px] font-bold text-neutral-400 tracking-[1.5px] uppercase">
          QUESTION NAVIGATOR
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-7 gap-2">
          {questions.map((q, i) => {
            const isCurrent = Number(currentIndex) === i;
            // const isAnswered = i < answeredCount[activeSubject];

            const isAnswered = answers && q.id in answers;
            return (
              <motion.button
                key={i}
                onClick={() => jumpToQuestion(q.id)}
                className={`w-[42px] h-[42px] rounded-[10px] cursor-pointer text-[14px] font-regular flex text-neutral-400 items-center justify-center transition-all
                      ${isAnswered ? "bg-success-500 text-secondary-100" : "bg-neutral-500/30 border "}
                      ${isCurrent && !isAnswered ? "border-2 border-accent-400 bg-primary-500 text-secondary-100" : ""}
                      ${isCurrent && isAnswered ? "ring-2 ring-neutral-50 ring-inset text-secondary-100" : ""}
                    `}
              >
                {i + 1}
              </motion.button>
            );
          })}
        </div>
      </div>

      <button 
        onClick={() => confirmModal.open()}
        className="mt-4 w-full py-3 rounded-[10px] border-[1.5px] border-error-500 text-error-500 text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-error-500/10 transition-colors">
        <AlertTriangle size={16} />
        Submit Examination
      </button>
    </aside>
  );
};
