import React from "react";
import { motion } from "motion/react";
import { User, Award, HelpCircle, Pencil, PlayCircle, CheckCircle } from "lucide-react";
import Button from "@/components/button";
import dayjs from "dayjs";
import type { activity } from "@/lib/d-types";
import { PiExamFill } from "react-icons/pi";
import { FaUser } from "react-icons/fa";


interface ActivityItemProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  body,
  time,
}) => (
  <div className="flex items-start gap-4 py-4 hover:bg-neutral-100 transition-colors px-2 rounded-xl group cursor-pointer">
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: iconBg }}
    >
      <Icon size={20} style={{ color: iconColor }} />
    </div>
    <div className="flex flex-col flex-1 gap-0.5 min-w-0">
      <h4 className="text-[20px] font-semibold text-primary-700 font-dm-sans truncate">
        {title}
      </h4>
      <p className="text-[20px] text-neutral-600 font-dm-sans font-medium line-clamp-2">
        {body}
      </p>
    </div>
    <div className="text-[18px] text-neutral-400 font-dm-sans font-semibold shrink-0 pt-0.5">
      {time}
    </div>
  </div>
);

const RecentActivity: React.FC<{ activities: activity[] }> = ({ activities }) => {
  const getActivityDetails = (activity: activity) => {
    // Default values
    let icon: React.ElementType = User;
    let iconBg = "#bfdbfe"; // secondary-200
    let iconColor = "#3b82f6"; // secondary-400
    let title = activity.message;
    let body = `Exam ID: ${activity.exam_id}`;
    // Format time to just HH:mm using dayjs
    let time = dayjs(activity.time).format("HH : mm");

    switch (activity.type) {
      case "started":
        icon = PlayCircle;
        iconBg = "#eef2f9"; // secondary-200
        iconColor = "#3b82f6"; // secondary-400
        break;
      case "submitted":
        icon = PiExamFill;
        iconBg = iconBg; // accent-200
        iconColor = "#fcd34d"; // accent-600
        break;
      // Add more cases as needed
      default:
        icon = FaUser;
        iconBg = iconBg; // neutral-200
        iconColor = "#6b7280"; // neutral-500
    }

    // Optionally, you could split message into title/body differently
    // For now, keep title as message, body as exam_id
    return { icon, iconBg, iconColor, title, body, time };
  };

  const activitiesWithDetails = activities.map(getActivityDetails);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] h-full flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-[28px] font-extrabold font-syne text-primary-700  leading-[1.1] tracking-[-0.02em] max-w-[150px]">
          Recent Activity
        </h2>

        <Button variant="bordered" size="medium" className="text-neutral-950 text-[16px] font-semibold" >
          View All
        </Button>
      </div>

      <div className="flex flex-col divide-y divide-neutral-200">
        {activitiesWithDetails.map((activity, index) => (
          <ActivityItem key={index} {...activity} />
        ))}
      </div>
    </motion.div>
  );
};

export default RecentActivity;