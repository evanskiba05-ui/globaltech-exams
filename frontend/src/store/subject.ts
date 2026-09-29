import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Subject } from "@/lib/d-types";

type SubjectStore = {
  selectedSubjectIds: string[];
  availableSubjects: Subject[];
  selectedSubjects: Subject[];
  selectSubject: (subjectsIds: string[]) => void;
  setAvailableSubjects: (subjects: Subject[]) => void;
  setSelectedSubjects: (subjects: Subject[]) => void;
};

export const useSubjectStore = create<SubjectStore>()(
  persist(
    (set) => ({
      selectedSubjectIds: [],
      availableSubjects: [],
      selectedSubjects: [],

      setAvailableSubjects: (subjects: Subject[]) => set({ availableSubjects: subjects }),

      setSelectedSubjects: (subjects: Subject[]) => set({ selectedSubjects: subjects }),

      selectSubject: (subjectsIds: string[]) =>
        set((state) => ({
          selectedSubjectIds: subjectsIds,
          selectedSubjects: state.availableSubjects.filter((s) =>
            subjectsIds.includes(s.id),
          ),
        })),
    }),
    {
      name: "subject-storage",
      partialize: (state) => ({
        selectedSubjectIds: state.selectedSubjectIds,
      }),
    }
  )
);