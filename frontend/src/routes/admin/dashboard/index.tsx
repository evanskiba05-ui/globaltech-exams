import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Users, Award, CheckCircle, BarChart2, HelpCircle } from "lucide-react";
import dayjs from "dayjs";
import { useAdminAuthStore } from "@/store/admin-auth";

// Dashboard Components
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import ActiveExams from "@/components/dashboard/ActiveExams";
import { useEffect, useState } from "react";
import { getDashboard, getRecentActivity } from "@/lib/api";
import type { activity, dashboardData } from "@/lib/d-types";

export const Route = createFileRoute("/admin/dashboard/")({
  component: () => <AdminDashboard />,
});

function AdminDashboard() {
  const { admin } = useAdminAuthStore();
  const [dashboardData, setdashboardData] = useState<dashboardData>();
  const [recentActivity, setRecentActivity] = useState<activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("loading");
      // Fetch dashboard data
      const res = await getDashboard();
      setdashboardData(res);

      // // Fetch all activities
      const activities = await getRecentActivity();

      setRecentActivity(activities);

      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col gap-1 mb-8"
      >
        <h1 className="text-[40px] font-semibold text-neutral-800 leading-[1.2] tracking-[-0.02em]">
          Dashboard Overview
        </h1>
        <p className="text-[22px] text-neutral-700 font-dm-sans font-medium">
          Welcome back, {admin?.full_name || "Super Admin"} ·{" "}
          {dayjs().format("dddd, DD MMMM YYYY")}
        </p>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatCard
          icon={Users}
          iconBg="color-mix(in srgb, #b118ae, transparent 85%)"
          iconColor="#b118ae"
          number={dashboardData?.total_students!}
          label="TOTAL STUDENTS"
          subtext="32 new this month"
          growth="+12%"
          delay={0.2}
        />
        <StatCard
          icon={Award}
          iconBg="color-mix(in srgb, var(--color-accent-300), transparent 70%)"
          iconColor="var(--color-accent-300)"
          number={dashboardData?.total_exams!}
          label="TOTAL EXAMS"
          subtext="3 currently active"
          growth="+5%"
          delay={0.28}
        />
        <StatCard
          icon={HelpCircle}
          iconBg="var(--color-error-50)"
          iconColor="var(--color-error-500)"
          number={dashboardData?.total_questions!}
          label="QUESTIONS"
          subtext="Across all subjects"
          delay={0.36}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StatCard
          icon={CheckCircle}
          iconBg="color-mix(in srgb, var(--color-success-500), transparent 85%)"
          iconColor="var(--color-success-500)"
          number={dashboardData?.completed_exams!}
          label="COMPLETED"
          subtext="Exam sittings total"
          growth="+8%"
          delay={0.44}
        />
        <StatCard
          icon={BarChart2}
          iconBg="color-mix(in srgb, var(--color-primary-500), transparent 85%)"
          iconColor="var(--color-primary-500)"
          number={`${dashboardData?.avg_score!}%`}
          label="AVG. SCORE"
          subtext="Platform average"
          growth="+3%"
          delay={0.52}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <RecentActivity activities={recentActivity} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col gap-6"
        >
          <QuickActions />
          <ActiveExams />
        </motion.div>
      </div>
    </>
  );
}
