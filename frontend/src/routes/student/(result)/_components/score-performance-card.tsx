import React from 'react';
import { motion } from 'motion/react';

export const ScorePerformanceCard = ({ scorePercent }: { scorePercent: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.9, duration: 0.5, ease: "easeOut" }}
    className="bg-white border border-slate-100 rounded-2xl px-7 py-5 shadow-sm mb-8"
  >
    <h3 className="text-[11px] font-bold text-slate-400 tracking-[1.5px] uppercase mb-3">
      SCORE PERFORMANCE
    </h3>
    <div className="relative w-full h-[12px] bg-slate-200 rounded-full overflow-hidden mb-2">
      <motion.div 
        initial={{ width: "0%" }}
        animate={{ width: `${scorePercent}%` }}
        transition={{ delay: 1, duration: 1, ease: "easeOut" }}
        className={`h-full ${scorePercent >= 70 ? 'bg-success-500' : scorePercent >= 60 ? 'bg-primary-500' : scorePercent >= 40 ? 'bg-accent-500' : 'bg-red-500'} rounded-full`}
      />
    </div>
    <div className="relative flex items-center justify-between mt-1 h-5">
      <span className="text-[12px] font-normal text-slate-400">0%</span>
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className={`absolute text-[13px] font-semibold ${scorePercent >= 70 ? 'text-success-500' : scorePercent >= 60 ? 'text-primary-500' : scorePercent >= 40 ? 'text-accent-500' : 'text-red-500'}`}
        style={{ left: `${scorePercent}%`, transform: 'translateX(-50%)' }}
      >
        {scorePercent}%
      </motion.span>
      <span className="text-[12px] font-normal text-slate-400">100%</span>
    </div>
  </motion.div>
);
