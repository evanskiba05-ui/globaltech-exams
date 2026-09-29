import { motion } from "motion/react";
import { PiUsersFill } from "react-icons/pi";
import { MdOutlineAccessAlarms } from "react-icons/md";
import { CiCalendar } from "react-icons/ci";
import dayjs from "dayjs";
import Button from "@/components/button";
import StatusBadge from "./StatusBadge";
import MetaBlock from "./MetaBlock";

type ExamStatus = "active" | "completed" | "draft";

interface Exam {
  id: number;
  title: string;
  subject: string;
  duration: number;
  questions: number;
  students: number;
  date: string;
  status: ExamStatus;
}

interface ExamCardProps {
  exam: Exam;
  index?: number;
  onView?: () => void;
  onEdit?: () => void;
  onEnd?: () => void;
  onPublish?: () => void;
}

const SubjectGridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <rect x="0" y="0" width="9" height="9" rx="1.5" fill="#22c55e" />
    <rect x="11" y="0" width="9" height="9" rx="1.5" fill="#fbbf24" />
    <rect x="0" y="11" width="9" height="9" rx="1.5" fill="#3b82f6" />
    <rect x="11" y="11" width="9" height="9" rx="1.5" fill="#ec4899" />
  </svg>
);

export default function ExamCard({
  exam,
  index = 0,
  onView,
  onEdit,
  onEnd,
  onPublish,
}: ExamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      className="bg-white border border-[#E5E7EB] rounded-[14px] p-5 shadow-sm flex flex-col gap-4"
    >
      <div className="flex justify-between items-start">
        <h3
          className={`text-[20px] font-bold text-neutral-700 ${exam.id === 1 ? "tracking-[0.04em] uppercase" : ""}`}
        >
          {exam.title}
        </h3>
        <StatusBadge status={exam.status} />
      </div>

      <div className="flex gap-6">
        <MetaBlock
          icon={<SubjectGridIcon />}
          label="SUBJECT"
          value={exam.subject}
        />
        <MetaBlock
          icon={<MdOutlineAccessAlarms size={20} className="text-neutral-500" />}
          label="DURATION"
          value={`${exam.duration} mins`}
        />
        <MetaBlock
          icon={<span className="text-error-500 font-bold text-[16px]">?</span>}
          label="QUESTIONS"
          value={exam.questions}
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-6">
          <MetaBlock
            icon={<PiUsersFill size={20} className="text-pink-500" />}
            label="STUDENTS"
            value={exam.students}
          />
          <MetaBlock
            icon={<CiCalendar size={20} className="text-neutral-500" />}
            label="DATE"
            value={dayjs(exam.date).format("YYYY-M-D")}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="bordered"
            size="small"
            className="border-primary-500! text-primary-500!"
            onClick={onView}
          >
            View
          </Button>
          <Button
            variant="bordered"
            size="small"
            className="border-neutral-300! text-neutral-600!"
            onClick={onEdit}
          >
            Edit
          </Button>
          {exam.status === "active" && (
            <Button
              variant="bordered"
              size="small"
              className="border-error-500! text-error-500!"
              onClick={onEnd}
            >
              End
            </Button>
          )}
          {exam.status === "draft" && (
            <Button variant="success" size="small" onClick={onPublish}>
              Publish
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
