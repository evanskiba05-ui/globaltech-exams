import React from "react";
import { motion } from "motion/react";
import { UserPlus, HelpCircle, PencilLine, Download } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface ActionItemProps {
  icon: any;
  label: string;
  onClick?: () => void;
}

const ActionItem: React.FC<ActionItemProps> = ({ icon: Icon, label, onClick }) => (
  <motion.button
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.15 }}
    onClick={onClick}
    className="flex items-center gap-4 bg-secondary-100 hover:bg-secondary-200 text-neutral-600 rounded-[12px] px-4 py-3.5 transition-colors cursor-pointer w-full group"
  >
    <div className="w-14 h-12 rounded-xl bg-secondary-200 group-hover:bg-white/50 transition-colors flex items-center justify-center shrink-0">
      <Icon size={20} strokeWidth={2} />
    </div>
    <span className="text-[24px] font-semibold font-dm-sans">{label}</span>
  </motion.button>
);

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
      <h2 className="text-[28px] font-extrabold font-syne text-primary-700 mb-4">
        Quick Actions
      </h2>
      <div className="flex flex-col gap-3">
        <ActionItem icon={UserPlus} label="Add Student" onClick={() => navigate({ to: "/admin/dashboard/students" })} />
        <ActionItem icon={() => <span className="text-error-500 font-bold text-xl">?</span>} label="Add Question" onClick={() => navigate({ to: "/admin/dashboard/questions" })} />
        <ActionItem icon={PencilLine} label="Create Exam" onClick={() => navigate({ to: "/admin/dashboard/exams" })} />
        <ActionItem icon={Download} label="Import CSV" onClick={() => navigate({ to: "/admin/dashboard/students" })} />
      </div>
    </div>
  );
};

export default QuickActions;
