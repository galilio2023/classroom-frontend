# 🤖 Tablawy OS - Frontend AI Integration Patterns (Refine v5)

This document outlines the frontend architecture, patterns, and security protocols for the **Gemini 3 Flash Preview** integration within the Tablawy OS ecosystem, optimized for **Refine v5**.

## 1. Core AI Mission
To transform the educational experience through:
- **Teacher Productivity (The Magic Builder):** Automating curriculum design, quiz generation, and assignment drafting.
- **Student Empowerment (The Study Lab):** Providing personalized practice, instant explanations, and AI-driven study planning.
- **Intelligent Grading (The Grading Agent):** Offering preliminary analysis and feedback on student submissions.
- **Contextual Assistance (The Study Buddy):** A class-aware chat assistant that understands specific course materials.

## 2. Architectural Patterns

### Frontend (React / Refine v5)
- **Zero-Direct-Call Policy:** The frontend *never* calls the Google AI SDK directly. All requests are proxied through the backend to ensure security, logging, and rate limiting.
- **Adaptive UI:** AI-driven components like `AIStudyBuddy` and `MagicBuilder` must check `globalConfig.enableAiFeatures` before rendering. If the platform administrator disables AI, these features must gracefully vanish.
- **Hardened SSE Streaming:** The `useAIChat` hook implements a specialized streaming engine:
    - **Line Buffering**: Prevents JSON parsing errors from split network packets.
    - **Lifecycle Safety**: Uses `AbortController` and `requestAnimationFrame` to prevent memory leaks and race conditions.
    - **Dual Auth**: Maintains both `credentials: "include"` and `Authorization` headers for maximum backend compatibility.
- **Refine v5 Hooks:** Standard AI metadata (history, permissions) is fetched using Refine's `useCustom` and `usePermissions` to benefit from centralized caching and standardized state.

### Security & Access Control
- **Zero-Direct-Call Enforcement:** ESLint strictly forbids importing `@google/generative-ai` on the frontend.
- **Hook Isolation:** All AI-related hooks reside in `src/hooks/ai/` and must follow strict type-safety rules (no `any`).
- **Feature Gating:** Every AI component MUST be wrapped in the `<AiFeatureGuard />` component to enforce the "Master Switch" and RBAC rules.
- **Hardened Streaming:**
    - **`useAiStream`**: The foundational base hook for all AI streaming (SSE) interactions. Implements **Line Buffering** to ensure robust parsing of LLM JSON chunks.
    - **`useAIChat`**: A production-grade specialization of the streaming pattern for Study Buddy and General Chat, including **Dexie-backed Persistence** and adaptive UI states.
- **Client-Side Persistence:** `Dexie.js` is utilized for secure, local caching of AI chat history (Study Buddy) to reduce redundant API calls and enable offline review.

## 3. UI/UX Best Practices
- **Visual Identity:** AI components use the `ai-primary` color, `Sparkles` icon, and `ai-gradient-border`.
- **Loading States:** Complex AI actions must provide clear visual feedback (e.g., `Loader2` with "Gemini is thinking...").
- **Human-in-the-Loop:** For teacher tools (like the Grading Agent), AI output is presented as a **suggestion** that requires human approval.

## 4. Feature Directory

| Feature | Frontend Component | Primary Hook | Target User |
| :--- | :--- | :--- | :--- |
| **Magic Builder** | `MagicBuilderDialog` | `useCustomMutation` | Teacher |
| **Co-Teacher** | `AILiveCompanion` | `usePersistentLive` | Student |
| **Study Buddy** | `AIStudyBuddy` | `useAIChat` (Hardened) | Student |
| **Video PiP** | `VideoMiniPlayer` | `usePersistentLive` | Student |
| **System Health** | `SystemHealthCard` | `useDashboard` | Admin |

## 5. CI/CD & GitHub Workflow Integration
The Gemini API is integrated into the **GitHub Actions** pipeline for automated code reviews and documentation audits.
