import React from "react";
import Button from "./button";
import GradutionCapIcon from "@/components/icons/graduation-cap";
import { motion } from "motion/react";

type Props = {
  variant: "small" | "large" |"medium";
};

const sizes = {
  small: "rounded-md",
  medium: "px-6 py-3",
  large: "px-4 py-4 rounded-3xl",
};
const Logo = ({ variant }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
      }}
      className={`h-full w-full bg-accent-600 text-white shadow-accent-600 flex items-center justify-center ${sizes[variant]}`}
    >
      <GradutionCapIcon size={variant == "small" ? 20 : 48} />
    </motion.div>
  );
};

export default Logo;
