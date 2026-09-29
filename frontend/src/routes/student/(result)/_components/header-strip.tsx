import React, { isValidElement } from 'react';
import { motion } from 'motion/react';

export const HeaderStrip = ({ icon: IconRender, subject }: { icon: any; subject: string }) => {

  let renderedIcon = null;

  if (IconRender) {
    if (typeof IconRender === "string") {
      renderedIcon = <img src={IconRender} alt={subject} className="w-5 h-5" />;
    } else if (isValidElement(IconRender)) {
      renderedIcon = IconRender; // already a rendered element
    } else {
      // Covers plain function components as well as forwardRef/memo
      // component objects (e.g. lucide-react icons), whose typeof is
      // "object", not "function".
      const Icon = IconRender as React.ElementType;
      renderedIcon = <Icon size={34} />;
    }
  }
  
  return (
  <motion.header 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="w-full bg-primary-450 py-4 flex flex-col items-center justify-center shadow-md"
  >
    <div className="text-[40px] mb-1 text-white">
      {renderedIcon}
    </div>
    <h1 className="text-[28px] font-bold text-white tracking-[-0.3px] leading-tight">
      {subject}
    </h1>
    <p className="text-[15px] font-normal text-blue-200 tracking-[0.2px] mt-1">
      Subject Complete
    </p>
  </motion.header>
)};
