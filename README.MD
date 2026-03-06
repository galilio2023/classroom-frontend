<div align="center">
  <h1>Frontend: Classroom Management System</h1>
</div>

This project contains the user interface for the classroom application, built with React, Refine, and Shadcn UI.

## 🚀 Tech Stack

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/refine-1890FF?style=for-the-badge&logo=refine&logoColor=white" alt="Refine" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="Shadcn UI" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Jitsi_Meet-0052CC?style=for-the-badge&logo=jitsi&logoColor=white" alt="Jitsi Meet" />
</div>

---

## 🏗️ Architectural Blueprint: The "Headless" Revolution

We chose a **Headless Architecture** powered by **Refine** to decouple the UI from the data logic. This allows us to build a highly custom, pixel-perfect interface without fighting against a rigid "Admin Panel" framework.

### 1. The Layers

*   **Data Layer (`src/providers/`)**: The **Bridge**. It translates our custom backend API into a standardized interface that Refine understands. It handles auth, data fetching, and error normalization globally.
*   **Logic Layer (Refine Hooks)**: The **Brain**. We use hooks like `useList`, `useForm`, and `useCustom` to manage state, caching, and optimistic updates. We **never** write raw `fetch` calls in components.
*   **UI Layer (Shadcn + Tailwind)**: The **Face**. We use **shadcn/ui** for accessible, unstyled components that we style with **Tailwind CSS v4**. This gives us complete control over the design system (Dark Mode, Animations, Glassmorphism).

### 2. Why this Architecture?

| Decision | Why we chose it |
| :--- | :--- |
| **Refine (Headless)** | Traditional Admin Panels (like React Admin) are too ugly for a student-facing app. Refine gives us the *logic* of an admin panel but lets us build a *consumer-grade* UI. |
| **Shadcn/UI** | It's not a component library; it's a collection of copy-pasteable components. This means we own the code and can customize it deeply (e.g., the AI Magic Builder dialog). |
| **Tailwind v4** | The new engine is faster and allows for dynamic, variable-based theming (e.g., `--ai-primary`) without a complex config file. |

---

## 🚀 Advanced Features (Latest Updates)

### 📊 Deep Analytics Dashboard
*   **Dual-Speed Loading:** Optimized data fetching splits "Fast" (Schedule) and "Slow" (Analytics) data for a snappier UI.
*   **Teacher Insights:** Automated **At-Risk Student Detection**. Flags students with low average grades (<60%) or high absences (>3) for immediate intervention.
*   **Student Portfolio:** **Academic Journey** visualization. Includes a **Progress Line Chart** for grades and a **Subject Mastery Radar Chart** to track strengths across the curriculum.

### 🎥 Live Classroom & Auto-Attendance
*   **Jitsi Meet Integration:** Fully embedded virtual classroom for every class.
*   **Automatic Credit:** Students are automatically marked "Present" when they join a live session.
*   **Real-time Status:** Live indicators show when a session is active across the platform.

### 🏆 Gamified Learning
*   **XP & Leveling System:** Students earn experience points for attending classes, completing assignments, and passing quizzes.
*   **Class Leaderboards:** Real-time rankings within each class to foster healthy competition.
*   **Dynamic Levels:** Visual level badges and progress bars based on total XP.

### 🤖 AI Study Lab & Assistant
*   **AI Study Lab:** A private space for students to use the **Explainer**, **Summarizer**, and **Flashcard Generator**.
*   **AI Assistant:** A teacher-facing tool to generate high-quality **Assignments** and **Quizzes** in seconds using Gemini AI.
*   **AI Study Buddy:** A persistent, context-aware chat assistant available in every classroom.

### 📚 Classroom Resource Library
*   A dedicated space for persistent learning materials.
*   Supports **PDFs, external links, and video URLs**.
*   Integrated with Cloudinary for secure file storage.

### 🔔 Real-time Engine
*   **Socket.io Integration:** Instant updates for grades, assignments, and attendance.
*   **Toast Alerts:** Real-time feedback via Sonner toasts with direct action links.
*   **Threaded Discussions:** A modern, social-media style feed for every classroom.

### 📅 Master Calendar
*   **Unified View:** Students see all their classes, deadlines, and live sessions in one color-coded calendar.
*   **Teacher Planner:** Teachers can manage individual sessions and view academic deadlines.

---

## 🛠️ Setup & Installation
```bash
npm install
# Create a .env file with VITE_API_URL=http://localhost:8000/api
npm run dev      # Start server on port 5173
```

---

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request.
