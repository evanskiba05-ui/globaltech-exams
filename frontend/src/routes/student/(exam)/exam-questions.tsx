import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect, useCallback } from "react";
import { useExamHook } from "@/hooks/useExamHook";
import { useConfirmModal } from "@/lib/confirm-modal";

export const Route = createFileRoute("/student/(exam)/exam-questions")({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    totalQuestions,
    currentIndex,
    currentQuestion,
    selectedAnswer,
    selectAnswer,
    isVeryLastQuestion,
    isVeryFirstQuestion,
    currentSubject,
    nextQuestion,
    prevQuestion,
    examStarted,
    examSubmitted,
    startExam,
    currentSubjectId,
    saveAnswer,
    isSubmittingExam,
    optionIdsMap,
  } = useExamHook();

  const navigate = useNavigate();

  useEffect(() => {
    if (examSubmitted) {
      navigate({ to: "/student/subject-result" });
    }
  }, [examSubmitted, navigate]);

  useEffect(() => {
    if (!examStarted && !examSubmitted && currentSubjectId) {
      startExam();
    }
  }, [examStarted, examSubmitted, startExam, currentSubjectId]);

  const handleSelectAnswer = useCallback(async (questionId: string, option: string) => {
    const currentSubState = currentQuestion;
    if (!currentSubState) return;
    
    // Find the real backend optionId for the selected option
    const optionIndex = currentSubState.options.indexOf(option);
    const optionId = optionIndex >= 0 ? optionIdsMap[questionId]?.[optionIndex] ?? null : null;

    selectAnswer(questionId, option);
    if (optionId !== null) {
      await saveAnswer(Number(questionId), optionId);
    }
  }, [currentQuestion, selectAnswer, saveAnswer, optionIdsMap]);

  const confirmModal = useConfirmModal();

  const getPaginationDots = (total: number, current: number) => {
    if (total <= 11) return Array.from({ length: total }, (_, i) => i);
    
    const dots: number[] = [];
    if (current < 5) {
      for (let i = 0; i < 7; i++) dots.push(i);
      dots.push(-2); // trailing ellipsis
      dots.push(total - 1);
    } else if (current > total - 6) {
      dots.push(0);
      dots.push(-1); // leading ellipsis
      for (let i = total - 7; i < total; i++) dots.push(i);
    } else {
      dots.push(0);
      dots.push(-1);
      for (let i = current - 2; i <= current + 2; i++) dots.push(i);
      dots.push(-2);
      dots.push(total - 1);
    }
    return dots;
  };

  console.log(currentSubject,"Subject")

  return (
    <div className="w-full max-w-full h-full flex flex-col">
      <div className="flex-1 flex flex-col overflow-y-auto px-10 pt-8 max-w-full">
        <div className="flex items-center gap-4 mb-5">
          <h3 className="text-[20px] font-semibold text-neutral-800">
            Question <span className="font-bold">{currentIndex + 1}</span> of{" "}
            {totalQuestions}
          </h3>
          <div className="px-8 py-2.5 rounded-full bg-primary-500 flex items-center gap-2">
            {currentSubject && (
              <>
                <span className="text-[14px]">
                  {typeof currentSubject.icon === "string" ? (
                    <img
                      src={currentSubject.icon}
                      alt={currentSubject.name}
                      className="w-5 h-5"
                    />
                  ) : (
                    <currentSubject.icon size={18} />
                  )}
                </span>
                <span className="text-[14px] font-semibold ml-1 text-neutral-50">
                  {currentSubject.name}
                </span>
              </>
            )}  
          </div>
        </div>

        {/* Questions  */}
        <div className="bg-neutral-50 border border-neutral-50 w-full rounded-[14px] p-7 shadow-[0_2px_8px_rgba(0,0,0,0.06)] mb-4">
          <p className="text-[26px] font-medium text-neutral-900 leading-[1.6]">
            {currentQuestion?.text}
          </p>
        </div>

        <div className="bg-neutral-50 overflow-hidden space-y-1">
          {currentQuestion?.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const label = String.fromCharCode(65 + idx); // A, B, C, D...

            return (
              <div
                onClick={() =>
                  handleSelectAnswer(currentQuestion.id, option)
                }
                key={idx}
                className={`flex items-center gap-4 h-[72px] px-6 cursor-pointer border-b border-neutral-50 transition-colors ${isSelected ? "bg-neutral-50 border-l-[5px] border-l-primary-500 " : "bg-neutral-50 border-b-neutral-700"}`}
              >
                <div
                  className={` rounded-full  flex items-center justify-center ${isSelected ? `border-primary-500 border-8 size-6` : `border-neutral-50 border-3 size-6`}`}
                ></div>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[20px] font-medium text-neutral-50 ${isSelected ? `bg-primary-500` : `bg-neutral-700`}`}
                >
                  {label}
                </div>
                <span
                  className={`text-[22px] font-medium ${isSelected ? "text-primary-500" : "text-neutral-700"}`}
                >
                  {option}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* next and prev  */}
      <footer className="shrink-0 h-[72px] bg-neutral-100 border-t border-neutral-200 flex items-center justify-between px-10 ">
          <button
            onClick={prevQuestion}
            disabled={isVeryFirstQuestion}
            className="h-12 px-6 rounded-[12px] border-[1.5px] border-neutral-100 bg-white flex items-center gap-2 text-[15px] font-semibold text-neutral-700 hover:border-neutral-300 transition-all disabled:opacity-50"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Previous
          </button>

          <div className="flex items-center justify-center gap-1.5 w-full mx-4">
            {getPaginationDots(totalQuestions, currentIndex).map((dotIdx) => {
              if (dotIdx < 0) {
                return (
                  <span key={`ellipsis-${dotIdx}`} className="text-neutral-400 tracking-[0.2em] text-[12px] font-bold mx-0.5 mt-1 leading-none">
                    ...
                  </span>
                );
              }
              const i = dotIdx;
              return (
                <div
                  key={i}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'w-6 bg-primary-500' : i < currentIndex ? 'w-2.5 bg-success-500' : 'w-2.5 bg-neutral-300'
                  }`}
                />
              );
            })}
          </div>

          <button
            onClick={() => {
              if (isVeryLastQuestion) {
                confirmModal.open();
              } else {
                nextQuestion();
              }
            }}
            disabled={isSubmittingExam}
            className={`h-12 px-8 rounded-[12px] flex items-center gap-2 text-[15px] font-semibold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]
                ${isVeryLastQuestion ? "bg-success-500 shadow-[#22c55e4d]" : "bg-primary-500 shadow-[#1d4ed84d]"}
                ${isSubmittingExam ? "opacity-50 cursor-not-allowed" : ""}
              `}
          >
            {isVeryLastQuestion ? (isSubmittingExam ? "Submitting..." : "Submit") : "Next"}
            {isVeryLastQuestion ? <Check size={16} /> : <ArrowRight size={16} />}
          </button>
      </footer>
    </div>
  );
}
