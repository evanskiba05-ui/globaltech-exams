import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { clx } from "@/lib/helper";

type Props = HTMLMotionProps<"button"> & {
  className?: string;
  children: React.ReactNode;
  hasShadow?: boolean;
  variant?: "primary" | "secondary" | "tertiary" | "accent" | "bordered" | "error" | "success";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
};
const styles = {
  primary: "bg-primary-450 text-white",
  secondary: "bg-primary-500 text-white shadow-primary-500",
  tertiary: "bg-[#245292] text-white",
  accent: "bg-accent-600 text-white shadow-accent-600",
  success: "bg-success-500 text-white",
  bordered: "border border-[#cacfd8] text-[#cacfd8] font-medium ",
  error: "bg-error-500 text-white shadow-error-500",
};

const sizes = {
  small: "px-6 py-1.5",
  medium: "px-6 py-3",
  large: "px-4 py-2 text-3xl  rounded-lg min-w-[80%]  justify-center",
};

const Button = ({
  className,
  children,
  hasShadow,
  variant,
  size,
  disabled = false,
  ...Props
}: Props) => {
  return (
    <motion.button
      {...Props}
      // onClick={onClick}
      //   whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
      }}
      disabled={disabled}
      className={clx(
        "rounded-xl flex items-center gap-4 cursor-pointer",
        disabled && "bg-neutral-300! pointer-events-none shadow-none! border-none!",
        variant && styles[variant],
        size && sizes[size],
        hasShadow && "border-0",
        className,
      )}
    >
      {children}
    </motion.button>
  );
};

export default Button;
