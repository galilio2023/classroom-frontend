export interface SystemHealthReport {
  id: number;
  reportDate: string;
  statusCount: number;
  feedbackCount: number;
  diagnosis: string;
  suggestedFixes: string[];
  metadata: {
    happinessScore: number;
    posCount: number;
    negCount: number;
  };
}
