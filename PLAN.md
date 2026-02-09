# 📝 Frontend Architecture & Plan

## 🎯 Goal
A modern, responsive user interface built with React, Refine, and Shadcn UI.

## 🧩 Component Architecture

### Pages & Views

1.  **Classes List (`/classes`)**
    *   **Component:** `src/pages/classes/list.tsx`
    *   **Features:** Lists all classes, filtering by subject/teacher.
    *   **Actions:** "View" button navigates to Class Details.

2.  **Class Details (`/classes/show/:id`)**
    *   **Component:** `src/pages/classes/show.tsx`
    *   **Features:**
        *   **Details Tab:** Shows class info.
        *   **Students Tab:** Lists enrolled students.
        *   **Assignments Tab:** Lists assignments (Teacher: Create/Edit, Student: View).

3.  **Assignment Details (`/assignments/show/:id`)**
    *   **Component:** `src/pages/assignments/show.tsx`
    *   **Features:**
        *   Displays assignment title, description, and due date.
        *   **Role-Based View:**
            *   **Student:** Shows `SubmissionForm` (if not submitted) or Grade/Feedback (if graded).
            *   **Teacher:** Shows `SubmissionList`.

### Key Components

*   **`AssignmentList`**: A "dumb" table component that displays assignments passed from the parent.
*   **`SubmissionList`**: A "dumb" table component for teachers to view student submissions.
*   **`SubmissionForm`**: A form for students to submit their work.
*   **`GradingDialog`**: A modal for teachers to grade a submission.

---

## 🔄 Data Flow & Cycle

### 1. The Assignment Cycle
1.  **Teacher** creates an assignment via `AssignmentCreate` page.
2.  **Student** navigates to `ClassShow` -> `AssignmentList` -> `AssignmentShow`.
3.  **Student** submits work via `SubmissionForm`.
    *   *Action:* `POST /api/submissions`
4.  **Teacher** navigates to `AssignmentShow` -> `SubmissionList`.
5.  **Teacher** opens `GradingDialog` and saves a grade.
    *   *Action:* `PATCH /api/submissions/:id`
6.  **Student** refreshes `AssignmentShow` and sees the grade/feedback.

### 2. Data Fetching Strategy (Refine v5)
*   **`useList` / `useShow`**: Used for fetching data.
    *   *Pattern:* Destructure `result` (data) and `query` (loading/error).
*   **`useTable` (Refine)**: Used **only** for top-level list pages that fetch their own data.
*   **`useReactTable` (TanStack)**: Used for child components (`AssignmentList`, `SubmissionList`) to display data passed via props without making API calls.

---

## ✅ Completed Features
- [x] Class Management UI
- [x] Assignment Creation UI
- [x] Student Submission UI
- [x] Teacher Grading UI
- [x] Role-Based Access Control (Frontend)
- [x] Real-time Data Updates (via React Query invalidation)
