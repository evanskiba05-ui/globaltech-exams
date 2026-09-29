import { axiosInstance } from "@/lib/axios";

/** Health check endpoint */
export const healthCheck = async () => {
  const response = await axiosInstance.get("/api/health");
  return response.data;
};

export const getSubjects = async () => {
  const response = await axiosInstance.get("/api/subjects");
  return response.data.subjects;
};
