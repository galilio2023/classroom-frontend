import { DataProvider, HttpError } from "@refinedev/core";
import { BACKEND_URL } from "@/config";

const BACKEND_BASE_URL = BACKEND_URL;

/**
 * Helper to handle API errors and return Refine-compatible HttpError
 */
const handleError = async (response: Response): Promise<HttpError> => {
  let json: any = {};
  try {
    const text = await response.text();
    if (text) {
      json = JSON.parse(text);
    }
  } catch (e) {
    // Not JSON or empty
  }

  // If backend returned Zod validation details (Layer 3)
  if (json.details) {
    return {
      message: json.error || "Validation failed",
      statusCode: response.status,
      errors: json.details,
    };
  }

  // Standardized error message
  return {
    message: json.error || json.message || `HTTP error! status: ${response.status}`,
    statusCode: response.status,
  };
};

/**
 * Smart Fetcher: Only adds Content-Type for methods with a body.
 */
const fetcher = async (url: string, options?: RequestInit) => {
  const method = options?.method?.toUpperCase() || "GET";
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  // Only add Content-Type for methods that typically send a body
  if (["POST", "PUT", "PATCH"].includes(method)) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    ...options,
    credentials: "include",
    headers: headers,
  });
};

/**
 * Resource Filter Mappings
 */
const resourceFilterMappings: Record<string, Record<string, string>> = {
  departments: { name: "search", code: "search" },
  users: { search: "search", name: "search", email: "search", role: "role" },
  subjects: { name: "search", code: "search", department: "department" },
  classes: { name: "search", subject: "subject", teacher: "teacher" },
  enrollments: { classId: "classId", studentId: "studentId", status: "status" },
  assignments: { classId: "classId" },
  submissions: { assignmentId: "assignmentId", studentId: "studentId" },
  discussions: { classId: "classId", parentId: "parentId" },
  attendance: { classId: "classId", date: "date" },
  resources: { classId: "classId", moduleId: "moduleId", search: "search" },
  "profile-requests": { status: "status", userId: "userId" },
  quizzes: { classId: "classId", moduleId: "moduleId" },
  modules: { classId: "classId" },
  progress: { classId: "classId", userId: "userId" },
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
          const mappedField = resourceFilterMappings[resource]?.[filter.field] || filter.field;
          url.searchParams.append(mappedField, String(filter.value));
        }
      });
    }

    const response = await fetcher(url.toString());

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    
    // Handle both { data: [], pagination: {} } and direct array responses
    const data = json.data ?? (Array.isArray(json) ? json : []);
    const total = json.pagination?.total ?? data.length;

    return { data, total };
  },

  getOne: async ({ resource, id }) => {
    const url = `${BACKEND_BASE_URL}/${resource}/${id}`;
    const response = await fetcher(url);

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    // Handle both { data: {} } and direct object responses
    return {
      data: json.data ?? json,
    };
  },

  create: async ({ resource, variables }) => {
    const url = `${BACKEND_BASE_URL}/${resource}`;
    const response = await fetcher(url, {
      method: "POST",
      body: JSON.stringify(variables),
    });

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    return {
      data: json.data ?? json,
    };
  },

  update: async ({ resource, id, variables }) => {
    const url = `${BACKEND_BASE_URL}/${resource}/${id}`;
    const response = await fetcher(url, {
      method: "PATCH",
      body: JSON.stringify(variables),
    });

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    return {
      data: json.data ?? json,
    };
  },

  deleteOne: async ({ resource, id }) => {
    const url = `${BACKEND_BASE_URL}/${resource}/${id}`;
    const response = await fetcher(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    return {
      data: json.data || { id },
    };
  },

  getApiUrl: () => BACKEND_BASE_URL,
  
  getMany: async ({ resource, ids }) => {
    const url = new URL(`${BACKEND_BASE_URL}/${resource}`);
    ids.forEach((id) => {
      url.searchParams.append("id", String(id));
    });

    const response = await fetcher(url.toString());

    if (!response.ok) {
      throw await handleError(response);
    }

    const json = await response.json();
    const data = json.data ?? (Array.isArray(json) ? json : []);
    return { data };
  },

  createMany: async () => { throw new Error("createMany not implemented"); },
  deleteMany: async () => { throw new Error("deleteMany not implemented"); },
  updateMany: async () => { throw new Error("updateMany not implemented"); },
  
  custom: async ({ url, method, payload, query, headers }) => {
     let requestUrl = url;
     
     // If url is absolute (starts with http), use it directly
     if (!url.startsWith("http")) {
        // Handle relative paths
        if (url.startsWith("/")) {
            requestUrl = `${BACKEND_BASE_URL}${url}`;
        } else {
            requestUrl = `${BACKEND_BASE_URL}/${url}`;
        }
     }

     if (query) {
        const searchParams = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            searchParams.append(key, String(value));
        });
        const separator = requestUrl.includes("?") ? "&" : "?";
        requestUrl += `${separator}${searchParams.toString()}`;
     }

     const response = await fetcher(requestUrl, {
        method: method ? method.toUpperCase() : "GET",
        body: payload ? JSON.stringify(payload) : undefined,
        headers: headers as any
     });

     if (!response.ok) {
        throw await handleError(response);
     }
     
     const json = await response.json();
     if (json && typeof json === 'object' && 'data' in json) {
         return json;
     }
     return { data: json };
  }
};
