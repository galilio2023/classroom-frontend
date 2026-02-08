<div align="center" style="margin-bottom: 20px;">
    <a href="https://ibrahim-tablawy-portfolio.vercel.app/">
        <img alt="Author Avatar" 
             src="https://avatars.githubusercontent.com/u/110768301?s=400&u=a6d45b9eeaa2b43332f9159614997f2d5d746c5a&v=4" 
             style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
    </a>
    <h1 align="center" style="font-size: 2.5em; font-weight: bold; margin-bottom: 5px;">Classroom Frontend</h1>
    <p align="center" style="font-size: 1.1em; color: #555;">
      The beautiful and reactive user interface for the Classroom Management System.
    </p>
    <p align="center" style="margin-top: 15px;">
      <a href="https://github.com/galilio2023/classroom-frontend/issues"><strong>Report Bug</strong></a>
      ·
      <a href="https://github.com/galilio2023/classroom-frontend/issues"><strong>Request Feature</strong></a>
    </p>
    <p align="center" style="margin-top: 20px;">
      <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
      <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
      <img src="https://img.shields.io/badge/Refine-00AEEF?style=for-the-badge&logo=refine&logoColor=white" alt="Refine">
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
      <img src="https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn/ui">
    </p>
</div>

---

## 📖 About The Project

This project is the **face of the Classroom Management System**. It's a modern, responsive, and highly interactive Single-Page Application (SPA) built with the latest web technologies. It provides a beautiful and intuitive interface for students, teachers, and administrators to interact with the backend API.

The core philosophy of this frontend is **rapid, robust development**. By using the **Refine** framework, we've eliminated thousands of lines of boilerplate code related to data fetching, state management, and authentication, allowing us to focus on building a great user experience.

---

## 🏗️ Architectural Blueprint: The "Providers" Pattern

A key concept in this application is the "providers" pattern, heavily utilized by Refine. Instead of scattering API calls and business logic throughout our UI components, we centralize it in dedicated provider objects. This makes the application incredibly easy to maintain and debug.

### `src/providers/data.ts` - The Data Provider
- **What it is:** A single object that tells Refine how to communicate with our backend API for all CRUD (Create, Read, Update, Delete) operations.
- **How it works:** We use Refine's `@refinedev/simple-rest` data provider and customize its `buildQueryParams` method. This allows us to translate the filters from our UI (like search queries or dropdown selections) into the specific query parameters that our backend API expects (e.g., `?role=teacher&search=john`).
- **The Benefit:** Our UI components don't need to know *how* to fetch data. They just ask for it (e.g., `useTable({ resource: "subjects" })`), and the data provider handles the rest. If we ever change our API structure, we only need to update this one file.

### `src/providers/auth.ts` - The Auth Provider
- **What it is:** The bridge between Refine's authentication hooks and our `better-auth` client library.
- **How it works:** UI components call Refine hooks like `useLogin()` or `useRegister()`. These hooks, in turn, call the corresponding methods in our `authProvider` (`login`, `register`). Our `authProvider` then makes the actual API call using the `better-auth` client.
- **The Benefit:** This decouples our UI from the specific authentication library we're using. We could swap `better-auth` for Auth0 or Firebase tomorrow by just changing this one file, and none of our UI components would need to be touched.

### `src/providers/access-control.ts` - The Access Control Provider
- **What it is:** The gatekeeper for the UI. It defines "who can do what."
- **How it works:** Before rendering any button or navigating to any page, Refine calls the `can` method in this provider. We implemented logic here to check the user's role (`admin`, `teacher`, `student`) and the requested action (e.g., "edit" a "class"). For more complex rules, like ensuring a teacher can only edit their *own* class, this provider makes a quick API call via the `dataProvider` to verify ownership.
- **The Benefit:** All authorization logic is centralized in one place, making it easy to review and update security rules. Refine's components automatically respect these rules, hiding buttons and blocking pages if access is denied.

---

## 🎨 UI & Design System: The `shadcn/ui` Philosophy

We chose **`shadcn/ui`** for our component library. This is not a traditional component library like Material-UI or Ant Design.
- **The Philosophy:** You don't install it as a dependency. Instead, you use its CLI to copy well-designed, unstyled, and accessible component code directly into your project (`src/components/ui`).
- **The Advantage:** We have **100% ownership** of the component code. This makes it trivial to customize the look and feel to match our brand, without fighting against a library's default styles. It also keeps our application lean, as we only include the components we actually use.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   A running instance of the [Classroom Backend API](https://github.com/galilio2023/classroom-backend).

### 1. Installation
```bash
git clone https://github.com/galilio2023/classroom-frontend.git
cd classroom-frontend
npm install
```

### 2. Environment Setup
Create a `.env` file in the root of the project.
```env
# The full URL of the backend API.
# This should point to the root of the running backend server.
VITE_API_URL="http://localhost:8000"
```

### 3. Running the Development Server
This command starts the Vite development server with Hot Module Replacement (HMR).
```sh
npm run dev
```
The application will open in your browser, typically at `http://localhost:5173`.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<br />
<div align="center">
  <a href="https://ibrahim-tablawy-portfolio.vercel.app/">
    <img src="https://raw.githubusercontent.com/galilio2023/classroom-backend/main/assets/tablawy.png" alt="Tablawy Signature" width="100" />
  </a>
</div>
