import { create } from "zustand";

type AlertStoreType = {
  type: string;
  message: string;
  showAlert: (params: { type?: string; message: string }) => void;
  hideAlert: () => void;
};

export const useAlertStore = create<AlertStoreType>()((set) => ({
  type: "",
  message: "",
  showAlert: ({ type = "info", message }) => set({ type, message }),
  hideAlert: () => set({ message: "", type: "" }),
}));
