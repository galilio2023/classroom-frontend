# 🤖 Tablawy OS - Frontend AI Integration Patterns (Refine v5)

This document outlines the frontend architecture, patterns, and security protocols for the **Gemini 3.1 Flash Lite** integration within the Tablawy OS ecosystem, optimized for **Refine v5**.

## 1. Core AI Mission
To transform the educational experience through:
- **Teacher Productivity (The Magic Builder):** Automating curriculum design, quiz generation, and assignment drafting.
- **Student Empowerment (The Study Lab):** Providing personalized practice, instant explanations, and AI-driven study planning.
- **Intelligent Grading (The Grading Agent):** Offering preliminary analysis and feedback on student submissions to reduce teacher workload.
- **Contextual Assistance (The Study Buddy):** A class-aware chat assistant that understands specific course materials.

## 2. Architectural Patterns

### Frontend (React / Refine v5)
- **Zero-Direct-Call Policy:** The frontend *never* calls the Google AI SDK directly. All requests are proxied through the backend to ensure security, logging, and rate limiting.
- **Refine v5 Hooks:** AI features are exposed via custom hooks (e.g., `useAIChat`, `useQuizGeneration`) leveraging Refine v5's `useCustomMutation` for seamless state management and standardized API handling.
- **Gamified Feedback:** AI actions (like completing a study block) are integrated with the frontend gamification system (XP rewards).

### Security & Access Control
- **RBAC (Role-Based Access Control):** AI features are restricted to specific roles using the `accessControlProvider`.
- **Teacher-Only Tools:** Magic Builder, Grading Agent, and Assignment Helper are restricted to **Teachers** and **Admins**.
- **Student-Only Tools:** Study Lab, Study Buddy, and Study Planner are available to **Students** to enhance their learning journey.

## 3. Enterprise AI Features

| Feature | Frontend Component | Refine v5 Hook | Target User |
| :--- | :--- | :--- | :--- |
| **Magic Builder** | `MagicBuilderDialog` | `useCustomMutation` | Teacher |
| **Grading Agent** | `SubmissionShow` | `useCustomMutation` | Teacher |
| **Study Lab** | `AIStudyLab` | `useCustomMutation` | Student |
| **Study Buddy** | `AIStudyBuddy` | `use-ai-chat` | Student |
| **Study Planner** | `StudyPlanner` | `useCustomMutation` | Student |

## 4. UI/UX Best Practices
- **Visual Identity:** AI-driven components use a distinct visual style (e.g., `ai-primary` color, `Sparkles` icon, `ai-gradient-border`).
- **Loading States:** Every AI action must provide clear visual feedback (e.g., `Loader2` with a "Gemini is thinking..." message) to manage user expectations during complex analysis.
- **Human-in-the-Loop:** For teacher tools (like the Grading Agent), AI output is presented as a **suggestion** that the teacher must review and approve before it is persisted.

## 5. CI/CD & GitHub Workflow Integration
The Gemini API is integrated into the **GitHub Actions** pipeline for:
- **Automated Code Reviews:** Analyzing Pull Requests for security vulnerabilities, performance bottlenecks, and architectural consistency.
- **Documentation Audits:** Ensuring that `README` and `API` docs are in sync with the latest code changes.
- **Workflow Secret:** `GEMINI_API_KEY` must be configured in GitHub Repository Secrets to enable these build-time features.
