import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import Button from "@/components/button";
import StudentTable from "@/components/dashboard/StudentTable";
import BulkUploadModal from "@/components/dashboard/BulkUploadModal";
import CreateStudentModal from "@/components/dashboard/CreateStudentModal";
import { useStudentStore } from "@/store/student";
import PageHeader from "@/components/dashboard/PageHeader";

export const Route = createFileRoute("/admin/dashboard/students")({
  component: () => <StudentsPage />,
});

function StudentsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const { 
    students, 
    loading, 
    error, 
    getStudents,
    importCSV
  } = useStudentStore();

  const handleDownloadTemplate = async () => {
    try {
      const { downloadStudentTemplate } = await import('../../../lib/api');
      const data = await downloadStudentTemplate();
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download template");
    }
  };

  useEffect(() => {
    getStudents();
  }, [getStudents]);

  return (
    <div className="min-h-screen font-dm-sans">
      <div className="max-w-7xl ">
        <PageHeader 
          title="Student Management"
          subtitle={students.length}
          subtitleSuffix="Student registered on the platform"
          layout="column"
          actions={
            <>
              <Button
                size="medium"
                onClick={() => setIsImportModalOpen(true)}
                className="bg-primary-200/40 flex items-center justify-center"
              >
                <div className="bg-primary-200 p-1 rounded-lg h-12 w-12 flex items-center justify-center">
                  <img src="/icons/save.png" alt="import" className="size-5" />
                </div>
                <span className="text-[22px] font-medium">Import CSV</span>
              </Button>

              <Button
                variant="primary"
                size="medium"
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary-200/40 flex items-center justify-center"
              >
                <div className="bg-primary-200 p-1 rounded-lg h-12 w-12 flex items-center justify-center">
                  <img src="/icons/user.png" alt="add" className="size-5" />
                </div>
                <span className="text-[22px] font-medium">Add Student</span>
              </Button>
            </>
          }
        />

        {/* Table Section */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <span className="loading loading-spinner loading-lg text-primary-450"></span>
          </div>
        ) : error ? (
          <div className="bg-error/10 border border-error text-error p-4 rounded-xl text-center">
            {error}
            <Button variant="bordered" size="small" onClick={getStudents} className="ml-4">Retry</Button>
          </div>
        ) : (
          <StudentTable />
        )}
      </div>

      {/* Modals */}
      <CreateStudentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <BulkUploadModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Students Via CSV/EXCEL"
        requiredColumns={['full_name', 'username', 'email', 'password', 'exam_name']}
        onImport={async (file) => {
          const res = await importCSV(file);
          return !!res;
        }}
        onDownloadTemplate={handleDownloadTemplate}
        loading={loading}
        error={error}
      />
    </div>
  );
}