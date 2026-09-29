import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FaUser, FaEnvelope, FaChevronDown, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { AiFillExclamationCircle } from 'react-icons/ai';
import { IoMdLock } from 'react-icons/io';
import Button from "@/components/button";
import CustomInput from "@/components/input";


type AdminData = {
  name?: string;
  email?: string;
  role?: 'admin' | 'super_admin';
};

type AdminFormData = {
  full_name: string;
  email: string;
  role: 'admin' | 'super_admin';
  password: string;
  confirmPassword: string;
};

type AdminFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  adminData?: AdminData;
  onSubmit: (data: AdminFormData) => void | Promise<void>;
};

const AdminFormModal = ({ isOpen, onClose, adminData, onSubmit }: AdminFormModalProps) => {
  const isEdit = !!adminData;
  const [role, setRole] = useState<'admin' | 'super_admin'>(adminData?.role || 'admin');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isSuperAdmin = role === 'super_admin';

  const roles = {
    admin: {
      label: 'Admin - Standard Access',
      color: 'var(--color-primary-500)',
      permissions: [
        'Manage students, exams & questions',
        'View results and analytics',
        'Cannot manage other admin accounts',
      ],
    },
    'super_admin': {
      label: 'Super Admin - Full Access + Admin Management',
      color: 'var(--color-accent-500)',
      permissions: [
        'Full platform access',
        'Add, edit & remove admin accounts',
        'Manage all students, exams & questions',
        'View all results and analytics',
      ],
    },
  };

  type Role = keyof typeof roles;
  
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
                  {isEdit ? 'Edit Administrator' : 'Add New Administrator'}
                </h2>
                <p className="text-neutral-500 mt-1 font-dm-sans">
                  {isEdit ? `Editing: ${adminData?.name || 'New Admin'}` : 'Create a new admin account'}
                </p>
              </div>
              <Button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 bg-transparent! border-none! p-0!"
              >
                <FaTimes size={24} />
              </Button>
            </div>

            <form className="flex flex-col flex-1 overflow-hidden px-15 pb-6" onSubmit={(e) => { e.preventDefault(); onSubmit?.({
                full_name: fullNameRef.current?.value || '',
                email: emailRef.current?.value || '',
                role,
                password: passwordRef.current?.value || '',
                confirmPassword: confirmPasswordRef.current?.value || '',
              }); }}>
              <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                {/* Edit: Conditional Super Admin Warning */}
                {isEdit && isSuperAdmin && (
                  <div className="bg-accent-100 border border-accent-400 rounded-2xl p-4 flex items-center gap-3">
                    <FaExclamationTriangle className="text-accent-600 shrink-0" />
                    <p className="text-accent-600 text-sm font-semibold font-dm-sans">
                      Changing to Super Admin grants full platform access and admin management.
                    </p>
                  </div>
                )}

                {/* Add: Welcome Info */}
                {!isEdit && (
                  <div className="bg-primary-100 border border-primary-200 rounded-2xl p-4 flex items-center gap-3">
                    <AiFillExclamationCircle className="text-primary-400 shrink-0" size={20} />
                    <p className="text-neutral-500 text-sm font-medium font-dm-sans">
                      A welcome email with login credentials will be sent to the provided address.
                    </p>
                  </div>
                )}

                {/* Full Name */}
                <CustomInput
                  label="Full Name"
                  type="text"
                  placeholder="e.g. Ibrahim Musa"
                  prefixIcon={<FaUser className="text-primary-500" size={22} />}
                  required={!isEdit}
                  ref={fullNameRef}
                  name="full_name"
                  {...(isEdit ? { value: adminData?.name, disabled: true } : {})}
                />

                {/* Email */}
                <CustomInput
                  label="Email Address"
                  type="email"
                  placeholder="e.g. admin@globaltech.ng"
                  prefixIcon={<FaEnvelope className="text-primary-500" size={22} />}
                  required={!isEdit}
                  ref={emailRef}
                  name="email"
                  {...(isEdit ? { value: adminData?.email, disabled: true } : {})}
                />

                {/* Role Dropdown */}
                <div className="space-y-2">
                  <label className="text-lg font-medium text-neutral-600 font-dm-sans">Roles</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full bg-white border border-neutral-400 rounded-xl py-3 px-4 flex justify-between items-center text-neutral-700 font-medium font-dm-sans"
                    >
                      <span>{roles[role].label}</span>
                      <FaChevronDown className={`text-neutral-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 w-full bg-white border border-neutral-400 rounded-xl mt-1 shadow-xl z-10 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => { setRole('admin'); setIsDropdownOpen(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-dm-sans"
                        >
                          Admin - Standard Access
                        </button>
                        <button
                          type="button"
                          onClick={() => { setRole('super_admin'); setIsDropdownOpen(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-neutral-100 text-neutral-700 font-dm-sans"
                        >
                          Super Admin - Full Access + Admin Management
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Permissions Card */}
                <div className={`rounded-2xl p-6 border transition-all duration-300 bg-primary-100 ${role === 'admin' ? 'border-primary-200' : 'border-warning-500'}`}>
                  <div className="flex gap-4">
                    <div
                      className="mt-1.5 min-w-[12px] h-3 rounded-full"
                      style={{ backgroundColor: roles[role].color }}
                    />
                    <div>
                      <h4 className="font-bold font-dm-sans" style={{ color: roles[role].color }}>
                        {role === 'admin' ? 'Admin — Permissions' : 'Super Admin — Permissions'}
                      </h4>
                      <ul className="mt-2 space-y-1">
                        {roles[role].permissions.map((p, i) => (
                          <li key={i} className="text-sm text-neutral-500 flex items-center gap-2 font-dm-sans">
                            <span className="w-1 h-1 bg-neutral-400 rounded-full"></span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Password Fields (Add mode only) */}
                {!isEdit && (
                  <>
                    <CustomInput
                      label="Password"
                      type="password"
                      placeholder="••••••••••••••••"
                      prefixIcon={<IoMdLock className="text-primary-500" size={22} />}
                      required
                      ref={passwordRef}
                      name="password"
                    />
                    <CustomInput
                      label="Confirm Password"
                      type="password"
                      placeholder="••••••••••••••••"
                      prefixIcon={<IoMdLock className="text-primary-500" size={22} />}
                      required
                      ref={confirmPasswordRef}
                      name="confirmPassword"
                    />
                  </>
                )}
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
                  variant="primary"
                  size="medium"
                  className="font-dm-sans"
                >
                  {isEdit ? 'Save Changes' : 'Create Admin Account'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdminFormModal;
