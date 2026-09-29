import { memo, isValidElement } from "react";
import { motion } from "motion/react";
import Logo from "./logo";
import { Stepper } from "@/routes/student/(exam)/-components/stepper";
import { useExamStore } from "@/store/exam";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/hooks/useAuth";
import { getUserInitials } from "@/lib/helper";

interface NavbarProps {
  title?: string;
  icon?: string | React.ElementType | React.ReactNode;
  hasStepper?: boolean;
  hasTimer?: boolean;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
};

const ExamTimer = memo(() => {
  // Single subscription avoids multiple useSyncExternalStore listeners
  // firing simultaneously, which causes the React 19 infinite loop.
  const { timeLeft, examStarted, examSubmitted } = useExamStore(
    useShallow((state) => ({
      timeLeft: state.timeLeft,
      examStarted: state.examStarted,
      examSubmitted: state.examSubmitted,
    })),
  );

  if (!examStarted || examSubmitted) return null;

  return (
    <div
      className={`px-5 py-2 rounded-full flex items-center gap-2.5 transition-all ${
        timeLeft <= 900
          ? "text-error-400 animate-pulse-fast text-accent-600"
          : "text-primary-100"
      }`}
    >
      TIME LEFT:{" "}
      <span className="text-[20px] font-bold tabular-nums tracking-tight">
        {formatTime(timeLeft)}
      </span>
    </div>
  );
});

export const Navbar = ({
  title = "Jamb Practice Questions",
  hasStepper = true,
  hasTimer = false,
  icon,
}: NavbarProps) => {
  const { user } = useAuth();

  let renderedIcon = null;

  if (icon) {
    if (typeof icon === "string") {
      renderedIcon = <img src={icon} alt={title} className="w-5 h-5" />;
    } else if (isValidElement(icon)) {
      renderedIcon = icon; // already a rendered element
    } else {
      // Covers plain function components as well as forwardRef/memo
      // component objects (e.g. lucide-react icons), whose typeof is
      // "object", not "function".
      const Icon = icon as React.ElementType;
      renderedIcon = <Icon size={34} />;
    }
  }

   

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0  font-dm-sans space-y-5 z-50  bg-white shadow-dark"
    >
      <div className="flex items-center justify-center  h-20 bg-primary-450">
        <div className="flex items-center justify-between px-6 h-full  w-[95%]">
          <div className="flex items-center">
            <div className="size-10">
              <Logo variant="small" />
            </div>
            <span className="ml-3 text-xl font-semibold text-neutral-200">
              GlobalTech CBT
            </span>
          </div>

          <h2 className="text-2xl font-bold text-neutral-200 hidden md:flex gap-5 justify-center items-center">
            {renderedIcon}
            {title}
          </h2>
          {hasTimer && <ExamTimer />}
          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <div className="px-2 py-2 bg-primary-500 border-secondary-400 border-6 rounded-full flex items-center justify-center text-neutral-200 text-xl font-bold">
                {getUserInitials(user?.full_name) || "U"}
              </div>
              <span className="ml-3 text-xl text-neutral-200">
                Welcome, {user?.full_name || "User"}
              </span>
            </div>
          </div>
        </div>
      </div>
      {hasStepper && <Stepper />}
    </motion.nav>
  );
};
