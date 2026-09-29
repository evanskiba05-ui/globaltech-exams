import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Question } from "@/lib/questions";

type SubjectState = {
  answers: Record<string, string>;
  currentIndex: number;
  questions: Question[];
  optionIdsMap: Record<string, number[]>; // questionId -> optionIds array
};

type ExamStore = {
  selectedSubjectIds: string[];
  currentSubjectId: string;
  subjectState: Record<string, SubjectState>;
  timeLeft: number;
  examStarted: boolean;
  examSubmitted: boolean;

  setSelectedSubjectIds: (ids: string[]) => void;
  setCurrentSubject: (subjectId: string) => void;
  setSubjectQuestions: (subjectId: string, questions: Question[], optionIdsMap: Record<string, number[]>) => void;
  selectAnswer: (questionId: string, option: string, optionId: number | null) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  jumpToQuestion: (questionId: string) => void;
  startExam: () => void;
  submitExam: () => void;
  resetExam: () => void;
  tickTimer: () => void;
  getCurrentSubjectState: () => SubjectState | undefined;
  getCurrentResult: () => { total: number; totalAnswered: number; correct: number; wrong: number; remaining: number };
};

const initialSubjectState: Record<string, SubjectState> = {};

export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      selectedSubjectIds: [],
      currentSubjectId: "",
      subjectState: {},
      timeLeft: 7200,
      examStarted: false,
      examSubmitted: false,

      setSelectedSubjectIds: (ids: string[]) => set({ selectedSubjectIds: ids }),

      setCurrentSubject: (subjectId: string) => {
        set({
          currentSubjectId: subjectId,
        });
      },

      setSubjectQuestions: (subjectId: string, questions: Question[], optionIdsMap: Record<string, number[]>) =>
        set((state) => ({
          subjectState: {
            ...state.subjectState,
            [subjectId]: {
              answers: {},
              currentIndex: 0,
              questions,
              optionIdsMap,
            },
          },
        })),

      selectAnswer: (questionId: string, option: string) =>
        set((state) => {
          const current = state.subjectState[state.currentSubjectId] || {
            answers: {},
            currentIndex: 0,
            questions: [],
            optionIdsMap: {},
          };
          return {
            subjectState: {
              ...state.subjectState,
              [state.currentSubjectId]: {
                ...current,
                answers: { ...current.answers, [questionId]: option },
              },
            },
          };
        }),

      nextQuestion: () =>
        set((state) => {
          const { selectedSubjectIds, currentSubjectId } = state;
          const subjectState = state.subjectState[currentSubjectId] || {
            currentIndex: 0,
            answers: {},
            questions: [],
            optionIdsMap: {},
          };
          const currentIndex = subjectState.currentIndex;
          const questions = subjectState.questions;

          if (currentIndex < questions.length - 1) {
            return {
              subjectState: {
                ...state.subjectState,
                [currentSubjectId]: {
                  ...subjectState,
                  currentIndex: currentIndex + 1,
                },
              },
            };
          }

          const subjectIdx = selectedSubjectIds.indexOf(currentSubjectId);
          const nextSubjectId = selectedSubjectIds[subjectIdx + 1];
          return nextSubjectId ? { currentSubjectId: nextSubjectId } : state;
        }),

      prevQuestion: () =>
        set((state) => {
          const current = state.subjectState[state.currentSubjectId] || {
            answers: {},
            currentIndex: 0,
            questions: [],
            optionIdsMap: {},
          };
          return {
            subjectState: {
              ...state.subjectState,
              [state.currentSubjectId]: {
                ...current,
                currentIndex: Math.max(current.currentIndex - 1, 0),
              },
            },
          };
        }),

      jumpToQuestion: (questionId: string) =>
        set((state) => {
          const index = state.subjectState[state.currentSubjectId]?.questions.findIndex(
            (q) => q.id === questionId
          );
          if (index === -1) return state;
          const current = state.subjectState[state.currentSubjectId];
          return {
            subjectState: {
              ...state.subjectState,
              [state.currentSubjectId]: { ...current, currentIndex: index },
            },
          };
        }),

      startExam: () => set({ examStarted: true, examSubmitted: false, timeLeft: 7200 }),

      submitExam: () => set({ examSubmitted: true, examStarted: false }),

      resetExam: () =>
        set({
          subjectState: initialSubjectState,
          timeLeft: 7200,
          examStarted: false,
          examSubmitted: false,
          currentSubjectId: "",
          selectedSubjectIds: [],
        }),

      tickTimer: () =>
        set((state) => ({
          timeLeft: Math.max(state.timeLeft - 1, 0),
        })),

      getCurrentSubjectState: () => {
        const { currentSubjectId, subjectState } = get();
        return subjectState[currentSubjectId];
      },

      getCurrentResult: () => {
        const { currentSubjectId, subjectState } = get();
        const subState = subjectState[currentSubjectId];
        if (!subState) {
          return { total: 0, totalAnswered: 0, correct: 0, wrong: 0, remaining: 0 };
        }
        const answers = subState.answers || {};
        const questions = subState.questions || [];
        const correct = questions.filter((q) => answers[q.id] === q.answer).length;
        const totalAnswered = Object.keys(answers).length;

        return {
          total: questions.length,
          totalAnswered,
          correct,
          wrong: totalAnswered - correct,
          remaining: questions.length - totalAnswered,
        };
      },
    }),
    {
      name: "exam-storage",
      partialize: (state) => ({
        selectedSubjectIds: state.selectedSubjectIds,
        currentSubjectId: state.currentSubjectId,
        subjectState: state.subjectState,
        timeLeft: state.timeLeft,
        examStarted: state.examStarted,
        examSubmitted: state.examSubmitted,
      }),
    }
  )
);