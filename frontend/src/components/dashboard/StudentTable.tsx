import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import type { StatusFilter } from "@/lib/d-types";
import DataTable from './DataTable';
import type { Column } from './DataTable';
import Button from "@/components/button";
import CustomInput from "@/components/input";
import { useStudentStore } from "@/store/student";
import FilterTabs from './FilterTabs';
import CreateStudentModal from './CreateStudentModal';
import type { Student } from "@/lib/d-types";

const StudentTable: React.FC<object> = () => {
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { 
    students, 
    searchQuery, 
    setSearchQuery, 
    activeFilter, 
    setActiveFilter,
    removeStudent,
    updateStatus
  } = useStudentStore();

  const filters: StatusFilter[] = ['All', 'Active', 'Inactive', 'Suspended'];

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'All' || student.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [students, searchQuery, activeFilter]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'badge-success bg-success/25 text-success border-success';
      case 'Inactive':
        return 'bg-accent-500/25 text-accent-500 border-accent-500';
      case 'Suspended':
        return 'badge-error bg-error/25 text-error border-error';
      default:
        return 'badge-ghost bg-neutral-300 border-neutral-500 text-neutral-500';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const columns: Column<Student>[] = [
    {
      key: 'student',
      header: 'Student',
      width:"2%",
      render: (student) => (
        <div className="flex items-center text-[20px] gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary-400 flex items-center justify-center text-white text-xs font-semibold">
            {getInitials(student.fullName)}
          </div>
          <span className="font-semibold text-neutral-700">{student.fullName}</span>
        </div>
      ),
    },
    {
      key: 'username',
      header: 'Username',
      width: '1%',
      render: (student) => (
        <span className="font-medium text-neutral-700">{student.username}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      width: '1%',
      render: (student) => (
        <span className="font-medium text-neutral-700">{student.email}</span>
      ),
    },
    {
      key: 'exams',
      header: 'Exams',
      width: '1%',
      render: (student) => (
        <span className="font-semibold text-neutral-700">{student.exams}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '1%',
      render: (student) => (
        <Button
          className={`px-4 border py-2 rounded-full! font-semibold transition-colors ${getStatusBadgeClass(student.status)}`}
          onClick={async () => {
            const nextStatus = student.status === 'Active' ? 'inactive' : 'active';
            await updateStatus(student.id, nextStatus);
          }}
        >
          {student.status}
        </Button>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '1%',
      render: (student) => (
        <div className="flex items-center gap-2">
          <Button
            className="bg-primary-200/40 tab px-4 border py-2 font-semibold rounded-md transition-colors text-secondary-400 border-secondary-400"
            onClick={() => setEditingStudent(student)}
          >
            Edit
          </Button>
          <Button
            className="bg-error-500/10 border border-error-500/20 text-error-500 px-4 py-2 font-semibold rounded-md hover:bg-error-500/20 transition-colors"
            onClick={async () => {
              if (confirm(`Are you sure you want to delete ${student.fullName}?`)) {
                await removeStudent(student.id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <motion.div
        className="flex flex-wrap items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <CustomInput
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefixIcon={<img src="/icons/search.png" alt="" className="size-[18px]" />}
          />
        </div>

        <div>
          <FilterTabs 
            tabs={filters} 
            activeTab={activeFilter} 
            onChange={(tab) => setActiveFilter(tab)} 
          />
        </div>

        <div className="ml-auto text-[18px] font-medium text-neutral-500">
          {filteredStudents.length} Results
        </div>
      </motion.div>

      <DataTable
        columns={columns}
        data={filteredStudents}
        rowKey="id"
      />

      <CreateStudentModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        studentData={editingStudent}
      />
    </div>
  );
};

export default StudentTable;
