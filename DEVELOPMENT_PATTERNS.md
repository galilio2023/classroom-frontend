# 🏗️ Tablawy OS - Enterprise Development Patterns

This document outlines the high-level architectural patterns used in the frontend to maintain industrial stability and AI responsiveness.

---

## 1. Zero-Direct-Call Policy (Security)
To protect our Gemini API keys and enforce rate limiting, the frontend **never** calls the Google AI SDK directly.

**❌ AVOID:**
```typescript
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); // UNSAFE
```

**✅ PREFER:**
```typescript
const { mutate } = useCustomMutation();
mutate({ url: "/ai/feedback", method: "post", values: { ... } }); // SECURE
```

---

## 2. Optimistic UI Updates (UX)
For critical user actions like **Enrollment Approval**, we update the UI instantly before the server responds to provide a "Zero-Latency" feel.

**Implementation Example (`students-tab.tsx`):**
```typescript
const handleOptimisticEnrollment = async (id: number, status: string) => {
    onEnrollmentAction(id, status); // Trigger API
    queryClient.setQueriesData({ queryKey }, (old) => ({
        ...old,
        data: old.data.map(e => e.id === id ? { ...e, status } : e)
    }));
};
```

---

## 3. Compound AI Components
AI features are complex. We break them into isolated pieces that share state via props or context.

*   **Compound Pieces**: `MemoryBoosterList` -> `MemoryBoosterItem` -> `SparkleLoader`.
*   **Benefits**: Easier to test, zero logic duplication, consistent visual identity.

---

## 4. Visual Identity & Motion
All AI-driven components must use:
*   **Colors**: `ai-primary` (Purple/Indigo gradient).
*   **Icons**: `Sparkles` or `BrainCircuit`.
*   **Motion**: `AnimatePresence` for loading/result transitions to avoid "layout jumps."

---

## 5. Hardened SSE Streaming (Performance)
To support real-time "typing" effects without memory leaks or crashes, we use a specialized streaming engine in `useAIChat`.

*   **Line Buffering**: Always buffer chunks and split by `\n\n` to prevent `JSON.parse` errors on split TCP packets.
*   **AbortController**: Bind every request to a controller. Call `.abort()` on unmount or before starting a new request to prevent "Ghost Messages."
*   **RequestAnimationFrame**: Batch UI updates to the browser's refresh rate to maintain 60FPS during high-frequency token streaming.

---

## 6. Refine v5 Hook Synchronization
Maintain a strict hierarchy between Refine hooks and local state.

*   **History**: Use `useCustom` for historical AI data. Benefit from automatic caching and revalidation.
*   **Permissions**: Always use `usePermissions` to gate AI actions. Handle `isLoading` and `isError` states to prevent unauthorized "Flash of Content."
*   **Navigation**: Reset AI state trackers (`hasLoadedHistoryFor`) when the resource ID (e.g., `classId`) changes to ensure context purity.

