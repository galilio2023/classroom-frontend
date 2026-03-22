<div align="center">
  <h1 style="font-size: 2.5em; font-weight: bold; margin-bottom: 5px;">Frontend: Tablawy OS (Classroom AI)</h1>
  <p style="font-size: 1.1em; color: #555;">
    The world's first **Agentic UI** for Education. Decoupled, Intelligent, and Self-Aware.
  </p>
</div>

<div align="center" style="margin-top: 20px; margin-bottom: 20px;">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/refine-1890FF?style=for-the-badge&logo=refine&logoColor=white" alt="Refine" />
  <img src="https://img.shields.io/badge/Agentic_UI-Active-Gold" alt="Agentic UI" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
</div>

---

## 🦾 Agentic UI Features

We have implemented an **Intelligence Bridge** between complex background agents and user-facing dashboards:

*   🧹 **System Self-Reflection Card**: A high-level pulse on the main Admin Dashboard displaying the "Happiness Score" and the **Janitor Agent's** top priority fixes.
*   🧬 **Student Learning DNA**: A pedagogical tooltip in the student roster that allows teachers to hover over a name and instantly see an AI-generated persona (Learning style, recurring struggles, and preferred tone).
*   👍 **Feedback Loop**: Integrated 👍/👎 buttons across all AI components (Chat, Study Lab, Intervention) to collect real-time pedagogical sentiment.

---

## ✨ Core Intelligence Modules

### 🛡️ The "Guardian Angel" Dashboard
*   **Predictive Risk Visuals**: Real-time badges flagging students at risk based on weighted AI analysis.
*   **AI Insight Modal**: Deep-dive analysis (Strengths, Weaknesses, Improvement Plan) for every at-risk student.
*   **Agentic Interventions**: One-click AI-suggested encouragement tailored to the student's struggle.

### 🧠 AI Study Lab & Memory Missions
*   **Memory Booster**: Personalized **Spaced Repetition** list (SM-2) that greets students with "Daily Memory Missions."
*   **Infinite Chat Memory**: Context-aware chat buddy that utilizes the backend's **Recursive Summarization** for long-term continuity.
*   **Premium Visual Language**: Custom `SparkleLoader`, AI-glow borders, and metallic shine animations.

---

## 🏗️ Architectural Blueprint

*   **Refine v5 Core**: Enterprise-grade data fetching, caching, and state management.
*   **Headless UI Logic**: Business logic extracted into custom hooks (e.g., `useAIChat`) for extreme maintainability.
*   **SSE Streaming**: Real-time Server-Sent Events for a responsive, modern AI chat experience.

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

---

## 🏛️ Enterprise Patterns
*   **Optimistic UI Updates**: Instant local state changes for enrollment approvals.
*   **RTL Optimization**: Full native support for the Arabic educational ecosystem.
*   **Compound Components**: Reusable, isolated UI pieces for complex AI interactions.
