import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? 
  (import.meta.env.MODE === "development" ? "http://localhost:8000" : "");

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const url = config.url || "";

  const isAdminRequest = url.startsWith("/api/admin");
  const isStudentRequest =
    url.startsWith("/api/exam") || url.startsWith("/api/student");

  let token: string | null = null;

  if (isAdminRequest) {
    token = localStorage.getItem("admin_token");
  } else if (isStudentRequest) {
    token = localStorage.getItem("student_token");
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("student_token");
    } else if (error.response?.status === 403) {
      console.error("Insufficient permissions:", error.response.data.detail);
    }
    return Promise.reject(error);
  },
);
