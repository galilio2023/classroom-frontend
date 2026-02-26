# 📝 Frontend Architecture & Plan

## 🎯 Goal
A modern, responsive user interface built with React, Refine, and Shadcn UI.

## 🧩 Component Architecture

### Pages & Views

1.  **Dashboard (`/`)**
    *   **Teacher Insights:** **At-Risk Students** card (flags students needing help).
    *   **Student Insights:** **Academic Journey** (Line charts for grades, Radar charts for mastery).
    *   **Common:** Unified 6-in-1 data fetching for maximum performance.

2.  **Class Details (`/classes/show/:id`)**
    *   **Discussions Tab:** Real-time class feed with threaded replies.
    *   **Resources Tab:** **New!** Library for PDFs, Links, and Videos.
    *   **Attendance Tab:** Full UI for marking and tracking.
    *   **AI Quiz Tab:** Instant interactive quiz generation.

3.  **Assignment Details (`/assignments/show/:id`)**
    *   **Teacher View:** Submission list with **Automated Late Badges**.
    *   **Student View:** Submission form with AI helper.

### Key Components

*   **`StudentAcademicJourney`**: Advanced data visualization using Recharts.
*   **`AtRiskStudents`**: High-priority alert component for teachers.
*   **`ResourceTab`**: File management and link sharing UI.
*   **`NotificationBell`**: Real-time Socket.io integration with Sonner toasts.

---

## 🔄 Data Flow & Cycle

### 1. The Analytics Cycle
1.  **Backend** aggregates raw grades and attendance.
2.  **Frontend** receives unified dashboard data.
3.  **Recharts** transforms raw numbers into visual trends (Line/Radar).

### 2. The Resource Cycle
1.  **Teacher** uploads a file to Cloudinary via `ResourceTab`.
2.  **Backend** stores the URL and metadata in the `resources` table.
3.  **Students** instantly see the new material in their library.

---

## ✅ Completed Features
- [x] **Unified Dashboard**: Optimized 6-in-1 data fetching.
- [x] **Deep Insights**: At-Risk detection and Academic Journey charts.
- [x] **Resource Library**: Full UI for persistent class materials.
- [x] **Real-time Notifications**: Socket.io integration with toast alerts.
- [x] **Threaded Discussions**: Full UI for class-wide communication.
- [x] **Automated Late Badges**: Visual indicators for overdue work.
- [x] **AI Assistant**: Study Buddy and Quiz Generator.
