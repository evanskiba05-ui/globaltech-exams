import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as apiLogin } from "@/lib/api";

type AuthStore = {
  user: { full_name: string; exam_id: string } | null;
  loginAction: (data: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  isAuthenticated: boolean;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      loginAction: async (loginData) => {
        try {
          const res = await apiLogin(loginData);
          if (res.token) {
            localStorage.setItem("student_token", res.token);
            set({ user: res.student, isAuthenticated: true });
          }
        } catch (error) {
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("student_token");
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: () => {
        const token = localStorage.getItem("student_token");
        if (token && !get().isAuthenticated) {
          set({ isAuthenticated: true });
        } else if (!token && get().isAuthenticated) {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
