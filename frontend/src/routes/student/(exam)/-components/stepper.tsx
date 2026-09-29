import { motion } from "motion/react";

export const Stepper = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.4 }}
    className="flex items-center justify-center  text-xl mb-3"
  >
    {/* Step 1 */}
    <div className="flex items-center gap-2 ">
      <div className="p-4 rounded-full bg-success-500 flex items-center justify-center text-white font-bold">
        <img src="/icons/check.png" alt="" />
      </div>
      <span className="ml-2  text-neutral-600 font-semibold">Login</span>
    </div>
    <div className="w-25 h-1 bg-success-500 mx-4" />

    {/* Step 2 */}
    <div className="flex items-center gap-2">
      <div className="px-4 py-2 rounded-full bg-primary-500 border-6 border-primary-200 flex items-center justify-center text-neutral-200  font-bold">
        2
      </div>
      <span className="ml-2 font-semibold text-primary-500">Select Subjects</span>
    </div>
    <div className="w-25 h-1 bg-neutral-300 mx-4" />

    {/* Step 3 */}
    <div className="flex items-center ">
      <div className="px-4 py-2 rounded-full bg-neutral-300 flex items-center justify-center text-black font-medium">
        3
      </div>
      <span className="ml-2  text-neutral-600 font-bold">Begin Exam</span>
    </div>
  </motion.div>
);
