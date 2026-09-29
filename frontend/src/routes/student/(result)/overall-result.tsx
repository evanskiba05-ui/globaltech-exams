import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useState, useEffect, isValidElement } from 'react';
import { motion, useAnimation } from 'motion/react';
import { 
  FileText, 
  FileDown, 
  Printer, 
  ArrowLeft 
} from 'lucide-react';
import { useExamHook } from "@/hooks/useExamHook";
import { useAuth } from "@/hooks/useAuth";
import { getResultMetrics } from "@/lib/calculations";
import Button from "@/components/button";
import { useRef } from 'react';

export const Route = createFileRoute('/student/(result)/overall-result')({
  component: RouteComponent,
});

// --- Types & Data ---

interface SubjectResult {
  name: string;
  score: number;
  total: number;
  percent: number;
  grade: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

// --- Sub-Components ---

const CountUp = ({ end, duration = 1.2, delay = 0, suffix = "" }: { end: number; duration?: number; delay?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    const timer = setTimeout(() => {
      window.requestAnimationFrame(step);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [end, duration, delay]);

  return <>{count}{suffix}</>;
};

const GradeBadge = ({ percent, grade, isDark = false }: { percent?: number; grade: string; isDark?: boolean }) => {
//   const isD = grade.includes("Grade D");
  
//   if (isDark) {
//     return (
//       <div className={`bg-[#2d5016] px-4 py-1.5 rounded-full`}>
//         <span className="text-[13px] font-semibold text-white tracking-[0.3px]">{grade}</span>
//       </div>
//     );
//   }



  return (
    <div className={`${percent && percent >= 70 ? "bg-success-500/20 text-success-500" : percent && percent >= 60 ? "bg-primary-500/20 text-primary-500" : percent && percent >= 50 ? "bg-accent-500/20 text-accent-500" : "bg-error-500/20 text-error-500"}  px-3 py-1 rounded-[24px] whitespace-nowrap`}>
      <span className="text-[14px] font-bold tracking-[0.3px]">
        {percent && `${percent}%`} {grade}
      </span>
    </div>
  );
};

const SubjectCard = React.memo(({ data, index }: { data: SubjectResult; index: number }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 24, scale: 0.95 },
      show: { opacity: 1, y: 0, scale: 1 }
    }}
    transition={{ duration: 0.45, ease: "easeOut" }}
    className={`
      bg-neutral-50  rounded-3xl px- py-4 flex flex-col items-center justify-center gap-2 min-h-[160px] transition-all duration-200 hover:-translate-y-[3px] shadow-dark-2
    `}
  >
    <div className="mb-1">{data.icon}</div>
    <span className="text-[18px] font-medium text-neutral-600 text-center">{data.name}</span>
    <span className="text-[22px] font-semibold text-neutral-800 tracking-[-0.3px]">{data.score}/{data.total}</span>
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3 + (index * 0.1) + 0.3, duration: 0.3 }}
    >
      <GradeBadge percent={data.percent} grade={data.grade} />
    </motion.div>
  </motion.div>
));

// --- Main Page ---

