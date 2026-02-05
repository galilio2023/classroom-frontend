# Classroom Frontend: A Deep Dive

<div align="center" style="margin: 30px 0;">
    <a href="https://ibrahim-tablawy-portfolio.vercel.app/">
        <img alt="Author Avatar" 
             src="https://avatars.githubusercontent.com/u/110768301?s=400&u=d419091187e0ac09e080581ea5b3096623df8beb&v=4" 
             style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    </a>
    <h3 align="center">Modern UI for Classroom Management</h3>
    <p align="center">
        Built with <b>React</b>, <b>Vite</b>, <b>Refine</b>, and <b>Shadcn/ui</b>.
    </p>
</div>

---

## 📖 1. Overview & Core Concepts

This project is the frontend interface for the Classroom Management System. It is a **data-intensive application** built on the **Refine** meta-framework.

The core philosophy is to separate the **UI** (how things look) from the **Data Logic** (how things are fetched). Refine handles the heavy lifting of state management, routing, and networking, allowing us to focus on building a beautiful and responsive interface with **Shadcn/ui**.

---

## 🛠️ 2. Tech Stack

*   **Framework:** [React](https://react.dev/) (v19)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Meta-Framework:** [Refine](https://refine.dev/)
*   **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
*   **Routing:** [React Router](https://reactrouter.com/)
*   **HTTP Client:** [Axios](https://axios-http.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Form Management:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

---

## 📂 3. Project Structure & Key Files

We have organized the project to be scalable and maintainable. Here are the critical files we have implemented:

### `src/config.ts` (The Configuration Hub)
*   **Purpose:** Centralizes all environment-dependent variables (like the API URL and Cloudinary keys).
*   **Why:** It ensures we have a single source of truth for configuration and prevents the app from running if critical variables are missing.

### `src/providers/data.ts` (The Data Bridge)
*   **Purpose:** This is the "brain" that connects Refine to our specific Backend API.
*   **Implementation:** We extended the official `@refinedev/simple-rest` provider.
*   **Customization:** We overrode the `getList` method to handle our backend's specific response format (nested `data` array and `pagination` object) and to correctly map search filters to query parameters.

### `src/types/index.ts` (The Contract)
*   **Purpose:** Defines the TypeScript types for our data models (e.g., `Subject`, `Department`).
*   **Why:** It ensures our frontend code perfectly matches the shape of the data coming from the backend, preventing bugs and enabling autocomplete.

### `src/pages/subjects/` (The Feature Module)
*   **`list.tsx`**: The main page for displaying the list of subjects. Implements the data table, search, filtering, and the actions menu (Edit/Delete).
*   **`create.tsx`**: A polished, two-column form for creating new subjects with live department data and Zod validation.
*   **`edit.tsx`**: A consistent two-column form for editing existing subjects.

---

## 🔄 4. The Data Cycle: How It Works

Understanding the flow of data is key to mastering this project. Here is exactly what happens when a user interacts with the application.

### Scenario: A User Deletes a Subject

1.  **User Action:** The user clicks the three-dots menu on a subject row and then clicks the "Delete Subject" menu item.
2.  **State Update (`list.tsx`):**
    *   The `onClick` handler calls `setDeleteTarget(subject.id)`.
    *   This state change causes the `<AlertDialog>` component to become visible.
3.  **User Confirmation:** The user sees the confirmation modal ("Are you absolutely sure?") and clicks the "Confirm" button.
4.  **Mutation Trigger:**
    *   The "Confirm" button's `onClick` handler calls `handleConfirmDelete`.
    *   This function calls `deleteMutation({ resource: "subjects", id: ... })`.
5.  **Refine Hook Action:**
    *   The `useDelete` hook (which provided the `deleteMutation` function) takes over.
    *   It calls the `deleteOne` method of our `dataProvider`.
6.  **Data Provider Logic (`data.ts`):**
    *   Our provider uses the default `deleteOne` method from `@refinedev/simple-rest`.
    *   This method knows that a "delete" operation corresponds to a `DELETE` request.
    *   It uses **Axios** to send a `DELETE` request.
7.  **Network Request:**
    *   **URL:** `http://localhost:8000/api/subjects/123` (where 123 is the subject ID).
    *   **Method:** `DELETE`
8.  **Backend Processing:**
    *   The backend receives the request and routes it to the `DELETE /:id` handler.
    *   It executes the Drizzle `db.delete()` command, which generates and runs the `DELETE FROM subjects WHERE id = 123` SQL statement.
    *   The backend returns a success message.
9.  **UI Update:**
    *   The `useDelete` hook receives the successful response.
    *   It automatically triggers a **refetch** of the data for the subjects list.
    *   The `useTable` hook gets the new, updated list (which no longer contains the deleted subject), and the UI re-renders to show the change.

---

## 🚀 5. Getting Started

### Prerequisites
*   Node.js (v18+)
*   The **Classroom Backend** running on port 8000.

### Installation
```bash
git clone <repository-url>
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

*   **Full Subject CRUD:**
    *   **List View:** View all subjects in a paginated table.
    *   **Search:** Filter subjects by Name or Code.
    *   **Department Filter:** Filter subjects by their associated Department (fetched live from the API).
    *   **Create:** Add new subjects via a polished, two-column form with Zod validation.
    *   **Edit:** Update existing subjects with a consistent form design.
    *   **Delete:** Remove subjects with a beautiful, custom confirmation modal.
*   **Data Architecture:**
    *   Fully typed with TypeScript.
    *   Centralized configuration.
    *   Custom Data Provider for seamless API integration.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

<br />
<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer&text=Tablawy&fontSize=50&fontColor=ffffff&fontAlign=50" alt="Tablawy Signature" width="100%" />
</div>
