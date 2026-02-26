<div align="center">
  <img src="./public/tablawy.png" alt="Classroom Logo" width="150" />
  <h1>Frontend: Classroom Management System</h1>
</div>

This project contains the user interface for the classroom application, built with React, Refine, and Shadcn UI.

## 🚀 Tech Stack
*   **Framework:** React (Vite)
*   **Core Platform:** [Refine](https://refine.dev/) (v5)
*   **UI Library:** [shadcn/ui](https://ui.shadcn.com/) (Tailwind CSS v4)
*   **Charts:** [Recharts](https://recharts.org/)
*   **Real-time:** Socket.io-client
*   **AI:** Google Gemini API

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

<br />
<div align="center">
  <a href="https://ibrahim-tablawy-portfolio.vercel.app/">
    <img src="./public/tablawy.png" alt="Tablawy Signature" width="100" />
  </a>
</div>
