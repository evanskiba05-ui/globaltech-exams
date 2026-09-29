import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { FaChevronDown } from "react-icons/fa";
import { MdSignalCellularAlt } from "react-icons/md";
import { FcDownload } from "react-icons/fc";
import { LuClipboardPenLine } from "react-icons/lu";
import { TbGraphFilled } from "react-icons/tb";
import { GiCheckMark, GiTrophyCup } from "react-icons/gi";
import { AiOutlineClose } from "react-icons/ai";
import PageHeader from "@/components/dashboard/PageHeader";
import Button from "@/components/button";
import StatCard from "@/components/dashboard/StatCard";
import CustomInput from "@/components/input";
import DataTable from "@/components/dashboard/DataTable";
import type { Column } from "@/components/dashboard/DataTable";
import { getUserInitials } from "@/lib/helper";
import { getResults, exportResultsExcel, exportResultsPDF } from "@/lib/api/admin";
import { getSubjects } from "@/lib/api/subjects";
import type { Subject } from "@/lib/d-types";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

export const Route = createFileRoute("/admin/dashboard/results")({
  component: RouteComponent,
});

const gradeColorMap: Record<string, string> = {
  A: "bg-success-500",
  B: "bg-secondary-400",
  C: "bg-accent-500",
  D: "bg-error-500",
  F: "bg-error-500",
};

const gradeClassMap: Record<string, string> = {
  A: "bg-success-500/10 text-success-500 border-success-500/30",
  B: "bg-secondary-400/10 text-secondary-400 border-secondary-400/30",
  C: "bg-accent-500/10 text-accent-500 border-accent-500/30",
  D: "bg-error-500/10 text-error-500 border-error-500/30",
  F: "bg-error-500/10 text-error-500 border-error-500/30",
};

