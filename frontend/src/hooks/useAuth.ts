import { useAuthStore } from "@/store/auth";
import { useShallow } from "zustand/react/shallow";

export const useAuth = () => {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      loginAction: state.loginAction,
      logout: state.logout,
      isAuthenticated: state.isAuthenticated,
    }))
  );
};
