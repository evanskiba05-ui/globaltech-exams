import React from 'react';
import { motion, type Variants } from 'motion/react';
import { CountUp } from './_count-up';

export const StatCard = ({ title, value, icon: Icon, colorClass, variants }: { title: string; value: number; icon: any; colorClass: string; variants: Variants }) => (
  <motion.div variants={variants} className="flex-1 min-h-[110px] bg-white border border-slate-100 rounded-2xl p-5 flex flex-col items-center justify-center shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
    <span className={`text-[36px] font-semibold tracking-[-0.5px] ${colorClass}`}>
      <CountUp value={value} />
    </span>
    <div className="flex items-center gap-1.5 mt-1">
      <Icon size={14} className={colorClass} strokeWidth={2.5} />
      <span className="text-[14px] font-semibold text-slate-500 tracking-[0.2px]">{title}</span>
    </div>
  </motion.div>
);
