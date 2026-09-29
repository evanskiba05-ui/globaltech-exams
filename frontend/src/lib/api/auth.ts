import { axiosInstance } from "@/lib/axios";
import type { LogInData, AdminLogInData } from "@/lib/d-types";

export const login = async (loginData: LogInData) => {
  const response = await axiosInstance.post("/api/auth/login", {
    exam_id: loginData.examId,
    password: loginData.password,
  });
  return response.data;
};

export const adminLogin = async (loginData: AdminLogInData) => {
  console.log("Attempting admin login with data:", loginData);
  const response = await axiosInstance.post("/api/auth/admin/login", {
    username: loginData.emailOrUsername,
    password: loginData.password,
    remember_me: loginData.rememberMe,
  });
  return response.data;
};

export const forgotAdminPassword = async (email: string) => {
  const response = await axiosInstance.post("/api/auth/admin/forgot-password", {
    email,
  });
  return response.data;
};


export const resetAdminPassword = async (body: {
  token: string;
  new_password: string;
}) => {
  const response = await axiosInstance.post(
    "/api/auth/admin/reset-password",
    body,
  );
  return response.data;
};
