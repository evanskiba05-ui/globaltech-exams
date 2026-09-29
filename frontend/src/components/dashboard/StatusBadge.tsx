interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-success-500/10 text-success-500",
  completed: "bg-primary-200/40 text-primary-500 border border-primary-200",
  draft: "bg-accent-200/40 text-accent-700",
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const style = statusStyles[status.toLowerCase()] || "bg-neutral-200/40 text-neutral-600";
  return (
    <span
      className={`px-[14px] py-[5px] rounded-full text-[14px] font-medium ${style} ${className}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
