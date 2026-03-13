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
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
</div>

---

## 📖 Table of Contents
1.  [Architectural Blueprint](#-architectural-blueprint-the-headless-revolution)
2.  [Key Features Implemented](#-key-features-implemented)
3.  [The "Teacher TV" Discovery Engine](#-the-teacher-tv-discovery-engine)
4.  [Real-Time Integration](#-real-time-integration)
5.  [Setup & Installation](#-setup--installation)
6.  [Project Structure](#-project-structure)

---

## 🏗️ Architectural Blueprint: The "Headless" Revolution

We chose a **Headless Architecture** powered by **Refine v5**. This approach decouples the UI from the backend, allowing us to build a pixel-perfect, custom interface without being locked into a traditional admin panel framework.

*   **Data Provider (`src/providers/data.ts`)**: Maps Refine's operations to our specific backend REST and custom endpoints.
*   **Logic Layer (Refine Hooks)**: Manages all server state, including caching, optimistic updates, and real-time invalidation.
*   **UI Layer**: Built with **shadcn/ui** and **Tailwind CSS** for maximum flexibility and accessibility.

---

## ✨ Key Features Implemented

### 📺 Teacher Discovery Engine (Teacher TV)
*   **Netflix-Style Catalog**: A high-end horizontal carousel featuring teacher promotions.
*   **Cinematic Auto-Play**: Hovering over a teacher card triggers a smooth video trailer preview.
*   **Trending Algorithm**: Displays teachers ranked by a weighted score of views and conversion rates.
*   **Conversion Funnel**: Integrated buttons to view teacher profiles and enroll directly into their available classes.

### 🤖 AI-Powered Tools
*   **Magic Builder**: One-click generation of course modules, notes, and assignments.
*   **AI Grading Agent**: Proactive grading suggestions and feedback for student submissions.
*   **AI Study Buddy**: Context-aware persistent chat panel inside every classroom.
*   **AI Study Lab**: Personalized learning tools including a Concept Explainer and Flashcard Generator.

### 🎥 Live Classroom & Engagement
*   **Jitsi Meet Integration**: Fully embedded virtual classrooms.
*   **QR Attendance**: Real-time presence tracking via dynamic QR codes.
*   **Real-time Notifications**: Instant updates for grades, announcements, and live sessions.

---

## 📺 The "Teacher TV" Discovery Engine

Designed to boost platform engagement, the Discovery Engine provides:
1.  **Immersive Browsing**: High-performance video trailer rendering using Framer Motion.
2.  **Smart Performance**: Optimized Redis-backed view tracking prevents backend lag during high-traffic browsing sessions.
3.  **Visual Polish**: Staggered entry animations and smooth layout transitions for a "billion-dollar app" feel.

---

## ⚡ Real-Time Integration

The frontend is connected to the backend's **Socket.io** server to create a live, interactive experience.
*   **Live Invalidation**: Relevant components re-fetch data instantly when backend state changes (e.g., a new discussion post or a live session start).
*   **Live Toasts**: Immediate actionable feedback for users.

---

## 🛠️ Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/galilio2023/classroom-frontend.git
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Setup (.env.local):**
    ```
    VITE_API_URL=http://localhost:8000/api
    VITE_SOCKET_URL=http://localhost:8000
    ```
4.  **Run:**
    ```bash
    npm run dev
    ```

---

## 📁 Project Structure
```
/
├── src/
│   ├── components/          # UI components (Shadcn + Framer Motion)
│   │   ├── classes/         # Classroom-specific tools (e.g., DiscoveryList)
│   │   └── layout/          # Sidebar, Header, etc.
│   ├── pages/               # Top-level routes
│   ├── providers/           # Refine's Auth and Data Providers
│   ├── types/               # TypeScript definitions
│   └── App.tsx              # Main application router
```
