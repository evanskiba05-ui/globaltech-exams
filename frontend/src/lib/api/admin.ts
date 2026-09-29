import { axiosInstance } from "@/lib/axios";
import type { CreateStudentPayload, UpdateStudentPayload } from "@/lib/d-types";

export const getStudents = async () => {
  const response = await axiosInstance.get("/api/admin/students");
  return response.data.students;
};

export const createStudent = async (payload: CreateStudentPayload) => {
  const response = await axiosInstance.post("/api/admin/students", payload);
  return response.data;
};

export const updateStudent = async (
  id: string,
  payload: UpdateStudentPayload,
) => {
  const response = await axiosInstance.put(
    `/api/admin/students/${id}`,
    payload,
  );
  return response.data;
};

export const deleteStudent = async (id: string) => {
  const response = await axiosInstance.delete(`/api/admin/students/${id}`);
  return response.data;
};

export const updateStudentStatus = async (id: string, status: string) => {
  const response = await axiosInstance.patch(
    `/api/admin/students/${id}/status`,
    {
      status,
    },
  );
  return response.data;
};

export const importStudentsCSV = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post(
    "/api/admin/students/import",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

export const downloadStudentTemplate = async () => {
  const response = await axiosInstance.get("/api/admin/students/template", {
    responseType: "blob",
  });
  return response.data;
};

export const bulkUploadQuestions = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post(
    "/api/admin/questions/bulk-upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

export const downloadQuestionsTemplate = async () => {
  const response = await axiosInstance.get("/api/admin/questions/template", {
    responseType: "blob",
  });
  return response.data;
};

// --- ADMIN: QUESTIONS ---

/** Add a single question */
export const addQuestion = async (payload: {
  subject_slug: string;
  text: string;
  options: Record<string, string>;
  correct_letter: string;
}) => {
  const response = await axiosInstance.post("/api/admin/questions", payload);
  return response.data;
};

/** Edit a question by ID */
export const editQuestion = async (
  questionId: number,
  payload: {
    subject_slug: string;
    text: string;
    options: Record<string, string>;
    correct_letter: string;
  },
) => {
  const response = await axiosInstance.put(
    `/api/admin/questions/${questionId}`,
    payload,
  );
  return response.data;
};

/** Delete a question by ID */
export const deleteQuestion = async (questionId: number) => {
  const response = await axiosInstance.delete(
    `/api/admin/questions/${questionId}`,
  );
  return response.data;
};

/** Get all questions (optionally filtered by subject) */
export const getAllQuestions = async (subjectSlug?: string) => {
  const response = await axiosInstance.get("/api/admin/questions", {
    params: { subject_slug: subjectSlug },
  });

  console.log("Response", response.data.questions);
  return response.data.questions;
};

// --- ADMIN: SUBJECTS ---

/** Create a new subject */
export const createSubject = async (payload: {
  name: string;
  slug: string;
  icon?: string;
  total_questions?: number;
  duration_mins?: number;
  is_compulsory?: boolean;
}) => {
  const response = await axiosInstance.post("/api/admin/subjects", payload);
  return response.data;
};

/** Toggle subject active/inactive status */
export const toggleSubjectStatus = async (
  subjectId: number,
  isActive: boolean,
) => {
  const response = await axiosInstance.patch(
    `/api/admin/subjects/${subjectId}`,
    { is_active: isActive },
  );
  return response.data;
};

/** Get all subjects (active + inactive) for admin */
export const getAllSubjects = async () => {
  const response = await axiosInstance.get("/api/admin/subjects");
  return response.data.subjects;
};

/** Delete a subject */
export const deleteSubject = async (subjectId: number) => {
  const response = await axiosInstance.delete(`/api/admin/subjects/${subjectId}`);
  return response.data;
};

// --- ADMIN: RESULTS & ANALYTICS ---

/** Get all exam results with filters */
export const getResults = async (payload?: {
  date_from?: string;
  date_to?: string;
  search?: string;
  subject_slug?: string;
}) => {
  const response = await axiosInstance.get("/api/admin/results", {
    params: payload,
  });
  return response.data;
};

/** Export results as Excel */
export const exportResultsExcel = async (payload?: {
  date_from?: string;
  date_to?: string;
  search?: string;
  subject_slug?: string;
}) => {
  const response = await axiosInstance.get("/api/admin/results/export/excel", {
    params: payload,
    responseType: "blob",
  });
  return response.data;
};

/** Export results as PDF */
export const exportResultsPDF = async (payload?: {
  date_from?: string;
  date_to?: string;
  search?: string;
  subject_slug?: string;
}) => {
  const response = await axiosInstance.get("/api/admin/results/export/pdf", {
    params: payload,
    responseType: "blob",
  });
  return response.data;
};

// --- ADMIN: DASHBOARD ---

/** Get dashboard statistics */
export const getDashboard = async () => {
  const response = await axiosInstance.get("/api/admin/dashboard");
  return response.data;
};


/** Get recent activity feed */
export const getRecentActivity = async () => {
  const response = await axiosInstance.get("/api/admin/recent-activity");
  return response.data.activities;
};

// --- ADMIN: ADMINS MANAGEMENT ---

/** List all admins with optional filters */
export const listAdmins = async (payload?: {
  search?: string;
  role?: string;
}) => {
  const response = await axiosInstance.get("/api/admin/admins", {
    params: payload,
  });
  return response.data;
};

/** Create a new admin account */
export const createAdmin = async (payload: {
  username: string;
  password: string;
  full_name: string;
  email?: string;
  role?: string;
}) => {
  const response = await axiosInstance.post("/api/admin/admins", payload);
  return response.data;
};

/** Edit an admin's details */
export const editAdmin = async (
  adminId: number,
  payload: { full_name?: string; role?: string },
) => {
  const response = await axiosInstance.put(
    `/api/admin/admins/${adminId}`,
    payload,
  );
  return response.data;
};

/** Delete an admin */
export const deleteAdmin = async (adminId: number) => {
  const response = await axiosInstance.delete(`/api/admin/admins/${adminId}`);
  return response.data;
};

/** Toggle admin active/inactive status */
export const toggleAdminStatus = async (adminId: number, status: string) => {
  const response = await axiosInstance.patch(
    `/api/admin/admins/${adminId}/status`,
    { status },
  );
  return response.data;
};

/** Reset an admin's password (super admin only) */
export const resetAdminPasswordAsAdmin = async (
  adminId: number,
  newPassword: string,
) => {
  const response = await axiosInstance.post(
    `/api/admin/admins/${adminId}/reset-password`,
    { new_password: newPassword },
  );
  return response.data;
};

// --- ADMIN: SESSIONS ---

/** Get admin sessions and online status */
export const getAdminSessions = async () => {
  const response = await axiosInstance.get("/api/admin/sessions");
  return response.data;
};