function RouteComponent() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  const fetchResults = useCallback(async (search?: string, subjectSlug?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (subjectSlug) params.subject_slug = subjectSlug;
      const data = await getResults(Object.keys(params).length ? params : undefined);
      setResults(data.results);
      setStats(data.stats);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch results");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
    getSubjects().then(setSubjects).catch(() => {});
  }, [fetchResults]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(searchQuery || undefined, selectedSubject);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedSubject, fetchResults]);

  const handleExportExcel = async () => {
    try {
      const blob = await exportResultsExcel(searchQuery ? { search: searchQuery } : undefined);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", "results.xlsx");
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: unknown) {
      console.error("Export failed", err);
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await exportResultsPDF(searchQuery ? { search: searchQuery } : undefined);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", "results.pdf");
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: unknown) {
      console.error("Export failed", err);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: Column<any>[] = [
    {
      key: "student",
      header: "STUDENT",
      width: "2%",
      render: (row) => (
        <div className="flex items-center text-[20px] gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary-400 text-white flex items-center justify-center text-xs font-semibold overflow-hidden shrink-0">
            {getUserInitials(row.full_name)}
          </div>
          <span className="font-semibold text-neutral-700">{row.full_name}</span>
        </div>
      ),
    },
    {
      key: "exam",
      header: "EXAM",
      width: "1%",
      render: () => <span className="font-medium text-neutral-700 whitespace-nowrap">Jamb Practice</span>,
    },
    {
      key: "score",
      header: "SCORE",
      width: "1%",
      render: (row) => {
        const color = gradeColorMap[row.grade] || "bg-error-500";
        return (
          <div className="flex flex-col gap-1">
            <span className={`font-semibold whitespace-nowrap ${color.replace("bg-", "text-")}`}>
              {row.percentage}%
            </span>
            <div className="w-24 h-1.5 bg-neutral-300 rounded-full overflow-hidden">
              <div
                className={`h-full ${color}`}
                style={{ width: `${row.percentage}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "grade",
      header: "GRADE",
      width: "1%",
      render: (row) => (
        <span
          className={`w-[51px] h-[41px] rounded-[16px] font-medium whitespace-nowrap border flex items-center justify-center ${gradeClassMap[row.grade] || gradeClassMap["F"]}`}
        >
          {row.grade}
        </span>
      ),
    },
    {
      key: "date",
      header: "DATE",
      width: "1%",
      render: (row) => (
        <span className="font-medium text-neutral-700 whitespace-nowrap">
          {dayjs(row.submitted_at).format("YYYY-M-D")}
        </span>
      ),
    },
    {
      key: "time",
      header: "TIMETAKEN",
      width: "1%",
      render: (row) => {
        const formatTime = (t: unknown) => {
          if (!t) return "";
          if (typeof t === "string") {
            const parts = t.split(":");
            if (parts.length === 3) return `${+parts[0]}:${parts[1].padStart(2, "0")}:${parts[2].padStart(2, "0")}`;
            return t;
          }
          if (typeof t === "number") {
            const h = Math.floor(t / 3600);
            const m = Math.floor((t % 3600) / 60);
            const s = Math.floor(t % 60);
            return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
          }
          return String(t);
        };
        return (
          <span className="font-medium text-neutral-700 whitespace-nowrap">
            {formatTime(row.time_taken)}
          </span>
        );
      },
    },
  ];

  const avgScore = stats?.avg_score ?? 0;
  const passed = stats?.passed ?? 0;
  const failed = stats?.failed ?? 0;
  const gradeA = stats?.grade_a ?? 0;
  const total = stats?.total ?? 0;

  return (
    <div className="min-h-screen font-dm-sans">
      <PageHeader
        title="Results & Analytics"
        subtitle="View, filter, and export student examination results"
        subtitleSuffix=""
        layout="column"
      />

      <div className="flex gap-4 mb-8">
        <Button
          size="medium"
          className="bg-neutral-200 border border-neutral-300 flex items-center"
          onClick={handleExportExcel}
        >
          <div className="p-1 rounded-lg h-12 w-12 flex items-center justify-center">
            <MdSignalCellularAlt className="size-5" />
          </div>
          <span className="text-[22px] font-medium">Export Excel</span>
        </Button>
        <Button
          variant="primary"
          size="medium"
          className="flex items-center"
          onClick={handleExportPDF}
        >
          <div className="p-1 rounded-lg h-12 w-12 flex items-center justify-center">
            <FcDownload className="size-5 brightness-0 invert" />
          </div>
          <span className="text-[22px] font-medium">Download PDF</span>
        </Button>
        <Button
          size="medium"
          className="bg-primary-200/40 flex items-center text-primary-450"
        >
          <span className="text-[22px] font-medium">Filter Result</span>
          <div className="p-1 rounded-lg h-12 w-12 flex items-center justify-center">
            <FaChevronDown className="size-5" />
          </div>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={LuClipboardPenLine}
          iconBg="#e8edf5"
          iconColor="#3a6499"
          number={total}
          label="TOTAL RESULTS"
          subtext="Student records"
          delay={0.1}
          className="[&_h3]:!font-dm-sans"
        />
        <StatCard
          icon={TbGraphFilled}
          iconBg="#dcfce7"
          iconColor="#16a34a"
          number={`${avgScore}%`}
          label="AVERAGE SCORE"
          subtext="Across all results"
          growth=""
          delay={0.18}
          className="[&_h3]:!font-dm-sans"
        />
        <StatCard
          icon={GiCheckMark}
          iconBg="#dcfce7"
          iconColor="#16a34a"
          number={passed}
          label="PASSED (≥45%)"
          subtext="Scored 45% or above"
          delay={0.26}
          className="[&_h3]:!font-dm-sans"
        />
        <div className="md:col-span-2 lg:col-span-3 grid grid-cols-2 gap-6">
          <StatCard
            icon={AiOutlineClose}
            iconBg="#fee2e2"
            iconColor="#dc2626"
            number={failed}
            label="FAILED (<45%)"
            subtext="Scored below 45%"
            delay={0.34}
            className="[&_h3]:!font-dm-sans"
          />
          <StatCard
            icon={GiTrophyCup}
            iconBg="#fffbeb"
            iconColor="#f59e0b"
            number={gradeA}
            label="GRADE A"
            subtext="Excellent performance"
            delay={0.42}
            className="[&_h3]:!font-dm-sans"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-[70%]">
            <CustomInput
              placeholder="Search Student or Exam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefixIcon={<img src="/icons/search.png" alt="" className="size-[18px]" />}
            />
          </div>
          <div className="relative w-full sm:w-auto sm:flex-1">
            <Button
              size="medium"
              className="bg-white flex items-center justify-between gap-2 border border-neutral-300 w-full h-14 px-4"
              onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
            >
              <span className="text-[22px] font-medium">
                {selectedSubject
                  ? subjects.find((s) => s.slug === selectedSubject)?.name || selectedSubject
                  : "All Exams"}
              </span>
              <FaChevronDown className="size-5 shrink-0" />
            </Button>
            {showSubjectDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSubjectDropdown(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-300 rounded-xl shadow-lg z-20 overflow-hidden">
                  <button
                    className={`w-full text-left px-4 py-3 text-[18px] hover:bg-neutral-100 transition-colors ${!selectedSubject ? "bg-primary-200/40 font-semibold" : "font-medium text-neutral-700"}`}
                    onClick={() => {
                      setSelectedSubject(null);
                      setShowSubjectDropdown(false);
                    }}
                  >
                    All Exams
                  </button>
                  {subjects.map((subject) => (
                    <button
                      key={subject.slug}
                      className={`w-full text-left px-4 py-3 text-[18px] hover:bg-neutral-100 transition-colors ${selectedSubject === subject.slug ? "bg-primary-200/40 font-semibold" : "font-medium text-neutral-700"}`}
                      onClick={() => {
                        setSelectedSubject(subject.slug ?? null);
                        setShowSubjectDropdown(false);
                      }}
                    >
                      {subject.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={results}
          rowKey={(_, i) => String(i)}
          loading={loading}
          error={error}
          onRetry={() => fetchResults()}
        />
      </div>
    </div>
  );
}

export default RouteComponent;
