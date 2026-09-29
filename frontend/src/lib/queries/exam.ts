import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  startExam,
  saveAnswer,
  submitExam,
  getExamResult,
  getTimeRemaining,
} from "@/lib/api/exam";

export const useStartExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subjectIds: number[]) => startExam(subjectIds),
    onSuccess: (res) => {
      if (res?.token) {
        localStorage.setItem("student_token", res.token);
      }
      queryClient.invalidateQueries({ queryKey: ["exam"] });
    },
  });
};

export const useSaveAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, optionId }: { questionId: number; optionId: number | null }) =>
      saveAnswer(questionId, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam", "result"] });
    },
  });
};

export const useSubmitExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam", "result"] });
    },
  });
};

export const useExamResult = () =>
  useQuery({
    queryKey: ["exam", "result"],
    queryFn: getExamResult,
    enabled: false,
    staleTime: 0,
  });

export const useTimeRemaining = () =>
  useQuery({
    queryKey: ["exam", "time"],
    queryFn: getTimeRemaining,
    enabled: false,
    refetchInterval: 1000,
    staleTime: 0,
  });