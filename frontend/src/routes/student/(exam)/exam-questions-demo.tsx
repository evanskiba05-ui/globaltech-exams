import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  BookOpen,
  FlaskConical,
  Atom,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/student/(exam)/exam-questions-demo')({
  component: RouteComponent,
})

function RouteComponent() {

  // --- Types & Constants ---

  type SubjectKey = "English" | "Math" | "Physics" | "Chemistry";

  interface SubjectInfo {
    id: SubjectKey;
    name: string;
    totalQuestions: number;
    icon: React.ReactNode;
    color: string;
  }

  const SUBJECT_CONFIG: Record<SubjectKey, SubjectInfo> = {
    English: {
      id: "English",
      name: "English Language",
      totalQuestions: 60,
      icon: <BookOpen size={18} />,
      color: "#2563eb",
    },
    Math: {
      id: "Math",
      name: "Mathematics",
      totalQuestions: 40,
      icon: <TrendingUp size={18} />,
      color: "#ec4899",
    },
    Physics: {
      id: "Physics",
      name: "Physics",
      totalQuestions: 40,
      icon: <Atom size={18} />,
      color: "#ef4444",
    },
    Chemistry: {
      id: "Chemistry",
      name: "Chemistry",
      totalQuestions: 40,
      icon: <FlaskConical size={18} />,
      color: "#f59e0b",
    },
  };

  // --- Main Component ---
    const [activeSubject, setActiveSubject] = useState<SubjectKey>("English");
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0); // 0-based
    const [answeredCount, setAnsweredCount] = useState<
      Record<SubjectKey, number>
    >({
      English: 1,
      Math: 0,
      Physics: 0,
      Chemistry: 0,
    });
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const subject = SUBJECT_CONFIG[activeSubject];
    const isLastQuestion =
      activeSubject === "Chemistry" &&
      currentQuestionIdx === subject.totalQuestions - 1;

    return (
      <div className="flex flex-col h-screen w-full bg-[#f0f4f8] overflow-hidden ">
        {/* 1. NAVBAR */}
        <nav className="h-16 bg-[#1e3a5f] flex items-center justify-between px-6 z-50 shrink-0">
          <div className="flex items-center">
            <div className="w-9 h-9 bg-[#f97316] rounded-lg flex items-center justify-center text-white">
              <GraduationCap size={20} strokeWidth={2.5} />
            </div>
            <span className="ml-3 text-[15px] font-semibold text-white">
              GlobalTech CBT
            </span>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center text-white">
            <span className="text-2xl mr-2">
              {activeSubject === "Chemistry" ? "🧪" : "📖"}
            </span>
            <h2 className="text-[20px] font-bold tracking-[-0.2px]">
              {subject.name}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <span className="text-[13px] font-normal text-[#94a3b8] tracking-[0.5px] mr-3">
                TIME LEFT:
              </span>
              <span className="text-[22px] font-bold text-white tabular-nums">
                02 : 00 : 00
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-[14px] font-bold">
                AO
              </div>
              <span className="text-[15px] font-medium text-white">Adaeze</span>
            </div>
          </div>
        </nav>

        <div className="flex flex-1 overflow-hidden">
          {/* 2. LEFT SIDEBAR */}
          <aside className="w-[460px] bg-[#1e3a5f] flex flex-col px-5 pt-6 pb-5 shrink-0">
            <div className="flex flex-col gap-1">
              {(Object.keys(SUBJECT_CONFIG) as SubjectKey[]).map((key) => {
                const sub = SUBJECT_CONFIG[key];
                const isActive = activeSubject === key;
                const progress =
                  (answeredCount[key] / sub.totalQuestions) * 100;

                return (
                  <div
                    key={key}
                    onClick={() => {
                      setActiveSubject(key);
                      setCurrentQuestionIdx(0);
                    }}
                    className="cursor-pointer"
                  >
                    <div
                      className={`h-[52px] flex items-center justify-between px-3 rounded-[10px] transition-colors ${isActive ? `bg-[#2d4a6e] border-l-[3px] border-[#f59e0b]` : ``}`}
                    >
                      <div className="flex items-center">
                        <span
                          className={isActive ? "text-white" : "text-[#94a3b8]"}
                          style={{ color: isActive ? "#fff" : sub.color }}
                        >
                          {sub.icon}
                        </span>
                        <span className="ml-2 text-[14px] font-semibold text-white">
                          {sub.name}
                        </span>
                      </div>
                      <span
                        className={`text-[13px] font-normal ${isActive ? `text-white` : `text-[#94a3b8]`}`}
                      >
                        {answeredCount[key]}/{sub.totalQuestions}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[#0f2744] rounded-full mt-1 mb-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: sub.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 mb-3">
              <span className="text-[11px] font-bold text-[#94a3b8] tracking-[1.5px] uppercase">
                QUESTION NAVIGATOR
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: subject.totalQuestions }).map((_, i) => {
                  const isCurrent = currentQuestionIdx === i;
                  const isAnswered = i < answeredCount[activeSubject];
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentQuestionIdx(i)}
                      className={`w-[42px] h-[42px] rounded-[10px] text-[13px] font-bold flex items-center justify-center transition-all
                      ${isAnswered ? "bg-[#22c55e] text-white" : "bg-[#2d4a6e] text-[#94a3b8]"}
                      ${isCurrent && !isAnswered ? "border-2 border-[#f59e0b] bg-[#1e3a5f] text-white" : ""}
                      ${isCurrent && isAnswered ? "ring-2 ring-white ring-inset" : ""}
                    `}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="mt-auto w-full py-3 rounded-[10px] border-[1.5px] border-[#ef4444] text-[#ef4444] text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-[#ef444414] transition-colors">
              <AlertTriangle size={16} />
              Submit Examination
            </button>
          </aside>

          {/* 3. RIGHT CONTENT PANEL */}
          <main className="flex-1 flex flex-col relative">
            <div className="flex-1 overflow-y-auto px-10 pt-8 pb-24">
              <div className="flex items-center gap-4 mb-5">
                <h3 className="text-[16px] font-semibold text-[#1e293b]">
                  Question{" "}
                  <span className="font-bold">{currentQuestionIdx + 1}</span> of{" "}
                  {subject.totalQuestions}
                </h3>
                <div className="px-4 py-1.5 rounded-full bg-[#2563eb] flex items-center gap-2">
                  <span className="text-[14px]">
                    {activeSubject === "Chemistry" ? "🧪" : "📖"}
                  </span>
                  <span className="text-[13px] font-semibold text-white">
                    {subject.name}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-7 shadow-[0_2px_8px_rgba(0,0,0,0.06)] mb-4">
                <p className="text-[19px] font-medium text-[#1e293b] leading-[1.6]">
                  {activeSubject === "Chemistry"
                    ? "What is the atomic number of Carbon in the periodic table of elements?"
                    : "The professor's lecture was so ____that many students struggled to stay awake. Choose the most appropriate word to fill the blank."}
                </p>
              </div>

              <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden">
                {["A", "B", "C", "D"].map((letter, idx) => {
                  const options =
                    activeSubject === "Chemistry"
                      ? ["4", "6", "8", "12"]
                      : [
                          "Captivating",
                          "Monotonous",
                          "Invigorating",
                          "Stimulating",
                        ];
                  const isSelected = selectedOption === letter;

                  return (
                    <div
                      key={letter}
                      onClick={() => setSelectedOption(letter)}
                      className={`h-[72px] flex items-center gap-4 px-6 cursor-pointer border-b border-[#e2e8f0] last:border-b-0 transition-colors
                      ${isSelected ? "bg-[#eff6ff] border-l-[3px] border-[#2563eb]" : "bg-white"}
                    `}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? `border-[#2563eb]` : `border-[#cbd5e1]`}`}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
                        )}
                      </div>
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[15px] font-bold text-white ${isSelected ? `bg-[#2563eb]` : `bg-[#1e293b]`}`}
                      >
                        {letter}
                      </div>
                      <span
                        className={`text-[17px] ${isSelected ? `font-semibold text-[#2563eb]` : `font-normal text-[#1e293b]`}`}
                      >
                        {options[idx]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3D. BOTTOM NAVIGATION BAR */}
            <footer className="absolute bottom-0 left-0 right-0 h-[72px] bg-[#f0f4f8] border-t border-[#e2e8f0] flex items-center justify-between px-10">
              <button
                disabled={currentQuestionIdx === 0}
                className="h-12 px-6 rounded-[12px] border-[1.5px] border-[#e2e8f0] bg-white flex items-center gap-2 text-[15px] font-semibold text-[#64748b] hover:border-[#94a3b8] transition-all disabled:opacity-50"
              >
                <ArrowLeft size={16} strokeWidth={2.5} />
                Previous
              </button>

              <div className="flex items-center gap-1.5">
                {[...Array(11)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2.5 rounded-full transition-all duration-300 ${i === 4 ? `w-6 bg-[#2563eb]` : i < 4 ? `w-2.5 bg-[#22c55e]` : `w-2.5 bg-[#cbd5e1]`}`}
                  />
                ))}
              </div>

              <button
                className={`h-12 px-8 rounded-[12px] flex items-center gap-2 text-[15px] font-semibold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]
                ${isLastQuestion ? "bg-[#22c55e] shadow-[#22c55e4d]" : "bg-[#1d4ed8] shadow-[#1d4ed84d]"}
              `}
              >
                {isLastQuestion ? "Submit" : "Next"}
                {isLastQuestion ? (
                  <Check size={16} />
                ) : (
                  <ArrowRight size={16} />
                )}
              </button>
            </footer>
          </main>
        </div>
      </div>
    );
  }

