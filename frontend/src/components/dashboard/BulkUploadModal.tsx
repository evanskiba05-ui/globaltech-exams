import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Button from "@/components/button";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  requiredColumns: string[];
  onImport: (file: File) => Promise<boolean | void>;
  onDownloadTemplate: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
  description?: string;
  fileTypeLabel?: string;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  requiredColumns, 
  onImport, 
  onDownloadTemplate,
  loading = false,
  error = null,
  description = "Support .csv, xlsx, xls files up to 5MB",
  fileTypeLabel = "CSV or Excel file"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file) return;
    const success = await onImport(file);
    if (success !== false) {
      onClose();
      setFile(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal z-[2000] modal-open">
          <motion.div
            className="modal-backdrop bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="modal-box max-w-[50vw] py-6 px-15 bg-white rounded-[2.5rem] shadow-xl relative overflow-visible"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <h2 className="text-[32px] font-bold text-primary-600 tracking-[-0.01em] mb-8 text-center uppercase">
              {title}
            </h2>

            {error && (
              <div className="bg-error-500/10 border border-error-500 text-error-500 p-3 rounded-lg text-sm font-medium mb-4 text-center">
                {error}
              </div>
            )}

            <hr className="absolute top-[5rem] w-full left-0 bg-neutral-200 border-0 h-[1px]" />

            {/* Dropzone */}
            <div
              className={`border-2 border-dashed rounded-3xl p-8 text-center mt-10 transition-colors duration-200 ${
                isDragging
                  ? 'border-primary-500 bg-neutral-100'
                  : 'border-neutral-400 bg-primary-200/60'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex justify-center mb-3">
                <img src="/icons/folder.png" alt="folder" className="h-12 w-auto" />
              </div>
              <p className="text-[24px] font-semibold text-neutral-700 mb-1">
                Drop your {fileTypeLabel} here
              </p>
              <p className="text-[18px] font-medium text-neutral-500 mb-4">
                {description}
              </p>

              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="bulk-modal-file-upload"
              />
              <label htmlFor="bulk-modal-file-upload">
                <Button
                  type="button"
                  variant="bordered"
                  className="border-primary-500 text-primary-500 hover:bg-primary-100 rounded-md px-8 py-2 border-2! text-[22px]! mx-auto"
                  onClick={() => document.getElementById('bulk-modal-file-upload')?.click()}
                >
                  Browse files
                </Button>
              </label>

              {file && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-primary-600 font-medium"
                >
                  Selected: {file.name}
                </motion.p>
              )}
            </div>

            {/* Required Columns */}
            <div className="mt-5 bg-info-500/10 border border-info-500/30 rounded-3xl p-6">
              <p className="text-[22px] font-semibold text-info-500 mb-3">
                Required columns:
              </p>
              <div className="flex flex-wrap space-x-2">
                {requiredColumns.map((col) => (
                  <span key={col} className="text-info-500 text-[20px] font-regular flex items-center gap-2">
                    {col}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-8">
              <Button 
                type="button" 
                variant="bordered" 
                size="medium" 
                onClick={onDownloadTemplate}
                disabled={loading}
                className="border-neutral-300 text-neutral-600 hover:bg-neutral-100"
              >
                Download Template
              </Button>

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="bordered" 
                  size="medium" 
                  onClick={onClose}
                  className="border-neutral-200 text-neutral-500"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="medium"
                  onClick={handleImport}
                  className="rounded-md px-8"
                  disabled={loading || !file}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : "Import Now"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BulkUploadModal;
