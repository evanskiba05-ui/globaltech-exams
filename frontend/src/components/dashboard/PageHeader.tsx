import React from 'react';
import { motion } from 'motion/react';

interface PageHeaderProps {
  title: string;
  subtitle?: string | number;
  subtitleSuffix?: string;
  actions?: React.ReactNode;
  layout?: "row" | "column";
  dark?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  subtitleSuffix = "items in total", 
  actions,
  layout = "row",
  dark = false
}) => {
  const isRow = layout === "row";

  return (
    <motion.div
      className={`mb-10 md:mb-6 flex gap-4 ${
        isRow 
          ? "flex-col md:flex-row md:items-center md:justify-between" 
          : "flex-col items-start space-y-4"
      }`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className={`text-[40px]! font-dm-sans md:text-[28px] font-bold tracking-[-0.01em] leading-[1.3] ${dark ? "text-white" : "text-neutral-700"}`}>
          {title}
        </h1>
        {subtitle !== undefined && (
          <p className={`text-[22px]! md:text-base font-medium mt-1 leading-[1.5] ${dark ? "text-neutral-300" : "text-neutral-500"}`}>
            {subtitle} {subtitleSuffix}
          </p>
        )}
      </div>

      {actions && (
        <motion.div
          className={`flex items-center gap-3 md:gap-5 ${!isRow ? "mt-2" : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {actions}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PageHeader;
