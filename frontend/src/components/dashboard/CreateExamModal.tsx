import React, { useState } from 'react';
import ActionModal from './ActionModal';
import CustomInput from "@/components/input";
import CustomSelect from "@/components/select";
import { GiPencil } from 'react-icons/gi';
import { MdOutlineAccessAlarm } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreateExamSchema } from "@/lib/schema";
import Button from "@/components/button";

type CreateExamFormValues = z.infer<typeof CreateExamSchema>;

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects?: { name: string; slug: string }[];
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({ isOpen, onClose, subjects }) => {

  const subjectOptions = React.useMemo(
    () => [
      { value: 'All Subjects', label: 'All Subjects' },
      ...(subjects || []).map((s) => ({ value: s.name, label: s.name })),
    ],
    [subjects],
  );
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateExamFormValues>({
    resolver: zodResolver(CreateExamSchema),
    defaultValues: {
      examName: '',
      subject: 'All Subjects',
      duration: undefined,
      startDate: '',
      endDate: '',
      description: '',
      assignTo: 'all',
    },
  });

  const selectedAssign = watch('assignTo');

  const onSubmit = async (data: CreateExamFormValues) => {
    setLoading(true);
    console.log("Form Data:", data);
    setTimeout(() => {
      setLoading(false);
      onClose();
      reset();
    }, 1000);
  };

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      onSubmit={hookFormSubmit(onSubmit)}
      loading={loading}
      submitLabel="Create & Publish"
      showFooter={false}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Create New Exam</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 text-xl leading-none"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <CustomInput
          label="EXAM NAME"
          type="text"
          placeholder="e.g. JAMB CBT Practice Examination"
          error={errors.examName?.message}
          prefixIcon={<GiPencil size={22} />}
          {...register("examName")}
        />

        <div className="flex flex-row items-center gap-4 ">
          <div className="flex flex-col  flex-1 ">
            <CustomSelect
              label="SUBJECT"
              labelClassName="block text-lg font-medium mb-4  font-dm-sans text-neutral-600 tracking-[0.01em] uppercase"
              options={subjectOptions}
              error={errors.subject?.message}
              {...register("subject")}
            />
          </div>
          <div className="flex flex-col  flex-1">
            <CustomInput
              label="DURATION (MINUTES)"
              type="number"
              placeholder="e.g. 120"
              error={errors.duration?.message}
              prefixIcon={<MdOutlineAccessAlarm size={22} />}
              {...register("duration", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            label="START DATE"
            type="date"
            error={errors.startDate?.message}
            {...register("startDate")}
          />
          <CustomInput
            label="END DATE"
            type="date"
            error={errors.endDate?.message}
            {...register("endDate")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ASSIGN QUESTIONS
          </label>
          <div className="border border-dashed rounded-lg p-4 flex justify-between items-center bg-gray-50">
            <span className="text-gray-400 text-sm">
              No questions assigned yet
            </span>
            <Button type="button" variant="bordered" size="small">
              Select Questions
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-600 tracking-[0.01em] uppercase mb-3">
            ASSIGN TO STUDENTS
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="bordered"
              size="small"
              className={`!rounded-lg !justify-center ${selectedAssign === "all" ? "!bg-primary-100 !border-primary-500 !text-primary-500" : ""}`}
              onClick={() =>
                setValue("assignTo", "all", { shouldValidate: true })
              }
            >
              All Student
            </Button>
            <Button
              type="button"
              variant="bordered"
              size="small"
              className={`!rounded-lg !justify-center ${selectedAssign === "specific" ? "!bg-primary-100 !border-primary-500 !text-primary-500" : ""}`}
              onClick={() =>
                setValue("assignTo", "specific", { shouldValidate: true })
              }
            >
              Select Specific
            </Button>
            <Button
              type="button"
              variant="bordered"
              size="small"
              className={`!rounded-lg !justify-center ${selectedAssign === "group" ? "!bg-primary-100 !border-primary-500 !text-primary-500" : ""}`}
              onClick={() =>
                setValue("assignTo", "group", { shouldValidate: true })
              }
            >
              By Group
            </Button>
          </div>
          {errors.assignTo && (
            <p className="text-sm text-error-500 mt-2">
              {errors.assignTo.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button
            type="button"
            variant="bordered"
            size="medium"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="button" variant="bordered" size="medium">
            Save as Draft
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="medium"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              "Create & Publish"
            )}
          </Button>
        </div>
      </div>
    </ActionModal>
  );
};

export default CreateExamModal;
