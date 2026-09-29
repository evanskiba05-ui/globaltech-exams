import { useQuery } from "@tanstack/react-query";
import { getAllSubjects } from "@/lib/api/admin";
import { getSubjects } from "@/lib/api/subjects";

export const useSubjects = () =>
  useQuery({
    queryKey: ["subjects"],
    queryFn: getAllSubjects,
    staleTime: 5 * 60 * 1000,
  });

export const useStudentSubjects = () =>
  useQuery({
    queryKey: ["student-subjects"],
    queryFn: getSubjects,
    staleTime: 5 * 60 * 1000,
  });
