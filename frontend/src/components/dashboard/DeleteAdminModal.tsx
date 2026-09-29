import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FaTimes } from "react-icons/fa";
import { CiNoWaitingSign } from "react-icons/ci";
import Button from "@/components/button";
import CustomInput from "@/components/input";
import { getUserInitials } from "@/lib/helper";

type AdminData = {
  name?: string;
  email?: string;
  role?: string;
};

type DeleteAdminModalProps = {
  isOpen: boolean;
  onClose: () => void;
  adminData?: AdminData;
  onSubmit: () => void | Promise<void>;
};

const DeleteAdminModal = ({ isOpen, onClose, adminData, onSubmit }: DeleteAdminModalProps) => {
  const [confirmName, setConfirmName] = useState("");

  if (!isOpen) return null;

  const isConfirmed = confirmName === adminData?.name;

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
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="flex justify-between items-start py-6 px-15 shrink-0">
              <div>
                <h2 className="text-[32px] font-bold text-error-600 font-dm-sans tracking-[-0.01em]">
                  Delete Admin Account
                </h2>
              </div>
              <Button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 bg-transparent! border-none! p-0!"
              >
                <FaTimes size={24} />
              </Button>
            </div>

            <form className="flex flex-col flex-1 overflow-hidden px-15 pb-6" onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}>
              <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                {/* Warning Banner */}
                <div className="bg-[#fef2f2] border border-error-500 rounded-2xl p-4 flex gap-4">
                  <CiNoWaitingSign
                    className="text-error-500 shrink-0 mt-1"
                    size={24}
                  />
                  <p className="text-error-500 text-sm font-semibold leading-relaxed font-dm-sans">
                    This action is permanent and cannot be undone. All session
                    data for {adminData?.name} will be deleted immediately.
                  </p>
                </div>

                {/* Admin Info Summary */}
                <div className="bg-primary-100 border border-neutral-200 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-secondary-400 flex items-center justify-center text-white text-xs font-semibold">
                    {getUserInitials(adminData?.name)}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-800 font-dm-sans">
                      {adminData?.name}
                    </p>
                    <p className="text-xs text-neutral-500 font-dm-sans">
                      {adminData?.email}
                    </p>
                  </div>
                  <div className="ml-auto bg-primary-100 text-primary-500 px-3 py-2 border border-primary-400 rounded-[10px] text-[18px] font-bold  font-dm-sans">
                    ●{" "}
                    {adminData?.role === "super-admin"
                      ? "Super Admin"
                      : "Admin"}
                  </div>
                </div>

                {/* Confirmation Input */}
                <CustomInput
                  label={`Type "${adminData?.name}" to confirm`}
                  type="text"
                  placeholder="Type Admin's full name"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
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
                  disabled={!isConfirmed}
                  variant="error"
                  size="medium"
                  hasShadow
                  className={`font-dm-sans ${!isConfirmed ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Delete Permanently
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteAdminModal;
