# 🛠️ Project Tech Stack & Constraints

**⚠️ CRITICAL INSTRUCTION FOR AI:**
Always refer to this file before generating code. Do not use deprecated patterns or older versions of these libraries.

## 🖥️ Frontend (React)

*   **Framework:** Vite + React 19
*   **Core Framework:** **Refine v5**
    *   *Pattern:* Use `@refinedev/core` hooks (`useList`, `useForm`, `useNavigation`, `useGo`).
    *   *Pattern:* Use `headless` mode (no AntD/MUI dependencies).
    *   *Pattern:* Use `authProvider` bridging to `better-auth`.
*   **Styling:** **Tailwind CSS v4**
    *   *Constraint:* NO `tailwind.config.js`. Configuration is in `App.css` via `@theme`.
    *   *Constraint:* Use CSS variables for colors (e.g., `bg-muted/40`, `text-primary`).
*   **UI Components:** **shadcn/ui**
    *   *Pattern:* Components live in `src/components/ui`.
    *   *Pattern:* Do not install component libraries; code is owned.
*   **Routing:** React Router v7
*   **Forms:** `react-hook-form` + `zod` + `@hookform/resolvers`
*   **Icons:** `lucide-react`

## 📦 Key Libraries
*   `@refinedev/core`
*   `@refinedev/react-router`
*   `better-auth/react`
*   `tailwindcss` (v4)
*   `zod`
*   `sonner` (for toasts)
