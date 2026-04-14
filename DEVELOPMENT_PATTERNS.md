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

---

## 7. Operational Resilience
To maintain 99.9% availability during deployments:
- **Unprivileged Docker**: Production Nginx images MUST run as a non-root user (port 8080) to mitigate container breakout risks.
- **Zero-Downtime Migration**: Database changes are applied via a "Pre-Flight" migration container before traffic is shifted to the new build.
- **Healthchecks**: All services implement `/health` probes to ensure they are fully ready before receiving live student traffic.
