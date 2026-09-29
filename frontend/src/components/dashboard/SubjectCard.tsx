import { motion } from "motion/react";
import { CiCalendar } from "react-icons/ci";
import dayjs from "dayjs";
import Button from "@/components/button";
import StatusBadge from "./StatusBadge";
import MetaBlock from "./MetaBlock";
import type { Subject } from "@/lib/d-types";

interface SubjectCardProps {
  subject: Subject;
  index?: number;
  onToggleActive?: (subject: Subject) => void;
  onDelete?: (subject: Subject) => void;
}

export default function SubjectCard({
  subject,
  index = 0,
  onToggleActive,
  onDelete,
}: SubjectCardProps) {
  const isActive = subject.isActive ?? true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      className="bg-white border border-[#E5E7EB] rounded-[14px] p-6 shadow-sm flex flex-col gap-5"
    >
      {/* Row 1: Name + Status */}
      <div className="flex justify-between items-start">
        <h3 className="text-[24px] font-bold text-neutral-700">
          {subject.name}
        </h3>
        <StatusBadge status={isActive ? "active" : "inactive"} />
      </div>

      {/* Row 2: Questions + Date */}
      <div className="flex gap-6">
        <MetaBlock
          icon={
            <span className="text-error-500 font-bold text-[18px]">?</span>
          }
          label="QUESTIONS"
          value={subject.questions}
        />
        <MetaBlock
          icon={<CiCalendar size={22} className="text-neutral-500" />}
          label="DATE"
          value={
            subject.createdAt
              ? dayjs(subject.createdAt).format("YYYY-M-D")
              : "—"
          }
        />
      </div>

      {/* Row 3: Action buttons */}
      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          {isActive ? (
            <Button
              variant="bordered"
              size="small"
              className="border-neutral-300! text-neutral-600!"
              onClick={() => onToggleActive?.(subject)}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="bordered"
              size="small"
              className="border-success-500! text-success-500!"
              onClick={() => onToggleActive?.(subject)}
            >
              Activate
            </Button>
          )}
          <Button
            variant="bordered"
            size="small"
            className="border-error-500! text-error-500!"
            onClick={() => onDelete?.(subject)}
          >
            Delete
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
