import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ActionModal from './ActionModal';
import CustomSelect from "@/components/select";
import CustomTextarea from "@/components/textarea";
import CustomInput from "@/components/input";
import Button from "@/components/button";
import { GiCheckMark } from 'react-icons/gi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreateQuestionSchema } from "@/lib/schema";
import { addQuestion, editQuestion } from "@/lib/api/admin";

type CreateQuestionFormValues = z.infer<typeof CreateQuestionSchema>;

const answerTypeOptions = [
  { value: 'Multiple Choice', label: 'Multiple Choice' },
  { value: 'True/False', label: 'True/False' },
];

const examOptions = [
  { value: 'Jamb CBT Practice', label: 'Jamb CBT Practice' },
  { value: 'WAEC Practice', label: 'WAEC Practice' },
  { value: 'NECO Practice', label: 'NECO Practice' },
];

interface CreateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editData?: any;
  subjects?: { name: string; slug: string }[];
}

const allOptionLabels = ['A', 'B', 'C', 'D'];

const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({ isOpen, onClose, onSuccess, editData, subjects }) => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const subjectOptions = React.useMemo(
    () => (subjects || []).map((s) => ({ value: s.name, label: s.name })),
    [subjects],
  );

  const slugMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    (subjects || []).forEach((s) => { map[s.name] = s.slug; });
    return map;
  }, [subjects]);

  useEffect(() => {
    if (isOpen) setApiError(null);
  }, [isOpen]);

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateQuestionFormValues>({
    resolver: zodResolver(CreateQuestionSchema),
    defaultValues: {
      answerType: 'Multiple Choice',
      subject: subjectOptions[0]?.value ?? '',
      assignToExam: 'Jamb CBT Practice',
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: '',
      answerMark: 1,
      topic: '',
    },
  });


  useEffect(() => {
    if (editData) {
      const optionMap: Record<string, string> = {};
      let correctLetter = "";
      for (const opt of editData.options || []) {
        optionMap[opt.letter] = opt.text;
        if (opt.is_correct) correctLetter = opt.letter;
      }
      reset({
        answerType: "Multiple Choice",
        subject: editData.subject_name || editData.subject,
        assignToExam: "Jamb CBT Practice",
        questionText: editData.text,
        optionA: optionMap["A"] || "",
        optionB: optionMap["B"] || "",
        optionC: optionMap["C"] || "",
        optionD: optionMap["D"] || "",
        correctOption: correctLetter,
        answerMark: 1,
        topic: "",
      });
    } else {
      reset();
    }
  }, [editData, reset]);

  const selectedOption = watch('correctOption');
  const selectedAnswerType = watch('answerType');

  const optionLabels = React.useMemo(
    () => (selectedAnswerType === 'True/False' ? allOptionLabels.slice(0, 2) : allOptionLabels),
    [selectedAnswerType],
  );

  const prevAnswerType = useRef(selectedAnswerType);

  useEffect(() => {
    if (prevAnswerType.current === selectedAnswerType) return;
    prevAnswerType.current = selectedAnswerType;

    if (selectedAnswerType === 'True/False') {
      setValue('optionA', 'True');
      setValue('optionB', 'False');
      setValue('optionC', '');
      setValue('optionD', '');
      if (selectedOption && !['A', 'B'].includes(selectedOption)) {
        setValue('correctOption', '');
      }
    } else {
      setValue('optionA', '');
      setValue('optionB', '');
      setValue('optionC', '');
      setValue('optionD', '');
      setValue('correctOption', '');
    }
  }, [selectedAnswerType]);

  const handleOptionChange = (opt: string) => {
    setValue('correctOption', opt === selectedOption ? '' : opt, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateQuestionFormValues) => {
    setLoading(true);
    setApiError(null);
    try {
      const options: Record<string, string> = { A: data.optionA, B: data.optionB };
      if (data.optionC) options.C = data.optionC;
      if (data.optionD) options.D = data.optionD;
      const payload = {
        subject_slug: slugMap[data.subject] ?? data.subject.toLowerCase(),
        text: data.questionText,
        options,
        correct_letter: data.correctOption,
      };
      if (editData) {
        await editQuestion(editData.id, payload);
      } else {
        await addQuestion(payload);
      }
      onSuccess?.();
      onClose();
      reset();
    } catch (err: any) {
      setApiError(err.response?.data?.detail || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? "Edit Question" : "Create Question"}
      onSubmit={hookFormSubmit(onSubmit)}
      loading={loading}
      submitLabel={editData ? "Update Question" : "Submit Question"}
      maxWidth="max-w-[55vw]"
    >
      <div className="space-y-5 px-3">
        {/* Row 1: Answer Type & Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomSelect
            label="Answer Type"
            options={answerTypeOptions}
            error={errors.answerType?.message}
            {...register('answerType')}
          />
          <CustomSelect
            label="Subject"
            options={subjectOptions}
            error={errors.subject?.message}
            {...register('subject')}
          />
        </div>

        {/* Assign to Exam */}
        <CustomSelect
          label="Assign to Exam"
          options={examOptions}
          error={errors.assignToExam?.message}
          {...register('assignToExam')}
        />

        {/* Question Text */}
        <CustomTextarea
          label="Question Text"
          placeholder="Type your question here......"
          error={errors.questionText?.message}
          {...register('questionText')}
        />

        {/* Answer Options */}
        <div>
          <label className="block text-sm font-semibold text-neutral-600 tracking-[0.01em] uppercase mb-3">
            Answers Options — Tick to mark the correct answer
          </label>
          <div className="space-y-3">
            {optionLabels.map((opt) => {
              const isSelected = selectedOption === opt;
              return (
                <div key={opt} className="flex items-center gap-3">
                  {/* Letter Circle */}
                  <Button
                    type="button"
                    onClick={() => handleOptionChange(opt)}
                    className={`!w-10 !h-10 !rounded-full border-2 flex items-center justify-center font-bold text-lg shrink-0 transition-colors !p-5 ${
                      isSelected
                        ? 'border-success-500 text-success-500'
                        : 'border-neutral-300 text-neutral-500'
                    }`}
                  >
                    {opt}
                  </Button>
                  
                  {/* Input */}
                  <div className="flex-1 w-full min-w-0">
                    <CustomInput
                      type="text"
                      placeholder={`Option ${opt}`}
                      className={`h-12 text-lg text-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
                        isSelected ? 'border-success-500 placeholder:text-success-500' : 'border-neutral-300'
                      }`}
                      error={(errors as any)[`option${opt}`]?.message}
                      {...register(`option${opt}` as keyof CreateQuestionFormValues)}
                    />
                  </div>
                  
                  {/* Checkmark */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="shrink-0"
                      >
                        <GiCheckMark className="text-success-500" size={20} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          {errors.correctOption && <p className="text-sm text-error-500 mt-2 ml-1">{errors.correctOption.message}</p>}
        </div>

        {/* Row: Answer Mark & Topic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomInput
            label="Answer Mark"
            type="number"
            placeholder="e.g 2"
            error={errors.answerMark?.message}
            {...register('answerMark', { valueAsNumber: true })}
          />
          <CustomInput
            label="Topic / Chapter (Optional)"
            type="text"
            placeholder="e.g organic chemistry"
            error={errors.topic?.message}
            {...register('topic')}
          />
        </div>

        {apiError && (
          <p className="text-sm text-error-500 bg-error-50 border border-error-200 rounded-lg p-3 text-center">
            {apiError}
          </p>
        )}
      </div>
    </ActionModal>
  );
};

export default CreateQuestionModal;
