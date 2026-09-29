import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

type ModalSize = "sm" | "md" | "lg" | "xl";

interface ModalConfig {
  title?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  noPadding?: boolean;
}

// ─── Width map ────────────────────────────────────────────────────────────────

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-sm w-full",
  md: "max-w-md w-full",
  lg: "max-w-2xl w-full",
  xl: "max-w-4xl w-full",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ModalProps extends ModalConfig {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Modal = ({
  isOpen,
  onClose,
  title,
  content,
  footer,
  size = "lg",
  showCloseButton = true,
  noPadding = false,
}: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center font-dm-sans px-4">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary-600/60 backdrop-blur-[2px]"
          />

          {/* Container */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`relative flex flex-col bg-neutral-100 rounded-[18px] overflow-hidden shadow-2xl ${sizeClass[size]}`}
          >
            {/* Header — only renders when title OR close button is needed */}
            {(title || showCloseButton) && (
              <div className="h-16 bg-primary-500 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3 text-white">
                  {title && (
                    <span className="text-[20px] font-bold tracking-tight leading-snug">
                      {title}
                    </span>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-white/70 hover:text-white transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            {content && (
              <div className={`flex-1 overflow-y-auto ${noPadding ? "" : "px-6 py-7 md:px-10 md:py-8"}`}>
                {content}
              </div>
            )}

            {/* Footer */}
            {footer && (
              <div className="px-6 pb-6 md:px-10 md:pb-8 flex items-center justify-between gap-4 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
