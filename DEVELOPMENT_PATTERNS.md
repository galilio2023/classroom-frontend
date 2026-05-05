# 🏗️ Tablawy OS - Enterprise Development Patterns

This document outlines the high-level architectural patterns and UI protocols used in the frontend to maintain industrial stability and AI responsiveness.

---

## 1. Capability-Based UI
We have moved away from raw role checks (`user.role === 'teacher'`).
- **Mandate**: Use the `useCapabilities` hook for all feature gating.
- **Why**: This makes the UI resilient to role re-configurations or the addition of new permission tiers.
- **Example**: `const { canManageCurriculum } = useCapabilities();`

---

## 2. Feature-Scoped AI Domain
All AI-related assets are consolidated within `src/features/ai/`.
- **Hooks**: General-purpose AI hooks (streaming, vision, chat) reside in `src/features/ai/hooks/`.
- **Components**: AI-specific UI (Study Buddy, Vision Assistant) reside in `src/features/ai/components/`.
- **Security**: The `<AiFeatureGuard />` component must be used to enforce global platform switches and RBAC rules.

---

## 3. Component Deconstruction
Monolithic components (God Files) are strictly forbidden.
- **Atomic Tabs**: Large tab components (Curriculum, Resource) must be broken down into atomic widgets in a `components/` sub-folder.
- **Memoization**: Heavy UI sections should be extracted into memoized functional components to prevent unnecessary re-renders.
- **Form Orchestration**: Complex forms (e.g., `ClassForm`) must act purely as orchestrators, delegating sections to specialized sub-components.

---

## 4. State & Data Fetching
- **Zero-Direct-Call Policy**: Never call the Google AI SDK directly from the frontend. All AI interactions must go through the backend proxy.
- **Standardized Error Handling**: Use the modularized `handleError` utility in `src/providers/utils/api-errors.ts` for consistent Refine-compatible error reporting.
- **Hardened SSE Streaming**: The `useAIChat` hook implements line-buffering and lifecycle cleanup to ensure robust, real-time typing effects without memory leaks.

---

## 5. UI/UX Standards
- **Visual Identity**: AI components must use the `ai-primary` color, `Sparkles` icon, and `ai-gradient-border`.
- **Responsive Resilience**: Components must support both LTR and RTL (Arabic) layouts using `i18n` and logical CSS properties where possible.
- **Human-in-the-Loop**: Teacher-facing AI outputs must be presented as editable suggestions, never as final deployments.

---

## 6. Environment Variable Safety (Bundling)
Vite performs static replacement of `import.meta.env.VITE_*` variables during the build process.
- **Mandate**: Strictly use static property access (e.g., `import.meta.env.VITE_API_URL`).
- **❌ AVOID DESTRUCTURING**: `const { VITE_API_URL } = import.meta.env;` will fail in production because Vite cannot statically replace destructured keys.
- **Why**: Ensures the `validate-env.mjs` audit remains reliable and production builds don't ship with `undefined` configuration values.
- **🛡️ RUNTIME GATEKEEPER**: The `docker-entrypoint.sh` script acts as the final gatekeeper in production, dynamically injecting these variables into the Nginx configuration and security headers to ensure consistency between the environment and the served bundle.

---

## 7. Rural Hardening (Offline-First Strategy)
To support students in internet-unstable areas, Tablawy OS uses a "Learning without Limits" engine:
- **Client-Side DB**: **Dexie (IndexedDB)** is used to store `cached_lessons` and `pending_quizzes`.
- **Background Sync**: The `useOfflineSync` hook monitors `online`/`offline` events. When connectivity is restored, it flushes any stored quiz attempts to the server automatically.
- **Synchronized State**: For AI-generated assets (like Study Plans), use the `useStudyPlanSync` pattern. This pattern reconciles server data with local Dexie state on component mount and job completion, using an `updatedAt` timestamp to ensure the "Freshest Copy Wins."
- **Service Worker (`sw.ts`)**: Implements a "Curriculum-First" caching strategy. Assets once downloaded are served locally with zero network latency.
- **Visual Feedback**: A pulsing "Offline Mode" badge and a specialized "Download Lesson" toggle provide clear state indicators to the user.
- **Hager Mode (PDF Handouts)**: For Rule 7 (High-Fidelity Handouts), use `html2canvas` + `jspdf` only for simple LTR snapshots. **Mandate**: For any document containing Arabic typography or LaTeX formulas, the frontend MUST delegate generation to the backend PDF engine. Client-side rendering of complex Arabic text shaping is brittle and forbidden for official high-fidelity handouts.

---

## 8. Premium UI Components
Certain high-impact components (like FileUpload or AI Hub) use "Premium" styling that deviates from standard Radix/Shadcn sizes.
- **Buttons**: Premium action buttons use `h-12 md:h-14` with `rounded-2xl` and `font-black`. 
- **Typography**: Overline labels use `text-[10px] font-black uppercase tracking-[0.2em]`.
- **Purpose**: To provide a distinct, high-quality look and feel for core platform interactions.

---

## 9. Operational Resilience
To maintain 99.9% availability during deployments:
- **Unprivileged Docker**: Production Nginx images MUST run as a non-root user (port 8080) to mitigate container breakout risks.
- **Zero-Downtime Migration**: Database changes are applied via a "Pre-Flight" migration container before traffic is shifted to the new build.

---

## 10. Feature-Based Migration & Backward Compatibility
The project is transitioning to a strictly feature-scoped directory structure (`src/features/`).
- **Legacy Shims**: To prevent breaking existing imports, "shim" files are maintained in `src/hooks/` and `src/components/`. These files simply re-export the logic from its new feature-based home.
- **Mandate**: All shim files MUST include a `@deprecated` JSDoc tag referencing the new feature path.
- **Mandate**: New code MUST import directly from the `@/features/` path.
- **Cleanup**: Shims should be incrementally removed as legacy components are refactored to use the new feature-scoped exports.
