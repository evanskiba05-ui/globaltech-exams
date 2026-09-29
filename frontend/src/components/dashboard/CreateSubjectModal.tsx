import React, { useState, useRef } from 'react';
import ActionModal from './ActionModal';
import CustomInput from "@/components/input";
import { GiPencil } from 'react-icons/gi';
import { RiImageAddLine } from 'react-icons/ri';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreateSubjectSchema } from "@/lib/schema";
import Button from "@/components/button";

type CreateSubjectFormValues = z.infer<typeof CreateSubjectSchema>;

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (data: CreateSubjectFormValues & { icon?: File }) => void;
}

const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateSubjectFormValues>({
    resolver: zodResolver(CreateSubjectSchema),
    defaultValues: {
      subjectName: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: CreateSubjectFormValues) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onCreate?.({ ...data, icon: selectedFile ?? undefined });
      onClose();
      reset();
      setSelectedFile(null);
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
      {/* Header with title and close button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[32px] font-bold text-primary-600">Create New Subject</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 text-xl leading-none"
        >
          ✕
        </button>
      </div>

      <div className="space-y-6">
        {/* Subject Name Input */}
        <CustomInput
          label="SUBJECT NAME"
          type="text"
          placeholder="e.g. English language"
          error={errors.subjectName?.message}
          prefixIcon={<GiPencil size={22} />}
          {...register("subjectName")}
        />

        {/* File Upload Area */}
        <div className="mx-auto max-w-sm">
          <div
            className="border-[3px] border-dashed border-neutral-400 rounded-2xl p-8 flex flex-col items-center justify-center bg-primary-100 cursor-pointer hover:bg-primary-50 transition-colors min-h-[180px]"
            onClick={handleSelectFile}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectFile(); }}
            role="button"
            tabIndex={0}
            aria-label="Upload or select subject icon"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {selectedFile ? (
              <p className="text-sm text-neutral-600 font-medium text-center">{selectedFile.name}</p>
            ) : (
              <>
                <p className="text-xl text-neutral-700 mb-3 text-center">Upload or Select Subject icon</p>
                <RiImageAddLine className="text-neutral-700 mb-3" size={48} />
                <Button
                  type="button"
                  variant="bordered"
                  size="small"
                  className="!rounded-lg !border-primary-400 !text-primary-400"
                  onClick={(e) => { e.stopPropagation(); handleSelectFile(); }}
                >
                  Select File
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-center gap-3 mt-8 pt-4">
          <Button
            type="button"
            variant="bordered"
            size="medium"
            onClick={onClose}
            className="!border-error-500 !text-error-500"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="medium"
            disabled={loading}
            className="!rounded-lg px-8"
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

export default CreateSubjectModal;
