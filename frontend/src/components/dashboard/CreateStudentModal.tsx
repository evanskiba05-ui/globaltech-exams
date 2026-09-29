import { useEffect } from 'react';
import ActionModal from './ActionModal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreateStudentSchema } from "@/lib/schema";
import { useStudentStore } from "@/store/student";
import CustomInput from "@/components/input";
import CustomSelect from "@/components/select";
import type { Student } from "@/lib/d-types";

const editSchema = CreateStudentSchema.extend({
  password: z.string().optional(),
});

const examOptions = [
  { value: 'Jamb CBT Practice', label: 'Jamb CBT Practice' },
  { value: 'WAEC Practice', label: 'WAEC Practice' },
  { value: 'NECO Practice', label: 'NECO Practice' },
];

type EditFormValues = z.infer<typeof editSchema>;
type CreateFormValues = z.infer<typeof CreateStudentSchema>;

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentData?: Student | null;
}

const CreateStudentModal: React.FC<CreateStudentModalProps> = ({ isOpen, onClose, studentData }) => {
  const addStudent = useStudentStore((state) => state.addStudent);
  const updateStudent = useStudentStore((state) => state.updateStudent);
  const loading = useStudentStore((state) => state.loading);
  const error = useStudentStore((state) => state.error);
  const isEdit = !!studentData;

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    reset,
  } = useForm<EditFormValues | CreateFormValues>({
    resolver: zodResolver(isEdit ? editSchema : CreateStudentSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      exam: 'Jamb CBT Practice',
    },
  });

  useEffect(() => {
    if (studentData) {
      reset({
        fullName: studentData.fullName,
        username: studentData.username,
        email: studentData.email,
        password: '',
        exam: 'Jamb CBT Practice',
      });
    } else {
      reset({
        fullName: '',
        username: '',
        email: '',
        password: '',
        exam: 'Jamb CBT Practice',
      });
    }
  }, [studentData, reset]);

  const onSubmit = async (data: EditFormValues | CreateFormValues) => {
    if (isEdit && studentData) {
      const success = await updateStudent(studentData.id, {
        full_name: data.fullName,
        exam_id: data.username,
        email: data.email,
        ...(data.password ? { password: data.password } : {}),
      });
      if (success) {
        onClose();
        reset();
      }
    } else {
      const success = await addStudent({
        full_name: data.fullName,
        exam_id: data.username,
        email: data.email,
        password: data.password!,
      });
      if (success) {
        onClose();
        reset();
      }
    }
  };

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Student Account' : 'Create Student Account'}
      onSubmit={hookFormSubmit(onSubmit)}
      loading={loading}
      submitLabel={isEdit ? 'Save Changes' : 'Create Account'}
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-error-500/10 border border-error-500 text-error-500 p-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}
        {/* Full Name */}
        <CustomInput
          label="Full Name"
          type="text"
          placeholder="e.g. Adaeze Okonkwo"
          error={errors.fullName?.message}
          {...register('fullName')}
          prefixIcon={<img src="/icons/user.png" alt="user" className="size-[18px]" />}
        />

        {/* Username & Email Row */}
        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            label="Username"
            type="text"
            placeholder="e.g. GT2026-00123"
            error={errors.username?.message}
            {...register('username')}
            prefixIcon={<span className="text-neutral-500 font-medium">@</span>}
          />
          <CustomInput
            label="Email Address"
            type="email"
            placeholder="Student@email.com"
            error={errors.email?.message}
            {...register('email')}
            prefixIcon={<span className="text-neutral-500 font-medium">@</span>}
          />
        </div>

        {/* Password */}
        <CustomInput
          label={isEdit ? 'New Password (leave blank to keep current)' : 'Set Password'}
          type="password"
          placeholder="*****************"
          error={errors.password?.message}
          {...register('password')}
          prefixIcon={<img src="/icons/noto_locked-with-key.png" alt="lock" className="size-[18px]" />}
        />

        {/* Assign to Exam */}
        <CustomSelect
          label="Assign to Exam"
          options={examOptions}
          error={errors.exam?.message}
          {...register('exam')}
        />
      </div>
    </ActionModal>
  );
};

export default CreateStudentModal;
