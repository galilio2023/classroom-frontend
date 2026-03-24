export type AIVisualState = "talking" | "thinking" | "listening";

export interface AI_USAGE_METADATA {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs: number;
}

export interface AI_STREAM_PAYLOAD {
    text?: string;
    done?: boolean;
    usage?: AI_USAGE_METADATA;
}
