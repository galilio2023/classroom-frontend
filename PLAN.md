# 📝 Tablawy OS: Frontend Architecture & Comprehensive Plan

## 🎯 Goal
To build a modern, responsive, and AI-powered user interface for the Tablawy OS platform using React, Refine v5, and Shadcn UI. The frontend will provide a seamless, real-time, and engaging experience for students, teachers, and administrators, perfectly complementing the powerful backend.

---

## 🏗️ Component & Page Architecture

The frontend is structured by feature, with reusable components and page-level containers. All data fetching and state management are handled by **Refine hooks** to ensure consistency and predictability.

### Core Pages & Views

1.  **Login & Register (`/login`, `/register`)**
    *   Simple, clean forms for authentication.
    *   Uses Refine's `useLogin` hook, which calls our `authProvider` to handle the API request and session management.

2.  **Dashboard (`/`)**
    *   **Role-Based Rendering**: The main dashboard component checks the user's role (`useGetIdentity`) and renders the appropriate dashboard (`TeacherDashboard`, `StudentDashboard`, or `AdminDashboard`).
    *   **Teacher Dashboard**:
        *   `AtRiskStudents` component: Displays a list of students flagged by the backend's analytics engine (including **announcement engagement**).
        *   `PendingSubmissions` component: A list of ungraded assignments, fetched via a `useList` hook.
        *   `UpcomingClasses` component: A schedule of the day's classes.
    *   **Student Dashboard**:
        *   `AcademicJourney` component: Uses Recharts to visualize grade history and XP progression.
        *   `UnifiedCalendar` component: Displays a combined schedule of all enrolled classes.
    *   **Admin Dashboard**:
        *   `SystemAnalytics` component: Shows high-level stats like user count and class count.
        *   `TeacherVerificationQueue` component: A list of teachers with `isVerified: false` who have uploaded credentials.

3.  **Class Details (`/classes/show/:id`)**
    *   A tabbed interface to organize class-specific information.
    *   **Announcements Tab**:
        *   `AnnouncementItem`: Uses **Intersection Observer** to automatically mark announcements as read.
        *   `AnnouncementReadsModal`: (Teacher only) A modal to view the list of students who have read an announcement.
    *   **Modules Tab**: Renders a list of modules and their lesson notes.
    *   **Assignments Tab**: Lists all assignments, showing due dates and submission status.
    *   **Quizzes Tab**: Lists all quizzes, with links to take them (students) or view results (teachers).
    *   **Leaderboard Tab**: A real-time leaderboard of students ranked by XP.
    *   **Discussions Tab**: A real-time, threaded discussion feed powered by Socket.io.
    *   **Live Session Tab**:
        *   If a session is live, it embeds the **Jitsi Meet** component.
        *   If no session is live, it shows a countdown to the next session.
    *   **Members Tab**: (Teacher/Admin only) Lists all enrolled students with options to approve pending enrollments.

4.  **AI Tools**
    *   **AI Study Lab (`/ai-lab`)**: (Student) A dedicated page with three distinct tools:
        *   `Explainer`: A simple form that takes a topic and displays the AI-generated explanation.
        *   `Summarizer`: A textarea for pasting text to be summarized.
        *   `FlashcardGenerator`: Takes a topic or text and renders interactive, flippable flashcards.
    *   **Magic Builder (Modal)**: (Teacher) A multi-step modal form that calls the `/api/ai/magic-builder` endpoint. On success, it invalidates the class data to show the newly created content.

### Key Reusable Components

*   **`NotificationBell`**: Sits in the main header, listens for `notification:new` socket events, and displays an unread count.
*   **`XPProgressBar`**: A persistent UI element showing the user's current level and progress to the next level.
*   **`DataGrid` / `DataTable`**: A highly reusable component built on top of `tanstack-table` for displaying, sorting, and filtering lists of data (e.g., users, classes).
*   **`EmptyState`**: A generic component to show when a list is empty (e.g., "No assignments yet").
*   **`PageHeader`**: A consistent header for each page, displaying the title and any relevant actions (e.g., a "Create Class" button).

---

## 🔄 Data Flow & State Management

### 1. The Server State Cycle (via Refine)
1.  A component calls a Refine hook (e.g., `useList("classes")`).
2.  Refine calls the corresponding method in our `dataProvider` (e.g., `getList`).
3.  The `dataProvider` makes the `axios` request to the backend API (`GET /api/classes`).
4.  The response is cached by Refine (using TanStack Query).
5.  The data is returned to the component for rendering.

### 2. The Real-Time Invalidation Cycle
1.  The user performs an action (e.g., posts a message in a discussion).
2.  The backend processes the request and broadcasts a Socket.io event (e.g., `discussion:new`).
3.  Our global `socket` client receives the event.
4.  A listener calls Refine's `invalidate` function for the relevant resource (e.g., `invalidate({ resource: "discussions", ... })`).
5.  Refine automatically re-fetches the data for any component currently using that resource, ensuring the UI is always in sync.

### 3. The AI Interaction Cycle
1.  A user interacts with an AI feature (e.g., submits a topic to the Magic Builder).
2.  The component calls a `useCustom` hook, which makes a `POST` request to the relevant AI endpoint (e.g., `/api/ai/magic-builder`).
3.  A loading state is displayed in the UI.
4.  On success, the response data is either displayed directly (e.g., for the Explainer) or used to trigger a data invalidation (for the Magic Builder).

---

## ✅ Development & Feature Checklist

- [x] **Project Setup**: Initialized Vite + React project with TypeScript.
- [x] **Refine Integration**: Configured `Refine` component with `dataProvider`, `authProvider`, and `routerProvider`.
- [x] **UI Framework**: Integrated `shadcn/ui` and `Tailwind CSS`, including dark mode support.
- [x] **Authentication Flow**: Implemented login, registration, and session management pages and logic.
- [x] **Routing**: Defined all application routes using `react-router-dom`.
- [x] **Layout**: Created the main application layout (header, sider, content area).
- [x] **Dashboard Implementation**: Built all three role-based dashboards with their respective components.
- [x] **Class Management**: Implemented pages for listing, creating, and viewing class details.
- [x] **Content Views**: Built the UI for displaying modules, notes, assignments, and quizzes.
- [x] **Submission Flow**: Created the UI for students to submit assignments and for teachers to grade them.
- [x] **AI Tools UI**: Implemented the AI Study Lab and the Magic Builder modal.
- [x] **Jitsi Integration**: Embedded the Jitsi Meet client for live sessions.
- [x] **Gamification UI**: Implemented the XP/Level display, header progress bar, and class leaderboards.
- [x] **Socket.io Integration**: Set up the global socket client and real-time event listeners.
- [x] **Real-Time Invalidation**: Integrated socket events with Refine's invalidation system.
- [x] **Notification System**: Implemented the `NotificationBell` and `sonner` toast alerts for XP and Agent Alerts.
- [x] **Form Handling**: Used Refine's `useForm` for all creation and editing forms.
- [x] **Type Definitions**: Created comprehensive TypeScript types for all API resources.
- [x] **Responsiveness**: Ensured the entire application is usable on both desktop and mobile devices.
- [x] **Announcement System**: Implemented creation, read tracking (Intersection Observer), and teacher "Seen By" views.
- [x] **Cloudinary Security**: Implemented **Secure Signed Uploads** for all user-uploaded files.
- [x] **Stripe Integration**: Implemented checkout sessions, customer portal, and secure webhooks.
