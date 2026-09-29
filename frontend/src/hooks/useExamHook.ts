import { useCallback, useEffect } from "react";
import { useSubjectStore } from "@/store/subject";
import { useExamStore } from "@/store/exam";
import { useShallow } from "zustand/react/shallow";
import { useStudentSubjects } from "@/lib/queries/subjects";
import { useQuestions } from "@/lib/queries/questions";
import { useStartExam, useSaveAnswer, useSubmitExam, useExamResult, useTimeRemaining } from "@/lib/queries/exam";
import { BookOpen, Triangle, Microscope, Atom, FlaskConical, TrendingUp, Library, Globe } from "lucide-react";
import type { Subject } from "@/lib/d-types";
import type { Question } from "@/lib/questions";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  english_language: BookOpen,
  mathematics: Triangle,
  biology: Microscope,
  physics: Atom,
  chemistry: FlaskConical,
  economics: TrendingUp,
  literature: Library,
  geography: Globe,
};

const ICON_BG_MAP: Record<string, string> = {
  english_language: "#e0f2fe",
  mathematics: "#fef3c7",
  biology: "#dcfce7",
  physics: "#ede9fe",
  chemistry: "#fce7f3",
  economics: "#ffedd5",
  literature: "#f3e8ff",
  geography: "#dbeafe",
};

const ICON_COLOR_MAP: Record<string, string> = {
  english_language: "#0369a1",
  mathematics: "#d97706",
  biology: "#16a34a",
  physics: "#7c3aed",
  chemistry: "#db2777",
  economics: "#ea580c",
  literature: "#9333ea",
  geography: "#2563eb",
};

const mapBackendSubject = (s: any): Subject => {
  const slug = s.slug || "";
  return {
    id: String(s.id),
    dbId: s.id,
    slug,
    name: s.name,
    questions: s.total_questions,
    time: s.duration_mins,
    icon: ICON_MAP[slug] || BookOpen,
    iconBg: ICON_BG_MAP[slug] || "#e0f2fe",
    iconColor: ICON_COLOR_MAP[slug] || "#0369a1",
    color: ICON_BG_MAP[slug] || "#e0f2fe",
    isCompulsory: !!s.is_compulsory,
    meta: s.question_count + " questions available",
    isActive: !!s.is_active,
    createdAt: s.created_at,
  };
};

const DEFAULT_SUB_STATE = { answers: {}, currentIndex: 0, questions: [], optionIdsMap: {} };

const mapBackendQuestions = (rows: any[]) => {
  const questions: Question[] = [];
  const optionIdsMap: Record<string, number[]> = {};
  for (const q of rows) {
    const opts = q.options || [];
    questions.push({
      id: String(q.id),
      text: q.text,
      options: opts.map((o: any) => o.text),
      answer: "", // correct answer isn't sent to the client; scoring happens server-side
    });
    optionIdsMap[String(q.id)] = opts.map((o: any) => o.id);
  }
  return { questions, optionIdsMap };
};

