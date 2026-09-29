import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/button";
import PageHeader from "@/components/dashboard/PageHeader";
import CreateSubjectModal from "@/components/dashboard/CreateSubjectModal";
import SubjectCard from "@/components/dashboard/SubjectCard";
import { useSubjects } from "@/lib/queries/subjects";
import { createSubject, toggleSubjectStatus, deleteSubject } from "@/lib/api/admin";
import { FaPlus } from "react-icons/fa";
import type { Subject } from "@/lib/d-types";

export default function ExamManagement() {
  const queryClient = useQueryClient();
  const { data: subjects = [], isLoading, error } = useSubjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeCount = subjects.filter((s: Subject) => s.isActive ?? true).length;

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      toggleSubjectStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; slug: string }) => createSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });

  const handleToggleActive = useCallback((subject: Subject) => {
    toggleMutation.mutate({ id: Number(subject.id), isActive: !(subject.isActive ?? true) });
  }, [toggleMutation]);

  const handleDelete = useCallback((subject: Subject) => {
    deleteMutation.mutate(Number(subject.id));
  }, [deleteMutation]);

  const handleCreate = useCallback(
    (data: { subjectName: string; icon?: File }) => {
      const slug = data.subjectName.toLowerCase().replace(/\s+/g, "-");
      createMutation.mutate({ name: data.subjectName, slug });
      setIsModalOpen(false);
    },
    [createMutation]
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-dm-sans">
      <PageHeader
        title="Create Subject"
        subtitle={`${subjects.length} subjects configured — ${activeCount} currently active`}
        subtitleSuffix=""
        layout="row"
        actions={
          <Button
            variant="primary"
            size="medium"
            onClick={() => setIsModalOpen(true)}
            className="!bg-[#1565C0]! !text-white! flex items-center rounded-xl!"
          >
            <FaPlus className="text-sm" />
            <span className="text-base font-medium">Create Subject</span>
          </Button>
        }
      />

      {isLoading && (
        <main className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-[14px] p-6 shadow-sm animate-pulse h-32" />
          ))}
        </main>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load subjects. Please try again later.
        </div>
      )}

      {!isLoading && !error && (
        <main className="flex flex-col gap-4">
          {subjects.length > 0 ? (
            subjects.map((subject: Subject, i: number) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                index={i}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="text-center py-16 text-neutral-500 text-lg">
              No subjects yet. Create your first subject to get started.
            </div>
          )}
        </main>
      )}

      <CreateSubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}

export const Route = createFileRoute("/admin/dashboard/exams")({
  component: () => <ExamManagement />,
});
