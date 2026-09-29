import { create } from "zustand";
import { useAlertStore } from "./alert";
import { 
  getStudents as fetchStudents, 
  createStudent as apiCreateStudent,
  updateStudent as apiUpdateStudent,
  deleteStudent as apiDeleteStudent,
  updateStudentStatus as apiUpdateStatus,
  importStudentsCSV as apiImportCSV
} from "@/lib/api";
import type { Student, CreateStudentPayload, UpdateStudentPayload } from "@/lib/d-types";

type StudentStore = {
  students: Student[];
  loading: boolean;
  error: string | null;
  
  // Search & Filter state
  searchQuery: string;
  activeFilter: string;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: string) => void;

  // Actions
  getStudents: () => Promise<void>;
  addStudent: (payload: CreateStudentPayload) => Promise<boolean>;
  updateStudent: (id: string, payload: UpdateStudentPayload) => Promise<boolean>;
  removeStudent: (id: string) => Promise<boolean>;
  updateStatus: (id: string, status: string) => Promise<boolean>;
  importCSV: (file: File) => Promise<{ created: number } | null>;
};

export const useStudentStore = create<StudentStore>((set, get) => ({
  students: [],
  loading: false,
  error: null,
  searchQuery: "",
  activeFilter: "All",

  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),

  getStudents: async () => {
    try {
      set({ loading: true, error: null });
      const data = await fetchStudents();
      
      // Map backend fields to frontend interface
      const mappedData: Student[] = data.map((s: any) => ({
        id: String(s.id),
        fullName: s.full_name,
        username: s.exam_id,
        email: s.email,
        exams: s.exam_count || 0,
        status: (s.status.charAt(0).toUpperCase() + s.status.slice(1)) as Student["status"],
      }));
      
      set({ students: mappedData });
    } catch (err: any) {
      const message = err.response?.data?.detail || "Failed to fetch students";
      set({ error: message });
      useAlertStore.getState().showAlert({ type: "error", message });
    } finally {
      set({ loading: false });
    }
  },

  addStudent: async (payload) => {
    try {
      set({ loading: true });
      await apiCreateStudent(payload);
      await get().getStudents();
      useAlertStore.getState().showAlert({ 
        type: "success", 
        message: `Student account for ${payload.full_name} created successfully!` 
      });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.detail || "Failed to create student";
      useAlertStore.getState().showAlert({ type: "error", message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateStudent: async (id, payload) => {
    try {
      set({ loading: true });
      await apiUpdateStudent(id, payload);
      await get().getStudents();
      useAlertStore.getState().showAlert({ 
        type: "success", 
        message: "Student updated successfully!" 
      });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.detail || "Failed to update student";
      useAlertStore.getState().showAlert({ type: "error", message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  removeStudent: async (id) => {
    try {
      await apiDeleteStudent(id);
      set((state) => ({
        students: state.students.filter((s) => s.id !== id),
      }));
      useAlertStore.getState().showAlert({ type: "success", message: "Student deleted successfully" });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.detail || "Failed to delete student";
      useAlertStore.getState().showAlert({ type: "error", message });
      return false;
    }
  },

  updateStatus: async (id, status) => {
    try {
      await apiUpdateStatus(id, status);
      const formattedStatus = (status.charAt(0).toUpperCase() + status.slice(1)) as Student["status"];
      
      set((state) => ({
        students: state.students.map((s) => 
          s.id === id ? { ...s, status: formattedStatus } : s
        ),
      }));
      
      useAlertStore.getState().showAlert({ 
        type: "success", 
        message: `Status updated to ${formattedStatus}` 
      });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.detail || "Failed to update status";
      useAlertStore.getState().showAlert({ type: "error", message });
      return false;
    }
  },

  importCSV: async (file) => {
    try {
      set({ loading: true });
      const result = await apiImportCSV(file);
      await get().getStudents();
      useAlertStore.getState().showAlert({ 
        type: "success", 
        message: `Successfully imported ${result.created} students!` 
      });
      return result;
    } catch (err: any) {
      const message = err.response?.data?.detail || "Failed to import file";
      useAlertStore.getState().showAlert({ type: "error", message });
      return null;
    } finally {
      set({ loading: false });
    }
  }
}));
