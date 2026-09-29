import React from "react";

interface AdminStatCardProps {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  value: string | number;
  iconColorClass: string;
  description?: string;
  showDot?: boolean;
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({
  icon: Icon,
  label,
  value,
  iconColorClass,
  description,
  showDot,
}) => (
  <div className="bg-white rounded-[36px] py-4 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] flex items-center relative overflow-hidden">
    {showDot && (
      <div
        className={`absolute top-4 right-6 w-3 h-3 rounded-full ${iconColorClass} bg-current`}
      />
    )}
    <div className="w-20 h-20 rounded-full flex items-center justify-center shrink-0">
      <Icon className={iconColorClass} size={32} />
    </div>
    <div className="text-neutral-800">
      <h3 className="text-[30px] md:text-[34px] font-extrabold  font-dm-sans leading-none tracking-[-0.03em]">
        {value}
      </h3>
      <p className="text-[14px] font-dm-sans uppercase tracking-[0.08em] mt-2  font-semibold">
        {label}
      </p>
      {description && (
        <p className="text-[12px] font-dm-sans mt-1 ">{description}</p>
      )}
    </div>
  </div>
);

export default AdminStatCard;
