import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Button from "@/components/button";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  showFooter?: boolean;
  maxWidth?: string;
}

const ActionModal: React.FC<ActionModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onSubmit, 
  loading = false, 
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  showFooter = true,
  maxWidth = "max-w-[50vw]"
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal modal-open z-[1000]">
          <motion.div
            className="modal-backdrop bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className={`modal-box ${maxWidth} py-6 px-15 rounded-[2.5rem] bg-white shadow-xl relative flex flex-col max-h-[85vh] overflow-hidden`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {title && (
              <h2 className="text-[32px] font-bold text-primary-600 mb-6 tracking-[-0.01em] shrink-0">
                {title}
              </h2>
            )}

            <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar p-2">
                {children}
              </div>

              {showFooter && (
                <div className="flex justify-end gap-2 mt-6 pt-2 shrink-0">
                  <Button 
                    type="button" 
                    variant="bordered" 
                    size="medium" 
                    onClick={onClose}
                    disabled={loading}
                    className="border-neutral-200 text-neutral-500"
                  >
                    {cancelLabel}
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="medium"
                    disabled={loading}
                    className="rounded-md px-8"
                  >
                    {loading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : submitLabel}
                  </Button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ActionModal;
