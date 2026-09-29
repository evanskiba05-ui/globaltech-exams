import { useQuery } from "@tanstack/react-query";
import { getQuestions } from "@/lib/api/exam";

export const useQuestions = (subjectId?: number) =>
  useQuery({
    queryKey: ["questions", subjectId],
    queryFn: () => getQuestions(subjectId),
    enabled: typeof subjectId === "number",
    staleTime: 5 * 60 * 1000,
  });