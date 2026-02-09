# 🧠 AI Code Patterns & Directives

**⚠️ CRITICAL: READ AND STRICTLY ADHERE TO THESE RULES BEFORE EVERY RESPONSE. ⚠️**

This file is the absolute source of truth for code patterns. Do not deviate.

---

## 1. Refine v5 Data Hooks

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

---

## 2. Data Table Patterns

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

## 3. Data Provider & Filters

**⚠️ MANDATORY CHECK:** When adding a new resource (e.g., `assignments`, `submissions`), you **MUST** update `src/providers/data.ts`.

- The `buildQueryParams` function must have explicit logic to handle filters for the new resource.
- If you skip this, filters like `classId` or `assignmentId` will be stripped from the request, causing 400 Bad Request errors.

---

## 4. Tailwind CSS v4

- **Constraint:** There is **NO** `tailwind.config.js` file.
- **Pattern:** All theme configuration happens in `src/App.css` using `@theme`.
- **Pattern:** Use CSS variables for colors (e.g., `bg-muted/40`, `text-primary`).

---

## 5. Component Architecture

- **UI Library:** `shadcn/ui`.
- **Pattern:** Components are self-contained in `src/components/ui`. Do not suggest installing new component libraries.
