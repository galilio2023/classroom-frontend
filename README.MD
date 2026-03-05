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
*   **Teacher Insights:** Automated **At-Risk Student Detection**. Flags students with low average grades (<60%) or high absences (>3) for immediate intervention.
*   **Student Portfolio:** **Academic Journey** visualization. Includes a **Progress Line Chart** for grades and a **Subject Mastery Radar Chart** to track strengths across the curriculum.

### 📚 Classroom Resource Library
*   A dedicated space for persistent learning materials.
*   Supports **PDFs, external links, and video URLs**.
*   Integrated with Cloudinary for secure file storage.

### ⏰ Automated Deadline Enforcement
*   Submissions are automatically analyzed against assignment due dates.
*   **Late Badges** are displayed to teachers for any work submitted past the deadline.

### 🔔 Real-time Notifications
*   **Socket.io Integration:** Instant updates for grades, assignments, and attendance.
*   **Toast Alerts:** Real-time feedback via Sonner toasts with direct action links.

### 💬 Class Discussions
*   **Threaded Feed:** A modern, social-media style feed for every classroom.
*   **Nested Replies:** Support for deep conversations and teacher-student interaction.

### 🤖 AI Magic Builder
*   **One-Click Curriculum:** Generate entire lesson plans, quizzes, and assignments from a single prompt.
*   **AI Study Buddy:** A persistent chat assistant for students, context-aware of class materials.

### 📅 Master Calendar
*   **Unified View:** Students see all their classes in one color-coded calendar.
*   **Teacher Planner:** Teachers can generate monthly schedules and manage individual sessions.

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
