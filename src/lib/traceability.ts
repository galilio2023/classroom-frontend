import { v4 as uuidv4 } from "uuid";

/**
 * 🛡️ TRACEABILITY: Standardized Correlation ID Generator
 * Mandate Review #8: Ensures every AI-related request has a unique, traceable ID
 * that can be reported by students for high-fidelity debugging.
 *
 * @param prefix - Descriptive prefix (e.g., 'upload', 'chat', 'quiz-gen')
 * @returns Standardized correlation ID (e.g., 'upload-550e8400-e29b-41d4-a716-446655440000')
 */
export const createCorrelationId = (prefix: string): string => {
  return `${prefix}-${uuidv4()}`;
};
