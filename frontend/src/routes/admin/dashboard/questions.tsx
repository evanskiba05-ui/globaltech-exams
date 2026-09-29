import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState, useEffect, useMemo } from "react";
import Button from "@/components/button";
import PageHeader from "@/components/dashboard/PageHeader";
import FilterTabs from "@/components/dashboard/FilterTabs";
import BulkUploadModal from "@/components/dashboard/BulkUploadModal";
import CreateQuestionModal from "@/components/dashboard/CreateQuestionModal";
import {
  bulkUploadQuestions,
  downloadQuestionsTemplate,
} from "@/lib/api";
import { getSubjects } from "@/lib/api/subjects";
import { getAllQuestions, deleteQuestion } from "@/lib/api/admin";
import { useAlertStore } from "@/store/alert";
import { FaPlus } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import QuestionCard from "@/components/dashboard/QuestionCard";

export const Route = createFileRoute("/admin/dashboard/questions")({
  component: RouteComponent,
});

export interface QuestionOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  questionText: string;
subject_name: string;
  examName: string;
  type: string;
  marks: number;
  options: QuestionOption[];
}

function RouteComponent() {
  const [activeSubject, setActiveSubject] = useState("All Subjects");
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>(["All Subjects"]);
  const [subjectList, setSubjectList] = useState<any[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("loading");
      // Fetch subjects
      const subjectsData = await getSubjects();
      setSubjectList(subjectsData);

      // Add 'All Subjects' at the beginning
      const subjectsWithAll = [
        "All Subjects",
        ...subjectsData.map((s: any) => s.name),
      ];
      setSubjects(subjectsWithAll);

     

      // Fetch all questions
      const questionsData = await getAllQuestions();
   
      setQuestions(questionsData);


      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load data");
      setLoading(false);
    }
  };

  const refreshQuestions = async () => {
    try {
      const questionsData = await getAllQuestions();
      setQuestions(questionsData);
    } catch (_) {}
  };

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    setIsCreateModalOpen(true);
  };

  const handleCreateEditSuccess = () => {
    const isEdit = !!editingQuestion;
    refreshQuestions();
    useAlertStore.getState().showAlert({
      type: "success",
      message: isEdit ? "Question updated successfully" : "Question created successfully",
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestion(id);
      await refreshQuestions();
      useAlertStore.getState().showAlert({
        type: "success",
        message: "Question deleted successfully",
      });
    } catch (err: any) {
      useAlertStore.getState().showAlert({
        type: "error",
        message: err.response?.data?.detail || "Failed to delete question",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadTemplate = async () => {
    try {
      const data = await downloadQuestionsTemplate();
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "questions_template.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      useAlertStore.getState().showAlert({
        type: "error",
        message: "Failed to download template",
      });
    }
  };

  const handleBulkUpload = async (file: File) => {
    try {
      setBulkLoading(true);
      setBulkError(null);
      const result = await bulkUploadQuestions(file);
      await refreshQuestions();
      useAlertStore.getState().showAlert({
        type: "success",
        message: `Created ${result.created} question(s)${result.skipped ? `, skipped ${result.skipped}` : ""} successfully!`,
      });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.detail || "Failed to upload questions";
      setBulkError(message);
      useAlertStore.getState().showAlert({ type: "error", message });
      return false;
    } finally {
      setBulkLoading(false);
    }
  };

  const filteredQuestions = useMemo(() => {
    if (activeSubject === "All Subjects") return questions;
    return questions.filter((q) => q.subject_name === activeSubject);
  }, [activeSubject, questions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-primary-450"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] font-sans flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchData();
            }}
            className="mt-4 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans">
      <div className="">
        <PageHeader
          title="Question Management"
          subtitle={questions.length}
          subtitleSuffix="questions in the question bank"
          layout="column"
          actions={
            <>
              <Button
                size="medium"
                onClick={() => setIsBulkModalOpen(true)}
                className="bg-primary-200/40 flex items-center justify-center"
              >
                <div className="bg-primary-200 p-1 rounded-lg h-12 w-12 flex items-center justify-center">
                  <img src="/icons/save.png" alt="import" className="size-5" />
                </div>
                <span className="text-[22px] font-medium">Bulk Upload</span>
              </Button>

              <Button
                variant="primary"
                size="medium"
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary-200/40 flex items-center"
              >
                <div className="p-1 rounded-lg h-12 w-12 flex items-center justify-center">
                  <FaPlus />
                </div>
                <span className="text-[22px] font-medium">Add Question</span>
              </Button>
            </>
          }
        />

        {/* Subject Filter Tabs */}
        <FilterTabs
          tabs={subjects}
          activeTab={activeSubject}
          onChange={setActiveSubject}
          className="mb-6"
        />

        {/* Question Cards */}
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Upload Questions"
        requiredColumns={[
          "question_text",
          "subject",
          "option_a",
          "option_b",
          "option_c",
          "option_d",
          "correct_answer",
        ]}
        onImport={handleBulkUpload}
        onDownloadTemplate={handleDownloadTemplate}
        loading={bulkLoading}
        error={bulkError}
      />

      <CreateQuestionModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingQuestion(null);
        }}
        onSuccess={handleCreateEditSuccess}
        editData={editingQuestion}
        subjects={subjectList}
      />
    </div>
  );
}

