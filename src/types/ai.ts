import { DayName } from "@/constants/calendar";

export type AIVisualState = "talking" | "thinking" | "listening" | "idle";

export interface AIUsageMetadata {
  promptTokens: number;
  completionTokens?: number;
  candidatesTokens?: number;
  totalTokens: number;
  latencyMs: number;
  model?: string;
  isCached?: boolean;
}

export interface AIStreamPayload {
  text?: string;
  done?: boolean;
  usage?: AIUsageMetadata;
  sources?: ChatSource[];
}

export interface AIMetadata extends Partial<AIUsageMetadata> {
  classId?: string | number;
  conversationId?: string | number;
  isAborted?: boolean;
  errorName?: string;
  errorCode?: string;
  promptVersion?: string;
  isDryRun?: boolean;
}

export interface ChatSource {
  id?: string | number;
  title: string;
  url: string;
  type: string;
}

export type StudyPlanTopic = "generate_study_plan";

export interface StudyBlock {
  day: DayName;
  timeSlot: "Morning" | "Afternoon" | "Evening";
  task: string;
  assignmentId?: string | number;
  duration: string;
}

export interface Message {
  id?: string;
  role: "user" | "model";
  parts: { text: string }[];
  sources?: ChatSource[];
}
