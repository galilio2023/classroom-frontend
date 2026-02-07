<div align="center" style="margin-bottom: 30px;">
    <a href="https://ibrahim-tablawy-portfolio.vercel.app/">
        <img alt="Author Avatar" 
             src="https://avatars.githubusercontent.com/u/110768301?s=400&u=a6d45b9eeaa2b43332f9159614997f2d5d746c5a&v=4" 
             style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 15px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
    </a>
    <h1 align="center">Classroom Frontend</h1>
    <p align="center">
      The user interface for the Classroom Management System, built with Refine.
      <br />
      <a href="https://github.com/galilio2023/classroom-frontend/issues">Report Bug</a>
      ·
      <a href="https://github.com/galilio2023/classroom-frontend/issues">Request Feature</a>
    </p>
    <p align="center">
      <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
      <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
      <img src="https://img.shields.io/badge/Refine-00AEEF?style=for-the-badge&logo=refine&logoColor=white" alt="Refine">
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    </p>
</div>

---

## 📖 About The Project

This is the frontend for the Classroom application, built with React, Vite, and the Refine framework. It provides the user interface for interacting with the backend API and uses `better-auth` for authentication.

## 🚀 Getting Started

### 1. Installation

Install the necessary dependencies:
```sh
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root of the project.

```env
# The full URL of the backend API.
# This should point to the root of the backend server.
VITE_API_URL="http://localhost:8000"
```

### 3. Running the Development Server

Start the Vite development server.
```sh
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 🔐 Authentication Deep Dive: Refine + `better-auth`

The key to this frontend is understanding how Refine's `authProvider` acts as a bridge to the `better-auth` client library. The UI components (like login pages) should **never** call the `better-auth` client directly; they should always use Refine's hooks (`useLogin`, `useRegister`, etc.).

### Key Files & Concepts

#### 1. `src/lib/auth-client.ts` - The `better-auth` Client

This file initializes and exports the `better-auth` client-side SDK.

- **`createAuthClient`**: This function creates a client instance.
- **`baseURL`**: This is the most important configuration. It must point to the base URL where the `better-auth` handler is mounted on the backend (e.g., `http://localhost:8000/api/auth`). The client will automatically append the correct endpoints (e.g., `/signin/email`, `/session`).

#### 2. `src/providers/auth.ts` - The Refine `authProvider` Bridge

This is the most important file for authentication. It connects Refine's authentication system to the `better-auth` client.

- **Purpose**: To translate Refine's auth lifecycle methods (`login`, `check`, `logout`, etc.) into calls to the `authClient` or the `dataProvider`.
- **`login` & `register`**: These methods call the corresponding `authClient` methods (`signIn.email`, `signUp.email`). After a successful API call, they manually store the user object in `localStorage` so that `getIdentity` can access it instantly without a network request.
- **`check`**: This is a critical method for security. It makes a network request to the backend's `/api/auth/session` endpoint to verify if the user's session is still valid on the server. This prevents a user with a stale client-side session from accessing protected routes. It must be wrapped in a `try...catch` and return `{ authenticated: false }` on failure.
- **`getIdentity` & `getPermissions`**: These methods provide user information to the rest of the application. For performance, they read directly from `localStorage`. They are wrapped in `try...catch` to prevent the app from crashing if the `localStorage` data is corrupted.

#### 3. `src/App.tsx` - Route Protection

This file uses Refine's built-in `<Authenticated>` component to protect routes. This is the canonical way to handle route protection.

- **Public Routes**: The `/login` and `/register` routes are wrapped in an `<Authenticated>` component.
  - `fallback={<Outlet />}`: If the user is *not* authenticated, it renders the children (the login/register pages).
  - If the user *is* authenticated, it renders the main element, which is `<NavigateToResource resource="dashboard" />`. This correctly redirects logged-in users away from the login page.
- **Private Routes**: All other application routes are wrapped in a second `<Authenticated>` component.
  - `fallback={<LoginPage />}`: If the user is *not* authenticated, it renders the `LoginPage` component as a fallback, effectively blocking access.
  - If the user *is* authenticated, it renders the children (the `Layout` and all the data pages).

---
<br />
<div align="center">
  <a href="https://ibrahim-tablawy-portfolio.vercel.app/">
    <img src="https://raw.githubusercontent.com/galilio2023/classroom-backend/main/assets/tablawy.png" alt="Tablawy Signature" width="200" />
  </a>
</div>
