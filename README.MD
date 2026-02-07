<div align="center" style="margin-bottom: 30px;">
    <a href="https://ibrahim-tablawy-portfolio.vercel.app/">
        <img alt="Author Avatar" 
             src="https://avatars.githubusercontent.com/u/110768301?s=400&u=a6d45b9eeaa2b43332f9159614997f2d5d746c5a&v=4" 
             style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 15px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
    </a>
    <h1 align="center">Classroom Frontend</h1>
    <p align="center">
      The modern UI for the Classroom Management System.
      <br />
      <a href="https://github.com/galilio2023/classroom-frontend/issues">Report Bug</a>
      ·
      <a href="https://github.com/galilio2023/classroom-frontend/issues">Request Feature</a>
    </p>
    <p align="center">
      <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
      <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
      <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
    </p>
</div>

---

## 📖 1. About The Project

This project is the frontend interface for the Classroom Management System. It is a **data-intensive application** built on the **Refine** meta-framework, designed to provide a seamless and efficient user experience for managing subjects, departments, users, and classes.

The core philosophy is to separate the **UI** (how things look) from the **Data Logic** (how things are fetched). Refine handles the heavy lifting of state management, routing, and networking, allowing us to focus on building a beautiful and responsive interface with **Shadcn/ui**.

---

## 🏗️ 2. Implementation Plan

We built the application in a logical, phased approach to ensure a solid foundation.

### Phase 1: Core Academic Structure
*   **Goal:** Establish the fundamental hierarchy of the school.
*   **Implementation:** Built full CRUD functionality for **Departments** and **Subjects**.

### Phase 2: User Management
*   **Goal:** Manage all people in the system.
*   **Implementation:** Built full CRUD for **Users**, with a `role` field to distinguish between Admins, Teachers, and Students. This includes role-based filtering on the list page.

### Phase 3: The Classroom Engine
*   **Goal:** Connect Subjects and Teachers to create actual Classes.
*   **Implementation:** Built full CRUD for **Classes**, featuring:
    *   Dropdowns for Subjects and Teachers (filtered by role).
    *   A dynamic **Schedule Builder** using `react-hook-form`'s `useFieldArray`.
    *   Auto-generated invite codes for students.

---

## 🛠️ 3. Tech Stack

This project leverages a modern, type-safe, and performant tech stack:

