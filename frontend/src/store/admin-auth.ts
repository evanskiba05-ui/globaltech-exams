import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminLogin as apiAdminLogin } from "@/lib/api";
import type { AdminLogInData } from "@/lib/d-types";

type AdminAuthStore = {
  admin: { username: string; full_name: string; email: string; role: string } | null;
  adminLoginAction: (data: AdminLogInData) => Promise<void>;
  adminLogout: () => void;
  checkAuth: () => void;
  isAdminAuthenticated: boolean;
};

export const useAdminAuthStore = create<AdminAuthStore>()(
  persist(
    (set, get) => ({
      admin: null,
      isAdminAuthenticated: false,

      adminLoginAction: async (loginData) => {
        try {
          const res = await apiAdminLogin(loginData);
          if (res.token) {
            localStorage.setItem("admin_token", res.token);
            set({ admin: res.admin, isAdminAuthenticated: true });
          }
        } catch (error) {
          throw error;
        }
      },

      adminLogout: () => {
        localStorage.removeItem("admin_token");
        set({ admin: null, isAdminAuthenticated: false });
      },

      checkAuth: () => {
        const token = localStorage.getItem("admin_token");
        if (token && !get().isAdminAuthenticated) {
          set({ isAdminAuthenticated: true });
        } else if (!token && get().isAdminAuthenticated) {
          set({ admin: null, isAdminAuthenticated: false });
        }
      },
    }),
    {
      name: "admin-auth-storage",
    }
  )
);
