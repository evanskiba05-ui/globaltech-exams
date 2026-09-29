import { axiosInstance } from "@/lib/axios";

export const startExam = async (subjectIds: number[]) => {
  console.log("startExam", subjectIds);
  const response = await axiosInstance.post("/api/exam/start", {
    subject_ids: subjectIds,
  });
  return response.data;
};

export const getQuestions = async (subjectId?: number) => {
  const response = await axiosInstance.get("/api/exam/questions", {
    params: { subject_id: subjectId },
  });
  return response.data.questions;
};

export const saveAnswer = async (
  questionId: number,
  optionId: number | null,
) => {
  const response = await axiosInstance.post("/api/exam/answer", {
    question_id: questionId,
    option_id: optionId,
  });
  return response.data;
};

export const submitExam = async () => {
  const response = await axiosInstance.post("/api/exam/submit");
  return response.data;
};

export const getTimeRemaining = async () => {
  const response = await axiosInstance.get("/api/exam/time");
  return response.data;
};

export const getExamResult = async () => {
  const response = await axiosInstance.get("/api/exam/result");
  return response.data;
};

export const downloadResultPDF = async () => {
  const response = await axiosInstance.get("/api/exam/result/pdf", {
    responseType: "blob",
  });
  return response.data;
};
