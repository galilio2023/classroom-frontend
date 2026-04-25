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
  classId?: number;
  conversationId?: number;
  isAborted?: boolean;
  errorName?: string;
  errorCode?: string;
  promptVersion?: string;
  isDryRun?: boolean;
}

export interface ChatSource {
  id?: number;
  title: string;
  url: string;
  type: string;
}

export interface Message {
  id?: string;
  role: "user" | "model";
  parts: { text: string }[];
  sources?: ChatSource[];
}