// import React from 'react';
// import { motion } from 'framer-motion';
// import { GiCheckMark } from "react-icons/gi";

// interface QuestionCardProps {
//   question: Question;
//   index: number;
// }

// const QuestionCard: React.FC<QuestionCardProps> = ({ question, index }) => {
//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.98 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.3, delay: index * 0.1 }}
//       className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow"
//     >
//       {/* Tags & Actions Row */}
//       <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
//         <div className="flex flex-wrap gap-2 text-[13px]">
//           <span className="inline-flex items-center px-3 py-2 rounded-3xl  font-medium bg-primary-100 text-primary-500 border border-blue-100">
//             {question.type}
//           </span>
//           <span className="inline-flex items-center px-3 py-2 rounded-full  font-medium bg-accent-200 text-accent-700 border border-amber-100">
//             {question.subject}
//           </span>
//           <span className="inline-flex items-center px-3 py-2 rounded-full  font-medium bg-neutral-200 text-neutral-600 border border-gray-200">
//             {question.examName}
//           </span>
//           <span className="inline-flex items-center px-3 py-2 rounded-full  font-medium bg-success-500/10 text-success-500 border border-green-100">
//             {question.marks} marks
//           </span>
//         </div>

//         <div className="flex gap-2">
//           <Button
//             className="px-4 py-1.5 rounded-lg border-2 border-primary-500 text-primary-500 text-[18px] font-medium bg-primary-100 "
//           >
//             Edit
//           </Button>
//           <Button
//             className="px-6 py-1.5 rounded-lg  border-2 border-red-500 text-red-500 text-[18px] font-medium hover:bg-red-50 transition-colors"
//           >
//             Delete
//           </Button>
//         </div>
//       </div>

//       {/* Question Text */}
//       <h3 className="text-[28px] font-medium text-neutral-500 font-dm-sans mb-4 leading-[1.4]">
//         {question.questionText}
//       </h3>

//       {/* Options */}
//       <div className="flex flex-wrap gap-2">
//         {question.options.map((option: QuestionOption) => (
//           <div
//             key={option.label}
//             className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[12px] border text-[16px] font-dm-sans transition-colors ${
//               option.isCorrect
//                 ? 'bg-green-50 border-green-500 text-green-700'
//                 : 'bg-neutral-200 border-neutral-400 text-neutral-500 '
//             }`}
//           >
//             {option.isCorrect && <GiCheckMark  size={14} className="text-green-600" strokeWidth={2.5} />}
//             <span className="font-bold text-[16px]">{option.label}.</span>
//             <span className='font-regular'>{option.text}</span>
//           </div>
//         ))}
//       </div>
//     </motion.div>

//   );
// };

// export default React.memo(CreateQuestionModal);

// export default React.memo(BulkUploadModal);
