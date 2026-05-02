# 🤖 Gemini CLI - Frontend Implementation Mandates

This document serves as the primary foundational mandate for the Gemini CLI agent when working on the Tablawy OS frontend.

## 📜 Architectural Source of Truth
The engineering standards and UI protocols for this project are defined in:
👉 **[DEVELOPMENT_PATTERNS.md](./DEVELOPMENT_PATTERNS.md)**

All changes MUST align with the patterns documented there, including **Capability-Based UI**, **Component Deconstruction**, and **Environment Safety**.

## 🦾 AI-Specific Implementation Rules

### 1. Hardened SSE Streaming (SSE)
When implementing or modifying AI streaming hooks (e.g., `useAIChat`, `useAILiveInteraction`):
- **Line Buffering**: Always implement a buffer for incoming chunks. Split by `\n\n` before parsing to ensure partial JSON packets don't crash the UI.
- **Cleanup**: Every streaming request MUST be bound to an `AbortController`. Ensure `.abort()` is called on component unmount.
- **Feedback**: Provide immediate visual feedback (e.g., updating a `currentScript` state) during the stream to ensure the UI feels responsive.

### 4. Rural Hardening (Offline-First)
- **Mandate**: Core study features (Lessons, Quizzes) MUST function without internet.
- **Action**: Use `Dexie` for IndexedDB persistence and implement the `useOfflineSync` hook to reconcile data when connection is restored.
- **Why**: Essential for students in rural areas with unreliable data coverage.

### 5. Standardized Error Handling
- **Mandate**: NEVER use generic `Error` strings for API failures.
- **Action**: Always import and use the `handleError` utility from `@/providers/utils/api-errors`.
- **Why**: This ensures that 429 (Rate Limit) and 503 (Circuit Breaker) states are correctly reported to the user via Refine's notification system.

### 6. Hardware Privacy & Safety
- **Mandate**: Components using microphone or camera MUST implement "Tab Visibility Safety".
- **Action**: Use a `visibilitychange` event listener to stop active speech synthesis or microphone recording if the user leaves the tab.

## 🎨 Visual Identifiers
- AI features must use the `ai-primary` color gradient.
- Use the `Sparkles` icon for generative features and `BrainCircuit` for analysis features.
- **Offline Mode**: Use the `WifiOff` icon and a pulsing red badge for offline indicators.

### 8. Support Visibility (Traceability)
- **Mandate**: Every AI-related error toast/notification MUST include the `X-Correlation-ID`.
- **Action**: Use the `handleError` utility and ensure the error message or a "Support Info" accordion displays the unique ID.
- **Why**: Allows students to report specific trace IDs to teachers/admins for high-fidelity debugging of hallucinations or provider failures.


