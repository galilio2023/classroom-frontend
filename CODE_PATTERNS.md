# 🧠 AI Code Patterns & Directives

**⚠️ CRITICAL: READ AND STRICTLY ADHERE TO THESE RULES BEFORE EVERY RESPONSE. ⚠️**

This file is the absolute source of truth for code patterns. Do not deviate.

## 0. Pre-Flight Check (MANDATORY)
Before writing any code or proposing any solution, you **MUST** read this file (`CODE_PATTERNS.md`) and `GEMINI.md` to ensure compliance with the latest project standards.

## 1. Tech Stack Versions (Strict Constraints)
These patterns are mandated by the versions in `package.json`:
- **Refine:** v5.x (Use `@refinedev/core` hooks. NO v3/v4 legacy hooks).
- **React:** v19.x (Functional components & Hooks only).
- **Tailwind CSS:** v4.x (Native CSS variables. NO `tailwind.config.js`).
- **UI Library:** `shadcn/ui` (Radix primitives + Tailwind).
- **Auth:** `better-auth` v1.x.

---

## 2. Documentation & Logging (MANDATORY)

**⚠️ CRITICAL RULE:**
Every time a significant issue is resolved or a new architectural decision is made, you **MUST** update `ISSUES_RESOLVED.md`.

- **Format:** Use the "Problem -> Solution -> Summary" structure.
- **Detail Level:** Do not summarize. Provide comprehensive details about *why* the issue happened (root cause) and *how* it was fixed (specific code changes).
- **Goal:** Create a permanent knowledge base that prevents regression.

---

## 3. Refine v5 Data Hooks

This is the **ONLY** correct pattern for fetching data. All other patterns are **WRONG**.

### `useList` Hook

**✅ DO THIS:**
```typescript
import { useList, HttpError } from "@refinedev/core";

const { result, query } = useList<IProduct, HttpError>();

const products = result.data ?? [];
const isLoading = query.isLoading;
const isError = query.isError;
```

### `useShow` Hook

**✅ DO THIS:**
```typescript
import { useShow, HttpError } from "@refinedev/core";

const { result, query } = useShow<IProduct, HttpError>();

const product = result.data;
const isLoading = query.isLoading;
const isError = query.isError;
```

### `useForm` Hook

**✅ DO THIS:**
```typescript
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const {
  refineCore: { onFinish, formLoading },
  register,
  handleSubmit,
  formState: { errors },
} = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
  refineCoreProps: {
    action: "create", // or "edit"
    resource: "my-resource",
  },
});
```

---

## 4. Data Table Patterns

### A. Smart Tables (Fetching Own Data)
Use this for top-level list pages (e.g., `ClassesList`).

**✅ DO THIS:** Use `useTable` from `@refinedev/react-table`.
```typescript
import { useTable } from "@refinedev/react-table";

const table = useTable({
  columns,
  refineCoreProps: {
    resource: "my-resource",
  },
});

return <DataTable table={table} />;
```

### B. Dumb Tables (Receiving Data via Props)
Use this for child components that display data fetched by a parent (e.g., `AssignmentList`, `SubmissionList`).

**✅ DO THIS:** Use `useReactTable` from `@tanstack/react-table` and wrap it in an adapter.
```typescript
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";

const reactTable = useReactTable({ ... });

const tableAdapter = {
  reactTable: reactTable,
  refineCore: { ...mockedProps }
};

return <DataTable table={tableAdapter} />;
```

**❌ NEVER DO THIS:** Never use `@refinedev/react-table`'s `useTable` in a component that receives its data via props. It will cause rogue API calls.

---

## 5. Data Provider & Filters

**⚠️ MANDATORY CHECK:** When adding a new resource (e.g., `assignments`, `submissions`), you **MUST** update `src/providers/data.ts`.

- The `buildQueryParams` function must have explicit logic to handle filters for the new resource.
- If you skip this, filters like `classId` or `assignmentId` will be stripped from the request, causing 400 Bad Request errors.

---

## 6. Tailwind CSS v4

- **Constraint:** There is **NO** `tailwind.config.js` file.
- **Pattern:** All theme configuration happens in `src/App.css` using `@theme`.
- **Pattern:** Use CSS variables for colors (e.g., `bg-muted/40`, `text-primary`).

---

## 7. Component Architecture

- **UI Library:** `shadcn/ui`.
- **Pattern:** Components are self-contained in `src/components/ui`. Do not suggest installing new component libraries.

---

## 8. Authentication & CORS

**⚠️ CRITICAL:** When dealing with authentication or network requests:

- **Frontend:** Always include `credentials: "include"` in fetch options or `authClient` configuration.
- **Backend:** Always configure CORS to allow `localhost` and `127.0.0.1` on multiple ports (e.g., 5173, 5174, 5175) to handle Vite's port shifting.
- **Backend:** Always configure `better-auth` with a comprehensive list of `trustedOrigins`.
