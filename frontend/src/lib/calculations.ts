export const calculatePercent = (score: number, total: number): number => {
  return total > 0 ? Math.round((score / total) * 100) : 0;
};

export const calculateGrade = (percent: number): string => {
  if (percent >= 70) return "A";
  if (percent >= 60) return "B";
  if (percent >= 50) return "C";
  if (percent >= 45) return "D";
  if (percent >= 40) return "E";
  return "F";
};

export const getResultMetrics = (score: number, total: number) => {
  const percent = calculatePercent(score, total);
  const grade = calculateGrade(percent);
  return { 
    percent, 
    grade, 
    label: `Grade ${grade}` 
  };
};
