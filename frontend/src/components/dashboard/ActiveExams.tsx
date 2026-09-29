import React from "react";
import { motion } from "motion/react";

interface ExamItemProps {
  name: string;
  students: number;
  questions: number;
}

const ExamItem: React.FC<ExamItemProps> = ({ name, students, questions }) => (
  <div className="flex items-center justify-between bg-primary-400 rounded-[12px] px-4 py-3.5">
    <div className="flex flex-col gap-0.5">
      <h4 className="text-[22px] font-bold text-neutral-50 font-dm-sans tracking-[0.05em] uppercase">
        {name}
      </h4>
      <p className="text-[16px] text-neutral-300 font-dm-sans">
        {students} students · {questions} questions
      </p>
    </div>
    <div className="w-[10px] h-[10px] rounded-full bg-accent-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
  </div>
);

const ActiveExams: React.FC = () => {
  return (
    <div className="bg-primary-450 rounded-[16px] p-6">
      <h2 className="text-[28px] font-extrabold text-white  mb-4">
        Active Exams
      </h2>
      <div className="flex flex-col gap-3">
        <ExamItem name="JAMB CBT PRACTICE" students={245} questions={180} />
        <ExamItem name="JAMB CBT PRACTICE" students={245} questions={180} />
      </div>
    </div>
  );
};

export default ActiveExams;
