<div align="center">
  <h1 style="font-size: 2.5em; font-weight: bold; margin-bottom: 5px;">Frontend: Tablawy OS (Classroom AI)</h1>
  <p style="font-size: 1.1em; color: #555;">
    The world's first **Agentic UI** for Education. Powered by **Refine v5** and **Gemini 3 Flash Preview**.
  </p>
</div>

<div align="center" style="margin-top: 20px; margin-bottom: 20px;">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="Shadcn" />
  <img src="https://img.shields.io/badge/refine-1890FF?style=for-the-badge&logo=refine&logoColor=white" alt="Refine" />
</div>

---

## 🦾 Agentic UI Features

*   🧹 **System Self-Reflection Card**: Real-time health reports from the **Janitor Agent**.
*   🧬 **Student Learning DNA**: Pedagogical tooltips in the student roster for instant personalization.
*   👍 **Feedback Loop**: Integrated 👍/👎 sentiment tracking across all AI tools.

---

## 🏗️ Enterprise Development Patterns

We strictly adhere to industrial architectural standards to ensure AI security and responsiveness. 

**[Read the Full Code Patterns Guide here](./DEVELOPMENT_PATTERNS.md)**

1.  **Component Deconstruction (Section 3)**: Monolithic components are forbidden; large features are broken into atomic widgets.
2.  **Zero-Direct-Call Policy (Section 4)**: The frontend never calls AI SDKs directly; all interactions go through the backend proxy.
3.  **Visual Identity (Section 5)**: Consistent `ai-primary` branding and `Sparkles` iconography.
4.  **Rural Hardening (Section 7)**: Offline-first strategy using Dexie (IndexedDB) and Service Workers.
5.  **Operational Resilience (Section 9)**: Non-root Docker containers and zero-downtime migrations.
6.  **Feature-Based Migration (Section 10)**: Strict adherence to feature-scoped directory structures.

---

## 📂 Project Structure

```text
src/
├── components/       # Shared UI (Shadcn + Compound AI components)
├── features/         # Domain-specific modules (AI, Dashboard, Classes)
├── hooks/            # Custom Refine v5 and AI logic hooks
├── lib/              # Utilities (CN, Axios, Web-Push)
├── providers/        # Refine Providers (Auth, Data, AccessControl)
└── types/            # Centralized TypeScript definitions
```

---

## 🛠️ Setup & Installation

1.  **Clone & Install:**
    ```bash
    git clone https://github.com/galilio2023/classroom-frontend.git
    npm install
    ```
2.  **Environment (.env.development):**
    ```
    VITE_API_URL=http://localhost:8000/api
    VITE_SOCKET_URL=http://localhost:8000
    # Required for Rural Resilience (Resumable Uploads)
    VITE_TUS_ENDPOINT=http://localhost:8000/api/upload/resumable
    ```
3.  **Run:**
    ```bash
    npm run dev
    ```

## 🧪 Testing & Quality
*   **Unit Testing:** Powered by **Vitest**. Run with `npm run test` (if configured) or `npx vitest`.
*   **Type Safety:** Strict TypeScript configuration. Run `npx tsc` for a full system check.
*   **Linting:** ESLint with project-specific Refine v5 rules. Run `npm run lint`.
