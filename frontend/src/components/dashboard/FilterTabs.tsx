import React from 'react';
import { motion } from 'motion/react';
import Button from "@/components/button";

interface FilterTabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
  className?: string;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <motion.div 
      className={`flex flex-wrap gap-2 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      {tabs.map((tab) => (
        <Button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 h-14 rounded-xl text-[18px] font-medium border ${
            activeTab === tab
              ? 'bg-white border-secondary-400 text-secondary-400 shadow-sm'
              : 'bg-neutral-50 border-neutral-300 text-neutral-500 hover:text-neutral-700 hover:bg-white'
          }`}
        >
          {tab}
        </Button>
      ))}
    </motion.div>
  );
};

export default FilterTabs;
