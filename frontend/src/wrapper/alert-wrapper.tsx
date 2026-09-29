import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAlertStore } from "@/store/alert";

export const AlertWrapper = () => {
  const { type, message, hideAlert } = useAlertStore();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        hideAlert();
      }, 5000); // Auto-hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [message, hideAlert]);



  return (
    <>
      <AnimatePresence>
        {message && (
          <motion.div
          >
                  <motion.div   initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.4 }} role="alert" className={`alert ${type === 'error'? "alert-error":""} w-fit absolute z-1000 top-10 right-1/2 translate-x-1/2`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{message}</span>
                </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