*   **Framework:** [React](https://react.dev/) (v19)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Meta-Framework:** [Refine](https://refine.dev/)
*   **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
*   **Routing:** [React Router](https://reactrouter.com/)
*   **HTTP Client:** [Axios](https://axios-http.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Form Management:** [React Hook Form](https://react-hook-form.com/) (including `useFieldArray`) & [Zod](https://zod.dev/)

---

## 📂 4. Architecture & Key Files

The project is organized for scalability and maintainability. Here are the critical files and their roles:

<details>
  <summary><strong><code>src/providers/data.ts</code> (The Data Bridge)</strong></summary>
  <br />
  <ul>
    <li><strong>Purpose:</strong> This is the "brain" that connects Refine to our specific Backend API.</li>
    <li><strong>Implementation:</strong> We extended the official <code>@refinedev/simple-rest</code> provider.</li>
    <li><strong>Customization:</strong> We overrode the <code>getList</code> method to handle our backend's specific response format (nested <code>data</code> array and <code>pagination</code> object) and to correctly map search filters to query parameters.</li>
  </ul>
</details>

<details>
  <summary><strong><code>src/schemas/</code> (The Validation Hub)</strong></summary>
  <br />
  <ul>
    <li><strong>Purpose:</strong> Centralizes all Zod validation schemas (e.g., <code>department.ts</code>, <code>user.ts</code>, <code>class.ts</code>).</li>
    <li><strong>Why:</strong> Ensures that Create and Edit forms use the exact same validation rules, preventing code duplication.</li>
  </ul>
</details>

<details>
  <summary><strong><code>src/components/refine-ui/data-table/row-actions.tsx</code> (The Reusable Action Menu)</strong></summary>
  <br />
  <ul>
    <li><strong>Purpose:</strong> A reusable component for the three-dot "Actions" menu (Edit/Delete) in data tables.</li>
    <li><strong>Why:</strong> Ensures a consistent look and feel across all list pages and makes it easy to add new actions (like "View") in one place.</li>
  </ul>
</details>

---

## 🔄 5. The Data Cycle: How It Works

Understanding the flow of data is key to mastering this project. Here is exactly what happens when a user interacts with the application.

<details>
  <summary><strong>Scenario: A User Creates a Class</strong></summary>
  <br />
  <ol>
    <li><strong>User Action:</strong> The user navigates to <code>/classes/create</code>.</li>
    <li><strong>Data Fetching (<code>create.tsx</code>):</strong>
        <ul>
            <li>The <code>useSelect</code> hook for "Subject" calls the Data Provider to fetch from the <code>subjects</code> resource (<code>GET /api/subjects</code>).</li>
            <li>The <code>useSelect</code> hook for "Teacher" calls the Data Provider to fetch from the <code>users</code> resource with a filter (<code>GET /api/users?role=teacher</code>).</li>
            <li>The dropdowns are populated with the results.</li>
        </ul>
    </li>
    <li><strong>User Input:</strong> The user fills out the form, including adding schedule slots via the <code>useFieldArray</code>-powered UI.</li>
    <li><strong>Form Submission:</strong> The user clicks "Create Class".
        <ul>
            <li>The <code>onSubmit</code> handler calls <code>onFinish</code> (from Refine's <code>useForm</code>).</li>
            <li><code>react-hook-form</code> validates the data against the Zod schema (<code>classFormSchema</code>).</li>
        </ul>
    </li>
    <li><strong>Refine Hook Action:</strong>
        <ul>
            <li>Refine's <code>useForm</code> hook calls the <code>create</code> method of our <code>dataProvider</code>.</li>
        </ul>
    </li>
    <li><strong>Data Provider Logic (<code>data.ts</code>):</strong>
        <ul>
            <li>Our provider knows that a "create" operation corresponds to a <code>POST</code> request.</li>
            <li>It uses <strong>Axios</strong> to send a <code>POST</code> request.</li>
        </ul>
    </li>
    <li><strong>Network Request:</strong>
        <ul>
            <li><strong>URL:</strong> <code>http://localhost:8000/api/classes</code></li>
            <li><strong>Method:</strong> <code>POST</code></li>
            <li><strong>Body:</strong> <code>{ name: "...", subjectId: 5, teacherId: "uuid-123", schedules: [...] }</code></li>
        </ul>
    </li>
    <li><strong>Backend Processing:</strong> The backend receives the request, validates the data, auto-generates an invite code, and inserts the new class into the database.</li>
    <li><strong>UI Update:</strong>
        <ul>
            <li>The <code>useForm</code> hook receives the successful response.</li>
            <li>It automatically redirects the user to the <code>/classes</code> list page, where the new class is now visible.</li>
        </ul>
    </li>
  </ol>
</details>

---

## 🚀 6. Getting Started

### Prerequisites
*   Node.js (v18+)
*   The **Classroom Backend** running on port 8000.

### Installation
```bash
git clone https://github.com/galilio2023/classroom-frontend.git
cd classroom-frontend
npm install
```

### Environment Setup
Create a `.env.development` file in the root directory:
```env
# Point this to your local backend
VITE_API_URL="http://localhost:8000/api"

# Placeholders for future features
VITE_ACCESS_TOKEN_KEY="access_token"
VITE_REFRESH_TOKEN_KEY="refresh_token"
VITE_CLOUDINARY_UPLOAD_URL="https://api.cloudinary.com/v1_1/placeholder/image/upload"
VITE_CLOUDINARY_CLOUD_NAME="placeholder"
VITE_CLOUDINARY_UPLOAD_PRESET="placeholder"
```

### Running the App
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## ✅ 7. Implemented Features

- [x] **Dashboard:** A welcoming landing page with quick action cards.
- [x] **Subjects CRUD:** Full create, read, update, and delete functionality.
- [x] **Departments CRUD:** Full create, read, update, and delete functionality.
- [x] **Users CRUD:** Full create, read, update, and delete functionality for Admins, Teachers, and Students.
- [x] **Classes CRUD:** Full create, read, update, and delete functionality, including a dynamic schedule builder.
- [x] **Data Architecture:**
    - [x] Fully typed with TypeScript.
    - [x] Centralized configuration.
    *   [x] Shared Zod schemas for validation.
    *   [x] Reusable components for common UI patterns (e.g., table actions).
    - [x] Custom Data Provider for seamless API integration.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

<br />
<div align="center">
  <a href="https://ibrahim-tablawy-portfolio.vercel.app/">
    <img src="./public/tablawy.png" alt="Tablawy Signature" width="200" />
  </a>
</div>
