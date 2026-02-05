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

This project is the frontend interface for the Classroom Management System. It is a **data-intensive application** built on the **Refine** meta-framework, designed to provide a seamless and efficient user experience for managing subjects, departments, and more.

The core philosophy is to separate the **UI** (how things look) from the **Data Logic** (how things are fetched). Refine handles the heavy lifting of state management, routing, and networking, allowing us to focus on building a beautiful and responsive interface with **Shadcn/ui**.

---

## 🛠️ 2. Tech Stack

This project leverages a modern, type-safe, and performant tech stack:

*   **Framework:** [React](https://react.dev/) (v19)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Meta-Framework:** [Refine](https://refine.dev/)
*   **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
*   **Routing:** [React Router](https://reactrouter.com/)
*   **HTTP Client:** [Axios](https://axios-http.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Form Management:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

---

## 📂 3. Architecture & Key Files

The project is organized for scalability and maintainability. Here are the critical files and their roles:

<details>
  <summary><strong><code>src/config.ts</code> (The Configuration Hub)</strong></summary>
  <br />
  <ul>
    <li><strong>Purpose:</strong> Centralizes all environment-dependent variables (like the API URL and Cloudinary keys).</li>
    <li><strong>Why:</strong> It ensures we have a single source of truth for configuration and prevents the app from running if critical variables are missing.</li>
  </ul>
</details>

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
  <summary><strong><code>src/types/index.ts</code> (The Contract)</strong></summary>
  <br />
  <ul>
    <li><strong>Purpose:</strong> Defines the TypeScript types for our data models (e.g., <code>Subject</code>, <code>Department</code>).</li>
    <li><strong>Why:</strong> It ensures our frontend code perfectly matches the shape of the data coming from the backend, preventing bugs and enabling autocomplete.</li>
  </ul>
</details>

<details>
  <summary><strong><code>src/pages/subjects/</code> (The Feature Module)</strong></summary>
  <br />
  <ul>
    <li><strong><code>list.tsx</code></strong>: The main page for displaying the list of subjects. Implements the data table, search, filtering, and the actions menu (Edit/Delete).</li>
    <li><strong><code>create.tsx</code></strong>: A polished, two-column form for creating new subjects with live department data and Zod validation.</li>
    <li><strong><code>edit.tsx</code></strong>: A consistent two-column form for editing existing subjects.</li>
  </ul>
</details>

---

## 🔄 4. The Data Cycle: How It Works

Understanding the flow of data is key to mastering this project. Here is exactly what happens when a user interacts with the application.

<details>
  <summary><strong>Scenario: A User Deletes a Subject</strong></summary>
  <br />
  <ol>
    <li><strong>User Action:</strong> The user clicks the three-dots menu on a subject row and then clicks the "Delete Subject" menu item.</li>
    <li><strong>State Update (<code>list.tsx</code>):</strong>
        <ul>
            <li>The <code>onClick</code> handler calls <code>setDeleteTarget(subject.id)</code>.</li>
            <li>This state change causes the <code>&lt;AlertDialog&gt;</code> component to become visible.</li>
        </ul>
    </li>
    <li><strong>User Confirmation:</strong> The user sees the confirmation modal ("Are you absolutely sure?") and clicks the "Confirm" button.</li>
    <li><strong>Mutation Trigger:</strong>
        <ul>
            <li>The "Confirm" button's <code>onClick</code> handler calls <code>handleConfirmDelete</code>.</li>
            <li>This function calls <code>deleteMutation({ resource: "subjects", id: ... })</code>.</li>
        </ul>
    </li>
    <li><strong>Refine Hook Action:</strong>
        <ul>
            <li>The <code>useDelete</code> hook (which provided the <code>deleteMutation</code> function) takes over.</li>
            <li>It calls the <code>deleteOne</code> method of our <code>dataProvider</code>.</li>
        </ul>
    </li>
    <li><strong>Data Provider Logic (<code>data.ts</code>):</strong>
        <ul>
            <li>Our provider uses the default <code>deleteOne</code> method from <code>@refinedev/simple-rest</code>.</li>
            <li>This method knows that a "delete" operation corresponds to a <code>DELETE</code> request.</li>
            <li>It uses <strong>Axios</strong> to send a <code>DELETE</code> request.</li>
        </ul>
    </li>
    <li><strong>Network Request:</strong>
        <ul>
            <li><strong>URL:</strong> <code>http://localhost:8000/api/subjects/123</code> (where 123 is the subject ID).</li>
            <li><strong>Method:</strong> <code>DELETE</code></li>
        </ul>
    </li>
    <li><strong>Backend Processing:</strong> The backend receives the request, executes the SQL <code>DELETE</code> statement, and returns a success message.</li>
    <li><strong>UI Update:</strong>
        <ul>
            <li>The <code>useDelete</code> hook receives the successful response.</li>
            <li>It automatically triggers a <strong>refetch</strong> of the data for the subjects list.</li>
            <li>The <code>useTable</code> hook gets the new, updated list, and the UI re-renders to show the change.</li>
        </ul>
    </li>
  </ol>
</details>

---

## 🚀 5. Getting Started

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

## ✅ 6. Implemented Features

- [x] **Full Subject CRUD:**
    - [x] **List View:** View all subjects in a paginated table.
    - [x] **Search:** Filter subjects by Name or Code.
    - [x] **Department Filter:** Filter subjects by their associated Department (fetched live from the API).
    - [x] **Create:** Add new subjects via a polished, two-column form with Zod validation.
    - [x] **Edit:** Update existing subjects with a consistent form design.
    - [x] **Delete:** Remove subjects with a beautiful, custom confirmation modal.
- [x] **Data Architecture:**
    - [x] Fully typed with TypeScript.
    - [x] Centralized configuration.
    - [x] Custom Data Provider for seamless API integration.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

<br />
<div align="center">
  <a href="https://ibrahim-tablawy-portfolio.vercel.app/">
    <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer&text=Tablawy&fontSize=50&fontColor=ffffff&fontAlign=50" alt="Tablawy Signature" width="100%" />
  </a>
</div>
