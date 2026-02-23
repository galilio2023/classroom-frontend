import { DataProvider } from "@refinedev/core";
import { CreateResponse, GetOneResponse, ListResponse } from "@/types";

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL;

const fetcher = async (url: string, options?: RequestInit) => {
  return fetch(url, {
    ...options,
    credentials: "include", // This is crucial for sending cookies
    headers: {
      ...options?.headers,
      "Content-Type": "application/json",
    },
  });
};

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters }) => {
    const url = new URL(`${BACKEND_BASE_URL}/${resource}`);

    if (pagination?.mode !== "off") {
      url.searchParams.append("page", (pagination?.currentPage ?? 1).toString());
      url.searchParams.append("limit", (pagination?.pageSize ?? 10).toString());
    }

    if (filters) {
      filters.forEach((filter) => {
        if ("field" in filter) {
             // Custom filter mapping logic
             if (filter.field === "role") {
                url.searchParams.append("role", String(filter.value));
             } else if (resource === "departments" && (filter.field === "name" || filter.field === "code")) {
                url.searchParams.append("search", String(filter.value));
             } else if (resource === "users" && (filter.field === "search" || filter.field === "name" || filter.field === "email")) {
                url.searchParams.append("search", String(filter.value));
             } else if (resource === "subjects") {
                if (filter.field === "department") url.searchParams.append("department", String(filter.value));
                if (filter.field === "name" || filter.field === "code") url.searchParams.append("search", String(filter.value));
             } else if (resource === "classes") {
                if (filter.field === "name") url.searchParams.append("search", String(filter.value));
                if (filter.field === "subject") url.searchParams.append("subject", String(filter.value));
                if (filter.field === "teacher") url.searchParams.append("teacher", String(filter.value));
             } else if (resource === "enrollments" && filter.field === "classId") {
                url.searchParams.append("classId", String(filter.value));
             } else if (resource === "assignments" && filter.field === "classId") {
                url.searchParams.append("classId", String(filter.value));
             } else if (resource === "submissions" && filter.field === "assignmentId") {
                url.searchParams.append("assignmentId", String(filter.value));
             } else {
                 // Default behavior for other filters
                 url.searchParams.append(filter.field, String(filter.value));
             }
        }
      });
    }

    const response = await fetcher(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json: ListResponse = await response.json();
    return {
      data: json.data ?? [],
      total: json.pagination?.total ?? json.data?.length ?? 0,
    };
  },

  getOne: async ({ resource, id }) => {
    const url = `${BACKEND_BASE_URL}/${resource}/${id}`;
    const response = await fetcher(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json: GetOneResponse = await response.json();
    return {
      data: json.data,
    };
  },

  create: async ({ resource, variables }) => {
    const url = `${BACKEND_BASE_URL}/${resource}`;
    const response = await fetcher(url, {
      method: "POST",
      body: JSON.stringify(variables),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json: CreateResponse = await response.json();
    return {
      data: json.data,
    };
  },

  update: async ({ resource, id, variables }) => {
    const url = `${BACKEND_BASE_URL}/${resource}/${id}`;
    const response = await fetcher(url, {
      method: "PATCH",
      body: JSON.stringify(variables),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return {
      data: json.data,
    };
  },

  deleteOne: async ({ resource, id }) => {
    const url = `${BACKEND_BASE_URL}/${resource}/${id}`;
    const response = await fetcher(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      data: { id } as any,
    };
  },

  getApiUrl: () => BACKEND_BASE_URL,
  
  // Implement other required methods with basic placeholders if needed
  getMany: async () => { throw new Error("getMany not implemented"); },
  createMany: async () => { throw new Error("createMany not implemented"); },
  deleteMany: async () => { throw new Error("deleteMany not implemented"); },
  updateMany: async () => { throw new Error("updateMany not implemented"); },
  custom: async ({ url, method, payload, query, headers }) => {
     let requestUrl = `${url}`;
     if (query) {
        const searchParams = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            searchParams.append(key, String(value));
        });
        requestUrl += `?${searchParams.toString()}`;
     }
     
     // If the URL is relative (starts with /), prepend the backend base URL
     if (url.startsWith("/")) {
         requestUrl = `${BACKEND_BASE_URL}${url}`;
         if (query) {
            const searchParams = new URLSearchParams();
            Object.entries(query).forEach(([key, value]) => {
                searchParams.append(key, String(value));
            });
            requestUrl += `?${searchParams.toString()}`;
         }
     }

     const response = await fetcher(requestUrl, {
        method: method || "GET",
        body: payload ? JSON.stringify(payload) : undefined,
        headers: headers as any
     });

     if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
     }
     
     const json = await response.json();
     return { data: json };
  }
};
