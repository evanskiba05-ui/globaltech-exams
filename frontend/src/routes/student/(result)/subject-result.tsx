import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { Variants } from 'framer-motion';
import { Check, X, Minus, ArrowRight } from 'lucide-react';
import { useExamHook } from "@/hooks/useExamHook";
import { getResultMetrics } from "@/lib/calculations";
import Button from "@/components/button";

import { useAlertStore } from "@/store/alert";
import { HeaderStrip } from './_components/header-strip';
import { DonutChart } from './_components/donut-chart';
import { StatCard } from './_components/stat-card';
import { ScorePerformanceCard } from './_components/score-performance-card';

export const Route = createFileRoute('/student/(result)/subject-result')({
  component: RouteComponent,
});

export default function RouteComponent() {
  const { selectedSubjectIds, selectedSubjects, fetchExamResult, getResultsBySubject } = useExamHook();

  React.useEffect(() => {
    fetchExamResult();
  }, [fetchExamResult]);
  
  const [viewIndex, setViewIndex] = useState(0);

  const navigate = useNavigate();

  const allResults = getResultsBySubject();

  if (selectedSubjectIds.length === 0) {
    return <div className="min-h-screen bg-primary-50 flex items-center justify-center text-lg font-medium text-slate-500">No subjects selected</div>;
  }

  const currentSubjectId = selectedSubjectIds[viewIndex];
  const currentSubjectItem = selectedSubjects.find((s: any) => s.id === currentSubjectId);
  const currentResult = allResults.find((r: any) => r.slug === currentSubjectItem?.slug) || { correct: 0, wrong: 0, unanswered: 0, total_questions: 0 };

  const nextSubjectId = selectedSubjectIds[viewIndex + 1];
  const nextSubject = selectedSubjects.find((s: any) => s.id === nextSubjectId);
  
  const scorePercent = currentResult.total_questions > 0 ? Math.round((currentResult.correct / currentResult.total_questions) * 100) : 0;
  
  const { label: grade } = getResultMetrics(currentResult.correct, currentResult.total_questions);

  const DATA = {
    subject: currentSubjectItem?.name || "Unknown",
    correct: currentResult.correct,
    wrong: currentResult.wrong,
    unanswered: currentResult.unanswered,
    total: currentResult.total_questions,
    scorePercent: scorePercent,
    grade: grade,
    subjectIcon: currentSubjectItem?.icon || ""
  };

  const handleProceed = () => {
    if (nextSubjectId) {
      setViewIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate({ to: '/student/overall-result' }).catch((error) => {
        console.error(error);
        useAlertStore.getState().showAlert({ type: "error", message: "Failed to navigate to results." });
      });
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.6 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div key={currentSubjectId} className="h-full bg-primary-50 overflow-x-hidden pb-12">
      <HeaderStrip icon={DATA.subjectIcon} subject={DATA.subject} />

      <div className="max-w-[720px] mx-auto px-4 lg:px-0">
        <DonutChart 
          score={DATA.correct} 
          total={DATA.total} 
          percentage={DATA.scorePercent} 
          grade={DATA.grade} 
        />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-row items-stretch justify-center gap-5 mb-6"
        >
          <StatCard title="Correct" value={DATA.correct} icon={Check} colorClass="text-green-500" variants={itemVariants} />
          <StatCard title="Wrong" value={DATA.wrong} icon={X} colorClass="text-red-500" variants={itemVariants} />
          <StatCard title="Unanswered" value={DATA.unanswered} icon={Minus} colorClass="text-slate-800" variants={itemVariants} />
        </motion.div>

        <ScorePerformanceCard scorePercent={DATA.scorePercent} />

        <Button 
          variant="primary"
          onClick={handleProceed as any}
          className="w-full h-[60px] rounded-2xl flex items-center justify-center gap-3 text-white font-semibold text-[17px] !mb-8"
        >
          <span>{nextSubject ? `Proceed to ${nextSubject.name}` : "View Final Results"}</span>
          <ArrowRight size={18} strokeWidth={2} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}