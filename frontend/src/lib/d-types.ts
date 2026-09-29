import type z from "zod";
import type {
  LogInSchema,
  AdminLogInSchema,
  ResetPasswordSchema,
} from "./schema";

export type LogInData = z.infer<typeof LogInSchema>;
export type AdminLogInData = z.infer<typeof AdminLogInSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;

export interface Subject {
  id: string;
  dbId?: number;
  slug?: string;
  name: string;
  questions: number;
  time: number;
  icon: any;
  iconBg: string;
  iconColor: string;
  color: string;
  isCompulsory?: boolean;
  meta?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Student {
  id: string;
  fullName: string;
  username: string;
  email: string;
  exams: number;
  status: "Active" | "Inactive" | "Suspended";
}

export type StatusFilter = "All" | "Active" | "Inactive" | "Suspended";

// --- ADMIN: Student payloads ---
export interface CreateStudentPayload {
  full_name: string;
  exam_id: string;
  email: string;
  password: string;
}

export interface UpdateStudentPayload {
  full_name?: string;
  exam_id?: string;
  email?: string;
  password?: string;
}

export type StudentStatus = "Active" | "Inactive" | "Suspended";

export interface dashboardData {
  total_students: number;
  total_exams: number;
  completed_exams: number;
  total_questions: number;
  avg_score: number;
}

export interface activity {
  type: string;
  message: string;
  time: string;
  exam_id: string;
}