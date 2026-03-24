# 📋 Frontend Technical Contract & API Reference

This document serves as the **Single Source of Truth** for frontend developers. It describes the backend API structure, required Refine v5 hooks, and enterprise hardening constraints.

---

## 🔐 Auth & Identity
*   **Provider:** Better Auth
*   **Base URL:** `/api/auth`

| Method | Endpoint | Recommended Hook | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/sign-in/email` | `useLogin` | Authenticate user. |
| `GET` | `/session` | `useGetIdentity` | Fetch profile & role. |

---

## 🦾 AI Services (Base URL: `/api/ai`)
**Enterprise Constraint:** AI features are guarded by a global "Master Switch." Check `coreData.globalConfig.enableAiFeatures` before rendering.

| Method | Endpoint | Hook | Limit | Type |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/chat` | `useAIChat` | 20/hr | `AIResponse` |
| `POST` | `/study-buddy` | `useAIChat` (SSE) | 20/hr | `Stream` |
| `PATCH` | `/interact` | `useAILiveInteraction` (SSE) | 60/hr | `Stream` |
| `POST` | `/generate-*` | `useCustomMutation` | 5/15m | `AIFeedbackResponse` |
| `POST` | `/feedback` | `useCustomMutation` | 60/hr | - |
| `GET` | `/health-report` | `useTable` | 1/hr | `SystemHealthReport` |

### 📡 Hardened SSE Pattern
All streaming endpoints (`/study-buddy`, `/interact`) MUST follow the **JSON Line Buffering** protocol:
1.  **Transport:** Server-Sent Events (SSE).
2.  **Format:** Each data chunk must be a valid JSON object prefixed with `data: ` and suffixed with `\n\n`.
3.  **Buffering:** The frontend hook (`useAIChat`, `useAILiveInteraction`) implements line-buffering to prevent parsing errors from split network packets.
4.  **Finalization:** The stream must end with a `data: {"done": true}` message.

### 🧠 Response Metadata
All AI endpoints return a `metadata` block. Handle it in your hooks:
```typescript
interface AIMetadata {
  usage: { promptTokens: number; candidatesTokens: number; totalTokens: number };
  latencyMs: number;
  isDryRun: boolean; // Show "Mock Mode" alert if true
}
```

---

## 🎓 Academic Core

### Classes & Enrollment
*   **Base URL:** `/api/classes`

| Method | Endpoint | Hook | Permissions |
| :--- | :--- | :--- | :--- |
| `GET` | `/mine` | `useList` | Student/Teacher |
| `GET` | `/live` | `useList` | Global Presence Signal |
| `PATCH` | `/enrollments/:id`| `useUpdate` | Teacher/Admin |

### Curriculum & Resources
*   **Base URL:** `/api/resources`

| Method | Endpoint | Hook | Protection |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | `useForm` | Supports `expiresAt` |
| `GET` | `/:id` | `useOne` | Enforces expiry check |

### 📽️ Teacher TV & Promotion
*   **Base URL:** `/api/channels`

| Method | Endpoint | Hook | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/feature-resource` | `useCustomMutation` | Promote a class video to the public Teacher TV. |
| `GET` | `/stats` | `useOne` | Fetch real-time view counts and engagement. |

---

## 📺 Video Persistence & PiP Stacking
The global `Layout` manages a prioritized Picture-in-Picture (PiP) stack to prevent audio overlap:

1.  **Level 1 (Highest):** `LiveClassroom` (Active video session).
2.  **Level 2:** `PromotionMiniPlayer` (Teacher TV trailers).
3.  **Level 3:** `VideoMiniPlayer` (Recorded revision lessons).

*   **Logic:** Higher-level videos automatically hide lower-level players.
*   **Persistence:** All player states are synced to `tablawy-live-session` in localStorage.

---

## 💬 Discussions & Social
*   **Base URL:** `/api/discussions`

| Method | Endpoint | Hook | Socket Event |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | `useCreate` | `new_discussion` |
| `PATCH` | `/:id/solve` | `useCustomMutation` | `discussion_solved` |

---

## 🛡️ Error Handling Patterns
Catch these specific status codes in your Refine notification providers:

*   **429 (Too Many Requests):** Show localized "Hourly Limit Reached."
*   **503 (Service Unavailable):** Show localized "AI Maintenance Mode."
*   **403 (Forbidden):** Standard "Access Denied."

---

## 📡 Real-Time (Socket.io)
Subscribe to these channels via the `SocketProvider`:
*   `class:${id}`: Academic updates & solved questions.
*   `user:${id}`: Personal notifications & badges.
