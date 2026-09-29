import type { ReactNode } from "react";

interface MetaBlockProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  className?: string;
}

export default function MetaBlock({ icon, label, value, className = "" }: MetaBlockProps) {
  return (
    <div className={`flex gap-2 items-start ${className}`}>
      <div className="mt-0.5">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[14px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
          {label}
        </span>
        <span className="text-[18px] font-medium text-neutral-700">{value}</span>
      </div>
    </div>
  );
}
