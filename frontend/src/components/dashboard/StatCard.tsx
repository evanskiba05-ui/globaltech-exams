import React from "react";
import { motion } from "motion/react";



interface StatCardProps {
  icon: any;
  iconBg: string;
  iconColor: string;
  number: string | number;
  label: string;
  subtext: string;
  growth?: string;
  delay?: number;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  iconBg,
  iconColor,
  number,
  label,
  subtext,
  growth,
  delay = 0,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
      className={`bg-white rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] flex flex-col gap-3 relative overflow-hidden ${className}`}
    >
      <div className="flex items-start justify-between">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          {typeof Icon === 'string' ? (
             <span className="text-2xl font-bold" style={{ color: iconColor }}>{Icon}</span>
          ) : typeof Icon === 'function' ? (
            <Icon color={iconColor} size={28} />
          ) : (
           <></>
          )}
        </div>
        {growth && (
          <div className="bg-success-500/10 text-success-500 rounded-full px-2.5 py-1 text-[11px] font-semibold font-inter">
            {growth}
          </div>
        )}
      </div>

      <div className="flex flex-col font-semibold text-neutral-700">
        <h3 className="text-[40px] md:text-[44px] font-extrabold text-neutral-800 font-syne leading-none tracking-[-0.03em]">
          {number}
        </h3>
        <p className="text-[14px]  font-dm-sans uppercase tracking-[0.08em] mt-2">
          {label}
        </p>
        <p className="text-[12px]  font-dm-sans mt-1">
          {subtext}
        </p>
      </div>
    </motion.div>
  );
};

export default StatCard;
