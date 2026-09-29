import { Check, BookOpen } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import type { Subject } from "@/lib/d-types";
import Lock from "@/components/icons/lockIcon";

export const SubjectCard = React.memo(
  ({
    subject,
    isSelected,
    onToggle,
    index,
    maxReached,
  }: {
    subject: Subject;
    isSelected: boolean;
    onToggle: (id: string) => void;
    index: number;
    maxReached: boolean;
  }) => {
    const isCompulsory = subject.isCompulsory;

    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        // whileHover={

        // }
        whileTap={!isCompulsory ? { scale: 0.98 } : {}}
        transition={{
          delay: 0.5 + index * 0.08,
          duration: 0.45,
          ease: "easeOut",
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        }}
        onClick={() => !isCompulsory && onToggle(subject.id)}
        style={
          !isCompulsory && !isSelected
            ? {
                borderColor: "#94a3b8",
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              }
            : {}
        }
        className={`
        relative p-9  rounded-[24px] cursor-pointer mt-5 transition-colors duration-300 flex flex-col gap-3
        ${
          isCompulsory
            ? "bg-linear-to-r from-primary-600  from-10% to-primary-450 to-80% shadow-[0_4px_16px_rgba(30,58,95,0.3)] border-none"
            : !isCompulsory && isSelected
              ? "border-primary-500 border-l-8 bg-white border-2"
              : !isCompulsory && !isSelected && maxReached
                ? "pointer-events-none bg-neutral-300 opacity-50"
                : ""
        }
      `}
      >
        <div className="flex items-center  gap-10">
          <div
            className="size-21.5 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: subject.iconBg,
            }}
          >
            {subject.icon && !React.isValidElement(subject.icon) && typeof subject.icon !== "string" ? (
              React.createElement(subject.icon, {
                size: 50,
                color: subject.iconColor,
                strokeWidth: 2,
              })
            ) : (
              <BookOpen size={50} color={subject.iconColor || "#0369a1"} strokeWidth={2} />
            )}
          </div>

          <div className="flex flex-col items-start  space-y-3">
            <h3
              className={`text-[28px] font-bold leading-[1.3] -tracking-[0.1px] ${isCompulsory ? `text-white` : `text-neutral-600`}`}
            >
              {subject.name}
            </h3>
            <p
              className={`text-[20px] mt-1 ${isCompulsory ? `text-neutral-300` : `text-neutral-500`}`}
            >
              {subject.questions} Questions.
            </p>
            <p
              className={`text-[20px] ${isCompulsory ? `text-neutral-300` : `text-neutral-500`}`}
            >
              {isCompulsory ? subject.meta : `${subject.time} Minutes`}
            </p>

            {isCompulsory && (
              <div className="mt-2 inline-flex justify-center items-center bg-accent-600 text-black text-[11px] gap-3 font-bold tracking-widest px-3 py-1 rounded-xl uppercase">
                <Lock size={16} fill="black" /> COMPULSORY
              </div>
            )}
          </div>
        </div>

        <>
          {!isCompulsory && (
            <>
              <div
                className={`w-full h-0.5 ${maxReached && !isSelected ? "bg-neutral-600" : "bg-neutral-200"} mt-3 `}
              />
              <span className="ont-semibold text-sm text-left tracking-[0.5px] text-neutral-400 mt-2 group-hover:text-neutral-500">
                {!isCompulsory && !isSelected && (
                  <p className={`${maxReached ? "text-black" : ""}`}>
                    + TAP TO SELECT
                  </p>
                )}
                {!isCompulsory && isSelected && (
                  <p className="flex text-secondary-500  gap-1">
                    {" "}
                    <Check size={16} /> SELECTED
                  </p>
                )}
              </span>
            </>
          )}
        </>

        {isSelected && !isCompulsory && (
          <div className="flex absolute right-9 items-center gap-2 ">
            <div className="p-4 rounded-full bg-success-500 flex items-center justify-center">
              <img src="/icons/check.png" alt="" />
            </div>
          </div>
        )}
      </motion.button>
    );
  },
);