export default function RouteComponent() {
  const { selectedSubjects, getResultsBySubject, getAllResults, resetExam, fetchExamResult } = useExamHook();
  const { user } = useAuth();
  const navigate = useNavigate();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchExamResult();
  }, [fetchExamResult]);
  
  const allResults = getResultsBySubject();
  const globalTotals = getAllResults();

  const handlePrint = () => window.print();

  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    
    // We'll build a perfectly styled HTML slip that mirrors the UI
    // and uses standard CSS to avoid oklch errors.
    const studentName = user?.full_name || "Student";
    const examId = user?.exam_id || "N/A";
    const submittedAt = new Date().toLocaleString();

    const subjectCardsHTML = mappedResults.map(res => `
      <div class="card">
        <div class="icon-placeholder">${res.name.substring(0, 1)}</div>
        <div class="subject-name">${res.name}</div>
        <div class="subject-score">${res.score}/${res.total}</div>
        <div class="badge ${res.percent >= 70 ? 'bg-success' : res.percent >= 60 ? 'bg-primary' : res.percent >= 50 ? 'bg-accent' : 'bg-error'}">
          ${res.percent}% ${res.grade}
        </div>
      </div>
    `).join('');

    const slipHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #fff; color: #374151; }
          .header { background: #123c87; color: white; padding: 40px 20px; text-align: center; }
          .trophy { font-size: 48px; margin-bottom: 10px; }
          .title { font-size: 32px; font-weight: 700; margin: 0; }
          .student-info { font-size: 18px; opacity: 0.9; margin-top: 5px; }
          .meta { font-size: 14px; opacity: 0.7; margin-top: 5px; }
          .container { max-width: 900px; mx-auto; padding: 30px; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 20px; }
          .card { background: #f9fafb; border-radius: 20px; padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; border: 1px solid #e5e7eb; }
          .icon-placeholder { width: 40px; height: 40px; background: #e8edf5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 10px; color: #123c87; }
          .subject-name { font-size: 16px; font-weight: 500; color: #6b7280; }
          .subject-score { font-size: 20px; font-weight: 700; color: #111827; margin: 5px 0; }
          .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
          .bg-success { background: rgba(22, 163, 74, 0.2); color: #16a34a; }
          .bg-primary { background: rgba(21, 101, 192, 0.2); color: #1565c0; }
          .bg-accent { background: rgba(217, 119, 6, 0.2); color: #d97706; }
          .bg-error { background: rgba(220, 38, 38, 0.2); color: #dc2626; }
          .total-panel { background: #123c87; border-radius: 18px; padding: 30px; margin-top: 30px; display: flex; justify-content: space-between; align-items: center; color: white; }
          .total-score-box .label { font-size: 14px; opacity: 0.8; letter-spacing: 1px; font-weight: 600; }
          .total-score-box .score { font-size: 32px; font-weight: 700; }
          .aggregate-box { text-align: right; }
          .aggregate-box .percent { font-size: 32px; font-weight: 700; }
          .footer { text-align: center; margin-top: 50px; color: #9ca3af; font-style: italic; border-top: 1px solid #eee; padding-top: 20px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="trophy">🏆</div>
          <h1 class="title">Examination Complete!</h1>
          <div class="student-info">${studentName} – ${examId}</div>
          <div class="meta">Completed on ${submittedAt}</div>
        </div>
        <div class="container">
          <div class="grid">${subjectCardsHTML}</div>
          <div class="total-panel">
            <div class="total-score-box">
              <div class="label">TOTAL SCORE</div>
              <div class="score">${globalTotals.correct} / ${globalTotals.total}</div>
            </div>
            <div class="aggregate-box">
              <div class="label">AGGREGATE</div>
              <div class="percent">${globalPercent}%</div>
              <div class="badge ${globalPercent >= 70 ? 'bg-success' : globalPercent >= 60 ? 'bg-primary' : globalPercent >= 50 ? 'bg-accent' : 'bg-error'}">
                ${globalGrade}
              </div>
            </div>
          </div>
          <div class="footer">
            Thank you for taking this examination. This is an official result slip generated by SDC Global CBT.
          </div>
        </div>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(slipHTML);
      printWindow.document.close();
    }
    
    setIsGenerating(false);
  };

  const mappedResults: SubjectResult[] = allResults.map((res: any, idx: number) => {
    const subjectMetadata = selectedSubjects.find((s: any) => s.slug === res.slug);
    
    // Backend returns 'correct' and 'total_questions'
    const { percent, label: grade } = getResultMetrics(res.correct, res.total_questions);

    let renderedIcon: React.ReactNode = null;
    if (subjectMetadata?.icon) {
      if (typeof subjectMetadata.icon === "string") {
        renderedIcon = <img src={subjectMetadata.icon} alt={subjectMetadata.name} className="w-8 h-8 object-contain" />;
      } else if (isValidElement(subjectMetadata.icon)) {
        renderedIcon = subjectMetadata.icon;
      } else {
        const Icon: any = subjectMetadata.icon;
        renderedIcon = <Icon size={28} />;
      }
    }

    return {
      name: res.name || subjectMetadata?.name || "Unknown",
      score: res.correct,
      total: res.total_questions,
      percent,
      grade,
      icon: renderedIcon,
      highlight: idx === 0, // Highlight the first subject
    };
  });

  const { percent: globalPercent, label: globalGrade } = getResultMetrics(globalTotals.correct, globalTotals.total);

  return (
    <div ref={resultRef} className="min-h-screen font-['Inter',sans-serif] selection:bg-blue-100 pb-12 bg-white">
      {/* 1. HEADER STRIP */}
      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="header-strip w-full bg-primary-450 py-5 flex flex-col items-center justify-center gap-2 print:bg-[#1e3a5f]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ 
            scale: [0, 1.2, 1],
            y: [0, -4, 0]
          }}
          transition={{ 
            scale: { duration: 0.6, ease: "easeOut", delay: 0.1 },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          className="text-[52px] mb-2"
        >
          🏆
        </motion.div>
        <h1 className="text-[40px] font-bold text-neutral-100 tracking-[-0.5px] leading-[1.2] text-center">
          Examination Complete!
        </h1>
        <p className="text-[24px] font-medium text-neutral-200 tracking-[0] mt-1 text-center">
          {user?.full_name || "Student"} – {user?.exam_id || "N/A"}
        </p>
        <p className="text-[20px] font-normal text-neutral-300 tracking-[0] mt-0.5 text-center">
          Completed: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </p>
      </motion.header>

      <div className="max-w-[960px] mx-auto px-6">
        {/* 2. SUBJECT SCORE CARDS GRID */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 mb-6"
        >
          {mappedResults.map((res, idx) => (
            <SubjectCard key={idx} data={res} index={idx} />
          ))}
        </motion.div>

        {/* 3. TOTAL SCORE PANEL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="total-panel bg-primary-450 border border-[#2d4f7c] rounded-[18px] px-6 sm:px-10 py-7 shadow-[0_8px_32px_rgba(30,58,95,0.4)] flex flex-col sm:flex-row items-center justify-between gap-6 mb-6 print:bg-[#1e3a5f]"
        >
          <div className="flex flex-col items-center sm:items-start gap-2">
            <span className="text-[24px] font-semibold text-primary-100 tracking-[1.5px] uppercase">TOTAL SCORE</span>
            <span className="text-[40px] font-bold text-white tracking-[-1px] leading-none">
              <CountUp end={globalTotals.correct /globalTotals.total * 400} delay={0.8} /> / 400
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2">
            <span className="text-[24px] font-medium text-primary-200 tracking-[1.5px] uppercase">AGGREGATE</span>
            <div className="flex flex-col items-center sm:items-end gap-2">
              <span className={`text-[40px] font-bold ${globalPercent >= 70 ? "text-success-500" : globalPercent >= 60 ? "text-primary-500" : globalPercent >= 50 ? "text-accent-500" : "text-error-500"} tracking-[-1px] leading-none`}>
                <CountUp end={globalPercent} suffix="%" delay={0.9} />
              </span>
              <GradeBadge grade={globalGrade} isDark />
            </div>
          </div>
        </motion.div>

        {/* 4. DOWNLOAD RESULT SLIP SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.4 }}
          className="no-print bg-[#fef9c3] border-4 border-dashed border-accent-400 rounded-3xl px-8 py-8 flex flex-col items-center gap-4 mb-6"
        >
          <FileText size={47} className="text-primary-500 mb-1" strokeWidth={2} />
          <div className="text-center">
            <h2 className="text-[32px] font-semibold text-accent-700 tracking-[-0.2px] leading-[1.3]">Download Your Result Slip</h2>
            <p className="text-[26px] font-medium text-accent-600 leading-[1.5] mt-1">
              Save or print your offical examination result for your records
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2 w-full">
            <Button
              className='!shadow-none font-bold'
              variant='accent'
              size='medium'
              onClick={handleDownloadPDF}
              disabled={isGenerating}
            >
              <FileDown size={18} strokeWidth={2} />
              <p>{isGenerating ? 'Generating...' : 'Download PDF'}</p>
            </Button>

            <Button
              className='!shadow-none border-2! border-accent-600! text-accent-700! font-bold!'
              variant='bordered'
              size='medium'
              onClick={handlePrint}
            >
              <Printer size={18} strokeWidth={2} />
              <p>Print Result</p>
            </Button>
          </div>
        </motion.div>

        {/* 5. FOOTER & RETURN */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.4 }}
          className="no-print flex flex-col items-center gap-6 mt-4 mb-10"
        >
          <div className="text-center text-[22px] space-y-1">
            <p className=" italic font-normal text-[#94a3b8] leading-[1.6]">
              Thank you for taking this examination. Your results have&nbsp;&nbsp;been recorded.
            </p>
            <p className="italic font-normal text-[#94a3b8] leading-[1.6]">
              Good luck in the actual JAMB examination!
            </p>
          </div>

          
          <Button
            variant="primary"
            size="medium"
            className="py-8! px-14! rounded-3xl!"
            onClick={() => {
              resetExam();
              navigate({ to: "/student/select-subject" });
            }}
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Return to Portal
          </Button>
        </motion.footer>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .header-strip { background: #1a3a8f !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .total-panel { background: #1a3a8f !important; border-color: #2d4f7c !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .shadow-dark-2 { box-shadow: none !important; }
          nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}