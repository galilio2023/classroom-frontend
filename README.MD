<div align="center">
  <h1 style="font-size: 2.5em; font-weight: bold; margin-bottom: 5px;">Frontend: Tablawy OS Platform</h1>
  <p style="font-size: 1.1em; color: #555;">
    The modern, responsive, and AI-powered user interface for the Tablawy OS learning ecosystem.
  </p>
</div>

<div align="center" style="margin-top: 20px; margin-bottom: 20px;">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/refine-1890FF?style=for-the-badge&logo=refine&logoColor=white" alt="Refine" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="Shadcn UI" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
</div>

---

## 📖 Table of Contents
1.  [Architectural Blueprint](#-architectural-blueprint-the-headless-revolution)
2.  [Key Features Implemented](#-key-features-implemented)
3.  [Real-Time Integration](#-real-time-integration)
4.  [Gamification & XP UI](#-gamification--xp-ui)
5.  [Setup & Installation](#-setup--installation)
6.  [Project Structure](#-project-structure)

---

## 🏗️ Architectural Blueprint: The "Headless" Revolution

We chose a **Headless Architecture** powered by **Refine v5** to achieve maximum design flexibility and development speed. This approach decouples the UI from the backend, allowing us to build a pixel-perfect, custom interface without being locked into a traditional admin panel framework.

### The Layers

*   **Data Provider (`src/providers/dataProvider.ts`)**: The **Translator**. This is the core of our headless setup. It maps Refine's data operations (`getList`, `create`, `update`) to our specific backend API endpoints and data structures. It handles all API communication, including adding authentication tokens and normalizing responses.
*   **Auth Provider (`src/providers/authProvider.ts`)**: The **Gatekeeper**. It manages the entire authentication lifecycle, including login, logout, checking for active sessions, and retrieving user permissions. It integrates seamlessly with the Data Provider to secure all API requests.
*   **Logic Layer (Refine Hooks)**: The **Brain**. We leverage Refine's comprehensive suite of hooks (`useList`, `useForm`, `useOne`, `useCustom`) to manage all server state, including caching, optimistic updates, and real-time invalidation. We **never** write raw `fetch` or `axios` calls directly in our UI components.
*   **UI Layer (`src/components/` & `src/pages/`)**: The **Face**. We use **shadcn/ui** for its accessible, unstyled component primitives, which we then style with **Tailwind CSS**. This gives us complete control over our design system, enabling a unique look and feel, dark mode, and fluid animations.

---

## ✨ Key Features Implemented

### 📊 Role-Based Dashboards
*   **Teacher Dashboard**: Features automated **At-Risk Student Detection**, a list of pending submissions, and a schedule of upcoming classes.
*   **Student Dashboard**: Showcases an **Academic Journey** view with grade trends, XP progression, and a unified calendar of all enrolled classes.
*   **Admin Dashboard**: Provides system-wide analytics, user management tools, and a teacher verification queue.

### 🤖 AI-Powered Tools
*   **Magic Builder (for Teachers)**: A modal-based workflow where teachers can input a topic and generate a complete module, notes, assignment, and quiz with a single click.
*   **AI Grading Agent (for Teachers)**: When a teacher opens the grading view for a submission, a real-time **Agent Alert** (a toast notification) pops up with a `suggestedGrade` and `suggestedFeedback`.
*   **AI Study Buddy (for Students)**: A persistent, slide-out chat panel available in every classroom, with full chat history.
*   **AI Study Lab (for Students)**: A dedicated page with three tools: an **Explainer** for complex topics, a **Summarizer** for text, and a **Flashcard Generator**.

### 📢 Announcements & Engagement
*   **Announcement Tracking**: Students' "Read" status is updated automatically via **Intersection Observer** as they scroll past announcements.
*   **Teacher "Seen By" View**: Teachers can click an "Eye" icon on any announcement to see a real-time list of students who have read it.

### 🎥 Live Classroom & Attendance
*   **Jitsi Meet Integration:** A fully embedded virtual classroom experience launched directly from the class page.
*   **Real-time Status Indicators:** UI elements across the app (e.g., on class cards) show a "Live" badge when a session is active.
*   **QR Code Attendance:** Teachers can launch a full-screen QR code; students scan this with their device to be marked as present, with the teacher's view updating in real-time.

### 🏆 Gamification & Engagement
*   **XP & Level Display:** The user's current Level and XP are prominently displayed in the header and on their profile.
*   **Class Leaderboards:** A dedicated tab in each class showing a real-time ranked list of students by XP.

---

## ⚡ Real-Time Integration

The frontend is connected to the backend's **Socket.io** server to create a live, interactive experience.

*   **Global Socket Client (`src/socket.ts`)**: A single, memoized Socket.io client is initialized and used throughout the application.
*   **Real-time Hooks (`src/hooks/useSocket.ts`)**: A custom hook simplifies subscribing to and handling real-time events within components.
*   **Refine Invalidation**: When a relevant event is received (e.g., `discussion:new`), we call Refine's `invalidate` function. This intelligently re-fetches only the necessary data, keeping the UI perfectly in sync with the backend state.
*   **Live Toasts (`sonner`)**: We use toast notifications to provide immediate, actionable feedback for events like `notification:new` and `agent:alert`.

---

## 🛠️ Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/galilio2023/classroom-frontend.git
    cd classroom-frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env.local` file** in the root directory and add the following variables, pointing to your backend API and WebSocket URLs:
    ```
    VITE_API_URL=http://localhost:8000/api
    VITE_SOCKET_URL=http://localhost:8000
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

---

## 📁 Project Structure
```
/
├── src/
│   ├── components/          # Reusable UI components (built with Shadcn)
│   │   ├── common/          # General-purpose components (e.g., Empty, Loader)
│   │   └── layout/          # Main layout components (Header, Sider)
│   ├── config/              # Application configuration (e.g., constants)
│   ├── hooks/               # Custom React hooks (e.g., useSocket)
│   ├── lib/                 # Utility functions and library initializations (e.g., axios)
│   ├── pages/               # Top-level page components, organized by resource
│   ├── providers/           # Refine's Auth and Data Providers
│   ├── socket/              # Socket.io client setup and event handlers
│   ├── types/               # Global TypeScript type definitions
│   ├── App.tsx              # Main application component with Refine router
│   └── main.tsx             # Application entry point
├── .env.local.example       # Example environment file
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite build configuration
```
