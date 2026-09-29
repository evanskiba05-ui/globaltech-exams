import * as z from "zod";

export const LogInSchema = z.object({
  examId: z.string().min(1, "EXAM ID or USERNAME is required"),
  password: z.string().min(6, "PASSWORD must be at least 6 characters."),
});

export const AdminLogInSchema = z.object({
  emailOrUsername: z.string().min(1, "ADMIN USERNAME OR EMAIL is required"),
  password: z.string().min(6, "PASSWORD must be at least 6 characters."),
  rememberMe: z.boolean().optional(),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "ADMIN EMAIL ADDRESS is required"),
});

export const CreateStudentSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  exam: z.string().min(1, "Please select an exam"),
});

export const CreateQuestionSchema = z.object({
  answerType: z.string().min(1, "Answer type is required"),
  subject: z.string().min(1, "Subject is required"),
  assignToExam: z.string().min(1, "Exam assignment is required"),
  questionText: z.string().min(1, "Question text is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().optional(),
  optionD: z.string().optional(),
  // correctOption: z.string().nullable().refine((val) => val !== null, { message: "Please select the correct answer" }),
  correctOption: z.string().min(1, "Please select the correct answer"),
  // answerMark: z.coerce.number().min(1, "Answer mark must be at least 1"),
  answerMark: z.number().min(1, "Answer mark must be at least 1"),
  topic: z.string().optional(),
});

export const CreateSubjectSchema = z.object({
  subjectName: z.string().min(2, "Subject name must be at least 2 characters"),
});

export const CreateExamSchema = z.object({
  examName: z.string().min(1, "Exam name is required"),
  subject: z.string().min(1, "Subject is required"),
  duration: z.number().min(1, "Duration is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  description: z.string().optional(),
  assignTo: z.string().min(1, "Assignment type is required"),
});
