import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { IoMdLock } from 'react-icons/io';
import Button from "@/components/button";
import CustomInput from "@/components/input";

type AdminData = {
  name?: string;
};

type ResetPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  adminData?: AdminData;
  onSubmit: (password: string) => void | Promise<void>;
};

const ResetPasswordModal = ({ isOpen, onClose, adminData, onSubmit }: ResetPasswordModalProps) => {  
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-xl flex flex-col max-h-[85vh] overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="flex justify-between items-start py-6 px-15 shrink-0">
              <div>
                <h2 className="text-[32px] font-bold text-primary-600 font-dm-sans tracking-[-0.01em]">
                  Reset Admin Password
                </h2>
                <p className="text-neutral-500 mt-1 font-dm-sans">{adminData?.name || 'Administrator'}</p>
              </div>
              <Button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 bg-transparent! border-none! p-0!"
              >
                <FaTimes size={24} />
              </Button>
            </div>

            <form className="flex flex-col flex-1 overflow-hidden px-15 pb-6" onSubmit={(e) => { e.preventDefault(); onSubmit?.(passwords.new); }}>
              <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                {/* Warning Banner */}
                <div className="bg-accent-100 border border-accent-400 rounded-2xl p-4 flex items-center gap-4">
                  <FaExclamationTriangle className="text-accent-600 shrink-0" size={20} />
                  <p className="text-accent-600 text-sm font-semibold leading-relaxed font-dm-sans">
                    {adminData?.name || 'The admin'} will be signed out immediately and must use the new password to log in.
                  </p>
                </div>

                {/* New Password */}
                <CustomInput
                  label="New Password"
                  type="password"
                  placeholder="••••••••••••••••"
                  prefixIcon={<IoMdLock className="text-primary-500" size={22} />}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  required
                />

                {/* Confirm Password */}
                <CustomInput
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••••••••••"
                  prefixIcon={<IoMdLock className="text-primary-500" size={22} />}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-6 shrink-0">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="bordered"
                  size="medium"
                  className="border-error-500! text-error-500! font-dm-sans"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="error"
                  size="medium"
                  hasShadow
                  className="font-dm-sans"
                >
                  Reset Password
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ResetPasswordModal;
