# 📝 Frontend Architecture & Plan

## 🎯 Goal
A modern, responsive, and AI-powered educational platform built with React, Refine, and Shadcn UI.

## 🧩 Component Architecture

### Pages & Views

1.  **Dashboard (`/`)**
    *   **Dual-Speed Data Fetching:** Optimized loading with "Fast" (Schedule) and "Slow" (Analytics) data streams.
    *   **Teacher Insights:** **At-Risk Students** detection (low grades/high absences) and **Grade Distribution** charts.
    *   **Student Insights:** **Academic Journey** (Progress trends) and **Subject Mastery** (Radar charts).
    *   **Real-time Updates:** Socket.io integration for instant dashboard refreshes on notifications.

2.  **Class Details (`/classes/show/:id`)**
    *   **Curriculum Tab:** Organized view of modules and lessons.
    *   **Live Tab:** Integrated **Jitsi Meet** for virtual classrooms with **Auto-Attendance**.
    *   **Leaderboard Tab:** Gamified experience with **XP and Leveling** system.
    *   **Analytics Tab:** (Staff only) Deep dive into class performance and at-risk detection.
    *   **Discussions Tab:** Real-time class feed with threaded replies.
    *   **Resources Tab:** Library for PDFs, Links, and Videos with Cloudinary integration.
    *   **Attendance Tab:** QR-based and manual attendance tracking.
    *   **AI Study Buddy:** Persistent, context-aware chat assistant for every class.

3.  **AI Study Lab (`/ai-study-lab`)**
    *   **Explainer:** Simplifies complex topics using Gemini AI.
    *   **Summarizer:** Converts long notes into concise bullet points.
    *   **Flashcards:** Generates interactive study cards for active recall.
    *   **Practice Quiz:** Private AI-generated quizzes for self-testing.

4.  **AI Assistant (`/ai-assistant`)**
    *   **Assignment Helper:** AI-powered creation of assignment descriptions and rubrics.
    *   **Quiz Generator:** Instant generation of full quizzes from topics or materials.

### Key Components

*   **`StudentAcademicJourney`**: Advanced data visualization using Recharts.
*   **`AtRiskStudents`**: High-priority alert system for teachers.
*   **`LiveClassroom`**: Jitsi Meet wrapper with session management.
*   **`FlashcardPlayer`**: Interactive UI for AI-generated flashcards.
*   **`NotificationBell`**: Real-time Socket.io integration with Sonner toasts.

---

## 🔄 Data Flow & Cycle

### 1. The Analytics Cycle
1.  **Backend** aggregates raw grades, attendance, and activity logs.
2.  **Frontend** receives unified dashboard data via `useCustom` hooks.
3.  **Recharts** transforms raw numbers into visual trends (Line, Radar, Bar charts).

### 2. The Gamification Cycle
1.  **Student** completes assignments, attends live classes, or passes quizzes.
2.  **Backend** awards XP based on activity type.
3.  **Frontend** calculates levels and updates the **Leaderboard** in real-time.

### 3. The AI Content Cycle
1.  **Teacher/Student** provides a prompt or context.
2.  **Gemini AI** processes the request via the backend proxy.
3.  **Frontend** renders the result (Markdown, Flashcards, or Quiz questions).

---

## ✅ Completed Features
- [x] **Unified Dashboard**: Optimized dual-speed data fetching.
- [x] **Deep Insights**: At-Risk detection and Academic Journey charts.
- [x] **Live Classroom**: Jitsi integration with automatic attendance.
- [x] **Gamification**: XP system, Leveling logic, and Class Leaderboards.
- [x] **AI Study Lab**: Explainer, Summarizer, and Flashcard generator.
- [x] **AI Assistant**: Assignment and Quiz generation tools.
- [x] **Resource Library**: Cloudinary-backed file and link management.
- [x] **Real-time Notifications**: Socket.io integration with toast alerts.
- [x] **Threaded Discussions**: Social-style feed for every classroom.
- [x] **Master Calendar**: Unified view of all academic deadlines and sessions.
- [x] **Verification Guard**: Secure onboarding for teachers and students.
