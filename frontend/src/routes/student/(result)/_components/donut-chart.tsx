import React from 'react';
import { motion } from 'motion/react';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { CountUp } from './_count-up';

export const DonutChart = ({ score, total, percentage, grade }: { score: number; total: number; percentage: number; grade: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
      className="relative w-[160px] h-[160px] mx-auto mt-5 mb-8"
    >
      <div className={`${percentage >= 70 ? 'text-success-500' : percentage >= 60 ? 'text-primary-500' : percentage >= 40 ? 'text-accent-500' : 'text-red-500'} size-44`}>
        <CircularProgressbar
          strokeWidth={13}
          value={percentage}
          styles={buildStyles({
            pathColor: "currentColor",
          })}
        />
      </div>

      <div className="absolute inset-0 flex flex-col right-1/2 translate-x-[60%] top-5 items-center justify-center">
        <span className="text-[22px] font-bold text-slate-800 tracking-[-0.5px]">
          <CountUp value={score} />/{total}
        </span>
        <span className={`text-[11px] font-medium ${percentage >= 70 ? 'text-success-500' : percentage >= 60 ? 'text-primary-500' : percentage >= 40 ? 'text-accent-500' : 'text-red-500'} mt-0.5`}>
          <CountUp value={percentage} />%
        </span>
        <div className="mt-1.5 px-2.5 py-0.5 rounded-full flex items-center justify-center bg-accent-200">
          <span className="text-[11px] font-semibold text-accent-500 tracking-[0.3px] whitespace-nowrap">
            {grade}
          </span>
        </div>
      </div>
    </motion.div>
  );
};