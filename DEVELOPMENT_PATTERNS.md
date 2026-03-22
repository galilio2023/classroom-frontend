# 🏗️ Tablawy OS - Enterprise Development Patterns

This document outlines the high-level architectural patterns used in the frontend to maintain industrial stability and AI responsiveness.

---

## 1. Zero-Direct-Call Policy (Security)
To protect our Gemini API keys and enforce rate limiting, the frontend **never** calls the Google AI SDK directly.

**❌ AVOID:**
```typescript
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" }); // UNSAFE
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
