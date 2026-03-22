<div align="center">
  <h1 style="font-size: 2.5em; font-weight: bold; margin-bottom: 5px;">Frontend: Tablawy OS (Classroom AI)</h1>
  <p style="font-size: 1.1em; color: #555;">
    The world's first **Agentic UI** for Education. Powered by **Refine v5** and **Gemini 3.1 Flash Lite**.
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

We strictly adhere to the following patterns:

1.  **Zero-Direct-Call Policy**: The frontend never calls AI SDKs directly. All requests use `useCustomMutation` to hit our secure backend proxy.
2.  **Compound Component Architecture**: Large features (like the Study Lab) are broken into isolated, reusable pieces.
3.  **Visual Identity (Rule 4)**: All AI features use `ai-primary`, `Sparkles` icons, and premium Framer Motion animations (`ai-pulse-soft`).

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
    ```
3.  **Run:**
    ```bash
    npm run dev
    ```