export const useExamHook = () => {
  const subjectStore = useSubjectStore(
    useShallow((state) => ({
      availableSubjects: state.availableSubjects,
      selectedSubjects: state.selectedSubjects,
      selectedSubjectIds: state.selectedSubjectIds,
      selectSubject: state.selectSubject,
      setAvailableSubjects: state.setAvailableSubjects,
      setSelectedSubjects: state.setSelectedSubjects,
    }))
  );

  const examStore = useExamStore(
    useShallow((state) => ({
      currentSubjectId: state.currentSubjectId,
      subjectState: state.subjectState,
      timeLeft: state.timeLeft,
      examStarted: state.examStarted,
      examSubmitted: state.examSubmitted,
      setSelectedSubjectIds: state.setSelectedSubjectIds,
      setCurrentSubject: state.setCurrentSubject,
      setSubjectQuestions: state.setSubjectQuestions,
      selectAnswer: state.selectAnswer,
      nextQuestion: state.nextQuestion,
      prevQuestion: state.prevQuestion,
      jumpToQuestion: state.jumpToQuestion,
      startExam: state.startExam,
      submitExam: state.submitExam,
      resetExam: state.resetExam,
      tickTimer: state.tickTimer,
      getCurrentSubjectState: state.getCurrentSubjectState,
      getCurrentResult: state.getCurrentResult,
    }))
  );

  const { data: subjectsData } = useStudentSubjects();
  const startExamMutation = useStartExam();
  const saveAnswerMutation = useSaveAnswer();
  const submitExamMutation = useSubmitExam();
  const { data: examResult, refetch: refetchExamResult } = useExamResult();
  const { data: timeRemaining } = useTimeRemaining();

  const { currentSubjectId, subjectState } = examStore;
  const { availableSubjects, selectedSubjectIds, selectedSubjects, setAvailableSubjects, setSelectedSubjects } = subjectStore;

  const currentSubState = subjectState[currentSubjectId] || DEFAULT_SUB_STATE;
  const questions = currentSubState.questions || [];
  const currentSubject = selectedSubjects.find((s: any) => s.id === currentSubjectId);

  // Only fetch once the exam session actually exists on the backend
  // (started via startExam()) — otherwise /api/exam/questions 400s.
  const currentDbId = examStore.examStarted
    ? availableSubjects.find((s: any) => s.id === currentSubjectId)?.dbId
    : undefined;
  const { data: questionsData } = useQuestions(currentDbId);
  const { setSubjectQuestions } = examStore;

  useEffect(() => {
    if (!currentSubjectId || !questionsData || questions.length > 0) return;
    const mapped = mapBackendQuestions(questionsData);
    setSubjectQuestions(currentSubjectId, mapped.questions, mapped.optionIdsMap);
  }, [currentSubjectId, questionsData, questions.length, setSubjectQuestions]);

  const currentIndex = currentSubState.currentIndex;
  const currentQuestion = questions[currentIndex];

  const selectedAnswer = currentQuestion && currentSubState.answers[currentQuestion.id]
    ? currentSubState.answers[currentQuestion.id]
    : "";

  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  const isVeryFirstQuestion = currentSubjectId === selectedSubjectIds[0] && currentIndex === 0;
  const isVeryLastQuestion =
    currentSubjectId === selectedSubjectIds[selectedSubjectIds.length - 1] && isLastQuestion;

  const answeredCount = Object.keys(currentSubState.answers).length;
  const correct = questions.filter((q) => currentSubState.answers[q.id] === q.answer).length;

  const selectSubject = (subjectIds: string[]) => {
    subjectStore.selectSubject(subjectIds);
    examStore.setSelectedSubjectIds(subjectIds);
    if (subjectIds.length > 0) {
      examStore.setCurrentSubject(subjectIds[0]);
    }
  };

  const getSubjects = useCallback(() => {
    if (subjectsData) {

      const mapped = subjectsData.map(mapBackendSubject);
      setAvailableSubjects(mapped);
      const selected = mapped.filter((s: { id: string }) =>
        selectedSubjectIds.includes(s.id)
      );
      setSelectedSubjects(selected);
    }
  }, [subjectsData, selectedSubjectIds, setAvailableSubjects, setSelectedSubjects]);

  const startExam = async (subjectIds?: string[]) => {
    const ids = subjectIds || selectedSubjectIds;
    if (ids.length === 0) return;
    
    const dbIds = availableSubjects
      .filter((s: any) => ids.includes(s.id))
      .map((s: any) => (s as any).dbId)
      .filter((id): id is number => typeof id === "number");
    
    await startExamMutation.mutateAsync(dbIds);
    examStore.startExam();
  };

  const saveAnswer = async (questionId: number, optionId: number | null) => {
    await saveAnswerMutation.mutateAsync({ questionId, optionId });
  };

  const submitExam = async () => {
    await submitExamMutation.mutateAsync();
    examStore.submitExam();
  };

  const fetchExamResult = async () => {
    await refetchExamResult();
  };

  // Backend shape (GET /api/exam/result): { total_score, total_possible,
  // subject_breakdown: [{ name, slug, total_questions, correct, wrong, unanswered, ... }], ... }
  const getResultsBySubject = () => {
    if (!examResult) return [];
    return examResult.subject_breakdown || [];
  };

  const getAllResults = () => {
    if (!examResult) return { correct: 0, total: 0, remaining: 0 };
    const breakdown = examResult.subject_breakdown || [];
    const remaining = breakdown.reduce((sum: number, s: any) => sum + (s.unanswered || 0), 0);
    return {
      correct: examResult.total_score || 0,
      total: examResult.total_possible || 0,
      remaining,
    };
  };

  return {
    // derived helpers
    currentSubject,
    currentIndex,
    answers: currentSubState.answers,
    selectedAnswer,
    isLastQuestion,
    isFirstQuestion,
    isVeryFirstQuestion,
    isVeryLastQuestion,
    answeredCount,
    remaining: questions.length - answeredCount,
    correct,
    wrong: answeredCount - correct,
    currentQuestion,
    totalQuestions: questions.length,
    optionIdsMap: currentSubState.optionIdsMap,

    // raw state slices
    selectedSubjectIds,
    selectedSubjects,
    currentSubjectId,
    questions,
    timeLeft: timeRemaining?.time_left ?? examStore.timeLeft,
    examStarted: examStore.examStarted,
    examSubmitted: examStore.examSubmitted,
    availableSubjects,

    // actions
    selectSubject,
    getSubjects,
    setCurrentSubject: examStore.setCurrentSubject,
    setSubjectQuestions: examStore.setSubjectQuestions,
    selectAnswer: examStore.selectAnswer as (questionId: string, option: string) => void,
    nextQuestion: examStore.nextQuestion,
    prevQuestion: examStore.prevQuestion,
    jumpToQuestion: examStore.jumpToQuestion,
    startExam,
    saveAnswer,
    submitExam,
    resetExam: examStore.resetExam,
    tickTimer: examStore.tickTimer,
    getCurrentResult: examStore.getCurrentResult,
    fetchExamResult,
    getResultsBySubject,
    getAllResults,
    
    // mutation states
    isStartingExam: startExamMutation.isPending,
    isSavingAnswer: saveAnswerMutation.isPending,
    isSubmittingExam: submitExamMutation.isPending,
    isFetchingResult: false,
  };
};