import { Eye, EyeClosed } from "lucide-react";
import React, { type InputHTMLAttributes } from "react";

import { motion } from "motion/react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  placeholder?: string;
  type?: string;
  icon?: boolean;
  label?: string;
  visible?: boolean;
  setIsvisible?: (visible: boolean) => void;
  prefixIcon?: React.ReactNode;
  error?: string;
  required?: boolean;
};

const CustomInput = React.forwardRef<HTMLInputElement, Props>(({
  placeholder,
  type,
  icon,
  label,
  visible,
  setIsvisible,
  prefixIcon,
  className = "",
  error,
  required,
  ...Props
}, ref) => {
  return (
    <fieldset className="fieldset space-y-2 relative">
     {label && (
        <legend className="fieldset-legend font-dm-sans text-neutral-600 text-lg font-medium">
         {label}{required && <span className="text-error-500 ml-0.5">*</span>}
       </legend>
      )}

      <div className="relative">
        <input
          {...Props}
          ref={ref}
          type={type}
          className={`input rounded-xl placeholder:text-neutral-400 text-neutral-800 text-lg font-medium w-full h-14 ${
            error ? "border-error-500 focus:ring-error-500/20" : "border-neutral-400 focus:ring-primary-500/20"
          } ${
            prefixIcon ? "pl-14" : "pl-6"
          } ${className}`}
          placeholder={placeholder}
        />
        {prefixIcon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-400 z-10">
            {prefixIcon}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-error-500 absolute -bottom-4 font-medium ml-1">{error}</p>}
      {icon && setIsvisible && (
        <>
          <motion.div
            // whileTap={{ scale: 0.98 }}
            // transition={{ duration: 0.8 }}
            className="cursor-pointer"
            onClick={() => setIsvisible(!visible)}
          >
            {visible ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Eye className="absolute right-4 top-5 text-neutral-800" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                <EyeClosed className="absolute right-4 top-5 text-neutral-800" />
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </fieldset>
  );
});

CustomInput.displayName = "CustomInput";

export default CustomInput;
