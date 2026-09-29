import { motion } from "motion/react";
import React, { type ReactNode } from "react";

type Props = {
  children: ReactNode;
  variant?: "primary" | "accent" | "gradient";
  icon?: string | React.ReactNode;
};

const styles = {
  primary: "border-primary-500 inset-shadow-primary-500 bg-white",
  accent: "border-accent-500 inset-shadow-accent-500 bg-[#f7ebb7]",
  gradient: "bg-linear-to-r from-[#0A1F44] to-[#194DAA] border-0!",
};

const CardLayout = ({ children, icon }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="max-w-165 mx-auto mt-6 mb-8 bg-[#f7ebb7] border-2 border-accent-500 inset-shadow-accent-500 rounded-[10px] p-5 flex  items-start gap-3 shadow-sm"
    >
      <div className=" my-auto">
        {icon &&
          (typeof icon === "string" ? (
            <img src={icon} alt="" className="w-10 h-10 rounded-full" />
          ) : (
            icon
          ))}
      </div>
      <div className="text-xl leading-[1.6] text-accent-700">{children}</div>
    </motion.div>
  );
};

export default CardLayout;
