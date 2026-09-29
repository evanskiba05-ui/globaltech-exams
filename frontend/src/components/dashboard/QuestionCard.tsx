import { motion } from 'motion/react';
import { GiCheckMark } from 'react-icons/gi';
import Button from "@/components/button";

interface QuestionOption {
  letter: string;
  text: string;
  is_correct: number;
}

interface QuestionCardProps {
  question: any;
  index: number;
  onEdit?: (question: any) => void;
  onDelete?: (id: any) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, onEdit, onDelete }) => {

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Tags & Actions Row */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2 text-[13px]">
          <span className="inline-flex items-center px-3 py-2 rounded-3xl  font-medium bg-primary-100 text-primary-500 border border-blue-100">
            {question.type}
          </span>
          <span className="inline-flex items-center px-3 py-2 rounded-full  font-medium bg-accent-200 text-accent-700 border border-amber-100">
            {question.subject_name}
          </span>
          <span className="inline-flex items-center px-3 py-2 rounded-full  font-medium bg-neutral-200 text-neutral-600 border border-gray-200">
            {question.examName}
          </span>
          <span className="inline-flex items-center px-3 py-2 rounded-full  font-medium bg-success-500/10 text-success-500 border border-green-100">
            {question.marks} marks
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onEdit?.(question)}
            className="px-4 py-1.5 rounded-lg border-2 border-primary-500 text-primary-500 text-[18px] font-medium bg-primary-100 "
          >
            Edit
          </Button>
          <Button
            onClick={() => onDelete?.(question.id)}
            className="px-6 py-1.5 rounded-lg  border-2 border-red-500 text-red-500 text-[18px] font-medium hover:bg-red-50 transition-colors"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Question Text */}
      <h3 className="text-[28px] font-medium text-neutral-500 font-dm-sans mb-4 leading-[1.4]">
        {question.text}
      </h3>

      {/* Options */}
      <div className="flex flex-wrap gap-2">
        {question.options.map((option: QuestionOption) => (
          <div
            key={option.letter}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[12px] border text-[16px] font-dm-sans transition-colors ${
              option.is_correct
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-neutral-200 border-neutral-400 text-neutral-500 '
            }`}
          >
            {option.is_correct ? <GiCheckMark  size={14} className="text-green-600" strokeWidth={2.5} /> : null}
            <span className="font-bold text-[16px]">{option.letter}.</span>
            <span className='font-regular'>{option.text}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuestionCard;