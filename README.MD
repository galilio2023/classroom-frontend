# Classroom Frontend

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

## 📖 Overview

This project is the frontend interface for the Classroom Management System. It provides a rich, responsive, and user-friendly dashboard for managing educational data like Departments and Subjects. Built on the **Refine** framework, it offers a powerful, out-of-the-box solution for data-intensive applications, complete with routing, data fetching, and state management.

## 🛠️ Tech Stack

*   **Framework:** [React](https://react.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/) - Next-generation frontend tooling.
*   **Meta-Framework:** [Refine](https://refine.dev/) - A React-based framework for building CRUD applications.
*   **UI Components:** [Shadcn/ui](https://ui.shadcn.com/) - A collection of beautifully designed, accessible components.
*   **Routing:** [React Router](https://reactrouter.com/)
*   **Form Management:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation.
*   **Data Fetching:** Refine's data providers, configured for a Simple REST API.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)

## 📂 Project Structure

The project follows a feature-driven structure, organized for clarity and scalability.

```
classroom-frontend/
├── src/
│   ├── components/         # Shared UI components (e.g., Header, Layout)
│   ├── pages/              # Main application pages (routed components)
│   │   ├── departments/    # CRUD pages for Departments (List, Create, Edit)
│   │   └── subjects/       # CRUD pages for Subjects
│   ├── providers/          # Refine data providers
│   └── App.tsx             # Main application component with router setup
├── .env.development        # Environment variables for development
├── .env.production         # Environment variables for production
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Prerequisites
*   Node.js (v18+ recommended)
*   npm or yarn
*   A running instance of the [Classroom Backend API](<link-to-your-backend-repo>).

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd classroom-frontend
npm install
```

### 3. Environment Setup

Create a `.env.development` file in the root directory. This file will tell your frontend where to find the backend API.

```env
# The base URL of your running backend API
VITE_API_URL="http://localhost:8000/api"
```

### 4. Running the Development Server

Start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## 📜 Available Scripts

*   `npm run dev`: Starts the development server with hot-reloading.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Serves the production build locally.
*   `npm run refine`: Accesses Refine's command-line tools.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

<br />
<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer&text=Tablawy&fontSize=50&fontColor=ffffff&fontAlign=50" alt="Tablawy Signature" width="100%" />
</div>
